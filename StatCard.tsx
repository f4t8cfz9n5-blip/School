import React from 'react';

interface Props {
  label: string;
  value: string | number;
  icon?: React.ElementType;
  hint?: string;
}

export default function StatCard({ label, value, icon: Icon, hint }: Props) {
  return (
    <div className="bg-panel dark:bg-panel-dark border border-border dark:border-border-dark rounded-md p-4 flex items-start justify-between">
      <div>
        <p className="text-xs text-muted dark:text-muted-dark mb-1.5">{label}</p>
        <p className="text-2xl font-semibold text-ink dark:text-ink-dark">{value}</p>
        {hint && <p className="text-xs text-muted dark:text-muted-dark mt-1">{hint}</p>}
      </div>
      {Icon && (
        <div className="w-9 h-9 rounded-sm bg-primary/10 text-primary dark:text-primary-light flex items-center justify-center shrink-0">
          <Icon size={18} />
        </div>
      )}
    </div>
  );
}
