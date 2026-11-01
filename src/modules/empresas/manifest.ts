/**
 * Manifesto da célula empresas — Clientes, leads, contratos e relacionamentos.
 *
 * Cada célula declara seu domínio, rotas, permissões e contratos.
 * O CellRegistry utiliza este manifesto para registrar a célula
 * sem conceder privilégios automaticamente.
 */

export const empresasCellManifest = {
  id: 'empresas',
  name: 'Empresas',
  domain: 'tenant',
  scope: 'tenant',
  profile: 'empresas',
  description:
    'Cadastro e gestão de empresas clientes.',
  homeRoute: '/dashboard/empresas',
  sidebarLabel: 'Empresas',
  sidebarIcon: 'Building2',
  isGlobal: false,
  enabled: true,
} as const;
