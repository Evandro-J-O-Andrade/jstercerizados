import { describe, expect, it } from 'vitest';
import { RecrutamentoRoutes } from './RecrutamentoRoutes';
import { RECRUTAMENTO_PERMISSIONS } from '../permissions';

describe('RecrutamentoRoutes — fluxo canônico de vagas', () => {
  it('declara dashboard, listagem, criação, detalhes e edição em rotas separadas', () => {
    expect(RecrutamentoRoutes.map((route) => route.path)).toEqual(
      expect.arrayContaining([
        '',
        'vagas',
        'vagas/novo',
        'vagas/:id',
        'vagas/:id/editar',
      ]),
    );
  });

  it('mantém /vagas/nova somente como compatibilidade e protege operações de escrita', () => {
    const create = RecrutamentoRoutes.find(
      (route) => route.path === 'vagas/novo',
    );
    const legacyCreate = RecrutamentoRoutes.find(
      (route) => route.path === 'vagas/nova',
    );
    const edit = RecrutamentoRoutes.find(
      (route) => route.path === 'vagas/:id/editar',
    );

    expect(create?.requiredPermissions).toEqual([
      RECRUTAMENTO_PERMISSIONS.vagasCriar,
    ]);
    expect(legacyCreate?.requiredPermissions).toEqual([
      RECRUTAMENTO_PERMISSIONS.vagasCriar,
    ]);
    expect(edit?.requiredPermissions).toEqual([
      RECRUTAMENTO_PERMISSIONS.vagasEditar,
    ]);
  });
});
