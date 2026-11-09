import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AdminModuleLayout } from './AdminModuleLayout';
import { ModuleLayout } from './ModuleLayout';

const module = {
  id: 'rh',
  title: 'RH',
  description: 'RH',
  icon: 'Users',
  route: '/dashboard/rh',
  category: 'negocio' as const,
  scope: 'tenant' as const,
  permissions: [],
  features: [],
};

describe('single-shell module wrappers', () => {
  it('AdminModuleLayout does not render an aside/sidebar or "Todos os módulos"', () => {
    const { container } = render(
      <AdminModuleLayout module={module}>
        <div data-testid="content">conteúdo</div>
      </AdminModuleLayout>,
    );
    expect(screen.getByTestId('content')).toBeTruthy();
    expect(container.querySelector('aside')).toBeNull();
    expect(container.textContent).not.toContain('Todos os módulos');
    expect(container.textContent).not.toContain('Início do módulo');
  });

  it('ModuleLayout does not render an aside/sidebar', () => {
    const { container } = render(
      <ModuleLayout title="RH">
        <div data-testid="content2">conteúdo</div>
      </ModuleLayout>,
    );
    expect(screen.getByTestId('content2')).toBeTruthy();
    expect(container.querySelector('aside')).toBeNull();
  });
});
