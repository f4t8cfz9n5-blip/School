import React from 'react';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { Student, Violation, PriorityWeights } from '../types';
import { exportViolationsToExcel, exportPriorityListToExcel, exportToPdf } from '../utils/exportUtils';
import { computeAllScores } from '../utils/priorityCalc';

interface Props {
  students: Student[];
  violations: Violation[];
  weights: PriorityWeights;
}

interface ReportDef {
  id: string;
  title: string;
  description: string;
}

const REPORTS: ReportDef[] = [
  { id: 'school', title: 'تقرير المدرسة الشامل', description: 'كل المخالفات المسجلة في النطاق الحالي' },
  { id: 'priority', title: 'تقرير أولويات التدخل', description: 'قائمة الطلاب مرتبة حسب درجة الأولوية' },
  { id: 'topViolations', title: 'تقرير أكثر المخالفات', description: 'أكثر أنواع المخالفات تكرارًا' },
];

export default function Reports({ students, violations, weights }: Props) {
  const scores = computeAllScores(students, violations, weights);

  const handleExcel = (id: string) => {
    if (id === 'priority') return exportPriorityListToExcel(scores, 'تقرير_أولويات_التدخل');
    return exportViolationsToExcel(violations, `تقرير_${id}`);
  };

  const handlePdf = (id: string) => {
    if (id === 'priority') {
      return exportToPdf(
        'تقرير أولويات التدخل',
        ['الطالب', 'الصف', 'الشعبة', 'عدد المخالفات', 'الدرجة', 'المستوى'],
        scores.map((s) => [s.student.name, s.student.grade, s.student.section, s.violationCount, s.score, s.level])
      );
    }
    return exportToPdf(
      'تقرير المخالفات',
      ['الطالب', 'الصف', 'الشعبة', 'التاريخ', 'القرار'],
      violations.map((v) => [v.studentName, v.grade, v.section, v.date, v.decision])
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold">التقارير</h2>
        <p className="text-sm text-muted dark:text-muted-dark mt-1">تصدير تقارير جاهزة بصيغة Excel أو PDF</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPORTS.map((r) => (
          <div
            key={r.id}
            className="bg-panel dark:bg-panel-dark border border-border dark:border-border-dark rounded-md p-4"
          >
            <h3 className="text-sm font-semibold mb-1">{r.title}</h3>
            <p className="text-xs text-muted dark:text-muted-dark mb-4">{r.description}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleExcel(r.id)}
                className="flex items-center gap-1.5 text-xs bg-stable/10 text-stable px-3 py-1.5 rounded-sm"
              >
                <FileSpreadsheet size={14} />
                Excel
              </button>
              <button
                onClick={() => handlePdf(r.id)}
                className="flex items-center gap-1.5 text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-sm"
              >
                <FileText size={14} />
                PDF
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted dark:text-muted-dark mt-6">
        ملاحظة: تقرير الطالب الفردي متاح من صفحة مؤشرات التدخل عبر النقر على اسم الطالب (يمكن إضافته لاحقًا)، وتقارير
        الصف/الفصل متاحة من صفحة تحليل الفصول.
      </p>
    </div>
  );
}
