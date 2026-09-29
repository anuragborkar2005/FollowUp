# FollowUp — WhatsApp Mini-CRM for Local Service Businesses

> **"As simple as WhatsApp, as organized as a notebook."**  
> A mobile-first, zero-friction Mini-CRM built for Indian local service businesses (salons, barbers, repair shops, clinics, tailors, tutors) to capture leads, schedule appointments, track pending payments (Khata/Udhar), and trigger personalized WhatsApp follow-ups in 1 tap — without expensive Meta API setup.

---

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.4-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Ready-0C2340?style=flat&logo=razorpay)](https://razorpay.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=flat&logo=pwa)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📌 Table of Contents

- [The Problem & The Solution](#the-problem--the-solution)
- [Core Features](#core-features)
- [How It Works: The "Golden Loop"](#how-it-works-the-golden-loop)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation & Setup](#installation--setup)
  - [Database Migration & Seeding](#database-migration--seeding)
  - [Running the App](#running-the-app)
- [1-Click Live Demo Mode](#1-click-live-demo-mode)
- [Zero-API WhatsApp Engine](#zero-api-whatsapp-engine)
- [Khata (Udhar) & Payment Tracking](#khata-udhar--payment-tracking)
- [Database Schema & Models](#database-schema--models)
- [Subscription Tiers & Monetization](#subscription-tiers--monetization)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## 💡 The Problem & The Solution

### The Reality for Indian Local Businesses
India has over 60 million micro and small service businesses running their operations on fragmented tools:
- **Paper diaries & pocket registers**: Hard to search, easily misplaced, zero reminders.
- **WhatsApp chat list**: Leads get buried under hundreds of personal and promotional messages.
- **Lost repeat business**: 40–60% of potential repeat visits are lost simply because the owner forgets to follow up 2–4 weeks later.
- **Uncollected Udhar (Khata)**: Disorganized UPI screenshots and mental accounting lead to thousands in uncollected revenue.
- **Bloated enterprise CRMs**: Salesforce, HubSpot, and Zoho are desktop-centric, cost-prohibitive, and overwhelmingly complex for a local shop owner.

### The FollowUp Solution
FollowUp bridges the gap with a **mobile-first PWA**:
1. **Under 3-tap data entry**: Add a customer and schedule a follow-up in seconds.
2. **Zero-API WhatsApp deep links**: Launch pre-filled, personalized WhatsApp chats directly from your phone — no Meta Cloud API approvals, no per-conversation fees, and zero tech hurdles.
3. **Daily Agenda Feed**: Morning scan showing exactly who to contact, who has an appointment, and whose balance is overdue.
4. **Built-in Khata Ledger**: Track total billed, amount paid, and outstanding balances with instant 1-tap UPI payment reminder links.

---

## ⚡ Core Features

| Feature | Description |
| :--- | :--- |
| **Zero-API 1-Tap WhatsApp Actions** | Generate universal `wa.me` links with dynamic message variable interpolation (`{{customer_name}}`, `{{pending_amount}}`, etc.) and Indian phone normalization. |
| **Follow-Up Engine & Agenda** | Schedule reminders with priority tiers (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), due dates, status progression (`PENDING`, `COMPLETED`, `RESCHEDULED`, `CANCELLED`), and overdue alerts. |
| **Khata & Udhar Ledger** | Log customer payments, calculate lifetime spend and pending receivables, and send 1-click UPI payment reminders. |
| **Appointment Scheduler** | Calendar and list views for customer appointments with service tags, assigned staff, pricing, and status tracking. |
| **Customer 360 Profile** | Complete chronological timeline of notes, appointments, follow-ups, transactions, and tags per customer. |
| **CSV Bulk Import / Export** | RFC 4180 compliant CSV importer with automatic header detection and Indian mobile number validation. |
| **Multi-Tenant Architecture** | Strict database-level isolation per business organization with role-based access control (`OWNER`, `ADMIN`, `STAFF`). |
| **Razorpay Billing** | Integrated Razorpay subscription checkout with 4 pricing tiers, webhook verification, and automated customer limits. |
| **Mobile PWA & Theme Switcher** | Progressive Web App with install prompt banner, bottom navigation bar, and persistent dark/light theme. |

---

## 🔄 How It Works: The "Golden Loop"

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer
    actor Owner as Shop Owner
    participant CRM as FollowUp Web App
    participant WA as WhatsApp App

    Customer->>Owner: Walk-in / Call / Chat: "Haircut package booking"
    Owner->>CRM: Quick Add: Name, Phone (+91), Tag: "Haircut Package"
    CRM-->>Owner: Saved! Auto-suggests follow-up for 3 weeks later
    Note over CRM: Follow-up becomes due on Today's Agenda
    CRM-->>Owner: Dashboard Alert: "1 Follow-up due with Rahul"
    Owner->>CRM: Taps [WhatsApp] button on Agenda card
    CRM->>WA: Opens wa.me/9198XXXXXXXX?text=Pre-filled+Personalized+Message
    WA-->>Customer: Sends message from Owner's personal/business WhatsApp
    Customer->>Owner: Customer confirms appointment
    Owner->>CRM: Updates status to "Booked" & logs ₹500 payment
    CRM-->>Owner: Updates Dashboard Revenue & Khata Ledger
```

---

## 🛠 Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **ORM**: [Prisma 6.4](https://www.prisma.io/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (Compatible with Neon, Supabase, AWS RDS, Docker)
- **Authentication**: JWT session cookies with [jose](https://github.com/panva/jose) and [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Validation**: [Zod 4](https://zod.dev/)
- **Payments**: [Razorpay Node SDK](https://razorpay.com/docs/api/) (Subscriptions & Webhooks)
- **Package Manager / Runtime**: [Bun](https://bun.sh/) (or Node.js 20+ with npm / pnpm)

---

## 📂 Repository Structure

```text
follow-up/
├── app/
│   ├── (auth)/                # Authentication routes (login, signup)
│   ├── api/                   # Route handlers
│   │   ├── appointments/      # Appointment CRUD API
│   │   ├── auth/              # Login, signup, logout & 1-click demo login
│   │   ├── customers/         # Customer CRUD, timeline notes & CSV import
│   │   ├── followups/         # Follow-up scheduler & status update API
│   │   ├── payments/          # Payment recording & Khata calculation API
│   │   ├── subscription/      # Razorpay order creation & payment verification
│   │   └── webhooks/          # Razorpay webhook listener
│   ├── appointments/          # Appointment schedule views
│   ├── customers/             # Customer list, new customer modal & 360 profile
│   ├── followups/             # Follow-up manager & daily agenda feed
│   ├── landing/               # High-converting marketing landing page
│   ├── payments/              # Khata & pending dues ledger
│   ├── pricing/               # Subscription plans & upgrade modal
│   ├── templates/             # WhatsApp message template manager
│   ├── layout.tsx             # Root layout with ThemeProvider and AppShell
│   └── page.tsx               # Main Dashboard with KPI metrics & Today's Agenda
├── components/
│   ├── appointments/          # Appointments calendar & booking client
│   ├── billing/               # Pricing tables & Razorpay checkout buttons
│   ├── customers/             # Customer directory, 360 profile & CSV modal
│   ├── dashboard/             # Dashboard KPI cards & daily agenda feed
│   ├── followups/             # Follow-up cards, filters & completion dialogs
│   ├── layout/                # AppShell, Navbar, Sidebar & Mobile BottomNav
│   ├── payments/              # Khata ledger, payment recording & UPI modals
│   ├── pwa/                   # PWA Install Prompt Banner
│   ├── templates/             # WhatsApp template editor & category filters
│   ├── theme/                 # ThemeProvider & ThemeToggle (dark/light)
│   └── whatsapp/              # WhatsApp preview & 1-tap deep link modal
├── lib/
│   ├── auth.ts                # Server-side auth helpers & route guards
│   ├── csv.ts                 # RFC 4180 CSV parser & column auto-detector
│   ├── phone.ts               # Indian phone number normalizer (+91 / 10 digits)
│   ├── prisma.ts              # Prisma client singleton
│   ├── razorpay.ts            # Razorpay SDK client & subscription plans config
│   ├── session.ts             # JWT session cookies creation & verification
│   └── whatsapp.ts            # Template compiler & wa.me deep link generator
├── prisma/
│   ├── schema.prisma          # PostgreSQL schema (10 models, enums & relations)
│   └── seed.ts                # Realistic demo dataset for Indian service shops
├── public/
│   ├── icon.svg               # App icon & favicon
│   └── manifest.json          # PWA web app manifest
├── PRD.md                     # Comprehensive Product Requirements Document
├── .env.example               # Environment variables template
└── package.json               # Project dependencies and scripts
```

---

## 🚀 Getting Started

### Prerequisites

- **Bun** (recommended, v1.2+) or **Node.js** (v20+)
- **PostgreSQL** instance (local, Docker, or hosted like Neon / Supabase)

### Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure your environment variables:

| Variable | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/followup?schema=public` |
| `NEXT_PUBLIC_APP_NAME` | No | Display name of the application | `FollowUp` |
| `NEXT_PUBLIC_APP_URL` | Yes | Base URL for links and webhooks | `http://localhost:3000` |
| `SESSION_SECRET` | Yes | 32+ character key for JWT cookie signing | `your-secure-32-char-random-secret-key-here` |
| `RAZORPAY_KEY_ID` | Yes | Razorpay API Key ID (test or live) | `rzp_test_your_key_id` |
| `RAZORPAY_KEY_SECRET` | Yes | Razorpay API Key Secret | `your_razorpay_secret` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID`| Yes | Public Razorpay Key ID for client-side checkout | `rzp_test_your_key_id` |

> **Note for Development**: If you do not have Razorpay test keys yet, the app includes a dev bypass mode that allows testing plan selections and checkout UI without failing.

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/anuragborkar2005/FollowUp.git
   cd FollowUp
   ```

2. **Install dependencies:**
   ```bash
   bun install
   # or: npm install
   ```

### Database Migration & Seeding

1. **Push Prisma schema to your database:**
   ```bash
   bunx prisma db push
   # or: npx prisma db push
   ```

2. **Seed demo data:**
   Populates a complete demo business (*Rahul Men's Salon & Spa, Nagpur*) with realistic Indian customer records, pending payments, follow-ups, appointments, and templates:
   ```bash
   bun run prisma/seed.ts
   # or: npx tsx prisma/seed.ts
   ```

### Running the App

Start the development server:

```bash
bun dev
# or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎯 1-Click Live Demo Mode

Want to explore the app immediately without manual registration? FollowUp includes a pre-configured **Live Demo login**:

1. Open [http://localhost:3000/login](http://localhost:3000/login) and click **"Try Live Demo Account"**, or visit:
   ```text
   http://localhost:3000/api/auth/demo
   ```
2. **Demo Credentials**:
   - **Email:** `rahul@salon.com`
   - **Password:** `password123`
   - **Organization:** Rahul Men's Salon & Spa (Nagpur)
   - **Pre-populated data:** 5 customers with pending Khata balances, 4 follow-ups (including overdue), scheduled appointments, and Hindi/English WhatsApp templates.

---

## 📲 Zero-API WhatsApp Engine

### Why Zero-API?
Setting up the official Meta WhatsApp Business Cloud API requires Facebook Business Verification, credit cards, per-template approvals, webhook hosting, and per-conversation fees (~₹0.50–₹0.80 per conversation in India).

FollowUp bypasses these hurdles using **Universal `wa.me` Deep Linking**:
- Works instantly from any device (Android, iOS, iPadOS, Mac, Windows).
- Messages send directly from the business owner's **existing personal or business WhatsApp number**.
- Zero API bills or approval delays.

### Supported Template Variables
Templates are compiled on-the-fly using `compileTemplate()`:

| Variable | Description | Example Replacement |
| :--- | :--- | :--- |
| `{{customer_name}}` | Customer's full name | `Amit Sharma` |
| `{{business_name}}` | Organization name | `Rahul Men's Salon` |
| `{{service_name}}` | Scheduled service name | `Hair Spa & Beard Trim` |
| `{{appointment_date}}` | Formatted appointment date | `Oct 15, 2026` |
| `{{appointment_time}}` | Formatted appointment time | `4:30 PM` |
| `{{pending_amount}}` | Outstanding Khata balance | `₹650` |
| `{{owner_phone}}` | Business contact phone / UPI ID | `9823012345` |

### Indian Mobile Number Normalization
`lib/phone.ts` handles common Indian phone number formats seamlessly:
- Strips `+91`, `91`, leading `0`, spaces, dashes, and parentheses.
- Verifies standard 10-digit format starting with `6`, `7`, `8`, or `9`.
- Automatically formats for display: `+91 98230 12345`.
- Generates compliant deep links: `https://wa.me/919823012345?text=...`.

---

## 💰 Khata (Udhar) & Payment Tracking

In local Indian service markets, regular customers frequently pay via partial cash, promise to send UPI later, or clear bills at the end of the month.

FollowUp provides a dedicated **Khata Ledger**:
- **Automatic Balance Calculation**: Tracks `totalSpent` and `pendingBalance` per customer across all transactions.
- **Payment Modes**: Supports `UPI`, `CASH`, `CARD`, `NETBANKING`, and `OTHER`.
- **1-Click UPI Payment Reminder**: Launches a pre-filled WhatsApp message with the exact outstanding amount and the shop's UPI handle.

---

## 🗄 Database Schema & Models

FollowUp uses PostgreSQL with Prisma ORM. Key models include:

| Model | Purpose |
| :--- | :--- |
| `Organization` | Tenant entity representing the business (salon, clinic, workshop) with custom slug and category. |
| `User` | Authenticated system user with name, email, phone, and hashed password. |
| `OrganizationMember` | Membership table linking users to organizations with roles (`OWNER`, `ADMIN`, `STAFF`). |
| `Customer` | Client records with unique `[organizationId, phone]`, total spent, pending balance, and tags. |
| `Followup` | Scheduled follow-up reminders with priority, due date, assigned staff, and completion status. |
| `Appointment` | Service booking calendar entries with pricing, service name, and time slots. |
| `Payment` | Ledger entries recording total amount, paid amount, pending balance, and payment method. |
| `MessageTemplate` | Reusable WhatsApp message templates categorized by `REMINDER`, `KHATA`, `FOLLOWUP`, `PROMO`. |
| `ActivityLog` | Chronological audit and interaction log for Customer 360 view. |
| `Subscription` | Organization billing state, tier (`FREE`, `STARTER`, `BUSINESS`, `PRO`), and Razorpay IDs. |

---

## 💳 Subscription Tiers & Monetization

FollowUp includes built-in subscription management via Razorpay:

| Plan | Price (INR) | Customer Limit | Staff Accounts | Key Capabilities |
| :--- | :---: | :---: | :---: | :--- |
| **Free Starter** | ₹0 | 50 | 1 (Owner) | Basic follow-ups, Today's agenda, Standard WhatsApp links |
| **Shop Starter** *(Most Popular)* | **₹299** / mo | 500 | 1 (Owner) | Unlimited follow-ups, Full Khata ledger, Custom templates, CSV import/export, Overdue alerts |
| **Business Growth** | **₹699** / mo | Unlimited | Up to 5 | Team logins, Staff role permissions, Revenue & receivables analytics, Priority support |
| **Pro Multi-Branch** | **₹1,499** / mo | Unlimited | Unlimited | Multi-branch management, Custom API & Webhooks, Dedicated account manager |

---

## 🚢 Deployment

### Deploy to Vercel + Managed PostgreSQL

1. **Database Setup**:
   Create a managed PostgreSQL database on [Neon](https://neon.tech/), [Supabase](https://supabase.com/), or [Railway](https://railway.app/).

2. **Deploy via Vercel CLI or Git**:
   Connect your GitHub repository to Vercel.

3. **Configure Environment Variables in Vercel**:
   Add `DATABASE_URL`, `SESSION_SECRET`, `NEXT_PUBLIC_APP_URL`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `NEXT_PUBLIC_RAZORPAY_KEY_ID`.

4. **Build Settings**:
   The `package.json` build script automatically runs Prisma generation before compilation:
   ```json
   "build": "prisma generate && next build"
   ```

5. **Run Migrations on Production Database**:
   ```bash
   bunx prisma db push
   ```

---

## 🗺 Roadmap

- [x] **v1.0 MVP**: Multi-tenant CRM, Customer 360, Follow-up scheduler, Khata ledger, Zero-API WhatsApp engine, Razorpay checkout, PWA install prompt.
- [ ] **v1.1**: Direct SMS fallback via MSG91 / Fast2SMS for customers without active WhatsApp.
- [ ] **v1.2**: Automated daily morning digest to shop owner via WhatsApp.
- [ ] **v1.3**: Hindi / Marathi / Hinglish multi-language UI localization.
- [ ] **v2.0**: Optional Meta WhatsApp Cloud API integration for automated background reminders.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'feat: add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

*Made with ❤️ for Indian local service entrepreneurs.*
