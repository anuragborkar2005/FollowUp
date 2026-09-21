'use client';

import { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { parseCSV, mapCSVToCustomerRows, ParsedCustomerRow } from '@/lib/csv';
import { normalizeIndianPhone, formatIndianPhoneDisplay } from '@/lib/phone';

interface ImportCustomersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportCompleted: () => void;
}

export function ImportCustomersModal({
  isOpen,
  onClose,
  onImportCompleted,
}: ImportCustomersModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [csvContent, setCsvContent] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewRows, setPreviewRows] = useState<ParsedCustomerRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    importedCount: number;
    skippedCount: number;
    errorCount: number;
    skipped: { name: string; phone: string; reason: string }[];
    errors: { name: string; phone: string; reason: string }[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
      processPreview(text);
    };
    reader.readAsText(file);
  };

  const processPreview = (text: string) => {
    try {
      const parsed = parseCSV(text);
      const { records } = mapCSVToCustomerRows(parsed);
      setPreviewRows(records);
      if (records.length === 0) {
        setError('No valid customer records found in CSV. Check column headers.');
      }
    } catch {
      setError('Could not parse CSV text. Please verify formatting.');
    }
  };

  const handlePasteChange = (text: string) => {
    setCsvContent(text);
    setFileName(null);
    setError(null);
    setResult(null);
    processPreview(text);
  };

  const downloadSampleCSV = () => {
    const sample = `Name,Phone,Notes,Tags,Balance\nRajesh Kumar,9823011223,Regular haircut and beard trim,VIP,0\nPooja Sharma,9890123456,Facial and coloring appointment,Bridal,450\nVikram Singh,9765432100,Prefers evening slots,Regular,0`;
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'followup_sample_contacts.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async () => {
    if (!csvContent.trim()) {
      setError('Please select a CSV file or paste contact rows.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/customers/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvText: csvContent }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to import contacts.');
      }

      setResult({
        importedCount: data.importedCount,
        skippedCount: data.skippedCount,
        errorCount: data.errorCount,
        skipped: data.skipped || [],
        errors: data.errors || [],
      });

      onImportCompleted();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setCsvContent('');
    setFileName(null);
    setPreviewRows([]);
    setResult(null);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-50 text-base">
                Import Customers (CSV / Excel)
              </h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Bulk add contacts from Google Contacts, WhatsApp export, or Excel
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              resetModal();
              onClose();
            }}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Result view */}
          {result ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 dark:bg-emerald-950/40 dark:border-emerald-800 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                <h4 className="text-base font-bold text-emerald-950 dark:text-emerald-100">
                  Import Process Completed
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                  Customer directory has been updated successfully.
                </p>

                <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-800">
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {result.importedCount}
                    </span>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                      Imported
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-amber-200/60 dark:border-amber-800">
                    <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                      {result.skippedCount}
                    </span>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                      Skipped (Duplicate)
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-rose-200/60 dark:border-rose-800">
                    <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                      {result.errorCount}
                    </span>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                      Failed
                    </p>
                  </div>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                    Failed Entries:
                  </span>
                  <div className="max-h-32 overflow-y-auto space-y-1.5 rounded-xl border border-rose-200 bg-rose-50/50 p-2 text-xs dark:border-rose-900/50 dark:bg-rose-950/20">
                    {result.errors.map((err, i) => (
                      <div key={i} className="flex items-center justify-between text-rose-900 dark:text-rose-200 py-0.5">
                        <span className="font-semibold">{err.name || 'Unnamed'} ({err.phone || 'No phone'})</span>
                        <span className="text-[11px] text-rose-600 dark:text-rose-400">{err.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetModal}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 flex items-center gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Import Another File
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      activeTab === 'upload'
                        ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    Upload CSV File
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('paste')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      activeTab === 'paste'
                        ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    Paste Text / Contacts
                  </button>
                </div>

                <button
                  type="button"
                  onClick={downloadSampleCSV}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                >
                  <Download className="h-3.5 w-3.5" />
                  Sample CSV
                </button>
              </div>

              {/* Upload Tab */}
              {activeTab === 'upload' && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {fileName ? fileName : 'Click to browse or drop CSV file'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Accepts .csv with columns: Name, Phone, Notes, Tags, Balance
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Paste Tab */}
              {activeTab === 'paste' && (
                <div className="space-y-2">
                  <textarea
                    rows={6}
                    value={csvContent}
                    onChange={(e) => handlePasteChange(e.target.value)}
                    placeholder={`Name,Phone,Notes,Tags\nRajesh Verma,9823011223,Haircut VIP,VIP\nPriya Patel,9890123456,Facial and coloring,Bridal`}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-200"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Comma separated or tab separated columns. Header row is optional if ordering is Name, Phone, Notes.
                  </p>
                </div>
              )}

              {error && (
                <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* Preview Table */}
              {previewRows.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      Parsed Records Preview ({previewRows.length})
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Top {Math.min(previewRows.length, 5)} shown
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/75 dark:bg-slate-800/75 font-semibold text-slate-600 dark:text-slate-300">
                        <tr>
                          <th className="px-3 py-2">Name</th>
                          <th className="px-3 py-2">Phone</th>
                          <th className="px-3 py-2">Tags</th>
                          <th className="px-3 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                        {previewRows.slice(0, 5).map((row, idx) => {
                          const clean = normalizeIndianPhone(row.phone);
                          return (
                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <td className="px-3 py-2 font-medium">{row.name || '—'}</td>
                              <td className="px-3 py-2 font-mono text-[11px]">
                                {clean ? formatIndianPhoneDisplay(clean) : (
                                  <span className="text-rose-600 font-bold">Invalid: {row.phone}</span>
                                )}
                              </td>
                              <td className="px-3 py-2">
                                <span className="inline-flex rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                  {row.tags?.join(', ') || 'Imported'}
                                </span>
                              </td>
                              <td className="px-3 py-2">
                                {clean && row.name ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="h-3 w-3" /> Ready
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-semibold text-rose-500">
                                    Check row
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    resetModal();
                    onClose();
                  }}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={loading || previewRows.length === 0}
                  onClick={handleImport}
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Importing Contacts...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-3.5 w-3.5" />
                      <span>Import {previewRows.length > 0 ? `${previewRows.length} Contacts` : 'Contacts'}</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
