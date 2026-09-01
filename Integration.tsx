import React, { useState } from 'react';
import { Plug, RefreshCw } from 'lucide-react';
import { IntegrationSettings, ImportBatch } from '../types';

interface Props {
  settings: IntegrationSettings;
  onUpdate: (s: IntegrationSettings) => void;
  importBatches: ImportBatch[];
}

export default function Integration({ settings, onUpdate, importBatches }: Props) {
  const [local, setLocal] = useState(settings);
  const [testResult, setTestResult] = useState<string | null>(null);

  const testConnection = () => {
    // لا يوجد API رسمي متاح من بوابة سلطنة عمان التعليمية حاليًا (بحسب آخر مراجعة).
    // هذا زر تجريبي يحاكي محاولة الاتصال، وجاهز ليُستبدل بطلب Fetch حقيقي مستقبلًا.
    setTestResult('لا يوجد اتصال فعلي بعد — لا يوجد API رسمي متاح من البوابة حاليًا. استخدم استيراد PDF من القائمة الجانبية.');
  };

  const save = () => onUpdate(local);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold">التكامل مع بوابة سلطنة عمان التعليمية</h2>
        <p className="text-sm text-muted dark:text-muted-dark mt-1">
          بنية جاهزة للربط المستقبلي عند توفر API رسمي من الوزارة. حاليًا يعتمد الاستيراد على ملفات PDF.
        </p>
      </div>

      <div className="bg-panel dark:bg-panel-dark border border-border dark:border-border-dark rounded-md p-5 mb-6 max-w-xl">
        <div className="flex items-center gap-2 mb-4">
          <Plug size={16} className="text-primary dark:text-primary-light" />
          <h3 className="text-sm font-semibold">إعدادات الاتصال</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted dark:text-muted-dark block mb-1">عنوان API</label>
            <input
              value={local.apiEndpoint}
              onChange={(e) => setLocal({ ...local, apiEndpoint: e.target.value })}
              placeholder="https://api.example.gov.om/violations"
              className="w-full text-sm border border-border dark:border-border-dark bg-surface dark:bg-surface-dark rounded-sm px-3 py-2"
            />
          </div>
          <div>
            <label className="text-xs text-muted dark:text-muted-dark block mb-1">API Key</label>
            <input
              value={local.apiKey}
              onChange={(e) => setLocal({ ...local, apiKey: e.target.value })}
              type="password"
              placeholder="••••••••••••"
              className="w-full text-sm border border-border dark:border-border-dark bg-surface dark:bg-surface-dark rounded-sm px-3 py-2"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={testConnection} className="text-xs bg-surface dark:bg-surface-dark border border-border dark:border-border-dark px-3 py-2 rounded-sm">
            اختبار الاتصال
          </button>
          <button onClick={save} className="text-xs bg-primary text-white px-3 py-2 rounded-sm">
            حفظ الإعدادات
          </button>
        </div>
        {testResult && <p className="text-xs text-watch mt-3">{testResult}</p>}

        <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-border dark:border-border-dark text-xs">
          <div>
            <p className="text-muted dark:text-muted-dark mb-1">تاريخ آخر مزامنة</p>
            <p>{settings.lastSyncAt ? new Date(settings.lastSyncAt).toLocaleString('ar-OM') : 'لم تتم بعد'}</p>
          </div>
          <div>
            <p className="text-muted dark:text-muted-dark mb-1">عدد السجلات المستوردة</p>
            <p>{settings.lastSyncRecordCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-panel dark:bg-panel-dark border border-border dark:border-border-dark rounded-md p-5 max-w-xl">
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw size={16} className="text-primary dark:text-primary-light" />
          <h3 className="text-sm font-semibold">سجل عمليات الاستيراد</h3>
        </div>
        <div className="space-y-2">
          {importBatches.map((b) => (
            <div key={b.id} className="flex items-center justify-between text-xs border-b border-border dark:border-border-dark pb-2 last:border-0">
              <span>{b.fileName}</span>
              <span className="text-muted dark:text-muted-dark">
                {new Date(b.importedAt).toLocaleDateString('ar-OM')} · {b.recordCount} سجل
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
