import { PrismaClient, Role, CustomerStatus, Priority, FollowupStatus, AppointmentStatus, PaymentStatus, PaymentMethod, SubscriptionTier, SubscriptionStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo database for FollowUp...');

  // Clean existing demo data if any
  await prisma.activityLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.followup.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.messageTemplate.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Demo User
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      name: 'Rahul Sharma',
      email: 'rahul@salon.com',
      passwordHash,
      phone: '9823012345',
    },
  });

  // 2. Create Organization
  const org = await prisma.organization.create({
    data: {
      name: "Rahul Men's Salon & Spa",
      slug: 'rahul-salon-nagpur',
      category: 'Salon & Grooming',
      phone: '9823012345',
      city: 'Nagpur',
    },
  });

  // 3. Link Membership
  await prisma.organizationMember.create({
    data: {
      organizationId: org.id,
      userId: user.id,
      role: Role.OWNER,
    },
  });

  // 4. Create Active Subscription
  await prisma.subscription.create({
    data: {
      organizationId: org.id,
      tier: SubscriptionTier.STARTER,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // 5. Create Default Message Templates
  await prisma.messageTemplate.createMany({
    data: [
      {
        organizationId: org.id,
        title: 'Appointment Reminder',
        category: 'REMINDER',
        body: 'Namaste {{customer_name}} ji! This is a reminder from {{business_name}} regarding your appointment for {{service_name}} on {{appointment_date}} at {{appointment_time}}. Please reply YES to confirm. Dhanyawad!',
        isDefault: true,
      },
      {
        organizationId: org.id,
        title: 'Khata / Payment Due Reminder',
        category: 'KHATA',
        body: 'Namaste {{customer_name}} ji, a gentle reminder from {{business_name}}: pending balance of ₹{{pending_amount}} is due. You can easily pay via UPI to {{owner_phone}}. Thank you for your support!',
        isDefault: true,
      },
      {
        organizationId: org.id,
        title: 'Re-engagement Follow-up',
        category: 'FOLLOWUP',
        body: 'Hello {{customer_name}}! It has been 3 weeks since your last haircut at {{business_name}}. Time for a fresh trim? Reply here to pick your preferred slot today!',
        isDefault: true,
      },
      {
        organizationId: org.id,
        title: 'Thank You & Review',
        category: 'PROMO',
        body: 'Thank you for visiting {{business_name}} today, {{customer_name}}! We hope you loved your look. If you enjoyed the service, please tell your friends and visit again soon!',
        isDefault: false,
      },
    ],
  });

  // 6. Create Realistic Sample Customers
  const customer1 = await prisma.customer.create({
    data: {
      organizationId: org.id,
      name: 'Amit Patil',
      phone: '9822198765',
      status: CustomerStatus.ACTIVE,
      notes: 'Prefers fade haircut and beard oil treatment. Visits every 2 weeks.',
      tags: ['Regular', 'VIP'],
      totalSpent: 3500.0,
      pendingBalance: 500.0,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      organizationId: org.id,
      name: 'Vikram Deshmukh',
      phone: '9890123456',
      status: CustomerStatus.BOOKED,
      notes: 'Booked wedding groom package for next Saturday.',
      tags: ['Groom Package', 'High Value'],
      totalSpent: 4500.0,
      pendingBalance: 1200.0,
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      organizationId: org.id,
      name: 'Priya Joshi',
      phone: '9422876543',
      status: CustomerStatus.FOLLOW_UP,
      notes: 'Inquired about Keratin hair treatment. Call back today at 11 AM.',
      tags: ['Inquiry'],
      totalSpent: 800.0,
      pendingBalance: 0.0,
    },
  });

  const customer4 = await prisma.customer.create({
    data: {
      organizationId: org.id,
      name: 'Suresh Verma',
      phone: '9765432109',
      status: CustomerStatus.COMPLETED,
      notes: 'Visited yesterday for haircut. Paid fully via UPI.',
      tags: ['Regular'],
      totalSpent: 1200.0,
      pendingBalance: 0.0,
    },
  });

  // 7. Create Follow-ups
  const now = new Date();
  await prisma.followup.createMany({
    data: [
      {
        organizationId: org.id,
        customerId: customer3.id,
        assignedToId: user.id,
        title: 'Keratin Treatment Consultation Call',
        notes: 'Explain pricing: ₹2,999 package including shampoo and serum.',
        dueDate: new Date(now.getTime() + 2 * 60 * 60 * 1000), // in 2 hours
        priority: Priority.HIGH,
        status: FollowupStatus.PENDING,
      },
      {
        organizationId: org.id,
        customerId: customer1.id,
        assignedToId: user.id,
        title: 'Payment Khata Follow-up for Balance ₹500',
        notes: 'Pending from last Saturday haircut + head massage bill.',
        dueDate: new Date(now.getTime() + 4 * 60 * 60 * 1000), // in 4 hours
        priority: Priority.URGENT,
        status: FollowupStatus.PENDING,
      },
      {
        organizationId: org.id,
        customerId: customer2.id,
        assignedToId: user.id,
        title: 'Confirm Groom Package Slot & Advance Payment',
        notes: 'Ask for 50% advance for the Saturday appointment.',
        dueDate: new Date(now.getTime() + 24 * 60 * 60 * 1000), // tomorrow
        priority: Priority.MEDIUM,
        status: FollowupStatus.PENDING,
      },
    ],
  });

  // 8. Create Appointments
  await prisma.appointment.createMany({
    data: [
      {
        organizationId: org.id,
        customerId: customer1.id,
        assignedToId: user.id,
        serviceName: 'Fade Cut & Beard Styling',
        startTime: new Date(now.getTime() + 3 * 60 * 60 * 1000),
        price: 500.0,
        status: AppointmentStatus.SCHEDULED,
      },
      {
        organizationId: org.id,
        customerId: customer2.id,
        assignedToId: user.id,
        serviceName: 'Pre-Grooming Facial & Spa',
        startTime: new Date(now.getTime() + 6 * 60 * 60 * 1000),
        price: 1500.0,
        status: AppointmentStatus.CONFIRMED,
      },
    ],
  });

  // 9. Create Payments
  await prisma.payment.createMany({
    data: [
      {
        organizationId: org.id,
        customerId: customer1.id,
        invoiceNumber: 'INV-101',
        totalAmount: 1000.0,
        paidAmount: 500.0,
        pendingAmount: 500.0,
        status: PaymentStatus.PARTIALLY_PAID,
        paymentMethod: PaymentMethod.UPI,
        notes: 'Paid ₹500 via GPay, ₹500 promised on next visit',
      },
      {
        organizationId: org.id,
        customerId: customer4.id,
        invoiceNumber: 'INV-102',
        totalAmount: 400.0,
        paidAmount: 400.0,
        pendingAmount: 0.0,
        status: PaymentStatus.PAID,
        paymentMethod: PaymentMethod.CASH,
        notes: 'Haircut completed, full cash payment received',
      },
    ],
  });

  // 10. Activity Logs
  await prisma.activityLog.createMany({
    data: [
      {
        organizationId: org.id,
        customerId: customer1.id,
        actionType: 'PAYMENT_RECEIVED',
        description: 'Received partial payment of ₹500 via UPI (GPay)',
      },
      {
        organizationId: org.id,
        customerId: customer1.id,
        actionType: 'FOLLOWUP_SET',
        description: 'Scheduled follow-up for pending ₹500',
      },
      {
        organizationId: org.id,
        customerId: customer3.id,
        actionType: 'CREATED',
        description: 'Customer added via WhatsApp inquiry',
      },
    ],
  });

  console.log('Database seeded successfully with Demo Salon in Nagpur!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
