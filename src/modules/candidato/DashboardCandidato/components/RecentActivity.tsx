import { Link } from 'react-router-dom';
import { Clock, FileText, Heart, Bell, ArrowRight, Plus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useCandidato } from '@/modules/candidato/CandidatoContext';
import { cn } from '@/utils';

const FREQUENCY_LABELS: Record<string, string> = {
  instant: 'Imediato',
  daily: 'Diário',
  weekly: 'Semanal',
};

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Agora mesmo';
  if (diffMins < 60) return `${diffMins} min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

type ActivityItem = {
  id: string;
  type: 'application' | 'favorite' | 'interview' | 'alert' | 'profile_update';
  title: string;
  description: string;
  timestamp: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
};

export function RecentActivity() {
  const { applications, favorites, jobAlerts } = useCandidato();

  const activities: ActivityItem[] = [];

  const recentApps = [...applications]
    .sort(
      (a, b) =>
        new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime(),
    )
    .slice(0, 3);

  recentApps.forEach((app) => {
    const jobCity = app.job?.city;
    const jobState = app.job?.state;
    const location = jobCity
      ? `${jobCity}${jobState ? `, ${jobState}` : ''}`
      : 'Local não informado';

    activities.push({
      id: `app-${app.id}`,
      type: 'application',
      title: `Candidatura: ${app.job?.title || 'Vaga'}`,
      description: location,
      timestamp: app.applied_at,
      href: `/candidato/candidaturas/${app.id}`,
      icon: FileText,
      iconColor: 'bg-primary/10 text-primary',
    });
  });

  const recentFavorites = [...favorites]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 2);

  recentFavorites.forEach((fav) => {
    const jobCity = fav.job?.city;
    const jobState = fav.job?.state;
    const location = jobCity
      ? `${jobCity}${jobState ? `, ${jobState}` : ''}`
      : 'Local não informado';

    activities.push({
      id: `fav-${fav.id}`,
      type: 'favorite',
      title: `Favoritou: ${fav.job?.title || 'Vaga'}`,
      description: location,
      timestamp: fav.created_at,
      href: `/vagas/${fav.job?.slug}`,
      icon: Heart,
      iconColor: 'bg-pink/10 text-pink-600',
    });
  });

  const recentAlerts = [...jobAlerts]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 1);

  recentAlerts.forEach((alert) => {
    activities.push({
      id: `alert-${alert.id}`,
      type: 'alert',
      title: `Alerta criado: ${alert.name}`,
      description: `${FREQUENCY_LABELS[alert.frequency] || alert.frequency} • ${alert.city || ''}${alert.state ? `, ${alert.state}` : ''}`,
      timestamp: alert.created_at,
      href: '/candidato/alertas',
      icon: Bell,
      iconColor: 'bg-warning/10 text-warning',
    });
  });

  const sortedActivities = activities
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    .slice(0, 6);

  if (sortedActivities.length === 0) {
    return (
      <Card className="p-6">
        <div className="py-8 text-center">
          <Clock className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
          <h3 className="text-foreground font-semibold">
            Nenhuma atividade recente
          </h3>
          <p className="text-muted-foreground mt-1 mb-4 text-sm">
            Suas ações aparecerão aqui conforme você usar a plataforma
          </p>
          <Link
            to="/candidato/buscar-vagas"
            className="text-primary hover:text-primary/80 inline-flex items-center gap-2 font-medium"
          >
            <Plus className="h-4 w-4" />
            Buscar vagas
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-border flex items-center justify-between border-b p-4">
        <div>
          <h3 className="text-foreground flex items-center gap-2 font-semibold">
            <Clock className="h-5 w-5" />
            Atividade Recente
          </h3>
        </div>
      </div>

      <div className="divide-border divide-y">
        {sortedActivities.map((activity) => (
          <Link
            key={activity.id}
            to={activity.href || '#'}
            className={cn(
              'hover:bg-muted/30 flex items-center gap-4 p-4 transition-colors',
              !activity.href && 'pointer-events-none cursor-default',
            )}
          >
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                activity.iconColor,
              )}
            >
              <activity.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-foreground truncate font-medium">
                {activity.title}
              </p>
              <p className="text-muted-foreground truncate text-sm">
                {activity.description}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <span className="text-muted-foreground text-xs">
                {formatRelativeTime(activity.timestamp)}
              </span>
            </div>
            <ArrowRight className="text-muted-foreground/50 h-5 w-5 shrink-0" />
          </Link>
        ))}
      </div>
    </Card>
  );
}
