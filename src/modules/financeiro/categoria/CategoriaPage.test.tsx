import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  addToast: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({ useAuth: mocks.useAuth }));
vi.mock('@/components/feedback/ToastContext', () => ({
  useToast: () => ({ addToast: mocks.addToast }),
}));
vi.mock('@/repositories/financial-category.repository', () => ({
  financialCategoryRepository: {
    findAll: mocks.findAll,
    create: mocks.create,
  },
}));

import CategoriasPage from './CategoriaPage';

const category = {
  id: 'category-1',
  tenant_id: 'tenant-1',
  name: 'Água',
  type: 'expense' as const,
  parent_id: null,
  description: null,
  status: 'active' as const,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

describe('CategoriasPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useAuth.mockReturnValue({
      currentTenantId: 'tenant-1',
      hasPermission: (permission: string) => permission === 'finance.create',
    });
    mocks.findAll.mockResolvedValue([category]);
    mocks.create.mockImplementation(async (input) => ({
      ...category,
      ...input,
      id: 'category-2',
    }));
  });

  it('loads categories only for the selected tenant', async () => {
    render(<CategoriasPage />);

    expect(await screen.findByText('Água')).toBeInTheDocument();
    expect(mocks.findAll).toHaveBeenCalledWith('tenant-1');
  });

  it('requires a selected tenant before loading categories', async () => {
    mocks.useAuth.mockReturnValue({
      currentTenantId: null,
      hasPermission: () => false,
    });

    render(<CategoriasPage />);

    expect(screen.getByText('Selecione uma organização')).toBeInTheDocument();
    expect(mocks.findAll).not.toHaveBeenCalled();
  });

  it('creates a category in the selected tenant when permitted', async () => {
    render(<CategoriasPage />);

    fireEvent.click(
      await screen.findByRole('button', { name: 'Nova categoria' }),
    );
    fireEvent.change(screen.getByLabelText('Nome'), {
      target: { value: 'Energia' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(mocks.create).toHaveBeenCalledWith({
      name: 'Energia',
      type: 'expense',
      status: 'active',
      tenant_id: 'tenant-1',
    });
    expect(await screen.findByText('Energia')).toBeInTheDocument();
  });

  it('does not expose category creation without permission', async () => {
    mocks.useAuth.mockReturnValue({
      currentTenantId: 'tenant-1',
      hasPermission: () => false,
    });

    render(<CategoriasPage />);

    await screen.findByText('Água');
    expect(
      screen.queryByRole('button', { name: 'Nova categoria' }),
    ).not.toBeInTheDocument();
  });
});
