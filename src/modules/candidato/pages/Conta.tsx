import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/contexts/AuthContext';
import { useCandidato } from '@/modules/candidato/CandidatoContext';
import { ContentBoundary } from '@/components/feedback/ContentBoundary';
import { useToast } from '@/components/feedback/ToastContext';
import { SEO } from '@/components/ui/SEO';
import { COMPANY } from '@/config';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  FileText,
  Bell,
  BellOff,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const CANDIDATO_HOME = '/candidato';

export default function CandidateConta() {
  const { person, logout } = useAuth();
const {
    candidate,
    jobAlerts,
    refetch,
    isLoading,
    error,
    deleteAlert,
  } = useCandidato();
  const { addToast } = useToast();

  const handleDeleteAlert = async (id: string) => {
    const result = await deleteAlert(id);
    if (result?.error) {
      addToast({ type: 'error', message: result.error });
    } else {
      addToast({ type: 'success', message: 'Alerta cancelado!' });
    }
  };

  return (
    <>
      <SEO
        title={`Minha conta — ${COMPANY.name}`}
        description="Gerencie sua conta e configurações"
        noindex
      />

      <div className="space-y-6">
        <header>
          <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
            Minha conta
          </h1>
          <p className="text-muted-foreground mt-1">
            Informações pessoais e configurações da sua conta.
          </p>
        </header>

        <ContentBoundary
          status={
            isLoading
              ? 'loading'
              : error
                ? 'error'
                : candidate
                  ? 'success'
                  : 'empty'
          }
          error={error}
          onRetry={() => void refetch()}
          homeRoute={CANDIDATO_HOME}
          emptyTitle="Cadastro de candidato não encontrado"
          emptyDescription="Complete seu cadastro para visualizar sua conta."
        >
          {candidate && person && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card variant="default" className="p-6">
                <h2 className="text-foreground flex items-center gap-2 text-lg font-semibold">
                  <User className="h-5 w-5" />
                  Dados pessoais
                </h2>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <User className="text-muted-foreground h-4 w-4" />
                    <span>{person.full_name ?? '—'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="text-muted-foreground h-4 w-4" />
                    <span>{person.email ?? '—'}</span>
                  </div>
                  {person.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="text-muted-foreground h-4 w-4" />
                      <span>{person.phone}</span>
                    </div>
                  )}
                  {(person as { city?: string | null }).city && (
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="text-muted-foreground h-4 w-4" />
                      <span>{(person as { city?: string | null }).city}</span>
                    </div>
                  )}
                  {candidate.headline && (
                    <div className="flex items-start gap-3 text-sm">
                      <Briefcase className="text-muted-foreground mt-0.5 h-4 w-4" />
                      <span>{candidate.headline}</span>
                    </div>
                  )}
                </div>
              </Card>

              <Card variant="default" className="p-6">
                <h2 className="text-foreground flex items-center gap-2 text-lg font-semibold">
                  <FileText className="h-5 w-5" />
                  Status do perfil
                </h2>
                <div className="mt-4 space-y-3">
                  <div>
                    <Badge
                      variant={
                        candidate.status === 'active' ? 'success' : 'default'
                      }
                    >
                      {candidate.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span>
                      {candidate.metadata?.profile_state
                        ? String(candidate.metadata.profile_state).replace(
                            /_/g,
                            ' ',
                          )
                        : '—'}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await logout();
                      await refetch();
                    }}
                  >
                    Sair da conta
                  </Button>
                </div>
              </Card>

              <Card variant="default" className="p-6 lg:col-span-2">
                <h2 className="text-foreground flex items-center gap-2 text-lg font-semibold">
                  <Bell className="h-5 w-5" />
                  Alertas de vaga
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Você possui {jobAlerts.length} alerta(s) ativo(s).
                </p>
                {jobAlerts.length === 0 ? (
                  <div className="mt-4 py-4 text-center">
                    <BellOff className="text-muted-foreground/30 mx-auto mb-2 h-8 w-8" />
                    <p className="text-muted-foreground text-sm">
                      Você não possui alertas de vaga ativos.
                    </p>
                  </div>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {jobAlerts.map((alert) => (
                      <li
                        key={alert.id}
                        className="border-border flex items-center justify-between rounded border p-3"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {alert.name}
                          </p>
                          {alert.frequency && (
                            <p className="text-muted-foreground text-xs">
                              Frequência: {alert.frequency}
                            </p>
                          )}
                          {alert.last_sent_at && (
                            <p className="text-muted-foreground text-xs">
                              Ãšltimo envio:{' '}
                              {new Date(alert.last_sent_at).toLocaleDateString(
                                'pt-BR',
                              )}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {alert.is_active ? (
                            <CheckCircle className="text-green-500 h-4 w-4" />
                          ) : (
                            <XCircle className="text-muted-foreground h-4 w-4" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAlert(alert.id)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          )}
        </ContentBoundary>
      </div>
    </>
  );
}

