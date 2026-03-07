export interface BusinessProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  taxId: string;
  website: string;
  currency: string;
  taxRate: number;
  invoicePrefix: string;
  nextInvoiceNumber: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  notes: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  createdAt: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'partial';

export interface InvoiceItem {
  id: string;
  productId?: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Payment {
  id: string;
  amount: number;
  method: string;
  date: string;
  notes: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  payments: Payment[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  notes: string;
  dueDate: string;
  issueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  notes: string;
  createdAt: string;
}

export const EXPENSE_CATEGORIES = [
  'Office Supplies',
  'Travel',
  'Meals',
  'Software',
  'Hardware',
  'Marketing',
  'Insurance',
  'Utilities',
  'Rent',
  'Professional Services',
  'Other',
] as const;

export const PAYMENT_METHODS = [
  'Cash',
  'Bank Transfer',
  'Credit Card',
  'PayPal',
  'Check',
  'Other',
] as const;

export const PRODUCT_UNITS = [
  'Unit',
  'Hour',
  'Day',
  'Week',
  'Month',
  'Project',
  'Piece',
  'kg',
  'lb',
] as const;

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '\u20AC', name: 'Euro' },
  { code: 'GBP', symbol: '\u00A3', name: 'British Pound' },
  { code: 'INR', symbol: '\u20B9', name: 'Indian Rupee' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '\u00A5', name: 'Japanese Yen' },
] as const;
