/**
 * Normalizes Indian phone numbers to standard 10 digits
 * Handles "+91", "91", leading "0", hyphens, spaces, parentheses
 * Example: "+91 98221-98765" -> "9822198765"
 * Returns null if invalid 10-digit Indian mobile number
 */
export function normalizeIndianPhone(input: string | null | undefined): string | null {
  if (!input) return null;
  const digits = input.replace(/\D/g, '');

  // 10 digits starting with 6, 7, 8, 9
  if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) {
    return digits;
  }

  // 11 digits starting with 0
  if (digits.length === 11 && digits.startsWith('0')) {
    const sliced = digits.slice(1);
    if (/^[6-9]\d{9}$/.test(sliced)) return sliced;
  }

  // 12 digits starting with 91
  if (digits.length === 12 && digits.startsWith('91')) {
    const sliced = digits.slice(2);
    if (/^[6-9]\d{9}$/.test(sliced)) return sliced;
  }

  return null;
}

/**
 * Pretty prints 10-digit Indian phone as "+91 98221 98765"
 */
export function formatIndianPhoneDisplay(tenDigits: string | null | undefined): string {
  if (!tenDigits) return '';
  const clean = tenDigits.replace(/\D/g, '');
  if (clean.length === 10) {
    return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
  }
  return tenDigits;
}

/**
 * Formats INR currency e.g. 14500 -> "₹14,500"
 */
export function formatINR(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return '₹0';
  const num = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
  if (isNaN(num)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}
