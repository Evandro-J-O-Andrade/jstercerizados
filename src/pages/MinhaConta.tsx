import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useAccount } from '@/contexts/AccountContext';
import { SEO } from '@/components/ui/SEO';
import { COMPANY } from '@/config';
import {
  User,
  Mail,
  Phone,
  Shield,
  Building2,
  Key,
  LogOut,
} from 'lucide-react';

export default function MinhaConta() {
  const { person, permissions, logout, isLoading } = useAuth();
  const { identity, availableMemberships } = useAccount();

  if (isLoading) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <div className="text-muted-foreground">Carregando sua conta…</div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <div className="text-muted-foreground">Usuário não autenticado.</div>
      </div>
    );
  }

  const activeMembership = availableMemberships.find(
    (m) => m.status === 'active',
  );

  return (
    <>
      <SEO
        title={`Minha conta — ${COMPANY.name}`}
        description="Suas informações pessoais, papel e contexto de tenant"
        noindex
      />

      <div className="space-y-6">
        <header>
          <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
            Minha conta
          </h1>
          <p className="text-muted-foreground mt-1">
            Dados reais da sua sessão autenticada no Supabase.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card variant="default" className="p-6 lg:col-span-2">
            <h2 className="text-foreground flex items-center gap-2 text-lg font-semibold">
              <User className="h-5 w-5" />
              Dados pessoais
            </h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="text-muted-foreground h-4 w-4" />
                <span className="text-foreground">{person.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <User className="text-muted-foreground h-4 w-4" />
                <span className="text-foreground">{person.full_name}</span>
              </div>
              {person.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="text-muted-foreground h-4 w-4" />
                  <span className="text-foreground">{person.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Shield className="text-muted-foreground h-4 w-4" />
                <span className="text-foreground">
                  Status: {person.status === 'active' ? 'Ativo' : person.status}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground text-sm">
                  Criado em:
                </span>
                <span className="text-foreground text-sm">
                  {new Date(person.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </Card>

          <Card variant="default" className="p-6 lg:col-span-1">
            <h2 className="text-foreground flex items-center gap-2 text-lg font-semibold">
              <Building2 className="h-5 w-5" />
              Contexto organizacional
            </h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Shield className="text-muted-foreground h-4 w-4" />
                <div>
                  <p className="text-foreground text-sm font-medium">
                    {identity.roleLabel || 'Usuário'}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Escopo:{' '}
                    {identity.roleScope === 'global' ? 'Global' : 'Tenant'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="text-muted-foreground h-4 w-4" />
                <div>
                  <p className="text-foreground text-sm font-medium">
                    {activeMembership ? activeMembership.tenant_id : '—'}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Tenant atual: {identity.tenantLabel}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Key className="text-muted-foreground h-4 w-4" />
                <span className="text-foreground text-sm">
                  {permissions.length} permissão(ões) efetiva(s)
                </span>
              </div>
            </div>
          </Card>
        </div>

        <Card variant="default" className="p-6">
          <h2 className="text-foreground flex items-center gap-2 text-lg font-semibold">
            <Shield className="h-5 w-5" />
            Vínculos de tenant
          </h2>
          <div className="mt-4 space-y-2">
            {availableMemberships.length > 0 ? (
              availableMemberships.map((membership) => (
                <div
                  key={membership.id}
                  className="border-border flex items-center justify-between rounded border p-3"
                >
                  <div>
                    <p className="text-foreground text-sm font-medium">
                      Tenant {membership.tenant_id}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Papel: {membership.membership_role}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Status: {membership.status}
                    </p>
                  </div>
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium ${
                      membership.status === 'active'
                        ? 'border-green-100 bg-green-50 text-green-700'
                        : 'bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    {membership.status === 'active'
                      ? 'Ativo'
                      : membership.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-4 text-center">
                <p className="text-muted-foreground text-sm">
                  Nenhum vínculo de tenant ativo encontrado.
                </p>
              </div>
            )}
          </div>
        </Card>

        <div className="mt-4">
          <Button
            variant="danger"
            onClick={() => void logout()}
            className="flex w-full items-center justify-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sair da conta
          </Button>
        </div>
      </div>
    </>
  );
}
