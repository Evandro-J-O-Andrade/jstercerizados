# Portal Pages Matrix

Mapa estático do frontend: página → módulo → feature → permission → ação CRUD.

## Como ler

- `REQ` = permission declarada no `ModuleRegistry` para a página/module/feature.
- `ACT` = permissão realmente existente no Supabase (`permissions.name`).
- `GAP` = permission requerida no frontend que não existe no banco.
- `MISS` = permissão no banco que não está mapeada no `ModuleRegistry`.

## Páginas públicas

| Página                 | Arquivo                                | Tipo    |
| ---------------------- | -------------------------------------- | ------- |
| Home                   | `src/pages/Home.tsx`                   | pública |
| Sobre                  | `src/pages/Sobre.tsx`                  | pública |
| Serviços               | `src/pages/Servicos.tsx`               | pública |
| Serviço Detalhe        | `src/pages/ServicoDetalhe.tsx`         | pública |
| Vagas                  | `src/pages/Vagas.tsx`                  | pública |
| Vaga Detalhe           | `src/pages/VagaDetalhe.tsx`            | pública |
| Empresas               | `src/pages/Empresas.tsx`               | pública |
| Divulgar Vaga          | `src/pages/DivulgarVaga.tsx`           | pública |
| Candidatos             | `src/pages/Candidatos.tsx`             | pública |
| Blog                   | `src/pages/Blog.tsx`                   | pública |
| Parceiros              | `src/pages/Parceiros.tsx`              | pública |
| Fornecedores           | `src/pages/Fornecedores.tsx`           | pública |
| Clientes               | `src/pages/Clientes.tsx`               | pública |
| Processo Seletivo      | `src/pages/ProcessoSeletivo.tsx`       | pública |
| Trabalhe Conosco       | `src/pages/TrabalheConosco.tsx`        | pública |
| Suporte                | `src/pages/Suporte.tsx`                | pública |
| FAQ                    | `src/pages/FAQ.tsx`                    | pública |
| Contato                | `src/pages/Contato.tsx`                | pública |
| Privacidade            | `src/pages/Privacidade.tsx`            | pública |
| Termos                 | `src/pages/Termos.tsx`                 | pública |
| Cadastro               | `src/pages/Cadastro.tsx`               | pública |
| Login                  | `src/pages/Login.tsx`                  | pública |
| Cadastro Candidato     | `src/pages/CadastroCandidato.tsx`      | pública |
| Cadastro Empresa       | `src/pages/CadastroEmpresa.tsx`        | pública |
| Recuperar Senha        | `src/pages/RecuperarSenha.tsx`         | pública |
| Onboarding             | `src/pages/Onboarding.tsx`             | pública |
| Primeiro Acesso Termos | `src/pages/primeiro-acesso/Termos.tsx` | pública |
| Primeiro Acesso Senha  | `src/pages/primeiro-acesso/Senha.tsx`  | pública |
| NotFound               | `src/pages/NotFound.tsx`               | pública |

## Páginas do dashboard

| Página                 | Arquivo                                          | Módulo                                                             | Feature             | Rota                             | REQ permission                      | ACT no banco           | Status     |
| ---------------------- | ------------------------------------------------ | ------------------------------------------------------------------ | ------------------- | -------------------------------- | ----------------------------------- | ---------------------- | ---------- |
| DashboardHome          | `src/pages/dashboard/DashboardHome.tsx`          | inicio                                                             | -                   | `/dashboard`                     | `finance.dashboard.read` (fallback) | ✅ existe              | OK         |
| TenantsPage            | `src/pages/dashboard/TenantsPage.tsx`            | tenants                                                            | listar              | `/dashboard/tenants`             | `tenants.read`                      | ✅ existe              | OK         |
| ClientesPage           | `src/pages/dashboard/ClientesPage.tsx`           | clientes                                                           | leads               | `/dashboard/clientes`            | `companies.read`                    | ✅ existe              | OK         |
| OnboardingPage         | `src/pages/dashboard/OnboardingPage.tsx`         | onboarding                                                         | provisionar         | `/dashboard/onboarding`          | `tenants.read`                      | ✅ existe              | OK         |
| AssinaturasPage        | `src/pages/dashboard/AssinaturasPage.tsx`        | assinaturas                                                        | planos              | `/dashboard/assinaturas`         | `finance.read`                      | ✅ existe              | OK         |
| GestaoSaaSPage         | `src/pages/dashboard/GestaoSaaSPage.tsx`         | gestao-saas                                                        | dashboard-saas      | `/dashboard/gestao-saas`         | `domain_events.read`                | ✅ existe              | OK         |
| CatalogoPage           | `src/pages/dashboard/CatalogoPage.tsx`           | servicos                                                           | catalogo            | `/dashboard/servicos`            | `service_orders.read`               | ✅ existe              | OK         |
| DocumentosPage         | `src/pages/dashboard/DocumentosPage.tsx`         | documentos                                                         | listar              | `/dashboard/documentos`          | `files.read`                        | ✅ existe              | OK         |
| ContratosPage          | `src/pages/dashboard/ContratosPage.tsx`          | contratos                                                          | listar              | `/dashboard/contratos`           | `contracts.read`                    | ❌ não existe no banco | GAP        |
| TermosPage             | `src/pages/dashboard/TermosPage.tsx`             | termos                                                             | termos-uso          | `/dashboard/termos`              | `documents.read`                    | ✅ existe              | OK         |
| LgpdPage               | `src/pages/dashboard/LgpdPage.tsx`               | -                                                                  | -                   | `/dashboard/lgpd`                | -                                   | -                      | sem módulo |
| SegurancaPage          | `src/pages/dashboard/SegurancaPage.tsx`          | -                                                                  | -                   | `/dashboard/seguranca`           | -                                   | -                      | sem módulo |
| MonitoramentoPage      | `src/pages/dashboard/MonitoramentoPage.tsx`      | -                                                                  | -                   | `/dashboard/monitoramento`       | -                                   | -                      | sem módulo |
| IntegracoesPage        | `src/pages/dashboard/IntegracoesPage.tsx`        | integracoes                                                        | supabase            | `/dashboard/integracoes`         | `integrations.manage`               | ✅ existe              | OK         |
| FiscalPage             | `src/pages/dashboard/FiscalPage.tsx`             | fiscal                                                             | notas-fiscais       | `/dashboard/fiscal`              | `fiscal.dashboard.read`             | ✅ existe              | OK         |
| ContabilidadePage      | `src/pages/dashboard/ContabilidadePage.tsx`      | contabilidade                                                      | plano-contas        | `/dashboard/contabilidade`       | `accounting.dashboard.read`         | ✅ existe              | OK         |
| RbacAuditPage          | `src/pages/dashboard/RbacAuditPage.tsx`          | auditoria                                                          | logs                | `/dashboard/rbac-auditoria`      | `audit.read`                        | ✅ existe              | OK         |
| VisaoGeralPage         | `src/pages/dashboard/VisaoGeral.tsx`             | rh                                                                 | -                   | `/dashboard/rh`                  | `people.read`                       | ✅ existe              | OK         |
| VagasPage              | `src/pages/dashboard/VagasPage.tsx`              | recrutamento                                                       | vagas               | `/dashboard/vagas`               | `jobs.read`                         | ✅ existe              | OK         |
| CandidatosPage         | `src/pages/dashboard/CandidatosPage.tsx`         | recrutamento                                                       | candidatos          | `/dashboard/candidatos`          | `candidates.read`                   | ✅ existe              | OK         |
| EmpresasPage           | `src/pages/dashboard/EmpresasPage.tsx`           | gestao                                                             | empresas            | `/dashboard/empresas`            | `companies.read`                    | ✅ existe              | OK         |
| ParceirosPage          | `src/pages/dashboard/ParceirosPage.tsx`          | clientes                                                           | prospects           | `/dashboard/parceiros`           | `companies.read`                    | ✅ existe              | OK         |
| FornecedoresPage       | `src/pages/dashboard/FornecedoresPage.tsx`       | financeiro                                                         | fornecedores        | `/dashboard/fornecedores`        | `finance.suppliers.read`            | ✅ existe              | OK         |
| UsuariosPage           | `src/pages/dashboard/UsuariosPage.tsx`           | usuarios                                                           | listar              | `/dashboard/usuarios`            | `people.read`                       | ✅ existe              | OK         |
| ProcessosSeletivosPage | `src/pages/dashboard/ProcessosSeletivosPage.tsx` | recrutamento                                                       | processos-seletivos | `/dashboard/processos-seletivos` | `jobs.read`                         | ✅ existe              | OK         |
| ServicosPage           | `src/pages/dashboard/ServicosPage.tsx`           | servicos                                                           | ordens              | `/dashboard/servicos/ordens`     | `service_orders.read`               | ✅ existe              | OK         |
| FinanceiroPage         | `src/pages/dashboard/FinanceiroPage.tsx`         | financeiro                                                         | contas-pagar        | `/dashboard/financeiro`          | `finance.dashboard.read`            | ✅ existe              | OK         |
| EstoquePage            | `src/pages/dashboard/EstoquePage.tsx`            | estoque                                                            | produtos            | `/dashboard/estoque`             | `stock_movements.read`              | ✅ existe              | OK         |
| SuportePage            | `src/pages/dashboard/SuportePage.tsx`            | suporte                                                            | chamados            | `/dashboard/suporte`             | `support_tickets.read`              | ✅ existe              | OK         |
| RelatoriosPage         | `src/pages/dashboard/RelatoriosPage.tsx`         | relatorios                                                         | relatorios-rh       | `/dashboard/relatorios`          | `reports.read`                      | ✅ existe              | OK         |
| ConfiguracoesPage      | `src/pages/dashboard/ConfiguracoesPage.tsx`      | roles-permissoes / configuracoes-saas / preferencias / minha-conta | -                   | `/dashboard/configuracoes`       | `roles.read` / `tenant.manage`      | ✅ existe              | OK         |

## Módulos sem página dedicada

| Módulo             | Rota                                          | Página usada        | Observação               |
| ------------------ | --------------------------------------------- | ------------------- | ------------------------ |
| servicos           | `/dashboard/servicos`                         | `CatalogoPage`      | usa página de catálogo   |
| servicos           | `/dashboard/servicos/ordens`                  | `ServicosPage`      | usa página de ordens     |
| servicos           | `/dashboard/servicos/chamados`                | `SuportePage`       | usa página de suporte    |
| rh                 | `/dashboard/rh`                               | `VisaoGeralPage`    | usa página visão geral   |
| rh                 | `/dashboard/rh/funcionarios`                  | `VisaoGeralPage`    | fallback                 |
| rh                 | `/dashboard/rh/documentos`                    | `VisaoGeralPage`    | fallback                 |
| rh                 | `/dashboard/relatorios`                       | `RelatoriosPage`    | usa página de relatórios |
| gestao             | `/dashboard/gestao`                           | `EmpresasPage`      | usa página empresas      |
| gestao             | `/dashboard/gestao/indicadores`               | `EmpresasPage`      | fallback                 |
| gestao             | `/dashboard/gestao/contratos`                 | `EmpresasPage`      | fallback                 |
| gestao             | `/dashboard/gestao/equipes`                   | `EmpresasPage`      | fallback                 |
| gestao             | `/dashboard/gestao/relatorios`                | `RelatoriosPage`    | fallback                 |
| gestao             | `/dashboard/servicos`                         | `CatalogoPage`      | fallback                 |
| financeiro         | `/dashboard/financeiro/fluxo-caixa`           | `FinanceiroPage`    | fallback                 |
| financeiro         | `/dashboard/financeiro/faturamento`           | `FinanceiroPage`    | fallback                 |
| financeiro         | `/dashboard/financeiro/conciliacao`           | `FinanceiroPage`    | fallback                 |
| financeiro         | `/dashboard/financeiro/bancos`                | `FinanceiroPage`    | fallback                 |
| financeiro         | `/dashboard/financeiro/centro-custos`         | `FinanceiroPage`    | fallback                 |
| financeiro         | `/dashboard/fornecedores`                     | `FornecedoresPage`  | fallback                 |
| financeiro         | `/dashboard/relatorios`                       | `RelatoriosPage`    | fallback                 |
| onboarding         | `/dashboard/onboarding/configuracao`          | `OnboardingPage`    | fallback                 |
| assinaturas        | `/dashboard/assinaturas/renovacoes`           | `AssinaturasPage`   | fallback                 |
| gestao-saas        | `/dashboard/gestao-saas/mrr`                  | `GestaoSaaSPage`    | fallback                 |
| gestao-saas        | `/dashboard/gestao-saas/uso`                  | `GestaoSaaSPage`    | fallback                 |
| gestao-saas        | `/dashboard/gestao-saas/crescimento`          | `GestaoSaaSPage`    | fallback                 |
| auditoria          | `/dashboard/auditoria/eventos`                | `VisaoGeralPage`    | fallback                 |
| documentos         | `/dashboard/documentos/pastas`                | `DocumentosPage`    | fallback                 |
| documentos         | `/dashboard/documentos/compartilhados`        | `DocumentosPage`    | fallback                 |
| contratos          | `/dashboard/contratos/modelos`                | `ContratosPage`     | fallback                 |
| termos             | `/dashboard/termos/privacidade`               | `TermosPage`        | fallback                 |
| integracoes        | `/dashboard/integracoes/supabase`             | `IntegracoesPage`   | fallback                 |
| integracoes        | `/dashboard/integracoes/n8n`                  | `IntegracoesPage`   | fallback                 |
| integracoes        | `/dashboard/integracoes/whatsapp`             | `IntegracoesPage`   | fallback                 |
| integracoes        | `/dashboard/integracoes/email`                | `IntegracoesPage`   | fallback                 |
| configuracoes-saas | `/dashboard/configuracoes/modulos`            | `ConfiguracoesPage` | fallback                 |
| minha-conta        | `/dashboard/configuracoes/conta/notificacoes` | `ConfiguracoesPage` | fallback                 |
| seguranca-conta    | `/dashboard/configuracoes/seguranca/sessoes`  | `SegurancaPage`     | fallback                 |
| ia                 | `/dashboard/ia/assistente`                    | sem página          | sem página               |
| ia                 | `/dashboard/ia/automacoes`                    | sem página          | sem página               |
| ia                 | `/dashboard/ia/conversas`                     | sem página          | sem página               |
| ia                 | `/dashboard/ia/integracoes`                   | `IntegracoesPage`   | fallback                 |

## Permissões no banco sem módulo/feature no ModuleRegistry

| Permission                            | Resource                     | Action           |
| ------------------------------------- | ---------------------------- | ---------------- |
| `tenants.create`                      | tenants                      | create           |
| `tenants.update`                      | tenants                      | update           |
| `tenants.delete`                      | tenants                      | delete           |
| `tenants.activate`                    | tenants                      | activate         |
| `people.create`                       | people                       | create           |
| `people.update`                       | people                       | update           |
| `people.delete`                       | people                       | delete           |
| `people.disable`                      | people                       | disable          |
| `people.export`                       | people                       | export           |
| `roles.create`                        | roles                        | create           |
| `roles.update`                        | roles                        | update           |
| `roles.delete`                        | roles                        | delete           |
| `roles.read`                          | roles                        | read             |
| `companies.create`                    | companies                    | create           |
| `companies.read`                      | companies                    | read             |
| `companies.update`                    | companies                    | update           |
| `companies.delete`                    | companies                    | delete           |
| `companies.convert`                   | companies                    | convert          |
| `products.create`                     | products                     | create           |
| `products.read`                       | products                     | read             |
| `products.update`                     | products                     | update           |
| `products.delete`                     | products                     | delete           |
| `stock_movements.create`              | stock_movements              | create           |
| `stock_movements.read`                | stock_movements              | read             |
| `stock_movements.export`              | stock_movements              | export           |
| `purchase_orders.create`              | purchase_orders              | create           |
| `purchase_orders.read`                | purchase_orders              | read             |
| `purchase_orders.update`              | purchase_orders              | update           |
| `purchase_orders.confirm`             | purchase_orders              | confirm          |
| `purchase_receipts.create`            | purchase_receipts            | create           |
| `purchase_receipts.read`              | purchase_receipts            | read             |
| `purchase_receipts.confirm`           | purchase_receipts            | confirm          |
| `service_orders.create`               | service_orders               | create           |
| `service_orders.read`                 | service_orders               | read             |
| `service_orders.update`               | service_orders               | update           |
| `service_orders.complete`             | service_orders               | complete         |
| `service_orders.cancel`               | service_orders               | cancel           |
| `contracts.create`                    | contracts                    | create           |
| `contracts.read`                      | contracts                    | read             |
| `contracts.update`                    | contracts                    | update           |
| `contracts.renew`                     | contracts                    | renew            |
| `contracts.delete`                    | contracts                    | delete           |
| `contracts.export`                    | contracts                    | export           |
| `tasks.create`                        | tasks                        | create           |
| `tasks.read`                          | tasks                        | read             |
| `tasks.update`                        | tasks                        | update           |
| `tasks.assign`                        | tasks                        | assign           |
| `support_tickets.create`              | support_tickets              | create           |
| `support_tickets.read`                | support_tickets              | read             |
| `support_tickets.update`              | support_tickets              | update           |
| `support_tickets.resolve`             | support_tickets              | resolve          |
| `support_tickets.close`               | support_tickets              | close            |
| `chat.create`                         | chat                         | create           |
| `chat.read`                           | chat                         | read             |
| `chat.handoff`                        | chat                         | handoff          |
| `notifications.create`                | notifications                | create           |
| `notifications.read`                  | notifications                | read             |
| `files.upload`                        | files                        | upload           |
| `files.read`                          | files                        | read             |
| `files.delete`                        | files                        | delete           |
| `files.create`                        | files                        | create           |
| `files.update`                        | files                        | update           |
| `documents.create`                    | documents                    | create           |
| `documents.read`                      | documents                    | read             |
| `documents.version`                   | documents                    | version          |
| `documents.publish`                   | documents                    | publish          |
| `documents.update`                    | documents                    | update           |
| `audit_logs.read`                     | audit_logs                   | read             |
| `security_events.read`                | security_events              | read             |
| `security_events.export`              | security_events              | export           |
| `lgpd.read`                           | lgpd                         | read             |
| `lgpd.manage_consent`                 | lgpd                         | manage_consent   |
| `lgpd.manage_retention`               | lgpd                         | manage_retention |
| `reports.read`                        | reports                      | read             |
| `reports.generate`                    | reports                      | generate         |
| `reports.export`                      | reports                      | export           |
| `dashboard.read`                      | dashboard                    | read             |
| `jobs.close`                          | jobs                         | close            |
| `jobs.archive`                        | jobs                         | archive          |
| `jobs.publish`                        | jobs                         | publish          |
| `jobs.export`                         | jobs                         | export           |
| `candidates.delete`                   | candidates                   | delete           |
| `candidates.export`                   | candidates                   | export           |
| `candidates.documents.read`           | candidates.documents         | read             |
| `candidates.documents.manage`         | candidates.documents         | manage           |
| `candidates.profile.read`             | candidates.profile           | read             |
| `recruitment.read`                    | recruitment                  | read             |
| `recruitment.create`                  | recruitment                  | create           |
| `recruitment.update`                  | recruitment                  | update           |
| `recruitment.delete`                  | recruitment                  | delete           |
| `recruitment.advance`                 | recruitment                  | advance          |
| `recruitment.reject`                  | recruitment                  | reject           |
| `recruitment.close`                   | recruitment                  | close            |
| `recruitment.stage.manage`            | recruitment.stage            | manage           |
| `applications.read`                   | applications                 | read             |
| `applications.create`                 | applications                 | create           |
| `applications.update`                 | applications                 | update           |
| `applications.advance`                | applications                 | advance          |
| `applications.reject`                 | applications                 | reject           |
| `applications.approve`                | applications                 | approve          |
| `applications.interview`              | applications                 | interview        |
| `applications.history.read`           | applications.history         | read             |
| `talent_pool.read`                    | talent_pool                  | read             |
| `talent_pool.manage`                  | talent_pool                  | manage           |
| `talent_pool.match`                   | talent_pool                  | match            |
| `recruitment_demands.read`            | recruitment_demands          | read             |
| `recruitment_demands.create`          | recruitment_demands          | create           |
| `recruitment_demands.update`          | recruitment_demands          | update           |
| `recruitment_demands.delete`          | recruitment_demands          | delete           |
| `ai.configure`                        | ai                           | configure        |
| `ai.test`                             | ai                           | test             |
| `audit.export`                        | audit                        | export           |
| `audit.filter`                        | audit                        | filter           |
| `audit.read`                          | audit                        | read             |
| `auth.change_password`                | auth                         | change_password  |
| `auth.revoke_session`                 | auth                         | revoke_session   |
| `automations.create`                  | automations                  | create           |
| `automations.toggle`                  | automations                  | toggle           |
| `automations.update`                  | automations                  | update           |
| `billing.cancel`                      | billing                      | cancel           |
| `billing.create`                      | billing                      | create           |
| `billing.export`                      | billing                      | export           |
| `billing.read`                        | billing                      | read             |
| `billing.update`                      | billing                      | update           |
| `integrations.delete`                 | integrations                 | delete           |
| `integrations.test`                   | integrations                 | test             |
| `integrations.create`                 | integrations                 | create           |
| `integrations.manage`                 | integrations                 | manage           |
| `integrations.update`                 | integrations                 | update           |
| `finance.approve`                     | finance                      | approve          |
| `finance.create`                      | finance                      | create           |
| `finance.delete`                      | finance                      | delete           |
| `finance.forecast`                    | finance                      | forecast         |
| `finance.reconcile`                   | finance                      | reconcile        |
| `finance.update`                      | finance                      | update           |
| `finance.export`                      | finance                      | export           |
| `finance.read`                        | finance                      | read             |
| `finance.reject`                      | finance                      | reject           |
| `finance.dashboard.read`              | finance.dashboard            | read             |
| `finance.accounts_payable.create`     | finance.accounts_payable     | create           |
| `finance.accounts_payable.delete`     | finance.accounts_payable     | delete           |
| `finance.accounts_payable.read`       | finance.accounts_payable     | read             |
| `finance.accounts_payable.update`     | finance.accounts_payable     | update           |
| `finance.accounts_receivable.create`  | finance.accounts_receivable  | create           |
| `finance.accounts_receivable.delete`  | finance.accounts_receivable  | delete           |
| `finance.accounts_receivable.read`    | finance.accounts_receivable  | read             |
| `finance.accounts_receivable.update`  | finance.accounts_receivable  | update           |
| `finance.billing.cancel`              | finance.billing              | cancel           |
| `finance.billing.create`              | finance.billing              | create           |
| `finance.billing.read`                | finance.billing              | read             |
| `finance.billing.update`              | finance.billing              | update           |
| `finance.cashflow.read`               | finance.cashflow             | read             |
| `finance.collections.manage`          | finance.collections          | manage           |
| `finance.reports.export`              | finance.reports              | export           |
| `finance.reports.read`                | finance.reports              | read             |
| `finance.suppliers.read`              | finance.suppliers            | read             |
| `fiscal.dashboard.read`               | fiscal.dashboard             | read             |
| `fiscal.invoices.issue`               | fiscal.invoices              | issue            |
| `fiscal.invoices.read`                | fiscal.invoices              | read             |
| `fiscal.invoices.cancel`              | fiscal.invoices              | cancel           |
| `fiscal.invoices.void`                | fiscal.invoices              | void             |
| `fiscal.reports.export`               | fiscal.reports               | export           |
| `fiscal.reports.read`                 | fiscal.reports               | read             |
| `fiscal.taxes.read`                   | fiscal.taxes                 | read             |
| `accounting.chart_of_accounts.create` | accounting.chart_of_accounts | create           |
| `accounting.chart_of_accounts.delete` | accounting.chart_of_accounts | delete           |
| `accounting.chart_of_accounts.read`   | accounting.chart_of_accounts | read             |
| `accounting.chart_of_accounts.update` | accounting.chart_of_accounts | update           |
| `accounting.dashboard.read`           | accounting.dashboard         | read             |
| `accounting.entries.create`           | accounting.entries           | create           |
| `accounting.entries.delete`           | accounting.entries           | delete           |
| `accounting.entries.read`             | accounting.entries           | read             |
| `accounting.entries.update`           | accounting.entries           | update           |
| `accounting.reconciliation.read`      | accounting.reconciliation    | read             |
| `accounting.reports.export`           | accounting.reports           | export           |
| `accounting.reports.read`             | accounting.reports           | read             |
| `accounting.trial_balance.read`       | accounting.trial_balance     | read             |
| `domain_events.read`                  | domain_events                | read             |
| `tenant.update`                       | tenant                       | update           |
| `tenant.manage`                       | tenant                       | manage           |
| `permissions.create`                  | permissions                  | create           |
| `permissions.read`                    | permissions                  | read             |
| `permissions.update`                  | permissions                  | update           |
| `permissions.delete`                  | permissions                  | delete           |

## O que existe no frontend mas não possui permissão no banco

| Permission REQ         | Módulo             | Feature                | Observação                                                     |
| ---------------------- | ------------------ | ---------------------- | -------------------------------------------------------------- |
| `contracts.read`       | contratos          | listar                 | permission não existe no banco                                 |
| `finance.read`         | assinaturas        | planos                 | permission não existe no banco (usa `finance.dashboard.read`)  |
| `finance.read`         | financeiro         | conciliacao            | permission não existe no banco                                 |
| `finance.read`         | financeiro         | bancos                 | permission não existe no banco                                 |
| `finance.read`         | financeiro         | centro-custos          | permission não existe no banco                                 |
| `service_orders.read`  | servicos           | catalogo               | permission não existe no banco                                 |
| `support_tickets.read` | suporte            | chamados               | permission não existe no banco                                 |
| `support_tickets.read` | suporte            | faq                    | permission não existe no banco                                 |
| `support_tickets.read` | suporte            | feedback               | permission não existe no banco                                 |
| `support_tickets.read` | suporte            | solicitacoes           | permission não existe no banco                                 |
| `support_tickets.read` | servicos           | chamados               | permission não existe no banco                                 |
| `reports.read`         | relatorios         | relatorios-rh          | permission não existe no banco                                 |
| `reports.read`         | relatorios         | relatorios-financeiros | permission não existe no banco                                 |
| `reports.read`         | relatorios         | relatorios-gestao      | permission não existe no banco                                 |
| `reports.read`         | rh                 | relatorios-rh          | permission não existe no banco                                 |
| `reports.read`         | gestao             | relatorios-gestao      | permission não existe no banco                                 |
| `reports.read`         | financeiro         | relatorios-financeiros | permission não existe no banco                                 |
| `domain_events.read`   | rh                 | relatorios-rh          | permission não existe no banco                                 |
| `domain_events.read`   | gestao             | indicadores            | permission não existe no banco                                 |
| `domain_events.read`   | gestao             | relatorios-gestao      | permission não existe no banco                                 |
| `integrations.manage`  | ia                 | integracoes-ia         | permission existe, mas módulo IA tem `requiredPermissions: []` |
| `tenant.manage`        | onboarding         | configuracao           | permission existe, mas módulo onboarding usa `tenants.read`    |
| `tenant.manage`        | configuracoes-saas | geral                  | permission existe                                              |
| `audit.read`           | auditoria          | logs                   | permission existe                                              |
| `security_events.read` | auditoria          | eventos                | permission existe                                              |
| `files.read`           | documentos         | listar                 | permission existe                                              |
| `files.read`           | documentos         | pastas                 | permission existe                                              |
| `files.read`           | documentos         | compartilhados         | permission existe                                              |
| `people.read`          | rh                 | funcionarios           | permission existe                                              |
| `people.read`          | rh                 | documentos-rh          | permission existe                                              |
| `people.read`          | usuarios           | listar                 | permission existe                                              |
| `people.read`          | gestao             | equipes                | permission existe                                              |
| `companies.read`       | clientes           | leads                  | permission existe                                              |
| `companies.read`       | clientes           | prospects              | permission existe                                              |
| `companies.read`       | clientes           | empresas               | permission existe                                              |
| `companies.read`       | clientes           | pipeline               | permission existe                                              |
| `companies.read`       | clientes           | clientes-ativos        | permission existe                                              |
| `companies.read`       | gestao             | empresas               | permission existe                                              |
| `companies.read`       | gestao             | contratos-gestao       | permission existe                                              |
