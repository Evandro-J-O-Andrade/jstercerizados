# Auditoria técnica — J&S Empregos / CHECK BOULER 24H

**Data:** 07/11/2026  
**Escopo:** inventário de páginas, rotas, dashboards, contratos, formulários, CRUD, autenticação de candidatos e correspondência de permissões no banco.  
**GitHub:** `Evandro-J-O-Andrade/jstercerizados`, branch `main`, commit consultado `b9de729c9359054468531b2f79a7d2f470bb871a` (05/11/2026).  
**Supabase:** `okxqfyoqbhcmflpurfrw`, consultas SQL somente leitura.  
**Limite:** modificações posteriores no worktree local do Kilo não aparecem no GitHub; testes E2E e build local não foram executados nesta sessão.

## 1. Resumo executivo

- **P0 — Confirmação de candidato:** há um cadastro real de candidato em `auth.users`, `people`, `candidates`, `tenant_memberships`, `role_assignments` e `first_login_state`, criado em 08/10/2026, **sem `email_confirmed_at`**. Os triggers de bootstrap existem e estão habilitados. O gargalo dessa tentativa é confirmação/acesso, não ausência de registro no banco. **Não comprovado** se SMTP enviou, rejeitou ou se a mensagem foi classificada como spam. Configuração de Auth/SMTP hospedada não acessível pelos conectores empregados.
- **P0 — Captação pública em mock:** Contato, Parceiros e Fornecedores confirmam envios salvos em `localStorage` (`jst_contacts`, `jst_partners`, `jst_suppliers`). Não há persistência central comprovada nesses três fluxos; revisar com prioridade.
- **P1 — Autorização divergente:** de 63 chaves distintas extraídas de `MODULE_PERMISSION_MAP` e 12 grupos de rotas, 32 não constavam de `public.permissions.code`. Em outra amostra, 81 chaves distintas declaradas nas constantes de Candidato/Recrutamento/Admin/Mídia/Admin Tenant, 41 não constavam no banco. As duas amostras têm interseções; não somar os totais.
- **P1 — Rotas de fachada:** diversas células mapeiam caminhos operacionais distintos para o mesmo componente, sem estabelecer experiência específica da capacidade; sete módulos possuem raiz explicitamente `Em construção`.
- **P1 — Duplicatas no `App.tsx`:** `global` duas vezes (ambas redirecionam para Admin Master); `usuarios` duas vezes. A versão local recente do Kilo pode ter corrigido `global`.
- **P1 — Semântica do guard:** `renderModuleRoute` usa `some()` em `requiredPermissions`, logo múltiplas permissões são interpretadas como alternativa (OR); confirmar o contrato esperado para cada rota antes de modificar.
- **P1 — Fatiamento Recrutamento:** o relatório local do Kilo descreveu reconciliação de rotas, dashboard e testes parciais, **ainda não publicado na `main` consultada**. Não sobrescrever suas mudanças locais.
- **P0-B `services-images`:** aberto, independente, migration local não aplicada; não alterado.

## 2. Cadastro de candidato e e-mail

### Cadeia efetiva

`/cadastro/candidato` → `CadastroCandidato.onSubmit()` → `AuthContext.register()` → validação Turnstile (quando habilitada) → `supabase.auth.signUp()` com `signup_context='candidato'`, `signup_origin='self_signup'` → `auth.users` → triggers → `people` → `tenant_memberships` / `first_login_state` / `candidates` / `role_assignments` → confirmação de e-mail → autenticação → `CandidateRoute` → `CandidatoContext`.

**SQL remoto verificado em 07/11/2026:** `on_auth_user_created`, `trg_bootstrap_candidate_from_auth_user`, `trg_bootstrap_company_from_auth_user` estavam habilitados. Um cadastro de 08/10/2026 com contexto `candidato` possui todas as seis entidades listadas e membership ativa com papel `candidato`, mas não foi confirmado. O papel candidato tem 15 permissões atribuídas.

### Divergências / verificações pendentes

1. `CadastroCandidato.tsx` usa `emailRedirectTo: '/entrar/candidato'`; a especificação `docs/AUTH-EMAIL-SMTP.md` descreve `/auth/callback`. `src/lib/supabase.ts` tem `detectSessionInUrl: true`, portanto a divergência não prova quebra do callback. Verificar configuração **remota** de URL allow-list e fluxo implicit/PKCE efetivo.
2. `AuthContext.register` retorna `email_pending` quando a resposta não tem sessão; `CadastroCandidato` apresenta a mensagem de sucesso pendente via `setError()` em vez de UI de confirmação. Corrigir tratamento de estado sem alterar as políticas de e-mail.
3. `supabase/config.toml` versionado declara `auth.email.enable_confirmations=false` **somente para a configuração local**; `docs/AUTH-EMAIL-SMTP.md` pede confirmação obrigatória, SMTP Hostinger e domínio canônico. Não inferir configuração do servidor hospedado a partir desses arquivos.
4. Nenhum `supabase.auth.resend()` foi localizado pela busca de código realizada. Verificar se há interface efetiva de reenvio para cadastro pendente; sem isso o usuário fica sem mecanismo de recuperação na UI.
5. Verificar no Dashboard hospedado: Auth > Providers (Confirm Email), Auth > SMTP, Auth > URL Configuration (Site URL/Redirect URLs), Auth > Logs; verificar logs de envio/recusa na Hostinger e SPF/DKIM/DMARC do domínio. Essa checagem requer acesso operacional ao provedor. Não expor senhas nem chaves.
6. Reproduzir com e-mail de teste autorizado e capturar HTTP/status/mensagem sanitizados de `signUp`, preservando LGPD. Não criar usuários de produção sem autorização explícita; usar ambiente apropriado.
7. Inspecionar `CandidateRoute` e `CandidatoContext` pós-confirmação, com RLS. Não tratar ausência de e-mail como falta de registro de candidato sem consultar a cadeia acima.

**Evidência de diferença entre cadastro e candidatura:** `/cadastro/candidato` cria identidade no Auth; `/trabalhe-conosco` chama `submitCandidateApplication` (currículo/inscrição), outro fluxo a ser testado separadamente.

## 3. Inventário do CHECK BOULER 24H — 26 células registradas

`src/core/cells/register-cells.ts` registra:

1. candidato; 2. recrutamento; 3. empresas; 4. admin; 5. media; 6. rh; 7. financeiro; 8. contabilidade; 9. suporte; 10. estoque; 11. ava; 12. servicos; 13. fiscal; 14. operacoes; 15. pos; 16. admin-master; 17. admin-tenant; 18. core; 19. integracoes; 20. contratos; 21. crm; 22. faturamento; 23. relatorios; 24. ia; 25. configuracoes-saas; 26. preferencias.

`src/platform/router/module-routes.ts` contém **16 entradas** de `ModuleRoute[]`: rh, candidato, recrutamento, servicos, estoque, fiscal, suporte, financeiro, contabilidade, operacoes, empresas, admin, media, pos, ava, admin-tenant.

**Nota:** não estar nessa segunda lista não significa automaticamente que uma célula não seja acessível: há rotas explícitas em `App.tsx` para Admin Master e outras áreas. Necessária matriz de correspondência: `CellContract.homeRoute` → rota montada → componente → guard → tenant.

## 4. Inventário de rotas por célula — GitHub main

| Célula                    | Rotas/áreas declaradas                                                                                                                                                                                                                                           | Situação evidenciada no código                                                                                                                           |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Candidato                 | dashboard, vagas, recomendadas, buscar, candidaturas, Kanban, favoritas, alertas, currículo, experiência, formação, cursos, habilidades, idiomas, documentos, preferências, conta, perfil, entrevistas, histórico, notificações, configurações (**22 entradas**) | Componentes próprios lazy; falta teste real de login e RLS após confirmação                                                                              |
| Recrutamento              | dashboard, vagas, candidatos, candidato/:id, processos, etapas, candidaturas, matches, talent-pool, demandas, relatórios (**11**)                                                                                                                                | `RecrutamentoRoutes.tsx` raiz no GitHub ainda diverge do canônico; Kilo reportou reexport corrigido localmente                                           |
| RH                        | dashboard, funcionários, detalhes, candidatos, detalhes, vagas, matches, processos, detalhe, candidaturas, documentos, banco de talentos, etapas (**13**)                                                                                                        | `processos-seletivos/:id` usa elemento `null` + `coming_soon`; demais reaproveitam componentes de outras células                                         |
| Empresas                  | dashboard, lista, nova, detalhe, editar (**5**)                                                                                                                                                                                                                  | Entradas próprias; validar CRUD, vínculo tenant, mídia e RLS                                                                                             |
| Financeiro                | dashboard, contas-pagar, contas-receber, fluxo-caixa, faturamento, bancos, centros-custo, conciliação, categoria, parcelamentos, transações (**11**)                                                                                                             | `TransacoesPage` e `ConciliacaoPage` têm botões informativos sem criação efetiva                                                                         |
| Serviços                  | dashboard, catálogo, ordens, criar ordem, execuções, aceites, ocorrências, avaliações (**8**)                                                                                                                                                                    | **Sete** rotas apontam para `ServicosListPage`; ela implementa tabs/CRUD parciais, não páginas específicas para todas as operações anunciadas            |
| Estoque                   | dashboard, produtos, criar produto, movimentos, almoxarifados, compras, inventário (**7**)                                                                                                                                                                       | 6 rotas vão para `Estoque`, uma para `Almoxarifado`                                                                                                      |
| Fiscal                    | dashboard, documentos, criar documento, configurações, tributos, eventos (**6**)                                                                                                                                                                                 | Todas renderizam `FiscalPage`                                                                                                                            |
| Operações                 | dashboard, ordens, criar ordem, checklists, materiais, ocorrências, aceites (**7**)                                                                                                                                                                              | Todas renderizam `GestaoPage`                                                                                                                            |
| POS/PDV                   | dashboard, vendas, caixas, terminais, cancelamentos, fechamento (**6**)                                                                                                                                                                                          | Todas renderizam `FaturamentoPage`                                                                                                                       |
| Suporte                   | dashboard, tickets, novo ticket, categorias, tarefas (**5**)                                                                                                                                                                                                     | Quatro rotas renderizam `SuportePage`                                                                                                                    |
| Contabilidade             | dashboard, lançamentos, plano de contas, balancetes (**4**)                                                                                                                                                                                                      | Componentes próprios declarados, não validados por E2E nesta auditoria                                                                                   |
| Mídia                     | dashboard, upload, galeria, ativos (**4**)                                                                                                                                                                                                                       | Componentes próprios declarados; permissões de mídia divergentes do banco                                                                                |
| Admin                     | dashboard, tenants, roles/permissões, usuários, auditoria, segurança, sessões, assinaturas, gestão SaaS, integrações, auditoria RBAC, relacionamentos, notificações (**13**)                                                                                     | Conjunto `admin.*` das permissões constantes sem correspondência na fonte consultada                                                                     |
| Admin Tenant              | dashboard, tenants, sistemas, unidades, administradores, gestão, segurança, auditoria, configurações (**9**)                                                                                                                                                     | Conjunto de `owner.*` majoritariamente sem correspondência no banco; verificar fonte correta por domínio                                                 |
| AVA                       | central de aprendizado, tutorial (**2**)                                                                                                                                                                                                                         | Chave `ava.read` não localizada na amostra de permissões                                                                                                 |
| Admin Master              | 12 declarações de rotas em `routes/index.ts`                                                                                                                                                                                                                     | Metadados misturam `/dashboard/admin-master` e `/dashboard/global`, ambos com `GlobalDashboardPage` legado; implementação local da Central pode divergir |
| Core                      | dashboard (`/dashboard`)                                                                                                                                                                                                                                         | Célula de infraestrutura; não deve receber CRUD de negócios                                                                                              |
| Integrações (`src/cells`) | `routes: []`                                                                                                                                                                                                                                                     | Registrada e habilitada com navegação informada, mas contrato sem rotas próprias                                                                         |
| Contratos                 | raiz                                                                                                                                                                                                                                                             | JSX somente `Em construção`                                                                                                                              |
| CRM                       | raiz                                                                                                                                                                                                                                                             | JSX somente `Em construção`                                                                                                                              |
| Faturamento               | raiz                                                                                                                                                                                                                                                             | JSX somente `Em construção`                                                                                                                              |
| Relatórios                | raiz                                                                                                                                                                                                                                                             | JSX somente `Em construção`                                                                                                                              |
| IA                        | raiz                                                                                                                                                                                                                                                             | JSX somente `Em construção`                                                                                                                              |
| Configurações SaaS        | raiz                                                                                                                                                                                                                                                             | JSX somente `Em construção`                                                                                                                              |
| Preferências              | raiz                                                                                                                                                                                                                                                             | JSX somente `Em construção`                                                                                                                              |

**Não confundir:** rota existente, componente renderizável, CRUD operacional e status healthy são fatos diferentes. A lista acima identifica a base de código, não homologa as telas.

## 5. Rotas públicas e autenticação declaradas em `src/App.tsx`

- Site: `/`, `/vagas`, `/vagas/:slug`, `/empresas`, `/empresas/divulgar-vaga`, `/candidatos`, `/clientes`, `/parceiros`, `/fornecedores`, `/servicos`, `/servicos/:slug`, `/trabalhe-conosco`, `/processo-seletivo`, `/sobre`, `/blog`, `/blog/:slug`, `/suporte`, `/faq`, `/contato`, `/privacidade`, `/termos`.
- Auth: `/login`, `/entrar`, `/entrar/admin`, `/entrar/candidato`, `/entrar/empresa`, `/cadastro`, `/recuperar-senha`, `/redefinir-senha`, `/cadastro/candidato`, `/cadastro/empresa`, `/auth/callback`, `/auth/terms`, `/auth/welcome`, `/primeiro-acesso/termos`, `/primeiro-acesso/senha`, `/selecionar-tenant`, `/onboarding`, `/alterar-senha`, `/minha-conta`.
- Candidato: `/candidato/*` (e compatibilidade `/dashboard/candidato/*`); guard próprio `CandidateRoute`.
- Dashboard global/administrativo: `/dashboard/*` com múltiplas rotas explícitas (RH, pessoas, empresas, segurança, RBAC, tenants, usuários, auditoria, notificações, assinaturas, relatórios e demais domínios), mais roteamento dinâmico `ModuleRouter` e fallback.

**Duplicatas literais confirmadas:** `global` em `App.tsx` linhas 205 e 514 (ambas redirecionam para Admin Master), `usuarios` em linhas 700 e 742. As rotas `*` podem ser corretas por pertencerem a subárvores diferentes; não tratar todo wildcard como duplicado.

## 6. Autorizações e contrato canônico — discrepâncias

- Banco real `public.permissions`: `id`, `resource`, `action`, `description`, `created_at`, `code`, `updated_at` — não possui `name` nem `module` como colunas. `AuthContext` usa `normalizePermission()` para mapear o objeto ao contrato TypeScript `{name,module}`; não afirmar quebra desse ponto sem validar o normalizador.
- `MODULE_PERMISSION_MAP` contém chaves ausentes do banco real e `ModuleRouter` entrega strings por permissão para `PermissionGuard`. Se a chave não existe, a célula pode ter rota mas não estar autorizável por aquele contrato.
- Primeira amostra: **63** chaves distintas verificadas; **32 ausentes**. Ausentes: `ai.read`, `auth.manage`, `ava.read`, `customer_ratings.read`, `fiscal.config.read`, `fiscal.documents.create`, `fiscal.read`, `integrations.read`, `media.read`, `onboarding.manage`, `operations.read`, `pos_cancellations.read`, `pos_cashiers.read`, `pos_daily_closures.read`, `pos_sales.read`, `pos_terminals.read`, `pos.read`, `roles.manage`, `saas.manage`, `service_acceptances.read`, `service_occurrences.read`, `services.read`, `settings.read`, `stock.create`, `stock.read`, `subscriptions.read`, `work_order_acceptances.read`, `work_order_checklists.read`, `work_order_materials.read`, `work_order_occurrences.read`, `work_orders.create`, `work_orders.read`.
- Segunda amostra (constantes das células Candidato/Recrutamento/Admin/Mídia/Admin Tenant): **81** chaves distintas verificadas; **41 ausentes**, principalmente `admin.*`, `owner.*` e `media.*`. Amostras sobrepostas; não somar sem deduplicar.
- `ModuleRouter.renderModuleRoute` usa `.some()` em `route.requiredPermissions`; isso significa **OR**, não **AND**, quando o array tiver múltiplos elementos. A rota de Admin `roles-permissoes` declara duas permissões: confirmar se o negócio exige ambas, e então alinhar a semântica sob testes.
- `CellRegistry` é catálogo, não fonte de autorização. Declarações `lifecycle.health:'healthy'` estáticas não provam saúde. Gate CELL-09 `passed:true` declarativo não significa testes homologados.
- `DispatcherMaster.dispatch` valida e devolve resultado sem executar operação de negócio nessa versão. Não confundir autorização de despacho e executor.
- Manter RLS como fronteira final de autorização; UI não cria permissões nem resolve ausência de autorização com bypass.

## 7. Formulários e CRUDs

### Erros/riscos diretos

| Área                   | Código e evidência                                                                                                                                                                        | Classificação |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| Contato                | `src/pages/Contato.tsx` → `src/services/mock/contatos.ts`, escreve `localStorage` e exibe sucesso                                                                                         | P0            |
| Parceiros              | `src/pages/Parceiros.tsx` → `src/services/mock/parceiros.ts` (`jst_partners`)                                                                                                             | P0            |
| Fornecedores           | `src/pages/Fornecedores.tsx` → `src/services/mock/fornecedores.ts` (`jst_suppliers`)                                                                                                      | P0            |
| Candidatura de vaga    | `src/components/forms/JobApplicationForm.tsx` usa `fetch(WhatsAppURL, {method:'HEAD',mode:'no-cors'})` e aceita resposta opaque como sucesso; não comprova entrega/candidatura persistida | P0/P1         |
| Solicitação de serviço | `src/components/forms/ServiceRequestForm.tsx` abre WhatsApp, depois marca sucesso independentemente de o usuário ter enviado mensagem                                                     | P1            |
| Financeiro             | `TransacoesPage`, `ConciliacaoPage` possuem botões que só mostram “Em desenvolvimento”                                                                                                    | P1            |
| RH                     | `processos-seletivos/:id` possui elemento `null` e status `coming_soon`; testar rota direta                                                                                               | P1            |
| Empresas               | `companies.repository.ts` contém `return null as any` no update; resultado deveria obedecer contrato tipado                                                                               | P1            |
| Vagas                  | `RecrutamentoVagas` tem entrada textual para `company_id`, vínculo de entidade sem seleção/validação de domínio clara                                                                     | P2            |
| Tema                   | `contexts/ThemeContext.tsx` é canônico; `hooks/useTheme.ts` usa outra storage key e sem `system`. Não incorporar segunda implementação                                                    | P2            |

**Atualização factual importante:** o banco atual **tem `companies.tenant_id`**, `services`, `financial_transactions` e `bank_reconciliations`. Auditorias históricas que diziam que essas tabelas/colunas não existiam estão desatualizadas. Não aplicar correções de schema por suposição.

### Verificações pendentes para homologação

CRUD individual por entidade: `CREATE/READ/UPDATE/DELETE` sob usuário real, tenant autorizado e tenant não autorizado; validação de Zod/React Hook Form; erros de backend e estado de loading; upload privado e RLS; vínculo PK/FK; sem duplicações; atualização otimista, concorrência e histórico quando pertinentes.

## 8. Design System e páginas de dashboard

- Sistema **canônico** `src/contexts/ThemeContext.tsx` montado em `src/main.tsx`, opções `dark`, `light`, `system`, default dark, `jst-theme`.
- Tokens `src/styles/index.css` (navy/gold, `--background`, `--card`, `--primary`, `--border` etc.) e Tailwind v4; evitar criar outro ThemeProvider/Design System paralelo.
- Dashboard Global = observador/consolidador; Admin Master = célula de governança; cada célula possui dashboard próprio e páginas operacionais.
- Onde houver rota de dashboard que renderiza página operacional genérica, criar separação por composição **após** reconciliar permissões, rotas e dados existentes. Não preencher tela com métricas fictícias.
- Recrutamento possui evolução local informada pelo Kilo; TypeScript global, lint, build e validação visual dark/light ainda pendentes nesse relatório local.

## 9. Encaminhamento verificável para Kilo/Codex

**Fase A — P0 candidato (isolada):** reproduzir cadastro em ambiente seguro com e-mail autorizado; capturar status da requisição e resultado `user/session/error` sem segredos; confirmar política remota Confirm Email, SMTP Hostinger, URLs redirect, templates e logs de entrega; verificar link e rota de callback; testar login e entrada no `CandidateRoute`. Não cadastrar ou alterar pessoas de produção sem autorização.

**Fase B — P0 captação pública:** inventariar contratos de persistência autorizados para Contato/Parceiro/Fornecedor, validar tabelas/FKs/RLS e substituir confirmação baseada apenas em localStorage por resultado real; sem migration ou alteração de banco não aprovada.

**Fase C — P1 navegação/contratos:** matriz de **cada célula** com `cellId, homeRoute, path, component, implementationStatus, permission keys, permission exists?, user granted?, entity, CRUD methods, data source, status`. Remover duplicação de rota apenas após testes; marcar links sem fluxo verdadeiro honestamente; não inventar página/rota ou autorização.

**Fase D — P1 CRUD/UI:** converter rotas múltiplas que compartilham uma tela genérica em experiências específicas somente quando fonte real e operações já existirem; onde faltar capacidade, documentar como parcial sem simular sucesso. Preservar dark/light.

**Fase E — Validação:** `tsc --noEmit`, `vitest` (candidato, RBAC, tenant-isolation, Recrutamento, roteamento), `npm run lint`, `npm run build`, E2E navegador desktop/mobile nos dois temas, testes negativos de autorização e persistência. Registrar outputs/códigos de saída.

**Governança:** somente leitura realizada nesta auditoria; nenhum arquivo do repositório, migration, Supabase remoto, commit, push ou deploy foi modificado. P0-B independente e aberto.

## 10. Referências fixadas no commit auditado

- [App.tsx](https://github.com/Evandro-J-O-Andrade/jstercerizados/blob/b9de729c9359054468531b2f79a7d2f470bb871a/src/App.tsx)
- [Registro das 26 células](https://github.com/Evandro-J-O-Andrade/jstercerizados/blob/b9de729c9359054468531b2f79a7d2f470bb871a/src/core/cells/register-cells.ts)
- [Contratos tipados CORE](https://github.com/Evandro-J-O-Andrade/jstercerizados/blob/b9de729c9359054468531b2f79a7d2f470bb871a/src/core/types.ts)
- [ModuleRouter](https://github.com/Evandro-J-O-Andrade/jstercerizados/blob/b9de729c9359054468531b2f79a7d2f470bb871a/src/platform/router/ModuleRouter.tsx)
- [Mapa de permissão de módulos](https://github.com/Evandro-J-O-Andrade/jstercerizados/blob/b9de729c9359054468531b2f79a7d2f470bb871a/src/core/permissions/modulePermissionMap.ts)
- [Formulário CadastroCandidato](https://github.com/Evandro-J-O-Andrade/jstercerizados/blob/b9de729c9359054468531b2f79a7d2f470bb871a/src/pages/CadastroCandidato.tsx)
- [Contexto Auth](https://github.com/Evandro-J-O-Andrade/jstercerizados/blob/b9de729c9359054468531b2f79a7d2f470bb871a/src/contexts/AuthContext.tsx)
- [Documento operacional Auth SMTP](https://github.com/Evandro-J-O-Andrade/jstercerizados/blob/b9de729c9359054468531b2f79a7d2f470bb871a/docs/AUTH-EMAIL-SMTP.md)
- [Histórico P0 de cadastro candidato](https://github.com/Evandro-J-O-Andrade/jstercerizados/blob/b9de729c9359054468531b2f79a7d2f470bb871a/docs/P0-CANDIDATE-REGISTRATION-DIAGNOSIS.md)
- [Contratos de rotas dos módulos](https://github.com/Evandro-J-O-Andrade/jstercerizados/tree/b9de729c9359054468531b2f79a7d2f470bb871a/src/modules)
