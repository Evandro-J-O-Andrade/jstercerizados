'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState, ErrorState } from '@/components/fallback';
import { warehouseRepository } from '@/repositories/warehouse.repository';
import type { Warehouse, WarehouseEntry, WarehouseIssue, WarehouseReturn } from '@/types/domain/warehouse';
import { useAuth } from '@/contexts/AuthContext';

type Tab = 'warehouses' | 'entries' | 'issues' | 'returns';

export default function Almoxarifado() {
  const { currentTenantId } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('warehouses');
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [entries, setEntries] = useState<WarehouseEntry[]>([]);
  const [issues, setIssues] = useState<WarehouseIssue[]>([]);
  const [returns, setReturns] = useState<WarehouseReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!currentTenantId) return;
    setLoading(true);
    setError(null);
    Promise.all([
      warehouseRepository.findAll(currentTenantId),
      warehouseRepository.findEntries(currentTenantId),
      warehouseRepository.findIssues(currentTenantId),
      warehouseRepository.findReturns(currentTenantId),
    ]).then(([w, e, i, r]) => {
      setWarehouses(w);
      setEntries(e);
      setIssues(i);
      setReturns(r);
    }).catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar almoxarifado'))
      .finally(() => setLoading(false));
  }, [currentTenantId]);

  const filteredWarehouses = useMemo(() => {
    let data = warehouses;
    if (search) {
      const term = search.toLowerCase();
      data = data.filter((w) =>
        w.name.toLowerCase().includes(term) ||
        w.location.toLowerCase().includes(term)
      );
    }
    return data;
  }, [warehouses, search]);

  const kpis = useMemo(() => {
    const totalWarehouses = warehouses.length;
    const activeWarehouses = warehouses.filter((w) => w.status === 'active').length;
    const totalEntries = entries.length;
    const totalIssues = issues.length;
    const totalReturns = returns.length;
    return { totalWarehouses, activeWarehouses, totalEntries, totalIssues, totalReturns };
  }, [warehouses, entries, issues, returns]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Carregando almoxarifado...</p>
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
          <h1 className="text-xl font-semibold text-foreground">Almoxarifado</h1>
          <p className="text-sm text-muted-foreground">Entradas, saídas, devoluções, custódia e EPI.</p>
        </div>
        <Button variant="secondary" onClick={() => alert('Exportar relatório de almoxarifado...')}>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Almoxarifados</p>
          <p className="text-lg font-semibold text-foreground">{kpis.totalWarehouses}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Ativos</p>
          <p className="text-lg font-semibold text-success">{kpis.activeWarehouses}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Entradas</p>
          <p className="text-lg font-semibold text-foreground">{kpis.totalEntries}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Saídas</p>
          <p className="text-lg font-semibold text-foreground">{kpis.totalIssues}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Devoluções</p>
          <p className="text-lg font-semibold text-foreground">{kpis.totalReturns}</p>
        </Card>
      </div>

      <div className="flex gap-2 border-b border-border overflow-x-auto">
        {[
          { key: 'warehouses', label: 'Almoxarifados' },
          { key: 'entries', label: 'Entradas' },
          { key: 'issues', label: 'Saídas' },
          { key: 'returns', label: 'Devoluções' },
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

      {activeTab === 'warehouses' && (
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
                placeholder="Buscar almoxarifado..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <Button onClick={() => alert('Formulário de novo almoxarifado')}>
              <Plus className="mr-2 h-4 w-4" />
              Novo almoxarifado
            </Button>
          </div>

          {filteredWarehouses.length === 0 ? (
            <EmptyState
              title="Nenhum almoxarifado cadastrado"
              description="Quando houver almoxarifados registrados, eles aparecerão aqui."
              actionLabel="Novo almoxarifado"
              onAction={() => alert('Formulário de novo almoxarifado')}
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Nome</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Localização</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Responsável</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredWarehouses.map((warehouse) => (
                    <tr key={warehouse.id} className="hover:bg-muted">
                      <td className="px-4 py-3 text-foreground">{warehouse.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{warehouse.location}</td>
                      <td className="px-4 py-3 text-muted-foreground">{warehouse.manager || '—'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={warehouse.status === 'active' ? 'success' : 'secondary'}>
                          {warehouse.status === 'active' ? 'Ativo' : 'Inativo'}
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

      {activeTab === 'entries' && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-end">
            <Button onClick={() => alert('Formulário de nova entrada')}>
              <Plus className="mr-2 h-4 w-4" />
              Nova entrada
            </Button>
          </div>

          {entries.length === 0 ? (
            <EmptyState
              title="Nenhuma entrada registrada"
              description="Quando houver entradas, elas aparecerão aqui."
              actionLabel="Nova entrada"
              onAction={() => alert('Formulário de nova entrada')}
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Almoxarifado</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Quantidade</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Fornecedor</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Data recebimento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-muted">
                      <td className="px-4 py-3 text-foreground">{entry.warehouse_id}</td>
                      <td className="px-4 py-3 text-foreground">{entry.quantity}</td>
                      <td className="px-4 py-3 text-muted-foreground">{entry.supplier || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(entry.received_at).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'issues' && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-end">
            <Button onClick={() => alert('Formulário de nova saída')}>
              <Plus className="mr-2 h-4 w-4" />
              Nova saída
            </Button>
          </div>

          {issues.length === 0 ? (
            <EmptyState
              title="Nenhuma saída registrada"
              description="Quando houver saídas, elas aparecerão aqui."
              actionLabel="Nova saída"
              onAction={() => alert('Formulário de nova saída')}
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Almoxarifado</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Quantidade</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Solicitante</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Departamento</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Data saída</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {issues.map((issue) => (
                    <tr key={issue.id} className="hover:bg-muted">
                      <td className="px-4 py-3 text-foreground">{issue.warehouse_id}</td>
                      <td className="px-4 py-3 text-foreground">{issue.quantity}</td>
                      <td className="px-4 py-3 text-muted-foreground">{issue.requester || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{issue.department || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(issue.issued_at).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'returns' && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-end">
            <Button onClick={() => alert('Formulário de nova devolução')}>
              <Plus className="mr-2 h-4 w-4" />
              Nova devolução
            </Button>
          </div>

          {returns.length === 0 ? (
            <EmptyState
              title="Nenhuma devolução registrada"
              description="Quando houver devoluções, elas aparecerão aqui."
              actionLabel="Nova devolução"
              onAction={() => alert('Formulário de nova devolução')}
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Almoxarifado</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Quantidade</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Motivo</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Data devolução</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {returns.map((ret) => (
                    <tr key={ret.id} className="hover:bg-muted">
                      <td className="px-4 py-3 text-foreground">{ret.warehouse_id}</td>
                      <td className="px-4 py-3 text-foreground">{ret.quantity}</td>
                      <td className="px-4 py-3 text-muted-foreground">{ret.reason}</td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(ret.returned_at).toLocaleDateString('pt-BR')}</td>
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
