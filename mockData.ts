import { Student, Violation } from '../types';
import { VIOLATION_CATEGORIES } from './violationCategories';

const FIRST_NAMES = [
  'محمد', 'أحمد', 'سالم', 'خالد', 'عبدالله', 'يوسف', 'ناصر', 'سعيد', 'راشد', 'حمد',
  'فاطمة', 'مريم', 'عائشة', 'سلمى', 'هدى', 'ريم', 'نور', 'أسماء', 'زينب', 'شيخة',
];
const LAST_NAMES = [
  'البلوشي', 'الحارثي', 'الكندي', 'السعدي', 'الرواحي', 'الهنائي', 'المعمري', 'الشحي', 'الغافري', 'العلوي',
];
const SCHOOLS = [
  { name: 'عبدالله بن زيد للبنين للصفوف (7-10)', code: '6106', wilayat: 'إبراء' },
  { name: 'الشيخ حمدان بن خميس اليوسفي للبنين الصفوف (7-10)', code: '1564', wilayat: 'السيب' },
];
const GRADES = ['5', '6', '7', '8', '9', '10', '11', '12'];
const SECTIONS = ['1', '2', '3', '4', '5'];

function randOf<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDateInSchoolYear(): string {
  // العام الدراسي 2026/2027 تقريبًا: سبتمبر 2026 - يونيو 2027
  const start = new Date('2026-09-01').getTime();
  const end = new Date('2027-06-15').getTime();
  const now = Date.now();
  const cappedEnd = Math.min(end, now);
  const t = start + Math.random() * (cappedEnd - start);
  return new Date(t).toISOString().slice(0, 10);
}

export function generateMockStudents(count = 60): Student[] {
  const students: Student[] = [];
  for (let i = 0; i < count; i++) {
    const school = randOf(SCHOOLS);
    students.push({
      id: `stu-${i + 1}`,
      name: `${randOf(FIRST_NAMES)} ${randOf(FIRST_NAMES)} ${randOf(LAST_NAMES)}`,
      grade: randOf(GRADES),
      section: randOf(SECTIONS),
      schoolCode: school.code,
      schoolName: school.name,
      wilayat: school.wilayat,
    });
  }
  return students;
}

export function generateMockViolations(students: Student[], count = 220): Violation[] {
  const violations: Violation[] = [];
  // بعض الطلاب يتكررون أكثر من غيرهم لمحاكاة واقعية (توزيع غير متساوٍ)
  const weightedStudents: Student[] = [];
  students.forEach((s) => {
    const weight = Math.random() < 0.15 ? 6 : Math.random() < 0.4 ? 2 : 1;
    for (let w = 0; w < weight; w++) weightedStudents.push(s);
  });

  for (let i = 0; i < count; i++) {
    const student = randOf(weightedStudents);
    // معظم المخالفات من المستوى (أ)، مع تناقص تدريجي للمستويات الأعلى (واقعي إحصائيًا)
    const roll = Math.random();
    const level = roll < 0.65 ? 'أ' : roll < 0.87 ? 'ب' : roll < 0.97 ? 'ج' : 'د';
    const categoriesOfLevel = VIOLATION_CATEGORIES.filter((c) => c.level === level);
    const category = randOf(categoriesOfLevel);

    violations.push({
      id: `vio-${i + 1}`,
      studentId: student.id,
      studentName: student.name,
      grade: student.grade,
      section: student.section,
      violationNumber: `${2500000 + Math.floor(Math.random() * 90000)}`,
      date: randomDateInSchoolYear(),
      categoryId: category.id,
      level: category.level,
      decision: category.action,
      academicYear: '2026/2027',
      importBatchId: 'mock-seed',
    });
  }
  return violations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
