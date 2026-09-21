'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Plus,
  MessageSquare,
  Phone,
  Download,
  UploadCloud,
  Clock,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { formatIndianPhoneDisplay, formatINR } from '@/lib/phone';
import { WhatsAppModal } from '@/components/whatsapp/WhatsAppModal';
import { CreateCustomerModal } from '@/components/customers/CreateCustomerModal';
import { ImportCustomersModal } from '@/components/customers/ImportCustomersModal';

interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  status: string;
  totalSpent: number;
  pendingBalance: number;
  notes: string | null;
  tags: string[];
  nextFollowupDate?: string | null;
  nextFollowupTitle?: string | null;
}

interface TemplateRecord {
  id: string;
  title: string;
  category: string;
  body: string;
}

interface CustomersClientProps {
  initialCustomers: CustomerRecord[];
  templates: TemplateRecord[];
  businessName: string;
  ownerPhone?: string;
}

export function CustomersClient({
  initialCustomers,
  templates,
  businessName,
  ownerPhone = '9823012345',
}: CustomersClientProps) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'DUE_FOLLOWUP' | 'PENDING_KHATA' | 'VIP'>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [activeWhatsAppCustomer, setActiveWhatsAppCustomer] = useState<{
    id: string;
    name: string;
    phone: string;
    pendingBalance?: number;
  } | null>(null);

  const reloadCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      if (data.customers) {
        setCustomers(
          data.customers.map((c: any) => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
            status: c.status,
            totalSpent: Number(c.totalSpent),
            pendingBalance: Number(c.pendingBalance),
            notes: c.notes,
            tags: c.tags,
            nextFollowupDate: c.followups?.[0]?.dueDate || null,
            nextFollowupTitle: c.followups?.[0]?.title || null,
          }))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        cust.name.toLowerCase().includes(query) ||
        cust.phone.includes(query) ||
        (cust.notes && cust.notes.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      if (activeFilter === 'DUE_FOLLOWUP') {
        return !!cust.nextFollowupDate;
      }
      if (activeFilter === 'PENDING_KHATA') {
        return cust.pendingBalance > 0;
      }
      if (activeFilter === 'VIP') {
        return cust.tags.includes('VIP') || cust.totalSpent >= 3000;
      }

      return true;
    });
  }, [customers, searchQuery, activeFilter]);

  const handleExportCSV = () => {
    const headers = ['Name', 'Phone', 'Status', 'Total Spent', 'Pending Balance', 'Notes', 'Tags'];
    const rows = filteredCustomers.map((c) => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.phone}"`,
      c.status,
      c.totalSpent,
      c.pendingBalance,
      `"${(c.notes || '').replace(/"/g, '""')}"`,
      `"${c.tags.join(', ')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `followup_customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2.5">
            <Users className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            <span>Customer Directory</span>
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Manage customer records, contact history, and pending Khata balances.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 shadow-2xs"
          >
            <UploadCloud className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Import</span> CSV
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 shadow-2xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span> CSV
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/25 hover:from-emerald-700 hover:to-emerald-800 active:scale-98 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Ribbon */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, 10-digit phone, or notes..."
            className="w-full rounded-2xl border border-slate-200/80 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 shadow-2xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              activeFilter === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
            }`}
          >
            All ({customers.length})
          </button>
          <button
            onClick={() => setActiveFilter('DUE_FOLLOWUP')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              activeFilter === 'DUE_FOLLOWUP'
                ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
            }`}
          >
            Follow-up Due
          </button>
          <button
            onClick={() => setActiveFilter('PENDING_KHATA')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              activeFilter === 'PENDING_KHATA'
                ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
            }`}
          >
            Pending Khata
          </button>
          <button
            onClick={() => setActiveFilter('VIP')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              activeFilter === 'VIP'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
            }`}
          >
            VIP
          </button>
        </div>
      </div>

      {/* Customer List Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800/80 dark:bg-slate-900 overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-2" />
            <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
              No matching customers found
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search query or filter.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredCustomers.map((cust) => (
              <div
                key={cust.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors gap-4"
              >
                {/* Left info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/customers/${cust.id}`}
                      className="font-bold text-base text-slate-900 hover:text-emerald-600 dark:text-slate-100 dark:hover:text-emerald-400 transition-colors"
                    >
                      {cust.name}
                    </Link>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {cust.status}
                    </span>
                    {cust.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                    <span className="font-mono text-slate-600 dark:text-slate-400">
                      {formatIndianPhoneDisplay(cust.phone)}
                    </span>
                    <span>•</span>
                    <span>Total Spent: <strong className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">{formatINR(cust.totalSpent)}</strong></span>
                    {cust.pendingBalance > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md tabular-nums border border-rose-200/60 dark:border-rose-900/60">
                          Due: {formatINR(cust.pendingBalance)}
                        </span>
                      </>
                    )}
                  </div>

                  {cust.nextFollowupDate && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 mt-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        Follow-up: {cust.nextFollowupTitle} (
                        {new Date(cust.nextFollowupDate).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                        )
                      </span>
                    </div>
                  )}

                  {cust.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 italic mt-1">
                      "{cust.notes}"
                    </p>
                  )}
                </div>

                {/* Right Action buttons */}
                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveWhatsAppCustomer({
                        id: cust.id,
                        name: cust.name,
                        phone: cust.phone,
                        pendingBalance: cust.pendingBalance,
                      })
                    }
                    className="flex items-center gap-1.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] px-3.5 py-2 text-xs font-bold text-white shadow-sm shadow-[#25D366]/25 active:scale-95 transition-all"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <a
                    href={`tel:+91${cust.phone}`}
                    className="flex items-center justify-center h-8.5 w-8.5 rounded-xl border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 shadow-2xs"
                    title={`Call ${cust.name}`}
                  >
                    <Phone className="h-3.5 w-3.5" />
                  </a>

                  <Link
                    href={`/customers/${cust.id}`}
                    className="flex items-center justify-center h-8.5 w-8.5 rounded-xl border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 shadow-2xs"
                    title="View 360 profile"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      <CreateCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCustomerCreated={reloadCustomers}
      />

      {/* Import Customers Modal */}
      <ImportCustomersModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportCompleted={reloadCustomers}
      />

      {/* WhatsApp Modal */}
      {activeWhatsAppCustomer && (
        <WhatsAppModal
          isOpen={true}
          onClose={() => setActiveWhatsAppCustomer(null)}
          customer={activeWhatsAppCustomer}
          templates={templates}
          businessName={businessName}
          ownerPhone={ownerPhone}
        />
      )}
    </div>
  );
}
