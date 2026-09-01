import React, { useEffect, useMemo, useState } from 'react';
import Layout from './components/Layout';
import FilterBar, { Filters } from './components/FilterBar';
import Dashboard from './pages/Dashboard';
import InterventionPriorities from './pages/InterventionPriorities';
import ClassAnalysis from './pages/ClassAnalysis';
import ViolationTypeAnalysis from './pages/ViolationTypeAnalysis';
import Reports from './pages/Reports';
import ImportData from './pages/ImportData';
import Integration from './pages/Integration';
import SettingsPage from './pages/SettingsPage';
import { useAppData } from './hooks/useAppData';
import { Page } from './types';

const EMPTY_FILTERS: Filters = { academicYear: '', grade: '', section: '', level: '', search: '' };

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const data = useAppData();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const filteredViolations = useMemo(() => {
    return data.violations.filter((v) => {
      if (filters.academicYear && v.academicYear !== filters.academicYear) return false;
      if (filters.grade && v.grade !== filters.grade) return false;
      if (filters.section && v.section !== filters.section) return false;
      if (filters.level && v.level !== filters.level) return false;
      if (filters.search && !v.studentName.includes(filters.search)) return false;
      return true;
    });
  }, [data.violations, filters]);

  const filteredStudentIds = useMemo(() => new Set(filteredViolations.map((v) => v.studentId)), [filteredViolations]);
  const filteredStudents = useMemo(
    () => data.students.filter((s) => filteredStudentIds.has(s.id)),
    [data.students, filteredStudentIds]
  );

  const grades = useMemo(() => [...new Set(data.students.map((s) => s.grade))].sort((a, b) => Number(a) - Number(b)), [data.students]);
  const sections = useMemo(() => [...new Set(data.students.map((s) => s.section))].sort(), [data.students]);

  const showFilters = page !== 'import' && page !== 'integration' && page !== 'settings';

  return (
    <Layout current={page} onNavigate={setPage} darkMode={darkMode} onToggleDark={() => setDarkMode((d) => !d)}>
      {showFilters && (
        <FilterBar filters={filters} onChange={setFilters} academicYears={data.academicYears} grades={grades} sections={sections} />
      )}

      {page === 'dashboard' && <Dashboard violations={filteredViolations} />}
      {page === 'priorities' && (
        <InterventionPriorities students={filteredStudents} violations={filteredViolations} weights={data.weights} />
      )}
      {page === 'classes' && <ClassAnalysis students={filteredStudents} violations={filteredViolations} />}
      {page === 'categories' && <ViolationTypeAnalysis violations={filteredViolations} />}
      {page === 'reports' && <Reports students={filteredStudents} violations={filteredViolations} weights={data.weights} />}
      {page === 'import' && (
        <ImportData existingViolations={data.violations} onImport={data.addImportedViolations} academicYear="2026/2027" />
      )}
      {page === 'integration' && (
        <Integration settings={data.integration} onUpdate={data.updateIntegration} importBatches={data.importBatches} />
      )}
      {page === 'settings' && (
        <SettingsPage weights={data.weights} onUpdate={data.updateWeights} onResetMockData={data.resetToMockData} />
      )}
    </Layout>
  );
}
