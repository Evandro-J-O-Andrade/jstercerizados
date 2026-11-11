'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/fallback/ErrorState';
import { EmptyState } from '@/components/fallback/EmptyState';
import { RouteLoadingFallback } from '@/components/ui/RouteLoadingFallback';
import { CompanyForm } from '@/modules/empresas/components/CompanyForm';
import { StatusBadge } from '@/modules/empresas/dashboard/EmpresasDashboardPage';
import { useAuth } from '@/contexts/AuthContext';
import { companiesRepository } from '@/repositories/companies.repository';
import type { Company, CompanyStatus } from '@/types/domain/company';
import type { CompanyFormData } from '@/modules/empresas/components/CompanyForm';
import { cn } from '@/utils';

const PAGE_SIZES = [10, 20, 50] as const;
type SortKey = 'name' | 'cnpj' | 'status' | 'updated_at';

/**
 * Listagem de empresas (tenant) — reconstruída: busca, filtros, ordenação, paginação real e exportação CSV
 * sobre os dados carregados do repositório. Fonte: `companiesRepository` (Supabase/RLS).
 */
export default function EmpresasListPage() {
  const navigate = useNavigate();
  const { hasPermission, currentTenantId } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CompanyStatus | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('updated_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(10);
  const requestId = useRef(0);

  const activeTenantId = currentTenantId;
  const canCreate = hasPermission('companies.create');
  const canUpdate = hasPermission('companies.update');
  const canDelete = hasPermission('companies.delete');

  const loadCompanies = useCallback(async () => {
    const currentRequest = ++requestId.current;
    if (!activeTenantId) {
      setCompanies([]);
      setError(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await companiesRepository.findAll(activeTenantId);
      if (currentRequest !== requestId.current) return;
      setCompanies(data ?? []);
    } catch (err) {
      if (currentRequest !== requestId.current) return;
      setCompanies([]);
      setError(err instanceof Error ? err.message : 'Não foi possível carregar as empresas.');
    } finally {
      if (currentRequest === requestId.current) setIsLoading(false);
    }
  }, [activeTenantId]);

  useEffect(() => {
    void loadCompanies();
  }, [loadCompanies]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, pageSize]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = companies.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (!q) return true;
      const hay = [c.name, c.trading_name, c.legal_name, c.cnpj, c.email, c.phone, c.industry]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
    rows = [...rows].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      const va = getSortValue(a, sortKey);
      const vb = getSortValue(b, sortKey);
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return rows;
  }, [companies, search, statusFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleSubmit = async (data: CompanyFormData) => {
    if (!activeTenantId) {
      setError('Selecione um tenant antes de cadastrar uma empresa.');
      return;
    }
    try {
      await companiesRepository.create(data, activeTenantId);
      setIsModalOpen(false);
      await loadCompanies();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a empresa.');
    }
  };

  const handleDelete = async (company: Company) => {
    if (!activeTenantId || !canDelete) return;
    if (!window.confirm(`Remover a empresa "${company.trading_name || company.name}"?`)) return;
    try {
      await companiesRepository.delete(company.id, activeTenantId);
      await loadCompanies();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível remover a empresa.');
    }
  };

  const exportCsv = () => {
    const headers = ['Nome', 'Nome fantasia', 'CNPJ', 'Status', 'E-mail', 'Telefone', 'Atualizado em'];
    const lines = filtered.map((c) =>
      [
        c.name ?? '',
        c.trading_name ?? '',
        c.cnpj ?? '',
        c.status ?? '',
        c.email ?? '',
        c.phone ?? '',
        c.updated_at ?? c.created_at ?? '',
      ]
        .map(csvCell)
        .join(';'),
    );
    const csv = [headers.join(';'), ...lines].join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `empresas-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir(key === 'updated_at' ? 'desc' : 'asc');
    }
  };

  if (isLoading) return <RouteLoadingFallback />;

  if (!activeTenantId) {
    return (
      <div className="p-4 sm:p-6">
        <EmptyState title="Selecione um tenant" description="Escolha um tenant ativo para consultar empresas com dados reais." />
      </div>
    );
  }

  if (error && companies.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <ErrorState title="Erro ao carregar empresas" message={error} onRetry={() => void loadCompanies()} retryLabel="Tentar novamente" />
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
            <Building2 className="h-4 w-4" aria-hidden /> Empresas
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Listagem de empresas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pesquisa, filtros, ordenação e paginação sobre registros reais do tenant ativo.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => void loadCompanies()}>
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden /> Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={filtered.length === 0}>
            <Download className="mr-2 h-4 w-4" aria-hidden /> Exportar CSV
          </Button>
          {canCreate && (
            <Button size="sm" onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" aria-hidden /> Nova empresa
            </Button>
          )}
        </div>
      </header>

      {error && (
        <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="space-y-1 sm:col-span-2">
              <span className="text-xs font-medium text-muted-foreground">Pesquisar</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nome, fantasia, CNPJ, e-mail, telefone..."
                  className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-label="Pesquisar empresas"
                />
                {search && (
                  <button type="button" onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground" aria-label="Limpar pesquisa">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Situação</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as CompanyStatus | 'all')}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Filtrar por situação"
              >
                <option value="all">Todas</option>
                <option value="active">Ativa</option>
                <option value="pending">Pendente</option>
                <option value="inactive">Inativa</option>
                <option value="suspended">Suspensa</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Itens por página</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value) as (typeof PAGE_SIZES)[number])}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Itens por página"
              >
                {PAGE_SIZES.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
            {filtered.length} de {companies.length} registro(s)
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          title={companies.length === 0 ? 'Nenhuma empresa' : 'Nenhum resultado'}
          description={
            companies.length === 0
              ? 'Não há empresas cadastradas para o tenant selecionado.'
              : 'Ajuste a pesquisa ou os filtros para encontrar registros.'
          }
          actionLabel={canCreate && companies.length === 0 ? 'Nova empresa' : undefined}
          onAction={canCreate && companies.length === 0 ? () => setIsModalOpen(true) : undefined}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="bg-muted/40">
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <Th label="Empresa" sortKey="name" active={sortKey} dir={sortDir} onSort={toggleSort} />
                  <Th label="CNPJ" sortKey="cnpj" active={sortKey} dir={sortDir} onSort={toggleSort} />
                  <Th label="Situação" sortKey="status" active={sortKey} dir={sortDir} onSort={toggleSort} />
                  <th className="px-4 py-3 font-medium">Contato</th>
                  <Th label="Atualização" sortKey="updated_at" active={sortKey} dir={sortDir} onSort={toggleSort} />
                  <th className="px-4 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((company) => (
                  <tr key={company.id} className="border-b border-border/60 transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Building2 className="h-4 w-4" aria-hidden />
                        </span>
                        <div className="min-w-0">
                          <Link to={`/dashboard/empresas/${company.id}`} className="block truncate font-medium text-foreground hover:text-primary hover:underline">
                            {company.trading_name || company.legal_name || company.name}
                          </Link>
                          <span className="block truncate text-xs text-muted-foreground">{company.industry || company.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">{company.cnpj || '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={company.status} /></td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <span className="block truncate">{company.email || '—'}</span>
                      <span className="block truncate text-xs">{company.phone || ''}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(company.updated_at || company.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/empresas/${company.id}`)} aria-label={`Ver ${company.name}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canUpdate && (
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/empresas/${company.id}/editar`)} aria-label={`Editar ${company.name}`}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button variant="ghost" size="sm" onClick={() => void handleDelete(company)} aria-label={`Remover ${company.name}`}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Página {safePage} de {totalPages} · {filtered.length} registro(s)
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1} aria-label="Página anterior">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[6rem] text-center text-xs text-muted-foreground">{safePage} / {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages} aria-label="Próxima página">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Nova empresa">
          <div className="card-base card-border-refined w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-foreground">Nova empresa</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)} aria-label="Fechar">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Cadastro com campos suportados pelo contrato atual. Campos/relacionamentos adicionais dependem de reconciliação de schema.
            </p>
            <CompanyForm
              open={true}
              tenantId={activeTenantId || ''}
              editingCompany={null}
              onSubmit={handleSubmit}
              onCancel={() => setIsModalOpen(false)}
              embedded
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Th({
  label,
  sortKey,
  active,
  dir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  active: SortKey;
  dir: 'asc' | 'desc';
  onSort: (k: SortKey) => void;
}) {
  const isActive = active === sortKey;
  return (
    <th className="px-4 py-3 font-medium">
      <button type="button" onClick={() => onSort(sortKey)} className={cn('inline-flex items-center gap-1 hover:text-foreground', isActive && 'text-foreground')}>
        {label}
        <span className="text-[10px]" aria-hidden>{isActive ? (dir === 'asc' ? '▲' : '▼') : '↕'}</span>
      </button>
    </th>
  );
}

function getSortValue(c: Company, key: SortKey): string | number {
  switch (key) {
    case 'name':
      return (c.trading_name || c.legal_name || c.name || '').toLowerCase();
    case 'cnpj':
      return (c.cnpj || '').replace(/\D/g, '');
    case 'status':
      return c.status || '';
    case 'updated_at':
      return new Date(c.updated_at || c.created_at || 0).getTime();
    default:
      return '';
  }
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function csvCell(value: string): string {
  const v = String(value ?? '');
  if (/[;"\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}
