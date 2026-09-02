import * as XLSX from 'xlsx';
import { Violation, StudentPriorityScore } from '../types';

export function exportViolationsToExcel(violations: Violation[], fileName: string) {
  const rows = violations.map((v) => ({
    'اسم الطالب': v.studentName,
    الصف: v.grade,
    الشعبة: v.section,
    'رقم المخالفة': v.violationNumber,
    التاريخ: v.date,
    المستوى: v.level,
    القرار: v.decision,
    'العام الدراسي': v.academicYear,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'المخالفات');
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

export function exportPriorityListToExcel(scores: StudentPriorityScore[], fileName: string) {
  const rows = scores.map((s) => ({
    الطالب: s.student.name,
    الصف: s.student.grade,
    الشعبة: s.student.section,
    'عدد المخالفات': s.violationCount,
    'درجة الأولوية': s.score,
    المستوى: s.level,
    'آخر مخالفة': s.lastViolationDate,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'أولويات التدخل');
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

/**
 * تصدير PDF عربي سليم: نعتمد على طباعة المتصفح بدل مكتبة jsPDF، لأن jsPDF
 * لا يدعم تشكيل الحروف العربية بشكل صحيح دون تضمين خطوط معقّد. المتصفح
 * يعرض العربية بشكل صحيح تلقائيًا، فنفتح نافذة معاينة بتنسيق RTL ثم نستدعي
 * حوار الطباعة، ويختار المستخدم "حفظ كـ PDF".
 */
export function exportToPdf(title: string, head: string[], body: (string | number)[][]) {
  const win = window.open('', '_blank');
  if (!win) return;
  const rows = body
    .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`)
    .join('');
  win.document.write(`
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          body { font-family: 'IBM Plex Sans Arabic', Tahoma, sans-serif; padding: 24px; }
          h1 { font-size: 18px; text-align: center; color: #5B2C87; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: center; font-size: 12px; }
          th { background: #5B2C87; color: white; }
          tr:nth-child(even) { background: #F8F7FB; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <table>
          <thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <script>window.onload = () => window.print();</script>
      </body>
    </html>
  `);
  win.document.close();
}
