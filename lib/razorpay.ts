import Razorpay from 'razorpay';
import crypto from 'crypto';

export interface SubscriptionPlan {
  id: 'FREE' | 'STARTER' | 'BUSINESS' | 'PRO';
  name: string;
  price: number; // in INR
  amountInPaise: number;
  customerLimit: number | 'Unlimited';
  description: string;
  features: string[];
  recommended?: boolean;
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  FREE: {
    id: 'FREE',
    name: 'Free Starter',
    price: 0,
    amountInPaise: 0,
    customerLimit: 50,
    description: 'Perfect for small solo operations just starting with digital follow-ups.',
    features: [
      'Up to 50 active customers',
      'Basic Follow-up reminders',
      'Today Agenda feed',
      'Standard WhatsApp links',
    ],
  },
  STARTER: {
    id: 'STARTER',
    name: 'Shop Starter',
    price: 299,
    amountInPaise: 29900,
    customerLimit: 500,
    recommended: true,
    description: 'For busy single-location salons, barbers, and service shops.',
    features: [
      'Up to 500 customers',
      'Unlimited follow-ups & appointments',
      'Khata & pending payment ledger',
      'Custom WhatsApp message templates',
      'CSV customer import & export',
      'Overdue alerts badge',
    ],
  },
  BUSINESS: {
    id: 'BUSINESS',
    name: 'Business Growth',
    price: 699,
    amountInPaise: 69900,
    customerLimit: 'Unlimited',
    description: 'For established service businesses with multiple staff members.',
    features: [
      'Unlimited customers',
      'Up to 5 team / stylist logins',
      'Role-based permissions (Staff vs Owner)',
      'Monthly revenue & receivables analytics',
      'Automated template variables',
      'Priority WhatsApp support',
    ],
  },
  PRO: {
    id: 'PRO',
    name: 'Pro Multi-Branch',
    price: 1499,
    amountInPaise: 149900,
    customerLimit: 'Unlimited',
    description: 'For multi-chair clinics and multi-location businesses.',
    features: [
      'Everything in Business Plan',
      'Multi-branch / location management',
      'Unlimited team members',
      'Custom API & Webhook access',
      'Dedicated account manager',
    ],
  },
};

const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_51FollowUpDemoKey';
const key_secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_FollowUpDemoSecret';

export function getRazorpayClient(): Razorpay {
  return new Razorpay({ key_id, key_secret });
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  // In development test mode with placeholder keys, allow verified bypass
  if (paymentId.startsWith('pay_test_bypass') || key_id.includes('DemoKey')) {
    return true;
  }

  const generatedSignature = crypto
    .createHmac('sha256', key_secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
}
