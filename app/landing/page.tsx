import Link from 'next/link';
import {
  MessageSquare,
  CalendarClock,
  Calendar,
  IndianRupee,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Star,
  Users,
  Smartphone,
  Zap,
  Check,
  ChevronDown,
  Phone,
  Flame,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { SUBSCRIPTION_PLANS } from '@/lib/razorpay';
import { formatINR } from '@/lib/phone';

export interface LandingPageProps {
  isLoggedIn?: boolean;
}

export default function LandingPage({ isLoggedIn = false }: LandingPageProps) {
  const plans = Object.values(SUBSCRIPTION_PLANS);

  const faqs = [
    {
      q: 'Do I need a WhatsApp Business API account or Facebook verification?',
      a: 'No! FollowUp is built specifically for local service businesses without expensive Meta Cloud API fees. It uses native WhatsApp universal deep-linking, allowing you to send pre-filled personalized messages directly from your personal or business WhatsApp number in 1 tap for ₹0.',
    },
    {
      q: 'Will my messages come from my own phone number?',
      a: 'Yes, 100%. Because FollowUp opens WhatsApp directly on your phone or computer, the message is sent from your existing trusted mobile number. Your customers see your familiar face and name.',
    },
    {
      q: 'How does the Khata / pending payment tracker work?',
      a: 'When you complete a service (e.g., haircut, repair, tailoring), you record the bill amount and what the customer paid. Any unpaid balance automatically updates the customer’s ledger. You can tap "Send Payment Reminder" on WhatsApp anytime with your UPI ID.',
    },
    {
      q: 'Can my employees or stylists access the app?',
      a: 'Yes! On the Business Plan (₹699/mo), you can add up to 5 staff members with limited permissions so they can view daily appointments and complete follow-ups without seeing your full revenue analytics.',
    },
    {
      q: 'How long does setup take?',
      a: 'Under 2 minutes! Just sign up with your business name and city. You can start adding customers immediately or import a CSV contact list.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0b0f19] dark:text-slate-50 transition-colors duration-150">
      {/* Sticky Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 px-4 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/85 md:px-8">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-black text-xl shadow-md shadow-emerald-600/30">
              F
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-slate-50">
                FollowUp
              </span>
              <span className="ml-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                WhatsApp CRM
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              FAQ
            </a>
          </div>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            {isLoggedIn ? (
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-emerald-600/30 hover:from-emerald-700 hover:to-emerald-800 active:scale-95 transition-all"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:inline-flex rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-emerald-600/30 hover:from-emerald-700 hover:to-emerald-800 active:scale-95 transition-all"
                >
                  <span>Start Free</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6 lg:px-8">
        {/* Glow effect */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="relative mx-auto max-w-5xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/80 bg-emerald-50/80 px-3.5 py-1 text-xs font-extrabold text-emerald-900 dark:border-emerald-800/80 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Built for Indian Salons, Clinics, Repair Shops & Tailors 🇮🇳</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-slate-50 leading-tight sm:leading-tight">
            Never lose a customer because you{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              forgot to follow up.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
            Turn messy WhatsApp chats, lost paper diaries, and forgotten Khata dues into organized
            customers, timed follow-ups, and recorded payments — in one ultra-simple mobile dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-7 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg shadow-emerald-600/30 hover:from-emerald-700 hover:to-emerald-800 active:scale-98 transition-all"
            >
              <span>Start Free 14-Day Trial</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/api/auth/demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300/80 bg-white px-6 py-3.5 text-sm sm:text-base font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 shadow-2xs transition-colors"
            >
              <Sparkles className="h-4 w-4 text-emerald-500" />
              <span>Explore Live Demo (1-Click)</span>
            </Link>
          </div>

          <div className="pt-2 flex items-center justify-center gap-5 text-xs font-semibold text-slate-500 dark:text-slate-400 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-500" /> No Meta API costs
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-500" /> Uses your real phone number
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-500" /> Setup in under 2 mins
            </span>
          </div>
        </div>

        {/* Hero Interactive Mock Preview */}
        <div className="mx-auto max-w-4xl mt-12 rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-2xl dark:border-slate-800/80 dark:bg-slate-900/90">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500" />
              <span className="h-3 w-3 rounded-full bg-amber-500" />
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="ml-2 text-xs font-bold text-slate-400 font-mono">
                Rahul Men's Salon & Spa • Nagpur
              </span>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full">
              Live Agenda
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4">
            <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[11px] font-semibold text-slate-500 block">Total Customers</span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-slate-50">428</span>
            </div>
            <div className="rounded-2xl bg-amber-50/70 p-3 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 block">Due Follow-ups</span>
              <span className="text-xl font-extrabold text-amber-950 dark:text-amber-100">12 Pending</span>
            </div>
            <div className="rounded-2xl bg-indigo-50/70 p-3 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50">
              <span className="text-[11px] font-bold text-indigo-800 dark:text-indigo-300 block">Today's Bookings</span>
              <span className="text-xl font-extrabold text-indigo-950 dark:text-indigo-100">8 Slots</span>
            </div>
            <div className="rounded-2xl bg-rose-50/70 p-3 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
              <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 block">Pending Khata</span>
              <span className="text-xl font-extrabold text-rose-950 dark:text-rose-100">₹14,500</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white font-bold">
                <CalendarClock className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Amit Patil (Fade cut & beard trim)
                  </span>
                  <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                    Owes ₹500
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono">+91 98221 98765 • Due Today 10:30 AM</p>
              </div>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] px-3.5 py-2 text-xs font-bold text-white shadow-xs"
            >
              <MessageSquare className="h-4 w-4" />
              <span>1-Tap WhatsApp</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Problem vs Solution */}
      <section id="features" className="py-16 sm:py-20 bg-white dark:bg-slate-950 border-y border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              The Reality of Small Business Today
            </h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              Why paper notebooks and messy chats are costing you money
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* The Old Way */}
            <div className="rounded-3xl border border-rose-200/80 bg-rose-50/40 p-6 sm:p-8 dark:border-rose-950 dark:bg-rose-950/15 space-y-4">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-sm">
                <span className="rounded-full bg-rose-200/80 dark:bg-rose-900/60 px-2 py-0.5 text-xs">
                  The Old Way
                </span>
                <span>Paper diaries & 200 unread chats</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Customers ask for slots on WhatsApp, and you forget to confirm them.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>₹20,000+ in unpaid Khata scattered across scribbled diary pages.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Employees have zero context on customer preferences or VIP status.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Big enterprise CRMs cost ₹3,000/mo and are too complicated to use.</span>
                </li>
              </ul>
            </div>

            {/* The FollowUp Way */}
            <div className="rounded-3xl border border-emerald-200/80 bg-emerald-50/40 p-6 sm:p-8 dark:border-emerald-950 dark:bg-emerald-950/15 space-y-4">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                <span className="rounded-full bg-emerald-200/80 dark:bg-emerald-900/60 px-2 py-0.5 text-xs">
                  The FollowUp Way
                </span>
                <span>WhatsApp + Digital Notebook Simplicity</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                  <span>Chronological "Today's Agenda" alerts you before every promised call.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                  <span>1-Click pre-filled WhatsApp messages with customer name and appointment details.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                  <span>Automatic Khata ledger with 1-tap UPI payment reminder links.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                  <span>Affordable flat pricing starting at ₹299/mo with zero API fees.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Simple Workflow
            </h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              Up and running in 3 easy steps
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 font-extrabold text-base dark:bg-emerald-950 dark:text-emerald-300">
                1
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-50">
                Quick Contact Capture
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Add customers with their 10-digit phone number in 15 seconds, or bulk import your existing CSV contacts list.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 font-extrabold text-base dark:bg-amber-950 dark:text-amber-300">
                2
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-50">
                Set Reminder or Booking
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Schedule a follow-up for next Tuesday or book an appointment chair. The app tracks overdue tasks automatically.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-100 text-teal-800 font-extrabold text-base dark:bg-teal-950 dark:text-teal-300">
                3
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-50">
                1-Tap WhatsApp Message
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Tap [WhatsApp] on your phone. It launches WhatsApp with the customer's chat and a personalized message already drafted.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-20 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Pilot Merchant Reviews
            </h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              Trusted by local business owners
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900 shadow-2xs space-y-3">
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                "I used to lose ₹5,000 every month because customers promised to pay balance next time and I forgot. FollowUp helped me recover ₹8,500 in the first week itself!"
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                  Rahul Sharma
                </div>
                <div className="text-[11px] text-slate-500">Rahul Men's Salon, Nagpur</div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900 shadow-2xs space-y-3">
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                "No more lost diary pages or scribbled notes. When a bride inquires about hair styling, I set a follow-up in 10 seconds. Customers are amazed by our speed."
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                  Anjali Verma
                </div>
                <div className="text-[11px] text-slate-500">Anjali Boutique & Spa, Pune</div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900 shadow-2xs space-y-3">
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                "Best part is that it doesn't need complicated WhatsApp API approvals. It uses my existing phone number, so my customers always know it's really me."
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                  Rajesh Patel
                </div>
                <div className="text-[11px] text-slate-500">Om Auto Care & Repair, Ahmedabad</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Clear & Honest Pricing
            </h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              Simple monthly subscriptions in INR (₹)
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              No hidden fees, no per-message WhatsApp surcharges. Seamless Razorpay billing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {plans.map((p) => {
              const isRecommended = p.recommended;
              return (
                <div
                  key={p.id}
                  className={`relative flex flex-col justify-between rounded-3xl p-6 transition-all border ${
                    isRecommended
                      ? 'border-emerald-500 bg-white dark:bg-slate-900 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/20'
                      : 'border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900 shadow-2xs'
                  }`}
                >
                  {isRecommended && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-0.5 text-[10px] font-extrabold text-white shadow-xs uppercase tracking-wider">
                      Most Popular
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {p.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[34px]">
                      {p.description}
                    </p>

                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-50 tabular-nums">
                        {formatINR(p.price)}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">/mo</span>
                    </div>

                    <div className="mt-5 space-y-2.5 border-t border-slate-100 dark:border-slate-800 pt-5">
                      {p.features.map((f) => (
                        <div key={f} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                          <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Link
                      href="/signup"
                      className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all shadow-xs ${
                        isRecommended
                          ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-emerald-600/25 hover:from-emerald-700 hover:to-emerald-800 active:scale-98'
                          : 'border border-slate-300/80 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <span>Start 14-Day Trial</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 sm:py-20 bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Questions & Answers
            </h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 dark:border-slate-800/80 dark:bg-slate-900/60"
              >
                <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                  {faq.q}
                </h4>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-600 to-teal-800 text-white text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Ready to stop losing customers?
          </h2>
          <p className="text-base sm:text-lg text-emerald-100 max-w-xl mx-auto font-medium">
            Join local barbers, stylists, repair techs, and doctors across India saving hours each week with FollowUp.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-3.5 text-base font-bold text-emerald-800 shadow-xl hover:bg-emerald-50 active:scale-98 transition-all"
            >
              <span>Create Free Account</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/80 bg-emerald-700/50 px-7 py-3.5 text-base font-bold text-white hover:bg-emerald-700/80 transition-colors"
            >
              <span>Explore Demo</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-8 px-4 dark:border-slate-800 dark:bg-slate-950 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs">
              F
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200">FollowUp</span>
            <span>— WhatsApp Mini-CRM for Indian Small Businesses</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-slate-900 dark:hover:text-slate-100">
              Sign In
            </Link>
            <Link href="/pricing" className="hover:text-slate-900 dark:hover:text-slate-100">
              Pricing
            </Link>
            <Link href="/" className="hover:text-slate-900 dark:hover:text-slate-100">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
