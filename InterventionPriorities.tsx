import React, { useMemo } from 'react';
import { Student, Violation, PriorityWeights } from '../types';
import { computeAllScores, PRIORITY_COLORS } from '../utils/priorityCalc';
import { VIOLATION_CATEGORIES } from '../data/violationCategories';
import { exportPriorityListToExcel } from '../utils/exportUtils';
import { Download } from 'lucide-react';

interface Props {
  students: Student[];
  violations: Violation[];
  weights: PriorityWeights;
}

export default function InterventionPriorities({ students, violations, weights }: Props) {
  const scores = useMemo(() => computeAllScores(students, violations, weights), [students, violations, weights]);
  const categoryById = useMemo(() => new Map(VIOLATION_CATEGORIES.map((c) => [c.id, c.title])), []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">مؤشرات التدخل</h2>
          <p className="text-sm text-muted dark:text-muted-dark mt-1">
            ترتيب تلقائي للطلاب حسب أولوية التدخل، بناءً على عدد المخالفات وتكرارها وتنوعها
          </p>
        </div>
        <button
          onClick={() => exportPriorityListToExcel(scores, 'أولويات_التدخل')}
          className="flex items-center gap-2 text-sm bg-primary text-white px-3.5 py-2 rounded-sm hover:bg-primary-dark transition-colors"
        >
          <Download size={15} />
          تصدير Excel
        </button>
      </div>

      <div className="bg-panel dark:bg-panel-dark border border-border dark:border-border-dark rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface dark:bg-surface-dark border-b border-border dark:border-border-dark text-muted dark:text-muted-dark">
              <th className="text-right font-medium px-4 py-3">الأولوية</th>
              <th className="text-right font-medium px-4 py-3">الطالب</th>
              <th className="text-right font-medium px-4 py-3">الصف / الشعبة</th>
              <th className="text-right font-medium px-4 py-3">عدد المخالفات</th>
              <th className="text-right font-medium px-4 py-3">النوع الأكثر تكرارًا</th>
              <th className="text-right font-medium px-4 py-3">آخر مخالفة</th>
              <th className="text-right font-medium px-4 py-3">درجة الأولوية</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((s) => {
              const colors = PRIORITY_COLORS[s.level];
              return (
                <tr key={s.student.id} className="border-b border-border dark:border-border-dark last:border-0">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-sm ${colors.bg} ${colors.text}`}>
                      {colors.dot} {s.level}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{s.student.name}</td>
                  <td className="px-4 py-3 text-muted dark:text-muted-dark">
                    {s.student.grade} / {s.student.section}
                  </td>
                  <td className="px-4 py-3">{s.violationCount}</td>
                  <td className="px-4 py-3 text-muted dark:text-muted-dark max-w-xs truncate">
                    {categoryById.get(s.mostFrequentCategory) ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-muted dark:text-muted-dark">{s.lastViolationDate}</td>
                  <td className="px-4 py-3 font-medium">{s.score}</td>
                </tr>
              );
            })}
            {scores.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-muted dark:text-muted-dark">
                  لا توجد بيانات مطابقة للفلاتر الحالية
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
