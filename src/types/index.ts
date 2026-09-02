export type Page =
  | 'dashboard'
  | 'priorities'
  | 'classes'
  | 'categories'
  | 'reports'
  | 'import'
  | 'integration'
  | 'settings';

// المستويات الرسمية حسب لائحة شؤون الطلاب بالمدارس الحكومية (الفصل السادس، المادتان 39 و40)
export type ViolationLevel = 'أ' | 'ب' | 'ج' | 'د';

export interface ViolationCategory {
  id: string;
  level: ViolationLevel;
  order: number;
  title: string; // نص السلوك كما ورد في اللائحة
  action: string; // الإجراء المترتب (تصحيح كتابي / تنبيه الطالب / إنذار الطالب / فصل مؤقت)
  severityWeight: number; // وزن الخطورة المستخدم في حساب الأولوية
}

export interface Student {
  id: string;
  name: string;
  grade: string; // الصف (5-12)
  section: string; // الشعبة
  schoolCode?: string;
  schoolName?: string;
  wilayat?: string; // الولاية
}

export interface Violation {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  section: string;
  violationNumber: string; // رقم المخالفة كما ورد في تقرير البوابة
  date: string; // ISO date
  categoryId: string; // مرجع لـ ViolationCategory
  level: ViolationLevel;
  decision: string; // القرار كما ورد بالتقرير
  academicYear: string; // مثال: 2026/2027
  importBatchId: string;
}

export type PriorityLevel = 'عالية' | 'متوسطة' | 'متابعة' | 'مستقرة';

export interface PriorityWeights {
  countWeight: number; // وزن عدد المخالفات الكلي
  recencyWindowDays: number; // نافذة التكرار السريع
  recencyBoost: number; // مضاعف عند تكرار داخل النافذة
  diversityWeight: number; // وزن تنوع أنواع المخالفات
  levelWeights: Record<ViolationLevel, number>; // وزن كل مستوى خطورة
  thresholds: {
    high: number;
    medium: number;
    watch: number;
  };
}

export interface StudentPriorityScore {
  student: Student;
  violationCount: number;
  score: number;
  level: PriorityLevel;
  mostFrequentCategory: string;
  lastViolationDate: string;
  distinctCategories: number;
}

export interface ImportBatch {
  id: string;
  fileName: string;
  importedAt: string;
  recordCount: number;
  duplicatesSkipped: number;
  academicYear: string;
}

export interface IntegrationSettings {
  apiEndpoint: string;
  apiKey: string;
  lastSyncAt: string | null;
  lastSyncRecordCount: number;
  connected: boolean;
}
