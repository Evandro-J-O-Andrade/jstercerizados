'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Download, Search, TrendingUp, TrendingDown, ArrowDownCircle, ArrowUpCircle, CircleDollarSign } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/fallback';
import { accountsPayableRepository } from '@/repositories/accounts-payable.repository';
import { accountsReceivableRepository } from '@/repositories/accounts-receivable.repository';
import { cashFlowRepository } from '@/repositories/cash-flow.repository';
import type { AccountPayable, AccountReceivable, CashFlow } from '@/types/domain/finance';
import { useAuth } from '@/contexts/AuthContext';

type ReportTab = 'contas-pagar' | 'contas-receber' | 'fluxo-caixa' | 'resumo';

export default function RelatorioFinanceiroPage() {
  const { currentTenantId } = useAuth();
  const [activeTab, setActiveTab] = useState<ReportTab>('resumo');
  const [payables, setPayables] = useState<AccountPayable[]>([]);
  const [receivables, setReceivables] = useState<AccountReceivable[]>([]);
  const [cashFlows, setCashFlows] = useState<CashFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    if (!currentTenantId) return;
    setLoading(true);
    Promise.all([
      accountsPayableRepository.findAll(currentTenantId),
      accountsReceivableRepository.findAll(currentTenantId),
      cashFlowRepository.findAll(currentTenantId),
    ]).then(([p, r, c]) => {
      setPayables(p);
      setReceivables(r);
      setCashFlows(c);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [currentTenantId]);

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
    const payableOverdue = payables.filter((item) => item.status === 'overdue').reduce((sum, item) => sum + item.amount, 0);
    const receivableTotal = receivables.reduce((sum, item) => sum + item.amount, 0);
    const receivableOverdue = receivables.filter((item) => item.status === 'overdue').reduce((sum, item) => sum + item.amount, 0);
    const totalIncome = cashFlows.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = cashFlows.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
    const balance = totalIncome - totalExpense;
    return { payableTotal, payableOverdue, receivableTotal, receivableOverdue, totalIncome, totalExpense, balance };
  }, [payables, receivables, cashFlows]);

  const filteredPayables = useMemo(() => {
    let data = payables;
    if (search) {
      const term = search.toLowerCase();
      data = data.filter((item) =>
        item.description?.toLowerCase().includes(term) ||
        item.notes?.toLowerCase().includes(term)
      );
    }
    if (statusFilter !== 'all') {
      data = data.filter((item) => item.status === statusFilter);
    }
    return data;
  }, [payables, search, statusFilter]);

  const filteredReceivables = useMemo(() => {
    let data = receivables;
    if (search) {
      const term = search.toLowerCase();
      data = data.filter((item) =>
        item.description?.toLowerCase().includes(term) ||
        item.notes?.toLowerCase().includes(term)
      );
    }
    if (statusFilter !== 'all') {
      data = data.filter((item) => item.status === statusFilter);
    }
    return data;
  }, [receivables, search, statusFilter]);

  const filteredCashFlows = useMemo(() => {
    let data = cashFlows;
    if (search) {
      const term = search.toLowerCase();
      data = data.filter((item) =>
        item.description?.toLowerCase().includes(term) ||
        item.category?.toLowerCase().includes(term) ||
        item.notes?.toLowerCase().includes(term)
      );
    }
    if (typeFilter !== 'all') {
      data = data.filter((item) => item.type === typeFilter);
    }
    return data;
  }, [cashFlows, search, typeFilter]);

  const handleExport = (type: string) => {
    alert(`Exportando relatório de ${type}...`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Carregando relatórios...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Relatórios Financeiros
          </h1>
          <p className="text-sm text-muted-foreground">
            Demonstrativos e análises do domínio financeiro.
          </p>
        </div>
        <Button variant="secondary" onClick={() => handleExport('relatorio-geral')}>
          <Download className="mr-2 h-4 w-4" />
          Exportar relatório
        </Button>
      </div>

      <div className="flex gap-2 border-b border-border overflow-x-auto">
        {[
          { key: 'resumo', label: 'Resumo' },
          { key: 'contas-pagar', label: 'Contas a pagar' },
          { key: 'contas-receber', label: 'Contas a receber' },
          { key: 'fluxo-caixa', label: 'Fluxo de caixa' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as ReportTab)}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'resumo' && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: 'Total contas a pagar', value: kpis.payableTotal, icon: ArrowUpCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
              { label: 'Contas a pagar vencidas', value: kpis.payableOverdue, icon: TrendingDown, color: 'text-destructive', bg: 'bg-destructive/10' },
              { label: 'Total contas a receber', value: kpis.receivableTotal, icon: ArrowDownCircle, color: 'text-success', bg: 'bg-success/10' },
              { label: 'Contas a receber vencidas', value: kpis.receivableOverdue, icon: TrendingDown, color: 'text-destructive', bg: 'bg-destructive/10' },
              { label: 'Entradas do período', value: kpis.totalIncome, icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' },
              { label: 'Saídas do período', value: kpis.totalExpense, icon: TrendingDown, color: 'text-destructive', bg: 'bg-destructive/10' },
              { label: 'Saldo do período', value: kpis.balance, icon: CircleDollarSign, color: kpis.balance >= 0 ? 'text-success' : 'text-destructive', bg: kpis.balance >= 0 ? 'bg-success/10' : 'bg-destructive/10' },
            ].map((kpi) => {
              const Icon = kpi.icon;
              return (
                <Card key={kpi.label} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg ${kpi.bg} p-2 ${kpi.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{kpi.label}</p>
                      <p className="text-lg font-semibold text-foreground">{formatCurrency(kpi.value)}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
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
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
            >
              <option value="all">Todos os status</option>
              <option value="open">Em aberto</option>
              <option value="paid">Pago</option>
              <option value="overdue">Vencido</option>
              <option value="cancelled">Cancelado</option>
            </select>
            <Button variant="secondary" onClick={() => handleExport('contas-pagar')}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>

          {filteredPayables.length === 0 ? (
            <EmptyState title="Nenhum registro" description="Não há contas a pagar para exibir." />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Descrição</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Valor</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Vencimento</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Observação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPayables.map((item) => (
                    <tr key={item.id} className="hover:bg-muted">
                      <td className="px-4 py-3 text-foreground">{item.description}</td>
                      <td className="px-4 py-3 text-destructive font-medium">{formatCurrency(item.amount)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(item.due_date)}</td>
                      <td className="px-4 py-3"><Badge variant={statusVariant(item.status)}>{statusLabel[item.status] || item.status}</Badge></td>
                      <td className="px-4 py-3 text-muted-foreground">{item.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
            >
              <option value="all">Todos os status</option>
              <option value="open">Em aberto</option>
              <option value="received">Recebido</option>
              <option value="overdue">Vencido</option>
              <option value="cancelled">Cancelado</option>
            </select>
            <Button variant="secondary" onClick={() => handleExport('contas-receber')}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>

          {filteredReceivables.length === 0 ? (
            <EmptyState title="Nenhum registro" description="Não há contas a receber para exibir." />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Descrição</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Valor</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Vencimento</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Observação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredReceivables.map((item) => (
                    <tr key={item.id} className="hover:bg-muted">
                      <td className="px-4 py-3 text-foreground">{item.description}</td>
                      <td className="px-4 py-3 text-success font-medium">{formatCurrency(item.amount)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(item.due_date)}</td>
                      <td className="px-4 py-3"><Badge variant={statusVariant(item.status)}>{statusLabel[item.status] || item.status}</Badge></td>
                      <td className="px-4 py-3 text-muted-foreground">{item.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              <p className="text-xs text-muted-foreground">Entradas</p>
              <p className="text-lg font-semibold text-success">{formatCurrency(kpis.totalIncome)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Saídas</p>
              <p className="text-lg font-semibold text-destructive">{formatCurrency(kpis.totalExpense)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Saldo</p>
              <p className={`text-lg font-semibold ${kpis.balance >= 0 ? 'text-success' : 'text-destructive'}`}>{formatCurrency(kpis.balance)}</p>
            </Card>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
            >
              <option value="all">Todos os tipos</option>
              <option value="income">Entradas</option>
              <option value="expense">Saídas</option>
              <option value="transfer">Transferências</option>
            </select>
            <Button variant="secondary" onClick={() => handleExport('fluxo-caixa')}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>

          {filteredCashFlows.length === 0 ? (
            <EmptyState title="Nenhum registro" description="Não há lançamentos de fluxo de caixa para exibir." />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Descrição</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Data</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Categoria</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Valor</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Observação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredCashFlows.map((item) => (
                    <tr key={item.id} className="hover:bg-muted">
                      <td className="px-4 py-3 text-foreground">{item.description || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(item.date)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{item.category || '—'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={item.type === 'income' ? 'default' : item.type === 'expense' ? 'danger' : 'secondary'}>
                          {item.type === 'income' ? 'Entrada' : item.type === 'expense' ? 'Saída' : 'Transferência'}
                        </Badge>
                      </td>
                      <td className={`px-4 py-3 font-medium ${item.type === 'income' ? 'text-success' : item.type === 'expense' ? 'text-destructive' : 'text-primary'}`}>
                        {item.type === 'expense' ? '-' : item.type === 'income' ? '+' : '±'}
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{item.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}


