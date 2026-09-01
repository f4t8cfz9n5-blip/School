import React, { useState } from 'react';
import { RotateCcw, Save } from 'lucide-react';
import { PriorityWeights, ViolationLevel } from '../types';
import { DEFAULT_PRIORITY_WEIGHTS } from '../utils/priorityCalc';

interface Props {
  weights: PriorityWeights;
  onUpdate: (w: PriorityWeights) => void;
  onResetMockData: () => void;
}

const LEVEL_LABELS_SHORT: Record<ViolationLevel, string> = {
  أ: 'المستوى أ (تصحيح كتابي)',
  ب: 'المستوى ب (تنبيه)',
  ج: 'المستوى ج (إنذار)',
  د: 'المستوى د (فصل مؤقت)',
};

function NumberField({ label, value, onChange, step = 0.5 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <div>
      <label className="text-xs text-muted dark:text-muted-dark block mb-1">{label}</label>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full text-sm border border-border dark:border-border-dark bg-surface dark:bg-surface-dark rounded-sm px-3 py-2"
      />
    </div>
  );
}

export default function SettingsPage({ weights, onUpdate, onResetMockData }: Props) {
  const [local, setLocal] = useState<PriorityWeights>(weights);

  const save = () => onUpdate(local);
  const restoreDefaults = () => setLocal(DEFAULT_PRIORITY_WEIGHTS);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold">الإعدادات</h2>
        <p className="text-sm text-muted dark:text-muted-dark mt-1">
          تحكم بأوزان معادلة حساب أولوية التدخل. القيم الافتراضية منطقية ويمكن تعديلها بحرية.
        </p>
      </div>

      <div className="bg-panel dark:bg-panel-dark border border-border dark:border-border-dark rounded-md p-5 max-w-2xl mb-6">
        <h3 className="text-sm font-semibold mb-4">أوزان الخطورة حسب المستوى</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(Object.keys(local.levelWeights) as ViolationLevel[]).map((lvl) => (
            <NumberField
              key={lvl}
              label={LEVEL_LABELS_SHORT[lvl]}
              value={local.levelWeights[lvl]}
              onChange={(v) => setLocal({ ...local, levelWeights: { ...local.levelWeights, [lvl]: v } })}
            />
          ))}
        </div>
      </div>

      <div className="bg-panel dark:bg-panel-dark border border-border dark:border-border-dark rounded-md p-5 max-w-2xl mb-6">
        <h3 className="text-sm font-semibold mb-4">التصعيد والتنوّع</h3>
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="وزن العدد الأساسي" value={local.countWeight} onChange={(v) => setLocal({ ...local, countWeight: v })} />
          <NumberField
            label="نافذة التكرار السريع (أيام)"
            value={local.recencyWindowDays}
            step={1}
            onChange={(v) => setLocal({ ...local, recencyWindowDays: v })}
          />
          <NumberField label="مضاعف التصعيد السريع" value={local.recencyBoost} onChange={(v) => setLocal({ ...local, recencyBoost: v })} />
          <NumberField label="وزن تنوّع الأنواع" value={local.diversityWeight} onChange={(v) => setLocal({ ...local, diversityWeight: v })} />
        </div>
      </div>

      <div className="bg-panel dark:bg-panel-dark border border-border dark:border-border-dark rounded-md p-5 max-w-2xl mb-6">
        <h3 className="text-sm font-semibold mb-4">حدود مستويات الأولوية</h3>
        <div className="grid grid-cols-3 gap-3">
          <NumberField
            label="🔴 عالية (بحد أدنى)"
            value={local.thresholds.high}
            step={1}
            onChange={(v) => setLocal({ ...local, thresholds: { ...local.thresholds, high: v } })}
          />
          <NumberField
            label="🟠 متوسطة (بحد أدنى)"
            value={local.thresholds.medium}
            step={1}
            onChange={(v) => setLocal({ ...local, thresholds: { ...local.thresholds, medium: v } })}
          />
          <NumberField
            label="🟡 متابعة (بحد أدنى)"
            value={local.thresholds.watch}
            step={1}
            onChange={(v) => setLocal({ ...local, thresholds: { ...local.thresholds, watch: v } })}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-8">
        <button onClick={save} className="flex items-center gap-1.5 text-sm bg-primary text-white px-4 py-2 rounded-sm">
          <Save size={14} />
          حفظ الإعدادات
        </button>
        <button onClick={restoreDefaults} className="flex items-center gap-1.5 text-sm border border-border dark:border-border-dark px-4 py-2 rounded-sm">
          <RotateCcw size={14} />
          استعادة القيم الافتراضية
        </button>
      </div>

      <div className="bg-panel dark:bg-panel-dark border border-border dark:border-border-dark rounded-md p-5 max-w-2xl">
        <h3 className="text-sm font-semibold mb-2">بيانات تجريبية</h3>
        <p className="text-xs text-muted dark:text-muted-dark mb-3">
          إعادة توليد بيانات وهمية جديدة لتجربة المنصة (يستبدل البيانات الحالية).
        </p>
        <button onClick={onResetMockData} className="text-xs border border-border dark:border-border-dark px-3 py-2 rounded-sm">
          إعادة توليد بيانات تجريبية
        </button>
      </div>
    </div>
  );
}
