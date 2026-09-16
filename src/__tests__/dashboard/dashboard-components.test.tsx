import { Building2, Users } from 'lucide-react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import {
  DashboardCard,
  DashboardMetricGrid,
  DashboardSection,
} from '@/components/dashboard';
import type { DashboardMetric } from '@/components/dashboard/dashboard-model';

const metric: DashboardMetric = {
  id: 'companies',
  label: 'Empresas',
  value: 12,
  description: 'Empresas cadastradas',
  icon: Building2,
  tone: 'primary',
  href: '/dashboard/empresas',
};

describe('dashboard components', () => {
  it('renders a metric card with its value, description and icon', () => {
    render(
      <MemoryRouter>
        <DashboardCard metric={metric} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Empresas')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Empresas cadastradas')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-icon-companies')).toBeInTheDocument();
  });

  it('renders a metric card as a link when href is provided', () => {
    render(
      <MemoryRouter>
        <DashboardCard metric={metric} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /empresas/i })).toHaveAttribute(
      'href',
      '/dashboard/empresas',
    );
  });

  it('renders a loading skeleton without exposing the metric value', () => {
    render(<DashboardCard metric={metric} loading />);

    expect(screen.queryByText('12')).not.toBeInTheDocument();
    expect(
      screen.getByTestId('dashboard-card-skeleton-companies'),
    ).toBeInTheDocument();
  });

  it('groups metric cards in the responsive metric grid', () => {
    render(
      <MemoryRouter>
        <DashboardMetricGrid>
          <DashboardCard metric={metric} />
          <DashboardCard metric={{ ...metric, id: 'users', icon: Users }} />
        </DashboardMetricGrid>
      </MemoryRouter>,
    );

    expect(screen.getAllByRole('link')).toHaveLength(2);
  });

  it('renders a dashboard section with title and actions', () => {
    render(
      <DashboardSection
        title="Resumo operacional"
        description="Indicadores do portal"
        icon={Users}
        actions={<button type="button">Exportar</button>}
      >
        Conteúdo
      </DashboardSection>,
    );

    expect(screen.getByText('Resumo operacional')).toBeInTheDocument();
    expect(screen.getByText('Indicadores do portal')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Exportar' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Conteúdo')).toBeInTheDocument();
  });
});
