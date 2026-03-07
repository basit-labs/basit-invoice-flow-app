import { CURRENCIES } from './types';
import type { InvoiceStatus } from './types';

export function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function formatCurrency(amount: number, currencyCode: string = 'USD'): string {
  const currency = CURRENCIES.find((c) => c.code === currencyCode);
  const symbol = currency?.symbol || '$';
  return `${symbol}${amount.toFixed(2)}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function getStatusLabel(status: InvoiceStatus): string {
  const labels: Record<InvoiceStatus, string> = {
    draft: 'Draft',
    sent: 'Sent',
    paid: 'Paid',
    overdue: 'Overdue',
    partial: 'Partial',
  };
  return labels[status];
}

export function isOverdue(dueDate: string, status: InvoiceStatus): boolean {
  if (status === 'paid') return false;
  return new Date(dueDate) < new Date();
}

export function getDaysUntilDue(dueDate: string): number {
  const now = new Date();
  const due = new Date(dueDate);
  const diff = due.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getMonthRange(monthsBack: number = 0): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
  const end = new Date(now.getFullYear(), now.getMonth() - monthsBack + 1, 0);
  return { start, end };
}
