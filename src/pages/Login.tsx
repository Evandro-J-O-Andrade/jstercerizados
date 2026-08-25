import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, LogIn, Eye, EyeOff, Briefcase, Building2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SafeImage } from '@/components/ui/SafeImage';
import { SEO } from '@/components/ui/SEO';
import { useAuth } from '@/contexts/AuthContext';
import { COMPANY } from '@/config';
import { IMAGES } from '@/config/images';
import { cn } from '@/utils';
import { normalizeError } from '@/lib/error-normalizer';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

type AccessFlow = 'admin' | 'candidato' | 'empresa';

type LoginStatus =
  'idle' | 'authenticating' | 'loading-profile' | 'success' | 'error';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [accessFlow, setAccessFlow] = useState<AccessFlow>('admin');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginStatus, setLoginStatus] = useState<LoginStatus>('idle');
  const {
    login,
    isAuthenticated,
    authError,
    person,
    resolvePostLoginDestination,
  } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated && person) {
      const target = resolvePostLoginDestination();
      navigate(target, { replace: true });
    }
  }, [
    isAuthenticated,
    person,
    navigate,
    resolvePostLoginDestination,
    loginStatus,
  ]);

  const onInvalid = (formErrors: unknown) => {
    console.error('[AUTH:FORM_INVALID]', formErrors);
  };

  const onSubmit = async (data: LoginFormData): Promise<void> => {
    console.log('[AUTH:SUBMIT] FORM VALID', {
      email: data.email,
      passwordLength: data.password.length,
    });

    setError('');
    setIsSubmitting(true);
    setLoginStatus('authenticating');

    try {
      console.log('[AUTH:SUBMIT] CALLING LOGIN');

      const result = await login(data.email, data.password);

      console.log('[AUTH:SUBMIT] LOGIN RESULT', result);

      if (result.error) {
        setError(normalizeError(result.error).userMessage);
        setLoginStatus('error');
      } else {
        setLoginStatus('loading-profile');
      }
    } catch (error) {
      console.error('[AUTH:SUBMIT] UNEXPECTED ERROR', error);
      setError(normalizeError(error).userMessage);
      setLoginStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (authError && loginStatus !== 'loading-profile') {
      setError(normalizeError(authError).userMessage);
      setLoginStatus('error');
    }
  }, [authError, loginStatus]);

  if (loginStatus === 'success' && isAuthenticated) {
    const firstName = person?.full_name?.split(' ')[0] || 'colaborador';

    return (
      <div className="flex min-h-[70dvh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md text-center"
        >
          <div className="bg-success/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
            <Shield className="text-success h-10 w-10" />
          </div>
          <h2 className="text-foreground mb-4 text-2xl font-bold">
            Bem-vindo de volta, {firstName}!
          </h2>
          <p className="text-muted-foreground mb-8">
            Seu acesso foi realizado com sucesso. Estamos preparando seu
            painel...
          </p>
          <div className="text-muted-foreground text-sm">Carregando...</div>
        </motion.div>
      </div>
    );
  }

  const flowConfig = {
    admin: {
      title: 'Painel Administrativo',
      subtitle: 'Acesse sua conta para gerenciar cadastros e relatórios.',
      icon: <Shield className="h-8 w-8" />,
      placeholderEmail: 'admin@jstercerizados.com.br',
    },
    candidato: {
      title: 'Área do Candidato',
      subtitle: 'Acesse seu perfil para gerenciar candidaturas e currículos.',
      icon: <Briefcase className="h-8 w-8" />,
      placeholderEmail: 'candidato@exemplo.com',
    },
    empresa: {
      title: 'Área da Empresa',
      subtitle: 'Publique vagas e acesse sua área de recrutamento.',
      icon: <Building2 className="h-8 w-8" />,
      placeholderEmail: 'empresa@exemplo.com',
    },
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <SEO
        title={`Entrar — ${COMPANY.name}`}
        description={`Acesse sua conta na ${COMPANY.name}. Área do candidato, empresa ou administrador.`}
        keywords={[
          'login',
          'acesso',
          'conta',
          COMPANY.name,
          'candidato',
          'empresa',
          'administrador',
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
        className="relative z-10 w-full max-w-md"
      >
        <div className="border-border/40 bg-card shadow-glass rounded-3xl border p-8">
          {/* Access flow selector */}
          <div className="mb-6 flex justify-center gap-2">
            {(['admin', 'candidato', 'empresa'] as const).map((flow) => (
              <button
                key={flow}
                type="button"
                onClick={() => setAccessFlow(flow)}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200',
                  accessFlow === flow
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-muted',
                )}
              >
                {flowConfig[flow].icon}
                {flow === 'admin'
                  ? 'Admin'
                  : flow === 'candidato'
                    ? 'Candidato'
                    : 'Empresa'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={accessFlow}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl backdrop-blur-sm">
                  {accessFlow !== 'admin' ? (
                    <div className="text-primary">
                      {flowConfig[accessFlow].icon}
                    </div>
                  ) : (
                    <div className="bg-primary/20 text-primary">
                      {flowConfig[accessFlow].icon}
                    </div>
                  )}
                </div>
                <h1 className="text-foreground text-3xl font-bold">
                  {flowConfig[accessFlow].title}
                </h1>
                <p className="text-muted-foreground mt-2 text-sm">
                  {flowConfig[accessFlow].subtitle}
                </p>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit, onInvalid)}
                className="space-y-5"
              >
                {error && (
                  <div className="bg-destructive/10 text-destructive rounded-xl p-4 text-sm">
                    {error}
                  </div>
                )}

                <Input
                  label="E-mail"
                  type="email"
                  placeholder={flowConfig[accessFlow].placeholderEmail}
                  error={errors.email?.message}
                  {...register('email')}
                />

                <div className="relative">
                  <Input
                    label="Senha"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-foreground absolute top-9 right-3"
                    aria-label={
                      showPassword ? 'Ocultar senha' : 'Mostrar senha'
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="border-input text-primary focus:ring-primary h-4 w-4 rounded"
                    />
                    <span className="text-muted-foreground text-sm">
                      Lembrar de mim
                    </span>
                  </label>
                  <Link
                    to="/recuperar-senha"
                    className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="xl"
                  className="w-full"
                  loading={isSubmitting || loginStatus === 'loading-profile'}
                  leftIcon={<LogIn className="h-5 w-5" />}
                >
                  {loginStatus === 'loading-profile'
                    ? 'Preparando seu painel...'
                    : loginStatus === 'authenticating'
                      ? 'Autenticando...'
                      : 'Entrar'}
                </Button>
              </form>

              {accessFlow === 'candidato' && (
                <div className="mt-4 text-center">
                  <Link
                    to="/cadastro/candidato"
                    className="text-muted-foreground hover:text-primary text-sm transition-colors"
                  >
                    Ainda não tem conta? Cadastre seu currículo
                  </Link>
                </div>
              )}
              {accessFlow === 'empresa' && (
                <div className="mt-4 text-center">
                  <Link
                    to="/cadastro/empresa"
                    className="text-muted-foreground hover:text-primary text-sm transition-colors"
                  >
                    Ainda não tem conta? Publique sua primeira vaga
                  </Link>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground/80 text-xs">
              Área restrita — Acesso autorizado apenas.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
