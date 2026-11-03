# ESTÁGIO 01b - MAPA ARQUITETURA ATUAL

Data: 2026-11-02 21:45:21

## Estrutura identificada

- **Global Core**: DispatcherMaster (resolveDestination/dispatch), AuthorizationContract, ExecutionContract, CellRegistry
- **Catálogo**: CellRegistry (canônico) + ModuleRegistry/PORTAL_MODULES (legado) - ponte via cell-to-module-definition
- **Contexto**: AuthContext -> AccountContext (getAvailableModules/Features filtrados por permissões + scopes)
- **Roteamento**: ModuleRouter (usa CellRegistry via cell-to-module-definition, aplica PermissionGuard, usa AdminModuleLayout)
- **Sidebars locais**: AdminTenantSidebar (própria, filtra por permissões owner.*), outras células podem ter próprias
- **Sidebar global/portal**: PortalSidebar (hierárquica, já analisada) - aparece em PortalLayout

## Alinhamento com proposta

✅ Sidebar local por célula (AdminTenantSidebar)  
✅ Catálogo central (CellRegistry) + autorização centralizada (AuthorizationContract/DispatcherMaster)  
✅ Banco = identidade/permissões/RLS, código = catálogo/rotas/layouts  
✅ DispatcherMaster autoridade para resolveDestination  
⚠️ Duas fontes de catálogo (legado vs canônico) - já com ponte  
⚠️ AdminTenantSidebar não vem via CellRegistry, tem lógica própria  
⚠️ Precisa verificar paridade entre menu (AccountContext/guards) e rota (PermissionGuard)

## Recomendação

Manter arquitetura híbrida proposta. Fortalecer uso do CellRegistry como fonte única, padronizar contrato de navegação por célula, garantir paridade autorização menu x rota.
