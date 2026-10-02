# ARQUITETURA-01F — Inventário e Reconciliação

> Gerado por varredura estática do working tree + leitura **read-only** do Supabase.
> Nenhum arquivo de código foi alterado. Nenhuma migration, nenhum RLS alterado.

- Frontend: `src/` · 478 arquivos
- Banco: `226` objetos · 233 funções · 600 policies
- Gerado em: 2026-09-30 16:42:37 UTC

## Artefatos

| Arquivo                   | Conteúdo                                                           |
| ------------------------- | ------------------------------------------------------------------ |
| `frontend-inventory.json` | papel, consumidores, alcançabilidade, tabelas, duplicações         |
| `supabase-inventory.json` | tabelas, views, colunas, FKs, policies, triggers, functions, enums |
| `module-map.json`         | 28 módulos do `PORTAL_MODULES` com features e rotas                |
| `route-map.json`          | rota → componente → arquivo → permissão                            |
| `dashboard-map.json`      | dashboards e suas tabelas                                          |
| `migration-map.json`      | arquivo → destino + ação                                           |

---

## FASE A — Inventário do frontend

| Papel          | Arquivos | Inalcançáveis |
| -------------- | -------: | ------------: |
| `page`         |      129 |            58 |
| `other`        |       82 |            39 |
| `repository`   |       63 |            15 |
| `type`         |       43 |            12 |
| `public-shell` |       25 |            14 |
| `hook`         |       23 |            18 |
| `shared-ui`    |       21 |             7 |
| `feature-cell` |       19 |            19 |
| `util`         |       17 |            10 |
| `portal-infra` |       15 |             2 |
| `service`      |       12 |            10 |
| `module-cell`  |       10 |             8 |
| `context`      |        9 |             2 |
| `shared-crud`  |        8 |             0 |
| `entry`        |        2 |             0 |

**264 alcançáveis · 214 inalcançáveis · 124 sem nenhum consumidor.**

Alcançável = alcançável por import a partir de `App.tsx`/`main.tsx`.

## FASE C — Reconciliação frontend ↔ banco

| Quadrante                                  | Total |
| ------------------------------------------ | ----: |
| Banco **e** frontend                       |    74 |
| Banco **sem** frontend                     |   151 |
| Frontend **sem** banco (contrato quebrado) |    12 |
| Páginas sem nenhum dado                    |    19 |

### 🔴 Contratos de dados quebrados

Objetos consultados pelo frontend que **não existem** em nenhum schema.
Confirmado em `pg_class` varrendo todos os schemas. Resultado em runtime: `PGRST205`.

| Objeto                  | Consumido por                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `accounting_entries`    | `App.tsx`, `main.tsx`, `ContabilidadePage.tsx`, `repositories/accounting.repository.ts`                                                                                                                                                                                                                                                                                                                                                               |
| `bank_accounts`         | `App.tsx`, `main.tsx`, `BancosPage.tsx`, `financeiro/Categorias.tsx`, `financeiro/CentrosCusto.tsx`, `financeiro/Conciliacao.tsx`, `financeiro/ContasFinanceiras.tsx`, `financeiro/NotasFiscais.tsx`, `financeiro/Parcelamentos.tsx`, `financeiro/Transacoes.tsx`, `FinanceiroPage.tsx`, `repositories/bank-account.repository.ts`, `repositories/finance.repository.ts`                                                                              |
| `candidate_preferences` | `App.tsx`, `contexts/CandidateContext.tsx`, `features/candidato/pages/Alertas.tsx`, `features/candidato/pages/CandidateMetroDashboard.tsx`, `features/candidato/pages/Candidaturas.tsx`, `features/candidato/pages/Curriculo.tsx`, `features/candidato/pages/Favoritas.tsx`, `features/candidato/pages/Perfil.tsx`, `features/candidato/pages/Vagas.tsx`, `main.tsx`, `CandidatoPreferencias.tsx`, `repositories/candidate-preferences.repository.ts` |
| `cash_flows`            | `App.tsx`, `main.tsx`, `financeiro/Categorias.tsx`, `financeiro/CentrosCusto.tsx`, `financeiro/Conciliacao.tsx`, `financeiro/ContasFinanceiras.tsx`, `financeiro/NotasFiscais.tsx`, `financeiro/Parcelamentos.tsx`, `financeiro/Transacoes.tsx`, `FinanceiroPage.tsx`, `FluxoDeCaixaPage.tsx`, `relatorios/RelatorioFinanceiroPage.tsx`, `Relatorios.tsx`, `repositories/cash-flow.repository.ts`, `repositories/finance.repository.ts`               |
| `chart_of_accounts`     | `App.tsx`, `main.tsx`, `ContabilidadePage.tsx`, `repositories/accounting.repository.ts`                                                                                                                                                                                                                                                                                                                                                               |
| `curriculos`            | `features/candidato/components/candidate/DocumentDialog.tsx`, `features/candidato/pages/Curriculo.tsx`, `modules/rh/index.ts`, `modules/rh/services/index.ts`, `pages/TrabalheConosco.tsx`, `services/candidates.ts`                                                                                                                                                                                                                                  |
| `epis`                  | `App.tsx`, `main.tsx`, `Almoxarifado.tsx`, `repositories/warehouse.repository.ts`                                                                                                                                                                                                                                                                                                                                                                     |
| `support_faqs`          | `App.tsx`, `main.tsx`, `Relatorios.tsx`, `Suporte.tsx`, `repositories/support.repository.ts`                                                                                                                                                                                                                                                                                                                                                          |
| `warehouse_custodies`   | `App.tsx`, `main.tsx`, `Almoxarifado.tsx`, `repositories/warehouse.repository.ts`                                                                                                                                                                                                                                                                                                                                                                     |
| `warehouse_entries`     | `App.tsx`, `main.tsx`, `Almoxarifado.tsx`, `repositories/warehouse.repository.ts`                                                                                                                                                                                                                                                                                                                                                                     |
| `warehouse_issues`      | `App.tsx`, `main.tsx`, `Almoxarifado.tsx`, `repositories/warehouse.repository.ts`                                                                                                                                                                                                                                                                                                                                                                     |
| `warehouse_returns`     | `App.tsx`, `main.tsx`, `Almoxarifado.tsx`, `repositories/warehouse.repository.ts`                                                                                                                                                                                                                                                                                                                                                                     |

## FASE E — Rotas

**89 rotas**: 62 explícitas + 27 launcher.

| Rota                                         | Componente                 | Permissão                        | Tipo      |
| -------------------------------------------- | -------------------------- | -------------------------------- | --------- |
| `/dashboard/almoxarifado`                    | Almoxarifado               | warehouse.dashboard.read         | explícita |
| `/dashboard/analitico`                       | VisaoGeral                 | domain_events.read               | explícita |
| `/dashboard/assinaturas`                     | AssinaturasPage            | —                                | explícita |
| `/dashboard/auditoria`                       | AuditoriaPage              | —                                | explícita |
| `/dashboard/banco-de-talentos`               | BancoDeTalentosPage        | candidates.read                  | explícita |
| `/dashboard/candidatos`                      | CandidatosPage             | candidates.read                  | explícita |
| `/dashboard/candidatos/:id`                  | CandidatoDetalhe           | candidates.read                  | explícita |
| `/dashboard/candidatos/documentos`           | CandidatoDocumentos        | candidates.read                  | explícita |
| `/dashboard/candidatos/experiencias`         | CandidatoExperiencias      | candidates.read                  | explícita |
| `/dashboard/candidatos/formacao`             | CandidatoFormacao          | candidates.read                  | explícita |
| `/dashboard/candidatos/habilidades`          | CandidatoHabilidades       | candidates.read                  | explícita |
| `/dashboard/candidatos/idiomas`              | CandidatoIdiomas           | candidates.read                  | explícita |
| `/dashboard/candidatos/preferencias`         | CandidatoPreferencias      | candidates.read                  | explícita |
| `/dashboard/candidatos/visualizacoes`        | CandidatoVisualizacoes     | candidates.read                  | explícita |
| `/dashboard/candidaturas`                    | CandidaturasPage           | applications.read                | explícita |
| `/dashboard/configuracoes/seguranca`         | SegurancaPage              | —                                | explícita |
| `/dashboard/configuracoes/seguranca/sessoes` | SessoesPage                | sessions.read                    | explícita |
| `/dashboard/contabilidade`                   | ContabilidadePage          | accounting.dashboard.read        | explícita |
| `/dashboard/crm`                             | ClientesPage               | —                                | explícita |
| `/dashboard/documentos-rh`                   | DocumentosRhPage           | employees.read                   | explícita |
| `/dashboard/empresas`                        | EmpresasPage               | companies.read                   | explícita |
| `/dashboard/estoque`                         | Estoque                    | stock.dashboard.read             | explícita |
| `/dashboard/etapas`                          | EtapasPage                 | recruitment.stage.manage         | explícita |
| `/dashboard/faturamento`                     | FaturamentoPage            | finance.read                     | explícita |
| `/dashboard/financeiro`                      | FinanceiroPage             | —                                | explícita |
| `/dashboard/financeiro/bancos`               | BancosPage                 | finance.read                     | explícita |
| `/dashboard/financeiro/centro-custos`        | CentroCustosPage           | finance.read                     | explícita |
| `/dashboard/financeiro/contas-pagar`         | FinanceiroPage             | finance.accounts_payable.read    | explícita |
| `/dashboard/financeiro/contas-receber`       | ContasReceberPage          | finance.accounts_receivable.read | explícita |
| `/dashboard/financeiro/fluxo-caixa`          | FluxoDeCaixaPage           | finance.cashflow.read            | explícita |
| `/dashboard/fiscal`                          | FiscalPage                 | fiscal.dashboard.read            | explícita |
| `/dashboard/funcionarios`                    | FuncionariosPage           | employees.read                   | explícita |
| `/dashboard/funcionarios/:id`                | FuncionarioDetalhe         | employees.read                   | explícita |
| `/dashboard/gestao-saas`                     | GestaoSaaSPage             | —                                | explícita |
| `/dashboard/global`                          | GlobalDashboardPage        | domain_events.read               | explícita |
| `/dashboard/ia`                              | IaPage                     | —                                | explícita |
| `/dashboard/integracoes`                     | IntegracoesPage            | —                                | explícita |
| `/dashboard/matches`                         | JobMatches                 | jobs.read                        | explícita |
| `/dashboard/notificacoes`                    | NotificationsPage          | notifications.read               | explícita |
| `/dashboard/onboarding`                      | OnboardingPage             | —                                | explícita |
| `/dashboard/processos-seletivos`             | ProcessosSeletivosPage     | recruitment.read                 | explícita |
| `/dashboard/processos-seletivos/:id`         | ApplicationDetailPage      | applications.read                | explícita |
| `/dashboard/rbac-auditoria`                  | RbacAuditPage              | audit.read                       | explícita |
| `/dashboard/relacionamentos`                 | CompanyRelationshipsPage   | companies.read                   | explícita |
| `/dashboard/relatorios`                      | RelatoriosPage             | reports.read                     | explícita |
| `/dashboard/relatorios/almoxarifado`         | RelatorioAlmoxarifadoPage  | reports.read                     | explícita |
| `/dashboard/relatorios/contabilidade`        | RelatorioContabilidadePage | reports.read                     | explícita |
| `/dashboard/relatorios/crm`                  | RelatorioCrmPage           | reports.read                     | explícita |
| `/dashboard/relatorios/estoque`              | RelatorioEstoquePage       | reports.read                     | explícita |
| `/dashboard/relatorios/faturamento`          | RelatorioFaturamentoPage   | reports.read                     | explícita |
| `/dashboard/relatorios/financeiro`           | RelatorioFinanceiroPage    | reports.read                     | explícita |
| `/dashboard/relatorios/fiscal`               | RelatorioFiscalPage        | reports.read                     | explícita |
| `/dashboard/relatorios/recrutamento`         | RelatorioRecrutamentoPage  | reports.read                     | explícita |
| `/dashboard/relatorios/rh`                   | RelatorioRhPage            | reports.read                     | explícita |
| `/dashboard/relatorios/servicos`             | RelatorioServicosPage      | reports.read                     | explícita |
| `/dashboard/relatorios/suporte`              | RelatorioSuportePage       | reports.read                     | explícita |
| `/dashboard/rh`                              | —                          | people.read                      | explícita |
| `/dashboard/roles-permissoes`                | RolesPermissoesPage        | —                                | explícita |
| `/dashboard/servicos`                        | Servicos                   | service_orders.dashboard.read    | explícita |
| `/dashboard/suporte`                         | Suporte                    | support.dashboard.read           | explícita |
| `/dashboard/tenants`                         | TenantsPage                | —                                | explícita |
| `/dashboard/vagas`                           | VagasPage                  | jobs.read                        | explícita |

## Duplicações — dois arquivos para o mesmo domínio

### `company` (3 cópias)

- `config/company.ts` — **alcançável**, 5 consumidor(es), 53 linhas
- `mock/company.ts` — inalcançável, 1 consumidor(es), 94 linhas
- `types/domain/company.ts` — **alcançável**, 10 consumidor(es), 59 linhas

### `services` (3 cópias)

- `constants/services.ts` — inalcançável, 1 consumidor(es), 17 linhas
- `mock/services.ts` — inalcançável, 0 consumidor(es), 125 linhas
- `services/mock/services.ts` — inalcançável, 3 consumidor(es), 639 linhas

### `Vagas` (3 cópias)

- `features/candidato/pages/Vagas.tsx` — inalcançável, 0 consumidor(es), 345 linhas
- `pages/dashboard/Vagas.tsx` — **alcançável**, 2 consumidor(es), 714 linhas
- `pages/Vagas.tsx` — inalcançável, 0 consumidor(es), 534 linhas

### `Termos` (3 cópias)

- `pages/auth/Termos.tsx` — **alcançável**, 1 consumidor(es), 203 linhas
- `pages/primeiro-acesso/Termos.tsx` — inalcançável, 0 consumidor(es), 154 linhas
- `pages/Termos.tsx` — inalcançável, 0 consumidor(es), 188 linhas

### `ModulePage` (2 cópias)

- `components/modules/ModulePage.tsx` — **alcançável**, 3 consumidor(es), 44 linhas
- `shared/crud/ModulePage.tsx` — **alcançável**, 1 consumidor(es), 256 linhas

### `navigation` (2 cópias)

- `config/navigation.ts` — **alcançável**, 1 consumidor(es), 13 linhas
- `types/navigation.ts` — **alcançável**, 6 consumidor(es), 121 linhas

### `seo` (2 cópias)

- `config/seo.ts` — **alcançável**, 1 consumidor(es), 69 linhas
- `types/seo.ts` — **alcançável**, 2 consumidor(es), 79 linhas

### `Candidaturas` (2 cópias)

- `features/candidato/pages/Candidaturas.tsx` — inalcançável, 0 consumidor(es), 136 linhas
- `pages/dashboard/Candidaturas.tsx` — **alcançável**, 2 consumidor(es), 646 linhas

### `Configuracoes` (2 cópias)

- `features/candidato/pages/Configuracoes.tsx` — inalcançável, 0 consumidor(es), 76 linhas
- `pages/dashboard/Configuracoes.tsx` — inalcançável, 0 consumidor(es), 63 linhas

### `candidate` (2 cópias)

- `modules/rh/types/candidate.ts` — inalcançável, 0 consumidor(es), 16 linhas
- `types/domain/candidate.ts` — **alcançável**, 28 consumidor(es), 280 linhas

### `Candidatos` (2 cópias)

- `pages/Candidatos.tsx` — inalcançável, 0 consumidor(es), 124 linhas
- `pages/dashboard/Candidatos.tsx` — **alcançável**, 2 consumidor(es), 530 linhas

### `Clientes` (2 cópias)

- `pages/Clientes.tsx` — inalcançável, 0 consumidor(es), 431 linhas
- `pages/dashboard/Clientes.tsx` — inalcançável, 0 consumidor(es), 115 linhas

### `Empresas` (2 cópias)

- `pages/dashboard/Empresas.tsx` — **alcançável**, 1 consumidor(es), 302 linhas
- `pages/Empresas.tsx` — inalcançável, 0 consumidor(es), 345 linhas

### `Fornecedores` (2 cópias)

- `pages/dashboard/Fornecedores.tsx` — inalcançável, 0 consumidor(es), 110 linhas
- `pages/Fornecedores.tsx` — inalcançável, 0 consumidor(es), 303 linhas

### `Parceiros` (2 cópias)

- `pages/dashboard/Parceiros.tsx` — inalcançável, 0 consumidor(es), 111 linhas
- `pages/Parceiros.tsx` — inalcançável, 0 consumidor(es), 341 linhas

### `Servicos` (2 cópias)

- `pages/dashboard/Servicos.tsx` — **alcançável**, 1 consumidor(es), 512 linhas
- `pages/Servicos.tsx` — inalcançável, 0 consumidor(es), 162 linhas

### `Suporte` (2 cópias)

- `pages/dashboard/Suporte.tsx` — **alcançável**, 1 consumidor(es), 208 linhas
- `pages/Suporte.tsx` — inalcançável, 0 consumidor(es), 953 linhas

### `candidate-context` (2 cópias)

- `services/candidate-context.ts` — **alcançável**, 1 consumidor(es), 153 linhas
- `types/domain/candidate-context.ts` — **alcançável**, 2 consumidor(es), 146 linhas

### `matching` (2 cópias)

- `services/matching.ts` — **alcançável**, 1 consumidor(es), 522 linhas
- `types/domain/matching.ts` — **alcançável**, 5 consumidor(es), 126 linhas

### `auth` (2 cópias)

- `services/mock/auth.ts` — inalcançável, 1 consumidor(es), 30 linhas
- `types/auth.ts` — **alcançável**, 15 consumidor(es), 116 linhas

---

## Pendências que bloqueiam a migração

1. **12 contratos quebrados.** Criar tabela, corrigir para a fonte real, ou remover. Migration só com autorização.
2. **Sidebar contextual não renderiza.** `getAvailableFeatures` retorna `[]` porque as páginas constroem `moduleDef` local **sem `features`**. Duplica a definição do `PORTAL_MODULES` (10/8/12 features). Decisão A/B pendente.
3. **214 arquivos inalcançáveis.** Necessário separar legado de trabalho em progresso antes de qualquer remoção.
4. **152 tabelas sem tela.** Classificar: módulo / plataforma / derivada / backlog / legado.

Nada foi alterado. Este documento é medição.
