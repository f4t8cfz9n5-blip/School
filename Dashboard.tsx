import React, { useMemo } from 'react';
import { AlertTriangle, Users, TrendingUp, CalendarDays, CalendarRange, Repeat } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';
import { Violation } from '../types';
import { LEVEL_LABELS } from '../data/violationCategories';
import StatCard from '../components/StatCard';

interface Props {
  violations: Violation[];
}

function startOfWeek(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

export default function Dashboard({ violations }: Props) {
  const now = new Date();

  const weeklyCount = useMemo(() => {
    const weekStart = startOfWeek(now).getTime();
    return violations.filter((v) => new Date(v.date).getTime() >= weekStart).length;
  }, [violations]);

  const monthlyCount = useMemo(() => {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    return violations.filter((v) => new Date(v.date).getTime() >= monthStart).length;
  }, [violations]);

  const uniqueStudents = useMemo(() => new Set(violations.map((v) => v.studentId)).size, [violations]);

  const topCategory = useMemo(() => {
    const freq = new Map<string, number>();
    violations.forEach((v) => freq.set(v.decision, (freq.get(v.decision) ?? 0) + 1));
    let best = '';
    let max = 0;
    for (const [k, v] of freq) if (v > max) [best, max] = [k, v];
    return best || '—';
  }, [violations]);

  const topGrade = useMemo(() => {
    const freq = new Map<string, number>();
    violations.forEach((v) => freq.set(v.grade, (freq.get(v.grade) ?? 0) + 1));
    let best = '';
    let max = 0;
    for (const [k, v] of freq) if (v > max) [best, max] = [k, v];
    return best ? `الصف ${best}` : '—';
  }, [violations]);

  const topSection = useMemo(() => {
    const freq = new Map<string, number>();
    violations.forEach((v) => freq.set(`${v.grade}/${v.section}`, (freq.get(`${v.grade}/${v.section}`) ?? 0) + 1));
    let best = '';
    let max = 0;
    for (const [k, v] of freq) if (v > max) [best, max] = [k, v];
    return best ? `شعبة ${best}` : '—';
  }, [violations]);

  const mostRepeatedStudent = useMemo(() => {
    const freq = new Map<string, { name: string; count: number }>();
    violations.forEach((v) => {
      const cur = freq.get(v.studentId) ?? { name: v.studentName, count: 0 };
      cur.count++;
      freq.set(v.studentId, cur);
    });
    let best = { name: '—', count: 0 };
    for (const v of freq.values()) if (v.count > best.count) best = v;
    return best;
  }, [violations]);

  const trendData = useMemo(() => {
    const byWeek = new Map<string, number>();
    violations.forEach((v) => {
      const week = startOfWeek(new Date(v.date)).toISOString().slice(0, 10);
      byWeek.set(week, (byWeek.get(week) ?? 0) + 1);
    });
    return [...byWeek.entries()]
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .slice(-16)
      .map(([week, count]) => ({ week: week.slice(5), count }));
  }, [violations]);

  const typeDistribution = useMemo(() => {
    const byLevel = new Map<string, number>();
    violations.forEach((v) => byLevel.set(v.level, (byLevel.get(v.level) ?? 0) + 1));
    return (['أ', 'ب', 'ج', 'د'] as const).map((lvl) => ({
      level: LEVEL_LABELS[lvl].split(' — ')[1],
      count: byLevel.get(lvl) ?? 0,
    }));
  }, [violations]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold">لوحة المؤشرات</h2>
        <p className="text-sm text-muted dark:text-muted-dark mt-1">نظرة عامة فورية على مخالفات الطلبة</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="إجمالي المخالفات" value={violations.length} icon={AlertTriangle} />
        <StatCard label="عدد الطلاب المخالفين" value={uniqueStudents} icon={Users} />
        <StatCard label="مخالفات هذا الأسبوع" value={weeklyCount} icon={CalendarDays} />
        <StatCard label="مخالفات هذا الشهر" value={monthlyCount} icon={CalendarRange} />
        <StatCard label="أكثر إجراء متكررًا" value={topCategory} icon={TrendingUp} />
        <StatCard label="أكثر الصفوف تسجيلًا" value={topGrade} />
        <StatCard label="أكثر الفصول تسجيلًا" value={topSection} />
        <StatCard
          label="الأكثر تكرارًا"
          value={mostRepeatedStudent.name}
          hint={`${mostRepeatedStudent.count} مخالفة`}
          icon={Repeat}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-panel dark:bg-panel-dark border border-border dark:border-border-dark rounded-md p-4">
          <h3 className="text-sm font-medium mb-4">تطور المخالفات أسبوعيًا</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E0EC" />
              <XAxis dataKey="week" fontSize={11} />
              <YAxis fontSize={11} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#5B2C87" strokeWidth={2} dot={false} name="المخالفات" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-panel dark:bg-panel-dark border border-border dark:border-border-dark rounded-md p-4">
          <h3 className="text-sm font-medium mb-4">توزيع المخالفات حسب المستوى</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={typeDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E0EC" />
              <XAxis dataKey="level" fontSize={11} />
              <YAxis fontSize={11} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#8B1E3F" radius={[4, 4, 0, 0]} name="عدد المخالفات" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
