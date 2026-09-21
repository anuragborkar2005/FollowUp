declare module 'razorpay' {
  export default class Razorpay {
    constructor(options: { key_id: string; key_secret: string });
    orders: {
      create(options: {
        amount: number;
        currency: string;
        receipt?: string;
        notes?: Record<string, string>;
      }): Promise<any>;
      fetch(orderId: string): Promise<any>;
    };
    payments: {
      fetch(paymentId: string): Promise<any>;
      capture(paymentId: string, amount: number, currency: string): Promise<any>;
    };
    subscriptions: {
      create(options: any): Promise<any>;
      fetch(subId: string): Promise<any>;
    };
  }
}

interface Window {
  Razorpay?: any;
}
