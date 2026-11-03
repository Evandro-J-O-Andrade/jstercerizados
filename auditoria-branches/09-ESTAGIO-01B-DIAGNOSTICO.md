# ESTÁGIO 01b - DIAGNÓSTICO INICIAL

Data: 2026-11-02 21:44:53

## Fluxo atual identificado

1. Identity/AuthContext -> AccountContext (deriveUserIdentity)
2. AccountContext chama getAvailableModules(permissions, effectiveScopes) de platform/modules -> reexporta de components/legacy/portal/ModuleRegistry
3. CellRegistry + cell-to-module-definition fornecem getAvailableModulesFromCellRegistry
4. ModuleRouter usa getAvailableModulesFromCellRegistry + ModuleRegistry fallback, filtra por permissões, renderiza com AdminModuleLayout/PermissionGuard
5. DispatcherMaster: resolveDestination, dispatch, valida autorização/tenant, usa CellRegistry
6. AdminTenantSidebar: sidebar local própria, filtra por permissões diretas do AuthContext (owner.*), layout próprio (AdminTenantLayout)
7. PortalSidebar: sidebar global/portal com hierarquia expansível (analisado na branch)

## Observações

- Há duas fontes paralelas: ModuleRegistry (legado) e CellRegistry (canônico)
- cell-to-module-definition faz ponte e prioriza CellRegistry
- AdminTenantSidebar é independente (não passa por ModuleRouter padrão)
- DispatcherMaster é autoridade central para roteamento pós-login
- AdminModuleLayout usado por módulos via ModuleRouter

## Próximos passos

- Mapear como módulos são registrados (register-cells.ts)
- Verificar paridade PermissionGuard vs decisões de menu
- Identificar se há duplicação de avaliação
- Comparar com arquitetura proposta (global por módulos + local por célula)
