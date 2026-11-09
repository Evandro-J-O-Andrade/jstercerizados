import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/platform/context', () => ({ useAccount: vi.fn() }));
vi.mock('@/core/cells/cell-to-module-definition', () => ({ getAvailableModulesFromCellRegistry: () => [] }));

import { ModuleLayout } from './ModuleLayout';

describe('ModuleLayout (single-shell compatibility)', () => {
  it('renders children without mounting a duplicate sidebar/header shell', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/financeiro']}>
        <ModuleLayout title="Financeiro" homeRoute="/dashboard/financeiro" moduleId="financeiro">
          <div>Conteúdo do módulo</div>
        </ModuleLayout>
      </MemoryRouter>,
    );
    expect(screen.getByText('Conteúdo do módulo')).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: /navega/i })).not.toBeInTheDocument();
  });
});
