import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { SEO } from '@/components/ui/SEO';
import { COMPANY } from '@/config';

const PASSWORD_REQUIREMENTS = [
  { label: 'Mínimo de 8 caracteres', test: (p: string) => p.length >= 8 },
  { label: 'Letra maiúscula', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Letra minúscula', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Número', test: (p: string) => /[0-9]/.test(p) },
  { label: 'Caractere especial', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function PrimeiroAcessoSenha() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const {
    changePassword,
    isAuthenticated,
    person,
    resolvePostLoginDestination,
  } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !person) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, person, navigate]);

  const passwordsMatch = newPassword === confirmPassword;
  const meetsRequirements = PASSWORD_REQUIREMENTS.every((req) =>
    req.test(newPassword),
  );
  const isValid = meetsRequirements && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!passwordsMatch) {
      setError('As senhas não coincidem.');
      return;
    }

    if (!meetsRequirements) {
      setError('A senha não atende a todos os requisitos.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await changePassword('', newPassword);
      if (result.error) {
        setError(result.error);
      } else {
        const target = resolvePostLoginDestination();
        navigate(target, { replace: true });
      }
    } catch {
      setError('Erro ao alterar senha. Tente novamente.');
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
        title={`Alterar Senha — ${COMPANY.name}`}
        description="Proteja sua conta alterando sua senha temporária."
        noindex
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
            <Shield className="text-primary h-8 w-8" />
          </div>
          <h1 className="text-foreground text-3xl font-bold">
            Proteja sua conta
          </h1>
          <p className="text-muted-foreground mt-2">
            Olá, {firstName}. Sua senha temporária precisa ser alterada antes de
            acessar o sistema.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-border/40 bg-card shadow-glass rounded-3xl border p-8"
        >
          {error && (
            <div className="bg-destructive/10 text-destructive mb-6 rounded-xl p-4 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-5">
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
          </div>

          <div className="mt-8">
            <Button
              type="submit"
              variant="primary"
              size="xl"
              className="w-full"
              disabled={!isValid || isSubmitting}
              loading={isSubmitting}
              leftIcon={<Shield className="h-5 w-5" />}
            >
              {isSubmitting ? 'Alterando...' : 'Alterar senha'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
