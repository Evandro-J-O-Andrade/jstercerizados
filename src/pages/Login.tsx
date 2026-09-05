import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  LogIn,
  Eye,
  EyeOff,
  Briefcase,
  Building2,
  UserPlus,
} from 'lucide-react';
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
import { Turnstile } from '@/components/auth/Turnstile';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const signupSchema = z
  .object({
    full_name: z.string().min(3, 'Informe seu nome completo'),
    email: z.string().email('E-mail inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(6, 'Confirme sua senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não coincidem',
  });

type SignupFormData = z.infer<typeof signupSchema>;

export type AccessFlow = 'admin' | 'candidato' | 'empresa';
type AuthMode = 'signin' | 'signup';

interface LoginProps {
  requestedContext?: AccessFlow | null;
}

interface FlowConfig {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  placeholderEmail: string;
  allowSignup: boolean;
  allowOAuth: boolean;
  emailLabel: string;
  passwordLabel: string;
  signinLabel: string;
  signingupLabel: string;
  signinLoading: string;
  signupLabel: string;
  signupLoading: string;
  footer: string;
}

export default function Login({ requestedContext = null }: LoginProps = {}) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [accessFlow, setAccessFlow] = useState<AccessFlow>(
    requestedContext ?? 'admin',
  );
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  // Token retornado pelo Turnstile (ou null se dev/disabled). Por enquanto
  // exibimos o estado no botao; o backend (Edge Function) fara a
  // verificacao real antes de chamar signInWithPassword/signUp.
  const submittedRef = useRef(false);
  const {
    login,
    loginWithProvider,
    register,
    isAuthenticated,
    authError,
    person,
    resolvePostLoginDestination,
  } = useAuth();
  const navigate = useNavigate();

  const {
    register: rhfRegister,
    handleSubmit,
    formState: { errors },
    reset: resetForm,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: rhfRegisterSignup,
    handleSubmit: handleSubmitSignup,
    formState: { errors: signupErrors },
    reset: resetSignup,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  useEffect(() => {
    if (isAuthenticated && person) {
      const target = resolvePostLoginDestination();
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, person, navigate, resolvePostLoginDestination]);

  useEffect(() => {
    setError('');
    submittedRef.current = false;
    if (authMode === 'signin') resetSignup();
    else resetForm();
  }, [authMode, resetForm, resetSignup]);

  const onInvalid = (formErrors: unknown) => {
    console.error('[AUTH:FORM_INVALID]', formErrors);
  };

  const onSignIn = async (data: LoginFormData): Promise<void> => {
    setError('');
    setIsSubmitting(true);
    submittedRef.current = false;

    try {
      const result = await login(data.email, data.password, {
        turnstileToken: turnstileToken ?? undefined,
      });
      if (result.error) {
        submittedRef.current = true;
        setError(normalizeError(result.error).userMessage);
      }
    } catch (err) {
      submittedRef.current = true;
      setError(normalizeError(err).userMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSignUp = async (data: SignupFormData): Promise<void> => {
    setError('');
    setIsSubmitting(true);
    submittedRef.current = false;

    try {
      const result = await register(data.email, data.password, {
        full_name: data.full_name,
        email: data.email,
        turnstileToken: turnstileToken ?? undefined,
      });
      if (result.error) {
        submittedRef.current = true;
        setError(normalizeError(result.error).userMessage);
      } else {
        setError(
          'Cadastro realizado. Verifique seu e-mail para confirmar a conta antes de entrar.',
        );
      }
    } catch (err) {
      submittedRef.current = true;
      setError(normalizeError(err).userMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuth = useCallback(
    async (provider: 'google' | 'azure') => {
      setError('');
      setIsSubmitting(true);
      try {
        const result = await loginWithProvider(provider);
        if (result.error) {
          setError(normalizeError(result.error).userMessage);
        }
      } catch (err) {
        setError(normalizeError(err).userMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [loginWithProvider],
  );

  useEffect(() => {
    if (authError && !error && !submittedRef.current) {
      setError(normalizeError(authError).userMessage);
    }
  }, [authError, error]);

  const flowConfig: Record<AccessFlow, FlowConfig> = {
    admin: {
      title: 'Painel Administrativo',
      subtitle: 'Acesse sua conta para gerenciar operações, RH e relatórios.',
      icon: <Shield className="h-8 w-8" />,
      placeholderEmail: 'admin@jstercerizados.com.br',
      allowSignup: false,
      allowOAuth: false,
      emailLabel: 'E-mail administrativo',
      passwordLabel: 'Senha',
      signinLabel: 'Entrar no painel',
      signingupLabel: '',
      signinLoading: 'Preparando painel...',
      signupLabel: '',
      signupLoading: '',
      footer: 'Área restrita — Acesso autorizado apenas.',
    },
    candidato: {
      title: 'Área do Candidato',
      subtitle: 'Acesse seu perfil para acompanhar candidaturas e currículo.',
      icon: <Briefcase className="h-8 w-8" />,
      placeholderEmail: 'candidato@exemplo.com',
      allowSignup: true,
      allowOAuth: true,
      emailLabel: 'E-mail',
      passwordLabel: 'Senha',
      signinLabel: 'Entrar',
      signingupLabel: 'Já tem conta? Entrar',
      signinLoading: 'Preparando seu painel...',
      signupLabel: 'Criar conta de candidato',
      signupLoading: 'Criando sua conta...',
      footer: 'Acesso exclusivo para candidatos.',
    },
    empresa: {
      title: 'Área da Empresa',
      subtitle:
        'Acesse sua conta para publicar vagas e gerenciar recrutamento.',
      icon: <Building2 className="h-8 w-8" />,
      placeholderEmail: 'empresa@exemplo.com',
      allowSignup: true,
      allowOAuth: true,
      emailLabel: 'E-mail corporativo',
      passwordLabel: 'Senha',
      signinLabel: 'Entrar',
      signingupLabel: 'Já tem conta? Entrar',
      signinLoading: 'Preparando seu painel...',
      signupLabel: 'Criar conta de empresa',
      signupLoading: 'Criando sua conta...',
      footer: 'Acesso exclusivo para empresas parceiras.',
    },
  };

  const config = flowConfig[accessFlow];

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
        className="relative z-10 w-full max-w-md px-4"
      >
        <div
          className={cn(
            'shadow-glass rounded-3xl border p-8',
            accessFlow === 'admin'
              ? 'border-border/40 bg-card'
              : 'border-primary/20 bg-card/95',
          )}
        >
          {requestedContext == null && (
            <div className="mb-6 flex justify-center gap-2">
              {(['admin', 'candidato', 'empresa'] as const).map((flow) => (
                <button
                  key={flow}
                  type="button"
                  onClick={() => {
                    setAccessFlow(flow);
                    setAuthMode('signin');
                  }}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200',
                    accessFlow === flow
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:bg-muted',
                  )}
                  data-flow={flow}
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
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={`${accessFlow}-${authMode}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8 text-center">
                <div
                  className={cn(
                    'mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl backdrop-blur-sm',
                    accessFlow === 'admin'
                      ? 'bg-primary/20 text-primary'
                      : 'bg-primary/10 text-primary',
                  )}
                >
                  {config.icon}
                </div>
                <h1 className="text-foreground text-3xl font-bold">
                  {config.title}
                </h1>
                <p className="text-muted-foreground mt-2 text-sm">
                  {config.subtitle}
                </p>
              </div>

              {config.allowOAuth && authMode === 'signin' && (
                <div className="mb-5 space-y-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    onClick={() => handleOAuth('google')}
                    loading={isSubmitting}
                    data-provider="google"
                  >
                    <GoogleIcon />
                    Continuar com Google
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    onClick={() => handleOAuth('azure')}
                    loading={isSubmitting}
                    data-provider="azure"
                  >
                    <MicrosoftIcon />
                    Continuar com Microsoft
                  </Button>
                  <div className="text-muted-foreground flex items-center gap-3 text-xs uppercase">
                    <span className="bg-border h-px flex-1" />
                    <span>ou</span>
                    <span className="bg-border h-px flex-1" />
                  </div>
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="bg-destructive/10 text-destructive mb-4 rounded-xl p-4 text-sm"
                >
                  {error}
                </div>
              )}

              {authMode === 'signin' ? (
                <form
                  onSubmit={handleSubmit(onSignIn, onInvalid)}
                  className="space-y-5"
                  data-mode="signin"
                >
                  <Input
                    label={config.emailLabel}
                    type="email"
                    autoComplete="email"
                    placeholder={config.placeholderEmail}
                    error={errors.email?.message}
                    {...rhfRegister('email')}
                  />

                  <div className="relative">
                    <Input
                      label={config.passwordLabel}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      error={errors.password?.message}
                      autoComplete="current-password"
                      {...rhfRegister('password')}
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

                  <Turnstile onTokenChange={setTurnstileToken} />

                  <Button
                    type="submit"
                    variant="primary"
                    size="xl"
                    className="w-full"
                    loading={isSubmitting}
                    leftIcon={<LogIn className="h-5 w-5" />}
                  >
                    {config.signinLabel}
                  </Button>
                </form>
              ) : (
                <form
                  onSubmit={handleSubmitSignup(onSignUp, onInvalid)}
                  className="space-y-5"
                  data-mode="signup"
                >
                  <Input
                    label="Nome completo"
                    type="text"
                    autoComplete="name"
                    placeholder="Seu nome"
                    error={signupErrors.full_name?.message}
                    {...rhfRegisterSignup('full_name')}
                  />
                  <Input
                    label={config.emailLabel}
                    type="email"
                    autoComplete="email"
                    placeholder={config.placeholderEmail}
                    error={signupErrors.email?.message}
                    {...rhfRegisterSignup('email')}
                  />
                  <div className="relative">
                    <Input
                      label={config.passwordLabel}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      error={signupErrors.password?.message}
                      autoComplete="new-password"
                      {...rhfRegisterSignup('password')}
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
                  <Input
                    label="Confirmar senha"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    error={signupErrors.confirmPassword?.message}
                    autoComplete="new-password"
                    {...rhfRegisterSignup('confirmPassword')}
                  />

                  <Turnstile onTokenChange={setTurnstileToken} />

                  <Button
                    type="submit"
                    variant="primary"
                    size="xl"
                    className="w-full"
                    loading={isSubmitting}
                    leftIcon={<UserPlus className="h-5 w-5" />}
                  >
                    {config.signupLabel}
                  </Button>
                </form>
              )}

              {config.allowSignup && authMode === 'signin' && (
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setAuthMode('signup')}
                    className="text-muted-foreground hover:text-primary text-sm transition-colors"
                    data-testid="toggle-signup"
                  >
                    Ainda não tem conta? Cadastre-se
                  </button>
                </div>
              )}

              {config.allowSignup && authMode === 'signup' && (
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setAuthMode('signin')}
                    className="text-muted-foreground hover:text-primary text-sm transition-colors"
                    data-testid="toggle-signin"
                  >
                    {config.signingupLabel}
                  </button>
                </div>
              )}

              {!config.allowSignup && (
                <div className="mt-4 text-center">
                  <p className="text-muted-foreground text-xs">
                    Cadastro restrito a convite administrativo.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground/80 text-xs">{config.footer}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.84h5.52c-.24 1.44-1.74 4.2-5.52 4.2-3.3 0-6-2.76-6-6.18s2.7-6.18 6-6.18c1.92 0 3.18.81 3.9 1.5l2.64-2.55C16.98 3.06 14.7 2 12 2 6.96 2 2.88 6.06 2.88 11.1S6.96 20.2 12 20.2c6.84 0 9.12-4.8 9.12-9.24 0-.6-.06-1.08-.12-1.56H12z"
      />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg className="mr-2 h-5 w-5" viewBox="0 0 23 23" aria-hidden="true">
      <path fill="#f25022" d="M1 1h10v10H1z" />
      <path fill="#00a4ef" d="M12 1h10v10H12z" />
      <path fill="#7fba00" d="M1 12h10v10H1z" />
      <path fill="#ffb900" d="M12 12h10v10H12z" />
    </svg>
  );
}
