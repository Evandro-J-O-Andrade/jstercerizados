import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { KeyRound, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SafeImage } from '@/components/ui/SafeImage';
import { SEO } from '@/components/ui/SEO';
import { useAuth } from '@/contexts/AuthContext';
import { COMPANY } from '@/config';
import { IMAGES } from '@/config/images';
import { normalizeError } from '@/lib/error-normalizer';

export default function RecuperarSenha() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { resetPassword } = useAuth();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsSubmitting(true);

    try {
      console.log('[RECUPERAR] submit start', { email });
      const result = await resetPassword(email);
      console.log('[RECUPERAR] submit result', result);
      if (result.error) {
        setError(normalizeError(result.error).userMessage);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      console.error('[RECUPERAR] submit exception', err);
      setError(
        normalizeError(new Error('Erro ao enviar e-mail de recuperação.'))
          .userMessage,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <SEO
        title={`Recuperar senha — ${COMPANY.name}`}
        description="Recupere o acesso à sua conta."
        noindex
      />
      <SafeImage
        src={IMAGES.hero.login.src}
        fallbackSrc={IMAGES.hero.login.fallback}
        className="absolute inset-0 h-full w-full"
      />
      <div className="bg-background/85 absolute inset-0 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="border-border/40 bg-card shadow-glass rounded-3xl border p-8">
          <div className="mb-6 text-center">
            <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
              <KeyRound className="h-8 w-8" />
            </div>
            <h1 className="text-foreground text-3xl font-bold">
              Recuperar senha
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Enviamos um link de recuperação para seu e-mail.
            </p>
          </div>

          {success ? (
            <div className="bg-success/10 text-success rounded-xl p-4 text-center text-sm">
              Verifique sua caixa de entrada e spam. O link expira em 1 hora.
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              {error && (
                <div className="bg-destructive/10 text-destructive rounded-xl p-4 text-sm">
                  {error}
                </div>
              )}

              <Input
                label="E-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="xl"
                className="w-full"
                loading={isSubmitting}
                leftIcon={<KeyRound className="h-5 w-5" />}
              >
                Enviar link
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-sm font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para o login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
