'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState, ErrorState } from '@/components/fallback';
import { fiscalRepository } from '@/repositories/fiscal.repository';
import type {
  FiscalDocument,
  FiscalConfiguration,
} from '@/types/domain/fiscal';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/feedback/ToastContext';

type Tab = 'documents' | 'configuration';

export default function FiscalPage() {
  const { currentTenantId } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('documents');
  const [documents, setDocuments] = useState<FiscalDocument[]>([]);
  const [configs, setConfigs] = useState<FiscalConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!currentTenantId) return;
    setLoading(true);
    setError(null);
    Promise.all([
      fiscalRepository.findAllDocuments(currentTenantId),
      fiscalRepository
        .findConfiguration(currentTenantId)
        .then((cfg) => (cfg ? [cfg] : [])),
    ])
      .then(([docs, cfg]) => {
        setDocuments(docs);
        setConfigs(cfg);
      })
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : 'Erro ao carregar dados fiscais',
        ),
      )
      .finally(() => setLoading(false));
  }, [currentTenantId]);

  const filtered = useMemo(() => {
    let data = documents;
    if (search) {
      const term = search.toLowerCase();
      data = data.filter(
        (doc) =>
          doc.number.toLowerCase().includes(term) ||
          doc.type.toLowerCase().includes(term),
      );
    }
    if (statusFilter !== 'all') {
      data = data.filter((doc) => doc.status === statusFilter);
    }
    return data;
  }, [documents, search, statusFilter]);

  const kpis = useMemo(() => {
    const total = documents.length;
    const issued = documents.filter((d) => d.status === 'issued').length;
    const cancelled = documents.filter((d) => d.status === 'cancelled').length;
    const draft = documents.filter((d) => d.status === 'draft').length;
    return { total, issued, cancelled, draft };
  }, [documents]);

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground text-sm">
          Carregando dados fiscais...
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
          <h1 className="text-foreground text-xl font-semibold">Fiscal</h1>
          <p className="text-muted-foreground text-sm">
            Notas fiscais, emissão e conformidade tributária.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() =>
            addToast({
              type: 'info',
              message: 'Exportar relatório fiscal...',
            })
          }
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-muted-foreground text-xs">Total documentos</p>
          <p className="text-foreground text-lg font-semibold">{kpis.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-muted-foreground text-xs">Emitidas</p>
          <p className="text-success text-lg font-semibold">{kpis.issued}</p>
        </Card>
        <Card className="p-4">
          <p className="text-muted-foreground text-xs">Canceladas</p>
          <p className="text-destructive text-lg font-semibold">
            {kpis.cancelled}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-muted-foreground text-xs">Rascunhos</p>
          <p className="text-warning text-lg font-semibold">{kpis.draft}</p>
        </Card>
      </div>

      <div className="border-border flex gap-2 overflow-x-auto border-b">
        {[
          { key: 'documents', label: 'Documentos' },
          { key: 'configuration', label: 'Configuração' },
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

      {activeTab === 'documents' && (
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
                placeholder="Buscar por número ou tipo..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border-border bg-background rounded-lg border px-3 py-2 text-sm outline-none"
            >
              <option value="all">Todos os status</option>
              <option value="draft">Rascunho</option>
              <option value="issued">Emitida</option>
              <option value="cancelled">Cancelada</option>
              <option value="voided">Inutilizada</option>
            </select>
            <Button onClick={() => addToast({ type: 'info', message: 'Formulário de nova nota fiscal' })}>
              <Plus className="mr-2 h-4 w-4" />
              Nova nota
            </Button>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title="Nenhuma nota fiscal cadastrada"
              description="Quando houver notas fiscais registradas, elas aparecerão aqui."
              actionLabel="Nova nota"
              onAction={() => addToast({ type: 'info', message: 'Formulário de nova nota fiscal' })}
            />
          ) : (
            <div className="border-border overflow-x-auto rounded-xl border">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Tipo
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Número
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Série
                    </th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Data emissão
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
                  {filtered.map((doc) => (
                    <tr key={doc.id} className="hover:bg-muted">
                      <td className="text-foreground px-4 py-3 uppercase">
                        {doc.type}
                      </td>
                      <td className="text-foreground px-4 py-3">
                        {doc.number}
                      </td>
                      <td className="text-muted-foreground px-4 py-3">
                        {doc.series}
                      </td>
                      <td className="text-muted-foreground px-4 py-3">
                        {new Date(doc.issue_date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="text-foreground px-4 py-3">
                        {formatCurrency(doc.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            doc.status === 'issued'
                              ? 'success'
                              : doc.status === 'cancelled'
                                ? 'danger'
                                : doc.status === 'voided'
                                  ? 'secondary'
                                  : 'warning'
                          }
                        >
                          {doc.status === 'issued'
                            ? 'Emitida'
                            : doc.status === 'cancelled'
                              ? 'Cancelada'
                              : doc.status === 'voided'
                                ? 'Inutilizada'
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

      {activeTab === 'configuration' && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-foreground text-sm font-semibold">
                  Configuração fiscal
                </h3>
                <p className="text-muted-foreground text-xs">
                  Regime tributário, inscrições, certificado digital e ambiente
                  de emissão.
                </p>
              </div>
              <Button
                onClick={() => addToast({ type: 'info', message: 'Formulário de configuração fiscal' })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Editar configuração
              </Button>
            </div>

            {configs.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Nenhuma configuração fiscal cadastrada.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {configs.map((cfg) => (
                  <div
                    key={cfg.id}
                    className="border-border rounded-xl border p-4"
                  >
                    <p className="text-foreground text-sm font-medium">
                      {cfg.fiscal_regime || 'Sem regime'}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      IE: {cfg.state_registration || '—'}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      CNAE: {cfg.cnae || '—'}
                    </p>
                    <span className="text-muted-foreground text-xs">
                      {cfg.environment === 'production'
                        ? 'Produção'
                        : 'Homologação'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      )}
    </div>
  );
}
