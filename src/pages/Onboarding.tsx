import { motion } from 'framer-motion';
import { Building2, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/sections/Section';
import { Container } from '@/components/common/Container';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export default function Onboarding() {
  const {
    person,
    currentTenantId,
    isAuthenticated,
    isLoading,
    tenantMemberships,
  } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated && currentTenantId) {
      window.location.href = '/dashboard';
    }
  }, [isLoading, isAuthenticated, currentTenantId]);

  if (isLoading) {
    return (
      <div className="flex min-h-[70dvh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md text-center"
        >
          <p className="text-muted-foreground">Carregando...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[70dvh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md text-center"
        >
          <h2 className="text-foreground mb-4 text-2xl font-bold">
            Acesso restrito
          </h2>
          <p className="text-muted-foreground mb-6">
            Faça login para continuar.
          </p>
          <Link to="/login">
            <Button variant="primary" size="lg">
              Entrar
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Section className="pt-24 md:pt-32">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="bg-primary/10 text-primary mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl">
              <Building2 className="h-8 w-8" />
            </div>
            <h1 className="text-foreground text-3xl font-bold sm:text-4xl">
              Selecione um tenant para continuar
            </h1>
            <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
              Você ainda não está vinculado a nenhuma empresa ou tenant.
              Solicite acesso ou continue como usuário master.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mx-auto mt-12 max-w-2xl space-y-4"
          >
            <div className="border-border bg-card rounded-2xl border p-6">
              <h3 className="text-foreground mb-2 text-lg font-semibold">
                Perfil atual
              </h3>
              <p className="text-muted-foreground text-sm">
                {person?.full_name ?? 'Usuário'}
              </p>
              <p className="text-muted-foreground text-sm">
                {person?.email ?? ''}
              </p>
            </div>

            <div className="border-border bg-card rounded-2xl border p-6">
              <h3 className="text-foreground mb-2 text-lg font-semibold">
                Membroships
              </h3>
              {tenantMemberships.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Nenhum tenant vinculado no momento.
                </p>
              ) : (
                <ul className="text-muted-foreground space-y-2 text-sm">
                  {tenantMemberships.map((membership) => (
                    <li key={membership.id} className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{membership.tenant_id}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => {
                  window.location.href = '/dashboard';
                }}
                leftIcon={<ArrowRight className="h-5 w-5" />}
              >
                Acessar painel
              </Button>
              <Link to="/" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full">
                  Voltar ao início
                </Button>
              </Link>
            </div>
          </motion.div>
        </Container>
      </Section>
    </div>
  );
}
