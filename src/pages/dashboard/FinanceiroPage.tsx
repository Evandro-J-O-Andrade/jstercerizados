'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  CircleDollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  FileText,
  Calculator,
  Eye,
  Download,
  FolderOpen,
  Receipt,
  Banknote,
  PieChart,
  Landmark,
  Split,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState, ErrorState } from '@/components/fallback';
import { ConfirmDialog } from '@/components/feedback';
import {
  accountsPayableRepository,
  accountsReceivableRepository,
  cashFlowRepository,
  financialCategoryRepository,
  costCenterRepository,
  invoiceRepository,
  financialTransactionRepository,
  bankReconciliationRepository,
  financialInstallmentRepository,
  financialAccountRepository,
} from '@/repositories/finance.repository';
import type {
  AccountPayable,
  AccountReceivable,
  CashFlow,
  FinancialCategory,
  CostCenter,
  Invoice,
  FinancialTransaction,
  BankReconciliation,
  FinancialInstallment,
  FinancialAccount,
} from '@/types/domain/finance';
import { useAuth } from '@/contexts/AuthContext';

type TabValue =
  | 'dashboard'
  | 'contas-pagar'
  | 'contas-receber'
  | 'fluxo-caixa'
  | 'calculadora'
  | 'categorias'
  | 'centros-custo'
  | 'notas-fiscais'
  | 'transacoes'
  | 'conciliacao'
  | 'parcelamentos'
  | 'contas-financeiras';

export default function FinanceiroPage() {
  const { currentTenantId } = useAuth();
  const [activeTab, setActiveTab] = useState<TabValue>('dashboard');

  const [payables, setPayables] = useState<AccountPayable[]>([]);
  const [receivables, setReceivables] = useState<AccountReceivable[]>([]);
  const [cashFlows, setCashFlows] = useState<CashFlow[]>([]);
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [reconciliations, setReconciliations] = useState<BankReconciliation[]>(
    [],
  );
  const [installments, setInstallments] = useState<FinancialInstallment[]>([]);
  const [financialAccounts, setFinancialAccounts] = useState<
    FinancialAccount[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchPayable, setSearchPayable] = useState('');
  const [searchReceivable, setSearchReceivable] = useState('');
  const [searchCashFlow, setSearchCashFlow] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<
    'payable' | 'receivable' | 'cashflow' | null
  >(null);

  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<
    'payable' | 'receivable' | 'cashflow'
  >('payable');

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    due_date: '',
    category: '',
    subcategory: '',
    notes: '',
    type: 'expense' as 'income' | 'expense' | 'transfer',
  });

  const loadData = useCallback(async () => {
    if (!currentTenantId) return;
    setLoading(true);
    setError(null);
    try {
      const [
        payablesData,
        receivablesData,
        cashFlowsData,
        categoriesData,
        costCentersData,
        invoicesData,
        transactionsData,
        reconciliationsData,
        installmentsData,
        financialAccountsData,
      ] = await Promise.all([
        accountsPayableRepository.findAll(currentTenantId),
        accountsReceivableRepository.findAll(currentTenantId),
        cashFlowRepository.findAll(currentTenantId),
        financialCategoryRepository.findAll(currentTenantId),
        costCenterRepository.findAll(currentTenantId),
        invoiceRepository.findAll(currentTenantId),
        financialTransactionRepository.findAll(currentTenantId),
        bankReconciliationRepository.findAll(currentTenantId),
        financialInstallmentRepository.findAll(currentTenantId),
        financialAccountRepository.findAll(currentTenantId),
      ]);
      setPayables(payablesData);
      setReceivables(receivablesData);
      setCashFlows(cashFlowsData);
      setCategories(categoriesData);
      setCostCenters(costCentersData);
      setInvoices(invoicesData);
      setTransactions(transactionsData);
      setReconciliations(reconciliationsData);
      setInstallments(installmentsData);
      setFinancialAccounts(financialAccountsData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao carregar dados financeiros',
      );
    } finally {
      setLoading(false);
    }
  }, [currentTenantId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDate = (value: string | null) => {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('pt-BR');
  };

  const statusLabel: Record<string, string> = {
    open: 'Em aberto',
    paid: 'Pago',
    overdue: 'Vencido',
    cancelled: 'Cancelado',
    partially_paid: 'Parcialmente pago',
    received: 'Recebido',
    partially_received: 'Parcialmente recebido',
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case 'open':
      case 'received':
        return 'default';
      case 'overdue':
        return 'danger';
      case 'paid':
        return 'success';
      case 'cancelled':
        return 'secondary';
      case 'partially_paid':
      case 'partially_received':
        return 'warning';
      default:
        return 'default';
    }
  };

  const kpis = useMemo(() => {
    const payableTotal = payables.reduce((sum, item) => sum + item.amount, 0);
    const payableOpen = payables
      .filter((item) => item.status === 'open')
      .reduce((sum, item) => sum + item.amount, 0);
    const payableOverdue = payables
      .filter((item) => item.status === 'overdue')
      .reduce((sum, item) => sum + item.amount, 0);

    const receivableTotal = receivables.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    const receivableOpen = receivables
      .filter((item) => item.status === 'open')
      .reduce((sum, item) => sum + item.amount, 0);
    const receivableOverdue = receivables
      .filter((item) => item.status === 'overdue')
      .reduce((sum, item) => sum + item.amount, 0);

    const totalIncome = cashFlows
      .filter((item) => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = cashFlows
      .filter((item) => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0);
    const balance = totalIncome - totalExpense;

    return {
      payableTotal,
      payableOpen,
      payableOverdue,
      receivableTotal,
      receivableOpen,
      receivableOverdue,
      totalIncome,
      totalExpense,
      balance,
    };
  }, [payables, receivables, cashFlows]);

  const filteredPayables = useMemo(() => {
    let data = payables;
    if (searchPayable) {
      const term = searchPayable.toLowerCase();
      data = data.filter(
        (item) =>
          item.description?.toLowerCase().includes(term) ||
          item.payment_reference?.toLowerCase().includes(term) ||
          item.notes?.toLowerCase().includes(term),
      );
    }
    return data;
  }, [payables, searchPayable]);

  const filteredReceivables = useMemo(() => {
    let data = receivables;
    if (searchReceivable) {
      const term = searchReceivable.toLowerCase();
      data = data.filter(
        (item) =>
          item.description?.toLowerCase().includes(term) ||
          item.payment_reference?.toLowerCase().includes(term) ||
          item.notes?.toLowerCase().includes(term),
      );
    }
    return data;
  }, [receivables, searchReceivable]);

  const filteredCashFlows = useMemo(() => {
    let data = cashFlows;
    if (searchCashFlow) {
      const term = searchCashFlow.toLowerCase();
      data = data.filter(
        (item) =>
          item.description?.toLowerCase().includes(term) ||
          item.reference?.toLowerCase().includes(term) ||
          item.category?.toLowerCase().includes(term) ||
          item.subcategory?.toLowerCase().includes(term),
      );
    }
    if (typeFilter !== 'all') {
      data = data.filter((item) => item.type === typeFilter);
    }
    return data;
  }, [cashFlows, searchCashFlow, typeFilter]);

  const handleOpenForm = (type: 'payable' | 'receivable' | 'cashflow') => {
    setFormType(type);
    setFormData({
      description: '',
      amount: '',
      due_date: '',
      category: '',
      subcategory: '',
      notes: '',
      type: 'expense',
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormData({
      description: '',
      amount: '',
      due_date: '',
      category: '',
      subcategory: '',
      notes: '',
      type: 'expense',
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenantId) return;

    try {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        alert('Informe um valor válido');
        return;
      }

      if (formType === 'payable') {
        await accountsPayableRepository.create({
          tenant_id: currentTenantId,
          description: formData.description,
          amount,
          due_date: formData.due_date || new Date().toISOString().split('T')[0],
          notes: formData.notes || null,
          status: 'open',
        });
      } else if (formType === 'receivable') {
        await accountsReceivableRepository.create({
          tenant_id: currentTenantId,
          description: formData.description,
          amount,
          due_date: formData.due_date || new Date().toISOString().split('T')[0],
          notes: formData.notes || null,
          status: 'open',
        });
      } else if (formType === 'cashflow') {
        await cashFlowRepository.create({
          tenant_id: currentTenantId,
          type: formData.type,
          amount,
          date: formData.due_date || new Date().toISOString().split('T')[0],
          description: formData.description,
          category: formData.category || null,
          subcategory: formData.subcategory || null,
          notes: formData.notes || null,
        });
      }

      handleCloseForm();
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  };

  const handleDelete = async () => {
    if (!deleteId || !deleteType || !currentTenantId) return;
    try {
      if (deleteType === 'payable') {
        await accountsPayableRepository.remove(deleteId, currentTenantId);
      } else if (deleteType === 'receivable') {
        await accountsReceivableRepository.remove(deleteId, currentTenantId);
      } else if (deleteType === 'cashflow') {
        await cashFlowRepository.remove(deleteId, currentTenantId);
      }
      await loadData();
      setDeleteId(null);
      setDeleteType(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground text-sm">
          Carregando dados financeiros...
        </p>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-xl font-semibold">Financeiro</h1>
          <p className="text-muted-foreground text-sm">
            Gestão completa: contas a pagar, receber, fluxo de caixa e
            demonstrativos.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setActiveTab('calculadora')}
          >
            <Calculator className="mr-2 h-4 w-4" />
            Calculadora
          </Button>
          <Button onClick={() => handleOpenForm('payable')}>
            <Plus className="mr-2 h-4 w-4" />
            Novo lançamento
          </Button>
        </div>
      </div>

      <div className="border-border flex gap-2 overflow-x-auto border-b">
        {[
          { key: 'dashboard', label: 'Dashboard' },
          { key: 'contas-pagar', label: 'Contas a pagar' },
          { key: 'contas-receber', label: 'Contas a receber' },
          { key: 'fluxo-caixa', label: 'Fluxo de caixa' },
          { key: 'notas-fiscais', label: 'Notas fiscais' },
          { key: 'transacoes', label: 'Transações' },
          { key: 'categorias', label: 'Categorias' },
          { key: 'centros-custo', label: 'Centros de custo' },
          { key: 'conciliacao', label: 'Conciliação' },
          { key: 'parcelamentos', label: 'Parcelamentos' },
          { key: 'contas-financeiras', label: 'Contas' },
          { key: 'calculadora', label: 'Calculadora' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabValue)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'border-primary text-primary border-b-2'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                label: 'Contas a pagar',
                value: kpis.payableTotal,
                icon: ArrowUpCircle,
                color: 'text-red-700',
                bg: 'bg-red-50',
              },
              {
                label: 'Contas a pagar em aberto',
                value: kpis.payableOpen,
                icon: Wallet,
                color: 'text-orange-700',
                bg: 'bg-orange-50',
              },
              {
                label: 'Contas a pagar vencidas',
                value: kpis.payableOverdue,
                icon: ArrowUpCircle,
                color: 'text-red-700',
                bg: 'bg-red-50',
              },
              {
                label: 'Contas a receber',
                value: kpis.receivableTotal,
                icon: ArrowDownCircle,
                color: 'text-green-700',
                bg: 'bg-green-50',
              },
              {
                label: 'Contas a receber em aberto',
                value: kpis.receivableOpen,
                icon: Wallet,
                color: 'text-emerald-700',
                bg: 'bg-emerald-50',
              },
              {
                label: 'Contas a receber vencidas',
                value: kpis.receivableOverdue,
                icon: ArrowDownCircle,
                color: 'text-red-700',
                bg: 'bg-red-50',
              },
              {
                label: 'Entradas do período',
                value: kpis.totalIncome,
                icon: TrendingUp,
                color: 'text-green-700',
                bg: 'bg-green-50',
              },
              {
                label: 'Saídas do período',
                value: kpis.totalExpense,
                icon: TrendingDown,
                color: 'text-red-700',
                bg: 'bg-red-50',
              },
              {
                label: 'Saldo do período',
                value: kpis.balance,
                icon: CircleDollarSign,
                color: kpis.balance >= 0 ? 'text-green-700' : 'text-red-700',
                bg: kpis.balance >= 0 ? 'bg-green-50' : 'bg-red-50',
              },
            ].map((kpi) => {
              const Icon = kpi.icon;
              return (
                <Card key={kpi.label} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg ${kpi.bg} p-2 ${kpi.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">
                        {kpi.label}
                      </p>
                      <p className="text-foreground text-lg font-semibold">
                        {formatCurrency(kpi.value)}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-foreground text-sm font-semibold">
                  Contas a pagar recentes
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('contas-pagar')}
                >
                  <Eye className="mr-1 h-4 w-4" />
                  Ver todas
                </Button>
              </div>
              {filteredPayables.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Nenhuma conta a pagar cadastrada.
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredPayables.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="border-border flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="text-foreground text-sm font-medium">
                          {item.description}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Vencimento: {formatDate(item.due_date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-red-700">
                          {formatCurrency(item.amount)}
                        </p>
                        <Badge variant={statusVariant(item.status)}>
                          {statusLabel[item.status] || item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-foreground text-sm font-semibold">
                  Contas a receber recentes
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('contas-receber')}
                >
                  <Eye className="mr-1 h-4 w-4" />
                  Ver todas
                </Button>
              </div>
              {filteredReceivables.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Nenhuma conta a receber cadastrada.
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredReceivables.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="border-border flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="text-foreground text-sm font-medium">
                          {item.description}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Vencimento: {formatDate(item.due_date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-700">
                          {formatCurrency(item.amount)}
                        </p>
                        <Badge variant={statusVariant(item.status)}>
                          {statusLabel[item.status] || item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <Card className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-foreground text-sm font-semibold">
                Fluxo de caixa recente
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('fluxo-caixa')}
              >
                <Eye className="mr-1 h-4 w-4" />
                Ver todos
              </Button>
            </div>
            {filteredCashFlows.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Nenhum lançamento de fluxo de caixa registrado.
              </p>
            ) : (
              <div className="space-y-2">
                {filteredCashFlows.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="border-border flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-lg p-2 ${
                          item.type === 'income'
                            ? 'bg-green-50 text-green-700'
                            : item.type === 'expense'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {item.type === 'income' ? (
                          <ArrowDownCircle className="h-4 w-4" />
                        ) : item.type === 'expense' ? (
                          <ArrowUpCircle className="h-4 w-4" />
                        ) : (
                          <TrendingUp className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-foreground text-sm font-medium">
                          {item.description || 'Sem descrição'}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {formatDate(item.date)} • {item.category || '—'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p
                        className={`text-sm font-semibold ${
                          item.type === 'income'
                            ? 'text-green-700'
                            : item.type === 'expense'
                              ? 'text-red-700'
                              : 'text-blue-700'
                        }`}
                      >
                        {item.type === 'expense'
                          ? '-'
                          : item.type === 'income'
                            ? '+'
                            : '±'}
                        {formatCurrency(item.amount)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDeleteId(item.id);
                          setDeleteType('cashflow');
                        }}
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {activeTab === 'contas-pagar' && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="border-border bg-background flex flex-1 items-center gap-2 rounded-lg border px-3 py-2">
              <Search className="text-muted-foreground h-4 w-4" />
              <input
                value={searchPayable}
                onChange={(e) => setSearchPayable(e.target.value)}
                placeholder="Buscar por descrição, referência ou observação..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <Button onClick={() => handleOpenForm('payable')}>
              <Plus className="mr-2 h-4 w-4" />
              Nova conta
            </Button>
          </div>

          {filteredPayables.length === 0 ? (
            <EmptyState
              title="Nenhuma conta a pagar cadastrada"
              description="Quando houver obrigações registradas, elas aparecerão aqui."
              actionLabel="Nova conta"
              onAction={() => handleOpenForm('payable')}
            />
          ) : (
            <div className="space-y-3">
              {filteredPayables.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  className="border-border bg-background flex items-center justify-between rounded-xl border p-4 shadow-sm"
                >
                  <div className="flex-1">
                    <p className="text-foreground text-sm font-medium">
                      {item.description}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Vencimento: {formatDate(item.due_date)}
                      {item.paid_date &&
                        ` • Pagamento: ${formatDate(item.paid_date)}`}
                    </p>
                    {item.notes && (
                      <p className="text-muted-foreground mt-1 text-xs">
                        Obs: {item.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-red-700">
                        {formatCurrency(item.amount)}
                      </p>
                      <Badge variant={statusVariant(item.status)}>
                        {statusLabel[item.status] || item.status}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDeleteId(item.id);
                        setDeleteType('payable');
                      }}
                    >
                      Excluir
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'contas-receber' && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="border-border bg-background flex flex-1 items-center gap-2 rounded-lg border px-3 py-2">
              <Search className="text-muted-foreground h-4 w-4" />
              <input
                value={searchReceivable}
                onChange={(e) => setSearchReceivable(e.target.value)}
                placeholder="Buscar por descrição, referência ou observação..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <Button onClick={() => handleOpenForm('receivable')}>
              <Plus className="mr-2 h-4 w-4" />
              Nova conta
            </Button>
          </div>

          {filteredReceivables.length === 0 ? (
            <EmptyState
              title="Nenhuma conta a receber cadastrada"
              description="Quando houver recebimentos registrados, eles aparecerão aqui."
              actionLabel="Nova conta"
              onAction={() => handleOpenForm('receivable')}
            />
          ) : (
            <div className="space-y-3">
              {filteredReceivables.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  className="border-border bg-background flex items-center justify-between rounded-xl border p-4 shadow-sm"
                >
                  <div className="flex-1">
                    <p className="text-foreground text-sm font-medium">
                      {item.description}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Vencimento: {formatDate(item.due_date)}
                      {item.received_date &&
                        ` • Recebimento: ${formatDate(item.received_date)}`}
                    </p>
                    {item.notes && (
                      <p className="text-muted-foreground mt-1 text-xs">
                        Obs: {item.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-700">
                        {formatCurrency(item.amount)}
                      </p>
                      <Badge variant={statusVariant(item.status)}>
                        {statusLabel[item.status] || item.status}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDeleteId(item.id);
                        setDeleteType('receivable');
                      }}
                    >
                      Excluir
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'fluxo-caixa' && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-4">
              <p className="text-muted-foreground text-xs">Entradas</p>
              <p className="text-lg font-semibold text-green-700">
                {formatCurrency(kpis.totalIncome)}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-muted-foreground text-xs">Saídas</p>
              <p className="text-lg font-semibold text-red-700">
                {formatCurrency(kpis.totalExpense)}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-muted-foreground text-xs">Saldo</p>
              <p
                className={`text-lg font-semibold ${kpis.balance >= 0 ? 'text-green-700' : 'text-red-700'}`}
              >
                {formatCurrency(kpis.balance)}
              </p>
            </Card>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="border-border bg-background flex flex-1 items-center gap-2 rounded-lg border px-3 py-2">
              <Search className="text-muted-foreground h-4 w-4" />
              <input
                value={searchCashFlow}
                onChange={(e) => setSearchCashFlow(e.target.value)}
                placeholder="Buscar por descrição, categoria ou referência..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border-border bg-background rounded-lg border px-3 py-2 text-sm outline-none"
            >
              <option value="all">Todos os tipos</option>
              <option value="income">Entradas</option>
              <option value="expense">Saídas</option>
              <option value="transfer">Transferências</option>
            </select>
            <Button onClick={() => handleOpenForm('cashflow')}>
              <Plus className="mr-2 h-4 w-4" />
              Novo lançamento
            </Button>
          </div>

          {filteredCashFlows.length === 0 ? (
            <EmptyState
              title="Nenhum lançamento cadastrado"
              description="Quando houver lançamentos de fluxo de caixa, eles aparecerão aqui."
              actionLabel="Novo lançamento"
              onAction={() => handleOpenForm('cashflow')}
            />
          ) : (
            <div className="space-y-3">
              {filteredCashFlows.map((item) => {
                const Icon =
                  item.type === 'income'
                    ? ArrowDownCircle
                    : item.type === 'expense'
                      ? ArrowUpCircle
                      : TrendingUp;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    className="border-border bg-background flex items-center justify-between rounded-xl border p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-lg p-2 ${
                          item.type === 'income'
                            ? 'bg-green-50 text-green-700'
                            : item.type === 'expense'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-foreground text-sm font-medium">
                          {item.description || 'Sem descrição'}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {formatDate(item.date)} • {item.category || '—'}{' '}
                          {item.subcategory ? `• ${item.subcategory}` : ''}
                        </p>
                        {item.notes && (
                          <p className="text-muted-foreground mt-1 text-xs">
                            Obs: {item.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p
                        className={`text-sm font-semibold ${
                          item.type === 'income'
                            ? 'text-green-700'
                            : item.type === 'expense'
                              ? 'text-red-700'
                              : 'text-blue-700'
                        }`}
                      >
                        {item.type === 'expense'
                          ? '-'
                          : item.type === 'income'
                            ? '+'
                            : '±'}
                        {formatCurrency(item.amount)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDeleteId(item.id);
                          setDeleteType('cashflow');
                        }}
                      >
                        Excluir
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'calculadora' && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6">
            <h3 className="text-foreground mb-4 flex items-center gap-2 text-lg font-semibold">
              <Calculator className="h-5 w-5" />
              Calculadora Financeira
            </h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Área para cálculos e simulações. Os valores abaixo são apenas para
              consulta e não alteram os registros do sistema.
            </p>
            <FinanceCalculator />
          </Card>

          <Card className="p-6">
            <h3 className="text-foreground mb-4 flex items-center gap-2 text-lg font-semibold">
              <FileText className="h-5 w-5" />
              Observações e Anotações
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="calc-notes">Área de observação</Label>
                <textarea
                  id="calc-notes"
                  rows={6}
                  placeholder="Registre aqui suas observações, anotações e comentários sobre o cálculo ou simulação realizada..."
                  className="border-border mt-1 w-full rounded-lg border p-3 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => alert('Observações salvas localmente')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Salvar anotação
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => alert('Cálculo exportado')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Exportar cálculo
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Excluir registro?"
        message="Essa ação removerá o registro permanentemente."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteId(null);
          setDeleteType(null);
        }}
      />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-foreground text-lg font-semibold">
                {formType === 'payable'
                  ? 'Nova conta a pagar'
                  : formType === 'receivable'
                    ? 'Nova conta a receber'
                    : 'Novo lançamento de fluxo de caixa'}
              </h3>
              <Button variant="ghost" size="sm" onClick={handleCloseForm}>
                Fechar
              </Button>
            </div>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Descrição do lançamento"
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="amount">Valor (R$)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder="0,00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="due_date">Data</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) =>
                      setFormData({ ...formData, due_date: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              {formType === 'cashflow' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="type">Tipo</Label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value as
                            'income' | 'expense' | 'transfer',
                        })
                      }
                      className="border-border bg-background mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                    >
                      <option value="income">Entrada</option>
                      <option value="expense">Saída</option>
                      <option value="transfer">Transferência</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      placeholder="Ex: Vendas, Fornecedores"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subcategory">Subcategoria</Label>
                    <Input
                      id="subcategory"
                      value={formData.subcategory}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subcategory: e.target.value,
                        })
                      }
                      placeholder="Ex: Produtos, Serviços"
                    />
                  </div>
                </div>
              )}
              <div>
                <Label htmlFor="notes">Observações</Label>
                <textarea
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Informações adicionais..."
                  className="border-border mt-1 w-full rounded-lg border p-3 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseForm}
                >
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

function FinanceCalculator() {
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('');
  const [periods, setPeriods] = useState('');
  const [result, setResult] = useState<number | null>(null);

  const calculatePMT = () => {
    const p = parseFloat(amount);
    const i = parseFloat(rate) / 100;
    const n = parseInt(periods, 10);
    if (!p || !i || !n) {
      setResult(null);
      return;
    }
    const pmt = (p * i) / (1 - Math.pow(1 + i, -n));
    setResult(pmt);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="calc-amount">Valor (R$)</Label>
          <Input
            id="calc-amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00"
          />
        </div>
        <div>
          <Label htmlFor="calc-rate">Taxa de juros (%)</Label>
          <Input
            id="calc-rate"
            type="number"
            step="0.01"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="Ex: 2.5"
          />
        </div>
        <div>
          <Label htmlFor="calc-periods">Períodos</Label>
          <Input
            id="calc-periods"
            type="number"
            value={periods}
            onChange={(e) => setPeriods(e.target.value)}
            placeholder="Ex: 12"
          />
        </div>
      </div>
      <Button onClick={calculatePMT}>
        <Calculator className="mr-2 h-4 w-4" />
        Calcular parcela
      </Button>
      {result !== null && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-700">Valor da parcela:</p>
          <p className="text-2xl font-bold text-blue-900">
            {result.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </p>
        </div>
      )}
    </div>
  );
}
