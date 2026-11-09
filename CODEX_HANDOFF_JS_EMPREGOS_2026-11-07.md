# J&S Empregos — passagem de contexto para Codex no VS Code

**Data de referência:** 07/11/2026  
**Objetivo:** transferir contexto técnico, evidências, decisões, limites e próximas atividades do trabalho ChatGPT ↔ Kilo ↔ Codex para que o Codex possa **começar pela leitura e auditoria**, sem repetir o que já foi feito e sem comprometer produção.  
**Status deste arquivo:** passagem de contexto — **NÃO é autorização de implementação, mudanças de banco, migration, Git, deploy ou uso de credenciais.**

> **Como interpretar:** Este texto agrega (a) evidências que foram verificadas diretamente no GitHub/Supabase; (b) relatos do Kilo sobre o worktree local; (c) documentação/decisões anteriores. Quando houver divergência, verifique o estado do workspace atual, registre o conflito e não substitua silenciosamente uma fonte por outra. Não trate plano, teste unitário aprovado ou commit como produção homologada.

## 0. Primeira ação OBRIGATÓRIA no Codex: somente leitura

1. Confirme qual pasta está aberta no VS Code, a raiz do Git, a URL do remote, o `HEAD`, o estado do índice/worktree, e as referências `origin/main` local e remota. **NÃO sincronize, não restaure e não execute checkout/reset/clean/stash.**
2. Leia integralmente o `AGENTS.md` que já existe na raiz do projeto e respeite suas instruções. **Não crie nem sobrescreva AGENTS.md.** Procure também AGENTS.md aplicáveis em subpastas.
3. Leia este handoff e os documentos listados na seção 3, dando preferência ao estado atual e aos documentos normativos ainda vigentes. Classifique o que é `REAL`, `PARCIAL`, `MOCK`, `ESPECIFICADO`, `PROPOSTO`, `PENDENTE`, `ÓRFÃO`, `OBSOLETO` ou `CONFLITANTE`.
4. Inspecione as rotas, contratos, providers, serviços e testes em foco. Separe **fato observado no código**, **evidência remota autorizada**, **relato local**, **proposta** e **hipótese**.
5. Primeira entrega esperada: relatório sintético da situação atual, conflitos e próximos gates **sem modificar arquivos**. Pare e solicite autorização antes de qualquer implementação ou operação remota.

## 1. Identidade e escopo do projeto

- **Projeto ativo:** J&S Empregos / J&S Terceirizados — arquitetura denominada **CHECK BOULER 24H**.
- **Repositório:** `https://github.com/Evandro-J-O-Andrade/jstercerizados`.
- **Branch pública verificada:** `main`, commit `972af8e4f4181ff7f56e5c8c20d14ea14cd60e54`, título `feat: add global command observability and reconcile recrutamento UI`. GitHub confirmou o commit como ponta de `main` em 07/11/2026.
- **Supabase único deste projeto:** `okxqfyoqbhcmflpurfrw` (projeto `js-empregos`). Não confundir outros projetos Supabase.
- **Domínio operacional:** `https://jsempregos.com.br` (verificar DNS/deploy em auditoria específica, nunca supor que deploy está no SHA da `main`).
- **Possível workspace histórico no Windows:** `C:\NewWaveProjetos\jrtercerisados`. **Confirme o caminho real no VS Code**, não presuma.
- **Stack observada:** React + TypeScript/TSX + Vite + Tailwind CSS, Supabase (PostgreSQL, Auth, Storage, RLS). Confira `package.json`, lockfile, ferramentas e configuração exatas antes de executar comandos.
- **Produto:** plataforma SaaS de captação de candidatos, vagas, empresas, recrutamento/seleção, serviços terceirizados/facilities e áreas internas por perfil/tenant. Portal público e ambientes de Candidato, Empresas, RH, Admin, Admin Master e demais células. Não reduzir o produto a uma landing page.
- **Identidade textual importante:** `AGENTS.md` na `main` contém regra explícita de **preservar 'J&S Empregos LTDA' no código e não alterar o footer**. Fontes históricas usam também a razão social J&S Terceirizados LTDA. **Não harmonizar branding nem renomear em código sem decisão formal; prevalecem as diretrizes do `AGENTS.md` aplicável.**
- **PROIBIDO misturar este projeto** com Remoção Alpha (`Evandro-J-O-Andrade/RemocaoAlpha`) ou Angel Cosméticos (`Evandro-J-O-Andrade/LojaVirtualComCarrinhoDeCompras`). São sistemas, bancos, regras e worktrees independentes.

## 2. CHECK BOULER 24H — núcleo arquitetural

### 2.1 Hierarquia

`CORE / identidade / governança / contexto / auditoria → DispatcherMaster → orquestradores globais → dispatchers locais → executores/serviços/repositórios → células operacionais`.

- Hierarquia inspirada **conceitualmente** em Active Directory: floresta/domínio/OU/GPO/grupos/escopos/herança de autorização. Não se trata de instalar Active Directory.
- Autonomia por célula e resiliência; erros de uma célula não devem derrubar outras. Cada célula deve possuir contrato, dashboard, sidebar, rotas, serviços, repositórios, operações/CRUD e autorização coerentes.
- `src/core/cells/register-cells.ts` registra **26 CellContracts**; registrar uma célula não é prova de que todas as operações estejam implementadas.
- `src/core/dispatcher/DispatcherMaster.ts` valida identidade, contexto, isolamento, autorização e despacho; **não acessa Supabase diretamente** nem concede privilégios. Arquivo protegido de alteração no escopo atual.
- Separação canônica: **Central Global SaaS ≠ Admin Master ≠ Dispatcher Master ≠ células**. ADRs/arquitetura publicada classificam parte disso como **proposta/documentação**, não homologue automaticamente como implementado.
- Cadeia de autorização: `auth.users → people → tenant_memberships → role_assignments → roles → role_permissions → permissions`, combinada com `scope`, tenant, permissões efetivas, RLS, políticas de Storage e Edge Functions.
- Papel `admin_master` global: respeitar `scope='global'`, `tenant_id IS NULL`; não inferir tenant usando primeira membership, não associar usuários artificialmente, não contornar RLS ou criar exceções ad hoc.
- `CellRegistry` canônico; mecanismos legados de módulos/rotas coexistem em transição Strangler Fig. Investigar adapters `cell-to-module-definition`, `ModuleRouter`, `MODULE_PERMISSION_MAP`, `PermissionGuard`, `ProtectedRoute` antes de alterar.
- **Sidebar/menu não autoriza operação**; UI permissiva não substitui controle server-side.

### 2.2 As 26 células registradas

`candidato`, `recrutamento`, `empresas`, `admin`, `media`, `rh`, `financeiro`, `contabilidade`, `suporte`, `estoque`, `ava`, `servicos`, `fiscal`, `operacoes`, `pos`, `admin-master`, `admin-tenant`, `core`, `integracoes`, `contratos`, `crm`, `faturamento`, `relatorios`, `ia`, `configuracoes-saas`, `preferencias`.

Exigir inventário `célula → CellContract → rota → guard/permissão → componente real → hook/service/repository → operação/CRUD → banco/RLS → evidência`. Marcar dashboards legítimos, páginas operacionais e stubs separadamente.

### 2.3 Interface e temas

- Dark/light/system com contexto canônico `src/contexts/ThemeContext.tsx` e tokens J&S em `src/styles/index.css`; não introduzir outra solução paralela.
- UX SaaS real, consistente, responsiva, sem números fictícios, links sem tela, sucesso sem persistência, cards gigantescos ou duplicação funcional.
- Dados reais/RLS por tenant e estados honestos loading/erro/vazio/degradado.

## 3. Documentação e código que devem ser lidos por relevância

**Primeiro:** `AGENTS.md` (na raiz). A versão consultada contém: preservar `J&S Empregos LTDA`, não modificar footer, documentação antes de código, proibir duplicação, Supabase source of truth, não fazer commit/push/deploy sem autorização.

**Arquitetura/governança:**
- `docs/check-bouler-24h/ARQUITETURA_CANONICA_GLOBAL_ADMIN_DISPATCHER.md`
- `docs/check-bouler-24h/ADR-0001-GOVERNANCA_GLOBAL_ADMIN_DISPATCHER.md`
- `docs/check-bouler-24h/ADR-0001-ANEXO-B-CENTRAL_COMANDO_GLOBAL.md`
- `docs/check-bouler-24h/RECONCILIACAO_HISTORICA_NORMATIVA_E_EVIDENCIAS.md`
- `docs/check-bouler-24h/STAGE02_13_MATRIZ_REGRESSAO_E_INVENTARIO_COMPLEMENTAR.md`
- `docs/check-bouler-24h/STAGE02_14_RECONCILIACAO_EVIDENCIAS_E_PARECERES_P0.md`
- `docs/check-bouler-24h/STAGE02_14_1B_CLASSIFICACAO_101_POLICIES_PUBLIC.md`
- `docs/check-bouler-24h/STAGE02_14_3B_SEGMENTED_PG_PROC_CALLER_SCAN.md`
- `docs/check-bouler-24h/PARECER_P0_SERVICES_IMAGES.md`
- `docs/check-bouler-24h/P0B_ST004_SERVICES_IMAGES_INVENTARIO_CONTROLADO.md`
- `docs/check-bouler-24h/P0B_ST003_ST004_TEST_PLAN.md`
- `AUDITORIA_JS_CHECK_BOULER_24H_2026-11-07.md` — auditoria geral anterior, originalmente baseada em `b9de729`, publicada no commit `972af8e`.
- `docs/AUTH-EMAIL-SMTP.md` — intenção operacional SMTP/redirect; **não comprova settings remotos**.

**Código/contratos prioritários:**
- `src/App.tsx`, `src/core/cells/register-cells.ts`, `src/core/dispatcher/DispatcherMaster.ts`
- `src/core/registry/CellRegistryContract.ts`, `src/core/observability/*`
- `src/platform/router/ModuleRouter.tsx`, `src/platform/router/module-routes.ts`, `src/core/permissions/modulePermissionMap.ts`
- `src/modules/recrutamento/{RecrutamentoRoutes.tsx,cellContract.ts,DashboardRecrutamento/*,navigation/*}`
- `src/pages/dashboard/GlobalCommandPage.tsx`, `src/modules/admin-master/sidebar/*`
- `src/pages/CadastroCandidato.tsx`, `src/contexts/AuthContext.tsx`, `src/lib/supabase.ts`, rotas/callback/guards do candidato
- `src/pages/{Contato,Parceiros,Fornecedores}.tsx`, `src/services/mock/{contatos,parceiros,fornecedores}.ts`
- `src/components/forms/{JobApplicationForm,ServiceRequestForm}.tsx`
- Migrations em `supabase/migrations/` (inspeção **somente leitura**)

A documentação foi criada em momentos diferentes; **ADR “Proposto” não pode ser promovido implicitamente a decisão implementada.** Arquivos antigos podem conter contagens/diagnósticos desatualizados. Verificar o código atual.

## 4. Onde o trabalho parou — commit e validação

### 4.1 Publicado na `main` (confirmado pelo GitHub)

Commit `972af8e` alterou **32 arquivos**, incluindo:
- Central de Comando `src/pages/dashboard/GlobalCommandPage.tsx` e testes.
- Observabilidade `src/core/observability/*` e integração com registro de células.
- Recrutamento: reexport canônico, `cellContract`, Dashboard/estados, navegação, testes.
- Sidebar do Admin Master, hook de estatísticas globais e `src/App.tsx`.
- Documentação CHECK BOULER 24H e auditoria geral.
- **Migration P0-B SQL passou a estar versionada na `main`; isso não significa aplicada no Supabase.**

### 4.2 Validado pelo Kilo localmente (relato de execução, não certificação de produção)

- Recrutamento: reexport `RecrutamentoRoutes.tsx` para implementação canônica; `cellContract` reconciliado; `RecrutamentoProvider` montado por rota com `withProvider`, sem dupla montagem simultânea detectada.
- Dashboard da célula com dados reais via `useRecrutamento` (tenant/RLS) e loading/erro/vazio; navegação de criação removida onde rotas não existem.
- Correção de incompatibilidade TS no `DashboardMetricGrid columns` já aplicada.
- Testes alvo: **5 arquivos/18 testes + 1 arquivo/1 teste tenant-isolation = 19 aprovados**.
- **NÃO homologado:** `npx tsc --noEmit` global, `npm run lint`, `npm run build` com exit code e smoke visual dark/light/responsivo/loading/empty/erro ainda não possuíam resultado final registrado. Verifique se surgiu evidência mais recente.
- Legados preservados por dependência não demonstrada: `src/pages/dashboard/DashboardRecrutamento.tsx`, `RecrutamentoSidebar/Container/Navigation`.
- Rota de criação `/vagas/nova`, `/candidatos/novo`, `/processos/novo`, `/demandas/nova` **não é capacidade declarada na célula e não deve ser reintroduzida como link falso**.

### 4.3 Distinção essencial

**Commit publicado ≠ build aprovado ≠ deploy atualizado ≠ banco migrado ≠ autorização de produção.**

## 5. P0 — Cadastro candidato / confirmação por e-mail

**Evidência remota anterior (Supabase, consulta somente leitura, 07/11/2026):** os triggers `on_auth_user_created`, `trg_bootstrap_candidate_from_auth_user`, `trg_bootstrap_company_from_auth_user` estavam presentes/habilitados. Foi encontrado um caso de candidato criado em 08/10/2026 com `signup_context='candidato'`, registros vinculados em `auth.users`, `people`, `candidates`, `tenant_memberships` (ativa), `first_login_state`, `role_assignments` e papel `candidato`, **mas sem `email_confirmed_at`**. As permissões candidatas observadas estavam provisionadas. Isso **não prova falha de SMTP**, mas indica que, nesse caso, criação/provisionamento ocorreu e confirmação/acesso permanecia pendente.

Fluxo de inspeção: `/cadastro/candidato → CadastroCandidato → AuthContext.register/signUp → Auth.users → triggers → people/membership/candidates/roles → email → callback → login → CandidateRoute/CandidatoContext`.

Achados que precisam ser confirmados no código atual:
- `CadastroCandidato` usa `emailRedirectTo='/entrar/candidato'`; `docs/AUTH-EMAIL-SMTP.md` orienta `/auth/callback`. `detectSessionInUrl: true` torna a diferença insuficiente para concluir quebra.
- A UI apresentava `email_pending` por `setError`, confundindo confirmação pendente com erro.
- Configuração local `supabase/config.toml` tinha `enable_confirmations=false`; isso **não demonstra a configuração hospedada**.
- Não foi encontrado fluxo `supabase.auth.resend()` na amostra analisada, verificar novamente.
- Confirmar hospedagem/URLs permitidas/SMTP/Hostinger/logs SPF-DKIM-DMARC **somente quando houver autorização para acesso remoto**, sem revelar segredos.
- Documento `docs/AUTH-EMAIL-SMTP.md` desautoriza alterar arquivos Auth sem revisão; respeite instruções vigentes e peça autorização específica antes de editar.
- **Não recriar triggers, usuários, contas de teste em produção, nem aplicar migrations como tentativa de correção.**

Critério de entrega investigativa: matriz `etapa → código/recurso → evidência → hipótese comprovada ou não → ação mínima proposta` e distinção entre delivery SMTP, validação do token, callback, Auth session e route guard.

## 6. Outros bloqueios globais (auditoria anterior; revalidar no estado atual)

### P0 — Captura pública com sucesso falso ou armazenamento local

- `src/pages/Contato.tsx` → `src/services/mock/contatos.ts` e chave `jst_contacts`.
- `src/pages/Parceiros.tsx` → `src/services/mock/parceiros.ts` e chave `jst_partners`.
- `src/pages/Fornecedores.tsx` → `src/services/mock/fornecedores.ts` e chave `jst_suppliers`.
- `JobApplicationForm.tsx`: request `HEAD/no-cors` para WhatsApp tratado como sucesso, sem prova de persistência/candidatura.
- `ServiceRequestForm.tsx`: abrir WhatsApp não comprova que a mensagem foi enviada.
- Não substituir mock por nova tabela sem verificar primeiro schema, APIs, contratos, LGPD/RLS e autorização.

### P1 — Permissões e isolamento

- Amostra anterior de `MODULE_PERMISSION_MAP` + 12 grupos de rotas: **63 keys**, **32 ausentes** de `public.permissions.code`.
- Segunda amostra de constantes de 5 áreas: **81 keys**, **41 ausentes**. **Amostras sobrepostas; não somar.**
- `ModuleRouter` usa `some()` sobre `requiredPermissions`: semântica **OR/any**. Verificar quando contrato exige **AND/all** (papéis/permissões administrativas), sem modificar guardas sem entender RBAC/RLS.
- Cuidado: `public.permissions` possui coluna `code`; `AuthContext` usa normalização. Tabelas atuais têm `companies.tenant_id`, `services`, `financial_transactions`, `bank_reconciliations`. Não usar diagnóstico de schema desatualizado.

### P1 — Rotas, placeholders e CRUD falso

- `src/modules/{servicos,estoque,fiscal,operacoes,pos,suporte}/routes/*`: múltiplas rotas apontavam para páginas genéricas. Algumas páginas têm tabs/CRUD parciais; não declarar ausência total sem investigar.
- `src/modules/{contratos,crm,faturamento,relatorios,ia,configuracoes-saas,preferencias}/routes/*`: páginas explícitas `Em construção` na amostra anterior.
- `src/modules/rh/routes/index.ts` usa `element: null` em um detalhe `processos-seletivos/:id` com `coming_soon`.
- Financeiro tinha botões de criação que apenas mostram toast `Em desenvolvimento`.
- `lifecycle.health='healthy'` é estático em contratos; não equivale a métrica de saúde em execução.
- `src/contexts/ThemeContext.tsx` canônico; hook legado `src/hooks/useTheme.ts` foi identificado, não criar tema paralelo.

## 7. P0-B — `services-images`: totalmente SEPARADA, aplicação BLOQUEADA

**Migration:** `supabase/migrations/20261106120000_p0b_services_images_drop_authenticated_and_public_policies.sql`.

- Nasceu como arquivo local `??`, depois foi **incluída no commit `972af8e`**. Está presente na `main` publicada. **Não foi aplicada no remoto no último histórico consultado.**
- SQL preparado para remover 4 policies sobre `storage.objects`, **sem políticas substitutas** na fase 1.
- Leitura remota em 07/11/2026 confirmou as políticas ainda existentes: `services_images_public_read` (`SELECT/public`), `services_images_authenticated_write` (`INSERT/authenticated`), `services_images_authenticated_update` (`UPDATE/authenticated`), `services_images_authenticated_delete` (`DELETE/authenticated`).
- Aplicação pode quebrar acesso de imagens/CRUD; precisa de inventário de objetos/consumidores, prova de impacto e aprovação formal de política pública/privada. **NÃO APLICAR, NÃO RODAR `db push`, `migration up`, `repair`, `reset`**.
- `DispatcherMaster` e esta migration não devem sofrer alterações por tarefas de outra célula.

## 8. Governança de migrations e Git — há divergências a reconciliar

**Supabase remoto (consultado em 07/11/2026):** 137 versões registradas; última `20261101023853_current_person_id_auth_uid_only`. P0-B (`20261106120000`) não registrada.

**Comparação `main@972af8e` do GitHub (API):** 100 arquivos `.sql` no diretório `supabase/migrations`; histórico remoto tem 137 versões. No snapshot anterior à inclusão da P0-B, `main` tinha 99 SQL: 95 versões em comum, 4 locais sem histórico remoto e 42 remotas sem SQL na `main`. Após o commit da P0-B, o arquivo foi adicionado e não registrado remotamente (não supor que o conteúdo das coincidentes seja idêntico: comparação é só pelo ID).

**Comparação local relatada anteriormente pelo Kilo:** 101 `.sql` locais contra 137 remotas, 96 versões comuns, 5 locais sem remoto, 41 remotas sem SQL local. Posteriormente o Kilo informou **100 arquivos locais**, mas afirmou que a referência `origin/main` no PC teria **109 SQL**, com **9 arquivos ausentes no worktree**. A API do GitHub em `main@972af8e` mostrou **100 SQL e nenhum desses nove arquivos**. Portanto, **não tratar 109 como o estado da branch publicada** nem restaurar arquivos antes de verificar Git local.

Os **nove nomes alegadamente presentes no `origin/main` local mas ausentes no worktree**:
1. `20250101_chat.sql`
2. `20260902000000_platform_hardening_v1.sql`
3. `20260902000001_reconcile_services_cms.sql`
4. `20260903000001_p0_01_collision_and_schema.sql`
5. `20260903000002_p0_02_repair_chain.sql`
6. `20260903000003_p0_03_event_emitter.sql`
7. `20260903000004_p0_04_tenants_rls.sql`
8. `20261017_tenant_memberships_immutability_trigger.sql`
9. `20261017_tenant_memberships_immutability_trigger_rollback.sql`

**Ações somente leitura para reconciliar:** `git rev-parse HEAD`, `git rev-parse refs/remotes/origin/main`, `git ls-remote origin refs/heads/main` (consulta rede), `git status --short`, `git diff --name-status HEAD origin/main -- supabase/migrations`, `git ls-tree -r --name-only HEAD -- supabase/migrations`, `git ls-tree -r --name-only origin/main -- supabase/migrations`, `git ls-files -v -- supabase/migrations`, verificar `git sparse-checkout list`/`skip-worktree`. Sem fetch/pull/checkout/restore sem autorização.

**Pendente de governança:** recuperar a proveniência das 41–42 versões remotas sem SQL no snapshot comparado, sem inventar scripts históricos nem executar `migration repair`; depois auditar schema/RLS efetivo. Conteúdo/hash SQL não foi comparado.

## 9. Próximos gates e prioridade

| Gate | Foco | Estado ao entregar o handoff |
|---|---|---|
| G0 | Identificar workspace correto, ler AGENTS/docs e estado Git | **Primeira ação Codex, somente leitura** |
| G1 | Recrutamento, observabilidade e Central de Comando versionados | **Commit GitHub confirmado**; implementação != homologação |
| G2 | TypeScript global, lint, build com exit code | **Pendente de comprovação**; pedir autorização antes de executar tarefas de escrita/caches quando necessário |
| G3 | Smoke visual dark/light/responsividade + loading/erro/vazio | **Pendente** |
| G4 | P0 candidatos: confirmação e-mail/Auth/callback/logs | **Aberto; primeiro diagnóstico local read-only** |
| G5 | P0 formulários: remover sucesso falso e mock local | **Aberto** |
| G6 | P1 contratos/permissões e matriz 26 células | **Aberto** |
| M1 | Histórico remoto × local por versão | **Consultado, mas Git local tem divergência reportada** |
| M2 | Proveniência das 41–42 versões remotas sem SQL local | **Pendente** |
| M3 | Schema efetivo/RLS/Storage | **Pendente** |
| M4 | Avaliar migrations locais sem histórico | **Pendente; P0-B bloqueada** |

**Ordem recomendada:** (i) ambientação segura do Codex; (ii) fechar divergência de referências Git; (iii) investigar P0 candidato localmente, depois Auth/SMTP remotos só com autorização; (iv) fechar validação de build Recrutamento; (v) P0 formulários; (vi) P1 matriz de contratos/células; (vii) trilha migrations/Storage independente. Se o proprietário definir outra prioridade, registrar alteração de gate.

## 10. Autorizações e proibições

**Acesso ao workspace:** o Codex pode ler arquivos do projeto aberto no VS Code, conforme permissões da extensão. **Não tem automaticamente acesso às conversas deste ChatGPT, memórias pessoais, contas/conectores do ChatGPT ou Supabase remoto.** Este arquivo é a ponte de contexto explícita.

**Auditoria inicial permitida pelo objetivo desta passagem:** inspeção local de arquivos e comandos de leitura Git; nenhum arquivo do projeto deve ser alterado durante a ambientação. Não confundir leitura com permissão de edição.

**Exigir autorização explícita e separada para:** editar implementação; instalar/remover dependências; encerrar processos; criar/alterar arquivos rastreados; criar usuários de teste, disparar e-mails; acessar logs sensíveis; alterar Auth/SMTP/RLS/Storage/Edge; executar migrations; `db push/up/repair/reset`; commit/push/merge/PR/deploy. Ferramentas de conexão podem pedir autenticação do usuário; **nunca solicite que chaves, tokens, senha SMTP, service-role key ou `.env` sejam colados na conversa**.

**Proibição permanente sem autorização:** mudanças remotas, permissões artificiais, dados fictícios como reais, bypass de RLS/RBAC, alterações no `DispatcherMaster`, aplicação de P0-B, renomear empresa/footer contra `AGENTS.md`, interferir em outros repositórios, `git reset --hard`, `git clean`, checkout destrutivo, reescrever migrations históricas.

**LGPD:** não imprimir e-mails de candidatos, CPF, currículos, tokens, metadados sensíveis ou conteúdo de `private-documents` em logs/chat/relatórios. Preferir contagens e evidências minimizadas.

## 11. Como obter dados reais no Codex, SEM compartilhar nossas credenciais

1. **Código e documentos:** abrir a pasta correta no VS Code, com repositório presente. GitHub `origin` é a fonte pública versionada; para observar diferenças locais, usar ferramentas do workspace.
2. **Supabase:** conectar o **MCP oficial Supabase** separadamente no Codex, pelo fluxo de autorização da conta, **escopado ao projeto** `okxqfyoqbhcmflpurfrw` e **read-only**: `https://mcp.supabase.com/mcp?project_ref=okxqfyoqbhcmflpurfrw&read_only=true`. A instalação/assinatura deve ser feita pelo usuário e revisada; ter uma conexão ChatGPT **não significa** que o Codex tenha a mesma conexão. Não registrar segredos no repo.
3. **GitHub remoto:** o workspace pode ler `git` e o `origin` configurado; para acessar API privada, qualquer autenticação é separada e deve usar permissões mínimas. Não dar autorização de push como pré-condição de auditoria.
4. **Chats/memórias:** não existe transferência automática integral das conversas pessoais. Para sincronizar decisões futuras, atualizar um documento de passagem e colar um resumo de volta no ChatGPT; não supor memória compartilhada persistente.
5. **MCP e ferramentas:** primeiro listar ferramentas/conexões disponíveis; não alegar acesso remoto antes de comprovar.

## 12. Primeira resposta que esperamos receber do Codex

Produza, **SEM MODIFICAR NADA**:

1. `WORKSPACE`: caminho, branch/HEAD, `origin/main` local, `main` remota, worktree (sem segredos).
2. `DIRETRIZES`: `AGENTS.md` encontrado, regras críticas, documentos lidos e conflitos.
3. `ARQUITETURA`: mapa CORE/Dispatcher/células, quais são reais, quais são declaradas.
4. `GATES`: Recrutamento, Central de Comando, P0 candidato, formulários, permissões, P0-B, migrations.
5. `DIFERENÇAS`: comparação factual do código local vs o que este handoff diz; lista de fatos que mudaram desde `972af8e`.
6. `PRÓXIMO PASSO RECOMENDADO`: exatamente uma atividade pequena e verificável, com arquivos, critérios de aceite e autorização necessária.
7. `ESCOPO ESTRITAMENTE READ-ONLY`: confirmar zero arquivos modificados, zero commits, zero migrations, zero chamadas mutáveis remotas.

## 13. Protocolo de parceria contínua ChatGPT ↔ Codex

- **ChatGPT:** consolida contexto, hipóteses, arquitetura, auditorias, priorização e instruções a partir de evidências e acesso autorizado a conectores.
- **Codex no VS Code:** inspeciona o **worktree de verdade**, executa validações locais autorizadas, prepara diffs e relatórios; implementa **apenas** quando o proprietário liberar escopo.
- **Proprietário:** aprova gates separados: diagnóstico, edição local, teste, acesso remoto, aplicação de migration, commit, push, deploy.
- **Depois de cada sessão Codex:** devolver ao ChatGPT **branch/HEAD, paths alterados, diffs, testes com exit code, erros, achados, evidências, decisões pendentes e autorizações usadas**. Isso evita que ambos inventem continuidade.
- **Não manter duas fontes da verdade divergentes:** o repositório/DB são fontes da verdade do estado técnico; a passagem de contexto é uma fotografia datada e deve ser atualizada apenas com evidência.

---

**Referências verificáveis:**
- Commit: https://github.com/Evandro-J-O-Andrade/jstercerizados/commit/972af8e4f4181ff7f56e5c8c20d14ea14cd60e54
- Repo: https://github.com/Evandro-J-O-Andrade/jstercerizados
- AGENTS.md: https://github.com/Evandro-J-O-Andrade/jstercerizados/blob/main/AGENTS.md
- Documentação oficial Supabase MCP: https://supabase.com/docs/guides/ai-tools/mcp
- Codex e instruções AGENTS.md: https://developers.openai.com/cookbook/examples/codex/iterating-development-workflows-with-codex
