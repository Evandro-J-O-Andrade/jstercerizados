import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { ContentBoundary } from '@/components/feedback/ContentBoundary';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { useAuth } from '@/contexts/AuthContext';
import { companiesRepository } from '@/repositories/companies.repository';
import { EMPRESAS_PERMISSIONS } from '@/modules/empresas/permissions';
import { CompanyForm, type CompanyFormData } from '@/modules/empresas/components/CompanyForm';
import type { Company } from '@/types/domain/company';
import { Building2, Plus, Pencil, Trash2, Power } from 'lucide-react';

export default function Empresas() {
  const { currentTenantId, hasAnyPermission } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [state, setState] = useState<'loading' | 'error' | 'empty' | 'success'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);

  const canCreate = hasAnyPermission([EMPRESAS_PERMISSIONS.companyCreate]);
  const canUpdate = hasAnyPermission([EMPRESAS_PERMISSIONS.companyUpdate]);
  const canDelete = hasAnyPermission(['companies.delete']);

  const load = useCallback(async () => {
    if (!currentTenantId) return;
    setState('loading');
    setError(null);
    try {
      const data = await companiesRepository.findAll(currentTenantId);
      setCompanies(data);
      setState(data.length === 0 ? 'empty' : 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar empresas');
      setState('error');
    }
  }, [currentTenantId]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingCompany(null);
    setIsFormOpen(true);
  };

  const openEdit = (company: Company) => {
    if (!canUpdate) return;
    setEditingCompany(company);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: CompanyFormData) => {
    if (!currentTenantId) return;

    if (editingCompany) {
      await companiesRepository.update(editingCompany.id, currentTenantId, {
        name: data.name,
        trading_name: data.trading_name ?? null,
        cnpj: data.cnpj ?? null,
        status: data.status,
      });
      setIsFormOpen(false);
      await load();
    } else {
      const newCompany = await companiesRepository.create(
        {
          name: data.name,
          trading_name: data.trading_name ?? null,
          cnpj: data.cnpj ?? null,
          status: data.status,
        },
        currentTenantId,
      );
      // Open the newly created company for media upload
      setEditingCompany(newCompany);
      // Keep form open to allow media upload
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !currentTenantId) return;
    try {
      await companiesRepository.delete(deleteTarget.id, currentTenantId);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir empresa');
      setState('error');
    }
  };

  const handleToggleStatus = async (company: Company) => {
    if (!currentTenantId || !canUpdate) return;
    const nextStatus = company.status === 'active' ? 'inactive' : 'active';
    try {
      await companiesRepository.update(company.id, currentTenantId, {
        status: nextStatus,
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar status');
      setState('error');
    }
  };

  return (
    <ModuleWorkspace
      title="Empresas"
      description="Cadastro e relacionamento de empresas."
      icon={Building2}
      breadcrumbItems={[{ label: 'Empresas' }]}
      actions={
        canCreate ? (
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nova empresa
          </Button>
        ) : null
      }
    >
      <ContentBoundary
        status={state}
        error={error}
        onRetry={load}
        homeRoute="/dashboard/empresas"
        emptyTitle="Nenhuma empresa cadastrada"
        emptyDescription="Comece cadastrando uma nova empresa para gerenciar seus relacionamentos."
        emptyActionLabel={canCreate ? 'Nova empresa' : undefined}
        onEmptyAction={canCreate ? openCreate : undefined}
        className="w-full min-w-0"
      >
        <div className="space-y-4">
          {companies.map((company) => (
            <div key={company.id} className="border-border rounded-lg border p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-foreground text-lg font-semibold">
                    {company.trading_name || company.name}
                  </h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {company.name}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {company.cnpj && (
                      <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
                        CNPJ: {company.cnpj}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={[
                      'rounded-full px-3 py-1 text-xs font-medium',
                      company.status === 'active' && 'bg-success/10 text-success',
                      company.status === 'inactive' && 'bg-warning/10 text-warning',
                      company.status === 'suspended' && 'bg-destructive/10 text-destructive',
                      company.status === 'pending' && 'bg-muted text-muted-foreground',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {company.status}
                  </span>
                  {canUpdate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(company)}
                      aria-label={`Editar ${company.trading_name || company.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {canUpdate && !canDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(company)}
                      aria-label={`Alternar status de ${company.trading_name || company.name}`}
                    >
                      <Power className="h-4 w-4" />
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(company)}
                      aria-label={`Excluir ${company.trading_name || company.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ContentBoundary>

      <CompanyForm
        open={isFormOpen}
        tenantId={currentTenantId || ''}
        editingCompany={editingCompany}
        onSubmit={handleFormSubmit}
        onCancel={() => setIsFormOpen(false)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Excluir empresa"
        message={`Tem certeza que deseja excluir "${deleteTarget?.trading_name || deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </ModuleWorkspace>
  );
}
