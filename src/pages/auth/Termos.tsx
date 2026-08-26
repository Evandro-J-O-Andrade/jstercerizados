import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckCircle2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SEO } from '@/components/ui/SEO';
import { useAuth } from '@/contexts/AuthContext';
import { COMPANY } from '@/config';

const TERMS_VERSION = 'v1.0';

export default function AuthTerms() {
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { acceptTerms, isAuthenticated, person } = useAuth();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated || !person) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, person, navigate]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const threshold = 40;
    const isAtBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    if (isAtBottom && !scrolledToBottom) {
      setScrolledToBottom(true);
    }
  }, [scrolledToBottom]);

  const handleAccept = async () => {
    if (!accepted) return;

    setIsSubmitting(true);
    setError('');

    try {
      const result = await acceptTerms('terms', TERMS_VERSION);
      if (result.error) {
        setError(result.error);
      } else {
        navigate('/auth/welcome', { replace: true });
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
          <h1 className="text-foreground text-3xl font-bold">Termos de Uso</h1>
          <p className="text-muted-foreground mt-2">
            Olá, {firstName}. Leia atentamente os termos antes de continuar.
          </p>
        </div>

        <div className="border-border/40 bg-card shadow-glass rounded-3xl border p-8">
          <h2 className="text-foreground mb-4 text-xl font-semibold">
            Termos de Uso da {COMPANY.name}
          </h2>

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="bg-muted/50 text-muted-foreground max-h-64 overflow-y-auto rounded-xl p-6 text-sm leading-relaxed"
          >
            <p className="text-foreground mb-4 font-semibold">
              Versão {TERMS_VERSION} — {new Date().getFullYear()}
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
            <p className="mb-4">
              5. <strong>Contato:</strong> Para dúvidas, entre em contato
              através do e-mail {COMPANY.email} ou telefone {COMPANY.phone}.
            </p>
            <p className="mb-4">
              6. <strong>Uso adequado:</strong> É proibido utilizar a plataforma
              para atividades fraudulentas, ilegais ou que violem direitos de
              terceiros.
            </p>
            <p className="mb-4">
              7. <strong>Propriedade intelectual:</strong> O conteúdo da
              plataforma pertence à J&S Empregos LTDA e é protegido por leis de
              propriedade intelectual.
            </p>
            <p className="mb-4">
              8. <strong>Limitação de responsabilidade:</strong> A plataforma
              não garante funcionamento ininterrupto e não se responsabiliza por
              indisponibilidades causadas por fatores externos.
            </p>
            <p>
              9. <strong>Legislação aplicável:</strong> Estes termos são regidos
              pelas leis brasileiras. Em caso de controvérsia, as partes elegem
              o foro da comarca de Poá/SP.
            </p>
          </div>

          <AnimatePresence>
            {scrolledToBottom && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-success mt-4 flex items-center gap-2 text-sm"
              >
                <CheckCircle2 className="h-4 w-4" />
                Você leu até o final.
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 flex items-start gap-3">
            <input
              id="accept-terms"
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              disabled={!scrolledToBottom}
              className="border-input text-primary focus:ring-primary mt-1 h-4 w-4 rounded disabled:opacity-50"
            />
            <label
              htmlFor="accept-terms"
              className={`text-sm ${!scrolledToBottom ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}
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
              disabled={!accepted || !scrolledToBottom || isSubmitting}
              leftIcon={<ChevronDown className="h-5 w-5" />}
            >
              {isSubmitting ? 'Registrando...' : 'Aceitar e continuar'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
