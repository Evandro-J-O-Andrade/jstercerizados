import { useState } from 'react';
import { Bell, Plus, Trash2, Power, PowerOff, MapPin, Briefcase } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useCandidate } from '@/contexts/CandidateContext';
import { useToast } from '@/components/feedback/ToastContext';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { SEO } from '@/components/ui/SEO';
import { COMPANY } from '@/config';
import type { JobAlertFrequency } from '@/repositories/candidate-portal';

const FREQUENCY_LABELS: Record<JobAlertFrequency, string> = {
  instant: 'Imediato',
  daily: 'Diário',
  weekly: 'Semanal',
};

export default function CandidateAlertas() {
  const { jobAlerts, isLoading, error, createAlert, updateAlert, deleteAlert } =
    useCandidate();
  const { addToast } = useToast();

  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({
    name: '',
    keywords: '',
    city: '',
    state: '',
    contract_type: '',
    work_mode: '',
    salary_min: '',
    salary_max: '',
    frequency: 'daily' as JobAlertFrequency,
  });
  const [actionError, setActionError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleCreate = async () => {
    setActionError(null);
    if (!form.name.trim()) {
      setActionError('Dê um nome para o alerta.');
      return;
    }
    const salaryMin = form.salary_min ? Number(form.salary_min) : null;
    const salaryMax = form.salary_max ? Number(form.salary_max) : null;
    const result = await createAlert({
      name: form.name.trim(),
      keywords: form.keywords.trim() || null,
      city: form.city.trim() || null,
      state: form.state.trim() || null,
      contract_type: form.contract_type.trim() || null,
      work_mode: form.work_mode.trim() || null,
      salary_min: Number.isNaN(salaryMin) ? null : salaryMin,
      salary_max: Number.isNaN(salaryMax) ? null : salaryMax,
      frequency: form.frequency,
      is_active: true,
    });
    if (result.error) {
      setActionError(result.error);
      return;
    }
    setForm({
      name: '',
      keywords: '',
      city: '',
      state: '',
      contract_type: '',
      work_mode: '',
      salary_min: '',
      salary_max: '',
      frequency: 'daily',
    });
    setIsCreating(false);
    addToast({ type: 'success', message: 'Alerta criado com sucesso!' });
  };

  const toggleActive = async (id: string, current: boolean) => {
    setActionError(null);
    const result = await updateAlert(id, { is_active: !current });
    if (result.error) {
      setActionError(result.error);
      addToast({
        type: 'error',
        message: result.error ?? 'Erro ao atualizar alerta.',
      });
    } else {
      addToast({
        type: 'success',
        message: !current
          ? 'Alerta ativado com sucesso.'
          : 'Alerta pausado com sucesso.',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setActionError(null);
    const result = await deleteAlert(deleteConfirm);
    if (result.error) {
      setActionError(result.error);
      addToast({
        type: 'error',
        message: result.error ?? 'Erro ao remover alerta.',
      });
    } else {
      addToast({ type: 'success', message: 'Alerta removido com sucesso.' });
    }
    setDeleteConfirm(null);
  };

  return (
    <>
      <SEO
        title={`Alertas de vagas — ${COMPANY.name}`}
        description="Gerencie seus alertas de vagas"
        noindex
      />

      <div className="space-y-6">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
              Alertas de vagas
            </h1>
            <p className="text-muted-foreground mt-1">
              Receba notificações de oportunidades compatíveis com seus critérios.
            </p>
          </div>
          {!isCreating && (
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsCreating(true)}
            >
              <Plus className="mr-1 h-4 w-4" />
              Novo alerta
            </Button>
          )}
        </header>

        {(error || actionError) && (
          <Card className="border-destructive/40 bg-destructive/5 p-4">
            <p className="text-destructive text-sm">
              {actionError ?? error}
            </p>
          </Card>
        )}

        {isCreating && (
          <Card className="border-border/40 bg-card shadow-glass p-6">
            <h2 className="text-foreground mb-4 text-lg font-semibold">
              Criar novo alerta
            </h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-foreground mb-1 block text-sm font-medium">
                  Nome do alerta *
                </label>
                <Input
                  placeholder='Ex: "Vagas SP — Auxiliar"'
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-foreground mb-1 block text-sm font-medium">
                  Palavras-chave
                </label>
                <Input
                  placeholder='Ex: "auxiliar, limpeza"'
                  value={form.keywords}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, keywords: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-foreground mb-1 block text-sm font-medium">
                  Cidade
                </label>
                <Input
                  placeholder="São Paulo"
                  value={form.city}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, city: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-foreground mb-1 block text-sm font-medium">
                  Estado (sigla)
                </label>
                <Input
                  placeholder="SP"
                  maxLength={2}
                  value={form.state}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      state: e.target.value.toUpperCase(),
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-foreground mb-1 block text-sm font-medium">
                  Tipo de contrato
                </label>
                <Input
                  placeholder="clt, temporário..."
                  value={form.contract_type}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, contract_type: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-foreground mb-1 block text-sm font-medium">
                  Modalidade
                </label>
                <Input
                  placeholder="presencial, remoto, híbrido"
                  value={form.work_mode}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, work_mode: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-foreground mb-1 block text-sm font-medium">
                  Salário mínimo
                </label>
                <Input
                  type="number"
                  placeholder="1800"
                  value={form.salary_min}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, salary_min: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-foreground mb-1 block text-sm font-medium">
                  Salário máximo
                </label>
                <Input
                  type="number"
                  placeholder="3000"
                  value={form.salary_max}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, salary_max: e.target.value }))
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-foreground mb-1 block text-sm font-medium">
                  Frequência
                </label>
                <div className="flex gap-2">
                  {(['instant', 'daily', 'weekly'] as JobAlertFrequency[]).map(
                    (f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setForm((s) => ({ ...s, frequency: f }))}
                        className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                          form.frequency === f
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {FREQUENCY_LABELS[f]}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsCreating(false);
                  setActionError(null);
                }}
              >
                Cancelar
              </Button>
              <Button variant="primary" size="sm" onClick={handleCreate}>
                Criar alerta
              </Button>
            </div>
          </Card>
        )}

        {isLoading ? (
          <p className="text-muted-foreground text-sm">Carregando alertas...</p>
        ) : jobAlerts.length === 0 ? (
          <Card className="p-8 text-center">
            <Bell className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
            <p className="text-foreground font-medium">
              Você ainda não tem alertas de vagas
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              Crie alertas para ser notificado quando novas vagas compatíveis
              forem publicadas.
            </p>
          </Card>
        ) : (
          <ul className="space-y-3">
            {jobAlerts.map((alert) => (
              <li key={alert.id}>
                <Card
                  className={`p-5 ${alert.is_active ? '' : 'opacity-60'}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-foreground text-base font-semibold">
                          {alert.name}
                        </h3>
                        <Badge
                          variant={alert.is_active ? 'success' : 'outline'}
                          className="text-xs"
                        >
                          {alert.is_active ? 'Ativo' : 'Pausado'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {FREQUENCY_LABELS[alert.frequency]}
                        </Badge>
                      </div>

                      <div className="text-muted-foreground mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                        {alert.keywords && (
                          <span>🔎 {alert.keywords}</span>
                        )}
                        {(alert.city || alert.state) && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {alert.city}
                            {alert.state ? `/${alert.state}` : ''}
                          </span>
                        )}
                        {alert.contract_type && (
                          <span className="inline-flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {alert.contract_type}
                          </span>
                        )}
                        {(alert.salary_min || alert.salary_max) && (
                          <span>
                            R$ {alert.salary_min ?? '?'} – R${' '}
                            {alert.salary_max ?? '?'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(alert.id, alert.is_active)}
                        aria-label={
                          alert.is_active ? 'Pausar alerta' : 'Ativar alerta'
                        }
                      >
                        {alert.is_active ? (
                          <PowerOff className="h-4 w-4" />
                        ) : (
                          <Power className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm(alert.id)}
                        aria-label="Remover alerta"
                      >
                        <Trash2 className="text-destructive h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Remover alerta?"
        message="Tem certeza que deseja remover este alerta? Essa ação não pode ser desfeita."
        confirmLabel="Remover"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </>
  );
}
