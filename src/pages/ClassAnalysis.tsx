import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Student, Violation } from '../types';

interface Props {
  students: Student[];
  violations: Violation[];
}

interface ClassRow {
  key: string;
  grade: string;
  section: string;
  studentCount: number;
  violationCount: number;
  topViolationDecision: string;
  topStudent: string;
}

export default function ClassAnalysis({ students, violations }: Props) {
  const rows = useMemo<ClassRow[]>(() => {
    const classMap = new Map<string, ClassRow>();
    students.forEach((s) => {
      const key = `${s.grade}/${s.section}`;
      if (!classMap.has(key)) {
        classMap.set(key, {
          key,
          grade: s.grade,
          section: s.section,
          studentCount: 0,
          violationCount: 0,
          topViolationDecision: '',
          topStudent: '',
        });
      }
      classMap.get(key)!.studentCount++;
    });

    const decisionFreqByClass = new Map<string, Map<string, number>>();
    const studentFreqByClass = new Map<string, Map<string, number>>();

    violations.forEach((v) => {
      const key = `${v.grade}/${v.section}`;
      const row = classMap.get(key);
      if (!row) return;
      row.violationCount++;

      if (!decisionFreqByClass.has(key)) decisionFreqByClass.set(key, new Map());
      const df = decisionFreqByClass.get(key)!;
      df.set(v.decision, (df.get(v.decision) ?? 0) + 1);

      if (!studentFreqByClass.has(key)) studentFreqByClass.set(key, new Map());
      const sf = studentFreqByClass.get(key)!;
      sf.set(v.studentName, (sf.get(v.studentName) ?? 0) + 1);
    });

    for (const [key, row] of classMap) {
      const df = decisionFreqByClass.get(key);
      if (df) {
        let best = '';
        let max = 0;
        for (const [k, v] of df) if (v > max) [best, max] = [k, v];
        row.topViolationDecision = best;
      }
      const sf = studentFreqByClass.get(key);
      if (sf) {
        let best = '';
        let max = 0;
        for (const [k, v] of sf) if (v > max) [best, max] = [k, v];
        row.topStudent = best;
      }
    }

    return [...classMap.values()].sort((a, b) => b.violationCount - a.violationCount);
  }, [students, violations]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold">تحليل الفصول</h2>
        <p className="text-sm text-muted dark:text-muted-dark mt-1">مقارنة الشعب من حيث عدد المخالفات ونوعها</p>
      </div>

      <div className="bg-panel dark:bg-panel-dark border border-border dark:border-border-dark rounded-md p-4 mb-6">
        <h3 className="text-sm font-medium mb-4">ترتيب الفصول حسب عدد المخالفات</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={rows} layout="vertical" margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E0EC" />
            <XAxis type="number" fontSize={11} allowDecimals={false} />
            <YAxis type="category" dataKey="key" fontSize={11} width={60} />
            <Tooltip />
            <Bar dataKey="violationCount" fill="#5B2C87" radius={[0, 4, 4, 0]} name="عدد المخالفات" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-panel dark:bg-panel-dark border border-border dark:border-border-dark rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface dark:bg-surface-dark border-b border-border dark:border-border-dark text-muted dark:text-muted-dark">
              <th className="text-right font-medium px-4 py-3">الصف / الشعبة</th>
              <th className="text-right font-medium px-4 py-3">عدد الطلاب</th>
              <th className="text-right font-medium px-4 py-3">عدد المخالفات</th>
              <th className="text-right font-medium px-4 py-3">الإجراء الأكثر شيوعًا</th>
              <th className="text-right font-medium px-4 py-3">أكثر طالب مخالفة</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-b border-border dark:border-border-dark last:border-0">
                <td className="px-4 py-3 font-medium">
                  {r.grade} / {r.section}
                </td>
                <td className="px-4 py-3">{r.studentCount}</td>
                <td className="px-4 py-3">{r.violationCount}</td>
                <td className="px-4 py-3 text-muted dark:text-muted-dark">{r.topViolationDecision || '—'}</td>
                <td className="px-4 py-3 text-muted dark:text-muted-dark">{r.topStudent || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
