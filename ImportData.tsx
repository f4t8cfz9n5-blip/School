import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';
import { Student, Violation, ImportBatch } from '../types';
import { parsePdfViolations, ParsedViolationRow } from '../utils/pdfParser';
import { VIOLATION_CATEGORIES, guessLevelFromDecision, guessLevelFromCategoryText } from '../data/violationCategories';

interface Props {
  existingViolations: Violation[];
  onImport: (students: Student[], violations: Violation[], batch: ImportBatch) => void;
  academicYear: string;
}

function findCategoryId(row: ParsedViolationRow): string {
  const level = row.category ? guessLevelFromCategoryText(row.category) : guessLevelFromDecision(row.decision ?? '');
  const candidates = VIOLATION_CATEGORIES.filter((c) => c.level === level);
  // إن لم نتمكن من مطابقة السلوك الدقيق، نستخدم أول سلوك بنفس المستوى كتقريب أولي قابل للتعديل يدويًا لاحقًا
  return candidates[0]?.id ?? VIOLATION_CATEGORIES[0].id;
}

export default function ImportData({ existingViolations, onImport, academicYear }: Props) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ParsedViolationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ count: number; duplicates: number } | null>(null);

  const existingNumbers = new Set(existingViolations.map((v) => v.violationNumber));

  const handleFile = async (file: File) => {
    setError(null);
    setDone(null);
    setFileName(file.name);
    setLoading(true);
    try {
      const parsed = await parsePdfViolations(file);
      setRows(parsed);
      if (parsed.length === 0) {
        setError('لم يتم العثور على صفوف مخالفات قابلة للتعرّف تلقائيًا. راجع الملف يدويًا أو أدخل البيانات في الجدول أدناه.');
      }
    } catch (e) {
      setError('تعذّرت قراءة الملف. تأكد أنه ملف PDF صالح مُصدَّر من البوابة.');
    } finally {
      setLoading(false);
    }
  };

  const updateRow = (index: number, field: keyof ParsedViolationRow, value: string) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };

  const addBlankRow = () => setRows((prev) => [...prev, { raw: '' }]);

  const removeRow = (index: number) => setRows((prev) => prev.filter((_, i) => i !== index));

  const confirmImport = () => {
    const newStudents: Student[] = [];
    const newViolations: Violation[] = [];
    const studentIndex = new Map<string, Student>();
    let duplicates = 0;

    rows.forEach((row, i) => {
      if (!row.studentName || !row.date) return;
      if (row.violationNumber && existingNumbers.has(row.violationNumber)) {
        duplicates++;
        return;
      }
      const studentKey = `${row.studentName}-${row.grade}-${row.section}`;
      let student = studentIndex.get(studentKey);
      if (!student) {
        student = {
          id: `imp-${Date.now()}-${i}`,
          name: row.studentName,
          grade: row.grade ?? '',
          section: row.section ?? '',
          schoolCode: row.schoolCode,
          schoolName: row.schoolName,
          wilayat: row.wilayat,
        };
        studentIndex.set(studentKey, student);
        newStudents.push(student);
      }
      const categoryId = findCategoryId(row);
      const category = VIOLATION_CATEGORIES.find((c) => c.id === categoryId)!;
      newViolations.push({
        id: `imp-vio-${Date.now()}-${i}`,
        studentId: student.id,
        studentName: student.name,
        grade: student.grade,
        section: student.section,
        violationNumber: row.violationNumber ?? `manual-${Date.now()}-${i}`,
        date: row.date,
        categoryId,
        level: category.level,
        decision: row.decision ?? category.action,
        academicYear,
        importBatchId: `batch-${Date.now()}`,
      });
    });

    onImport(newStudents, newViolations, {
      id: `batch-${Date.now()}`,
      fileName: fileName ?? 'إدخال يدوي',
      importedAt: new Date().toISOString(),
      recordCount: newViolations.length,
      duplicatesSkipped: duplicates,
      academicYear,
    });

    setDone({ count: newViolations.length, duplicates });
    setRows([]);
    setFileName(null);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold">استيراد البيانات</h2>
        <p className="text-sm text-muted dark:text-muted-dark mt-1">
          صدّر تقرير المخالفات كملف PDF من بوابة سلطنة عمان التعليمية، ثم ارفعه هنا للقراءة التلقائية
        </p>
      </div>

      <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border dark:border-border-dark rounded-md p-10 cursor-pointer hover:border-primary transition-colors mb-6">
        <UploadCloud size={28} className="text-primary dark:text-primary-light" />
        <span className="text-sm">اسحب ملف PDF هنا أو اضغط للاختيار</span>
        <span className="text-xs text-muted dark:text-muted-dark">{fileName ?? 'لم يتم اختيار ملف بعد'}</span>
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </label>

      {loading && <p className="text-sm text-muted dark:text-muted-dark mb-4">جارٍ القراءة والتحليل...</p>}
      {error && (
        <div className="flex items-start gap-2 text-sm text-accent bg-accent/10 rounded-sm p-3 mb-4">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {done && (
        <div className="flex items-start gap-2 text-sm text-stable bg-stable/10 rounded-sm p-3 mb-4">
          <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
          <span>
            تم استيراد {done.count} مخالفة بنجاح
            {done.duplicates > 0 && ` (تم تجاهل ${done.duplicates} مخالفة مكررة برقم مخالفة سابق)`}.
          </span>
        </div>
      )}

      {rows.length > 0 && (
        <>
          <div className="bg-panel dark:bg-panel-dark border border-border dark:border-border-dark rounded-md overflow-x-auto mb-4">
            <table className="w-full text-xs min-w-[900px]">
              <thead>
                <tr className="bg-surface dark:bg-surface-dark border-b border-border dark:border-border-dark text-muted dark:text-muted-dark">
                  <th className="px-3 py-2 text-right">اسم الطالب</th>
                  <th className="px-3 py-2 text-right">الصف</th>
                  <th className="px-3 py-2 text-right">الشعبة</th>
                  <th className="px-3 py-2 text-right">التاريخ</th>
                  <th className="px-3 py-2 text-right">رقم المخالفة</th>
                  <th className="px-3 py-2 text-right">الفئة</th>
                  <th className="px-3 py-2 text-right">القرار</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const isDup = row.violationNumber ? existingNumbers.has(row.violationNumber) : false;
                  return (
                    <tr key={i} className={`border-b border-border dark:border-border-dark ${isDup ? 'bg-watch/5' : ''}`}>
                      {(['studentName', 'grade', 'section', 'date', 'violationNumber', 'category', 'decision'] as const).map(
                        (field) => (
                          <td key={field} className="px-2 py-1">
                            <input
                              value={row[field] ?? ''}
                              onChange={(e) => updateRow(i, field, e.target.value)}
                              className="w-full bg-transparent border border-transparent focus:border-border dark:focus:border-border-dark rounded-sm px-1.5 py-1"
                            />
                          </td>
                        )
                      )}
                      <td className="px-2 py-1">
                        <button onClick={() => removeRow(i)} className="text-accent text-xs">
                          حذف
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={addBlankRow} className="text-sm text-primary dark:text-primary-light">
              + إضافة سطر يدويًا
            </button>
            <button
              onClick={confirmImport}
              className="mr-auto bg-primary text-white text-sm px-4 py-2 rounded-sm hover:bg-primary-dark"
            >
              تأكيد الاستيراد ({rows.length} سطر)
            </button>
          </div>
          <p className="text-xs text-muted dark:text-muted-dark mt-3">
            راجع كل سطر قبل التأكيد — الاستخراج التلقائي تخميني وقد يحتاج تصحيحًا يدويًا بسيطًا، خصوصًا في اسم الطالب
            والصف والشعبة. الأسطر المظلّلة رقم مخالفتها مكرر وسيتم تجاهلها تلقائيًا.
          </p>
        </>
      )}
    </div>
  );
}
