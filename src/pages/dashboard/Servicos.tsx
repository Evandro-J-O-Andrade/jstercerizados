'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState, ErrorState } from '@/components/fallback';
import { servicesRepository } from '@/repositories/services.repository';
import type {
  Service,
  ServiceOrder,
  ServiceExecution,
} from '@/types/domain/service';
import { useAuth } from '@/contexts/AuthContext';

type Tab = 'services' | 'orders' | 'executions';

export default function Servicos() {
  const { currentTenantId } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('services');
  const [services, setServices] = useState<Service[]>([]);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [executions, setExecutions] = useState<ServiceExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!currentTenantId) return;
    setLoading(true);
    setError(null);
    Promise.all([
      servicesRepository.findServices(currentTenantId),
      servicesRepository.findOrders(currentTenantId),
      servicesRepository.findExecutions(currentTenantId),
    ])
      .then(([s, o, e]) => {
        setServices(s);
        setOrders(o);
        setExecutions(e);
      })
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : 'Erro ao carregar serviços',
        ),
      )
      .finally(() => setLoading(false));
  }, [currentTenantId]);

  const filteredServices = useMemo(() => {
    let data = services;
    if (search) {
      const term = search.toLowerCase();
      data = data.filter((s) => s.name.toLowerCase().includes(term));
    }
    return data;
  }, [services, search]);

  const kpis = useMemo(() => {
    const totalServices = services.length;
    const activeServices = services.filter((s) => s.active).length;
    const openOrders = orders.filter((o) => o.status === 'open').length;
    const completedOrders = orders.filter(
      (o) => o.status === 'completed',
    ).length;
    const totalExecutions = executions.length;
    return {
      totalServices,
      activeServices,
      openOrders,
      completedOrders,
      totalExecutions,
    };
  }, [services, orders, executions]);

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground text-sm">Carregando serviços...</p>
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
          <h1 className="text-foreground text-xl font-semibold">Serviços</h1>
          <p className="text-muted-foreground text-sm">
            Catálogo e ordens de serviço.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => alert('Exportar relatório de serviços...')}
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-muted-foreground text-xs">Serviços cadastrados</p>
          <p className="text-foreground text-lg font-semibold">
            {kpis.totalServices}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-muted-foreground text-xs">Serviços ativos</p>
          <p className="text-success text-lg font-semibold">
            {kpis.activeServices}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-muted-foreground text-xs">Ordens abertas</p>
          <p className="text-warning text-lg font-semibold">
            {kpis.openOrders}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-muted-foreground text-xs">Ordens concluídas</p>
          <p className="text-success text-lg font-semibold">
            {kpis.completedOrders}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-muted-foreground text-xs">Execuções</p>
          <p className="text-foreground text-lg font-semibold">
            {kpis.totalExecutions}
          </p>
        </Card>
      </div>

      <div className="border-border flex gap-2 overflow-x-auto border-b">
        {[
          { key: 'services', label: 'Serviços' },
          { key: 'orders', label: 'Ordens' },
          { key: 'executions', label: 'Execuções' },
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

      {activeTab === 'services' && (
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
                placeholder="Buscar serviços..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <Button onClick={() => alert('Formulário de novo serviço')}>
              <Plus className="mr-2 h-4 w-4" />
              Novo serviço
            </Button>
          </div>

          {filteredServices.length === 0 ? (
            <EmptyState
              title="Nenhum serviço cadastrado"
              description="Quando houver serviços registrados, eles aparecerão aqui."
              actionLabel="Novo serviço"
              onAction={() => alert('Formulário de novo serviço')}
            />
          ) : (
            <div className="border-border overflow-x-auto rounded-xl border">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Nome
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Descrição
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {filteredServices.map((service) => (
                    <tr key={service.id} className="hover:bg-muted">
                      <td className="text-foreground px-4 py-3">
                        {service.name}
                      </td>
                      <td className="text-muted-foreground px-4 py-3">
                        {service.description ?? '-'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={service.active ? 'success' : 'secondary'}
                        >
                          {service.active ? 'Ativo' : 'Inativo'}
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

      {activeTab === 'orders' && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-end">
            <Button
              onClick={() => alert('Formulário de nova ordem de serviço')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova ordem
            </Button>
          </div>

          {orders.length === 0 ? (
            <EmptyState
              title="Nenhuma ordem de serviço registrada"
              description="Quando houver ordens registradas, elas aparecerão aqui."
              actionLabel="Nova ordem"
              onAction={() => alert('Formulário de nova ordem de serviço')}
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
                      Valor
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Status
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Data criação
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted">
                      <td className="text-foreground px-4 py-3">
                        {order.location ?? '-'}
                      </td>
                      <td className="text-foreground px-4 py-3">
                        {order.value != null
                          ? formatCurrency(order.value)
                          : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            order.status === 'completed'
                              ? 'success'
                              : order.status === 'in_progress'
                                ? 'warning'
                                : order.status === 'cancelled'
                                  ? 'danger'
                                  : 'secondary'
                          }
                        >
                          {order.status === 'completed'
                            ? 'Concluída'
                            : order.status === 'in_progress'
                              ? 'Em andamento'
                              : order.status === 'cancelled'
                                ? 'Cancelada'
                                : 'Aberta'}
                        </Badge>
                      </td>
                      <td className="text-muted-foreground px-4 py-3">
                        {new Date(order.created_at).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'executions' && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-end">
            <Button onClick={() => alert('Formulário de nova execução')}>
              <Plus className="mr-2 h-4 w-4" />
              Nova execução
            </Button>
          </div>

          {executions.length === 0 ? (
            <EmptyState
              title="Nenhuma execução registrada"
              description="Quando houver execuções, elas aparecerão aqui."
              actionLabel="Nova execução"
              onAction={() => alert('Formulário de nova execução')}
            />
          ) : (
            <div className="border-border overflow-x-auto rounded-xl border">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Ordem
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Executado por
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Início
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Fim
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {executions.map((execution) => (
                    <tr key={execution.id} className="hover:bg-muted">
                      <td className="text-foreground px-4 py-3">
                        {execution.service_order_id}
                      </td>
                      <td className="text-foreground px-4 py-3">
                        {execution.executed_by || '—'}
                      </td>
                      <td className="text-muted-foreground px-4 py-3">
                        {new Date(execution.started_at).toLocaleString('pt-BR')}
                      </td>
                      <td className="text-muted-foreground px-4 py-3">
                        {execution.finished_at
                          ? new Date(execution.finished_at).toLocaleString(
                              'pt-BR',
                            )
                          : '—'}
                      </td>
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
