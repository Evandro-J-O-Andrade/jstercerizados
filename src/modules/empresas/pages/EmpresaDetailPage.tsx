'use client';

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { Building2, ArrowLeft, Edit, Trash2, AlertCircle } from 'lucide-react';
import { companiesRepository } from '@/repositories/companies.repository';
import { useAuth } from '@/contexts/AuthContext';
import type { Company } from '@/types/domain/company';
import { CompanyForm } from '@/modules/empresas/components/CompanyForm';
import type { CompanyFormData } from '@/modules/empresas/components/CompanyForm';
import { cn } from '@/utils';

function InlineCompanyForm({
  company,
  onSubmit,
  onCancel,
  tenantId,
}: {
  company: Company | null;
  onSubmit: (data: CompanyFormData) => Promise<void>;
  onCancel: () => void;
  tenantId: string;
}) {
  return (
    <CompanyForm
      open={true}
      tenantId={tenantId}
      editingCompany={company}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  );
}

export default function EmpresaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTenantId, tenantMemberships } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeTenantId = currentTenantId || tenantMemberships[0]?.tenant_id;

  useEffect(() => {
    if (!id) return;

    const fetchCompany = async () => {
      try {
        setLoading(true);
        const tenantId = activeTenantId || '';
        const data = await companiesRepository.findById(id, tenantId);
        if (data) {
          setCompany(data);
        } else {
          setError('Empresa não encontrada');
        }
      } catch (err) {
        console.error('[EmpresaDetailPage] Failed to load:', err);
        setError('Erro ao carregar empresa');
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id, activeTenantId]);

  const handleBack = () => {
    navigate('/dashboard/empresas');
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const handleSave = async (formData: CompanyFormData) => {
    if (!id || !activeTenantId) return;

    try {
      const updated = await companiesRepository.update(
        id,
        activeTenantId,
        formData,
      );
      setCompany(updated);
      setEditing(false);
    } catch (err) {
      console.error('[EmpresaDetailPage] Failed to update:', err);
      setError('Erro ao atualizar empresa');
    }
  };

  const handleDelete = async () => {
    if (!id || !activeTenantId) return;

    if (!window.confirm('Tem certeza que deseja excluir esta empresa?')) return;

    try {
      setDeleting(true);
      await companiesRepository.delete(id, activeTenantId);
      navigate('/dashboard/empresas');
    } catch (err) {
      console.error('[EmpresaDetailPage] Failed to delete:', err);
      setError('Erro ao excluir empresa');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <ModuleWorkspace title="Carregando..." description="" icon={Building2}>
        <div className="text-muted-foreground text-sm">
          Carregando empresa...
        </div>
      </ModuleWorkspace>
    );
  }

  if (error || !company) {
    return (
      <ModuleWorkspace title="Erro" description="" icon={AlertCircle}>
        <div className="text-destructive text-sm">
          {error || 'Empresa não encontrada'}
        </div>
        <Button variant="outline" onClick={handleBack} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </ModuleWorkspace>
    );
  }

  return (
    <ModuleWorkspace
      title={company.trading_name || company.name || 'Empresa'}
      description={`CNPJ: ${company.cnpj || 'Não informado'}`}
      icon={Building2}
      breadcrumbItems={[
        { label: 'Empresas', href: '/dashboard/empresas' },
        { label: company.trading_name || company.name || 'Empresa' },
      ]}
      actions={
        <div className="flex items-center gap-2">
          {!editing && (
            <Button variant="outline" onClick={handleEdit} size="sm">
              <Edit className="mr-1 h-4 w-4" />
              Editar
            </Button>
          )}
          {!editing && (
            <Button
              variant="danger"
              onClick={handleDelete}
              size="sm"
              disabled={deleting}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Excluir
            </Button>
          )}
          {editing && (
            <Button variant="outline" onClick={handleCancel} size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Cancelar
            </Button>
          )}
        </div>
      }
    >
      {error && (
        <div className="bg-destructive/10 border-destructive/20 text-destructive mb-4 rounded-lg border p-3 text-sm">
          {error}
        </div>
      )}

      <div className="card-base p-6">
        {editing ? (
          <InlineCompanyForm
            company={company}
            onSubmit={handleSave}
            onCancel={handleCancel}
            tenantId={activeTenantId || ''}
          />
        ) : (
          <dl className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <dt className="text-muted-foreground text-sm font-medium">
                Nome Fantasia
              </dt>
              <dd className="text-foreground mt-1 font-medium">
                {company.trading_name || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm font-medium">
                Razão Social
              </dt>
              <dd className="text-foreground mt-1">{company.name || '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm font-medium">
                CNPJ
              </dt>
              <dd className="text-foreground mt-1">{company.cnpj || '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm font-medium">
                Status
              </dt>
              <dd className="text-foreground mt-1">
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                    company.status === 'active' && 'bg-green/10 text-green',
                    company.status === 'inactive' && 'bg-gray/10 text-gray',
                    company.status === 'suspended' &&
                      'bg-yellow/10 text-yellow',
                    company.status === 'pending' && 'bg-blue/10 text-blue',
                  )}
                >
                  {company.status}
                </span>
              </dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-muted-foreground text-sm font-medium">
                Endereço
              </dt>
              <dd className="text-foreground mt-1">
                {company.address ? JSON.stringify(company.address) : '—'}
              </dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-muted-foreground text-sm font-medium">
                Descrição
              </dt>
              <dd className="text-foreground mt-1">
                {company.description || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm font-medium">
                Telefone
              </dt>
              <dd className="text-foreground mt-1">{company.phone || '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm font-medium">
                E-mail
              </dt>
              <dd className="text-foreground mt-1">{company.email || '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm font-medium">
                Website
              </dt>
              <dd className="text-foreground mt-1">{company.website || '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm font-medium">
                Setor
              </dt>
              <dd className="text-foreground mt-1">
                {company.industry || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm font-medium">
                Porte
              </dt>
              <dd className="text-foreground mt-1">{company.size || '—'}</dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-muted-foreground text-sm font-medium">
                Criado em
              </dt>
              <dd className="text-foreground mt-1">
                {new Date(company.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-muted-foreground text-sm font-medium">
                Atualizado em
              </dt>
              <dd className="text-foreground mt-1">
                {new Date(company.updated_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </dd>
            </div>
          </dl>
        )}
      </div>
    </ModuleWorkspace>
  );
}
