'use client';

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { Building2, ArrowLeft, AlertCircle } from 'lucide-react';
import { companiesRepository } from '@/repositories/companies.repository';
import { useAuth } from '@/contexts/AuthContext';
import type {
  Company,
  CompanyCreateInput,
  CompanyUpdateInput,
} from '@/types/domain/company';
import { CompanyForm } from '@/modules/empresas/components/CompanyForm';
import type { CompanyFormData } from '@/modules/empresas/components/CompanyForm';

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

export default function EmpresaFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTenantId, tenantMemberships } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [company, setCompany] = useState<Company | null>(null);

  const activeTenantId = currentTenantId || tenantMemberships[0]?.tenant_id;
  const isEditing = !!id;

  useEffect(() => {
    if (isEditing && id) {
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
          console.error('[EmpresaFormPage] Failed to load:', err);
          setError('Erro ao carregar empresa');
        } finally {
          setLoading(false);
        }
      };
      fetchCompany();
    } else {
      setLoading(false);
    }
  }, [id, activeTenantId, isEditing]);

  const handleBack = () => {
    navigate('/dashboard/empresas');
  };

  const handleSubmit = async (formData: CompanyFormData) => {
    if (!activeTenantId) {
      setError('Tenant não identificado');
      return;
    }

    try {
      setError(null);

      if (isEditing && id) {
        await companiesRepository.update(
          id,
          activeTenantId,
          formData as CompanyUpdateInput,
        );
      } else {
        await companiesRepository.create(
          formData as CompanyCreateInput,
          activeTenantId,
        );
      }

      navigate('/dashboard/empresas');
    } catch (err) {
      console.error('[EmpresaFormPage] Failed to save:', err);
      setError('Erro ao salvar empresa');
    }
  };

  const handleCancel = () => {
    handleBack();
  };

  if (loading) {
    return (
      <ModuleWorkspace
        title={isEditing ? 'Carregando...' : 'Nova Empresa'}
        description=""
        icon={Building2}
      >
        <div className="text-muted-foreground text-sm">Carregando...</div>
      </ModuleWorkspace>
    );
  }

  if (error && !company && isEditing) {
    return (
      <ModuleWorkspace title="Erro" description="" icon={AlertCircle}>
        <div className="text-destructive text-sm">{error}</div>
        <Button variant="outline" onClick={handleBack} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </ModuleWorkspace>
    );
  }

  return (
    <ModuleWorkspace
      title={isEditing ? 'Editar Empresa' : 'Nova Empresa'}
      description={
        isEditing ? 'Atualize os dados da empresa' : 'Cadastre uma nova empresa'
      }
      icon={Building2}
      breadcrumbItems={[
        { label: 'Empresas', href: '/dashboard/empresas' },
        { label: isEditing ? 'Editar' : 'Nova' },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleBack} size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Voltar
          </Button>
        </div>
      }
    >
      {error && (
        <div className="bg-destructive/10 border-destructive/20 text-destructive mb-4 rounded-lg border p-3 text-sm">
          {error}
        </div>
      )}

      <div className="card-base max-w-3xl p-6">
        <InlineCompanyForm
          company={company}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          tenantId={activeTenantId || ''}
        />
      </div>
    </ModuleWorkspace>
  );
}
