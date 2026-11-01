'use client';

import { useEffect, useState } from 'react';
import { Building2, Users, FileText, Briefcase } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { companiesRepository } from '@/repositories/companies.repository';
import { useAuth } from '@/contexts/AuthContext';

export default function EmpresasDashboardPage() {
  const { currentTenantId } = useAuth();
  const [stats, setStats] = useState({ total: 0, active: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (!currentTenantId) return;
        const companies = await companiesRepository.findAll(currentTenantId);
        setStats({
          total: companies.length,
          active: companies.filter((c: any) => c.status !== 'inactive').length,
        });
      } catch (err) {
        console.error('Erro ao carregar estatísticas de empresas:', err);
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
            <Building2 className="h-6 w-6" />
            Dashboard de Empresas
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestão de empresas, clientes e parceiros
          </p>
        </div>
        <Link to="/dashboard/empresas/nova">
          <Button>
            <Building2 className="h-4 w-4 mr-2" />
            Nova Empresa
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Empresas</p>
              <p className="text-2xl font-bold text-foreground mt-1">{loading ? '-' : stats.total}</p>
            </div>
            <Building2 className="h-8 w-8 text-primary" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Ativas</p>
              <p className="text-2xl font-bold text-foreground mt-1">{loading ? '-' : stats.active}</p>
            </div>
            <Users className="h-8 w-8 text-success" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Contratos</p>
              <p className="text-2xl font-bold text-foreground mt-1">-</p>
            </div>
            <FileText className="h-8 w-8 text-warning" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Oportunidades</p>
              <p className="text-2xl font-bold text-foreground mt-1">-</p>
            </div>
            <Briefcase className="h-8 w-8 text-info" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Ações Rápidas</h2>
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          <Link to="/dashboard/empresas/lista" className="p-3 border rounded-lg hover:bg-accent transition-colors">
            <div className="font-medium">Listar Empresas</div>
            <div className="text-sm text-muted-foreground">Ver todas as empresas cadastradas</div>
          </Link>
          <Link to="/dashboard/empresas/nova" className="p-3 border rounded-lg hover:bg-accent transition-colors">
            <div className="font-medium">Cadastrar Empresa</div>
            <div className="text-sm text-muted-foreground">Adicionar nova empresa</div>
          </Link>
        </div>
      </Card>
    </div>
  );
}
