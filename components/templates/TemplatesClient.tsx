'use client';

import { useState } from 'react';
import {
  MessageSquare,
  Copy,
  Check,
  Tag,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface TemplateItem {
  id: string;
  title: string;
  category: string;
  body: string;
  isDefault: boolean;
}

interface TemplatesClientProps {
  templates: TemplateItem[];
  businessName: string;
}

export function TemplatesClient({ templates, businessName }: TemplatesClientProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const variables = [
    { tag: '{{customer_name}}', desc: 'Customer full name' },
    { tag: '{{business_name}}', desc: 'Your business name' },
    { tag: '{{appointment_date}}', desc: 'Scheduled service date' },
    { tag: '{{appointment_time}}', desc: 'Booked time slot' },
    { tag: '{{service_name}}', desc: 'Haircut, facial, spa, etc.' },
    { tag: '{{pending_amount}}', desc: 'Unpaid Khata balance' },
    { tag: '{{owner_phone}}', desc: 'Your contact / UPI phone' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2.5">
          <MessageSquare className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
          <span>WhatsApp Message Templates</span>
        </h2>
        <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
          High-converting Indian local business message scripts with automated variable replacement.
        </p>
      </div>

      {/* Variables Cheat Sheet */}
      <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/70 to-teal-50/30 p-5 dark:border-emerald-900/50 dark:from-emerald-950/30 dark:to-slate-900">
        <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">
          <Tag className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Available Dynamic Variables</span>
        </div>
        <div className="mt-3.5 flex flex-wrap gap-2">
          {variables.map((v) => (
            <div
              key={v.tag}
              className="rounded-xl border border-emerald-200/80 bg-white/90 px-3 py-1.5 text-xs dark:border-emerald-800/80 dark:bg-slate-900 shadow-2xs"
            >
              <code className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                {v.tag}
              </code>
              <span className="text-slate-500 text-[11px] ml-1.5 font-medium">— {v.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Templates Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-2xs dark:border-slate-800/80 dark:bg-slate-900"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  {tpl.title}
                </h3>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  {tpl.category}
                </span>
              </div>

              <div className="rounded-2xl bg-slate-50/80 p-4 text-xs text-slate-700 dark:bg-slate-800/60 dark:text-slate-300 whitespace-pre-line leading-relaxed border border-slate-100 dark:border-slate-800/80 font-normal">
                {tpl.body}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">
                {tpl.isDefault ? 'Default template' : 'Custom template'}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(tpl.id, tpl.body)}
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition-colors"
              >
                {copiedId === tpl.id ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Copied to Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
