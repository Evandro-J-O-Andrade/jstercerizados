'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState, ErrorState } from '@/components/fallback';
import { fiscalRepository } from '@/repositories/fiscal.repository';
import type { FiscalDocument } from '@/types/domain/fiscal';
import { useAuth } from '@/contexts/AuthContext';

type Tab = 'documents' | 'configuration';

export default function FiscalPage() {
  const { currentTenantId } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('documents');
  const [documents, setDocuments] = useState<FiscalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!currentTenantId) return;
    setLoading(true);
    setError(null);
    fiscalRepository.findAllDocuments(currentTenantId)
      .then(setDocuments)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar documentos fiscais'))
      .finally(() => setLoading(false));
  }, [currentTenantId]);

  const filtered = useMemo(() => {
    let data = documents;
    if (search) {
      const term = search.toLowerCase();
      data = data.filter((doc) =>
        doc.number.toLowerCase().includes(term) ||
        doc.type.toLowerCase().includes(term)
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
        <p className="text-sm text-muted-foreground">Carregando dados fiscais...</p>
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
          <h1 className="text-xl font-semibold text-foreground">Fiscal</h1>
          <p className="text-sm text-muted-foreground">Notas fiscais, emissão e conformidade tributária.</p>
        </div>
        <Button variant="secondary" onClick={() => alert('Exportar relatório fiscal...')}>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Total documentos</p>
          <p className="text-lg font-semibold text-foreground">{kpis.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Emitidas</p>
          <p className="text-lg font-semibold text-success">{kpis.issued}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Canceladas</p>
          <p className="text-lg font-semibold text-destructive">{kpis.cancelled}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Rascunhos</p>
          <p className="text-lg font-semibold text-warning">{kpis.draft}</p>
        </Card>
      </div>

      <div className="flex gap-2 border-b border-border overflow-x-auto">
        {[
          { key: 'documents', label: 'Documentos' },
          { key: 'configuration', label: 'Configuração' },
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

      {activeTab === 'documents' && (
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
                placeholder="Buscar por número ou tipo..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
            >
              <option value="all">Todos os status</option>
              <option value="draft">Rascunho</option>
              <option value="issued">Emitida</option>
              <option value="cancelled">Cancelada</option>
              <option value="voided">Inutilizada</option>
            </select>
            <Button onClick={() => alert('Formulário de nova nota fiscal')}>
              <Plus className="mr-2 h-4 w-4" />
              Nova nota
            </Button>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title="Nenhuma nota fiscal cadastrada"
              description="Quando houver notas fiscais registradas, elas aparecerão aqui."
              actionLabel="Nova nota"
              onAction={() => alert('Formulário de nova nota fiscal')}
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Número</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Série</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Data emissão</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Valor</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((doc) => (
                    <tr key={doc.id} className="hover:bg-muted">
                      <td className="px-4 py-3 text-foreground uppercase">{doc.type}</td>
                      <td className="px-4 py-3 text-foreground">{doc.number}</td>
                      <td className="px-4 py-3 text-muted-foreground">{doc.series}</td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(doc.issue_date).toLocaleDateString('pt-BR')}</td>
                      <td className="px-4 py-3 text-foreground">{formatCurrency(doc.amount)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={
                          doc.status === 'issued' ? 'success' :
                          doc.status === 'cancelled' ? 'danger' :
                          doc.status === 'voided' ? 'secondary' : 'warning'
                        }>
                          {doc.status === 'issued' ? 'Emitida' : doc.status === 'cancelled' ? 'Cancelada' : doc.status === 'voided' ? 'Inutilizada' : 'Rascunho'}
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
            <h3 className="mb-4 text-sm font-semibold text-foreground">Configuração fiscal</h3>
            <p className="text-sm text-muted-foreground">
              Regime tributário, inscrições, certificado digital e ambiente de emissão.
            </p>
            <div className="mt-4">
              <Button onClick={() => alert('Formulário de configuração fiscal')}>
                <Plus className="mr-2 h-4 w-4" />
                Editar configuração
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
