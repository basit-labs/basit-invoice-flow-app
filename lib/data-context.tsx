import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type {
  BusinessProfile,
  Client,
  Product,
  Invoice,
  Expense,
} from './types';
import * as Storage from './storage';

interface DataContextValue {
  business: BusinessProfile | null;
  clients: Client[];
  products: Product[];
  invoices: Invoice[];
  expenses: Expense[];
  loading: boolean;
  refreshAll: () => Promise<void>;
  saveBusiness: (profile: BusinessProfile) => Promise<void>;
  saveClient: (client: Client) => Promise<void>;
  removeClient: (id: string) => Promise<void>;
  saveProduct: (product: Product) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  saveInvoice: (invoice: Invoice) => Promise<void>;
  removeInvoice: (id: string) => Promise<void>;
  saveExpense: (expense: Expense) => Promise<void>;
  removeExpense: (id: string) => Promise<void>;
  getNextInvoiceNumber: () => Promise<string>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshAll = useCallback(async () => {
    const [b, c, p, i, e] = await Promise.all([
      Storage.getBusinessProfile(),
      Storage.getClients(),
      Storage.getProducts(),
      Storage.getInvoices(),
      Storage.getExpenses(),
    ]);
    setBusiness(b);
    setClients(c);
    setProducts(p);
    setInvoices(i);
    setExpenses(e);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const saveBusiness = useCallback(async (profile: BusinessProfile) => {
    await Storage.saveBusinessProfile(profile);
    setBusiness(profile);
  }, []);

  const saveClient = useCallback(async (client: Client) => {
    await Storage.saveClient(client);
    setClients((prev) => {
      const idx = prev.findIndex((c) => c.id === client.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = client;
        return next;
      }
      return [...prev, client];
    });
  }, []);

  const removeClient = useCallback(async (id: string) => {
    await Storage.deleteClient(id);
    setClients((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const saveProduct = useCallback(async (product: Product) => {
    await Storage.saveProduct(product);
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = product;
        return next;
      }
      return [...prev, product];
    });
  }, []);

  const removeProduct = useCallback(async (id: string) => {
    await Storage.deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const saveInvoice = useCallback(async (invoice: Invoice) => {
    await Storage.saveInvoice(invoice);
    setInvoices((prev) => {
      const idx = prev.findIndex((i) => i.id === invoice.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = invoice;
        return next;
      }
      return [...prev, invoice];
    });
  }, []);

  const removeInvoice = useCallback(async (id: string) => {
    await Storage.deleteInvoice(id);
    setInvoices((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const saveExpense = useCallback(async (expense: Expense) => {
    await Storage.saveExpense(expense);
    setExpenses((prev) => {
      const idx = prev.findIndex((e) => e.id === expense.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = expense;
        return next;
      }
      return [...prev, expense];
    });
  }, []);

  const removeExpense = useCallback(async (id: string) => {
    await Storage.deleteExpense(id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const getNextInvoiceNumber = useCallback(async () => {
    const num = await Storage.getNextInvoiceNumber();
    const profile = await Storage.getBusinessProfile();
    setBusiness(profile);
    return num;
  }, []);

  const value = useMemo(
    () => ({
      business,
      clients,
      products,
      invoices,
      expenses,
      loading,
      refreshAll,
      saveBusiness,
      saveClient,
      removeClient,
      saveProduct,
      removeProduct,
      saveInvoice,
      removeInvoice,
      saveExpense,
      removeExpense,
      getNextInvoiceNumber,
    }),
    [
      business,
      clients,
      products,
      invoices,
      expenses,
      loading,
      refreshAll,
      saveBusiness,
      saveClient,
      removeClient,
      saveProduct,
      removeProduct,
      saveInvoice,
      removeInvoice,
      saveExpense,
      removeExpense,
      getNextInvoiceNumber,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
