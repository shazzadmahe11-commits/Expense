export function formatCAD(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatMonth(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-CA', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

// Parses a "YYYY-MM-DD" input (from a <input type="date">) as local midnight
// instead of UTC midnight. `new Date("2026-08-01")` is parsed as UTC, which
// shifts to the previous day in timezones behind UTC (e.g. an expense added
// on the 1st can silently land in July and vanish from the August view).
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function getMonthRange(year: number, month: number) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

export const CARD_COLORS = [
  '#2563eb', '#dc2626', '#16a34a', '#9333ea',
  '#d97706', '#0891b2', '#be185d', '#475569',
];

export const CATEGORY_COLORS = [
  '#f59e0b', '#10b981', '#3b82f6', '#f97316',
  '#8b5cf6', '#ec4899', '#ef4444', '#06b6d4',
  '#6366f1', '#14b8a6', '#22c55e', '#94a3b8',
];

export const BROKERS = [
  'Wealthsimple', 'Questrade', 'TD Direct Investing', 'RBC Direct Investing',
  "CIBC Investor's Edge", 'Scotia iTRADE', 'BMO InvestorLine',
  'National Bank Direct Brokerage', 'Interactive Brokers', 'Other',
];
