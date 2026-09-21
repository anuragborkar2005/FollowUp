import { normalizeIndianPhone } from './phone';

export interface TemplateParams {
  customer_name?: string;
  business_name?: string;
  appointment_date?: string;
  appointment_time?: string;
  service_name?: string;
  amount?: string;
  pending_amount?: string;
  owner_phone?: string;
}

/**
 * Replaces {{key}} variables safely in template body
 */
export function compileTemplate(templateBody: string, params: TemplateParams): string {
  return templateBody.replace(/{{\s*(\w+)\s*}}/g, (_, key: string) => {
    const value = params[key as keyof TemplateParams];
    return value !== undefined && value !== null ? String(value) : '';
  });
}

/**
 * Generates direct wa.me link with encoded message for WhatsApp app/web
 */
export function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = normalizeIndianPhone(phone);
  if (!cleanPhone) {
    throw new Error(`Invalid Indian phone number: "${phone}"`);
  }
  const encodedText = encodeURIComponent(message.trim());
  return `https://wa.me/91${cleanPhone}?text=${encodedText}`;
}
