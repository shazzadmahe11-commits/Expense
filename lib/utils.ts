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
    timeZone: 'UTC',
  }).format(new Date(date));
}

// Parses a "YYYY-MM-DD" input (from a <input type="date">) into the UTC
// midnight instant for that calendar date. This runs in the API route on
// the server (not the browser) — Vercel's serverless functions run in UTC,
// so treating the string as UTC (rather than "server-local", which is the
// same thing here, but explicit) guarantees "2026-08-13" is always stored
// as exactly 2026-08-13T00:00:00.000Z, regardless of server config. Paired
// with formatDate()'s `timeZone: 'UTC'`, the calendar date a user picks is
// the exact same date they'll see displayed back, no matter their own
// timezone — the value is treated as a pure calendar date, never shifted.
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

// Today's date as "YYYY-MM-DD" in the *local* timezone, for pre-filling a
// date input. `new Date().toISOString()` would use UTC instead, which can
// show tomorrow's date in the evening for timezones behind UTC.
export function todayLocalISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getMonthRange(year: number, month: number) {
  const start = new Date(Date.UTC(year, month, 1));
  const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
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
