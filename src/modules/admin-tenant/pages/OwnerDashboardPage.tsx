/**
 * OwnerDashboardPage — Dashboard exclusivo do proprietário.
 *
 * Visão central do ambiente J&S para o perfil de proprietário,
 * acima do admin-master. Exibe métricas de tenants, sistemas,
 * unidades, administradores e módulos disponíveis.
 */

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  LayoutDashboard,
  Lock,
  ShieldCheck,
  Users,
  UserPlus,
  Wrench,
} from 'lucide-react';
import {
  DashboardCard,
  DashboardMetricGrid,
  DashboardSection,
} from '@/components/dashboard';
import {
  filterDashboardMetrics,
  type DashboardMetric,
} from '@/components/dashboard/dashboard-model';
import { EmptyState } from '@/components/fallback';
import { useAccount } from '@/contexts/AccountContext';
import { useAuth } from '@/contexts/AuthContext';

export default function OwnerDashboardPage() {
  const { identity, permissions, availableModules } = useAccount();
  const { isAdminMaster } = useAuth();

  const metrics = useMemo<DashboardMetric[]>(
    () => [
      {
        id: 'tenants',
        label: 'Tenants',
        value: 0,
        description: 'Ambientes cadastrados no ambiente',
        icon: Building2,
        tone: 'primary',
        href: '/dashboard/owner/tenants',
        permission: 'owner.tenants.read',
        format: 'number',
      },
      {
        id: 'sistemas',
        label: 'Sistemas',
        value: 0,
        description: 'Sistemas integrados ao ambiente',
        icon: BriefcaseBusiness,
        tone: 'success',
        href: '/dashboard/owner/sistemas',
        permission: 'owner.systems.read',
        format: 'number',
      },
      {
        id: 'unidades',
        label: 'Unidades',
        value: 0,
        description: 'Unidades operacionais cadastradas',
        icon: Users,
        tone: 'primary',
        href: '/dashboard/owner/unidades',
        permission: 'owner.units.read',
        format: 'number',
      },
      {
        id: 'administradores',
        label: 'Administradores',
        value: 0,
        description: 'Administradores ativos no ambiente',
        icon: UserPlus,
        tone: 'warning',
        href: '/dashboard/owner/administradores',
        permission: 'owner.administrators.read',
        format: 'number',
      },
      {
        id: 'modulos',
        label: 'Módulos',
        value: availableModules.length,
        description: 'Módulos operacionais disponíveis',
        icon: LayoutDashboard,
        tone: 'neutral',
        href: '/dashboard/owner/gestao',
        permission: 'owner.management.read',
        format: 'number',
      },
    ],
    [availableModules.length],
  );
  const visibleMetrics = filterDashboardMetrics(
    metrics,
    permissions,
    isAdminMaster,
  );

  return (
    <div className="space-y-6">
      <section className="from-primary/10 via-card to-card border-border relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 shadow-sm">
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-primary mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase">
              <ShieldCheck className="h-4 w-4" />
              Proprietário do Ambiente
            </div>
            <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
              {identity.greeting}, {identity.firstName}.
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-6">
              Ambiente exclusivo do proprietário: tenants, sistemas, unidades,
              administradores, gestões, segurança, auditoria e configurações.
            </p>
          </div>
          <div className="text-muted-foreground text-sm lg:text-right">
            <p className="text-foreground font-medium">
              {identity.contextLabel}
            </p>
            <p>
              {new Date().toLocaleDateString('pt-BR', { dateStyle: 'long' })}
            </p>
          </div>
        </div>
      </section>

      {visibleMetrics.length > 0 ? (
        <DashboardMetricGrid>
          {visibleMetrics.map((metric) => (
            <DashboardCard key={metric.id} metric={metric} />
          ))}
        </DashboardMetricGrid>
      ) : (
        <EmptyState
          title="Nenhum indicador disponível"
          description="Seu perfil não possui indicadores liberados para visualização."
        />
      )}

      <DashboardSection
        title="Acesso rápido"
        description="Atalhos para as áreas principais de administração do proprietário."
        icon={Activity}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: 'Tenants', href: '/dashboard/owner/tenants', icon: Building2, perm: 'owner.tenants.read' },
            { label: 'Sistemas', href: '/dashboard/owner/sistemas', icon: BriefcaseBusiness, perm: 'owner.systems.read' },
            { label: 'Unidades', href: '/dashboard/owner/unidades', icon: Users, perm: 'owner.units.read' },
            { label: 'Administradores', href: '/dashboard/owner/administradores', icon: UserPlus, perm: 'owner.administrators.read' },
            { label: 'Gestões', href: '/dashboard/owner/gestao', icon: Wrench, perm: 'owner.management.read' },
            { label: 'Segurança', href: '/dashboard/owner/seguranca', icon: Lock, perm: 'owner.security.read' },
          ].map((item) => (
            permissions.some((p) => p.name === item.perm) && (
              <Link
                key={item.label}
                to={item.href}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 text-left hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {React.createElement(item.icon)}
                </div>
                <h3 className="text-foreground text-sm font-semibold group-hover:text-primary-foreground transition-colors">
                  {item.label}
                </h3>
                <p className="text-muted-foreground text-xs">
                  Acesse a área de {item.label.toLowerCase()}
                </p>
              </Link>
            )
          ))}
        </div>
      </DashboardSection>

      {availableModules.length > 0 && (
        <DashboardSection
          title="Módulos do Portal"
          description="Acesse as áreas operacionais disponíveis para o seu perfil."
          icon={BarChart3}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availableModules.slice(0, 6).map((module) => (
              <Link
                key={module.id}
                to={module.route}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 text-left hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <h3 className="text-foreground text-sm font-semibold group-hover:text-primary-foreground transition-colors">
                  {module.title}
                </h3>
                <p className="text-muted-foreground text-xs">
                  {module.description || 'Acesse o módulo'}
                </p>
              </Link>
            ))}
          </div>
        </DashboardSection>
      )}
    </div>
  );
}
