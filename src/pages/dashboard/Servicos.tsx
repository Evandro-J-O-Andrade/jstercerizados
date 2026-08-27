'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState, ErrorState } from '@/components/fallback';
import { servicesRepository } from '@/repositories/services.repository';
import type { Service, ServiceOrder } from '@/types/domain/service';
import { useAuth } from '@/contexts/AuthContext';

type Tab = 'services' | 'orders';

export default function Servicos() {
  const { currentTenantId } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('services');
  const [services, setServices] = useState<Service[]>([]);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
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
    ]).then(([s, o]) => {
      setServices(s);
      setOrders(o);
    }).catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar serviços'))
      .finally(() => setLoading(false));
  }, [currentTenantId]);

  const filteredServices = useMemo(() => {
    let data = services;
    if (search) {
      const term = search.toLowerCase();
      data = data.filter((s) =>
        s.name.toLowerCase().includes(term)
      );
    }
    return data;
  }, [services, search]);

  const kpis = useMemo(() => {
    const totalServices = services.length;
    const activeServices = services.filter((s) => s.active).length;
    const openOrders = orders.filter((o) => o.status === 'open').length;
    const completedOrders = orders.filter((o) => o.status === 'completed').length;
    return { totalServices, activeServices, openOrders, completedOrders };
  }, [services, orders]);

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Carregando serviços...</p>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Serviços</h1>
          <p className="text-sm text-muted-foreground">Catálogo e ordens de serviço.</p>
        </div>
        <Button variant="secondary" onClick={() => alert('Exportar relatório de serviços...')}>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Serviços cadastrados</p>
          <p className="text-lg font-semibold text-foreground">{kpis.totalServices}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Serviços ativos</p>
          <p className="text-lg font-semibold text-success">{kpis.activeServices}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Ordens abertas</p>
          <p className="text-lg font-semibold text-warning">{kpis.openOrders}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Ordens concluídas</p>
          <p className="text-lg font-semibold text-success">{kpis.completedOrders}</p>
        </Card>
      </div>

      <div className="flex gap-2 border-b border-border overflow-x-auto">
        {[
          { key: 'services', label: 'Catálogo' },
          { key: 'orders', label: 'Ordens de serviço' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as Tab)}
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

      {activeTab === 'services' && (
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
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Nome</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Descrição</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredServices.map((service) => (
                    <tr key={service.id} className="hover:bg-muted">
                      <td className="px-4 py-3 text-foreground">{service.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{service.description ?? '-'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={service.active ? 'success' : 'secondary'}>
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
            <Button onClick={() => alert('Formulário de nova ordem de serviço')}>
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
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Descrição</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Valor</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Data criação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted">
                      <td className="px-4 py-3 text-foreground">{order.location ?? '-'}</td>
                      <td className="px-4 py-3 text-foreground">{order.value != null ? formatCurrency(order.value) : '-'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={
                          order.status === 'completed' ? 'success' :
                          order.status === 'in_progress' ? 'warning' :
                          order.status === 'cancelled' ? 'danger' : 'secondary'
                        }>
                          {order.status === 'completed' ? 'Concluída' : order.status === 'in_progress' ? 'Em andamento' : order.status === 'cancelled' ? 'Cancelada' : 'Aberta'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(order.created_at).toLocaleDateString('pt-BR')}</td>
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
