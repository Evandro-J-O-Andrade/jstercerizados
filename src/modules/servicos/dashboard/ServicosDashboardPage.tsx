'use client';

import { useEffect, useState } from 'react';
import { Briefcase, ClipboardList, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { servicesRepository } from '@/repositories/services.repository';
import { useAuth } from '@/contexts/AuthContext';

export default function ServicosDashboardPage() {
  const { currentTenantId } = useAuth();
  const [stats, setStats] = useState({ services: 0, orders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (!currentTenantId) return;
        const services = await servicesRepository.findServices(currentTenantId);
        setStats({
          services: services.length,
          orders: 0,
        });
      } catch (err) {
        console.error('Erro ao carregar estatísticas de serviços:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentTenantId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            Dashboard de Serviços
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestão de serviços, ordens e execuções
          </p>
        </div>
        <Link to="/dashboard/servicos/ordens/criar">
          <Button>
            <ClipboardList className="h-4 w-4 mr-2" />
            Nova Ordem
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Serviços Ativos</p>
              <p className="text-2xl font-bold text-foreground mt-1">{loading ? '-' : stats.services}</p>
            </div>
            <Briefcase className="h-8 w-8 text-primary" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Ordens Abertas</p>
              <p className="text-2xl font-bold text-foreground mt-1">-</p>
            </div>
            <ClipboardList className="h-8 w-8 text-warning" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Em Execução</p>
              <p className="text-2xl font-bold text-foreground mt-1">-</p>
            </div>
            <AlertCircle className="h-8 w-8 text-info" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Concluídas</p>
              <p className="text-2xl font-bold text-foreground mt-1">-</p>
            </div>
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Ações Rápidas</h2>
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
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
        </div>
      </Card>
    </div>
  );
}
