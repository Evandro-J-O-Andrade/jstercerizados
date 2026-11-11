'use client';

import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Calendar,
  ExternalLink,
  FileText,
  Globe,
  History,
  Info,
  Mail,
  MapPin,
  Pencil,
  Phone,
  RefreshCw,
  Trash2,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ErrorState } from '@/components/fallback/ErrorState';
import { EmptyState } from '@/components/fallback/EmptyState';
import { RouteLoadingFallback } from '@/components/ui/RouteLoadingFallback';
import { companiesRepository } from '@/repositories/companies.repository';
import { useAuth } from '@/contexts/AuthContext';
import type { Company } from '@/types/domain/company';
import { CompanyForm, type CompanyFormData } from '@/modules/empresas/components/CompanyForm';
import { StatusBadge } from '@/modules/empresas/dashboard/EmpresasDashboardPage';
import { classifyUuidRouteParam } from '@/utils/uuid';
import { cn } from '@/utils';

/**
 * Detalhe de empresa por identificador de rota, escopado ao tenant ativo.
 * Valida UUID de rota para evitar consultas inválidas; usa estados canônicos.
 */
export default function EmpresaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTenantId, hasPermission } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeTenantId = currentTenantId;
  const idParam = classifyUuidRouteParam(id);
  const validId = idParam.kind === 'valid' ? idParam.value : null;
  const canUpdate = hasPermission('companies.update');
  const canDelete = hasPermission('companies.delete');

  const loadCompany = useCallback(async () => {
    if (!activeTenantId) {
      setCompany(null);
      setError(null);
      setLoading(false);
      return;
    }
    if (!validId) {
      setCompany(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    let cancelled = false;
    try {
      const data = await companiesRepository.findById(validId, activeTenantId);
      if (cancelled) return;
      setCompany(data);
      if (!data) setError('Empresa não encontrada para o tenant selecionado.');
    } catch (err) {
      if (cancelled) return;
      setCompany(null);
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar os dados da empresa.',
      );
    } finally {
      if (!cancelled) setLoading(false);
    }
    return () => {
      cancelled = true;
    };
  }, [activeTenantId, validId]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    void (async () => {
      cleanup = await loadCompany();
    })();
    return () => cleanup?.();
  }, [loadCompany]);

  const handleBack = () => {
    navigate('/dashboard/empresas/lista');
  };

  const handleSave = async (formData: CompanyFormData) => {
    if (!validId || !activeTenantId) return;
    try {
      const updated = await companiesRepository.update(
        validId,
        activeTenantId,
        formData,
      );
      if (updated) setCompany(updated);
      setEditing(false);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível atualizar a empresa.',
      );
    }
  };

  const handleDelete = async () => {
    if (!validId || !activeTenantId) return;
    if (!window.confirm('Tem certeza que deseja remover esta empresa?')) return;
    try {
      setDeleting(true);
      await companiesRepository.delete(validId, activeTenantId);
      navigate('/dashboard/empresas/lista');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível remover a empresa.',
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <RouteLoadingFallback />;

  if (!activeTenantId) {
    return (
      <div className="p-4 sm:p-6">
        <EmptyState
          title="Selecione um tenant"
          description="Escolha um tenant ativo para acessar os detalhes da empresa."
        />
      </div>
    );
  }

  if (idParam.kind === 'invalid') {
    return (
      <div className="p-4 sm:p-6">
        <ErrorState
          title="Identificador inválido"
          message="O identificador informado na rota não é válido."
          onBack={handleBack}
          backLabel="Voltar para a lista"
        />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="p-4 sm:p-6">
        <ErrorState
          title="Não foi possível abrir a empresa"
          message={error || 'Empresa não encontrada para o tenant selecionado.'}
          onRetry={() => void loadCompany()}
          retryLabel="Tentar novamente"
          onBack={handleBack}
          backLabel="Voltar para a lista"
        />
      </div>
    );
  }

  const displayName = company.trading_name || company.legal_name || company.name || 'Empresa';
  const address = (company.address ?? {}) as Record<string, unknown>;
  const addressLine = [address.street, address.city, address.state, address.zip].filter(Boolean).join(', ');

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <nav className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
            <Link to="/dashboard/empresas/lista" className="hover:text-foreground">Empresas</Link>
            <span aria-hidden>/</span>
            <span className="text-foreground">{displayName}</span>
          </nav>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{displayName}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>CNPJ: {company.cnpj || 'Não informado'}</span>
                <StatusBadge status={company.status} />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => void loadCompany()}>
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden /> Atualizar
          </Button>
          {!editing && canUpdate && (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="mr-2 h-4 w-4" aria-hidden /> Editar
            </Button>
          )}
          {!editing && canDelete && (
            <Button variant="danger" size="sm" onClick={() => void handleDelete()} disabled={deleting}>
              <Trash2 className="mr-2 h-4 w-4" aria-hidden /> {deleting ? 'Removendo...' : 'Excluir'}
            </Button>
          )}
          {editing && (
            <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden /> Cancelar edição
            </Button>
          )}
          <Link to="/dashboard/empresas/lista">
            <Button variant="ghost" size="sm">Voltar para lista</Button>
          </Link>
        </div>
      </div>

      {editing ? (
        <Card className="p-5 sm:p-6">
          <CompanyForm
            open={true}
            tenantId={activeTenantId}
            editingCompany={company}
            onSubmit={handleSave}
            onCancel={() => setEditing(false)}
            embedded
          />
        </Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <Card className="p-5 sm:p-6">
              <SectionHead icon={Info} title="Dados cadastrais" />
              <dl className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <InfoItem label="Nome fantasia" value={company.trading_name} />
                <InfoItem label="Razão social / nome" value={company.legal_name || company.name} />
                <InfoItem label="CNPJ" value={company.cnpj} mono />
                <InfoItem label="Segmento" value={company.industry} />
                <InfoItem label="Porte" value={company.size} />
                <InfoItem label="Situação" value={<StatusBadge status={company.status} />} />
                <InfoItem label="Descrição curta" value={company.short_description} className="sm:col-span-2" />
                <InfoItem label="Descrição" value={company.description} className="sm:col-span-2" pre />
              </dl>
            </Card>

            <Card className="p-5 sm:p-6">
              <SectionHead icon={Users} title="Relacionamentos e vínculos" />
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <UnavailableBlock title="Contatos" description="Integração com `company_contacts`/pessoas depende de contrato e RLS confirmados." />
                <UnavailableBlock title="Vínculos (cliente/parceiro/fornecedor)" description="Depende da reconciliação de `company_relationships` / tipos no schema real." />
                <UnavailableBlock title="Vagas vinculadas" description="Requer contrato confirmado de `jobs.company_id` e permissões autorizadas." />
                <UnavailableBlock title="Contratos" description="Exibição condicionada a entidade/contrato de contratos disponível e autorizado." />
              </div>
            </Card>

            <Card className="p-5 sm:p-6">
              <SectionHead icon={FileText} title="Documentos e mídias" />
              <div className="mt-4 space-y-3">
                <UnavailableBlock
                  title="Biblioteca de arquivos da empresa"
                  description="Upload, preview, download e versionamento dependem do Bunker/Storage/policies e da associação de mídia validada no ambiente autorizado."
                />
                <p className="text-xs text-muted-foreground">
                  Para gerenciar logo/hero/galeria pelo fluxo atual de mídia, utilize <strong>Editar</strong> (quando disponível e autorizado).
                </p>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-5 sm:p-6">
              <SectionHead icon={Phone} title="Contato" />
              <ul className="mt-4 space-y-3 text-sm">
                <ContactRow icon={Mail} label="E-mail" value={company.email} href={company.email ? `mailto:${company.email}` : undefined} />
                <ContactRow icon={Phone} label="Telefone" value={company.phone} href={company.phone ? `tel:${company.phone}` : undefined} />
                <ContactRow icon={Globe} label="Website" value={company.website} href={company.website || undefined} external />
                <ContactRow icon={MapPin} label="Endereço" value={addressLine || null} />
              </ul>
            </Card>

            <Card className="p-5 sm:p-6">
              <SectionHead icon={History} title="Histórico e auditoria" />
              <dl className="mt-4 space-y-3 text-sm">
                <InfoItem label="Criada em" value={formatDateTime(company.created_at)} icon={Calendar} />
                <InfoItem label="Atualizada em" value={formatDateTime(company.updated_at)} icon={Calendar} />
              </dl>
              <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/20 p-3 text-xs text-muted-foreground">
                Trilha de auditoria detalhada por evento depende de fonte/contrato de auditoria autorizado (não inventado).
              </div>
            </Card>

            <Card className="p-5 sm:p-6">
              <SectionHead icon={FileText} title="Ações rápidas" />
              <div className="mt-4 grid gap-2">
                <Link to="/dashboard/empresas/lista" className="text-sm font-medium text-primary hover:underline">Voltar à listagem</Link>
                {canUpdate && (
                  <button type="button" onClick={() => setEditing(true)} className="text-left text-sm font-medium text-primary hover:underline">
                    Editar cadastro
                  </button>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionHead({ icon: Icon, title }: { icon: React.ComponentType<{ className?: string }>; title: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-border pb-3">
      <Icon className="h-5 w-5 text-primary" aria-hidden />
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
    </div>
  );
}

function InfoItem({
  label,
  value,
  className,
  mono,
  pre,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
  mono?: boolean;
  pre?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const empty = value === null || value === undefined || value === '';
  return (
    <div className={cn('space-y-1', className)}>
      <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" aria-hidden />}
        {label}
      </dt>
      <dd className={cn('text-sm text-foreground', mono && 'font-mono tabular-nums', pre && 'whitespace-pre-wrap', empty && 'text-muted-foreground')}>
        {empty ? '—' : value}
      </dd>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
  external,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null;
  href?: string;
  external?: boolean;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        {value && href ? (
          <a
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noreferrer noopener' : undefined}
            className="inline-flex items-center gap-1 break-all font-medium text-primary hover:underline"
          >
            {value}
            {external && <ExternalLink className="h-3.5 w-3.5" aria-hidden />}
          </a>
        ) : (
          <p className="break-all font-medium text-foreground">{value || '—'}</p>
        )}
      </div>
    </li>
  );
}

function UnavailableBlock({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4">
      <div className="mb-1 flex items-center gap-2">
        <Badge variant="outline" className="text-[10px]">Indisponível</Badge>
        <span className="text-sm font-medium text-foreground">{title}</span>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
