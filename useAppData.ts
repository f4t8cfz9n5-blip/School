import { useMemo, useState } from 'react';
import { Student, Violation, PriorityWeights, ImportBatch, IntegrationSettings } from '../types';
import { generateMockStudents, generateMockViolations } from '../data/mockData';
import { DEFAULT_PRIORITY_WEIGHTS } from '../utils/priorityCalc';

const STORAGE_KEY = 'violations-platform-state-v1';

interface PersistedState {
  students: Student[];
  violations: Violation[];
  weights: PriorityWeights;
  importBatches: ImportBatch[];
  integration: IntegrationSettings;
}

function loadInitialState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // تجاهل أخطاء التخزين المحلي والبدء ببيانات تجريبية
  }
  const students = generateMockStudents(60);
  const violations = generateMockViolations(students, 220);
  return {
    students,
    violations,
    weights: DEFAULT_PRIORITY_WEIGHTS,
    importBatches: [
      {
        id: 'mock-seed',
        fileName: 'بيانات تجريبية (Mock Data)',
        importedAt: new Date().toISOString(),
        recordCount: violations.length,
        duplicatesSkipped: 0,
        academicYear: '2026/2027',
      },
    ],
    integration: {
      apiEndpoint: '',
      apiKey: '',
      lastSyncAt: null,
      lastSyncRecordCount: 0,
      connected: false,
    },
  };
}

/**
 * هذا الـ hook هو نقطة الاتصال الوحيدة بالبيانات في التطبيق.
 * حاليًا يخزّن الحالة محليًا (localStorage) كي يعمل التطبيق فورًا بدون
 * إعداد Firebase. عند ربط مشروع Firebase الفعلي، تُستبدل الدوال أدناه
 * باستدعاءات Firestore (addDoc / setDoc / onSnapshot) دون تغيير واجهة
 * الاستخدام في بقية الصفحات.
 */
export function useAppData() {
  const [state, setState] = useState<PersistedState>(loadInitialState);

  const persist = (next: PersistedState) => {
    setState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // تجاهل: التخزين المحلي غير متاح
    }
  };

  const addImportedViolations = (
    newStudents: Student[],
    newViolations: Violation[],
    batch: ImportBatch
  ) => {
    const existingIds = new Set(state.students.map((s) => s.id));
    const mergedStudents = [...state.students, ...newStudents.filter((s) => !existingIds.has(s.id))];
    persist({
      ...state,
      students: mergedStudents,
      violations: [...newViolations, ...state.violations],
      importBatches: [batch, ...state.importBatches],
    });
  };

  const updateWeights = (weights: PriorityWeights) => persist({ ...state, weights });

  const updateIntegration = (integration: IntegrationSettings) => persist({ ...state, integration });

  const resetToMockData = () => {
    const students = generateMockStudents(60);
    const violations = generateMockViolations(students, 220);
    persist({
      students,
      violations,
      weights: DEFAULT_PRIORITY_WEIGHTS,
      importBatches: [
        {
          id: 'mock-seed',
          fileName: 'بيانات تجريبية (Mock Data)',
          importedAt: new Date().toISOString(),
          recordCount: violations.length,
          duplicatesSkipped: 0,
          academicYear: '2026/2027',
        },
      ],
      integration: state.integration,
    });
  };

  const academicYears = useMemo(
    () => [...new Set(state.violations.map((v) => v.academicYear))].sort().reverse(),
    [state.violations]
  );

  return {
    ...state,
    academicYears,
    addImportedViolations,
    updateWeights,
    updateIntegration,
    resetToMockData,
  };
}

export type AppData = ReturnType<typeof useAppData>;
