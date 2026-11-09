/**
 * Formulário de Vaga — componente React (campos, empresas do tenant, submit).
 * Helpers puros em vaga-form.utils.ts. Sem dados fictícios.
 */
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { FormAlert } from '@/components/ui/FormAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { companiesRepository } from '@/repositories/companies.repository';
import type { Company } from '@/types/domain/company';
import { CONTRACT_TYPE_LABELS } from '@/modules/recrutamento/constants/contractType';
import { JOB_STATUS_LABELS } from '@/modules/recrutamento/constants/jobStatus';
import { SENIORITY_LABELS } from '@/modules/recrutamento/constants/seniority';
import { WORK_MODE_LABELS } from '@/modules/recrutamento/constants/workMode';
import type { JobStatus } from '@/modules/recrutamento/types';
import {
  slugify,
  validateVagaForm,
  type VagaFormValues,
} from './vaga-form.utils';

export type { VagaFormValues } from './vaga-form.utils';

interface VagaFormProps {
  tenantId: string;
  initialValues: VagaFormValues;
  submitLabel: string;
  submitting: boolean;
  error: string | null;
  onSubmit: (values: VagaFormValues) => Promise<void>;
  onCancel: () => void;
}

export function VagaForm({
  tenantId,
  initialValues,
  submitLabel,
  submitting,
  error,
  onSubmit,
  onCancel,
}: VagaFormProps) {
  const [values, setValues] = useState<VagaFormValues>(initialValues);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [companiesError, setCompaniesError] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(Boolean(initialValues.slug));

  useEffect(() => {
    setValues(initialValues);
    setSlugTouched(Boolean(initialValues.slug));
  }, [initialValues]);

  useEffect(() => {
    let cancelled = false;
    async function loadCompanies() {
      setCompaniesLoading(true);
      setCompaniesError(null);
      try {
        const data = await companiesRepository.findAll(tenantId, {
          status: 'active',
        });
        if (!cancelled) setCompanies(data || []);
      } catch (e) {
        if (!cancelled) {
          setCompanies([]);
          setCompaniesError(
            e instanceof Error
              ? e.message
              : 'Não foi possível carregar empresas do tenant.',
          );
        }
      } finally {
        if (!cancelled) setCompaniesLoading(false);
      }
    }
    if (tenantId) void loadCompanies();
    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  const companyOptions = useMemo(() => {
    const opts = companies.map((c) => ({
      value: c.id,
      label: c.trading_name || c.name,
    }));
    if (values.company_id && !opts.some((o) => o.value === values.company_id)) {
      opts.unshift({
        value: values.company_id,
        label: 'Empresa vinculada (ID atual)',
      });
    }
    return opts;
  }, [companies, values.company_id]);

  const set = <K extends keyof VagaFormValues>(
    key: K,
    value: VagaFormValues[K],
  ) => {
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'title' && !slugTouched) {
        next.slug = slugify(String(value));
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    const validation = validateVagaForm(values);
    if (validation) {
      setLocalError(validation);
      return;
    }
    await onSubmit({ ...values, slug: slugify(values.slug || values.title) });
  };

  const displayError = localError || error;

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {displayError ? (
        <FormAlert
          variant="error"
          title="Não foi possível salvar"
          description={displayError}
        />
      ) : null}
      {companiesError ? (
        <FormAlert
          variant="info"
          title="Empresas indisponíveis"
          description={`${companiesError} Você pode informar manualmente apenas se souber o ID autorizado; preferencialmente corrija o acesso às empresas.`}
        />
      ) : null}

      <Card className="space-y-4 p-5">
        <h2 className="text-foreground text-base font-semibold">
          Identificação
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Título da vaga *"
            value={values.title}
            onChange={(e) => set('title', e.target.value)}
            required
            disabled={submitting}
          />
          <div>
            <Label
              htmlFor="vaga-slug"
              className="text-muted-foreground mb-1.5 block text-sm font-medium"
            >
              Slug *
            </Label>
            <Input
              id="vaga-slug"
              value={values.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set('slug', e.target.value);
              }}
              disabled={submitting}
              helperText="Usado em URLs públicas quando aplicável."
            />
          </div>
          <div className="md:col-span-2">
            <Label
              htmlFor="vaga-company"
              className="text-muted-foreground mb-1.5 block text-sm font-medium"
            >
              Empresa *
            </Label>
            {companiesLoading ? (
              <div className="border-input flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                <LoadingSpinner size="sm" />
                <span className="text-muted-foreground">
                  Carregando empresas…
                </span>
              </div>
            ) : (
              <Select
                id="vaga-company"
                value={values.company_id}
                onChange={(e) => set('company_id', e.target.value)}
                disabled={submitting}
                required
              >
                <option value="">Selecione uma empresa</option>
                {companyOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            )}
            {!companiesLoading &&
            companyOptions.length === 0 &&
            !companiesError ? (
              <p className="text-muted-foreground mt-1.5 text-sm">
                Nenhuma empresa ativa encontrada no tenant. Cadastre uma empresa
                autorizada antes de criar vagas.
              </p>
            ) : null}
          </div>
          <Select
            label="Status"
            value={values.status}
            onChange={(e) => set('status', e.target.value as JobStatus)}
            disabled={submitting}
          >
            {Object.entries(JOB_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <h2 className="text-foreground text-base font-semibold">Condições</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Select
            label="Contrato"
            value={values.contract_type}
            onChange={(e) => set('contract_type', e.target.value)}
            disabled={submitting}
          >
            {Object.entries(CONTRACT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Select
            label="Modalidade"
            value={values.work_mode}
            onChange={(e) => set('work_mode', e.target.value)}
            disabled={submitting}
          >
            {Object.entries(WORK_MODE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Select
            label="Senioridade"
            value={values.seniority}
            onChange={(e) => set('seniority', e.target.value)}
            disabled={submitting}
          >
            <option value="">Não informada</option>
            {Object.entries(SENIORITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Input
            label="Carga horária"
            value={values.work_hours}
            onChange={(e) => set('work_hours', e.target.value)}
            placeholder="Ex.: 44h semanais"
            disabled={submitting}
          />
          <Select
            label="Tipo de salário"
            value={values.salary_type}
            onChange={(e) =>
              set(
                'salary_type',
                e.target.value as VagaFormValues['salary_type'],
              )
            }
            disabled={submitting}
          >
            <option value="negotiate">A combinar</option>
            <option value="range">Faixa</option>
            <option value="monthly">Mensal</option>
          </Select>
          <div className="hidden lg:block" />
          <Input
            label="Salário mínimo"
            type="number"
            step="0.01"
            min="0"
            value={values.salary_min}
            onChange={(e) => set('salary_min', e.target.value)}
            disabled={submitting}
          />
          <Input
            label="Salário máximo"
            type="number"
            step="0.01"
            min="0"
            value={values.salary_max}
            onChange={(e) => set('salary_max', e.target.value)}
            disabled={submitting}
          />
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <h2 className="text-foreground text-base font-semibold">Localização</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label="Cidade"
            value={values.city}
            onChange={(e) => set('city', e.target.value)}
            disabled={submitting}
          />
          <Input
            label="UF"
            value={values.state}
            onChange={(e) =>
              set('state', e.target.value.toUpperCase().slice(0, 2))
            }
            maxLength={2}
            disabled={submitting}
          />
          <div className="md:col-span-3">
            <Input
              label="Detalhe da localização"
              value={values.location_detail}
              onChange={(e) => set('location_detail', e.target.value)}
              placeholder="Endereço, referência ou observação"
              disabled={submitting}
            />
          </div>
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <h2 className="text-foreground text-base font-semibold">Conteúdo</h2>
        <Textarea
          label="Descrição"
          rows={5}
          value={values.description}
          onChange={(e) => set('description', e.target.value)}
          disabled={submitting}
        />
        <Textarea
          label="Responsabilidades"
          rows={4}
          value={values.responsibilities}
          onChange={(e) => set('responsibilities', e.target.value)}
          disabled={submitting}
        />
        <Textarea
          label="Requisitos"
          rows={4}
          value={values.requirements}
          onChange={(e) => set('requirements', e.target.value)}
          disabled={submitting}
        />
        <Textarea
          label="Benefícios"
          rows={4}
          value={values.benefits}
          onChange={(e) => set('benefits', e.target.value)}
          disabled={submitting}
        />
      </Card>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={submitting}
          disabled={submitting || companiesLoading}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
