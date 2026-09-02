import React from 'react';
import {
  LayoutDashboard,
  AlertTriangle,
  School,
  Tags,
  FileBarChart,
  UploadCloud,
  Plug,
  Settings as SettingsIcon,
  Moon,
  Sun,
} from 'lucide-react';
import { Page } from '../types';

interface NavItem {
  id: Page;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  { id: 'priorities', label: 'مؤشرات التدخل', icon: AlertTriangle },
  { id: 'classes', label: 'تحليل الفصول', icon: School },
  { id: 'categories', label: 'أنواع المخالفات', icon: Tags },
  { id: 'reports', label: 'التقارير', icon: FileBarChart },
  { id: 'import', label: 'استيراد البيانات', icon: UploadCloud },
  { id: 'integration', label: 'التكامل', icon: Plug },
  { id: 'settings', label: 'الإعدادات', icon: SettingsIcon },
];

interface Props {
  current: Page;
  onNavigate: (p: Page) => void;
  darkMode: boolean;
  onToggleDark: () => void;
  children: React.ReactNode;
}

export default function Layout({ current, onNavigate, darkMode, onToggleDark, children }: Props) {
  return (
    <div className="flex min-h-screen bg-surface dark:bg-surface-dark text-ink dark:text-ink-dark">
      <aside className="w-64 shrink-0 border-l border-border dark:border-border-dark bg-panel dark:bg-panel-dark flex flex-col">
        <div className="px-5 py-6 border-b border-border dark:border-border-dark">
          <h1 className="text-base font-semibold leading-6 text-primary dark:text-primary-light">
            منصة المؤشرات الذكية
          </h1>
          <p className="text-xs text-muted dark:text-muted-dark mt-1">للمخالفات المدرسية</p>
        </div>
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = current === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors ${
                  active
                    ? 'bg-primary text-white'
                    : 'text-ink dark:text-ink-dark hover:bg-surface dark:hover:bg-surface-dark'
                }`}
              >
                <Icon size={18} strokeWidth={2} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border dark:border-border-dark">
          <button
            onClick={onToggleDark}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-muted dark:text-muted-dark hover:bg-surface dark:hover:bg-surface-dark"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span>{darkMode ? 'الوضع الفاتح' : 'الوضع الداكن'}</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0 p-6 md:p-8">{children}</main>
    </div>
  );
}
