# Portal Navigation Matrix

Visão estática de rotas, navegação, Sidebar, Header e duplicações no frontend.

## Rotas públicas

| Rota                      | Página              | Tipo    |
| ------------------------- | ------------------- | ------- |
| `/`                       | `Home`              | pública |
| `/vagas`                  | `Vagas`             | pública |
| `/vagas/:slug`            | `VagaDetalhe`       | pública |
| `/empresas`               | `Empresas`          | pública |
| `/empresas/divulgar-vaga` | `DivulgarVaga`      | pública |
| `/candidatos`             | `Candidatos`        | pública |
| `/servicos`               | `Servicos`          | pública |
| `/servicos/:slug`         | `ServicoDetalhe`    | pública |
| `/clientes`               | `Clientes`          | pública |
| `/parceiros`              | `Parceiros`         | pública |
| `/fornecedores`           | `Fornecedores`      | pública |
| `/trabalhe-conosco`       | `TrabalheConosco`   | pública |
| `/processo-seletivo`      | `ProcessoSeletivo`  | pública |
| `/sobre`                  | `Sobre`             | pública |
| `/blog`                   | `Blog`              | pública |
| `/blog/:slug`             | `Blog`              | pública |
| `/suporte`                | `Suporte`           | pública |
| `/faq`                    | `FAQ`               | pública |
| `/contato`                | `Contato`           | pública |
| `/privacidade`            | `Privacidade`       | pública |
| `/termos`                 | `Termos`            | pública |
| `/login`                  | `Login`             | pública |
| `/cadastro`               | `Cadastro`          | pública |
| `/recuperar-senha`        | `RecuperarSenha`    | pública |
| `/cadastro/candidato`     | `CadastroCandidato` | pública |
| `/cadastro/empresa`       | `CadastroEmpresa`   | pública |

## Rotas protegidas do dashboard

| Rota                                          | Página                         | ModuleRegistry          | Permission REQ                          | Permission no banco | Status        |
| --------------------------------------------- | ------------------------------ | ----------------------- | --------------------------------------- | ------------------- | ------------- |
| `/dashboard`                                  | `DashboardHome`                | `inicio`                | `finance.dashboard.read` (fallback)     | ✅                  | OK            |
| `/dashboard/tenants`                          | `TenantsPage`                  | `tenants`               | `tenants.read`                          | ✅                  | OK            |
| `/dashboard/tenants/configuracoes`            | `TenantsPage` (fallback)       | `tenants`               | `tenants.update`                        | ✅                  | OK            |
| `/dashboard/clientes`                         | `ClientesPage`                 | `clientes`              | `companies.read`                        | ✅                  | OK            |
| `/dashboard/clientes/leads`                   | `ClientesPage` (fallback)      | `clientes`              | `companies.read`                        | ✅                  | OK            |
| `/dashboard/clientes/prospects`               | `ClientesPage` (fallback)      | `clientes`              | `companies.read`                        | ✅                  | OK            |
| `/dashboard/clientes/pipeline`                | `ClientesPage` (fallback)      | `clientes`              | `companies.read`                        | ✅                  | OK            |
| `/dashboard/clientes/ativos`                  | `ClientesPage` (fallback)      | `clientes`              | `companies.read`                        | ✅                  | OK            |
| `/dashboard/empresas`                         | `EmpresasPage`                 | `clientes/gestao`       | `companies.read`                        | ✅                  | OK            |
| `/dashboard/onboarding`                       | `OnboardingPage`               | `onboarding`            | `tenants.read`                          | ✅                  | OK            |
| `/dashboard/onboarding/configuracao`          | `OnboardingPage` (fallback)    | `onboarding`            | `tenant.manage`                         | ✅                  | OK            |
| `/dashboard/assinaturas`                      | `AssinaturasPage`              | `assinaturas`           | `finance.read`                          | ❌                  | GAP           |
| `/dashboard/assinaturas/renovacoes`           | `AssinaturasPage` (fallback)   | `assinaturas`           | `finance.read`                          | ❌                  | GAP           |
| `/dashboard/gestao-saas`                      | `GestaoSaaSPage`               | `gestao-saas`           | `domain_events.read`                    | ✅                  | OK            |
| `/dashboard/gestao-saas/mrr`                  | `GestaoSaaSPage` (fallback)    | `gestao-saas`           | `finance.read`                          | ❌                  | GAP           |
| `/dashboard/gestao-saas/uso`                  | `GestaoSaaSPage` (fallback)    | `gestao-saas`           | `domain_events.read`                    | ✅                  | OK            |
| `/dashboard/gestao-saas/crescimento`          | `GestaoSaaSPage` (fallback)    | `gestao-saas`           | `domain_events.read`                    | ✅                  | OK            |
| `/dashboard/usuarios`                         | `UsuariosPage`                 | `usuarios`              | `people.read`                           | ✅                  | OK            |
| `/dashboard/roles-permissoes`                 | `ConfiguracoesPage`            | `roles-permissoes`      | `roles.read`                            | ✅                  | OK            |
| `/dashboard/auditoria`                        | `VisaoGeralPage` (fallback)    | `auditoria`             | `audit.read`                            | ✅                  | OK            |
| `/dashboard/auditoria/eventos`                | `VisaoGeralPage` (fallback)    | `auditoria`             | `security_events.read`                  | ✅                  | OK            |
| `/dashboard/documentos`                       | `DocumentosPage`               | `documentos`            | `files.read`                            | ✅                  | OK            |
| `/dashboard/documentos/pastas`                | `DocumentosPage` (fallback)    | `documentos`            | `files.read`                            | ✅                  | OK            |
| `/dashboard/documentos/compartilhados`        | `DocumentosPage` (fallback)    | `documentos`            | `files.read`                            | ✅                  | OK            |
| `/dashboard/contratos`                        | `ContratosPage`                | `contratos`             | `contracts.read`                        | ❌                  | GAP           |
| `/dashboard/contratos/modelos`                | `ContratosPage` (fallback)     | `contratos`             | `contracts.read`                        | ❌                  | GAP           |
| `/dashboard/termos`                           | `TermosPage`                   | `termos`                | `documents.read`                        | ✅                  | OK            |
| `/dashboard/termos/privacidade`               | `TermosPage` (fallback)        | `termos`                | `documents.read`                        | ✅                  | OK            |
| `/dashboard/lgpd`                             | `LgpdPage`                     | -                       | -                                       | -                   | sem módulo    |
| `/dashboard/seguranca`                        | `SegurancaPage`                | -                       | -                                       | -                   | sem módulo    |
| `/dashboard/monitoramento`                    | `MonitoramentoPage`            | -                       | -                                       | -                   | sem módulo    |
| `/dashboard/integracoes`                      | `IntegracoesPage`              | `integracoes`           | `integrations.manage`                   | ✅                  | OK            |
| `/dashboard/integracoes/supabase`             | `IntegracoesPage` (fallback)   | `integracoes`           | `integrations.manage`                   | ✅                  | OK            |
| `/dashboard/integracoes/n8n`                  | `IntegracoesPage` (fallback)   | `integracoes`           | `integrations.manage`                   | ✅                  | OK            |
| `/dashboard/integracoes/whatsapp`             | `IntegracoesPage` (fallback)   | `integracoes`           | `integrations.manage`                   | ✅                  | OK            |
| `/dashboard/integracoes/email`                | `IntegracoesPage` (fallback)   | `integracoes`           | `integrations.manage`                   | ✅                  | OK            |
| `/dashboard/fiscal`                           | `FiscalPage`                   | `fiscal`                | `fiscal.dashboard.read`                 | ✅                  | OK            |
| `/dashboard/fiscal/notas-fiscais`             | `FiscalPage` (fallback)        | `fiscal`                | `fiscal.invoices.read`                  | ✅                  | OK            |
| `/dashboard/fiscal/notas-recebidas`           | `FiscalPage` (fallback)        | `fiscal`                | `fiscal.invoices.read`                  | ✅                  | OK            |
| `/dashboard/fiscal/retencoes`                 | `FiscalPage` (fallback)        | `fiscal`                | `fiscal.taxes.read`                     | ✅                  | OK            |
| `/dashboard/fiscal/relatorios`                | `FiscalPage` (fallback)        | `fiscal`                | `fiscal.reports.read`                   | ✅                  | OK            |
| `/dashboard/contabilidade`                    | `ContabilidadePage`            | `contabilidade`         | `accounting.dashboard.read`             | ✅                  | OK            |
| `/dashboard/contabilidade/plano-contas`       | `ContabilidadePage` (fallback) | `contabilidade`         | `accounting.chart_of_accounts.read`     | ✅                  | OK            |
| `/dashboard/contabilidade/lancamentos`        | `ContabilidadePage` (fallback) | `contabilidade`         | `accounting.entries.read`               | ✅                  | OK            |
| `/dashboard/contabilidade/balancetes`         | `ContabilidadePage` (fallback) | `contabilidade`         | `accounting.trial_balance.read`         | ✅                  | OK            |
| `/dashboard/contabilidade/fechamento`         | `ContabilidadePage` (fallback) | `contabilidade`         | `accounting.reconciliation.read`        | ✅                  | OK            |
| `/dashboard/contabilidade/relatorios`         | `ContabilidadePage` (fallback) | `contabilidade`         | `accounting.reports.read`               | ✅                  | OK            |
| `/dashboard/rh`                               | `VisaoGeralPage`               | `rh`                    | `people.read`                           | ✅                  | OK            |
| `/dashboard/rh/funcionarios`                  | `VisaoGeralPage` (fallback)    | `rh`                    | `people.read`                           | ✅                  | OK            |
| `/dashboard/rh/documentos`                    | `VisaoGeralPage` (fallback)    | `rh`                    | `people.read`                           | ✅                  | OK            |
| `/dashboard/relatorios`                       | `RelatoriosPage`               | `relatorios`            | `reports.read`                          | ❌                  | GAP           |
| `/dashboard/recrutamento`                     | `VagasPage`                    | `recrutamento`          | `jobs.read`                             | ✅                  | OK            |
| `/dashboard/vagas`                            | `VagasPage`                    | `recrutamento`          | `jobs.read`                             | ✅                  | OK            |
| `/dashboard/candidatos`                       | `CandidatosPage`               | `recrutamento`          | `candidates.read`                       | ✅                  | OK            |
| `/dashboard/candidaturas`                     | `CandidatosPage` (fallback)    | `recrutamento`          | `applications.read`                     | ✅                  | OK            |
| `/dashboard/processos-seletivos`              | `ProcessosSeletivosPage`       | `recrutamento`          | `jobs.read`                             | ✅                  | OK            |
| `/dashboard/gestao`                           | `EmpresasPage`                 | `gestao`                | `companies.read`                        | ✅                  | OK            |
| `/dashboard/gestao/indicadores`               | `EmpresasPage` (fallback)      | `gestao`                | `domain_events.read`                    | ❌                  | GAP           |
| `/dashboard/gestao/contratos`                 | `EmpresasPage` (fallback)      | `gestao`                | `companies.read`                        | ✅                  | OK            |
| `/dashboard/gestao/equipes`                   | `EmpresasPage` (fallback)      | `gestao`                | `people.read`                           | ✅                  | OK            |
| `/dashboard/gestao/relatorios`                | `RelatoriosPage` (fallback)    | `gestao`                | `domain_events.read`                    | ❌                  | GAP           |
| `/dashboard/servicos`                         | `CatalogoPage`                 | `servicos`              | `service_orders.read`                   | ❌                  | GAP           |
| `/dashboard/servicos/ordens`                  | `ServicosPage`                 | `servicos`              | `service_orders.read`                   | ❌                  | GAP           |
| `/dashboard/servicos/chamados`                | `SuportePage`                  | `servicos`              | `support_tickets.read`                  | ❌                  | GAP           |
| `/dashboard/estoque`                          | `EstoquePage`                  | `estoque`               | `stock_movements.read`                  | ✅                  | OK            |
| `/dashboard/estoque/produtos`                 | `EstoquePage` (fallback)       | `estoque`               | `products.read`                         | ✅                  | OK            |
| `/dashboard/estoque/movimentacoes`            | `EstoquePage` (fallback)       | `estoque`               | `stock_movements.read`                  | ✅                  | OK            |
| `/dashboard/suporte`                          | `SuportePage`                  | `suporte`               | `support_tickets.read`                  | ❌                  | GAP           |
| `/dashboard/suporte/chamados`                 | `SuportePage` (fallback)       | `suporte`               | `support_tickets.read`                  | ❌                  | GAP           |
| `/dashboard/suporte/faq`                      | `SuportePage` (fallback)       | `suporte`               | `support_tickets.read`                  | ❌                  | GAP           |
| `/dashboard/suporte/feedback`                 | `SuportePage` (fallback)       | `suporte`               | `support_tickets.read`                  | ❌                  | GAP           |
| `/dashboard/suporte/solicitacoes`             | `SuportePage` (fallback)       | `suporte`               | `support_tickets.read`                  | ❌                  | GAP           |
| `/dashboard/financeiro`                       | `FinanceiroPage`               | `financeiro`            | `finance.dashboard.read`                | ✅                  | OK            |
| `/dashboard/financeiro/contas-pagar`          | `FinanceiroPage` (fallback)    | `financeiro`            | `finance.accounts_payable.read`         | ✅                  | OK            |
| `/dashboard/financeiro/contas-receber`        | `FinanceiroPage` (fallback)    | `financeiro`            | `finance.accounts_receivable.read`      | ✅                  | OK            |
| `/dashboard/financeiro/fluxo-caixa`           | `FinanceiroPage` (fallback)    | `financeiro`            | `finance.cashflow.read`                 | ✅                  | OK            |
| `/dashboard/financeiro/faturamento`           | `FinanceiroPage` (fallback)    | `financeiro`            | `finance.billing.read`                  | ✅                  | OK            |
| `/dashboard/financeiro/conciliacao`           | `FinanceiroPage` (fallback)    | `financeiro`            | `finance.read`                          | ❌                  | GAP           |
| `/dashboard/financeiro/bancos`                | `FinanceiroPage` (fallback)    | `financeiro`            | `finance.read`                          | ❌                  | GAP           |
| `/dashboard/financeiro/centro-custos`         | `FinanceiroPage` (fallback)    | `financeiro`            | `finance.read`                          | ❌                  | GAP           |
| `/dashboard/fornecedores`                     | `FornecedoresPage`             | `financeiro`            | `finance.suppliers.read`                | ✅                  | OK            |
| `/dashboard/relatorios`                       | `RelatoriosPage`               | `financeiro/relatorios` | `finance.reports.read` / `reports.read` | ❌                  | GAP           |
| `/dashboard/ia`                               | sem página                     | `ia`                    | -                                       | -                   | sem página    |
| `/dashboard/ia/assistente`                    | sem página                     | `ia`                    | -                                       | -                   | sem página    |
| `/dashboard/ia/automacoes`                    | sem página                     | `ia`                    | -                                       | -                   | sem página    |
| `/dashboard/ia/conversas`                     | sem página                     | `ia`                    | -                                       | -                   | sem página    |
| `/dashboard/ia/integracoes`                   | `IntegracoesPage` (fallback)   | `ia`                    | `integrations.manage`                   | ✅                  | OK            |
| `/dashboard/configuracoes`                    | `ConfiguracoesPage`            | `configuracoes-saas`    | `tenant.manage`                         | ✅                  | OK            |
| `/dashboard/configuracoes/modulos`            | `ConfiguracoesPage` (fallback) | `configuracoes-saas`    | `tenant.manage`                         | ✅                  | OK            |
| `/dashboard/configuracoes/conta`              | `ConfiguracoesPage` (fallback) | `minha-conta`           | -                                       | -                   | sem permissão |
| `/dashboard/configuracoes/conta/notificacoes` | `ConfiguracoesPage` (fallback) | `minha-conta`           | -                                       | -                   | sem permissão |
| `/dashboard/configuracoes/seguranca`          | `SegurancaPage`                | `seguranca-conta`       | -                                       | -                   | sem permissão |
| `/dashboard/configuracoes/seguranca/sessoes`  | `SegurancaPage` (fallback)     | `seguranca-conta`       | -                                       | -                   | sem permissão |
| `/dashboard/rbac-auditoria`                   | `RbacAuditPage`                | `auditoria`             | `audit.read`                            | ✅                  | OK            |
| `/dashboard/*`                                | `DashboardRouteNotFound`       | -                       | -                                       | -                   | catch-all     |

## Sidebar atual

- Arquivo: `src/components/portal/PortalSidebar.tsx`
- Estado atual: parcialmente quebrada porque `getAvailableFeatures([], module, scope)` recebe array vazio de permissões
- Comportamento esperado: derivar módulos/features de `AccountContext` → `ModuleRegistry` → `AuthContext.permissions`
- Comportamento real: usa `availableModules` e `modulesByCategory` de `AccountContext`, mas chama `getAvailableFeatures([], module, scope)` com `[]` dentro do `PortalSidebar` em vez de usar o array de permissões real
- Categorias exibidas: INÍCIO, PLATAFORMA, OPERAÇÃO, IA & AUTOMAÇÃO, SEGURANÇA, DOCUMENTOS, CONTA

## Header atual

- Arquivo: `src/components/portal/PortalHeader.tsx`
- Estado atual: bugado porque referencia `activeRole` que não existe em `AccountContext`
- Usa `person.full_name` para exibir nome
- Exibe: `Bom dia, {firstName}` e `{tenantLabel || roleLabel}`
- Menu dropdown: Perfil, Segurança, Trocar conta, Tema, Sair

## Dashboard atual

- Arquivo: `src/pages/dashboard/DashboardHome.tsx`
- Estado atual: usa `getAvailableModules([], scope)` com array vazio, ignorando permissões reais
- Seções: Indicadores (KPIs), Visão geral (gráficos placeholder), Acessar seus módulos (cards)
- KPIs: 4 fixos para plataforma, 4 para tenant, 4 para financeiro
- "Acessar seus módulos": lista `availableModules` do `AccountContext`, mas `availableModules` vem de `getAvailableModules(permissions, scope)` que está correto; porém `availableModuleIds` no `DashboardHome` é calculado com `getAvailableModules([], scope)` quebra a filtragem

## Componentes duplicados

| Componente legado    | Componente novo                     | Arquivo legado                                    | Arquivo novo                                | Status                    |
| -------------------- | ----------------------------------- | ------------------------------------------------- | ------------------------------------------- | ------------------------- |
| `DashboardSidebar`   | `PortalSidebar`                     | `src/components/dashboard/DashboardSidebar.tsx`   | `src/components/portal/PortalSidebar.tsx`   | legado não usado          |
| `DashboardHeader`    | `PortalHeader`                      | `src/components/dashboard/DashboardHeader.tsx`    | `src/components/portal/PortalHeader.tsx`    | legado não usado          |
| `DashboardRouter`    | `App.tsx` (rotas dinâmicas)         | `src/components/dashboard/DashboardRouter.tsx`    | `src/App.tsx`                               | legado parcialmente usado |
| `Breadcrumb`         | `ModuleWorkspace`                   | `src/components/dashboard/Breadcrumb.tsx`         | `src/components/portal/ModuleWorkspace.tsx` | legado não usado          |
| `DashboardShell`     | `AppShell`                          | `src/components/dashboard/DashboardShell.tsx`     | `src/components/layout/AppShell.tsx`        | legado não usado          |
| `NavigationResolver` | `ModuleRegistry` + `AccountContext` | `src/components/dashboard/NavigationResolver.tsx` | `src/components/portal/ModuleRegistry.tsx`  | legado não usado          |

## Rotas duplicadas/legadas

| Rota legada                   | Arquivo legado        | Rota nova                               | Arquivo novo | Status    |
| ----------------------------- | --------------------- | --------------------------------------- | ------------ | --------- |
| `/dashboard`                  | `DashboardRouter.tsx` | `/dashboard`                            | `App.tsx`    | duplicada |
| `/dashboard/tenants`          | `DashboardRouter.tsx` | `/dashboard/tenants`                    | `App.tsx`    | duplicada |
| `/dashboard/usuarios`         | `DashboardRouter.tsx` | `/dashboard/usuarios`                   | `App.tsx`    | duplicada |
| `/dashboard/roles-permissoes` | `DashboardRouter.tsx` | `/dashboard/roles-permissoes`           | `App.tsx`    | duplicada |
| `/dashboard/auditoria`        | `DashboardRouter.tsx` | `/dashboard/auditoria`                  | `App.tsx`    | duplicada |
| `/dashboard/documentos`       | `DashboardRouter.tsx` | `/dashboard/documentos`                 | `App.tsx`    | duplicada |
| `/dashboard/contratos`        | `DashboardRouter.tsx` | `/dashboard/contratos`                  | `App.tsx`    | duplicada |
| `/dashboard/termos`           | `DashboardRouter.tsx` | `/dashboard/termos`                     | `App.tsx`    | duplicada |
| `/dashboard/lgpd`             | `DashboardRouter.tsx` | `/dashboard/lgpd`                       | `App.tsx`    | duplicada |
| `/dashboard/seguranca`        | `DashboardRouter.tsx` | `/dashboard/seguranca`                  | `App.tsx`    | duplicada |
| `/dashboard/monitoramento`    | `DashboardRouter.tsx` | `/dashboard/monitoramento`              | `App.tsx`    | duplicada |
| `/dashboard/integracoes`      | `DashboardRouter.tsx` | `/dashboard/integracoes`                | `App.tsx`    | duplicada |
| `/dashboard/fiscal`           | `DashboardRouter.tsx` | `/dashboard/fiscal`                     | `App.tsx`    | duplicada |
| `/dashboard/contabilidade`    | `DashboardRouter.tsx` | `/dashboard/contabilidade`              | `App.tsx`    | duplicada |
| `/dashboard/recrutamento`     | `DashboardRouter.tsx` | `/dashboard/recrutamento`               | `App.tsx`    | duplicada |
| `/dashboard/financeiro`       | `DashboardRouter.tsx` | `/dashboard/financeiro`                 | `App.tsx`    | duplicada |
| `/dashboard/rh`               | `DashboardRouter.tsx` | `/dashboard/rh`                         | `App.tsx`    | duplicada |
| `/dashboard/gestao`           | `DashboardRouter.tsx` | `/dashboard/gestao`                     | `App.tsx`    | duplicada |
| `/dashboard/estoque`          | `DashboardRouter.tsx` | `/dashboard/estoque`                    | `App.tsx`    | duplicada |
| `/dashboard/servicos`         | `DashboardRouter.tsx` | `/dashboard/servicos`                   | `App.tsx`    | duplicada |
| `/dashboard/suporte`          | `DashboardRouter.tsx` | `/dashboard/suporte`                    | `App.tsx`    | duplicada |
| `/dashboard/relatorios`       | `DashboardRouter.tsx` | `/dashboard/relatorios`                 | `App.tsx`    | duplicada |
| `/dashboard/ia`               | `DashboardRouter.tsx` | `/dashboard/ia`                         | `App.tsx`    | duplicada |
| `/dashboard/configuracoes`    | `DashboardRouter.tsx` | `/dashboard/configuracoes`              | `App.tsx`    | duplicada |
| `/dashboard/preferencias`     | `DashboardRouter.tsx` | `/dashboard/configuracoes/preferencias` | `App.tsx`    | duplicada |
| `/dashboard/minha-conta`      | `DashboardRouter.tsx` | `/dashboard/configuracoes/conta`        | `App.tsx`    | duplicada |
| `/dashboard/seguranca-conta`  | `DashboardRouter.tsx` | `/dashboard/configuracoes/seguranca`    | `App.tsx`    | duplicada |

## Gaps de permissão

| Módulo/Feature                      | Permission REQ no frontend              | Existe no banco? | Ação necessária                   |
| ----------------------------------- | --------------------------------------- | ---------------- | --------------------------------- |
| `contratos`                         | `contracts.read`                        | ❌               | criar permissão ou remover módulo |
| `assinaturas`                       | `finance.read`                          | ❌               | criar permissão ou remover módulo |
| `gestao-saas/mrr`                   | `finance.read`                          | ❌               | criar permissão ou remover módulo |
| `servicos/catalogo`                 | `service_orders.read`                   | ❌               | criar permissão ou remover módulo |
| `servicos/ordens`                   | `service_orders.read`                   | ❌               | criar permissão ou remover módulo |
| `servicos/chamados`                 | `support_tickets.read`                  | ❌               | criar permissão ou remover módulo |
| `suporte/chamados`                  | `support_tickets.read`                  | ❌               | criar permissão ou remover módulo |
| `suporte/faq`                       | `support_tickets.read`                  | ❌               | criar permissão ou remover módulo |
| `suporte/feedback`                  | `support_tickets.read`                  | ❌               | criar permissão ou remover módulo |
| `suporte/solicitacoes`              | `support_tickets.read`                  | ❌               | criar permissão ou remover módulo |
| `relatorios/relatorios-rh`          | `reports.read`                          | ❌               | criar permissão ou remover módulo |
| `relatorios/relatorios-financeiros` | `reports.read`                          | ❌               | criar permissão ou remover módulo |
| `relatorios/relatorios-gestao`      | `reports.read`                          | ❌               | criar permissão ou remover módulo |
| `rh/relatorios-rh`                  | `reports.read` / `domain_events.read`   | ❌               | criar permissão ou remover módulo |
| `gestao/indicadores`                | `domain_events.read`                    | ❌               | criar permissão ou remover módulo |
| `gestao/relatorios`                 | `domain_events.read`                    | ❌               | criar permissão ou remover módulo |
| `financeiro/conciliacao`            | `finance.read`                          | ❌               | criar permissão ou remover módulo |
| `financeiro/bancos`                 | `finance.read`                          | ❌               | criar permissão ou remover módulo |
| `financeiro/centro-custos`          | `finance.read`                          | ❌               | criar permissão ou remover módulo |
| `financeiro/relatorios`             | `finance.reports.read` / `reports.read` | ❌               | criar permissão ou remover módulo |
