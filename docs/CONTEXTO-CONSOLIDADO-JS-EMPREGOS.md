# CONTEXTO CONSOLIDADO — J&S Empregos LTDA

> # ⚠️ DOCUMENTO DE CONTEXTO — NÃO É ORDEM DE IMPLEMENTAÇÃO
>
> Este arquivo é **memória arquitetural e contrato de trabalho**.
> Ele **não** autoriza alterar código, banco, migrations, RLS, rotas ou estrutura.
>
> - Nada aqui deve ser lido como "faça isso".
> - Cada item só vira trabalho depois de **autorização verbal explícita** para aquele checkpoint.
> - Se um número aqui divergir do repositório, **o repositório vence**. Este documento é um retrato de `c84f686` + worktree sujo em 2026-10-04.
> - Nenhum item "DEFINIDO" ou "PENDENTE" deste documento foi executado.

---

## 0. Como usar este documento

1. Leia §1 (legenda), §2 (regras que não se negociam), §5 (matriz realidade vs decisão).
2. Para o detalhe de qualquer decisão, vá ao documento canônico indicado em §3. **Este arquivo não substitui nenhum deles.**
3. Antes de qualquer escrita: consulte §2 e §7 (bloqueios).
4. Se for going to mexer em código, atualize §6 e §8 ao final, senão este arquivo envelhece e vira exatamente o problema que ele existe para resolver.

---

## 1. Legenda de classificação

| Marca | Significado | Regra de ação |
| --- | --- | --- |
| ✅ CONCLUÍDO | Existe e verificado funcionando nesta medição | Não reabrir sem autorização |
| 🔒 CONGELADO | Preservar byte a byte | Nunca tocar |
| 📋 DEFINIDO | Decisão arquitetural já tomada | Não redecidir; falta implementar |
| 🔎 AUDITADO | Só levantamento/evidência | Nenhuma mudança decorre disso |
| ⏳ PENDENTE | Ainda não executado | Requer autorização |
| 🚫 BLOQUEADO | Não executar sem autorização | Parar e perguntar |
| ⚠️ PREEXISTENTE | Já estava sujo antes | Não misturar com trabalho novo |
| ❌ NÃO AUTORIZADO | Explicitamente proibido | Não fazer |
| 🔴 QUEBRADO | Existe e está falhando | Não propagar; corrigir sob autorização |

---

## 2. Regras que não se negociam

Estas vêm de `AGENTS.md` (raiz) e têm prioridade sobre qualquer refactoring, plano ou prompt.

1. **Não escrever no Supabase sem autorização.** Sem migration, RLS, grant, seed, trigger ou function. Bancos são read-only por padrão.
2. **Documentação primeiro, código depois.** Implementação só após verificação e autorização explícita.
3. **Não duplicar.** Antes de criar componente, rota, hook, service, repository ou doc: procurar se já existe.
4. **Supabase é a fonte da verdade.** Não inventar dado, não substituir real por mock, não criar tabela/RPC sem verificar schema.
5. **Frontend não inventa autoridade.** Uma permissão exigida pelo código que não existe em `public.permissions` é defeito a corrigir no código ou no contrato — nunca se resolve criando a permissão "porque o frontend pediu".
6. **Cadeia de permissão fechada:** `código → chave → permissions → role_permissions → RLS/user_has_permission()`. Uma elos quebrando invalida todo o trecho.
7. **RLS é a última barreira.** Nunca confiar só na UI.
8. **`admin_master` não é bypass.** Nenhum `if (admin_master) libera tudo`. Bypass foi removido em `c84f686`.
9. **Site público é protegido.** Nada de rebrand, nada de mudar "J&S Empregos LTDA", nada de mexer no footer.
10. **Commit, push, deploy só com autorização explícita e separada.** "Terminou", "pode continuar", "faça a implementação" **não** autorizam push nem deploy.
11. **Não misturar alterações preexistentes.** Ver §6.
12. **Uma worktree suja não é autoridade para escrever.** Se o status de uma migração é incerto, tratar como em andamento e não assumir posse.

---

## 3. Onde está a decisão (índice canônico — não duplicar)

O repositório tem **510 arquivos `.md`**. Não criar mais um documento por assunto. Os canônicos são:

| Tema | Documento canônico |
| --- | --- |
| Números do banco, critérios de medição | `docs/architecture/ERRATA-INVENTARIO-01.md` |
| Desenho modular definitivo do Portal | `docs/architecture/ARCHITECTURE-05-MODULAR-PORTAL-DESIGN.md` |
| Contrato de implementação de célula | `docs/architecture/ARCHITECTURE-05-IMPLEMENTATION-CONTRACT.md` |
| Spine SaaS (o que existe) | `docs/architecture/ARCHITECTURE-03-SAAS-SPINE.md` |
| Reconciliação banco → frontend | `docs/architecture/ARCHITECTURE-04-RECONCILIATION.md` |
| Contrato do AppShell | `docs/architecture/02C.1-APPSHELL-CONTRACT.md` |
| Reconciliação da documentação | `docs/architecture/02C.2-DOCUMENTATION-RECONCILIATION.md` |
| Contrato canônico de autorização | `docs/architecture/02C.3-AUTORIZACAO-CONTRATO.md` |
| Mapa mestre do banco | `docs/DATABASE-MASTER-MAP.md` |
| RBAC do domínio de recrutamento | `docs/V21-RBAC-RECRUITMENT-CONTRACT.md` + `docs/V21-RBAC-RECRUITMENT-AUDIT.md` |
| RBAC geral do banco | `docs/RBAC-04-INVENTORY.md`, `docs/V21-RBAC-MATRIX.md` |
| Regras de proteção do projeto | `docs/PROTECTION-RULES.md` |
| Arquitetura do site público | `docs/SITE_ARCHITECTURE.md` |

> `docs/architecture/` inteiro é **untracked** no Git (ver §6). Ele existe em disco e é a maior fonte de decisão do projeto, mas **não está versionado**.

---

## 4. Ambiente medido

| Item | Valor |
| --- | --- |
| Repositório | `C:\NewWaveProjetos\jrtercerisados` |
| Branch | `main` |
| `HEAD` | `c84f686` — *fix: authorization consistency — remove admin_master permission/audience bypass, fix context-aware role resolution* |
| `origin/main` | **em sincronia** (0 atrás / 0 à frente) |
| Worktree | **sujo**: 97 alterações |
| Data da medição | 2026-10-04 |
| Banco | `db.okxqfyoqbhcmflpurfrw.supabase.co` — conectado **read-only** (`default_transaction_read_only=on`, confirmado na sessão) |

### 4.1 Resultado das verificações

| Verificação | Comando | Resultado |
| --- | --- | --- |
| Tipos | `npx tsc --noEmit` | ❌ **136 erros**, exit 2 |
| Lint | `npx eslint .` | ⚠️ 310 problemas — **8 erros**, 303 warnings |
| Testes | `npx vitest run` | ❌ **10 suítes falhas**, 3 testes falhos — 477 passam, 2 pulados (482) |
| Build | — | **não executado** (depende de `tsc -b`, que falha) |

**Os 8 erros de lint estão todos em `test-hero-dimensions.js`** (arquivo JS na raiz, não relacionado aos módulos). Nenhum erro de lint em `src/`.

**Os 136 erros de tipo estão 100% confinados a diretórios untracked:**

| Arquivo/pasta | Erros |
| --- | ---: |
| `src/modules/recrutamento/repositories/candidates.repository.ts` | 28 |
| `src/modules/recrutamento/repositories/applications.repository.ts` | 19 |
| `src/modules/recrutamento/repositories/job-matches.repository.ts` | 15 |
| `src/modules/recrutamento/RecrutamentoContext/RecrutamentoContext.tsx` | 13 |
| `src/modules/recrutamento/authorization/RecrutamentoAuthorization.tsx` | 4 |
| `src/modules/recrutamento/RecrutamentoRoutes/RecrutamentoRoutes.tsx` | 2 |
| `src/modules/candidato/**` (restante) | 55 |

Por código: `TS7006` 55 (implicit any) · `TS2307` 37 (módulo não resolvido) · `TS2339` 24 · `TS17019` 10 · `TS7031` 5 · `TS7053` 2 · `TS6133` 2 · `TS2322` 1.

---

## 5. Matriz: DECISÃO vs REALIDADE

Verificada contra o código nesta medição.

| Eixo | O que foi definido | Realidade medida | Estado |
| --- | --- | --- | --- |
| **Portal modular (3 tiers)** | Shell → Workspace → Module, cada módulo uma célula isolada | `PortalShell.tsx` 3,1 KB · `ModuleWorkspace.tsx` 3,1 KB · `ModuleSidebar.tsx` 2,3 KB · `ModuleRegistry.ts` **71,7 KB** · `ModuleCardGrid.tsx` 10,9 KB | ✅ **EXISTE** |
| **Módulos isolados** | 1 módulo = 1 célula com bootstrap, container, context, auth, nav, sidebar, routes, dashboard, repositories, services, types | `src/modules/` tem 12 diretórios (`candidato`, `empresas`, `estoque`, `financeiro`, `fiscal`, `operacoes`, `pos`, `recrutamento`, `rh`, `servicos`, `sistema`, `suporte`). Só `recrutamento` e `candidato` têm a célula completa — e ambas **untracked e quebradas** | ❌ **NÃO IMPLEMENTADO** |
| **RBAC — cadeia Auth→Permissões** | `Auth → People → Tenant → Membership → Role → Permissions` | `AuthContext.tsx:141-289` faz exatamente: `people` → `tenant_memberships` → `tenants` → `role_assignments` → `roles` → `role_permissions` → `permissions` → `normalizePermissions` | ✅ **REAL** |
| **RBAC — função no banco** | `user_has_permission()` é a barreira | 78 ocorrências em 6 migrations; mais recente versionada: `20261002000001_security_hardening_functions.sql` | ✅ **REAL** |
| **Permissões reais** | Toda chave exigida pelo código existe em `public.permissions` | **MEDIDO NO BANCO.** `MODULE_PERMISSION_MAP` declara 26 chaves não vazias. **22 existem, 4 não.** Ausentes: `fiscal.read`, `accounting.read`, `stock.read` (estoque **e** almoxarifado). O banco tem vocabulário mais fino: 12 chaves `fiscal.*`, 19 `accounting.*`, e para estoque **só** `stock.dashboard.read` + `stock_movements.*` — **não existe resource `stock`** | 🔴 **QUEBRADO** |
| **Vocabulário de permissão do banco** | Chave canônica `resource || '.' \|\| action` | **MEDIDO.** 230 permissões · 71 resources · 739 `role_permissions` · 53 roles. Confere com a ERRATA. A chave é canônica **e hierárquica** — `finance.dashboard` e `finance.dashboard.read` coexistem como pai e filho | 📋 **DEFINIDO** |
| **Módulos sem gate de permissão** | Todo módulo exige permissão | **6 entradas de `MODULE_PERMISSION_MAP` têm string vazia** (`inicio`, `ia`, `preferencias`, `minha-conta`, `seguranca-conta`, `notificacoes`). `PermissionGuard.tsx:78` e `ModuleRouter.tsx` tratam lista vazia como **concedido** | 🔴 **QUEBRADO** |
| **Mapa de permissão centralizado** | Um registro único, versionado | `MODULE_PERMISSION_MAP` **está** centralizado em `ModuleRegistry.ts:2460` e importado em `App.tsx`. Correção: não está "soltamente em App.tsx" — App.tsx só consome | ✅ **REAL** (mas dentro do arquivo de 71,7 KB) |
| **`admin_master` sem bypass** | Nunca liberar tudo por flag | `c84f686` removeu o bypass de `PermissionGuard`. `admin_master` ainda aparece em 24 arquivos (rotas, footer, tipos, testes) — maioria legítima (rótulo de papel, escopo de rodapé) | 📋 **DEFINIDO** (remoção commitada; varredura completa pendente) |
| **Contexto do usuário** | `%tenant%` `%context%` %perfil por contexto | Tokens `%username%`/`%role%`/`%permissions%`/`%tenant%`/`%context%` existem em **1 lugar no código** (`src/__tests__/utils/template-resolver.test.ts`) e como **setas de diagrama** em `docs/ARCHITECTURE.md:300`. **Não são o mecanismo de RBAC** | 🔎 **AUDITADO** — não é mecanismo |
| **Rotas** | Rotas explícitas + launcher, sem duplicação | `route-map.json` dado como correto: 62 explícitas, 27 de launcher, 89 no total, **21 duplicações exatas** | 📋 **DEFINIDO** — 21 duplicatas abertas |
| **RLS** | 100% das tabelas com RLS, RLS como última barreira | Via ERRATA: 221/221 tabelas com RLS, 600 policies em `public`, 616 em todos os schemas | ✅ **REAL** (medido no banco, não reconfirmado hoje) |
| **Inventário do banco** | Fonte de verdade para decisões | `schema_dump.sql` na raiz tem **0 bytes** — não serve como evidência. `docs/architecture/supabase-inventory.json` tem `totals` mas **não tem bloco `permissions`** — as 230 permissões não são legíveis por máquina no repo | 🔴 **QUEBRADO** (evidência ausente) |
| **`docs/architecture/`** | Contrato arquitetural vigente | Existe e é rico (8 `.md` + 7 inventários JSON), mas **100% untracked** | ⚠️ **PREEXISTENTE** |
| **`recrutamento` como célula-piloto** | Validar antes de criar as outras células | Célula **escrita** entre 01:11 e 02:05 de 04/10, nunca commitada, **não compila**. `RECRUTAMENTO_RBAC_AUDIT.md` **não existe** apesar de o histórico afirmar que foi escrito | 🔴 **QUEBRADO** |
| **Candidate signup** | Um formulário oficial por contexto | Rotas existem: `/cadastro`, `/cadastro/candidato`, `/cadastro/empresa`, `/entrar` com `EntrarAdmin`/`EntrarCandidato`/`EntrarEmpresa`, `/divulgar-vaga`. Diagnóstico em `docs/P0-CANDIDATE-REGISTRATION-DIAGNOSIS.md`. **Não testado funcionalmente** | ⚠️ **PARCIAL** |
| **Site público** | Intocado | `src/pages/` com `Home`, `Sobre`, `Servicos`, `Vagas`, `Empresas`, `Blog`, `FAQ`, `Contato`… preservados | 🔒 **CONGELADO** |
| **Candidatos / Empresas (áreas)** | Isoladas do SaaS admin | Migração `src/features/candidato` + `src/repositories/candidate-*` → `src/modules/candidato` **pela metade**: 50 arquivos `D`, pasta nova untracked, 23 imports apontando para `@/modules/candidato/context/CandidateContext` que não existe mais, `src/modules/candidato/context/` **vazia** | 🔴 **QUEBRADO** |
| **200+ tabelas** | Banco canônico amplo | 221 tabelas + 5 views = 226 objetos. **70 tabelas e 4 views têm acesso a dados no código; 151 tabelas e 1 view não têm.** "Sem frontend" ≠ "precisa de tela" | 📋 **DEFINIDO** |
| **Auditoria** | Evidência antes de mudança | ~200 documentos de auditoria existem. Nenhuma delas é evidência atual — este documento é a primeira medição de 04/10 | 🔎 **AUDITADO** |

### 5.1 Achados que exigem decisão (não execution)

1. **4 chaves exigidas pelo código e inexistentes no banco** (`fiscal.read`, `accounting.read`, `stock.read` ×2 módulos). A migration que as cria está escrita e **não deve ser aplicada** — ver §7.2. Correção de cada uma: mapear para o vocabulário real (`fiscal.dashboard.read`, `accounting.dashboard.read`, `stock.dashboard.read`) **ou** reconfigurar o gate do módulo. **Não inventar a chave.**
2. **6 módulos sem gate de permissão.** Vazio = concedido. É brecha de desenho, não bug de digitação.
3. **`admin-master` mapeado para `domain_events.read`.** Semântico errado para um módulo administrativo.
4. **`candidato` mapeado para `candidates.self.read`.** Usar permissão de escopo pessoal como gate de módulo é categoria errada.
5. **`pos` e `operacoes` existem em `src/modules/` e não estão em `MODULE_PERMISSION_MAP`.** Módulo sem mapa é módulo sem autorização.
6. **Duplicação em `src/modules/recrutamento/pages/`:** `Candidatos`/`RecrutamentoCandidatos`, `Vagas`/`RecrutamentoVagas`, `Etapas`/`RecrutamentoEtapas`, `Candidaturas`/`RecrutamentoCandidaturas`, `JobMatches`/`RecrutamentoMatches`, `CandidatoDetalhe`/`RecrutamentoCandidatoDetalhe`. Viola §2.3.
7. **3 testes de autorização estão falhando** em arquivos versionados — `ModuleContext.resolution.test.tsx` (2, resolução de módulo Recrutamento) e `PortalSidebar.authorization.test.tsx` (1, troca de tenant → permissões de Recrutamento). São regressões do worktree, não do `HEAD`.

### 5.2 Qual célula pode ser construída sem migration — MEDIDO

Verificação read-only das chaves declaradas nos mapas de permissão das duas únicas células escritas:

| Célula | Chaves declaradas | Com lastro em `public.permissions` | Migration necessária |
| --- | ---: | ---: | --- |
| `recrutamento` | 32 | **32** | **NENHUMA** |
| `candidato` | 9 | **9** | **NENHUMA** |

Papéis que já recebem permissão no domínio de recrutamento:

| Papel | Permissões no domínio |
| --- | ---: |
| `rh_manager` | 27 |
| `tenant_admin` | 26 |
| `admin_master` | 24 |
| `recruiter` | 20 |
| `candidato` | 4 |

Leitura: **`recrutamento` é a célula de referência correta.** É a única com escopo de domínio completo no banco, com 100% das chaves com lastro e com papéis já populados. `finance_manager` não aparece — coerente com a auditoria anterior.

Contraste que prova o critério: em `contabilidade`/`fiscal`/`estoque`, os papéis estão praticamente vazios (`accounting_manager` 1 permissão, `fiscal_manager` 1, `stock_manager` 4) **e** as chaves de gate não existem. Essas células **não podem** ser construídas hoje sem antes decidir a autorização.

> Essas duas células continuam untracked e não compilando (§6). O|lastro no banco é requisito necessário, **não** prova de funcionamento.

---

## 6. Worktree: o que está pela metade

`git status --porcelain` → **M=41, D=50, ??=6**

### 6.1 Untracked (`??`) — nunca versionado, nunca commitado

```
schema_dump.sql                                        (0 bytes — inútil)
src/__tests__/auth/AuthContext.single-init.test.tsx
src/components/feedback/ContentBoundary.tsx
src/modules/candidato/                                 (pasta inteira)
src/modules/recrutamento/                              (pasta inteira)
supabase/migrations/20261002000002_add_module_read_permissions.sql
public/images/home/cards/cardherosSite.png            (1,5 MB — imagem nova do usuário, fora da migração)
```

> A worktree ganhou e perdeu arquivos durante a medição. `public/images/home/cards/js_transparente_alta.png` existiu no início da sessão e já não existe; o untracked de imagem agora é `cardherosSite.png`. **Alterações de imagem do usuário não entram no diagnóstico de implementação.**

### 6.2 Deletados (`D=50`) — nunca foram commitados

`src/features/candidato/**`, `src/repositories/candidate-*`, `src/repositories/candidate-portal/**`, `src/contexts/CandidateContext.tsx`, `src/components/portal/Candidate{Content,Header,Portal,Sidebar}.tsx`, `src/components/layout/CandidateBottomNavigation.tsx`, `src/services/{candidate-context,matching}.ts`, `src/types/domain/{candidate,candidate-context}.ts` e 8 testes.

> ⚠️ Se esses arquivos forem restaurados, os 50 `D` desaparecem. **Não commitar os `D` sem antes decidir o destino da célula Candidato.**

### 6.3 Modificados (`M=41`)

Concentrados em: `src/App.tsx`, `src/contexts/AuthContext.tsx`, `src/contexts/ModuleContext.tsx`, `src/components/portal/{MetroTiles,ModuleRegistry,ModuleWorkspace}.ts(x)`, `src/platform/router/{ModuleRouter,module-routes}.ts`, `src/components/auth/{CandidateRoute,ProtectedRoute}.tsx`, `src/hooks/useCandidates.ts`, `src/repositories/{index,job-matches,talent-pool}.repository.ts`, e ~26 páginas em `src/pages/dashboard/`.

### 6.4 Regra para tocar neste worktree

Não assumir posse de nada. A migração Candidato está pela metade e Recrutamento foi gerado sobre ela. Antes de qualquer escrita é preciso uma **decisão explícita** entre: (a) concluir, (b) reverter, ou (c) isolar em worktree limpa a partir de `c84f686`. As três são legítimas — nenhuma é óbvia.

---

## 7. Bloqueios

| # | Bloqueio | Por quê |
| --- | --- | --- |
| 1 | **Qualquer escrita no Supabase** | §2.1. Migração, RLS, grant, seed, trigger, function — tudo bloqueado |
| 2 | **`20261002000002_add_module_read_permissions.sql`** | ❌ NÃO AUTORIZADO — e o texto dela **depende de um bypass que não existe mais**: afirma que `admin_master` obtém acesso por `select * from permissions` no `AuthContext`, caminho removido em `c84f686`. Além disso concede `fiscal.read`/`accounting.read`/`stock.read` só a `tenant_admin` e ao manager do setor. Não aplicar sem rediscutir a premissa |
| 3 | **`01E.0 — Reconciliação do Inventário`** | ⏳ PENDENTE, sem autorização |
| 4 | **Rotação das contas `teste.*`** | ⏳ PENDENTE. `docs/SEED-HOMOLOGACAO-USUARIOS.md` é seed de homologação, **não produção** |
| 5 | **Seed institucional** | 🚫 BLOQUEADO. Alvo quando autorizado: J&S Empregos LTDA, tenant `d480af07-ab6b-4561-ac3a-2a0b0c1267b5`, `candidatos@jsempregos.com.br` |
| 6 | **Commit / push / deploy** | 🚫 BLOQUEADO sem autorização explícita e separada |
| 7 | **`temp-auth.json`** | Contém credenciais reais. Ignorado (`.gitignore:50`), untracked. **Não ler, não exibir, não reproduzir** |
| 8 | **Assume a migração Candidato** | 🚫 BLOQUEADO. Estado incerto = tratar como em andamento |
| 9 | **`docs/architecture/` untracked** | ⚠️ Não adicionar cegamente. Decidir arquivo a arquivo |
| 10 | **`contentboundary` (`02C.3`)** | ⏳ Não autorizado. `src/components/feedback/DataState.tsx` segue sem alterações e sem consumidores |

---

## 8. Sequência sugerida (não autorizada — apenas ordem lógica)

Nenhum passo deste bloco pode ser executado sem autorização.

1. **Decidir o destino da worktree** (concluir / reverter / isolar). Bloqueia todo o resto. §6.4
2. **Fechar a cadeia de permissão.** Escolher, por cada uma das 3 chaves órfãs: corrigir o código ou propor migration com premissa reescrita. §5.1-1
3. **Decidir os 6 módulos sem gate.** §5.1-2
4. **Sanear o mapa de módulo.** `admin-master`, `candidato`, `pos`, `operacoes`. §5.1-3..5
5. **Eliminar as 6 páginas duplicadas** de Recrutamento. §5.1-6
6. **Restaurar as 3 regressões de teste** em arquivos versionados. §5.1-7
7. **Resolver as 21 duplicações de rota.** §5
8. **Reverter a inflação documental.** 510 `.md` é o maior obstáculo à continuação. Consolidar em §3 e aposentar o resto, por decisão explícita
9. **Só então** criar as demais células, uma por vez, com a cadeia da §10

---

## 9. Correções a registos anteriores

Documento é mais forte que memória. Onde divergem, vale o que está aqui.

| Registro anterior | Realidade medida |
| --- | --- |
| `HEAD` = `8482111` | `HEAD` = **`c84f686`** |
| `main` 3 commits à frente de `origin/main` | **Em sincronia** (0/0) |
| "136 alterações preexistentes" | 97 alterações (M=41, D=50, ??=6). Os **136** é o número de **erros de tipo** |
| "`549 passed`" (P1.6-A) | **477 passed / 3 failed / 482** no worktree atual |
| "`docs/architecture/` está vazio" | Tem 8 `.md` + 7 JSON. **Untracked**, mas rico |
| "`RECRUTAMENTO_RBAC_AUDIT.md` documenta a auditoria" | **O arquivo não existe.** O histórico afirma; o disco não confirma |
| "Célula Recrutamento incompleta (container/context/auth inexistentes)" | **Existem** — escritas 04/10 entre 01:11 e 02:05, depois da auditoria, untracked, não compilando |
| ERRATA §5.1: "`supabase-inventory.json` não tem bloco `totals`" | **Tem `totals`.** A observação está vencida. A ausência real é o bloco `permissions` |
| "P1.6-A commitado em `8482111`, só `PermissionGuard.tsx`" | O bypass foi removido em **`c84f686`**, cujo escopo foi maior: bypass + resolução de role context-aware |

---

## 10. Contrato de construção de célula (quando autorizado)

Uma célula só existe quando **todos** estes elos estão presentes e verificados:

```
BANCO REAL
   ↓  tabela existe, RLS ativa, permission existe em public.permissions
ROLE_PERMISSIONS
   ↓  o papel certo recebeu a permissão certa
RLS / user_has_permission()
   ↓  última barreira, testada
REPOSITORY
   ↓  sem mock, sem dado inventado
SERVICE
   ↓  regra de negócio, sem UI
HOOK
   ↓  consumindo o service, não o banco direto
FORM / CRUD
   ↓  real, contra o repository
PÁGINA
   ↓
DASHBOARD DO MÓDULO
   ↓
ROTA
   ↓
PORTAL
```

Proibido em qualquer elo: mock, botão sem ação, `if (admin_master) libera tudo`, chave de permissão que não existe no banco, estrutura paralela que não corresponde ao Supabase.

---

## 11. Log de medição

| Quando | O que | Resultado |
| --- | --- | --- |
| 2026-10-04 | `git log` / `status` | `c84f686`; 97 alterações; `origin/main` em sincronia |
| 2026-10-04 | `npx tsc --noEmit` | 136 erros, exit 2 — todos em pasta untracked |
| 2026-10-04 | `npx vitest run` | 10 suítes falhas / 3 testes; 477 passam; 147,67s |
| 2026-10-04 | `npx eslint .` | 310 problemas; 8 erros, todos em `test-hero-dimensions.js` |
| 2026-10-04 | `schema_dump.sql` | 0 bytes |
| 2026-10-04 | `MODULE_PERMISSION_MAP` | 33 entradas, 6 vazias |
| 2026-10-04 | `AuthContext.tsx` | cadeia people → … → permissions confirmada |
| 2026-10-04 | `%tokens%` | 1 ocorrência em `src/`, 1 em diagrama de `docs/` |
| 2026-10-04 | contagem `.md` | 510 no repositório |
| 2026-10-04 | Supabase read-only | `default_transaction_read_only=on` confirmado. **230 permissions · 71 resources · 739 role_permissions · 53 roles** — confere com a ERRATA |
| 2026-10-04 | 26 chaves do `MODULE_PERMISSION_MAP` × banco | **22 existem, 4 não.** Detalhe em §5 |
| 2026-10-04 | lastro das células | `recrutamento` **32/32**, `candidato` **9/9**. Nenhuma migration necessária |

> Números do banco neste documento foram medidos diretamente com `default_transaction_read_only=on` em 2026-10-04. Nenhuma escrita foi executada; os scripts de auditoria usados eram temporários e foram removidos.