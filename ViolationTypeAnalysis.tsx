import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import { Violation } from '../types';
import { VIOLATION_CATEGORIES, LEVEL_LABELS, LEVEL_ORDER } from '../data/violationCategories';

interface Props {
  violations: Violation[];
}

export default function ViolationTypeAnalysis({ violations }: Props) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const categoryById = useMemo(() => new Map(VIOLATION_CATEGORIES.map((c) => [c.id, c])), []);

  const distribution = useMemo(() => {
    const freq = new Map<string, number>();
    violations.forEach((v) => freq.set(v.categoryId, (freq.get(v.categoryId) ?? 0) + 1));
    return [...freq.entries()]
      .map(([categoryId, count]) => ({
        categoryId,
        title: categoryById.get(categoryId)?.title ?? categoryId,
        level: categoryById.get(categoryId)?.level ?? 'أ',
        count,
        pct: ((count / violations.length) * 100).toFixed(1),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  }, [violations, categoryById]);

  const byGrade = useMemo(() => {
    const freq = new Map<string, number>();
    const filtered = selectedCategoryId ? violations.filter((v) => v.categoryId === selectedCategoryId) : violations;
    filtered.forEach((v) => freq.set(v.grade, (freq.get(v.grade) ?? 0) + 1));
    return [...freq.entries()]
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([grade, count]) => ({ grade: `الصف ${grade}`, count }));
  }, [violations, selectedCategoryId]);

  const evolution = useMemo(() => {
    const filtered = selectedCategoryId ? violations.filter((v) => v.categoryId === selectedCategoryId) : violations;
    const byMonth = new Map<string, number>();
    filtered.forEach((v) => {
      const month = v.date.slice(0, 7);
      byMonth.set(month, (byMonth.get(month) ?? 0) + 1);
    });
    return [...byMonth.entries()].sort(([a], [b]) => (a > b ? 1 : -1)).map(([month, count]) => ({ month, count }));
  }, [violations, selectedCategoryId]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold">تحليل أنواع المخالفات</h2>
        <p className="text-sm text-muted dark:text-muted-dark mt-1">
          الأكثر انتشارًا، نسبة كل نوع، وتطوره عبر العام الدراسي
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-panel dark:bg-panel-dark border border-border dark:border-border-dark rounded-md p-4">
          <h3 className="text-sm font-medium mb-4">أكثر المخالفات انتشارًا</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={distribution} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E0EC" />
              <XAxis type="number" fontSize={11} allowDecimals={false} />
              <YAxis type="category" dataKey="level" fontSize={11} width={30} />
              <Tooltip
                formatter={(value: number) => [value, 'عدد المرات']}
                labelFormatter={(lvl: string) => distribution.find((d) => d.level === lvl)?.title ?? lvl}
              />
              <Bar
                dataKey="count"
                fill="#5B2C87"
                radius={[0, 4, 4, 0]}
                name="عدد المرات"
                onClick={(d: any) => setSelectedCategoryId(d?.payload?.categoryId ?? d?.categoryId ?? null)}
                cursor="pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-panel dark:bg-panel-dark border border-border dark:border-border-dark rounded-md p-4">
          <h3 className="text-sm font-medium mb-4">
            {selectedCategoryId ? 'تطور هذا النوع خلال العام الدراسي' : 'تطور كل المخالفات خلال العام الدراسي'}
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={evolution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E0EC" />
              <XAxis dataKey="month" fontSize={11} />
              <YAxis fontSize={11} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#8B1E3F" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-panel dark:bg-panel-dark border border-border dark:border-border-dark rounded-md p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">
            توزيع {selectedCategoryId ? 'هذا النوع' : 'كل المخالفات'} حسب الصف
          </h3>
          {selectedCategoryId && (
            <button onClick={() => setSelectedCategoryId(null)} className="text-xs text-primary dark:text-primary-light">
              إلغاء التحديد
            </button>
          )}
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={byGrade}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E0EC" />
            <XAxis dataKey="grade" fontSize={11} />
            <YAxis fontSize={11} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#7B4397" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-panel dark:bg-panel-dark border border-border dark:border-border-dark rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface dark:bg-surface-dark border-b border-border dark:border-border-dark text-muted dark:text-muted-dark">
              <th className="text-right font-medium px-4 py-3">المستوى</th>
              <th className="text-right font-medium px-4 py-3">السلوك</th>
              <th className="text-right font-medium px-4 py-3">عدد المرات</th>
              <th className="text-right font-medium px-4 py-3">النسبة</th>
            </tr>
          </thead>
          <tbody>
            {distribution.map((d) => (
              <tr
                key={d.categoryId}
                onClick={() => setSelectedCategoryId(d.categoryId)}
                className="border-b border-border dark:border-border-dark last:border-0 cursor-pointer hover:bg-surface dark:hover:bg-surface-dark"
              >
                <td className="px-4 py-3">{d.level}</td>
                <td className="px-4 py-3">{d.title}</td>
                <td className="px-4 py-3">{d.count}</td>
                <td className="px-4 py-3 text-muted dark:text-muted-dark">{d.pct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
