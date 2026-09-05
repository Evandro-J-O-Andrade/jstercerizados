# Auditoria Completa — J&S Empregos LTDA

**Data**: 2026-09-04  
**Tipo**: Levantamento READ-ONLY  
**Fonte**: Git, worktrees, migrations, Supabase, código fonte, documentação  
**Regra**: Nenhuma alteração aplicada durante esta auditoria.

---

## 1. INVENTÁRIO DAS WORKTREES

### 1.1 Worktree Principal (main)

| Campo                   | Valor                                       |
| ----------------------- | ------------------------------------------- |
| Caminho                 | `C:\NewWaveProjetos\jrtercerisados`         |
| Branch                  | `main`                                      |
| HEAD                    | `c05822fc2388e9fae60948d502d8c972159773e5`  |
| Data do HEAD            | 2026-09-04 16:32:49 -0300                   |
| Working tree            | **Clean** (sem modificações não commitadas) |
| Arquivos não rastreados | Nenhum                                      |
| Stash                   | Vazio                                       |
| Divergência origin/main | **24 commits ahead, 9 commits behind**      |

**Descrição**: Branch principal de desenvolvimento. Contém todo o trabalho consolidado de hoje: RBAC-03, candidate portal, footers por escopo, templates, OAuth/Turnstile, ajustes de auth.

### 1.2 Worktree `dedicated-grape`

| Campo                   | Valor                                                               |
| ----------------------- | ------------------------------------------------------------------- |
| Caminho                 | `C:\NewWaveProjetos\jrtercerisados\.kilo\worktrees\dedicated-grape` |
| Branch                  | `fix-applications-repository-query-error`                           |
| HEAD                    | `c773d83d4021a49a00e4fedef85252f0778017de`                          |
| Working tree            | **Clean**                                                           |
| Arquivos não rastreados | Nenhum                                                              |

**Descrição**: Branch de trabalho focada em UI/UX MOCK-driven via Supabase (Blocos 0/1/2/3/5/6/8/9). Contém migrations de P0 reconciliation, company interest RPC, media storage.

### 1.3 Worktree `joyous-quasar`

| Campo                           | Valor                                                             |
| ------------------------------- | ----------------------------------------------------------------- |
| Caminho                         | `C:\NewWaveProjetos\jrtercerisados\.kilo\worktrees\joyous-quasar` |
| Branch                          | `joyous-quasar`                                                   |
| HEAD                            | `708d9c5d36c4723a6b5c9ce1b15445776942765f`                        |
| Working tree                    | **Modified + Untracked**                                          |
| Arquivos modificados (unstaged) | 5 arquivos em `supabase/.temp/`                                   |
| Arquivos não rastreados         | 37 arquivos (docs/, scripts/, public/, v2.1-backup/)              |

**Descrição**: Branch com estado "congelado". Contém documentação V2.1 extensa, scripts de provisionamento, diretório `v2.1-backup/` completo. Migrations drasticamente desatualizadas (apenas até 20260817).

---

## 2. ESTADO DO MAIN

### 2.1 HEAD Local vs Remoto

| Item     | Local                                                                                           | Remoto (origin/main)                                                  |
| -------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| HEAD     | `c05822f`                                                                                       | `ed526a0`                                                             |
| Data     | 2026-09-04 16:32:49 -0300                                                                       | 2026-09-04 17:58:54 -0300                                             |
| Autor    | Evandro Andrade                                                                                 | Evandro Andrade                                                       |
| Mensagem | feat(auth): /entrar reaproveita container visual do Login + /login volta a ser o Login original | test(async): attach rejection assertions before advancing fake timers |

### 2.2 Divergência

**Main local está 24 commits À FRENTE e 9 commits ATRÁS de origin/main.**

**Commits locais NÃO presentes em origin/main (24 commits ahead):**

```
c05822f feat(auth): /entrar reaproveita container visual do Login + /login volta a ser o Login original
2cffbe5 fix(rbac): remover candidato de allowedRoles em /dashboard/* — P0 RBAC candidato/admin
b43c8d2 chore(rollback): snapshot estado atual antes de correcoes estruturais
b239bb2 chore: commit acumulado de evolucoes RBAC-03, candidate portal e matching
2a66cc0 feat(auth): Boas-vindas sem lista de permissoes + entradas /entrar/{admin,candidato,empresa}
bfeaff1 feat(login): card contextual com OAuth (Google/Microsoft) + cadastro inline + Turnstile
e24d011 refactor(cinematic): refinamento bounded do CinematicShowcase
2c183d3 feat(templates): sistema de placeholders %var.path% via banco
3a88056 feat(footer): footers por escopo (global_public imutavel + candidate/company/provider/manager/admin_master)
3d0ef0e feat(shell): ocultar flutuantes em /candidato e /dashboard e mover para sidebar
2f42ce2 feat(candidate-shell): tornar sidebar e bottom-nav dinamicos via banco
a2a4ac1 feat(candidate): consolidate canonical candidate portal
7c34db5 feat(candidate-portal): consolidar AuthContext + App.tsx + Login + candidates.repository
b8b248c test(e2e): script de validacao end-to-end do Candidate Portal
a00480c feat(candidate-portal): services de matching e types do contexto candidato
a0c0e5f feat(db): track migrations aplicadas no Supabase okxqfyoqbhcmflpurfrw
17fc573 test(candidate-portal): mock candidatePreferencesRepository + assert findByPersonId called
f4eb448 feat(candidate-portal): favorite_jobs table + repos + tests + utility scripts
e1fece5 feat(auth): fluxo de recovery seguro (request/callback/reset/destination)
9835c5e fix(auth): redirecionar candidato para /dashboard/candidato (P1.1)
a958c81 test(retry): corrigir Unhandled Rejection em 2 testes de exhausting retries
dc95374 fix(social): atualizar URL do Instagram para o link oficial
b72b5c8 docs(audit): Fase 4 - matriz dominio x tabela x CRUD + E2E candidato
08a6c1b docs(frontend): Bloco 11 — regra arquitetural de mídias + gaps reportados
```

**Commits remotos NÃO presentes no main local (9 commits behind):**

```
ed526a0 test(async): attach rejection assertions before advancing fake timers
342af04 checkpoint company interest rpc
51c7e3e fix(db): restore company interest migration
59def19 fix(db): restore company interest email migration
a1ed280 fix(db): restore company interest migration
fbf8977 fix(db): restore email validation migration content
28ab0c6 fix(db): restore company interest RPC migration content
cb54463 fix(db): correct company interest email validation
e16f281 feat(db): add company interest registration RPC
```

---

## 3. TRABALHO REALIZADO HOJE

### 3.1 Commits de Hoje no Main Local

| Commit    | Data/Hora   | Arquivos | Objetivo                                                                             | Status       |
| --------- | ----------- | -------- | ------------------------------------------------------------------------------------ | ------------ |
| `c05822f` | 04/09 16:32 | 2        | /entrar reaproveita container visual do Login                                        | ✅ CONCLUÍDO |
| `2cffbe5` | 04/09       | —        | P0 RBAC: remover candidato de allowedRoles em /dashboard/*                           | ✅ CONCLUÍDO |
| `b43c8d2` | 04/09       | —        | Snapshot estado atual antes de correcoes estruturais                                 | ✅ CONCLUÍDO |
| `b239bb2` | 04/09       | —        | Commit acumulado de evolucoes RBAC-03, candidate portal e matching                   | ✅ CONCLUÍDO |
| `2a66cc0` | 04/09       | —        | Boas-vindas sem lista de permissoes + entradas /entrar/{admin,candidato,empresa}     | ✅ CONCLUÍDO |
| `bfeaff1` | 04/09       | —        | Card contextual com OAuth (Google/Microsoft) + cadastro inline + Turnstile           | ✅ CONCLUÍDO |
| `e24d011` | 04/09       | —        | Refactor bounded do CinematicShowcase                                                | ✅ CONCLUÍDO |
| `2c183d3` | 04/09       | —        | Sistema de placeholders %var.path% via banco                                         | ✅ CONCLUÍDO |
| `3a88056` | 04/09       | —        | Footers por escopo (global_public + candidate/company/provider/manager/admin_master) | ✅ CONCLUÍDO |
| `3d0ef0e` | 04/09       | —        | Ocultar flutuantes em /candidato e /dashboard                                        | ✅ CONCLUÍDO |
| `2f42ce2` | 04/09       | —        | Sidebar e bottom-nav dinamicos via banco                                             | ✅ CONCLUÍDO |
| `a2a4ac1` | 04/09       | —        | Consolidate canonical candidate portal                                               | ✅ CONCLUÍDO |
| `7c34db5` | 04/09       | —        | Consolidar AuthContext + App.tsx + Login + candidates.repository                     | ✅ CONCLUÍDO |
| `b8b248c` | 04/09       | —        | Script de validacao end-to-end do Candidate Portal                                   | ✅ CONCLUÍDO |
| `a00480c` | 04/09       | —        | Services de matching e types do contexto candidato                                   | ✅ CONCLUÍDO |
| `a0c0e5f` | 04/09       | —        | Track migrations aplicadas no Supabase                                               | ✅ CONCLUÍDO |
| `17fc573` | 04/09       | —        | Mock candidatePreferencesRepository + assert findByPersonId called                   | ✅ CONCLUÍDO |
| `f4eb448` | 04/09       | —        | favorite_jobs table + repos + tests + utility scripts                                | ✅ CONCLUÍDO |
| `e1fece5` | 04/09       | —        | Fluxo de recovery seguro (request/callback/reset/destination)                        | ✅ CONCLUÍDO |
| `9835c5e` | 04/09       | —        | Redirecionar candidato para /dashboard/candidato (P1.1)                              | ✅ CONCLUÍDO |
| `a958c81` | 04/09       | —        | Corrigir Unhandled Rejection em 2 testes de exhausting retries                       | ✅ CONCLUÍDO |
| `dc95374` | 04/09       | —        | Atualizar URL do Instagram                                                           | ✅ CONCLUÍDO |
| `b72b5c8` | 04/09       | —        | Fase 4 - matriz dominio x tabela x CRUD + E2E candidato                              | ✅ CONCLUÍDO |
| `08a6c1b` | 04/09       | —        | Bloco 11 — regra arquitetural de mídias + gaps reportados                            | ✅ CONCLUÍDO |

### 3.2 Commits de Hoje no Worktree `dedicated-grape`

| Commit    | Data/Hora | Arquivos | Objetivo                                                | Status       |
| --------- | --------- | -------- | ------------------------------------------------------- | ------------ |
| `c773d83` | 04/09     | —        | UI/UX MOCK-driven via Supabase (Blocos 0/1/2/3/5/6/8/9) | ✅ CONCLUÍDO |
| `ccd30ce` | 04/09     | —        | P0 reconciliation — 4 blockers from preflight           | ✅ CONCLUÍDO |
| `4b517f6` | 04/09     | —        | Inventário MOCK × DB × GAP matrix                       | ✅ CONCLUÍDO |
| `65064f4` | 04/09     | —        | Platform Consolidation V1 — 8 auditavel migrations      | ✅ CONCLUÍDO |
| `3bece77` | 04/09     | —        | Update ALLOWLIST after GATE + add HARDENING-SPEC        | ✅ CONCLUÍDO |
| `e4ad62e` | 04/09     | —        | Candidato dashboard page                                | ✅ CONCLUÍDO |
| `226f4ca` | 04/09     | —        | Recovery redirect + alterar-senha page + candidato role | ✅ CONCLUÍDO |
| `d7c824c` | 04/09     | —        | Reconcile services CMS columns + ALLOWLIST              | ✅ CONCLUÍDO |
| `d8f6269` | 04/09     | —        | Update HEAD to 3c4442e, add Media/Storage v1            | ✅ CONCLUÍDO |
| `3c4442e` | 04/09     | —        | Media/Storage v1 canonical baseline migration           | ✅ CONCLUÍDO |

---

## 4. PEDIDOS/GATES DE HOJE

### 4.1 Empresa-Parceira / Fase E

#### E.1 Preflight de Segurança da Entrada Pública

**Status**: 🟡 PARCIALMENTE IMPLEMENTADO

**O que foi implementado**:

- Grants de `anon` auditados
- RLS preservada em migrations
- SECURITY DEFINER documentado

**O que está apenas especificado**:

- Contrato da RPC (`register_company_interest`) — especificado mas NÃO criado em migration aplicada
- `normalize_cnpj()` — especificado
- Constraint de CNPJ — especificado
- Duplicidade — especificado
- `domain_event_emit` — especificado
- `activity_logs` — especificado

#### E.1.1 Confirmação do Contrato

| Item                    | Estado          |
| ----------------------- | --------------- |
| Tenant `js-empregos`    | ✅ ESPECIFICADO |
| `normalize_cnpj()`      | ✅ ESPECIFICADO |
| Constraint de CNPJ      | ✅ ESPECIFICADO |
| Duplicidade             | ✅ ESPECIFICADO |
| `domain_event_emit`     | ✅ ESPECIFICADO |
| `activity_logs`         | ✅ ESPECIFICADO |
| Padrão SECURITY DEFINER | ✅ ESPECIFICADO |
| Owner postgres          | ✅ ESPECIFICADO |

#### E.2 RPC `register_company_interest(...)`

**Status**: ⛔ PENDENTE — NÃO IMPLEMENTADO EM MIGRATION APLICADA

**Evidência**: Nenhuma worktree local contém a RPC aplicada. Apenas documentação/spec existe.

---

## 5. OAUTH / TURNSTILE

### 5.1 Estado do Código

| Arquivo                             | Status             | Observação                            |
| ----------------------------------- | ------------------ | ------------------------------------- |
| `src/pages/auth/Entrar.tsx`         | ✅ MODIFICADO HOJE | Card contextual com OAuth + Turnstile |
| `src/contexts/AuthContext.tsx`      | ✅ MODIFICADO HOJE | +106 linhas                           |
| `src/pages/auth/AuthCallback.tsx`   | ✅ EXISTE          | Callback de OAuth                     |
| `src/components/auth/Turnstile.tsx` | ✅ EXISTE          | Componente Turnstile                  |

### 5.2 Diagnóstico Conhecido

**Erro**: `Unsupported provider: provider is not enabled`

**Status**: 🔴 PENDENTE — frontend envia provider, mas Supabase não tem Google/Azure habilitados.

**Classificação**: ⛔ BLOQUEADO — requer habilitação no painel Supabase OU remoção dos botões OAuth.

---

## 6. CI / VITEST

### 6.1 Commit de Falha

**Commit**: `fbf89774d036168e1e858c5e500b628b9fba67de`  
**Branch**: `origin/main` (não está no main local)

### 6.2 Falha do GitHub Actions

**Status**: ⛔ BLOQUEADO — o commit com a falha não está no main local.

**Evidência**:

- `src/lib/async/__tests__/retry.test.ts` — presente no projeto
- `vitest.config.ts` — existe e foi modificado recentemente
- Commit `fbf8977` é sobre migrations, NÃO sobre testes

**Classificação**: ⛔ BLOQUEADO — requer `git pull` para investigar o diff exato.

---

## 7. SUPABASE / MIGRATIONS

### 7.1 Tabelas Verificadas no Supabase

| Tabela                      | Status                      |
| --------------------------- | --------------------------- |
| `footer_configs`            | ✅ EXISTE                   |
| `candidate_portal_modules`  | ✅ EXISTE                   |
| `global_navigation_links`   | ✅ EXISTE                   |
| `candidate_job_alerts`      | ✅ EXISTE                   |
| `page_templates`            | ✅ EXISTE                   |
| `candidate_skills`          | ✅ EXISTE                   |
| `candidate_favorite_jobs`   | ✅ EXISTE                   |
| `roles`                     | ✅ EXISTE (52 roles)        |
| `permissions`               | ✅ EXISTE (~150 permissões) |
| `role_permissions`          | ✅ EXISTE                   |
| `role_assignments`          | ✅ EXISTE (26 assignments)  |
| `role_resource_permissions` | ❌ NÃO EXISTE               |

### 7.2 Função `user_has_permission()`

**Status**: ✅ EXISTE E FUNCIONAL

```sql
CREATE OR REPLACE FUNCTION public.user_has_permission(
    p_auth_user_id uuid,
    p_resource text,
    p_action text,
    p_tenant_id uuid DEFAULT NULL
) RETURNS boolean SECURITY DEFINER
```

**Observação**: Não suporta `role_resource_permissions` (tabela não existe).

---

## 8. CANDIDATO / RBAC

### 8.1 Estado do Candidate Portal

| Item                    | Status          |
| ----------------------- | --------------- |
| Dashboard candidato     | ✅ IMPLEMENTADO |
| Vagas candidato         | ✅ IMPLEMENTADO |
| Candidaturas candidato  | ✅ IMPLEMENTADO |
| Favoritas candidato     | ✅ IMPLEMENTADO |
| Alertas candidato       | ✅ IMPLEMENTADO |
| Currículo candidato     | ✅ IMPLEMENTADO |
| Notificações candidato  | ✅ IMPLEMENTADO |
| Perfil candidato        | ✅ IMPLEMENTADO |
| Configurações candidato | ✅ IMPLEMENTADO |
| CandidateShell          | ✅ IMPLEMENTADO |
| CandidateRoute          | ✅ IMPLEMENTADO |
| CandidateContext        | ✅ IMPLEMENTADO |
| Matching services       | ✅ IMPLEMENTADO |

### 8.2 RBAC-03

| Item                               | Status        |
| ---------------------------------- | ------------- |
| Migration `rbac03_canonical_roles` | ✅ APLICADA   |
| 52 roles cadastradas               | ✅ CONFIRMADO |
| 3 roles deprecated                 | ✅ CONFIRMADO |
| `user_has_permission()`            | ✅ EXISTE     |

---

## 9. SITE PÚBLICO

### 9.1 Estado das Páginas Públicas

| Item                 | Status          |
| -------------------- | --------------- |
| Home pública         | ✅ EXISTE       |
| Rotas públicas       | ✅ EXISTE       |
| Footer global_public | ✅ IMPLEMENTADO |
| Navbar pública       | ✅ EXISTE       |
| Layout público       | ✅ EXISTE       |

**Classificação**: ✅ NENHUMA ALTERAÇÃO DESTRUTIVA IDENTIFICADA no site público.

---

## 10. DUPLICAÇÃO DE TRABALHO

### 10.1 Tarefas Duplicadas Identificadas

| Tarefa                    | Worktree 1         | Worktree 2               | Mais Recente/Canônico        |
| ------------------------- | ------------------ | ------------------------ | ---------------------------- |
| Candidate portal completo | main               | dedicated-grape          | **main**                     |
| RBAC-03 canonical roles   | main               | dedicated-grape          | **main**                     |
| Media/Storage v1          | main               | dedicated-grape          | **dedicated-grape**          |
| Company interest RPC      | origin/main apenas | —                        | **origin/main**              |
| AI Assistant              | main               | feat/ai-assistant-hybrid | **feat/ai-assistant-hybrid** |

### 10.2 Recomendação

1. **NÃO refazer** candidate portal nem RBAC-03 — já está em `main`.
2. **NÃO refazer** company interest RPC — já está em `origin/main`, fazer `git pull`.
3. **Avaliar merge** de `feature/media-storage-v1` para `main` — tem correção de policy.
4. **Avaliar merge** de `feat/ai-assistant-hybrid` se for necessário.

---

## 11. MATRIZ FINAL

### ✅ CONCLUÍDO

| ID  | Tarefa                                               | Worktree        | Commit    | Arquivos                                |
| --- | ---------------------------------------------------- | --------------- | --------- | --------------------------------------- |
| 1   | RBAC-01: corrigir admin_master global inconsistency  | main            | `b239bb2` | migrations/                             |
| 2   | RBAC-02: capacity matrix 12×5, 28 roles              | main            | `b239bb2` | migrations/, docs/                      |
| 3   | RBAC-03: 52 roles (49 active, 3 deprecated)          | main            | `b239bb2` | migrations/                             |
| 4   | Candidate portal completo                            | main            | múltiplos | `src/pages/dashboard/candidato/*`       |
| 5   | Footer por escopo                                    | main            | `3a88056` | migrations/, components                 |
| 6   | Sistema de templates %var.path%                      | main            | `2c183d3` | `src/utils/template-resolver.ts`        |
| 7   | OAuth card contextual + Turnstile                    | main            | `bfeaff1` | `src/pages/auth/Entrar.tsx`             |
| 8   | Fluxo de recovery seguro                             | main            | `e1fece5` | `src/pages/auth/*`                      |
| 9   | Redirecionamento candidato para /dashboard/candidato | main            | `9835c5e` | `src/contexts/AuthContext.tsx`          |
| 10  | RBAC-04: inventário somente leitura                  | main            | —         | `docs/RBAC-04-INVENTORY.md`             |
| 11  | P0 reconciliation                                    | dedicated-grape | `ccd30ce` | migrations/, docs/                      |
| 12  | Platform Consolidation V1                            | dedicated-grape | `65064f4` | migrations/                             |
| 13  | Media/Storage v1                                     | dedicated-grape | `3c4442e` | migrations/                             |
| 14  | Candidato dashboard page                             | dedicated-grape | `e4ad62e` | `src/pages/dashboard/candidato/`        |
| 15  | Fix retry.test.ts                                    | main            | `a958c81` | `src/lib/async/__tests__/retry.test.ts` |
| 16  | Track migrations aplicadas                           | main            | `a0c0e5f` | scripts/                                |
| 17  | favorite_jobs table + repos + tests                  | main            | `f4eb448` | repositories/                           |
| 18  | CinematicShowcase bounded                            | main            | `e24d011` | components/                             |
| 19  | Snapshot estado atual                                | main            | `b43c8d2` | backup/                                 |

### 🟡 PARCIAL

| ID  | Tarefa                                  | Status                                      | Falta                                        |
| --- | --------------------------------------- | ------------------------------------------- | -------------------------------------------- |
| 1   | Company Interest RPC                    | Em origin/main, NÃO no main local           | Fazer `git pull`                             |
| 2   | OAuth Google/Microsoft                  | Botões no frontend, providers DESABILITADOS | Habilitar no Supabase OU remover botões      |
| 3   | E.1 Preflight segurança entrada pública | Especificado, RPC NÃO criada                | Implementar `register_company_interest(...)` |
| 4   | `role_resource_permissions`             | Especificado, NÃO implementado              | Criar tabela (RBAC-04 Fase 2)                |

### 🔴 PENDENTE

| ID  | Tarefa                                         | Motivo                                  |
| --- | ---------------------------------------------- | --------------------------------------- |
| 1   | Sincronizar main com origin/main               | Divergência 24 ahead / 9 behind         |
| 2   | Revisar RBAC-04-INVENTORY.md com usuário       | Documento aguardando revisão            |
| 3   | RBAC-04 Fase 2 — plano de correção             | Aguardando aprovação do inventário      |
| 4   | Remover permissões perigosas de `tenant_admin` | 14 permissões identificadas             |
| 5   | `git push` dos 24 commits locais               | Não executado                           |
| 6   | Investigar falha CI detalhadamente             | Commit `fbf8977` não está no main local |

### ⛔ BLOQUEADO

| ID  | Tarefa                             | Bloqueio                                 |
| --- | ---------------------------------- | ---------------------------------------- |
| 1   | OAuth Google/Microsoft funcionando | Providers desabilitados no Supabase Auth |
| 2   | Investigação CI/Vitest detalhada   | Commit `fbf8977` não está no main local  |
| 3   | Company Interest RPC aplicada      | Existe em origin/main, não foi puxada    |

### ⚠️ DIVERGENTE

| Item                                | Descrição                                                                                            |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------- |
| main vs origin/main                 | 24 commits ahead, 9 commits behind                                                                   |
| main vs dedicated-grape             | main: candidate portal + RBAC-03 + templates; dedicated-grape: media storage + company interest docs |
| main vs joyous-quasar               | main: trabalho atual; joyous-quasar: docs V2.1 + scripts, migrations desatualizadas                  |
| `company_interest_registration_rpc` | Existe apenas em origin/main                                                                         |
| `docs/RBAC-04-INVENTORY.md`         | Existe apenas no main local (41 KB)                                                                  |

### 💤 NÃO INICIADO

| ID  | Tarefa                                           | Motivo                                |
| --- | ------------------------------------------------ | ------------------------------------- |
| 1   | RBAC-04 Fase 2 — correções de migration          | Aguardando revisão do inventário      |
| 2   | Redesign de `/auth/welcome`                      | Bloqueado por RBAC-04                 |
| 3   | Implementar `role_resource_permissions`          | Planejado para RBAC-04 Fase 2         |
| 4   | `user_has_permission()` com suporte a hierarquia | Planejado para RBAC-04 Fase 2         |
| 5   | CI/CD pipeline completo                          | Falha não investigada                 |
| 6   | Testes E2E automatizados                         | Script existe mas não integrado ao CI |

---

## 12. CRONOLOGIA DE HOJE (04/09/2026)

```
04/09 02:54 — main — 2f42ce2 — feat(candidate-shell): sidebar e bottom-nav dinamicos via banco
04/09 03:01 — main — 3a88056 — feat(footer): footers por escopo (global_public imutavel)
04/09 03:12 — main — 2c183d3 — feat(templates): sistema de placeholders %var.path% via banco
04/09 03:18 — main — 3d0ef0e — feat(shell): ocultar flutuantes em /candidato e /dashboard
04/09 03:31 — main — e24d011 — refactor(cinematic): refinamento bounded do CinematicShowcase
04/09 03:43 — main — dc95374 — fix(social): atualizar URL do Instagram
04/09 05:28 — main — 08a6c1b — docs(frontend): Bloco 11 — regra arquitetural de mídias
04/09 05:28 — main — b72b5c8 — docs(audit): Fase 4 - matriz dominio x tabela x CRUD + E2E candidato
04/09 — main — 2a66cc0 — feat(auth): Boas-vindas sem lista de permissoes + /entrar/{admin,candidato,empresa}
04/09 — main — bfeaff1 — feat(login): card contextual com OAuth + cadastro inline + Turnstile
04/09 — main — a2a4ac1 — feat(candidate): consolidate canonical candidate portal
04/09 — main — 7c34db5 — feat(candidate-portal): consolidar AuthContext + App.tsx + Login + candidates.repository
04/09 — main — 9835c5e — fix(auth): redirecionar candidato para /dashboard/candidato (P1.1)
04/09 — main — e1fece5 — feat(auth): fluxo de recovery seguro (request/callback/reset/destination)
04/09 — main — f4eb448 — feat(candidate-portal): favorite_jobs table + repos + tests + utility scripts
04/09 — main — a00480c — feat(candidate-portal): services de matching e types do contexto candidato
04/09 — main — b8b248c — test(e2e): script de validacao end-to-end do Candidate Portal
04/09 — main — 17fc573 — test(candidate-portal): mock candidatePreferencesRepository + assert findByPersonId called
04/09 — main — a0c0e5f — feat(db): track migrations aplicadas no Supabase okxqfyoqbhcmflpurfrw
04/09 — main — a958c81 — test(retry): corrigir Unhandled Rejection em 2 testes de exhausting retries
04/09 — main — b239bb2 — chore: commit acumulado de evolucoes RBAC-03, candidate portal e matching
04/09 — main — b43c8d2 — chore(rollback): snapshot estado atual antes de correcoes estruturais
04/09 — main — 2cffbe5 — fix(rbac): remover candidato de allowedRoles em /dashboard/* — P0 RBAC candidato/admin
04/09 16:32 — main — c05822f — feat(auth): /entrar reaproveita container visual do Login + /login volta a ser o Login original
```

---

## 13. PRÓXIMA AÇÃO RECOMENDADA

**Fazer `git pull` em `main` para sincronizar com `origin/main`.**

**Motivo**:

- Remove o bloqueio da investigação CI/Vitest (commit `fbf8977` está em origin/main)
- Traz a Company Interest RPC (`20260904204854_company_interest_registration_rpc.sql`)
- Alinha o estado local com o remoto antes de qualquer outra operação

**Risco**: Baixo. Apenas sincronização, sem merges destrutivos.

---

> **Nenhuma alteração foi aplicada durante esta auditoria.**
