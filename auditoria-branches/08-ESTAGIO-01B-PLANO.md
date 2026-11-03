# ESTÁGIO 01b - NAVEGAÇÃO DINÂMICA + SIDEBARS

Data: 2026-11-02 21:42:43
Modo: SOMENTE LEITURA | Sem merge | Sem cópia inteira | Sem substituição de módulos

## Arquitetura proposta (validada)

- Sidebar global = espinha dorsal (módulos/células, não links internos)
- Sidebar local por célula = navegação interna
- Catálogo central + autorização centralizada
- Banco = identidade/vínculos/papéis/permissões/RLS
- Código = catálogo, rotas, layouts, metadados

## Mapeamento para auditar

| Arquivo/Componente                                      | Função                           | Status                      |
| ------------------------------------------------------- | -------------------------------- | --------------------------- |
| src/core/dispatcher/DispatcherMaster.ts                 | Despacho/contexto                | A auditar                   |
| src/contexts/AuthContext.tsx                            | Identidade/autenticação          | Já analisado (hardening M1) |
| src/contexts/AccountContext.tsx                         | Conta/tenant/módulos disponíveis | A auditar                   |
| src/core/registry/CellRegistryContract.ts               | Contrato células                 | Já mapeado                  |
| src/core/cells/register-cells.ts                        | Registro células                 | Já mapeado                  |
| src/core/cells/cell-to-module-definition.ts             | Conversão célula->módulo         | A auditar                   |
| src/core/authorization/AuthorizationContract.ts         | Contrato autorização             | A auditar                   |
| src/components/auth/ProtectedRoute.tsx                  | Guarda rotas                     | Já analisado                |
| src/components/auth/PermissionGuard.tsx                 | Guarda permissões                | Já analisado                |
| src/shell/ModuleLayout.tsx                              | Layout global módulos            | Já mapeado                  |
| src/shell/AdminModuleLayout.tsx                         | Layout admin módulos             | Já mapeado                  |
| src/modules/admin/layout/AdminLayout.tsx                | Layout admin                     | A auditar                   |
| src/modules/admin-tenant/layout/AdminTenantLayout.tsx   | Layout admin tenant              | A auditar                   |
| src/modules/admin-tenant/sidebar/AdminTenantSidebar.tsx | Sidebar local tenant             | A auditar                   |
| src/components/portal/PortalSidebar.tsx                 | Sidebar portal/atual             | Já analisado                |
| src/components/portal/PortalHeader.tsx                  | Header portal                    | Já analisado                |
| src/core/dispatcher/ModuleRouter.tsx                    | Roteamento módulos               | A auditar                   |

## Perguntas a responder

1. Quem alimenta getAvailableModules/getAvailableFeatures?
2. DispatcherMaster decide contexto ou apenas despacha?
3. AdminTenantSidebar usa contrato global ou convenção?
4. Há duplicação de avaliação permissões (guards x registry)?
5. Como ROOT/admin_master vs admin tenant são diferenciados?
6. Paridade entre decisões (guarda x menu)?
