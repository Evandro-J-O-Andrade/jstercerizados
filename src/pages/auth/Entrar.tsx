import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Briefcase, Building2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SafeImage } from '@/components/ui/SafeImage';
import { SEO } from '@/components/ui/SEO';
import { useAuth } from '@/contexts/AuthContext';
import { COMPANY } from '@/config';
import { IMAGES } from '@/config/images';
import { cn } from '@/utils';

interface EntryOption {
  key: 'admin' | 'candidato' | 'empresa';
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
}

const options: EntryOption[] = [
  {
    key: 'admin',
    label: 'Administrativo',
    description:
      'Equipes internas, gestores, RH, financeiro, operações e administração da plataforma.',
    icon: Shield,
    route: '/entrar/admin',
  },
  {
    key: 'candidato',
    label: 'Candidatos',
    description:
      'Currículo, candidaturas, vagas favoritas e alertas para acompanhar suas oportunidades.',
    icon: Briefcase,
    route: '/entrar/candidato',
  },
  {
    key: 'empresa',
    label: 'Empresas',
    description:
      'Empresas parceiras: publique vagas e acompanhe processos seletivos.',
    icon: Building2,
    route: '/entrar/empresa',
  },
];

export default function EntrarHub() {
  const { isAuthenticated, person, resolvePostLoginDestination } = useAuth();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <SEO
        title={`Entrar — ${COMPANY.name}`}
        description={`Selecione o contexto de acesso: Administrativo, Candidatos ou Empresas. Plataforma ${COMPANY.name}.`}
        keywords={[
          'login',
          'acesso',
          'entrar',
          'administrativo',
          'candidatos',
          'empresas',
          COMPANY.name,
        ]}
        noindex
      />

      <SafeImage
        src={IMAGES.hero.login.src}
        fallbackSrc={IMAGES.hero.login.fallback}
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        decoding="async"
      />
      <img
        src="/images/hero/hero-overlay.svg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-65"
        aria-hidden="true"
      />

      <div className="from-background/95 via-background/70 absolute inset-0 bg-gradient-to-r to-transparent" />
      <div className="from-background via-background/30 to-background/10 absolute inset-0 bg-gradient-to-t" />

      <img
        src="/images/backgrounds/hero-grid.svg"
        alt=""
        className="absolute inset-0 h-full w-full opacity-80"
        aria-hidden="true"
      />

      <motion.div
        className="bg-primary/10 animate-pulse-glow absolute top-1/4 left-1/4 hidden h-2 w-2 rounded-full md:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      />
      <motion.div
        className="bg-primary/10 animate-pulse-glow absolute top-1/3 right-1/4 hidden h-3 w-3 rounded-full md:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      />
      <motion.div
        className="bg-primary/15 animate-float-slow absolute right-1/3 bottom-1/3 hidden h-5 w-5 rounded-full opacity-70 md:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
        className="relative z-10 w-full max-w-5xl px-4"
      >
        <div
          className={cn(
            'shadow-glass border-primary/20 bg-card/95 rounded-3xl border p-8',
          )}
        >
          <div className="mb-6 text-center">
            <p className="text-muted-foreground text-xs font-medium tracking-[0.2em] uppercase">
              Central de Acesso
            </p>
            <h1 className="text-foreground mt-2 text-3xl font-bold">
              Selecione seu contexto
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Escolha a porta de entrada correspondente ao seu perfil. Seu
              acesso é determinado pelo RBAC da plataforma, não pela entrada
              escolhida.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {options.map((option) => {
              const Icon = option.icon;
              return (
                <motion.div
                  key={option.key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="border-border/40 bg-card rounded-2xl border p-5"
                  data-entry={option.key}
                >
                  <div className="bg-primary/10 text-primary mb-3 flex h-12 w-12 items-center justify-center rounded-xl">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h2 className="text-foreground mb-1 text-lg font-bold">
                    {option.label}
                  </h2>
                  <p className="text-muted-foreground mb-4 text-xs leading-relaxed">
                    {option.description}
                  </p>
                  <Link to={option.route}>
                    <Button
                      variant="primary"
                      size="md"
                      className="w-full"
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      Entrar
                    </Button>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <p className="text-muted-foreground/80 mt-6 text-center text-xs">
            {isAuthenticated && person ? (
              <>
                Você já está logado como <strong>{person.full_name}</strong>.{' '}
                <Link
                  to={resolvePostLoginDestination()}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Continuar
                </Link>
                .
              </>
            ) : (
              <>
                Ainda não possui cadastro?{' '}
                <Link
                  to="/cadastro"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Saiba como se cadastrar
                </Link>
                .
              </>
            )}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
