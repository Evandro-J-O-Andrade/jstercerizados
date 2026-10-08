import { FileText, Search, Sparkles, Bell, Calendar, User } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function QuickActions() {
  const actions = [
    {
      title: 'Buscar Vagas',
      description: 'Encontre novas oportunidades',
      icon: Search,
      href: '/candidato/buscar-vagas',
    },
    {
      title: 'Vagas Recomendadas',
      description: 'Baseadas no seu perfil',
      icon: Sparkles,
      href: '/candidato/vagas/recomendadas',
    },
    {
      title: 'Minhas Candidaturas',
      description: 'Acompanhe o status',
      icon: FileText,
      href: '/candidato/candidaturas',
    },
    {
      title: 'Próximas Entrevistas',
      description: 'Agendadas e pendentes',
      icon: Calendar,
      href: '/candidato/entrevistas',
    },
    {
      title: 'Alertas de Vagas',
      description: 'Configure notificações',
      icon: Bell,
      href: '/candidato/alertas',
    },
    {
      title: 'Perfil Profissional',
      description: 'Edite suas informações',
      icon: User,
      href: '/candidato/perfil',
    },
  ];

  return (
    <Card className="p-6">
      <h3 className="text-foreground mb-4 text-lg font-semibold">
        Ações Rápidas
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {actions.map((action) => (
          <a
            key={action.title}
            href={action.href}
            className="border-border/30 hover:border-primary/30 hover:bg-primary/5 flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-all"
          >
            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
              <action.icon className="h-5 w-5" />
            </div>
            <span className="text-foreground text-sm font-medium">
              {action.title}
            </span>
            <span className="text-muted-foreground text-xs">
              {action.description}
            </span>
          </a>
        ))}
      </div>
    </Card>
  );
}
