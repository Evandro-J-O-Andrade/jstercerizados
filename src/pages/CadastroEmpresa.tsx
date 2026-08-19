import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Building2, Eye, EyeOff } from 'lucide-react';
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
import { normalizeError } from '@/lib/error-normalizer';

const companySchema = z
  .object({
    full_name: z.string().min(2, 'Nome do responsável é obrigatório'),
    company_name: z.string().min(2, 'Nome da empresa é obrigatório'),
    email: z.string().email('E-mail inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(6, 'Confirmação de senha é obrigatória'),
    phone: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  });

type CompanyFormData = z.infer<typeof companySchema>;

export default function CompanyRegister() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { register: registerUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
  });

  const onSubmit = async (data: CompanyFormData): Promise<void> => {
    setError('');
    try {
      const result = await registerUser(data.email, data.password, {
        email: data.email,
        full_name: data.full_name,
        phone: data.phone,
      });

      if (result.error) {
        setError(normalizeError(result.error).userMessage);
      } else {
        navigate('/dashboard/empresa');
      }
    } catch (err) {
      setError(normalizeError(err).userMessage);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md text-center"
        >
          <h2 className="text-foreground mb-4 text-2xl font-bold">
            Você já está logado!
          </h2>
          <Link to="/dashboard/empresa">
            <Button variant="primary" size="lg">
              Ir para o Painel
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <SEO
        title={`Cadastro de Empresa — ${COMPANY.name}`}
        description={`Cadastre sua empresa na ${COMPANY.name}.`}
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
              <Building2 className="h-8 w-8" />
            </div>
            <h1 className="text-foreground text-3xl font-bold">
              Cadastro de Empresa
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Crie sua conta e publique vagas.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="bg-destructive/10 text-destructive rounded-xl p-4 text-sm">
                {error}
              </div>
            )}

            <Input
              label="Nome do responsável"
              error={errors.full_name?.message}
              {...register('full_name')}
            />

            <Input
              label="Nome da empresa"
              error={errors.company_name?.message}
              {...register('company_name')}
            />

            <Input
              label="E-mail corporativo"
              type="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Telefone"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <div className="relative">
              <Input
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                error={errors.password?.message}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground absolute top-9 right-3"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
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
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button
              type="submit"
              variant="primary"
              size="xl"
              className="w-full"
              loading={isSubmitting}
              leftIcon={<UserPlus className="h-5 w-5" />}
            >
              Criar conta
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              Já tem conta?{' '}
              <Link
                to="/login"
                className="text-primary hover:text-primary/80 font-medium"
              >
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
