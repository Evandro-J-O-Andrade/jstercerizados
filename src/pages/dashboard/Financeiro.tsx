import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  TrendingDown,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/sections/Section';
import { Container } from '@/components/common/Container';
import { staggerReveal, revealUp } from '@/animations/scroll';
import { staggerItem } from '@/animations/fade';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { accountsReceivableRepository } from '@/repositories/accounts-receivable.repository';
import { accountsPayableRepository } from '@/repositories/accounts-payable.repository';

interface FinanceStats {
  totalReceivable: number;
  totalPayable: number;
  balance: number;
  overdueReceivable: number;
  overduePayable: number;
  receivablesCount: number;
  payablesCount: number;
}

export default function Financeiro() {
  const { currentTenantId } = useAuth();

  const { data: receivables = [] } = useQuery({
    queryKey: ['accounts-receivable', currentTenantId],
    queryFn: async () => {
      if (!currentTenantId) return [];
      return accountsReceivableRepository.findAll(currentTenantId);
    },
    enabled: Boolean(currentTenantId),
  });

  const { data: payables = [] } = useQuery({
    queryKey: ['accounts-payable', currentTenantId],
    queryFn: async () => {
      if (!currentTenantId) return [];
      return accountsPayableRepository.findAll(currentTenantId);
    },
    enabled: Boolean(currentTenantId),
  });

  const stats = useMemo<FinanceStats>(() => {
    const totalReceivable = receivables.reduce(
      (sum, item) => sum + (item.amount || 0),
      0,
    );
    const totalPayable = payables.reduce(
      (sum, item) => sum + (item.amount || 0),
      0,
    );
    const balance = totalReceivable - totalPayable;

    const today = new Date().toISOString().split('T')[0];
    const overdueReceivable = receivables
      .filter(
        (item) =>
          item.due_date &&
          item.due_date < today &&
          item.status !== 'received' &&
          item.status !== 'partially_received',
      )
      .reduce((sum, item) => sum + (item.amount || 0), 0);
    const overduePayable = payables
      .filter(
        (item) =>
          item.due_date && item.due_date < today && item.status !== 'paid',
      )
      .reduce((sum, item) => sum + (item.amount || 0), 0);

    return {
      totalReceivable,
      totalPayable,
      balance,
      overdueReceivable,
      overduePayable,
      receivablesCount: receivables.length,
      payablesCount: payables.length,
    };
  }, [receivables, payables]);

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

  return (
    <div className="min-h-screen">
      <Section className="pt-20 md:pt-28">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerReveal(0.15)}
            className="mb-12"
          >
            <motion.h1
              variants={revealUp}
              className="text-foreground text-3xl font-bold sm:text-4xl"
            >
              Financeiro
            </motion.h1>
            <motion.p
              variants={revealUp}
              className="text-muted-foreground mt-2 text-lg"
            >
              Visão consolidada de contas a receber, pagar e fluxo de caixa.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerReveal(0.1)}
            className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            <motion.div variants={staggerItem('up')}>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Contas a Receber
                    </p>
                    <p className="text-foreground mt-1 text-2xl font-bold">
                      {formatCurrency(stats.totalReceivable)}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {stats.receivablesCount} títulos
                    </p>
                  </div>
                  <div className="bg-success/10 text-success flex h-12 w-12 items-center justify-center rounded-xl">
                    <ArrowUpRight className="h-6 w-6" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem('up')}>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Contas a Pagar
                    </p>
                    <p className="text-foreground mt-1 text-2xl font-bold">
                      {formatCurrency(stats.totalPayable)}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {stats.payablesCount} títulos
                    </p>
                  </div>
                  <div className="bg-destructive/10 text-destructive flex h-12 w-12 items-center justify-center rounded-xl">
                    <ArrowDownRight className="h-6 w-6" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem('up')}>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Saldo</p>
                    <p
                      className={`mt-1 text-2xl font-bold ${
                        stats.balance >= 0 ? 'text-success' : 'text-destructive'
                      }`}
                    >
                      {formatCurrency(stats.balance)}
                    </p>
                  </div>
                  <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl">
                    <Wallet className="h-6 w-6" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem('up')}>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Vencidas</p>
                    <p className="text-destructive mt-1 text-2xl font-bold">
                      {formatCurrency(
                        stats.overdueReceivable + stats.overduePayable,
                      )}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      A receber + A pagar
                    </p>
                  </div>
                  <div className="bg-destructive/10 text-destructive flex h-12 w-12 items-center justify-center rounded-xl">
                    <TrendingDown className="h-6 w-6" />
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerReveal(0.1)}
            className="grid grid-cols-1 gap-6 lg:grid-cols-2"
          >
            <Card className="p-6">
              <h3 className="text-foreground mb-4 text-lg font-semibold">
                Ações rápidas
              </h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" size="sm">
                  Nova conta a receber
                </Button>
                <Button variant="secondary" size="sm">
                  Nova conta a pagar
                </Button>
                <Button variant="outline" size="sm">
                  Ver fluxo de caixa
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-foreground mb-4 text-lg font-semibold">
                Resumo
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Contas a receber
                  </span>
                  <span className="text-foreground font-medium">
                    {stats.receivablesCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Contas a pagar</span>
                  <span className="text-foreground font-medium">
                    {stats.payablesCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Vencidas (a receber)
                  </span>
                  <span className="text-destructive font-medium">
                    {formatCurrency(stats.overdueReceivable)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Vencidas (a pagar)
                  </span>
                  <span className="text-destructive font-medium">
                    {formatCurrency(stats.overduePayable)}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        </Container>
      </Section>
    </div>
  );
}
