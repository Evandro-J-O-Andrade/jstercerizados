'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Briefcase,
  Building2,
  Wallet,
  FileText,
  Calculator,
  Package,
  Headphones,
  CircleDollarSign,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/fallback';
import { employeesRepository } from '@/repositories/employees.repository';
import { jobsRepository } from '@/repositories/jobs.repository';
import { companiesRepository } from '@/repositories/companies.repository';
import { accountsPayableRepository } from '@/repositories/accounts-payable.repository';
import { accountsReceivableRepository } from '@/repositories/accounts-receivable.repository';
import { cashFlowRepository } from '@/repositories/cash-flow.repository';
import type { Employee } from '@/types/domain/employee';
import type { Job } from '@/types/domain/job';
import type { Company } from '@/types/domain/company';
import type { AccountPayable } from '@/types/domain/finance';
import type { AccountReceivable } from '@/types/domain/finance';
import type { CashFlow } from '@/types/domain/finance';
import { useAuth } from '@/contexts/AuthContext';

interface ModuleSummary {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  total: number;
  color: string;
  bg: string;
  route: string;
}

export default function RelatoriosPage() {
  const { currentTenantId } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [payables, setPayables] = useState<AccountPayable[]>([]);
  const [receivables, setReceivables] = useState<AccountReceivable[]>([]);
  const [cashFlows, setCashFlows] = useState<CashFlow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentTenantId) return;
    setLoading(true);
    Promise.all([
      employeesRepository.findAll(currentTenantId),
      jobsRepository.findAll(currentTenantId),
      companiesRepository.findAll(currentTenantId),
      accountsPayableRepository.findAll(currentTenantId),
      accountsReceivableRepository.findAll(currentTenantId),
      cashFlowRepository.findAll(currentTenantId),
    ])
      .then(([emp, jobsData, comp, pay, rec, cf]) => {
        setEmployees(emp);
        setJobs(jobsData);
        setCompanies(comp);
        setPayables(pay);
        setReceivables(rec);
        setCashFlows(cf);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentTenantId]);

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const summaries = useMemo<ModuleSummary[]>(() => {
    const totalPayables = payables.reduce((sum, item) => sum + item.amount, 0);
    const totalReceivables = receivables.reduce((sum, item) => sum + item.amount, 0);

    return [
      {
        id: 'rh',
        title: 'RH',
        icon: Users,
        total: employees.length,
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        route: '/dashboard/rh',
      },
      {
        id: 'recrutamento',
        title: 'Recrutamento',
        icon: Briefcase,
        total: jobs.length,
        color: 'text-purple-700',
        bg: 'bg-purple-50',
        route: '/dashboard/recrutamento',
      },
      {
        id: 'crm',
        title: 'CRM',
        icon: Building2,
        total: companies.length,
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        route: '/dashboard/crm',
      },
      {
        id: 'financeiro',
        title: 'Financeiro',
        icon: Wallet,
        total: totalPayables + totalReceivables,
        color: 'text-green-700',
        bg: 'bg-green-50',
        route: '/dashboard/financeiro',
      },
      {
        id: 'faturamento',
        title: 'Faturamento',
        icon: FileText,
        total: 0,
        color: 'text-orange-700',
        bg: 'bg-orange-50',
        route: '/dashboard/faturamento',
      },
      {
        id: 'fiscal',
        title: 'Fiscal',
        icon: Calculator,
        total: 0,
        color: 'text-red-700',
        bg: 'bg-red-50',
        route: '/dashboard/fiscal',
      },
      {
        id: 'contabilidade',
        title: 'Contabilidade',
        icon: CircleDollarSign,
        total: 0,
        color: 'text-indigo-700',
        bg: 'bg-indigo-50',
        route: '/dashboard/contabilidade',
      },
      {
        id: 'estoque',
        title: 'Estoque',
        icon: Package,
        total: 0,
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        route: '/dashboard/estoque',
      },
      {
        id: 'almoxarifado',
        title: 'Almoxarifado',
        icon: Package,
        total: 0,
        color: 'text-teal-700',
        bg: 'bg-teal-50',
        route: '/dashboard/almoxarifado',
      },
      {
        id: 'servicos',
        title: 'Serviços',
        icon: Briefcase,
        total: 0,
        color: 'text-cyan-700',
        bg: 'bg-cyan-50',
        route: '/dashboard/servicos',
      },
      {
        id: 'suporte',
        title: 'Suporte',
        icon: Headphones,
        total: 0,
        color: 'text-pink-700',
        bg: 'bg-pink-50',
        route: '/dashboard/suporte',
      },
    ];
  }, [employees, jobs, companies, payables, receivables]);

  const financeKpis = useMemo(() => {
    const totalPayables = payables.reduce((sum, item) => sum + item.amount, 0);
    const totalReceivables = receivables.reduce((sum, item) => sum + item.amount, 0);
    const totalIncome = cashFlows.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = cashFlows.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
    const balance = totalIncome - totalExpense;
    return { totalPayables, totalReceivables, totalIncome, totalExpense, balance };
  }, [payables, receivables, cashFlows]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Carregando relatório geral...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Relatório Geral</h1>
        <p className="text-sm text-muted-foreground">
          Visão consolidada de todos os módulos da operação.
        </p>
      </div>

      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {summaries.map((module) => {
          const Icon = module.icon;
          return (
            <Card key={module.id} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg ${module.bg} p-2 ${module.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{module.title}</p>
                  <p className="text-lg font-semibold text-foreground">
                    {module.id === 'financeiro'
                      ? formatCurrency(module.total)
                      : module.total}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Financeiro</h3>
      {financeKpis.totalPayables === 0 && financeKpis.totalReceivables === 0 && financeKpis.totalIncome === 0 && financeKpis.totalExpense === 0 ? (
        <EmptyState
          title="Sem dados financeiros"
          description="Quando houver lançamentos, os indicadores aparecerão aqui."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Contas a pagar</p>
            <p className="text-sm font-semibold text-red-700">{formatCurrency(financeKpis.totalPayables)}</p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Contas a receber</p>
            <p className="text-sm font-semibold text-green-700">{formatCurrency(financeKpis.totalReceivables)}</p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Entradas</p>
            <p className="text-sm font-semibold text-green-700">{formatCurrency(financeKpis.totalIncome)}</p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Saídas</p>
            <p className="text-sm font-semibold text-red-700">{formatCurrency(financeKpis.totalExpense)}</p>
          </div>
          <div className="rounded-lg border border-border p-3 sm:col-span-2">
            <p className="text-xs text-muted-foreground">Saldo</p>
            <p className={`text-sm font-semibold ${financeKpis.balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatCurrency(financeKpis.balance)}
            </p>
          </div>
        </div>
      )}
        </Card>

        <Card className="p-4">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Visão rápida</h3>
          <EmptyState
            title="Relatórios específicos"
            description="Acesse cada módulo para ver seus relatórios e indicadores detalhados."
          />
        </Card>
      </div>
    </div>
  );
}

