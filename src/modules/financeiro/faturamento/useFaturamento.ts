import { useEffect, useState, useMemo } from 'react';
import { billingRepository } from '@/repositories/billing.repository';
import { invoiceRepository } from '@/repositories/invoice.repository';
import type { Invoice, Sale, Quote } from '@/types/domain/billing';
import type { Invoice as DomainInvoice } from '@/types/domain/finance';
import { useAuth } from '@/contexts/AuthContext';
import { useAccount } from '@/contexts/AccountContext';
import {
  filterDashboardMetrics,
  type DashboardMetric,
} from '@/components/dashboard/dashboard-model';
import { FileText, ShoppingCart, ClipboardList } from 'lucide-react';

type Tab = 'invoices' | 'sales' | 'quotes';

interface UseFaturamentoReturn {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  invoices: Invoice[];
  sales: Sale[];
  quotes: Quote[];
  billingInvoices: DomainInvoice[];
  loading: boolean;
  error: string | null;
  search: string;
  setSearch: (search: string) => void;
  filteredInvoices: Invoice[];
  filteredSales: Sale[];
  kpis: {
    invoiceTotal: number;
    saleTotal: number;
    quoteTotal: number;
    pendingInvoices: number;
    invoiceCount: number;
    saleCount: number;
    quoteCount: number;
  };
  visibleMetrics: DashboardMetric[];
  formatCurrency: (value: number) => string;
  refetch: () => void;
}

export function useFaturamento(): UseFaturamentoReturn {
  const { currentTenantId, isAdminMaster } = useAuth();
  const { activePermissions } = useAccount();

  const [activeTab, setActiveTab] = useState<Tab>('invoices');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [billingInvoices, setBillingInvoices] = useState<DomainInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchData = useMemo(() => {
    return async () => {
      if (!currentTenantId) return;
      setLoading(true);
      setError(null);
      try {
        const [i, s, q, bi] = await Promise.all([
          billingRepository.findInvoices(currentTenantId),
          billingRepository.findSales(currentTenantId),
          billingRepository.findQuotes(currentTenantId),
          invoiceRepository.findAll(currentTenantId),
        ]);
        setInvoices(i);
        setSales(s);
        setQuotes(q);
        setBillingInvoices(bi);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Erro ao carregar faturamento',
        );
      } finally {
        setLoading(false);
      }
    };
  }, [currentTenantId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredInvoices = useMemo(() => {
    let data = invoices;
    if (search) {
      const term = search.toLowerCase();
      data = data.filter(
        (inv) =>
          inv.number.toLowerCase().includes(term) ||
          inv.series.toLowerCase().includes(term),
      );
    }
    return data;
  }, [invoices, search]);

  const filteredSales = useMemo(() => {
    let data = sales;
    if (search) {
      const term = search.toLowerCase();
      data = data.filter((s) => s.description.toLowerCase().includes(term));
    }
    return data;
  }, [sales, search]);

  const kpis = useMemo(() => {
    const invoiceTotal = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const saleTotal = sales.reduce((sum, s) => sum + s.amount, 0);
    const quoteTotal = quotes.reduce((sum, q) => sum + q.amount, 0);
    const pendingInvoices = invoices.filter(
      (inv) => inv.status === 'issued',
    ).length;
    return {
      invoiceTotal,
      saleTotal,
      quoteTotal,
      pendingInvoices,
      invoiceCount: invoices.length,
      saleCount: sales.length,
      quoteCount: quotes.length,
    };
  }, [invoices, sales, quotes]);

  const metrics = useMemo<DashboardMetric[]>(
    () => [
      {
        id: 'invoice-total',
        label: 'Total faturado',
        value: kpis.invoiceTotal,
        description: `${kpis.invoiceCount} fatura(s)`,
        icon: FileText,
        tone: 'success' as const,
        permission: 'finance.read',
        format: 'currency' as const,
      },
      {
        id: 'sale-total',
        label: 'Total vendas',
        value: kpis.saleTotal,
        description: `${kpis.saleCount} venda(s)`,
        icon: ShoppingCart,
        tone: 'primary' as const,
        permission: 'finance.read',
        format: 'currency' as const,
      },
      {
        id: 'quote-total',
        label: 'Total orçamentos',
        value: kpis.quoteTotal,
        description: `${kpis.quoteCount} orçamento(s)`,
        icon: ClipboardList,
        tone: 'warning' as const,
        permission: 'finance.read',
        format: 'currency' as const,
      },
    ],
    [
      kpis.invoiceCount,
      kpis.invoiceTotal,
      kpis.quoteCount,
      kpis.quoteTotal,
      kpis.saleCount,
      kpis.saleTotal,
    ],
  );

  const visibleMetrics = filterDashboardMetrics(
    metrics,
    activePermissions,
    isAdminMaster,
  );

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return {
    activeTab,
    setActiveTab,
    invoices,
    sales,
    quotes,
    billingInvoices,
    loading,
    error,
    search,
    setSearch,
    filteredInvoices,
    filteredSales,
    kpis,
    visibleMetrics,
    formatCurrency,
    refetch: fetchData,
  };
}
