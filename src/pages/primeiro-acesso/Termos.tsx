import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { SEO } from '@/components/ui/SEO';
import { COMPANY } from '@/config';

export default function PrimeiroAcessoTermos() {
  const [accepted, setAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { acceptTerms, isAuthenticated, person, resolvePostLoginDestination } =
    useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !person) {
      navigate('/entrar', { replace: true });
    }
  }, [isAuthenticated, person, navigate]);

  const handleAccept = async () => {
    if (!accepted) return;

    setIsSubmitting(true);
    setError('');

    try {
      const result = await acceptTerms('terms', 'v1');
      if (result.error) {
        setError(result.error);
      } else {
        const target = resolvePostLoginDestination();
        navigate(target, { replace: true });
      }
    } catch {
      setError('Erro ao registrar aceite dos termos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || !person) {
    return null;
  }

  const firstName = person.full_name?.split(' ')[0] || 'colaborador';

  return (
    <div className="flex min-h-[80dvh] items-center justify-center px-4 py-12">
      <SEO
        title={`Termos de Uso — ${COMPANY.name}`}
        description=" Aceite os termos de uso para continuar."
        noindex
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="mb-8 text-center">
          <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
            <FileText className="text-primary h-8 w-8" />
          </div>
          <h1 className="text-foreground text-3xl font-bold">
            Bem-vindo à {COMPANY.name}
          </h1>
          <p className="text-muted-foreground mt-2">
            Olá, {firstName}. Antes de continuar, precisamos concluir a
            configuração da sua conta.
          </p>
        </div>

        <div className="border-border/40 bg-card shadow-glass rounded-3xl border p-8">
          <h2 className="text-foreground mb-4 text-xl font-semibold">
            Termos de Uso
          </h2>

          <div className="bg-muted/50 text-muted-foreground max-h-64 overflow-y-auto rounded-xl p-6 text-sm leading-relaxed">
            <p className="text-foreground mb-4 font-semibold">
              Versão 1.0 — {new Date().getFullYear()}
            </p>
            <p className="mb-4">
              Estes Termos de Uso regem o acesso e utilização da plataforma{' '}
              {COMPANY.name}, disponibilizada por J&S Empregos LTDA.
            </p>
            <p className="mb-4">
              1. <strong>Objetivo:</strong> A plataforma tem como objetivo
              facilitar a gestão de recursos humanos, recrutamento, seleção e
              processos administrativos para empresas-clientes.
            </p>
            <p className="mb-4">
              2. <strong>Privacidade:</strong> Os dados pessoais coletados são
              tratados em conformidade com a Lei Geral de Proteção de Dados
              (LGPD — Lei nº 13.709/2018).
            </p>
            <p className="mb-4">
              3. <strong>Responsabilidades:</strong> O usuário é responsável
              pela confidencialidade de suas credenciais de acesso e por todas
              as atividades realizadas em sua conta.
            </p>
            <p className="mb-4">
              4. <strong>Alterações:</strong> Estes termos podem ser atualizados
              periodicamente. O uso contínuo da plataforma após alterações
              constitui aceite dos novos termos.
            </p>
            <p>
              5. <strong>Contato:</strong> Para dúvidas, entre em contato
              através do e-mail {COMPANY.email} ou telefone {COMPANY.phone}.
            </p>
          </div>

          <div className="mt-6 flex items-start gap-3">
            <input
              id="accept-terms"
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="border-input text-primary focus:ring-primary mt-1 h-4 w-4 rounded"
            />
            <label
              htmlFor="accept-terms"
              className="text-muted-foreground text-sm"
            >
              Li e concordo com os Termos de Uso da {COMPANY.name}.
            </label>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive mt-4 rounded-xl p-4 text-sm">
              {error}
            </div>
          )}

          <div className="mt-6">
            <Button
              variant="primary"
              size="xl"
              className="w-full"
              onClick={handleAccept}
              disabled={!accepted || isSubmitting}
              leftIcon={<CheckCircle2 className="h-5 w-5" />}
            >
              {isSubmitting ? 'Registrando...' : 'Continuar'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
