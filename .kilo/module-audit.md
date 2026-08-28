# Auditoria de Módulos — J&S Empregos LTDA

Regra: página vazia não é implementação. Se a tabela existe, usamos colunas/relacionamentos reais. Se ainda não existem registros, mostramos EmptyState e deixamos cadastro/CRUD disponível conforme permissões.

## Estado Atual dos Módulos

| Módulo             | Categoria  | Scope    | Rota                                  | Página              | Permission                | Página Existe | Rota Registrada | ModuleRegistry | RBAC | Dados Reais | Estado       | Observação                                                                          |
| ------------------ | ---------- | -------- | ------------------------------------- | ------------------- | ------------------------- | ------------- | --------------- | -------------- | ---- | ----------- | ------------ | ----------------------------------------------------------------------------------- |
| Início             | inicio     | tenant   | /dashboard                            | DashboardHome       |                           | SIM           | SIM             | SIM            | NÃO  | SIM         | Implementado | Página existe, sem permission específica                                            |
| Tenants            | plataforma | platform | /dashboard/tenants                    | TenantsPage         | tenants.read              | SIM           | NÃO             | SIM            | SIM  | NÃO         | Faltando     | Página existe mas rota não registrada                                               |
| Onboarding         | plataforma | platform | /dashboard/onboarding                 | OnboardingPage      | tenants.read              | SIM           | NÃO             | SIM            | SIM  | NÃO         | Faltando     | Página existe mas rota não registrada                                               |
| Assinaturas        | plataforma | platform | /dashboard/assinaturas                | AssinaturasPage     | finance.read              | SIM           | NÃO             | SIM            | SIM  | NÃO         | Faltando     | Página existe mas rota não registrada                                               |
| Gestão SaaS        | plataforma | platform | /dashboard/gestao-saas                | GestaoSaaSPage      | domain_events.read        | SIM           | NÃO             | SIM            | SIM  | NÃO         | Faltando     | Página existe mas rota não registrada                                               |
| Usuários           | segurança  | platform | /dashboard/usuarios                   | Usuarios            | people.read               | SIM           | NÃO             | SIM            | SIM  | NÃO         | Faltando     | Arquivo Usuarios.tsx existe, mas rota não registrada                                |
| Roles & Permissões | segurança  | platform | /dashboard/roles-permissoes           | RolesPermissoesPage | roles.read                | SIM           | NÃO             | SIM            | SIM  | NÃO         | Faltando     | Página existe mas rota não registrada                                               |
| Auditoria          | segurança  | platform | /dashboard/auditoria                  | AuditoriaPage       | audit.read                | SIM           | NÃO             | SIM            | SIM  | NÃO         | Faltando     | Página existe mas rota não registrada                                               |
| RH                 | negócio    | tenant   | /dashboard/rh                         | RhPage              | people.read               | SIM           | NÃO             | SIM            | SIM  | NÃO         | Faltando     | Arquivo RhPage.tsx existe, mas rota não registrada                                  |
| Recrutamento       | negócio    | tenant   | /dashboard/recrutamento               | Vagas               | jobs.read,candidates.read | SIM           | NÃO             | SIM            | SIM  | NÃO         | Faltando     | MODULE_PAGE_MAP aponta para 'VagasPage' mas arquivo é Vagas.tsx                     |
| CRM                | negócio    | tenant   | /dashboard/crm                        | ClientesPage        | companies.read            | SIM           | NÃO             | SIM            | SIM  | NÃO         | Faltando     | MODULE_PAGE_MAP aponta para ClientesPage mas rota CRM usa Clientes                  |
| Financeiro         | negócio    | tenant   | /dashboard/financeiro                 | FinanceiroPage      | finance.dashboard.read    | SIM           | NÃO             | SIM            | SIM  | PARCIAL     | Implementado | Página existe mas rota não registrada; faltam bancos, centro custos, fluxo de caixa |
| Faturamento        | negócio    | tenant   | /dashboard/faturamento                | FaturamentoPage     | finance.read              | SIM           | NÃO             | SIM            | SIM  | NÃO         | Faltando     | Página existe mas rota não registrada                                               |
| Fiscal             | negócio    | tenant   | /dashboard/fiscal                     | FiscalPage          | fiscal.dashboard.read     | SIM           | NÃO             | SIM            | SIM  | NÃO         | Faltando     | Página existe mas rota não registrada                                               |
| Contabilidade      | negócio    | tenant   | /dashboard/contabilidade              | ContabilidadePage   | accounting.dashboard.read | SIM           | NÃO             | SIM            | SIM  | NÃO         | Faltando     | Página existe mas rota não registrada                                               |
| Serviços           | negócio    | tenant   | /dashboard/servicos                   | Servicos            | service_orders.read       | SIM           | NÃO             | SIM            | SIM  | NÃO         | Faltando     | Arquivo Servicos.tsx existe, mas rota não registrada                                |
| Estoque            | negócio    | tenant   | /dashboard/estoque                    | Estoque             | stock_movements.read      | SIM           | NÃO             | SIM            | SIM  | NÃO         | Faltando     | Arquivo Estoque.tsx existe, mas rota não registrada                                 |
| Almoxarifado       | negócio    | tenant   | /dashboard/almoxarifado               | Almoxarifado        | stock_movements.read      | SIM           | NÃO             | SIM            | SIM  | NÃO         | Faltando     | Página existe mas rota não registrada                                               |
| Suporte            | negócio    | tenant   | /dashboard/suporte                    | Suporte             | support_tickets.read      | SIM           | NÃO             | SIM            | SIM  | NÃO         | Faltando     | Página existe mas rota não registrada                                               |
| Relatórios         | negócio    | tenant   | /dashboard/relatorios                 | Relatorios          | reports.read              | SIM           | NÃO             | SIM            | SIM  | NÃO         | Faltando     | MODULE_PAGE_MAP aponta para RelatoriosPage mas arquivo é Relatorios.tsx             |
| IA                 | plataforma | tenant   | /dashboard/ia                         | IaPage              |                           | SIM           | NÃO             | SIM            | NÃO  | NÃO         | Faltando     | Página existe mas rota não registrada                                               |
| Integrações        | plataforma | platform | /dashboard/integracoes                | IntegracoesPage     | integrations.manage       | SIM           | NÃO             | SIM            | SIM  | NÃO         | Faltando     | Página existe mas rota não registrada                                               |
| Configurações SaaS | plataforma | platform | /dashboard/configuracoes              | Configuracoes       | tenant.manage             | SIM           | NÃO             | SIM            | SIM  | NÃO         | Faltando     | MODULE_PAGE_MAP aponta para ConfiguracoesPage mas arquivo é Configuracoes.tsx       |
| Preferências       | conta      | tenant   | /dashboard/configuracoes/preferencias | Configuracoes       |                           | SIM           | NÃO             | SIM            | NÃO  | NÃO         | Faltando     | Página compartilhada com configuracoes-saas                                         |
| Minha Conta        | conta      | tenant   | /dashboard/configuracoes/conta        | Configuracoes       |                           | SIM           | NÃO             | SIM            | NÃO  | NÃO         | Faltando     | Página compartilhada                                                                |
| Segurança          | conta      | tenant   | /dashboard/configuracoes/seguranca    | SegurancaPage       |                           | SIM           | NÃO             | SIM            | NÃO  | NÃO         | Faltando     | Página existe mas rota não registrada                                               |
| Contratos          | documentos | tenant   | /dashboard/contratos                  | ContratosPage       | contracts.read            | SIM           | NÃO             | SIM            | SIM  | NÃO         | Faltando     | Página existe mas rota não registrada                                               |
| Clientes           | site       | public   | /clientes                             | Clientes            |                           | SIM           | SIM             | NÃO            | NÃO  | SIM         | Site         | Página existe no site público                                                       |
| Empresas           | site       | public   | /empresas                             | Empresas            |                           | SIM           | SIM             | NÃO            | NÃO  | SIM         | Site         | Página existe no site público                                                       |
| Fornecedores       | site       | public   | /fornecedores                         | Fornecedores        |                           | SIM           | SIM             | NÃO            | NÃO  | SIM         | Site         | Página existe no site público                                                       |
| Home               | site       | public   | /                                     | Home                |                           | SIM           | SIM             | NÃO            | NÃO  | SIM         | Site         | Página existe no site público                                                       |
| Vagas              | site       | public   | /vagas                                | Vagas               |                           | SIM           | SIM             | NÃO            | NÃO  | SIM         | Site         | Página existe no site público                                                       |
| Serviços           | site       | public   | /servicos                             | PublicServicos      |                           | SIM           | SIM             | NÃO            | NÃO  | SIM         | Site         | Página existe no site público                                                       |
| Login              | site       | public   | /login                                | Login               |                           | SIM           | SIM             | NÃO            | NÃO  | SIM         | Site         | Página existe no site público                                                       |

## Resumo

- Total módulos no registry: 28
- Módulos com página existente: 24
- Módulos com rota registrada: 3 (início, clientes, empresas, etc. do site)
- Módulos com RBAC configurado: 20
- Módulos totalmente funcionais: 1 (Início)
- Módulos com dados reais: 1 (Início)
- Módulos faltando página: 4 (gestao-saas, configuracoes-saas, preferencias, minha-conta)
- Módulos com nome de página incorreto no MODULE_PAGE_MAP: 8

## Ações Necessárias

1. Corrigir MODULE_PAGE_MAP para usar nomes corretos dos arquivos existentes
2. Registrar rotas dos módulos do portal em App.tsx
3. Reconstruir módulos faltantes com dados reais do Supabase
4. Aplicar EmptyState + CRUD em todos os módulos tenant
5. Não apagar páginas do site existentes
