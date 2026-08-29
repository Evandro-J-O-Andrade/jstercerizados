'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState, ErrorState } from '@/components/fallback';
import { billingRepository } from '@/repositories/billing.repository';
import { invoiceRepository } from '@/repositories/invoice.repository';
import type { Invoice, Sale, Quote } from '@/types/domain/billing';
import type { Invoice as DomainInvoice } from '@/types/domain/finance';
import { useAuth } from '@/contexts/AuthContext';

type Tab = 'invoices' | 'sales' | 'quotes';

export default function FaturamentoPage() {
  const { currentTenantId } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('invoices');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [billingInvoices, setBillingInvoices] = useState<DomainInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!currentTenantId) return;
    setLoading(true);
    setError(null);
    Promise.all([
      billingRepository.findInvoices(currentTenantId),
      billingRepository.findSales(currentTenantId),
      billingRepository.findQuotes(currentTenantId),
      invoiceRepository.findAll(currentTenantId),
    ])
      .then(([i, s, q, bi]) => {
        setInvoices(i);
        setSales(s);
        setQuotes(q);
        setBillingInvoices(bi);
      })
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : 'Erro ao carregar faturamento',
        ),
      )
      .finally(() => setLoading(false));
  }, [currentTenantId]);

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

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground text-sm">
          Carregando faturamento...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState message={error} onRetry={() => window.location.reload()} />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-xl font-semibold">Faturamento</h1>
          <p className="text-muted-foreground text-sm">
            Faturas, vendas, orçamentos e notas fiscais.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => alert('Exportar relatório de faturamento...')}
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-4">
          <p className="text-muted-foreground text-xs">Total faturado</p>
          <p className="text-foreground text-lg font-semibold">
            {formatCurrency(kpis.invoiceTotal)}
          </p>
          <p className="text-muted-foreground text-xs">
            {kpis.invoiceCount} fatura(s)
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-muted-foreground text-xs">Total vendas</p>
          <p className="text-foreground text-lg font-semibold">
            {formatCurrency(kpis.saleTotal)}
          </p>
          <p className="text-muted-foreground text-xs">
            {kpis.saleCount} venda(s)
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-muted-foreground text-xs">Total orçamentos</p>
          <p className="text-foreground text-lg font-semibold">
            {formatCurrency(kpis.quoteTotal)}
          </p>
          <p className="text-muted-foreground text-xs">
            {kpis.quoteCount} orçamento(s)
          </p>
        </Card>
      </div>

      <div className="border-border flex gap-2 overflow-x-auto border-b">
        {[
          { key: 'invoices', label: 'Faturas' },
          { key: 'sales', label: 'Vendas' },
          { key: 'quotes', label: 'Orçamentos' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as Tab)}
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

      {activeTab === 'invoices' && (
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar faturas..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <Button onClick={() => alert('Formulário de nova fatura')}>
              <Plus className="mr-2 h-4 w-4" />
              Nova fatura
            </Button>
          </div>

          {filteredInvoices.length === 0 ? (
            <EmptyState
              title="Nenhuma fatura cadastrada"
              description="Quando houver faturas registradas, elas aparecerão aqui."
              actionLabel="Nova fatura"
              onAction={() => alert('Formulário de nova fatura')}
            />
          ) : (
            <div className="border-border overflow-x-auto rounded-xl border">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Número
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Série
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Emissão
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Vencimento
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Valor
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-muted">
                      <td className="text-foreground px-4 py-3">
                        {invoice.number}
                      </td>
                      <td className="text-muted-foreground px-4 py-3">
                        {invoice.series}
                      </td>
                      <td className="text-muted-foreground px-4 py-3">
                        {new Date(invoice.issue_date).toLocaleDateString(
                          'pt-BR',
                        )}
                      </td>
                      <td className="text-muted-foreground px-4 py-3">
                        {new Date(invoice.due_date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="text-foreground px-4 py-3">
                        {formatCurrency(invoice.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            invoice.status === 'paid'
                              ? 'success'
                              : invoice.status === 'cancelled'
                                ? 'danger'
                                : invoice.status === 'voided'
                                  ? 'secondary'
                                  : 'warning'
                          }
                        >
                          {invoice.status === 'paid'
                            ? 'Paga'
                            : invoice.status === 'cancelled'
                              ? 'Cancelada'
                              : invoice.status === 'voided'
                                ? 'Inutilizada'
                                : 'Pendente'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'sales' && (
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar vendas..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <Button onClick={() => alert('Formulário de nova venda')}>
              <Plus className="mr-2 h-4 w-4" />
              Nova venda
            </Button>
          </div>

          {filteredSales.length === 0 ? (
            <EmptyState
              title="Nenhuma venda cadastrada"
              description="Quando houver vendas registradas, elas aparecerão aqui."
              actionLabel="Nova venda"
              onAction={() => alert('Formulário de nova venda')}
            />
          ) : (
            <div className="border-border overflow-x-auto rounded-xl border">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Descrição
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Data
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Valor
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Pagamento
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-muted">
                      <td className="text-foreground px-4 py-3">
                        {sale.description}
                      </td>
                      <td className="text-muted-foreground px-4 py-3">
                        {new Date(sale.issue_date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="text-foreground px-4 py-3">
                        {formatCurrency(sale.amount)}
                      </td>
                      <td className="text-muted-foreground px-4 py-3">
                        {sale.payment_method || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'quotes' && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-end">
            <Button onClick={() => alert('Formulário de novo orçamento')}>
              <Plus className="mr-2 h-4 w-4" />
              Novo orçamento
            </Button>
          </div>

          {quotes.length === 0 ? (
            <EmptyState
              title="Nenhum orçamento cadastrado"
              description="Quando houver orçamentos registrados, eles aparecerão aqui."
              actionLabel="Novo orçamento"
              onAction={() => alert('Formulário de novo orçamento')}
            />
          ) : (
            <div className="border-border overflow-x-auto rounded-xl border">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Número
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Descrição
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Valor
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Validade
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {quotes.map((quote) => (
                    <tr key={quote.id} className="hover:bg-muted">
                      <td className="text-foreground px-4 py-3">
                        {quote.number}
                      </td>
                      <td className="text-foreground px-4 py-3">
                        {quote.description}
                      </td>
                      <td className="text-foreground px-4 py-3">
                        {formatCurrency(quote.amount)}
                      </td>
                      <td className="text-muted-foreground px-4 py-3">
                        {new Date(quote.valid_until).toLocaleDateString(
                          'pt-BR',
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            quote.status === 'accepted'
                              ? 'success'
                              : quote.status === 'rejected'
                                ? 'danger'
                                : quote.status === 'sent'
                                  ? 'default'
                                  : 'secondary'
                          }
                        >
                          {quote.status === 'accepted'
                            ? 'Aceito'
                            : quote.status === 'rejected'
                              ? 'Rejeitado'
                              : quote.status === 'sent'
                                ? 'Enviado'
                                : 'Rascunho'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-foreground text-sm font-semibold">
              Notas fiscais
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => alert('Abrir gestão de notas fiscais')}
            >
              Gerenciar
            </Button>
          </div>
          {billingInvoices.length === 0 ? (
            <p className="text-muted-foreground text-xs">
              Nenhuma nota fiscal cadastrada.
            </p>
          ) : (
            <div className="space-y-2">
              {billingInvoices.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="border-border flex items-center justify-between rounded-lg border p-2"
                >
                  <div>
                    <p className="text-foreground text-sm font-medium">
                      {item.number}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Emissão:{' '}
                      {new Date(item.issue_date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {item.amount.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
