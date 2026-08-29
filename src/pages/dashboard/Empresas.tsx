import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { FormAlert } from '@/components/ui/FormAlert';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { useAuth } from '@/contexts/AuthContext';
import { companiesRepository } from '@/repositories/companies.repository';
import { cn } from '@/utils';
import { Building2, Plus, Pencil, Trash2 } from 'lucide-react';
import type { Company } from '@/types/domain/company';

const emptyForm = {
  name: '',
  legal_name: '',
  document: '',
  status: 'active' as Company['status'],
};

export default function Empresas() {
  const { currentTenantId } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const load = async () => {
    if (!currentTenantId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await companiesRepository.findAll(currentTenantId);
      setCompanies(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar empresas',
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [currentTenantId]);

  const openCreate = () => {
    setEditingCompany(null);
    setFormData(emptyForm);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      legal_name: company.legal_name || '',
      document: company.document || '',
      status: company.status,
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!currentTenantId) return;
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('Informe o nome da empresa.');
      return;
    }

    try {
      if (editingCompany) {
        await companiesRepository.update(editingCompany.id, currentTenantId, {
          name: formData.name,
          legal_name: formData.legal_name || null,
          document: formData.document || null,
          status: formData.status,
        });
      } else {
        await companiesRepository.create({
          tenant_id: currentTenantId,
          name: formData.name,
          legal_name: formData.legal_name || null,
          document: formData.document || null,
          status: formData.status,
        });
      }

      setIsFormOpen(false);
      await load();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Erro ao salvar empresa',
      );
    }
  };

  const handleToggleStatus = async (company: Company) => {
    if (!currentTenantId) return;
    const nextStatus = company.status === 'active' ? 'inactive' : 'active';
    try {
      await companiesRepository.update(company.id, currentTenantId, {
        status: nextStatus,
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar status');
    }
  };

  return (
    <ModuleWorkspace
      title="Empresas"
      description="Cadastro e relacionamento de empresas."
      icon={Building2}
      breadcrumbItems={[{ label: 'Empresas' }]}
      actions={
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nova empresa
        </Button>
      }
    >
      {isLoading && (
        <Card className="p-6">
          <p className="text-muted-foreground">Carregando empresas...</p>
        </Card>
      )}

      {error && (
        <Card className="p-6">
          <p className="text-destructive">{error}</p>
        </Card>
      )}

      {!isLoading && !error && companies.length === 0 && (
        <Card className="p-6">
          <p className="text-muted-foreground">
            Nenhuma empresa cadastrada no momento.
          </p>
        </Card>
      )}

      {!isLoading && !error && companies.length > 0 && (
        <div className="space-y-4">
          {companies.map((company) => (
            <Card key={company.id} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-foreground text-lg font-semibold">
                    {company.legal_name || company.name}
                  </h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {company.name}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {company.document && (
                      <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
                        Documento: {company.document}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-medium',
                      company.status === 'active' &&
                        'bg-success/10 text-success',
                      company.status === 'inactive' &&
                        'bg-warning/10 text-warning',
                      company.status === 'suspended' &&
                        'bg-destructive/10 text-destructive',
                      company.status === 'pending' &&
                        'bg-muted text-muted-foreground',
                    )}
                  >
                    {company.status}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(company)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleStatus(company)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {isFormOpen && (
        <div className="bg-background/60 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <Card className="w-full max-w-lg p-6">
            <h3 className="text-foreground mb-4 text-lg font-semibold">
              {editingCompany ? 'Editar empresa' : 'Nova empresa'}
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Nome da empresa"
                />
              </div>
              <div>
                <Label htmlFor="legal_name">Razão Social</Label>
                <Input
                  id="legal_name"
                  value={formData.legal_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      legal_name: e.target.value,
                    }))
                  }
                  placeholder="Razão social"
                />
              </div>
              <div>
                <Label htmlFor="document">Documento</Label>
                <Input
                  id="document"
                  value={formData.document}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      document: e.target.value,
                    }))
                  }
                  placeholder="CNPJ"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as Company['status'],
                    }))
                  }
                  className="border-border bg-background w-full rounded-lg border px-3 py-2 text-sm outline-none"
                >
                  <option value="active">Ativa</option>
                  <option value="inactive">Inativa</option>
                  <option value="suspended">Suspensa</option>
                  <option value="pending">Pendente</option>
                </select>
              </div>
              {formError && <FormAlert type="error" message={formError} />}
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFormOpen(false)}
                >
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleSubmit}>
                  Salvar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </ModuleWorkspace>
  );
}
