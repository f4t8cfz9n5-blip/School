import { PriorityWeights, Student, StudentPriorityScore, Violation } from '../types';

export const DEFAULT_PRIORITY_WEIGHTS: PriorityWeights = {
  countWeight: 1,
  recencyWindowDays: 14,
  recencyBoost: 1.5,
  diversityWeight: 0.75,
  levelWeights: { أ: 1, ب: 2, ج: 3.5, د: 6 },
  thresholds: { high: 12, medium: 7, watch: 3 },
};

/**
 * يحسب درجة الأولوية لطالب واحد بناءً على:
 * - عدد المخالفات ووزنها حسب الخطورة (أ/ب/ج/د)
 * - التكرار خلال فترة زمنية قصيرة (تصعيد سلوكي)
 * - تنوع أنواع المخالفات (مؤشر عدم استقرار بدل تكرار نفس النوع)
 */
export function computeStudentScore(
  student: Student,
  violations: Violation[],
  weights: PriorityWeights = DEFAULT_PRIORITY_WEIGHTS
): StudentPriorityScore {
  const studentViolations = violations
    .filter((v) => v.studentId === student.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const baseScore = studentViolations.reduce(
    (sum, v) => sum + weights.countWeight * (weights.levelWeights[v.level] ?? 1),
    0
  );

  // تصعيد التكرار السريع: مخالفتان أو أكثر خلال نافذة زمنية قصيرة
  let recencyScore = 0;
  const windowMs = weights.recencyWindowDays * 24 * 60 * 60 * 1000;
  for (let i = 0; i < studentViolations.length - 1; i++) {
    const gap = new Date(studentViolations[i].date).getTime() - new Date(studentViolations[i + 1].date).getTime();
    if (gap <= windowMs) recencyScore += weights.recencyBoost;
  }

  const distinctCategories = new Set(studentViolations.map((v) => v.categoryId)).size;
  const diversityScore = distinctCategories * weights.diversityWeight;

  const score = Math.round((baseScore + recencyScore + diversityScore) * 10) / 10;

  const categoryFrequency = new Map<string, number>();
  for (const v of studentViolations) {
    categoryFrequency.set(v.categoryId, (categoryFrequency.get(v.categoryId) ?? 0) + 1);
  }
  let mostFrequentCategory = '';
  let max = 0;
  for (const [cat, count] of categoryFrequency) {
    if (count > max) {
      max = count;
      mostFrequentCategory = cat;
    }
  }

  let level: StudentPriorityScore['level'] = 'مستقرة';
  if (score >= weights.thresholds.high) level = 'عالية';
  else if (score >= weights.thresholds.medium) level = 'متوسطة';
  else if (score >= weights.thresholds.watch) level = 'متابعة';

  return {
    student,
    violationCount: studentViolations.length,
    score,
    level,
    mostFrequentCategory,
    lastViolationDate: studentViolations[0]?.date ?? '',
    distinctCategories,
  };
}

export function computeAllScores(
  students: Student[],
  violations: Violation[],
  weights: PriorityWeights = DEFAULT_PRIORITY_WEIGHTS
): StudentPriorityScore[] {
  return students
    .map((s) => computeStudentScore(s, violations, weights))
    .filter((s) => s.violationCount > 0)
    .sort((a, b) => b.score - a.score);
}

export const PRIORITY_COLORS: Record<StudentPriorityScore['level'], { dot: string; bg: string; text: string }> = {
  عالية: { dot: '🔴', bg: 'bg-high/10', text: 'text-high' },
  متوسطة: { dot: '🟠', bg: 'bg-watch/10', text: 'text-watch' },
  متابعة: { dot: '🟡', bg: 'bg-watch/10', text: 'text-watch' },
  مستقرة: { dot: '🟢', bg: 'bg-stable/10', text: 'text-stable' },
};
