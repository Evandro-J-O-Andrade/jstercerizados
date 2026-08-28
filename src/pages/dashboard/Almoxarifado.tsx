'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState, ErrorState } from '@/components/fallback';
import { warehouseRepository } from '@/repositories/warehouse.repository';
import type {
  Warehouse,
  WarehouseEntry,
  WarehouseIssue,
  WarehouseReturn,
  WarehouseCustody,
  EPI,
} from '@/types/domain/warehouse';
import { useAuth } from '@/contexts/AuthContext';

type Tab =
  'warehouses' | 'entries' | 'issues' | 'returns' | 'custodies' | 'epis';

export default function Almoxarifado() {
  const { currentTenantId } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('warehouses');
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [entries, setEntries] = useState<WarehouseEntry[]>([]);
  const [issues, setIssues] = useState<WarehouseIssue[]>([]);
  const [returns, setReturns] = useState<WarehouseReturn[]>([]);
  const [custodies, setCustodies] = useState<WarehouseCustody[]>([]);
  const [epis, setEpis] = useState<EPI[]>([]);
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
      warehouseRepository.findCustodies(currentTenantId),
      warehouseRepository.findEPIs(currentTenantId),
    ])
      .then(([w, e, i, r, c, p]) => {
        setWarehouses(w);
        setEntries(e);
        setIssues(i);
        setReturns(r);
        setCustodies(c);
        setEpis(p);
      })
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : 'Erro ao carregar almoxarifado',
        ),
      )
      .finally(() => setLoading(false));
  }, [currentTenantId]);

  const filteredWarehouses = useMemo(() => {
    let data = warehouses;
    if (search) {
      const term = search.toLowerCase();
      data = data.filter(
        (w) =>
          w.name.toLowerCase().includes(term) ||
          w.location.toLowerCase().includes(term),
      );
    }
    return data;
  }, [warehouses, search]);

  const kpis = useMemo(() => {
    const totalWarehouses = warehouses.length;
    const activeWarehouses = warehouses.filter(
      (w) => w.status === 'active',
    ).length;
    const totalEntries = entries.length;
    const totalIssues = issues.length;
    const totalReturns = returns.length;
    const totalCustodies = custodies.length;
    const totalEpis = epis.length;
    return {
      totalWarehouses,
      activeWarehouses,
      totalEntries,
      totalIssues,
      totalReturns,
      totalCustodies,
      totalEpis,
    };
  }, [warehouses, entries, issues, returns, custodies, epis]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground text-sm">
          Carregando almoxarifado...
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
          <h1 className="text-foreground text-xl font-semibold">
            Almoxarifado
          </h1>
          <p className="text-muted-foreground text-sm">
            Entradas, saídas, devoluções, custódia e EPI.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => alert('Exportar relatório de almoxarifado...')}
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="p-4">
          <p className="text-muted-foreground text-xs">Almoxarifados</p>
          <p className="text-foreground text-lg font-semibold">
            {kpis.totalWarehouses}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-muted-foreground text-xs">Ativos</p>
          <p className="text-success text-lg font-semibold">
            {kpis.activeWarehouses}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-muted-foreground text-xs">Entradas</p>
          <p className="text-foreground text-lg font-semibold">
            {kpis.totalEntries}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-muted-foreground text-xs">Saídas</p>
          <p className="text-foreground text-lg font-semibold">
            {kpis.totalIssues}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-muted-foreground text-xs">Devoluções</p>
          <p className="text-foreground text-lg font-semibold">
            {kpis.totalReturns}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-muted-foreground text-xs">Custódias</p>
          <p className="text-foreground text-lg font-semibold">
            {kpis.totalCustodies}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-muted-foreground text-xs">EPIs</p>
          <p className="text-foreground text-lg font-semibold">
            {kpis.totalEpis}
          </p>
        </Card>
      </div>

      <div className="border-border flex gap-2 overflow-x-auto border-b">
        {[
          { key: 'warehouses', label: 'Almoxarifados' },
          { key: 'entries', label: 'Entradas' },
          { key: 'issues', label: 'Saídas' },
          { key: 'returns', label: 'Devoluções' },
          { key: 'custodies', label: 'Custódias' },
          { key: 'epis', label: 'EPIs' },
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

      {activeTab === 'warehouses' && (
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
            <div className="border-border overflow-x-auto rounded-xl border">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Nome
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Localização
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Responsável
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {filteredWarehouses.map((warehouse) => (
                    <tr key={warehouse.id} className="hover:bg-muted">
                      <td className="text-foreground px-4 py-3">
                        {warehouse.name}
                      </td>
                      <td className="text-muted-foreground px-4 py-3">
                        {warehouse.location}
                      </td>
                      <td className="text-muted-foreground px-4 py-3">
                        {warehouse.manager || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            warehouse.status === 'active'
                              ? 'success'
                              : 'secondary'
                          }
                        >
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
            <div className="border-border overflow-x-auto rounded-xl border">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Almoxarifado
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Quantidade
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Fornecedor
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Data recebimento
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-muted">
                      <td className="text-foreground px-4 py-3">
                        {entry.warehouse_id}
                      </td>
                      <td className="text-foreground px-4 py-3">
                        {entry.quantity}
                      </td>
                      <td className="text-muted-foreground px-4 py-3">
                        {entry.supplier || '—'}
                      </td>
                      <td className="text-muted-foreground px-4 py-3">
                        {new Date(entry.received_at).toLocaleDateString(
                          'pt-BR',
                        )}
                      </td>
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
            <div className="border-border overflow-x-auto rounded-xl border">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Almoxarifado
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Quantidade
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Solicitante
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Departamento
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Data saída
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {issues.map((issue) => (
                    <tr key={issue.id} className="hover:bg-muted">
                      <td className="text-foreground px-4 py-3">
                        {issue.warehouse_id}
                      </td>
                      <td className="text-foreground px-4 py-3">
                        {issue.quantity}
                      </td>
                      <td className="text-muted-foreground px-4 py-3">
                        {issue.requester || '—'}
                      </td>
                      <td className="text-muted-foreground px-4 py-3">
                        {issue.department || '—'}
                      </td>
                      <td className="text-muted-foreground px-4 py-3">
                        {new Date(issue.issued_at).toLocaleDateString('pt-BR')}
                      </td>
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
            <div className="border-border overflow-x-auto rounded-xl border">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Almoxarifado
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Quantidade
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Motivo
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Data devolução
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {returns.map((ret) => (
                    <tr key={ret.id} className="hover:bg-muted">
                      <td className="text-foreground px-4 py-3">
                        {ret.warehouse_id}
                      </td>
                      <td className="text-foreground px-4 py-3">
                        {ret.quantity}
                      </td>
                      <td className="text-muted-foreground px-4 py-3">
                        {ret.reason}
                      </td>
                      <td className="text-muted-foreground px-4 py-3">
                        {new Date(ret.returned_at).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'custodies' && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-end">
            <Button onClick={() => alert('Formulário de nova custódia')}>
              <Plus className="mr-2 h-4 w-4" />
              Nova custódia
            </Button>
          </div>

          {custodies.length === 0 ? (
            <EmptyState
              title="Nenhuma custódia registrada"
              description="Quando houver custódias, elas aparecerão aqui."
              actionLabel="Nova custódia"
              onAction={() => alert('Formulário de nova custódia')}
            />
          ) : (
            <div className="border-border overflow-x-auto rounded-xl border">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Almoxarifado
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Funcionário
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Quantidade
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {custodies.map((item) => (
                    <tr key={item.id} className="hover:bg-muted">
                      <td className="text-foreground px-4 py-3">
                        {item.warehouse_id}
                      </td>
                      <td className="text-foreground px-4 py-3">
                        {item.employee_id || '—'}
                      </td>
                      <td className="text-foreground px-4 py-3">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            item.status === 'active' ? 'success' : 'secondary'
                          }
                        >
                          {item.status === 'active' ? 'Ativa' : 'Devolvida'}
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

      {activeTab === 'epis' && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-end">
            <Button onClick={() => alert('Formulário de novo EPI')}>
              <Plus className="mr-2 h-4 w-4" />
              Novo EPI
            </Button>
          </div>

          {epis.length === 0 ? (
            <EmptyState
              title="Nenhum EPI registrado"
              description="Quando houver EPIs, eles aparecerão aqui."
              actionLabel="Novo EPI"
              onAction={() => alert('Formulário de novo EPI')}
            />
          ) : (
            <div className="border-border overflow-x-auto rounded-xl border">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Almoxarifado
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Funcionário
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Quantidade
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {epis.map((item) => (
                    <tr key={item.id} className="hover:bg-muted">
                      <td className="text-foreground px-4 py-3">
                        {item.warehouse_id}
                      </td>
                      <td className="text-foreground px-4 py-3">
                        {item.employee_id || '—'}
                      </td>
                      <td className="text-foreground px-4 py-3">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            item.status === 'active' ? 'success' : 'secondary'
                          }
                        >
                          {item.status === 'active' ? 'Ativo' : 'Devolvido'}
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
    </div>
  );
}
