import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Globe2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { normalizeError } from '@/lib/error-normalizer';

export default function TenantSelectionPage() {
  const {
    person,
    tenantMemberships,
    currentTenantId,
    tenants,
    isAdminMaster,
    isCandidate,
    switchTenant,
    resolvePostLoginDestination,
  } = useAuth();
  const navigate = useNavigate();
  const [selectedTenantId, setSelectedTenantId] = useState(
    currentTenantId ?? '',
  );
  const [confirmedTenantId, setConfirmedTenantId] = useState<string | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableTenants = useMemo(() => {
    const tenantIds = new Set(
      tenantMemberships.map((membership) => membership.tenant_id),
    );
    return tenants
      .filter((tenant) => tenantIds.has(tenant.id))
      .sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'));
  }, [tenantMemberships, tenants]);

  useEffect(() => {
    if (
      currentTenantId &&
      (!confirmedTenantId || currentTenantId === confirmedTenantId)
    ) {
      setConfirmedTenantId(null);
      navigate(resolvePostLoginDestination(), { replace: true });
    }
  }, [
    confirmedTenantId,
    currentTenantId,
    navigate,
    resolvePostLoginDestination,
  ]);

  const handleTenantSelection = async () => {
    if (!selectedTenantId) return;

    setError(null);
    setIsSubmitting(true);
    try {
      await switchTenant(selectedTenantId);
      setConfirmedTenantId(selectedTenantId);
    } catch (selectionError) {
      setSelectedTenantId('');
      setError(normalizeError(selectionError).userMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGlobalAccess = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await switchTenant(null);
      navigate('/dashboard/global', { replace: true });
    } catch (selectionError) {
      setError(normalizeError(selectionError).userMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-background flex min-h-dvh items-center justify-center px-4 py-10">
      <section className="bg-card border-border w-full max-w-2xl rounded-2xl border p-6 shadow-lg sm:p-8">
        <div className="mb-6 flex items-start gap-4">
          <div className="bg-primary/10 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
            <Building2 className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">
              {person?.full_name
                ? `Olá, ${person.full_name}.`
                : 'Contexto de acesso'}
            </p>
            <h1 className="text-foreground mt-1 text-2xl font-bold">
              Selecione uma organização
            </h1>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              A associação será validada novamente antes de carregar funções e
              permissões. Nenhuma organização é escolhida automaticamente.
            </p>
          </div>
        </div>

        {error && (
          <div
            className="bg-destructive/10 text-destructive mb-5 rounded-lg p-3 text-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        {availableTenants.length > 0 ? (
          <fieldset className="space-y-3">
            <legend className="text-foreground mb-3 text-sm font-semibold">
              Organizações disponíveis
            </legend>
            {availableTenants.map((tenant) => {
              const isSelected = selectedTenantId === tenant.id;
              return (
                <label
                  key={tenant.id}
                  className={`border-border flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary/5 ring-primary/30 ring-2'
                      : 'hover:bg-muted/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="tenant"
                    value={tenant.id}
                    checked={isSelected}
                    onChange={() => setSelectedTenantId(tenant.id)}
                    disabled={isSubmitting}
                    className="accent-primary"
                  />
                  <span className="bg-muted text-muted-foreground flex h-10 w-10 items-center justify-center rounded-lg">
                    <Building2 className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-foreground block font-medium">
                      {tenant.name}
                    </span>
                    <span className="text-muted-foreground block truncate text-xs">
                      {tenant.id}
                    </span>
                  </span>
                  {isSelected && (
                    <ShieldCheck
                      className="text-primary h-5 w-5"
                      aria-label="Selecionada"
                    />
                  )}
                </label>
              );
            })}
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="mt-4 w-full"
              onClick={handleTenantSelection}
              disabled={!selectedTenantId || isSubmitting}
              loading={isSubmitting}
            >
              Confirmar contexto
            </Button>
          </fieldset>
        ) : tenantMemberships.length > 0 ? (
          <p className="bg-destructive/10 text-destructive rounded-xl p-4 text-sm">
            Há associações ativas, mas nenhum tenant correspondente foi
            carregado. Atualize a sessão ou contate o administrador.
          </p>
        ) : (
          <p className="bg-muted/40 text-muted-foreground rounded-xl p-4 text-sm">
            Não há uma associação ativa disponível para selecionar.
          </p>
        )}

        {isAdminMaster && (
          <div className="border-border mt-6 border-t pt-5">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGlobalAccess}
              disabled={isSubmitting}
            >
              <Globe2 className="mr-2 h-4 w-4" aria-hidden="true" />
              Acessar administração global sem tenant
            </Button>
          </div>
        )}

        {isCandidate && availableTenants.length === 0 && (
          <Button
            type="button"
            variant="outline"
            className="mt-4 w-full"
            onClick={() => navigate('/candidato', { replace: true })}
          >
            Continuar para o portal do candidato
          </Button>
        )}
      </section>
    </main>
  );
}
