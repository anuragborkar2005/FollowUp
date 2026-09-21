'use client';

import { useState } from 'react';
import { MessageSquare, ExternalLink, X, Copy, Check, Sparkles } from 'lucide-react';
import { generateWhatsAppLink, compileTemplate } from '@/lib/whatsapp';
import { formatIndianPhoneDisplay } from '@/lib/phone';

interface TemplateOption {
  id: string;
  title: string;
  category: string;
  body: string;
}

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: {
    id: string;
    name: string;
    phone: string;
    pendingBalance?: number | string;
  };
  templates: TemplateOption[];
  businessName: string;
  ownerPhone?: string;
  initialContext?: {
    appointmentDate?: string;
    appointmentTime?: string;
    serviceName?: string;
  };
}

export function WhatsAppModal({
  isOpen,
  onClose,
  customer,
  templates,
  businessName,
  ownerPhone = '9823012345',
  initialContext = {},
}: WhatsAppModalProps) {
  const defaultTemplate = templates[0] || {
    id: 'default',
    title: 'Quick Message',
    category: 'DEFAULT',
    body: 'Hi {{customer_name}}, this is {{business_name}}. How may we help you today?',
  };

  const [selectedTemplateId, setSelectedTemplateId] = useState(defaultTemplate.id);
  const [customMessage, setCustomMessage] = useState(() => {
    return compileTemplate(defaultTemplate.body, {
      customer_name: customer.name,
      business_name: businessName,
      appointment_date: initialContext.appointmentDate || 'Tomorrow',
      appointment_time: initialContext.appointmentTime || '11:00 AM',
      service_name: initialContext.serviceName || 'Service',
      pending_amount: String(customer.pendingBalance || '0'),
      owner_phone: ownerPhone,
    });
  });
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSelectTemplate = (template: TemplateOption) => {
    setSelectedTemplateId(template.id);
    const populated = compileTemplate(template.body, {
      customer_name: customer.name,
      business_name: businessName,
      appointment_date: initialContext.appointmentDate || 'Tomorrow',
      appointment_time: initialContext.appointmentTime || '11:00 AM',
      service_name: initialContext.serviceName || 'Service',
      pending_amount: String(customer.pendingBalance || '0'),
      owner_phone: ownerPhone,
    });
    setCustomMessage(populated);
  };

  const handleLaunchWhatsApp = () => {
    try {
      const url = generateWhatsAppLink(customer.phone, customMessage);
      window.open(url, '_blank', 'noopener,noreferrer');
      onClose();
    } catch (err) {
      alert((err as Error).message || 'Invalid phone number format');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(customMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom-6 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white shadow-sm shadow-[#25D366]/30">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-50 text-sm sm:text-base">
                Message {customer.name}
              </h3>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {formatIndianPhoneDisplay(customer.phone)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Template Selectors */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 block">
              Choose Quick Template
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                    selectedTemplateId === tpl.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500 shadow-2xs'
                      : 'border-slate-200/80 bg-slate-50/80 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400'
                  }`}
                >
                  {tpl.title}
                </button>
              ))}
            </div>
          </div>

          {/* Editable Text Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Message Preview (Editable)
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              rows={4}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:focus:bg-slate-800 leading-relaxed shadow-2xs"
              placeholder="Type your WhatsApp message..."
            />
          </div>

          {/* Notice */}
          <div className="rounded-xl bg-slate-100/80 p-3 text-xs text-slate-600 dark:bg-slate-800/80 dark:text-slate-400 flex items-center gap-2.5 border border-slate-200/60 dark:border-slate-700/60">
            <span className="h-2 w-2 rounded-full bg-[#25D366] shrink-0 animate-ping" />
            <span className="font-medium">
              Tapping below immediately opens WhatsApp with this pre-filled message ready to send.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/60 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-slate-300/80 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleLaunchWhatsApp}
            className="flex-2 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#1EBE5D] py-2.5 text-xs font-bold text-white shadow-md shadow-[#25D366]/30 hover:from-[#1EBE5D] hover:to-[#17994B] active:scale-[0.98] transition-all"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Open in WhatsApp</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-80" />
          </button>
        </div>
      </div>
    </div>
  );
}
