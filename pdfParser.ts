import * as pdfjsLib from 'pdfjs-dist';
// يشير إلى الـ worker المرفق مع الحزمة (Vite يتعامل مع هذا الاستيراد كأصل ثابت)
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export interface ParsedViolationRow {
  raw: string; // نص السطر الكامل كما استُخرج، للمراجعة اليدوية
  wilayat?: string;
  schoolCode?: string;
  schoolName?: string;
  grade?: string;
  section?: string;
  studentName?: string;
  violationNumber?: string;
  date?: string; // ISO
  category?: string; // مثال: "الفقرة أ"
  decision?: string; // مثال: "تصحيح كتابي"
}

const GRADE_WORDS: Record<string, string> = {
  الخامس: '5', السادس: '6', السابع: '7', الثامن: '8', التاسع: '9',
  العاشر: '10', 'الحادي عشر': '11', 'الثاني عشر': '12',
};

const DECISION_KEYWORDS = ['تصحيح كتابي', 'تنبيه الطالب', 'إنذار الطالب', 'فصل مؤقت', 'فصل نهائي'];

function toIsoDate(raw: string): string | undefined {
  const m = raw.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  if (!m) return undefined;
  const [, y, mo, d] = m;
  return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

/**
 * يجمّع عناصر النص حسب إحداثي y (نفس السطر تقريبًا)، ثم يرتبها من اليمين لليسار
 * حسب إحداثي x، لأن الجداول في تقرير البوابة عربية RTL.
 */
async function extractRawLines(file: File): Promise<string[]> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const lines: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const items = content.items as Array<{ str: string; transform: number[] }>;

    const rows = new Map<number, { x: number; str: string }[]>();
    for (const item of items) {
      if (!item.str.trim()) continue;
      const y = Math.round(item.transform[5] / 4) * 4; // تجميع بتفاوت بسيط
      const x = item.transform[4];
      if (!rows.has(y)) rows.set(y, []);
      rows.get(y)!.push({ x, str: item.str });
    }

    const sortedYs = [...rows.keys()].sort((a, b) => b - a); // من الأعلى للأسفل
    for (const y of sortedYs) {
      const rowItems = rows.get(y)!.sort((a, b) => b.x - a.x); // من اليمين لليسار
      const line = rowItems.map((i) => i.str).join(' ').replace(/\s+/g, ' ').trim();
      if (line) lines.push(line);
    }
  }
  return lines;
}

/** يحاول استخراج الحقول المعروفة من سطر نصي واحد بالاعتماد على الأنماط (تاريخ، رقم مخالفة، قرار...) */
function parseLine(line: string): ParsedViolationRow {
  const row: ParsedViolationRow = { raw: line };

  const date = toIsoDate(line);
  if (date) row.date = date;

  const violationNumberMatch = line.match(/\b\d{1,3}(?:,\d{3})+\b|\b\d{6,7}\b/);
  if (violationNumberMatch) row.violationNumber = violationNumberMatch[0].replace(/,/g, '');

  const schoolCodeMatch = line.match(/\b\d{4}\b/g)?.find((n) => n !== row.violationNumber);
  if (schoolCodeMatch) row.schoolCode = schoolCodeMatch;

  for (const keyword of DECISION_KEYWORDS) {
    if (line.includes(keyword)) {
      row.decision = keyword;
      break;
    }
  }

  const categoryMatch = line.match(/الفقرة\s*[أبجد]/);
  if (categoryMatch) row.category = categoryMatch[0];

  for (const [word, digit] of Object.entries(GRADE_WORDS)) {
    if (line.includes(word)) {
      row.grade = digit;
      break;
    }
  }

  const sectionMatch = line.match(/الشعبة\s*(\d+)|شعبة\s*(\d+)/);
  if (sectionMatch) row.section = sectionMatch[1] || sectionMatch[2];

  return row;
}

/**
 * يستخرج صفوف المخالفات من ملف PDF مصدَّر من بوابة سلطنة عمان التعليمية.
 * النتيجة "تخمين أولي" يجب مراجعتها وتعديلها في شاشة معاينة الاستيراد قبل الحفظ،
 * لأن استخراج جداول RTL من PDF غير مضمون الدقة 100% في كل تنسيقات التصدير.
 */
export async function parsePdfViolations(file: File): Promise<ParsedViolationRow[]> {
  const lines = await extractRawLines(file);
  // نتجاهل أسطر العناوين والترويسة (لا تحتوي تاريخ ولا رقم مخالفة)
  return lines
    .map(parseLine)
    .filter((r) => r.date || r.violationNumber || r.decision);
}
