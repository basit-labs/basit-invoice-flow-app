import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  BusinessProfile,
  Client,
  Product,
  Invoice,
  Expense,
} from './types';

const KEYS = {
  BUSINESS_PROFILE: '@invoiceflow_business',
  CLIENTS: '@invoiceflow_clients',
  PRODUCTS: '@invoiceflow_products',
  INVOICES: '@invoiceflow_invoices',
  EXPENSES: '@invoiceflow_expenses',
};

const DEFAULT_BUSINESS: BusinessProfile = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  country: '',
  taxId: '',
  website: '',
  currency: 'USD',
  taxRate: 0,
  invoicePrefix: 'INV',
  nextInvoiceNumber: 1001,
};

async function getItem<T>(key: string, fallback: T): Promise<T> {
  const data = await AsyncStorage.getItem(key);
  if (data) return JSON.parse(data) as T;
  return fallback;
}

async function setItem<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getBusinessProfile(): Promise<BusinessProfile> {
  return getItem(KEYS.BUSINESS_PROFILE, DEFAULT_BUSINESS);
}

export async function saveBusinessProfile(
  profile: BusinessProfile,
): Promise<void> {
  await setItem(KEYS.BUSINESS_PROFILE, profile);
}

export async function getClients(): Promise<Client[]> {
  return getItem(KEYS.CLIENTS, []);
}

export async function saveClient(client: Client): Promise<void> {
  const clients = await getClients();
  const idx = clients.findIndex((c) => c.id === client.id);
  if (idx >= 0) {
    clients[idx] = client;
  } else {
    clients.push(client);
  }
  await setItem(KEYS.CLIENTS, clients);
}

export async function deleteClient(id: string): Promise<void> {
  const clients = await getClients();
  await setItem(
    KEYS.CLIENTS,
    clients.filter((c) => c.id !== id),
  );
}

export async function getProducts(): Promise<Product[]> {
  return getItem(KEYS.PRODUCTS, []);
}

export async function saveProduct(product: Product): Promise<void> {
  const products = await getProducts();
  const idx = products.findIndex((p) => p.id === product.id);
  if (idx >= 0) {
    products[idx] = product;
  } else {
    products.push(product);
  }
  await setItem(KEYS.PRODUCTS, products);
}

export async function deleteProduct(id: string): Promise<void> {
  const products = await getProducts();
  await setItem(
    KEYS.PRODUCTS,
    products.filter((p) => p.id !== id),
  );
}

export async function getInvoices(): Promise<Invoice[]> {
  return getItem(KEYS.INVOICES, []);
}

export async function saveInvoice(invoice: Invoice): Promise<void> {
  const invoices = await getInvoices();
  const idx = invoices.findIndex((i) => i.id === invoice.id);
  if (idx >= 0) {
    invoices[idx] = invoice;
  } else {
    invoices.push(invoice);
  }
  await setItem(KEYS.INVOICES, invoices);
}

export async function deleteInvoice(id: string): Promise<void> {
  const invoices = await getInvoices();
  await setItem(
    KEYS.INVOICES,
    invoices.filter((i) => i.id !== id),
  );
}

export async function getExpenses(): Promise<Expense[]> {
  return getItem(KEYS.EXPENSES, []);
}

export async function saveExpense(expense: Expense): Promise<void> {
  const expenses = await getExpenses();
  const idx = expenses.findIndex((e) => e.id === expense.id);
  if (idx >= 0) {
    expenses[idx] = expense;
  } else {
    expenses.push(expense);
  }
  await setItem(KEYS.EXPENSES, expenses);
}

export async function deleteExpense(id: string): Promise<void> {
  const expenses = await getExpenses();
  await setItem(
    KEYS.EXPENSES,
    expenses.filter((e) => e.id !== id),
  );
}

export async function getNextInvoiceNumber(): Promise<string> {
  const profile = await getBusinessProfile();
  const num = profile.nextInvoiceNumber;
  profile.nextInvoiceNumber = num + 1;
  await saveBusinessProfile(profile);
  return `${profile.invoicePrefix}-${num}`;
}
