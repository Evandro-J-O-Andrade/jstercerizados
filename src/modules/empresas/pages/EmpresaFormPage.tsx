'use client';

import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { companiesRepository } from '@/repositories/companies.repository';
import { useAuth } from '@/contexts/AuthContext';
import type { Company } from '@/types/domain/company';
import { CompanyForm, type CompanyFormData } from '@/modules/empresas/components/CompanyForm';
import { ErrorState } from '@/components/fallback/ErrorState';
import { EmptyState } from '@/components/fallback/EmptyState';
import { RouteLoadingFallback } from '@/components/ui/RouteLoadingFallback';
import { classifyUuidRouteParam } from '@/utils/uuid';

/**
 * Formulário de criação/edição de empresa, escopado ao tenant ativo.
 * Em edição, valida UUID da rota antes de consultar dados reais.
 */
export default function EmpresaFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTenantId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [company, setCompany] = useState<Company | null>(null);

  const activeTenantId = currentTenantId;
  const idParam = classifyUuidRouteParam(id);
  const validId = idParam.kind === 'valid' ? idParam.value : null;
  const isEditing = idParam.kind === 'valid';

  const loadCompany = useCallback(async () => {
    if (!activeTenantId) {
      setCompany(null);
      setError(null);
      setLoading(false);
      return;
    }
    if (idParam.kind === 'missing') {
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
  }, [activeTenantId, idParam.kind, validId]);

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

  const handleSubmit = async (formData: CompanyFormData) => {
    if (!activeTenantId) {
      setError('Selecione um tenant antes de salvar a empresa.');
      return;
    }
    try {
      setError(null);
      const address = {
        street: formData.address_street || undefined,
        city: formData.address_city || undefined,
        state: formData.address_state || undefined,
        zip: formData.address_zip || undefined,
      };
      const hasAddress = Object.values(address).some(Boolean);
      const payload = {
        name: formData.name,
        trading_name: formData.trading_name ?? null,
        legal_name: formData.legal_name ?? null,
        cnpj: formData.cnpj ?? null,
        status: formData.status,
        industry: formData.industry ?? null,
        email: formData.email ?? null,
        phone: formData.phone ?? null,
        website: formData.website ?? null,
        size: formData.size ?? null,
        description: formData.description ?? null,
        short_description: formData.short_description ?? null,
        address: hasAddress ? address : null,
      };

      if (isEditing && validId) {
        await companiesRepository.update(validId, activeTenantId, payload);
        navigate(`/dashboard/empresas/${validId}`);
        return;
      }
      await companiesRepository.create(payload, activeTenantId);
      navigate('/dashboard/empresas/lista');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar a empresa.');
    }
  };

  if (loading) return <RouteLoadingFallback />;

  if (!activeTenantId) {
    return (
      <div className="p-4 sm:p-6">
        <EmptyState
          title="Selecione um tenant"
          description="Escolha um tenant ativo para acessar o formulário de empresas."
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

  if (error && !company && isEditing) {
    return (
      <div className="p-4 sm:p-6">
        <ErrorState
          title="Não foi possível carregar a empresa"
          message={error}
          onRetry={() => void loadCompany()}
          retryLabel="Tentar novamente"
          onBack={handleBack}
          backLabel="Voltar para a lista"
        />
      </div>
    );
  }

  const title = isEditing ? 'Editar empresa' : 'Nova empresa';

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <nav className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
            <Link to="/dashboard/empresas/lista" className="hover:text-foreground">Empresas</Link>
            <span aria-hidden>/</span>
            <span className="text-foreground">{isEditing ? 'Editar' : 'Nova'}</span>
          </nav>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
              <p className="text-sm text-muted-foreground">
                {isEditing
                  ? 'Atualize os dados suportados pelo cadastro da empresa.'
                  : 'Cadastre uma empresa com os campos suportados pelo contrato atual.'}
              </p>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden /> Voltar
        </Button>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="p-5 sm:p-6">
          {error && (
            <div role="alert" className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <CompanyForm
            open={true}
            tenantId={activeTenantId}
            editingCompany={company}
            onSubmit={handleSubmit}
            onCancel={handleBack}
            embedded
          />
        </Card>

        <aside className="space-y-4">
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" aria-hidden />
              <h2 className="text-sm font-semibold text-foreground">Orientações</h2>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>• <strong className="text-foreground">Nome</strong> é obrigatório para persistência.</li>
              <li>• Campos gravados seguem `CompanyCreateInput/UpdateInput` e mapeamento do repositório.</li>
              <li>• Relacionamentos (cliente/parceiro/fornecedor), contatos e vínculos avançados dependem de contrato DB/RLS confirmado.</li>
              <li>• Mídia/documentos: disponíveis na edição quando o contrato de mídia/Storage estiver autorizado.</li>
              <li>• A autorização real é definida por RBAC/RLS, não por elementos visuais.</li>
            </ul>
          </Card>
          <Card className="border-dashed p-5">
            <h2 className="text-sm font-semibold text-foreground">Escopo e pendências</h2>
            <p className="mt-2 text-xs text-muted-foreground">
              Expansão para todos os campos do schema `companies` e entidades relacionadas será feita após reconciliação read-only do banco `js-empregos` e confirmação de políticas/contratos.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
