import {
  ArrowRight,
  Bell,
  Briefcase,
  CheckCircle2,
  Clock,
  MapPin,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useCandidato } from '@/modules/candidato/CandidatoContext';

export function AlertsSummary() {
  const { jobAlerts } = useCandidato();

  const activeAlerts = jobAlerts.filter((a) => a.is_active);
  const totalAlerts = jobAlerts.length;

  if (activeAlerts.length === 0) {
    return (
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-foreground text-lg font-semibold">
            Alertas de Vagas
          </h3>
          <span className="text-muted-foreground text-sm">
            {totalAlerts} cadastrado(s)
          </span>
        </div>
        <div className="py-8 text-center">
          <Bell className="text-muted-foreground/30 mx-auto mb-3 h-12 w-12" />
          <p className="text-muted-foreground">
            Nenhum alerta ativo configurado
          </p>
          <a
            href="/candidato/alertas"
            className="text-primary mt-4 inline-flex items-center gap-2 text-sm font-medium hover:underline"
          >
            Criar alerta
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-foreground text-lg font-semibold">
          Alertas de Vagas
        </h3>
        <span className="text-muted-foreground text-sm">
          {activeAlerts.length} ativo(s) de {totalAlerts} total
        </span>
      </div>

      <div className="mb-4 space-y-3">
        {activeAlerts.slice(0, 3).map((alert) => (
          <div
            key={alert.id}
            className="bg-muted/30 hover:bg-muted/50 flex items-center justify-between rounded-lg p-3 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <h4 className="text-foreground truncate font-medium">
                  {alert.name || 'Alerta sem nome'}
                </h4>
                <Badge variant="success" className="text-xs">
                  <CheckCircle2 className="mr-1 h-2.5 w-2.5" />
                  Ativo
                </Badge>
              </div>
              <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
                {alert.keywords && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {alert.keywords}
                  </span>
                )}
                {(alert.city || alert.state) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {alert.city}
                    {alert.state ? `, ${alert.state}` : ''}
                  </span>
                )}
                {alert.work_mode && (
                  <span className="flex items-center gap-1">
                    <span className="bg-primary h-1.5 w-1.5 rounded-full" />
                    {alert.work_mode === 'onsite'
                      ? 'Presencial'
                      : alert.work_mode === 'hybrid'
                        ? 'Híbrido'
                        : 'Remoto'}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {alert.frequency === 'daily'
                    ? 'Diário'
                    : alert.frequency === 'weekly'
                      ? 'Semanal'
                      : 'Instantâneo'}
                </span>
              </div>
            </div>
            <span className="text-muted-foreground">
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        ))}
      </div>

      <div className="border-t pt-4">
        <a
          href="/candidato/alertas"
          className="text-primary flex items-center justify-center gap-2 text-sm font-medium hover:underline"
        >
          Gerenciar {totalAlerts} alerta(s)
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </Card>
  );
}
