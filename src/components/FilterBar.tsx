import React from 'react';
import { Search } from 'lucide-react';

export interface Filters {
  academicYear: string;
  grade: string;
  section: string;
  level: string;
  search: string;
}

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  academicYears: string[];
  grades: string[];
  sections: string[];
}

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-sm border border-border dark:border-border-dark bg-panel dark:bg-panel-dark rounded-sm px-3 py-2 text-ink dark:text-ink-dark"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export default function FilterBar({ filters, onChange, academicYears, grades, sections }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <div className="relative">
        <Search size={15} className="absolute top-1/2 -translate-y-1/2 right-3 text-muted dark:text-muted-dark" />
        <input
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="بحث باسم الطالب"
          className="text-sm border border-border dark:border-border-dark bg-panel dark:bg-panel-dark rounded-sm pr-9 pl-3 py-2 text-ink dark:text-ink-dark w-56"
        />
      </div>
      <Select
        value={filters.academicYear}
        onChange={(v) => onChange({ ...filters, academicYear: v })}
        options={academicYears}
        placeholder="كل الأعوام الدراسية"
      />
      <Select
        value={filters.grade}
        onChange={(v) => onChange({ ...filters, grade: v })}
        options={grades}
        placeholder="كل الصفوف"
      />
      <Select
        value={filters.section}
        onChange={(v) => onChange({ ...filters, section: v })}
        options={sections}
        placeholder="كل الشعب"
      />
      <Select
        value={filters.level}
        onChange={(v) => onChange({ ...filters, level: v })}
        options={['أ', 'ب', 'ج', 'د']}
        placeholder="كل مستويات المخالفة"
      />
    </div>
  );
}
