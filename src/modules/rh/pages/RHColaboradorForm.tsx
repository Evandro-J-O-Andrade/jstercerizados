import { useEffect, useState, type FormEvent } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  FileText,
  IdCard,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import type { RHColaboradorFormValues } from './RHColaboradorForm.values';
import type { EmployeePersonOption } from '@/types/domain/employee';

function validate(values: RHColaboradorFormValues) {
  const errors: Partial<Record<keyof RHColaboradorFormValues, string>> = {};
  if (!values.person_id && values.person_id !== '__edit__')
    errors.person_id = 'Selecione uma pessoa do tenant.';
  if (!values.employee_code.trim())
    errors.employee_code = 'Código do colaborador é obrigatório.';
  if (!values.hire_date) errors.hire_date = 'Data de admissão é obrigatória.';
  if (
    values.salary.trim() &&
    Number.isNaN(Number(values.salary.replace(',', '.')))
  )
    errors.salary = 'Salário deve ser numérico.';
  if (
    values.termination_date &&
    values.hire_date &&
    values.termination_date < values.hire_date
  )
    errors.termination_date =
      'O desligamento não pode ser anterior à admissão.';
  return errors;
}

const steps = [
  {
    label: 'Dados funcionais',
    description: 'Código, situação e identificação',
    icon: IdCard,
  },
  {
    label: 'Vínculo',
    description: 'Admissão, desligamento e remuneração',
    icon: CalendarDays,
  },
  {
    label: 'Documentos',
    description: 'Geridos em fluxo autorizado próprio',
    icon: FileText,
  },
  {
    label: 'Revisão',
    description: 'Validação antes da persistência',
    icon: ShieldCheck,
  },
] as const;

export function RHColaboradorForm({
  mode,
  initialValues,
  submitLabel,
  submitting,
  error,
  onSubmit,
  onCancel,
  people = [],
  peopleLoading = false,
}: {
  mode: 'create' | 'edit';
  initialValues: RHColaboradorFormValues;
  submitLabel: string;
  submitting: boolean;
  error: string | null;
  onSubmit: (values: RHColaboradorFormValues) => Promise<void> | void;
  onCancel: () => void;
  people?: EmployeePersonOption[];
  peopleLoading?: boolean;
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<
    Partial<Record<keyof RHColaboradorFormValues, string>>
  >({});

  useEffect(() => setValues(initialValues), [initialValues]);

  const set =
    (key: keyof RHColaboradorFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setValues((current) => ({ ...current, [key]: event.target.value }));
      setErrors((current) => ({ ...current, [key]: undefined }));
    };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    await onSubmit(values);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-5 xl:grid-cols-[240px_minmax(0,1fr)_300px]"
    >
      <Card className="h-fit p-4 xl:sticky xl:top-20">
        <div className="mb-4">
          <p className="text-foreground text-sm font-semibold">
            Etapas do processo
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            Fluxo RH separado do dashboard e da listagem.
          </p>
        </div>
        <ol className="space-y-1">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const active = index === 0;
            return (
              <li key={step.label} className="flex gap-3 rounded-xl px-2 py-3">
                <span
                  className={
                    active
                      ? 'bg-primary text-primary-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full'
                      : 'bg-muted text-muted-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full'
                  }
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="text-foreground block text-sm font-medium">
                    {step.label}
                  </span>
                  <span className="text-muted-foreground mt-0.5 block text-xs leading-4">
                    {step.description}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
      </Card>

      <Card className="min-w-0 p-5 sm:p-6">
        <div className="border-border mb-6 flex items-start gap-3 border-b pb-5">
          <div className="bg-primary/10 text-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
            <UserRound className="h-5 w-5" />
          </div>
          <div>
            <span className="bg-primary/10 text-primary inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase">
              Etapa 1 de 4
            </span>
            <h2 className="text-foreground mt-2 text-xl font-semibold">
              {mode === 'create'
                ? 'Dados do colaborador'
                : 'Alterar informações'}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Somente campos suportados pelo contrato atual serão persistidos.
            </p>
          </div>
        </div>

        {error ? (
          <div
            role="alert"
            className="border-destructive/30 bg-destructive/5 text-destructive mb-5 rounded-xl border p-4 text-sm"
          >
            {error}
          </div>
        ) : null}

        <div className="grid gap-5 md:grid-cols-2">
          {mode === 'create' ? (
            <label
              className="text-muted-foreground block text-sm font-medium md:col-span-2"
              htmlFor="rh-person"
            >
              Pessoa vinculada *
              <select
                id="rh-person"
                className="border-input bg-surface text-foreground focus-visible:border-primary focus-visible:ring-primary/20 mt-1.5 h-11 w-full rounded-lg border px-3 outline-none focus-visible:ring-2"
                value={values.person_id}
                onChange={set('person_id')}
                disabled={peopleLoading}
                aria-invalid={Boolean(errors.person_id)}
              >
                <option value="">
                  {peopleLoading
                    ? 'Carregando pessoas do tenant…'
                    : 'Selecione uma pessoa ainda sem vínculo funcional'}
                </option>
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.full_name} · {person.email}
                  </option>
                ))}
              </select>
              {errors.person_id ? (
                <span className="text-destructive mt-1.5 block text-xs" role="alert">
                  {errors.person_id}
                </span>
              ) : (
                <span className="text-muted-foreground mt-1.5 block text-xs">
                  O UUID selecionado será usado como employees.id, conforme o contrato do banco.
                </span>
              )}
            </label>
          ) : null}
          <Input
            id="rh-employee-code"
            label="Código do colaborador *"
            value={values.employee_code}
            onChange={set('employee_code')}
            error={errors.employee_code}
            helperText="Identificador funcional único no tenant."
            autoComplete="off"
          />
          <label
            className="text-muted-foreground block text-sm font-medium"
            htmlFor="rh-status"
          >
            Situação
            <select
              id="rh-status"
              className="border-input bg-surface text-foreground focus-visible:border-primary focus-visible:ring-primary/20 mt-1.5 h-11 w-full rounded-lg border px-3 outline-none focus-visible:ring-2"
              value={values.status}
              onChange={set('status')}
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="on_leave">Afastado</option>
              <option value="terminated">Desligado</option>
            </select>
          </label>
          <Input
            id="rh-hire-date"
            label="Data de admissão *"
            type="date"
            value={values.hire_date}
            onChange={set('hire_date')}
            error={errors.hire_date}
          />
          <Input
            id="rh-termination-date"
            label="Data de desligamento"
            type="date"
            value={values.termination_date}
            onChange={set('termination_date')}
            error={errors.termination_date}
          />
          <Input
            id="rh-salary"
            label="Salário"
            inputMode="decimal"
            value={values.salary}
            onChange={set('salary')}
            placeholder="Ex.: 3500,00"
            error={errors.salary}
            helperText="Opcional. Use apenas valores autorizados para seu perfil."
            className="md:max-w-sm"
          />
        </div>

        <div className="border-border mt-7 flex flex-wrap items-center justify-between gap-3 border-t pt-5">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancelar e voltar
          </Button>
          <Button
            type="submit"
            loading={submitting}
            leftIcon={<CheckCircle2 className="h-4 w-4" />}
          >
            {submitLabel}
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        <Card variant="outline" className="p-5">
          <h3 className="text-foreground flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="text-primary h-4 w-4" />
            Persistência segura
          </h3>
          <ul className="text-muted-foreground mt-3 space-y-2 text-xs leading-5">
            <li>Tenant ativo confirmado antes da operação.</li>
            <li>Permissões e RLS continuam sendo validadas.</li>
            <li>Nenhum dado ilustrativo é enviado ao banco.</li>
          </ul>
        </Card>
        <Card variant="outline" className="p-5">
          <h3 className="text-foreground text-sm font-semibold">
            Documentos e pessoa
          </h3>
          <p className="text-muted-foreground mt-2 text-xs leading-5">
            Vínculos detalhados, identidade e documentos permanecem nos fluxos
            autorizados existentes. Esta página não cria identidades nem anexos
            implicitamente.
          </p>
        </Card>
      </div>
    </form>
  );
}
