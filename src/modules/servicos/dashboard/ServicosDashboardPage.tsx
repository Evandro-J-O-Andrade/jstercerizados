'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Briefcase,
  ClipboardList,
  CheckCircle,
  Play,
  Star,
  AlertTriangle,
  Users,
  Plus,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { servicesRepository } from '@/repositories/services.repository';
import { useAuth } from '@/contexts/AuthContext';
import { SERVICOS_PERMISSIONS } from '@/modules/servicos/permissions';

const STAT_CARDS = [
  {
    key: 'services',
    label: 'Serviços Publicados',
    icon: Briefcase,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    key: 'ordersOpen',
    label: 'Ordens Abertas',
    icon: ClipboardList,
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
  {
    key: 'ordersInProgress',
    label: 'Em Execução',
    icon: Play,
    color: 'text-info',
    bg: 'bg-info/10',
  },
  {
    key: 'ordersCompleted',
    label: 'Concluídas',
    icon: CheckCircle,
    color: 'text-success',
    bg: 'bg-success/10',
  },
  {
    key: 'acceptances',
    label: 'Aceites',
    icon: CheckCircle,
    color: 'text-secondary',
    bg: 'bg-secondary/10',
  },
  {
    key: 'occurrences',
    label: 'Ocorrências',
    icon: AlertTriangle,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
  },
  {
    key: 'ratings',
    label: 'Avaliações',
    icon: Star,
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
  {
    key: 'companies',
    label: 'Empresas Contratantes',
    icon: Users,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
];

export default function ServicosDashboardPage() {
  const { currentTenantId, hasAnyPermission } = useAuth();
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    if (!currentTenantId) {
      setLoading(false);
      return;
    }
    try {
      const [services, orders, , acceptances, occurrences, ratings] =
        await Promise.all([
          servicesRepository.findServices(currentTenantId),
          servicesRepository.findOrders(currentTenantId),
          servicesRepository.findExecutions(currentTenantId),
          servicesRepository.findAcceptances(currentTenantId),
          servicesRepository.findOccurrences(currentTenantId),
          servicesRepository.findRatings(currentTenantId),
        ]);
      setStats({
        services: services.filter((s) => s.status === 'published').length,
        ordersOpen: orders.filter(
          (o) => o.status === 'pending' || o.status === 'scheduled',
        ).length,
        ordersInProgress: orders.filter(
          (o) => o.status === 'in_progress',
        ).length,
        ordersCompleted: orders.filter(
          (o) => o.status === 'completed',
        ).length,
        acceptances: acceptances.length,
        occurrences: occurrences.length,
        ratings: ratings.length,
        companies: 0,
      });
    } catch (err) {
      console.error('Erro ao carregar estatísticas de serviços:', err);
    } finally {
      setLoading(false);
    }
  }, [currentTenantId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const canCreateService = hasAnyPermission([
    SERVICOS_PERMISSIONS.servicesCreate,
  ]);
  const canCreateOrder = hasAnyPermission([
    SERVICOS_PERMISSIONS.serviceOrdersCreate,
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            Dashboard de Serviços
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestão de catálogo, ordens, execuções e aceites
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canCreateOrder && (
            <Link to="/dashboard/servicos/ordens/nova">
              <Button>
                <ClipboardList className="h-4 w-4 mr-2" />
                Nova Ordem
              </Button>
            </Link>
          )}
          {canCreateService && (
            <Link to="/dashboard/servicos/catalogo/novo">
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Novo Serviço
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <Card key={card.key} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {loading ? '-' : stats[card.key] ?? 0}
                </p>
              </div>
              <card.icon className={`h-8 w-8 ${card.color}`} />
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Ações Rápidas</h2>
        <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-4">
          <Link to="/dashboard/servicos/catalogo" className="p-3 border rounded-lg hover:bg-accent transition-colors">
            <div className="font-medium">Catálogo de Serviços</div>
            <div className="text-sm text-muted-foreground">Gerenciar serviços oferecidos</div>
          </Link>
          <Link to="/dashboard/servicos/ordens" className="p-3 border rounded-lg hover:bg-accent transition-colors">
            <div className="font-medium">Ordens de Serviço</div>
            <div className="text-sm text-muted-foreground">Acompanhar ordens</div>
          </Link>
          <Link to="/dashboard/servicos/execucoes" className="p-3 border rounded-lg hover:bg-accent transition-colors">
            <div className="font-medium">Execuções</div>
            <div className="text-sm text-muted-foreground">Controle de execução</div>
          </Link>
          <Link to="/dashboard/servicos/aceites" className="p-3 border rounded-lg hover:bg-accent transition-colors">
            <div className="font-medium">Aceites</div>
            <div className="text-sm text-muted-foreground">Aceites de clientes</div>
          </Link>
          <Link to="/dashboard/servicos/ocorrencias" className="p-3 border rounded-lg hover:bg-accent transition-colors">
            <div className="font-medium">Ocorrências</div>
            <div className="text-sm text-muted-foreground">Intercorrências</div>
          </Link>
          <Link to="/dashboard/servicos/avaliacoes" className="p-3 border rounded-lg hover:bg-accent transition-colors">
            <div className="font-medium">Avaliações</div>
            <div className="text-sm text-muted-foreground">Feedback de clientes</div>
          </Link>
        </div>
      </Card>
    </div>
  );
}
