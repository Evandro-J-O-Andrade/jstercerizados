import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  Users,
  BookOpen,
  MessageSquare,
  MapPin,
  Award,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SEO } from '@/components/ui/SEO';
import { useAuth } from '@/contexts/AuthContext';
import { COMPANY } from '@/config';

type CandidateStats = {
  applicationsCount: number;
  profileCompletion: number;
  skillsCount: number;
  experiencesCount: number;
};

const quickLinks = [
  {
    title: 'Buscar Vagas',
    description: 'Encontre oportunidades alinhadas ao seu perfil',
    href: '/vagas',
    icon: Briefcase,
    color: 'bg-primary/10 text-primary',
  },
  {
    title: 'Meu Currículo',
    description: 'Atualize suas informações profissionais',
    href: '/trabalhe-conosco',
    icon: FileText,
    color: 'bg-success/10 text-success',
  },
  {
    title: 'Blog',
    description: 'Dicas de carreira e mercado de trabalho',
    href: '/blog',
    icon: BookOpen,
    color: 'bg-info/10 text-info',
  },
  {
    title: 'Banco de Talentos',
    description: 'Cadastre-se e seja encontrado por empresas',
    href: '/trabalhe-conosco',
    icon: Users,
    color: 'bg-warning/10 text-warning',
  },
];

export default function CandidateDashboard() {
  const { person, roles } = useAuth();
  const [stats, setStats] = useState<CandidateStats>({
    applicationsCount: 0,
    profileCompletion: 0,
    skillsCount: 0,
    experiencesCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const isCandidate = roles.some((r) =>
    r.name.toLowerCase().includes('candidato'),
  );
  const firstName = person?.full_name?.split(' ')[0] || 'candidato';

  useEffect(() => {
    if (!isCandidate) return;

    async function load() {
      setIsLoading(true);
      try {
        setStats((prev) => ({
          ...prev,
          applicationsCount: 0,
        }));
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [isCandidate]);

  return (
    <div className="min-h-screen">
      <SEO
        title={`Meu Painel — ${COMPANY.name}`}
        description="Acompanhe suas candidaturas, currículo e oportunidades."
        noindex
      />
      <div className="bg-surface-alt">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-foreground text-3xl font-bold sm:text-4xl">
              Olá, {firstName}! 👋
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Bem-vindo à sua área do candidato. Acompanhe suas candidaturas e
              encontre novas oportunidades.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-6">
                  <h2 className="text-foreground mb-4 text-xl font-semibold">
                    Acesso Rápido
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {quickLinks.map((link) => (
                      <Link
                        key={link.title}
                        to={link.href}
                        className="border-border hover:border-primary/30 group flex items-start gap-4 rounded-xl border p-4 transition-all duration-200"
                      >
                        <div
                          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${link.color}`}
                        >
                          <link.icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-foreground group-hover:text-primary mb-1 font-medium transition-colors">
                            {link.title}
                          </h3>
                          <p className="text-muted-foreground line-clamp-2 text-sm">
                            {link.description}
                          </p>
                        </div>
                        <ChevronRight className="text-muted-foreground h-5 w-5 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                      </Link>
                    ))}
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-foreground text-xl font-semibold">
                      Minhas Candidaturas
                    </h2>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/vagas">
                        Ver todas
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="border-primary/30 border-t-primary h-8 w-8 animate-spin rounded-full border-4" />
                    </div>
                  ) : stats.applicationsCount === 0 ? (
                    <div className="py-8 text-center">
                      <Briefcase className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
                      <p className="text-muted-foreground mb-4">
                        Você ainda não se candidatou a nenhuma vaga.
                      </p>
                      <Button variant="primary" size="sm" asChild>
                        <Link to="/vagas">Explorar vagas</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-foreground text-2xl font-bold">
                        {stats.applicationsCount}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        candidaturas enviadas
                      </p>
                    </div>
                  )}
                </Card>
              </motion.div>
            </div>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6">
                  <h3 className="text-foreground mb-4 font-semibold">Perfil</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-foreground text-sm font-medium">
                          {person?.full_name || '—'}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {person?.email || '—'}
                        </p>
                      </div>
                    </div>
                    {person?.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="text-muted-foreground h-4 w-4" />
                        <span className="text-muted-foreground">
                          {person.phone}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      asChild
                    >
                      <Link to="/trabalhe-conosco">
                        <FileText className="mr-2 h-4 w-4" />
                        Atualizar currículo
                      </Link>
                    </Button>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="p-6">
                  <h3 className="text-foreground mb-4 font-semibold">
                    Recursos
                  </h3>
                  <div className="space-y-3">
                    <Link
                      to="/faq"
                      className="text-foreground hover:text-primary flex items-center gap-2 text-sm transition-colors"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Perguntas frequentes
                    </Link>
                    <Link
                      to="/suporte"
                      className="text-foreground hover:text-primary flex items-center gap-2 text-sm transition-colors"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Falar com atendimento
                    </Link>
                    <Link
                      to="/sobre"
                      className="text-foreground hover:text-primary flex items-center gap-2 text-sm transition-colors"
                    >
                      <Award className="h-4 w-4" />
                      Conheça a J&S
                    </Link>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
