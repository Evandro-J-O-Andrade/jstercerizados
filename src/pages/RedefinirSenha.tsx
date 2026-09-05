import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SEO } from '@/components/ui/SEO';
import { PageLoader } from '@/components/ui/PageLoader';
import { useAuth } from '@/contexts/AuthContext';
import { COMPANY } from '@/config';

const PASSWORD_REQUIREMENTS = [
  { label: 'Mínimo de 8 caracteres', test: (p: string) => p.length >= 8 },
  { label: 'Letra maiúscula', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Letra minúscula', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Número', test: (p: string) => /[0-9]/.test(p) },
  { label: 'Caractere especial', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

type Phase = 'form' | 'submitting' | 'success' | 'error';

export default function RedefinirSenha() {
  const {
    changePassword,
    isLoading,
    recoveryMode,
    resolvePostLoginDestination,
  } = useAuth();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [phase, setPhase] = useState<Phase>('form');
  const [error, setError] = useState('');
  const [recoveryChecked, setRecoveryChecked] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!recoveryMode) {
      setRecoveryChecked(true);
      return;
    }
    setRecoveryChecked(true);
  }, [isLoading, recoveryMode]);

  const passwordsMatch = newPassword === confirmPassword;
  const meetsRequirements = PASSWORD_REQUIREMENTS.every((req) =>
    req.test(newPassword),
  );
  const isValid = meetsRequirements && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!recoveryMode) {
      setError(
        'Sessão de recuperação inválida ou expirada. Solicite um novo link.',
      );
      return;
    }

    if (!passwordsMatch) {
      setError('As senhas não coincidem.');
      return;
    }

    if (!meetsRequirements) {
      setError('A senha não atende a todos os requisitos.');
      return;
    }

    setPhase('submitting');

    const result = await changePassword('', newPassword);
    if (result.error) {
      const lower = result.error.toLowerCase();
      const isExpired =
        lower.includes('expired') ||
        lower.includes('otp') ||
        lower.includes('token') ||
        lower.includes('recovery') ||
        lower.includes('already');
      setError(
        isExpired
          ? 'Link expirado ou já utilizado. Solicite um novo link de recuperação.'
          : 'Não foi possível redefinir a senha. Tente novamente.',
      );
      setPhase('error');
      return;
    }

    setPhase('success');
  };

  if (isLoading || !recoveryChecked) {
    return <PageLoader />;
  }

  if (!recoveryMode && phase !== 'success') {
    return (
      <RecoveryBlocked message="Este link de recuperação é inválido ou expirou. Solicite um novo link para continuar." />
    );
  }

  if (phase === 'success') {
    return (
      <RecoverySuccess
        onContinue={() => {
          const target = resolvePostLoginDestination();
          navigate(target, { replace: true });
        }}
      />
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <SEO
        title={`Redefinir senha — ${COMPANY.name}`}
        description="Defina uma nova senha para sua conta."
        noindex
      />
      <div className="bg-background/85 absolute inset-0 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="border-border/40 bg-card shadow-glass rounded-3xl border p-8">
          <div className="mb-8 text-center">
            <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <KeyRound className="text-primary h-8 w-8" />
            </div>
            <h1 className="text-foreground text-3xl font-bold">
              Redefinir senha
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Defina uma nova senha para sua conta.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-destructive/10 text-destructive rounded-xl p-4 text-sm">
                {error}
              </div>
            )}

            <div className="relative">
              <Input
                label="Nova senha"
                type={showPasswords ? 'text' : 'password'}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="relative">
              <Input
                label="Confirmar nova senha"
                type={showPasswords ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              {confirmPassword.length > 0 && (
                <div className="absolute top-9 right-3">
                  {passwordsMatch ? (
                    <CheckCircle2 className="text-success h-5 w-5" />
                  ) : (
                    <XCircle className="text-destructive h-5 w-5" />
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowPasswords(!showPasswords)}
              className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors"
            >
              {showPasswords ? (
                <>
                  <EyeOff className="h-4 w-4" /> Ocultar senhas
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" /> Mostrar senhas
                </>
              )}
            </button>

            <div className="space-y-2">
              <p className="text-foreground text-sm font-medium">
                Requisitos da nova senha:
              </p>
              <ul className="space-y-1">
                {PASSWORD_REQUIREMENTS.map((req) => {
                  const passed = req.test(newPassword);
                  return (
                    <li
                      key={req.label}
                      className={`flex items-center gap-2 text-sm ${
                        passed ? 'text-success' : 'text-muted-foreground'
                      }`}
                    >
                      {passed ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <div className="border-muted-foreground h-4 w-4 rounded-full border" />
                      )}
                      {req.label}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mt-8">
              <Button
                type="submit"
                variant="primary"
                size="xl"
                className="w-full"
                disabled={!isValid || phase === 'submitting'}
                loading={phase === 'submitting'}
                leftIcon={<KeyRound className="h-5 w-5" />}
              >
                {phase === 'submitting' ? 'Salvando...' : 'Redefinir senha'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-sm font-medium transition-colors"
            >
              Voltar para o login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function RecoveryBlocked({ message }: { message: string }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <SEO
        title={`Recuperação inválida — ${COMPANY.name}`}
        description="O link de recuperação é inválido ou expirou."
        noindex
      />
      <div className="bg-background/85 absolute inset-0 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="border-border/40 bg-card shadow-glass rounded-3xl border p-8 text-center">
          <div className="bg-warning/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <ShieldCheck className="text-warning h-8 w-8" />
          </div>
          <h1 className="text-foreground text-2xl font-bold">
            Link de recuperação inválido
          </h1>
          <p className="text-muted-foreground mt-3 text-sm">{message}</p>
          <div className="mt-6 flex flex-col gap-3">
            <Button asChild variant="primary" size="lg">
              <Link to="/recuperar-senha">Solicitar novo link</Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link to="/login">Voltar para o login</Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function RecoverySuccess({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <SEO
        title={`Senha redefinida — ${COMPANY.name}`}
        description="Sua senha foi redefinida com sucesso."
        noindex
      />
      <div className="bg-background/85 absolute inset-0 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="border-border/40 bg-card shadow-glass rounded-3xl border p-8 text-center">
          <div className="bg-success/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <CheckCircle2 className="text-success h-8 w-8" />
          </div>
          <h1 className="text-foreground text-2xl font-bold">
            Senha redefinida
          </h1>
          <p className="text-muted-foreground mt-3 text-sm">
            Sua senha foi atualizada com sucesso. Você já pode acessar sua
            conta.
          </p>
          <div className="mt-6">
            <Button
              onClick={onContinue}
              variant="primary"
              size="lg"
              className="w-full"
            >
              Acessar minha área
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
