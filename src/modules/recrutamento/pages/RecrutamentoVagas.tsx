'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { ModulePage } from '@/components/modules/ModulePage';
import { jobsRepository } from '@/modules/recrutamento/repositories';
import { Briefcase } from 'lucide-react';
import type {
  JobListItem,
  JobStatus,
  CreateJobInput,
  UpdateJobInput,
} from '@/modules/recrutamento/types';
import type {
  ModuleDefinition,
  ModuleCategory,
} from '@/components/portal/ModuleRegistry';
import { JOB_STATUS_LABELS } from '@/modules/recrutamento/constants/jobStatus';
import { CONTRACT_TYPE_LABELS } from '@/modules/recrutamento/constants/contractType';
import { WORK_MODE_LABELS } from '@/modules/recrutamento/constants/workMode';
import { SENIORITY_LABELS } from '@/modules/recrutamento/constants/seniority';

type JobFormData = Omit<CreateJobInput, 'tenant_id'>;

const JOBS_COLUMNS = [
  { key: 'title', header: 'Título', sortable: true },
  { key: 'company_name', header: 'Empresa', sortable: true },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (item: JobListItem) =>
      JOB_STATUS_LABELS[item.status] ?? item.status,
  },
  {
    key: 'contract_type',
    header: 'Contrato',
    sortable: true,
    render: (item: JobListItem) =>
      CONTRACT_TYPE_LABELS[item.contract_type] ?? item.contract_type,
  },
  {
    key: 'work_mode',
    header: 'Modalidade',
    sortable: true,
    render: (item: JobListItem) =>
      WORK_MODE_LABELS[item.work_mode] ?? item.work_mode,
  },
  {
    key: 'seniority',
    header: 'Senioridade',
    sortable: true,
    render: (item: JobListItem) =>
      item.seniority ? SENIORITY_LABELS[item.seniority] : '-',
  },
  {
    key: 'city',
    header: 'Cidade',
    sortable: true,
  },
  {
    key: 'state',
    header: 'UF',
    sortable: true,
  },
  {
    key: 'published_at',
    header: 'Publicado em',
    sortable: true,
    render: (item: JobListItem) =>
      item.published_at
        ? new Date(item.published_at).toLocaleDateString('pt-BR')
        : '-',
  },
];

const JOBS_FILTERS = [
  { key: 'search', label: 'Buscar', type: 'text' as const },
  {
    key: 'status',
    label: 'Status',
    type: 'select' as const,
    options: [
      { value: '', label: 'Todos' },
      { value: 'draft', label: 'Rascunho' },
      { value: 'published', label: 'Publicado' },
      { value: 'paused', label: 'Pausado' },
      { value: 'closed', label: 'Fechado' },
      { value: 'filled', label: 'Preenchido' },
      { value: 'cancelled', label: 'Cancelado' },
    ],
  },
  {
    key: 'contract_type',
    label: 'Contrato',
    type: 'select' as const,
    options: [
      { value: '', label: 'Todos' },
      { value: 'clt', label: 'CLT' },
      { value: 'internship', label: 'Estágio' },
      { value: 'temporary', label: 'Temporário' },
      { value: 'freelance', label: 'Freelance' },
      { value: 'contracted', label: 'PJ' },
      { value: 'cd', label: 'CD' },
    ],
  },
  {
    key: 'work_mode',
    label: 'Modalidade',
    type: 'select' as const,
    options: [
      { value: '', label: 'Todas' },
      { value: 'onsite', label: 'Presencial' },
      { value: 'hybrid', label: 'Híbrido' },
      { value: 'remote', label: 'Remoto' },
    ],
  },
  {
    key: 'seniority',
    label: 'Senioridade',
    type: 'select' as const,
    options: [
      { value: '', label: 'Todas' },
      { value: 'internship', label: 'Estágio' },
      { value: 'junior', label: 'Júnior' },
      { value: 'mid', label: 'Pleno' },
      { value: 'senior', label: 'Sênior' },
      { value: 'master', label: 'Master' },
      { value: 'leadership', label: 'Liderança' },
    ],
  },
  { key: 'city', label: 'Cidade', type: 'text' as const },
  { key: 'state', label: 'UF', type: 'text' as const },
];

const DEFAULT_FORM: JobFormData = {
  company_id: null,
  company_relationship_id: null,
  title: '',
  slug: '',
  description: '',
  responsibilities: '',
  requirements: '',
  benefits: '',
  salary_min: undefined,
  salary_max: undefined,
  salary_type: 'negotiate',
  contract_type: 'clt',
  seniority: 'junior',
  work_hours: '44h',
  work_mode: 'onsite',
  city: '',
  state: '',
  location_detail: '',
  status: 'draft',
  metadata: {},
};

interface JobFormProps {
  form: JobFormData;
  setForm: (f: JobFormData) => void;
  editMode: boolean;
}

function JobForm({ form, setForm, editMode: _editMode }: JobFormProps) {
  const handleChange = (
    key: keyof JobFormData,
    value: string | number | undefined | null,
  ) => {
    (setForm as React.Dispatch<React.SetStateAction<JobFormData>>)(
      (prev: JobFormData): JobFormData => ({
        ...prev,
        [key]: value === '' ? null : value,
      }),
    );
  };

  return (
    <div className="max-h-[70vh] space-y-4 overflow-y-auto">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-foreground text-sm font-medium">
            Título *
          </label>
          <input
            className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-foreground text-sm font-medium">Slug *</label>
          <input
            className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={form.slug}
            onChange={(e) =>
              handleChange(
                'slug',
                e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
              )
            }
            required
          />
        </div>
        <div>
          <label className="text-foreground text-sm font-medium">
            Empresa (company_id) *
          </label>
          <input
            className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={form.company_id ?? ''}
            onChange={(e) => handleChange('company_id', e.target.value)}
            placeholder="UUID da empresa (companies.id)"
            required
          />
        </div>
        <div>
          <label className="text-foreground text-sm font-medium">
            Relacionamento (relationship_id)
          </label>
          <input
            className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={form.company_relationship_id ?? ''}
            onChange={(e) =>
              handleChange('company_relationship_id', e.target.value)
            }
            placeholder="UUID do relacionamento (opcional)"
          />
        </div>
        <div>
          <label className="text-foreground text-sm font-medium">Status</label>
          <select
            className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={form.status}
            onChange={(e) =>
              handleChange('status', e.target.value as JobStatus)
            }
          >
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
            <option value="paused">Pausado</option>
            <option value="closed">Fechado</option>
            <option value="filled">Preenchido</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
        <div>
          <label className="text-foreground text-sm font-medium">
            Tipo de Contrato
          </label>
          <select
            className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={form.contract_type}
            onChange={(e) => handleChange('contract_type', e.target.value)}
          >
            <option value="clt">CLT</option>
            <option value="internship">Estágio</option>
            <option value="temporary">Temporário</option>
            <option value="freelance">Freelance</option>
            <option value="contracted">PJ</option>
            <option value="cd">CD</option>
          </select>
        </div>
        <div>
          <label className="text-foreground text-sm font-medium">
            Modalidade
          </label>
          <select
            className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={form.work_mode}
            onChange={(e) => handleChange('work_mode', e.target.value)}
          >
            <option value="onsite">Presencial</option>
            <option value="hybrid">Híbrido</option>
            <option value="remote">Remoto</option>
          </select>
        </div>
        <div>
          <label className="text-foreground text-sm font-medium">
            Senioridade
          </label>
          <select
            className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={form.seniority}
            onChange={(e) => handleChange('seniority', e.target.value)}
          >
            <option value="internship">Estágio</option>
            <option value="junior">Júnior</option>
            <option value="mid">Pleno</option>
            <option value="senior">Sênior</option>
            <option value="master">Master</option>
            <option value="leadership">Liderança</option>
          </select>
        </div>
        <div>
          <label className="text-foreground text-sm font-medium">
            Carga Horária
          </label>
          <input
            className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={form.work_hours}
            onChange={(e) => handleChange('work_hours', e.target.value)}
            placeholder="44h"
          />
        </div>
        <div>
          <label className="text-foreground text-sm font-medium">Cidade</label>
          <input
            className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={form.city}
            onChange={(e) => handleChange('city', e.target.value)}
          />
        </div>
        <div>
          <label className="text-foreground text-sm font-medium">UF</label>
          <input
            className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={form.state}
            onChange={(e) =>
              handleChange('state', e.target.value.toUpperCase())
            }
            maxLength={2}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-foreground text-sm font-medium">
            Detalhe da Localização
          </label>
          <input
            className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={form.location_detail}
            onChange={(e) => handleChange('location_detail', e.target.value)}
            placeholder="Ex: Segunda a sexta, 8h às 17h"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-foreground text-sm font-medium">
            Tipo de Salário
          </label>
          <select
            className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={form.salary_type}
            onChange={(e) => handleChange('salary_type', e.target.value)}
          >
            <option value="range">Faixa</option>
            <option value="monthly">Mensal</option>
            <option value="negotiate">A combinar</option>
          </select>
        </div>
        <div>
          <label className="text-foreground text-sm font-medium">
            Salário Mínimo
          </label>
          <input
            type="number"
            step="0.01"
            className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={form.salary_min ?? ''}
            onChange={(e) =>
              handleChange(
                'salary_min',
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
            placeholder="Ex: 5000"
          />
        </div>
        <div>
          <label className="text-foreground text-sm font-medium">
            Salário Máximo
          </label>
          <input
            type="number"
            step="0.01"
            className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={form.salary_max ?? ''}
            onChange={(e) =>
              handleChange(
                'salary_max',
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
            placeholder="Ex: 7000"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-foreground text-sm font-medium">
            Descrição
          </label>
          <textarea
            className="border-border bg-background mt-1 min-h-[100px] w-full rounded-md border px-3 py-2 text-sm"
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-foreground text-sm font-medium">
            Responsabilidades
          </label>
          <textarea
            className="border-border bg-background mt-1 min-h-[80px] w-full rounded-md border px-3 py-2 text-sm"
            value={form.responsibilities}
            onChange={(e) => handleChange('responsibilities', e.target.value)}
            rows={3}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-foreground text-sm font-medium">
            Requisitos
          </label>
          <textarea
            className="border-border bg-background mt-1 min-h-[80px] w-full rounded-md border px-3 py-2 text-sm"
            value={form.requirements}
            onChange={(e) => handleChange('requirements', e.target.value)}
            rows={3}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-foreground text-sm font-medium">
            Benefícios
          </label>
          <textarea
            className="border-border bg-background mt-1 min-h-[80px] w-full rounded-md border px-3 py-2 text-sm"
            value={form.benefits}
            onChange={(e) => handleChange('benefits', e.target.value)}
            rows={3}
            placeholder="Separados por vírgula"
          />
        </div>
      </div>
    </div>
  );
}

export default function RecrutamentoVagas() {
  const { currentTenantId, hasAnyPermission } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const moduleDef: ModuleDefinition = {
    id: 'recrutamento',
    title: 'Recrutamento',
    description: 'Gestão de recrutamento e seleção',
    icon: 'Briefcase',
    route: '/recrutamento',
    category: 'recrutamento' as ModuleCategory,
    scope: 'tenant',
  };

  const canCreate = hasAnyPermission(['recrutamento:vagas:create']);
  const canUpdate = hasAnyPermission(['recrutamento:vagas:update']);
  const canDelete = hasAnyPermission(['recrutamento:vagas:delete']);
  const canToggle = hasAnyPermission(['recrutamento:vagas:update']);

  const handleToggleStatus = async (item: JobListItem) => {
    if (!currentTenantId) return;
    const nextStatus: JobStatus =
      item.status === 'published' ? 'paused' : 'published';
    await jobsRepository.updateStatus(item.id, nextStatus);
    setRefreshKey((k) => k + 1);
  };

  return (
    <ModulePage<JobListItem, JobFormData>
      title="Vagas"
      description="Gerencie vagas abertas e publicadas"
      icon={Briefcase}
      breadcrumbItems={[{ label: 'Recrutamento' }, { label: 'Vagas' }]}
      module={moduleDef}
      permissions={
        [
          {
            id: 'recrutamento:vagas:read',
            name: 'Read',
            module: 'recrutamento',
            resource: 'vagas',
            action: 'read',
            created_at: new Date().toISOString(),
          },
          canCreate && {
            id: 'recrutamento:vagas:create',
            name: 'Create',
            module: 'recrutamento',
            resource: 'vagas',
            action: 'create',
            created_at: new Date().toISOString(),
          },
          canUpdate && {
            id: 'recrutamento:vagas:update',
            name: 'Update',
            module: 'recrutamento',
            resource: 'vagas',
            action: 'update',
            created_at: new Date().toISOString(),
          },
          canDelete && {
            id: 'recrutamento:vagas:delete',
            name: 'Delete',
            module: 'recrutamento',
            resource: 'vagas',
            action: 'delete',
            created_at: new Date().toISOString(),
          },
        ].filter(Boolean) as any
      }
      columns={JOBS_COLUMNS}
      filters={JOBS_FILTERS}
      fetchData={async (_tenantId) => {
        const result = await jobsRepository.list({
          tenant_id: currentTenantId || '',
          sort_by: 'created_at',
          sort_order: 'desc',
          limit: 100,
        });
        return result.data || [];
      }}
      createItem={async (_tenantId, input) => {
        const result = await jobsRepository.create({
          ...input,
          tenant_id: currentTenantId || '',
        });
        if (result.error) throw result.error;
        return result.data!;
      }}
      updateItem={async (_tenantId, id, input) => {
        const result = await jobsRepository.update({
          id,
          ...input,
        } as UpdateJobInput);
        if (result.error) throw result.error;
        return result.data!;
      }}
      deleteItem={async (_tenantId, id) => {
        await jobsRepository.delete(id);
      }}
      getItemId={(item) => item.id}
      defaultForm={DEFAULT_FORM}
      renderForm={(form, setForm, editMode) => (
        <JobForm form={form} setForm={setForm} editMode={editMode} />
      )}
      onToggleStatus={canToggle ? handleToggleStatus : undefined}
      getToggleState={(item) => item.status === 'published'}
      emptyMessage="Nenhuma vaga encontrada."
      refreshKey={refreshKey}
    />
  );
}
