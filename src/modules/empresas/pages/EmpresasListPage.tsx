'use client';

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/sections/Section';
import { Container } from '@/components/common/Container';
import { ErrorState } from '@/components/fallback/ErrorState';
import { EmptyState } from '@/components/fallback/EmptyState';
import { CompanyForm } from '@/modules/empresas/components/CompanyForm';
import { useAuth } from '@/contexts/AuthContext';
import { companiesRepository } from '@/repositories/companies.repository';
import type { Company } from '@/types/domain/company';
import type { CompanyFormData } from '@/modules/empresas/components/CompanyForm';

export default function EmpresasListPage() {
  const {
    hasPermission,
    hasAnyPermission,
    currentTenantId,
    tenantMemberships,
  } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeTenantId = currentTenantId || tenantMemberships[0]?.tenant_id;
  const canCreate =
    hasPermission('companies.create') || hasAnyPermission(['companies.create']);

  const loadCompanies = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await companiesRepository.findAll(activeTenantId || null);
      setCompanies(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar empresas',
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, [activeTenantId]);

  const handleSubmit = async (data: CompanyFormData) => {
    if (!activeTenantId) {
      setError('Tenant não identificado');
      return;
    }
    try {
      await companiesRepository.create(data, activeTenantId);
      setIsModalOpen(false);
      await loadCompanies();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar empresa');
    }
  };

  if (isLoading) {
    return (
      <Section>
        <Container>
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="text-center">
              <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
              <p className="text-muted-foreground text-sm">
                Carregando seu conteúdo...
              </p>
            </div>
          </div>
        </Container>
      </Section>
    );
  }

  if (error) {
    return (
      <Section>
        <Container>
          <ErrorState
            title="Erro ao carregar empresas"
            message={error}
            onRetry={loadCompanies}
          />
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-foreground flex items-center gap-2 text-2xl font-bold">
              <Building2 className="h-6 w-6" />
              Empresas
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Gerencie as empresas registradas no sistema.
            </p>
          </div>
          {canCreate && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova empresa
            </Button>
          )}
        </div>

        {companies.length === 0 ? (
          <EmptyState
            title="Nenhuma empresa"
            description="Não existem empresas registradas no sistema."
            actionLabel={canCreate ? 'Nova empresa' : undefined}
            onAction={canCreate ? () => setIsModalOpen(true) : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <Link
                key={company.id}
                to={`/dashboard/empresas/${company.id}`}
                className="card-base card-border-refined block p-4 transition hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-foreground truncate font-medium">
                      {company.trading_name ||
                        company.legal_name ||
                        company.name}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {company.cnpj || company.document || 'Sem documento'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>

      {isModalOpen && (
        <div className="bg-background/60 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="card-base card-border-refined w-full max-w-lg p-6">
            <h3 className="text-foreground mb-4 text-lg font-semibold">
              Nova empresa
            </h3>
            <CompanyForm
              open={true}
              tenantId={activeTenantId || ''}
              editingCompany={null}
              onSubmit={handleSubmit}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </Section>
  );
}
