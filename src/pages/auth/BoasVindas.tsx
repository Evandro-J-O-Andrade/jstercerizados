import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  Briefcase,
  Building2,
  Users,
  DollarSign,
  Headphones,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SEO } from '@/components/ui/SEO';
import { useAuth } from '@/contexts/AuthContext';
import { COMPANY } from '@/config';

type AreaInfo = {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  areaLabel: string;
  profileLabel: string;
};

function getAreaInfo(
  roles: { name: string }[],
  isAdminMaster: boolean,
): AreaInfo {
  if (isAdminMaster) {
    return {
      title: 'Área de Gestão',
      description:
        'Aqui você encontrará as ferramentas e informações necessárias para acompanhar e administrar suas operações.',
      icon: Shield,
      areaLabel: 'Gestão',
      profileLabel: 'Administrador Master',
    };
  }

  const roleNames = roles.map((r) => r.name.toLowerCase());

  if (
    roleNames.some(
      (n) =>
        n.includes('finance') ||
        n.includes('fiscal') ||
        n.includes('accounting'),
    )
  ) {
    return {
      title: 'Área Financeira',
      description:
        'A partir daqui você poderá acompanhar informações, indicadores e recursos financeiros disponíveis para o seu perfil.',
      icon: DollarSign,
      areaLabel: 'Financeiro',
      profileLabel: 'Usuário Financeiro',
    };
  }

  if (
    roleNames.some(
      (n) =>
        n.includes('rh') ||
        n.includes('recruiter') ||
        n.includes('recruitment'),
    )
  ) {
    return {
      title: 'Área de Recursos Humanos',
      description:
        'Aqui você poderá acompanhar processos seletivos, candidatos e oportunidades de recrutamento.',
      icon: Users,
      areaLabel: 'Recursos Humanos',
      profileLabel: 'Usuário de RH',
    };
  }

  if (
    roleNames.some(
      (n) =>
        n.includes('commercial') ||
        n.includes('sales') ||
        n.includes('cliente'),
    )
  ) {
    return {
      title: 'Área Comercial',
      description:
        'Aqui você poderá acompanhar clientes, parceiros e oportunidades de negócio.',
      icon: Building2,
      areaLabel: 'Comercial',
      profileLabel: 'Usuário Comercial',
    };
  }

  if (
    roleNames.some(
      (n) =>
        n.includes('support') ||
        n.includes('atendimento') ||
        n.includes('helpdesk'),
    )
  ) {
    return {
      title: 'Área de Atendimento',
      description:
        'Aqui você poderá acompanhar chamados, solicitações e o atendimento aos clientes.',
      icon: Headphones,
      areaLabel: 'Atendimento',
      profileLabel: 'Usuário de Atendimento',
    };
  }

  if (roleNames.some((n) => n.includes('candidato'))) {
    return {
      title: 'Área do Candidato',
      description:
        'Aqui você poderá acompanhar seu currículo, candidaturas, vagas e oportunidades disponíveis.',
      icon: Briefcase,
      areaLabel: 'Candidato',
      profileLabel: 'Candidato',
    };
  }

  if (roleNames.some((n) => n.includes('empresa'))) {
    return {
      title: 'Área da Empresa',
      description:
        'Aqui você poderá acompanhar suas vagas, candidaturas e processos de contratação.',
      icon: Building2,
      areaLabel: 'Empresa',
      profileLabel: 'Empresa',
    };
  }

  return {
    title: 'Área do Usuário',
    description:
      'Aqui você encontrará as ferramentas e informações necessárias para acompanhar suas atividades.',
    icon: UserCheck,
    areaLabel: 'Geral',
    profileLabel: 'Usuário',
  };
}

export default function AuthWelcome() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { person, roles, isAdminMaster, updateFirstLoginState } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!person) {
      navigate('/login', { replace: true });
    }
  }, [person, navigate]);

  const handleContinue = async () => {
    if (isSubmitting || !person) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await updateFirstLoginState({
        welcome_completed_at: new Date().toISOString(),
        first_login_completed: true,
      });

      const roleNames = roles.map((r) => r.name.toLowerCase());
      const isCandidato = roleNames.some((n) => n.includes('candidato'));

      if (isCandidato) {
        navigate('/dashboard/candidato', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch {
      setError('Erro ao acessar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!person) {
    return null;
  }

  const firstName = person.full_name?.split(' ')[0] || 'colaborador';
  const area = getAreaInfo(roles, isAdminMaster);
  const AreaIcon = area.icon;

  return (
    <div className="flex min-h-[80dvh] items-center justify-center px-4 py-12">
      <SEO
        title={`Bem-vindo — ${COMPANY.name}`}
        description="Painel de acesso"
        noindex
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="mb-8 text-center">
          <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
            <AreaIcon className="text-primary h-8 w-8" />
          </div>
          <h1 className="text-foreground text-3xl font-bold">
            Seja bem-vindo, {firstName}! 👋
          </h1>
          <p className="text-muted-foreground mt-2">
            É um prazer ter você de volta.
          </p>
        </div>

        <div className="border-border/40 bg-card shadow-glass rounded-3xl border p-8">
          <div className="text-center">
            <h2 className="text-foreground mb-2 text-xl font-semibold">
              Você está acessando sua{' '}
              <span className="text-primary">{area.title}</span>
            </h2>
            <p className="text-muted-foreground mb-8">{area.description}</p>

            <div className="border-border bg-muted/30 mb-8 rounded-xl border p-6 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Perfil</p>
                  <p className="text-foreground font-medium">
                    {area.profileLabel}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground text-sm">Área</p>
                  <p className="text-foreground font-medium">
                    {area.areaLabel}
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive mb-4 rounded-xl p-4 text-sm">
                {error}
              </div>
            )}

            <Button
              variant="primary"
              size="xl"
              className="w-full"
              onClick={handleContinue}
              disabled={isSubmitting}
              leftIcon={<ArrowRight className="h-5 w-5" />}
            >
              {isSubmitting ? 'Acessando...' : 'Acessar minha área'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
