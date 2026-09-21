'use client';

import { useState } from 'react';
import {
  Calendar,
  Clock,
  MessageSquare,
  Plus,
  Phone,
  CheckCircle2,
  X,
  User,
  Sparkles,
} from 'lucide-react';
import { formatIndianPhoneDisplay, formatINR } from '@/lib/phone';
import { WhatsAppModal } from '@/components/whatsapp/WhatsAppModal';

interface AppointmentRecord {
  id: string;
  serviceName: string;
  startTime: string;
  price: number;
  status: string;
  notes: string | null;
  customer: {
    id: string;
    name: string;
    phone: string;
  };
}

interface TemplateRecord {
  id: string;
  title: string;
  category: string;
  body: string;
}

interface CustomerOption {
  id: string;
  name: string;
  phone: string;
}

interface AppointmentsClientProps {
  initialAppointments: AppointmentRecord[];
  templates: TemplateRecord[];
  customerOptions: CustomerOption[];
  businessName: string;
  ownerPhone?: string;
}

export function AppointmentsClient({
  initialAppointments,
  templates,
  customerOptions,
  businessName,
  ownerPhone = '9823012345',
}: AppointmentsClientProps) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeWhatsAppCustomer, setActiveWhatsAppCustomer] = useState<{
    id: string;
    name: string;
    phone: string;
    initialContext?: {
      appointmentDate?: string;
      appointmentTime?: string;
      serviceName?: string;
    };
  } | null>(null);

  const [selectedCustomerId, setSelectedCustomerId] = useState(customerOptions[0]?.id || '');
  const [serviceName, setServiceName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !serviceName || !startTime) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          serviceName: serviceName.trim(),
          startTime: new Date(startTime).toISOString(),
          price: Number(price) || 0,
          notes: notes.trim() || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const matched = customerOptions.find((c) => c.id === selectedCustomerId);
        setAppointments([
          {
            id: data.appointment.id,
            serviceName: data.appointment.serviceName,
            startTime: data.appointment.startTime,
            price: Number(data.appointment.price),
            status: data.appointment.status,
            notes: data.appointment.notes,
            customer: {
              id: selectedCustomerId,
              name: matched?.name || 'Customer',
              phone: matched?.phone || '',
            },
          },
          ...appointments,
        ]);
        setServiceName('');
        setStartTime('');
        setPrice('');
        setNotes('');
        setIsAddModalOpen(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2.5">
            <Calendar className="h-7 w-7 text-indigo-500" />
            <span>Service Appointments</span>
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Organize daily chair slots, consultations, and send 1-click WhatsApp reminders.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/25 hover:from-emerald-700 hover:to-emerald-800 active:scale-98 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Appointment Cards */}
      <div className="space-y-3">
        {appointments.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300/80 bg-white/60 p-12 text-center dark:border-slate-800 dark:bg-slate-900/60">
            <Calendar className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-3" />
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              No appointments booked yet
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Add a customer appointment to organize your daily schedule.
            </p>
          </div>
        ) : (
          appointments.map((apt) => {
            const dateObj = new Date(apt.startTime);
            const dateStr = dateObj.toLocaleDateString('en-IN', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });
            const timeStr = dateObj.toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={apt.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-2xs dark:border-slate-800/80 dark:bg-slate-900"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-mono">
                        <Clock className="h-3.5 w-3.5 text-indigo-500" />
                        <span>{dateStr} at {timeStr}</span>
                      </span>
                      <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                        {apt.status}
                      </span>
                      {apt.price > 0 && (
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 tabular-nums border border-emerald-200/60 dark:border-emerald-800/60">
                          {formatINR(apt.price)}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                      {apt.serviceName}
                    </h4>

                    <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-slate-200">
                        {apt.customer.name}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-slate-500">
                        {formatIndianPhoneDisplay(apt.customer.phone)}
                      </span>
                    </div>

                    {apt.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 mt-1">
                        "{apt.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveWhatsAppCustomer({
                          id: apt.customer.id,
                          name: apt.customer.name,
                          phone: apt.customer.phone,
                          initialContext: {
                            appointmentDate: dateStr,
                            appointmentTime: timeStr,
                            serviceName: apt.serviceName,
                          },
                        })
                      }
                      className="flex items-center gap-1.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] px-3.5 py-2 text-xs font-bold text-white shadow-sm shadow-[#25D366]/25 active:scale-95 transition-all"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>WhatsApp Reminder</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Book Appointment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateAppointment}
            className="w-full max-w-md rounded-2xl bg-white p-5 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-50">
                Book Service Appointment
              </h4>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                Select Customer *
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
              >
                {customerOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({formatIndianPhoneDisplay(c.phone)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                Service Name *
              </label>
              <input
                type="text"
                required
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="e.g. Haircut & Beard Grooming"
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                  Price (₹)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="500"
                  className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                Notes / Stylist Request
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Requested senior barber Amit"
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
              >
                {submitting ? 'Booking...' : 'Book Slot'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* WhatsApp Modal */}
      {activeWhatsAppCustomer && (
        <WhatsAppModal
          isOpen={true}
          onClose={() => setActiveWhatsAppCustomer(null)}
          customer={activeWhatsAppCustomer}
          templates={templates}
          businessName={businessName}
          ownerPhone={ownerPhone}
          initialContext={activeWhatsAppCustomer.initialContext}
        />
      )}
    </div>
  );
}
