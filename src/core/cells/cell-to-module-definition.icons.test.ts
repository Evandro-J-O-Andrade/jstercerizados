import { describe, expect, it } from 'vitest';
import type { CellContract } from '@/core/types';
import { cellContractToModuleDefinition } from './cell-to-module-definition';

describe('cellContractToModuleDefinition icons', () => {
  it('preserva os ícones semânticos da célula e das rotas', () => {
    const cell: CellContract = {
      id: 'recrutamento',
      name: 'Recrutamento',
      scope: 'tenant',
      homeRoute: '/dashboard/recrutamento',
      navigation: { icon: 'BriefcaseBusiness', label: 'Recrutamento' },
      routes: [
        {
          path: 'candidatos',
          label: 'Candidatos',
          icon: 'UserRoundSearch',
          requiredPermissions: ['candidates.read'],
        },
      ],
      permissions: ['recruitment.read'],
      enabled: true,
    };

    const module = cellContractToModuleDefinition(cell);

    expect(module.icon).toBe('BriefcaseBusiness');
    expect(module.features?.[0]?.icon).toBe('UserRoundSearch');
  });
});
