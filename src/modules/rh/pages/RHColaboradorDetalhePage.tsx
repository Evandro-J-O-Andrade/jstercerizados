import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  CalendarDays,
  CircleDollarSign,
  History,
  IdCard,
  Mail,
  Pencil,
  RefreshCw,
  User,
} from 'lucide-react';
import { ModuleWorkspace } from '@/components/modules/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { RouteLoadingFallback } from '@/components/ui/RouteLoadingFallback';
import { useAuth } from '@/contexts/AuthContext';
import { employeesRepository } from '@/repositories/employees.repository';
import { RH_PERMISSIONS } from '@/modules/rh/permissions';
import { classifyUuidRouteParam } from '@/utils/uuid';
import type { Employee } from '@/types/domain/employee';

function formatDate(value?: string | null, withTime = false) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(
    'pt-BR',
    withTime ? { dateStyle: 'short', timeStyle: 'short' } : undefined,
  );
}

function statusMeta(status: string): {
  label: string;
  variant: 'default' | 'secondary' | 'danger' | 'success';
} {
  const map: Record<
    string,
    { label: string; variant: 'secondary' | 'danger' | 'success' }
  > = {
    active: { label: 'Ativo', variant: 'success' },
    inactive: { label: 'Inativo', variant: 'danger' },
    terminated: { label: 'Desligado', variant: 'danger' },
    on_leave: { label: 'Afastado', variant: 'secondary' },
  };
  return (
    map[status] || { label: status || 'Não informado', variant: 'secondary' }
  );
}

export default function RHColaboradorDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const { currentTenantId, hasAnyPermission } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canEdit = hasAnyPermission([RH_PERMISSIONS.peopleUpdate]);

  const param = classifyUuidRouteParam(id);
  const load = useCallback(async () => {
    if (!currentTenantId) {
      setError('Tenant ativo não identificado.');
      setLoading(false);
      return;
    }
    if (param.kind === 'missing') {
      setError('Identificador do colaborador não informado.');
      setLoading(false);
      return;
    }
    if (param.kind === 'invalid') {
      setError('Identificador do colaborador inválido.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await employeesRepository.findById(param.value, currentTenantId);
      if (!data) throw new Error('Colaborador não encontrado ou sem acesso autorizado.');
      setItem(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar colaborador.');
      setItem(null);
    } finally {
      setLoading(false);
    }
  }, [param, currentTenantId]);

  useEffect(() => {
    void load();
  }, [load]);

  const name = item?.person?.full_name || item?.employee_code || 'Colaborador';
  const status = statusMeta(item?.status || '');
  const facts = item
    ? [
        {
          label: 'Nome / identificação',
          value: item.person?.full_name || 'Identidade não vinculada',
          icon: User,
        },
        {
          label: 'E-mail',
          value: item.person?.email || 'Não disponível',
          icon: Mail,
        },
        {
          label: 'Código funcional',
          value: item.employee_code || '—',
          icon: IdCard,
        },
        {
          label: 'Admissão',
          value: formatDate(item.hire_date),
          icon: CalendarDays,
        },
        {
          label: 'Desligamento',
          value: formatDate(item.termination_date),
          icon: History,
        },
        {
          label: 'Salário',
          value:
            item.salary != null
              ? Number(item.salary).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })
              : 'Não informado',
          icon: CircleDollarSign,
        },
      ]
    : [];

  return (
    <ModuleWorkspace
      title={loading ? 'Colaborador' : name}
      description="Visão funcional do colaborador, vínculos disponíveis e histórico comprovado pela fonte atual."
      icon={User}
      breadcrumbItems={[
        { label: 'RH', href: '/dashboard/rh' },
        { label: 'Colaboradores', href: '/dashboard/rh/colaboradores' },
        { label: name },
      ]}
      homeRoute="/dashboard/global"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void load()}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Atualizar
          </Button>
          {canEdit && item ? (
            <Button
              size="sm"
              onClick={() =>
                navigate(`/dashboard/rh/colaboradores/${item.id}/editar`)
              }
              leftIcon={<Pencil className="h-4 w-4" />}
            >
              Editar registro
            </Button>
          ) : null}
        </div>
      }
    >
      {loading ? (
        <RouteLoadingFallback />
      ) : error ? (
        <Card className="space-y-3 p-6">
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard/rh/colaboradores')}
          >
            Voltar para a lista
          </Button>
        </Card>
      ) : item ? (
        <div className="space-y-5">
          <div className="border-border flex flex-wrap items-center gap-4 border-b pb-4">
            <button
              type="button"
              className="text-primary border-primary border-b-2 pb-3 text-sm font-semibold"
            >
              Visão geral
            </button>
            <span className="text-muted-foreground pb-3 text-sm">
              Relacionamentos
            </span>
            <span className="text-muted-foreground pb-3 text-sm">
              Documentos
            </span>
            <span className="text-muted-foreground pb-3 text-sm">
              Histórico
            </span>
          </div>
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_360px]">
            <div className="space-y-5">
              <Card className="p-5 sm:p-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-foreground text-lg font-semibold">
                      Informações do colaborador
                    </h2>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Dados retornados pelo repository de RH no tenant ativo.
                    </p>
                  </div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                <dl className="grid gap-3 sm:grid-cols-2">
                  {facts.map(({ label, value, icon: Icon }) => (
                    <div
                      key={label}
                      className="bg-muted/30 border-border/70 rounded-xl border p-4"
                    >
                      <dt className="text-muted-foreground flex items-center gap-2 text-xs">
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </dt>
                      <dd className="text-foreground mt-2 text-sm font-medium break-words">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Card>
              <Card className="p-5 sm:p-6">
                <h2 className="text-foreground text-lg font-semibold">
                  Vínculos e operações
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Relações funcionais retornadas pelo schema atual e protegidas
                  pelas políticas do tenant.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    ['Cargos', item.positions?.length || 0],
                    ['Contratos', item.contracts?.length || 0],
                    ['Documentos', item.documents?.length || 0],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-muted/30 border-border rounded-xl border p-4">
                      <p className="text-muted-foreground text-xs">{label}</p>
                      <p className="text-foreground mt-2 text-2xl font-semibold tabular-nums">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild variant="outline">
                    <Link to="/dashboard/rh/candidatos">
                      Consulta RH de candidatos
                    </Link>
                  </Button>
                </div>
              </Card>
            </div>
            <div className="space-y-5">
              <Card className="p-5">
                <h2 className="text-foreground flex items-center gap-2 text-base font-semibold">
                  <History className="text-primary h-4 w-4" />
                  Evolução comprovada
                </h2>
                <div className="border-border mt-5 space-y-5 border-l pl-5">
                  <div className="relative">
                    <span className="bg-primary ring-background absolute top-0.5 -left-[26px] h-3 w-3 rounded-full ring-4" />
                    <p className="text-foreground text-sm font-medium">
                      Registro criado
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {formatDate(item.created_at, true)}
                    </p>
                  </div>
                  {item.updated_at !== item.created_at ? (
                    <div className="relative">
                      <span className="bg-primary/70 ring-background absolute top-0.5 -left-[26px] h-3 w-3 rounded-full ring-4" />
                      <p className="text-foreground text-sm font-medium">
                        Última atualização
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {formatDate(item.updated_at, true)}
                      </p>
                    </div>
                  ) : null}
                  {item.termination_date ? (
                    <div className="relative">
                      <span className="bg-destructive ring-background absolute top-0.5 -left-[26px] h-3 w-3 rounded-full ring-4" />
                      <p className="text-foreground text-sm font-medium">
                        Desligamento informado
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {formatDate(item.termination_date)}
                      </p>
                    </div>
                  ) : null}
                  {(item.status_history || []).map((event) => (
                    <div className="relative" key={event.id}>
                      <span className="bg-primary/70 ring-background absolute top-0.5 -left-[26px] h-3 w-3 rounded-full ring-4" />
                      <p className="text-foreground text-sm font-medium capitalize">
                        {event.status.replace(/_/g, ' ')}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {formatDate(event.start_date)}
                        {event.notes ? ` · ${event.notes}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
              <Card variant="outline" className="p-5">
                <h3 className="text-foreground text-sm font-semibold">
                  Limite da evidência
                </h3>
                <p className="text-muted-foreground mt-2 text-xs leading-5">
                  Quando posições, contratos, documentos ou histórico estiverem
                  vazios, a interface mantém zero registros e não cria eventos
                  fictícios para preencher o painel.
                </p>
              </Card>
            </div>
          </div>
        </div>
      ) : null}
    </ModuleWorkspace>
  );
}
