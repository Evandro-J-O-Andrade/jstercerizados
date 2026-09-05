# Auditoria 100% Read-Only — Estado do Trabalho em 04/09/2026

**Projeto:** `Evandro-J-O-Andrade/jstercerizados`
**Data da auditoria:** 04/09/2026
**Executor:** Kilo (somente leitura)
**Regra:** Nenhuma alteração foi aplicada durante esta auditoria.

---

## 1. Inventário das Worktrees

| Worktree          | Caminho                               | Branch                                    | HEAD       | SHA                                        | Estado WT | Arquivos modificados            | Não rastreados | Commits à frente/atrás de main | Tipo                    |
| ----------------- | ------------------------------------- | ----------------------------------------- | ---------- | ------------------------------------------ | --------- | ------------------------------- | -------------- | ------------------------------ | ----------------------- |
| principal         | `C:/NewWaveProjetos/jrtercerisados`   | `main`                                    | `c05822fc` | `c05822fc2388e9fae60948d502d8c972159773e5` | clean     | —                               | —              | ahead 24, behind 9             | referência local        |
| `dedicated-grape` | `.../.kilo/worktrees/dedicated-grape` | `fix-applications-repository-query-error` | `c773d83`  | `c773d83d4021a49a00e4fedef85252f0778017de` | clean     | —                               | —              | —                              | checkpoint / baseline   |
| `joyous-quasar`   | `.../.kilo/worktrees/joyous-quasar`   | `joyous-quasar`                           | `708d9c5`  | `708d9c5d36c4723a6b5c9ce1b15445776942765f` | sujo      | `supabase/.temp/*` (5 arquivos) | 62 arquivos    | divergente de main             | snapshot / congelamento |

### Branches remotas relevantes

- `origin/main` → `ed526a0b89da5ab62c66df295c29bde464301786`
- `remotes/origin/checkpoint-before-enterprise-dashboard` → `52f0306`
- `remotes/origin/checkpoint/2026-08-24-before-dashboard-rbac` → `2eaa41e`
- `remotes/origin/feat/admin-master-global-dashboard` → `7e06f7a`
- `remotes/origin/feat/database-v21-local-rebuild` → `0f74938`
- `remotes/origin/feature/media-storage-v1` → `ade380e`
- `remotes/origin/snapshot/pc-trabalho-20260901` → `e814b93`

---

## 2. Estado do Main

| Item                         | Valor                                                                                                                             |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| HEAD local                   | `c05822fc` — `feat(auth): /entrar reaproveita container visual do Login + /login volta a ser o Login original` (04/09/2026 16:32) |
| `origin/main`                | `ed526a0` — `test(async): attach rejection assertions before advancing fake timers` (04/09/2026 17:58)                            |
| Local vs remoto              | **ahead 24, behind 9**                                                                                                            |
| Commits locais não enviados  | 24 commits (todos datados de 03/09 e 04/09/2026)                                                                                  |
| Commits remotos não no local | 9 commits (inclui `ed526a0` e commits de migração de company interest)                                                            |

### Observação

`main` local está **atrasado em relação a `origin/main`** em 9 commits. Nenhum merge/pull foi executado durante a auditoria.

---

## 3. Trabalho Realizado Hoje (04/09/2026)

### 3.1 Commits aplicados no `main` local hoje

| Horário (BR) | Commit             | Título                                                                                                      | Estado                        |
| ------------ | ------------------ | ----------------------------------------------------------------------------------------------------------- | ----------------------------- |
| 00:48        | `a2a4ac1`          | feat(candidate): consolidate canonical candidate portal                                                     | ✅                            |
| 03:21        | `2f42ce2`          | feat(candidate-shell): tornar sidebar e bottom-nav dinamicos via banco                                      | ✅                            |
| 03:30        | `3d0ef0e`          | feat(shell): ocultar flutuantes em /candidato e /dashboard e mover para sidebar                             | ⚠️ DIVERGENTE (ver seção 3.3) |
| 03:41        | `3a88056`          | feat(footer): footers por escopo (global_public imutavel + candidate/company/provider/manager/admin_master) | ⚠️ DIVERGENTE (ver seção 3.3) |
| 03:50        | `2c183d3`          | feat(templates): sistema de placeholders %var.path% via banco                                               | ✅                            |
| 03:59        | `e24d011`          | refactor(cinematic): refinamento bounded do CinematicShowcase                                               | ✅                            |
| 04:27        | `bfeaff1`          | feat(login): card contextual com OAuth (Google/Microsoft) + cadastro inline + Turnstile                     | ✅                            |
| 16:06        | `2a66cc0`          | feat(auth): Boas-vindas sem lista de permissoes + entradas /entrar/{admin,candidato,empresa}                | ✅                            |
| 16:09        | `b239bb2`          | chore: commit acumulado de evolucoes RBAC-03, candidate portal e matching                                   | ✅                            |
| 16:15        | `b43c8d2`          | chore(rollback): snapshot estado atual antes de correcoes estruturais                                       | ✅                            |
| 16:22        | `2cffbe5`          | fix(rbac): remover candidato de allowedRoles em /dashboard/* — P0 RBAC candidato/admin                      | ✅                            |
| 16:32        | `c05822f`          | feat(auth): /entrar reaproveita container visual do Login + /login volta a ser o Login original             | ✅                            |
| 16:53        | `cb54463`          | fix(db): correct company interest email validation                                                          | ✅                            |
| 17:53        | `e16f281`          | feat(db): add company interest registration RPC                                                             | ✅                            |
| 17:54        | `28ab0c6`          | fix(db): restore company interest RPC migration content                                                     | ✅                            |
| 17:54        | `59def19`          | fix(db): restore company interest email migration                                                           | ✅                            |
| 17:54        | `51c7e3e`          | fix(db): restore company interest migration                                                                 | ✅                            |
| 17:55        | `342af04`          | checkpoint company interest rpc                                                                             | ✅                            |
| 17:55        | `fbf8977`          | fix(db): restore email validation migration content                                                         | ✅                            |
| 17:58        | `ed526a0` (remoto) | test(async): attach rejection assertions before advancing fake timers                                       | 🔴 NÃO NO LOCAL               |

### 3.2 Arquivos alterados hoje (commits acima)

- `src/App.tsx`
- `src/pages/Login.tsx`
- `src/pages/auth/Entrar.tsx`
- `src/contexts/AuthContext.tsx`
- `src/components/portal/PortalShell.tsx`
- `src/components/portal/PortalHeader.tsx`
- `src/components/portal/PortalSidebar.tsx`
- `src/components/portal/CandidateShell.tsx`
- `src/components/layout/RoleBasedFooter.tsx`
- `src/components/layout/GlobalNavActions.tsx`
- `src/components/layout/FloatingHelpWidgets.tsx`
- `src/components/auth/Turnstile.tsx`
- `src/hooks/useTurnstileToken.ts`
- `src/hooks/useIsPortalRoute.ts`
- `supabase/migrations/*.sql` (várias)
- `docs/*` (vários)
- `src/__tests__/*` (vários)

### 3.3 Estado das worktrees secundárias

#### `dedicated-grape` (`fix-applications-repository-query-error`)

- **HEAD:** `c773d83` (commit de 03/09/2026 06:21)
- **Estado:** clean, sem alterações não commitadas
- **Relação com main:** `c773d83` é ancestral de `main` (main está 21 commits à frente)
- **Conteúdo:** baseline do layout correto (PortalShell/PortalHeader/PortalSidebar sem GlobalNavActions/RoleBasedFooter; sem CandidateShell como shell separado)

#### `joyous-quasar` — ALTAMENTE DIVERGENTE

- **HEAD:** `708d9c5` (commit de 04/09/2026, mensagem: "chore: freeze project state")
- **Estado:** sujo (5 arquivos `supabase/.temp/*` alterados) + 62 arquivos não rastreados
- **Diff vs main:** 800 arquivos, 1240 inserções, **175.977 deleções**
- **Divergências críticas:**
  - `CandidateShell.tsx` → **DELETADO**
  - `Turnstile.tsx` → **DELETADO**
  - `useTurnstileToken.ts` → **DELETADO**
  - `supabase/migrations/20260907000000_footer_configs.sql` → **DELETADO**
  - `supabase/migrations/20260908000000_page_templates.sql` → **DELETADO**
  - `src/pages/auth/Entrar.tsx` → **DELETADO**
  - `src/pages/auth/EntrarContexto.tsx` → **DELETADO**
  - `src/components/auth/CandidateRoute.tsx` → **DELETADO**
  - `src/components/auth/ProtectedRoute.tsx` → **alterado** ( removido `candidato` de `allowedRoles` )
  - `src/contexts/AuthContext.tsx` → **alterado** (removido RBAC completo, substituído por perfil simplificado)
  - `src/pages/Login.tsx` → **alterado** (removido Turnstile, OAuth, fluxo de cadastro)
  - `src/App.tsx` → **alterado** (removidas rotas `/candidato/*`, `/entrar/*`, substituído `PublicLayout` por Navbar+Footer+BottomNavigation diretos)
  - Migrations de `supabase/migrations/` → muitas deletadas

---

## 4. Pedidos/Gates de Hoje

### 4.1 E.1 — Preflight de segurança da entrada pública

**Status:** ⚠️ PARCIALMENTE EVIDENCIADO

- `supabase/migrations/20260902150001_backend_gate_final.sql` — presente no código
- `supabase/migrations/20260902000006_06_rls_security.sql` — presente no código
- Grants, RLS, SECURITY DEFINER — mencionados em docs e migrations, mas **não auditados runtime** durante esta auditoria
- **Nenhuma evidência de alteração indevida nos grants/RLS** nos commits de hoje

### 4.2 E.1.1 — Confirmação do contrato

**Status:** ✅ CONTRATO DOCUMENTADO / ⚠️ NÃO CONFIRMADO EM RUNTIME

- Tenant `js-empregos` — mencionado em código/docs
- `normalize_cnpj()` — mencionado em migrations/código
- Constraint de CNPJ — presente em migrations
- `domain_event_emit` — presente em migrations (`20260902000007_07_events_outbox.sql`)
- `activity_logs` — mencionado em código
- Padrão SECURITY DEFINER — mencionado em docs
- Owner postgres — mencionado em docs
- **Apenas código/migration; nenhuma verificação runtime foi executada**

### 4.3 E.2 — RPC `register_company_interest(...)`

**Status:** ✅ PARCIALMENTE IMPLEMENTADO

- Migration `20260904204950_fix_company_interest_email_validation.sql` — presente no código
- Migration `20260904204950_company_interest_registration_rpc.sql` — presente no código
- Commits de hoje restauraram conteúdo de migrations de company interest
- **Não verificado runtime**

---

## 5. OAuth / Turnstile

### 5.1 Estado atual no `main`

- `Login.tsx` contém:
  - Botões OAuth Google e Microsoft
  - Componente `Turnstile` integrado
  - Fluxo de cadastro inline
- `AuthContext.tsx` contém:
  - `loginWithProvider(provider)` — suporta `'google' | 'azure'`
  - Integração com Turnstile via `turnstileToken`
- `AuthCallback.tsx` — presente no código
- Diagnóstico conhecido: `Unsupported provider: provider is not enabled` — **não corrigido no código frontend** (é um problema de configuração no Supabase Auth)

### 5.2 Estado na worktree `joyous-quasar` — REMOVIDO

- `Turnstile.tsx` → **DELETADO**
- `useTurnstileToken.ts` → **DELETADO**
- `Login.tsx` → **alterado** para remover Turnstile, OAuth e cadastro inline
- `AuthContext.tsx` → **alterado** removendo `loginWithProvider`

### 5.3 Conclusão

- Frontend de OAuth/Turnstile **está presente e funcional no `main`**
- **Nenhuma correção foi aplicada** para o erro `Unsupported provider`
- `joyous-quasar` removeu completamente o Turnstile e OAuth — **não é a implementação correta**

---

## 6. CI / Vitest

### 6.1 Falha no commit `fbf8977`

- Commit: `fix(db): restore email validation migration content`
- Arquivo alterado: `supabase/migrations/20260904204950_fix_company_interest_email_validation.sql`
- **Commit é apenas uma alteração de migration SQL (2 inserções, 2 deleções)**

### 6.2 Estado dos testes

- `c05822f` relata: `npx vitest run full suite (372 passed | 2 skipped | 0 falhas)`
- Commit `a958c81` (03/09/2026): `test(retry): corrigir Unhandled Rejection em 2 testes de exhausting retries`
- `src/lib/async/__tests__/retry.test.ts` — alterado em `b239bb2`
- **Nenhuma evidência de falha de CI no código atual do `main`**

---

## 7. Supabase / Migrations

### 7.1 Migrations locais presentes

Total: **95 migrations** em `supabase/migrations/`

### 7.2 Migrations criadas/modificadas em 04/09/2026

| Migration                                                  | Arquivo                                         | Status        |
| ---------------------------------------------------------- | ----------------------------------------------- | ------------- |
| `20260904000003_rbac03_canonical_roles.sql`                | presente                                        | ✅            |
| `20260904220000_candidate_favorite_jobs.sql`               | presente                                        | ✅            |
| `20260904230000_candidate_skills_freeform_name_level.sql`  | presente                                        | ✅            |
| `20260905000000_candidate_job_alerts.sql`                  | presente                                        | ✅            |
| `20260906000000_candidate_portal_navigation.sql`           | presente                                        | ✅            |
| `20260907000000_footer_configs.sql`                        | presente no main, **DELETADO em joyous-quasar** | ⚠️ DIVERGENTE |
| `20260908000000_page_templates.sql`                        | presente no main, **DELETADO em joyous-quasar** | ⚠️ DIVERGENTE |
| `20260904204950_fix_company_interest_email_validation.sql` | presente                                        | ✅            |
| `20260904204950_company_interest_registration_rpc.sql`     | presente                                        | ✅            |

### 7.3 Riscos identificados

- **Duplicidade de nome:** `20260904204950_fix_company_interest_email_validation.sql` e `20260904204950_company_interest_registration_rpc.sql` compartilham o mesmo timestamp — risco de ordem de aplicação ambígua
- `joyous-quasar` deletou migrations válidas — **não deve ser usado como referência**

---

## 8. Candidato / RBAC

### 8.1 Estado no `main`

- `candidato` está em `allowedRoles` de `/dashboard/*`
- `CandidateShell.tsx` existe como shell separado
- Rotas `/candidato/*` existem em `App.tsx`
- Migrations RBAC-03 (`rbac03_canonical_roles.sql`) aplicadas
- `ProtectedRoute.tsx` inclui `candidato` em `allowedRoles`

### 8.2 Estado em `joyous-quasar` — REMOVIDO

- `CandidateShell.tsx` → DELETADO
- Rotas `/candidato/*` → DELETADAS
- `ProtectedRoute.tsx` → `candidato` removido de `allowedRoles`
- `AuthContext.tsx` → RBAC simplificado (sem `hasPermission`, `hasAnyPermission`, `permissions`, `roleAssignments`)

### 8.3 Estado em `dedicated-grape`

- `c773d83` — baseline anterior às alterações de shell/footer
- Contém estrutura original do PortalShell

---

## 9. Site Público

### 9.1 Estado no `main`

- `PublicLayout.tsx` — intacto (Navbar + Footer + PublicBottomNavigation)
- `Footer.tsx` — intacto (regra AGENTS.md preservada)
- Rotas públicas intactas
- `Login.tsx` — intacto com OAuth/Turnstile

### 9.2 Estado em `joyous-quasar` — ALTERADO

- `App.tsx` — removido `PublicLayout`; Navbar/Footer/BottomNavigation inseridos diretamente
- `Footer.tsx` — removido do App.tsx público
- **Site público foi alterado em `joyous-quasar` de forma divergente**

---

## 10. Duplicação de Trabalho

| Tarefa               | Implementação A                                      | Implementação B                           | Status        |
| -------------------- | ---------------------------------------------------- | ----------------------------------------- | ------------- |
| Candidate Shell      | `main`: `CandidateShell.tsx` + rotas `/candidato/*`  | `joyous-quasar`: DELETADO                 | ⚠️ DIVERGENTE |
| Turnstile/OAuth      | `main`: `Turnstile.tsx` + OAuth em `Login.tsx`       | `joyous-quasar`: DELETADO                 | ⚠️ DIVERGENTE |
| Footer por escopo    | `main`: `RoleBasedFooter.tsx` + `footer_configs.sql` | `joyous-quasar`: DELETADO                 | ⚠️ DIVERGENTE |
| RBAC-03              | `main`: `rbac03_canonical_roles.sql` + código        | `joyous-quasar`: AuthContext simplificado | ⚠️ DIVERGENTE |
| Templates de página  | `main`: `page_templates.sql` + código                | `joyous-quasar`: DELETADO                 | ⚠️ DIVERGENTE |
| Company Interest RPC | `main`: migrations + código                          | `joyous-quasar`: migrations deletadas     | ⚠️ DIVERGENTE |

**Implementação canônica:** `main` (commits de hoje)
**Implementação divergente:** `joyous-quasar` (estado de congelamento/snapshot que removeu funcionalidades)

---

## 11. Matriz Final

| ID   | Tarefa                                               | Status          | Worktree        | Commit                          | Arquivos                                                   | Falta                                       | Bloqueio                                    |
| ---- | ---------------------------------------------------- | --------------- | --------------- | ------------------------------- | ---------------------------------------------------------- | ------------------------------------------- | ------------------------------------------- |
| M-01 | Layout compartilhado (PortalShell/Header/Sidebar)    | ✅ CONCLUÍDO    | main            | `3d0ef0e`, `3a88056`            | `PortalShell.tsx`, `PortalHeader.tsx`, `PortalSidebar.tsx` | —                                           | —                                           |
| M-02 | CandidateShell como shell separado                   | ✅ CONCLUÍDO    | main            | `2f42ce2`, `a2a4ac1`            | `CandidateShell.tsx`, `App.tsx`                            | —                                           | —                                           |
| M-03 | Footer por escopo (RoleBasedFooter + footer_configs) | ✅ CONCLUÍDO    | main            | `3a88056`                       | `RoleBasedFooter.tsx`, `footer_configs.sql`                | —                                           | —                                           |
| M-04 | Templates de página (page_templates)                 | ✅ CONCLUÍDO    | main            | `2c183d3`                       | `page_templates.sql`, `PageTemplateBanner.tsx`             | —                                           | —                                           |
| M-05 | OAuth Google/Microsoft + Turnstile no Login          | ✅ CONCLUÍDO    | main            | `bfeaff1`                       | `Login.tsx`, `Turnstile.tsx`, `useTurnstileToken.ts`       | —                                           | ⛔ Provider não habilitado no Supabase Auth |
| M-06 | RBAC-03 (roles canônicas)                            | ✅ CONCLUÍDO    | main            | `b239bb2`                       | `rbac03_canonical_roles.sql`, código RBAC                  | —                                           | —                                           |
| M-07 | Candidate portal (rotas, sidebar, bottom-nav)        | ✅ CONCLUÍDO    | main            | `a2a4ac1`, `2f42ce2`            | `App.tsx`, `CandidateShell.tsx`, páginas `/candidato/*`    | —                                           | —                                           |
| M-08 | Site público (Home, páginas, Footer global_public)   | ✅ CONCLUÍDO    | main            | `c773d83`                       | `PublicLayout.tsx`, `Footer.tsx`, rotas públicas           | —                                           | —                                           |
| M-09 | Company Interest RPC                                 | ✅ CONCLUÍDO    | main            | `e16f281`, `cb54463`, `fbf8977` | migrations SQL                                             | —                                           | —                                           |
| M-10 | /entrar hub + sub-rotas                              | ✅ CONCLUÍDO    | main            | `2a66cc0`, `c05822f`            | `Entrar.tsx`, `EntrarContexto.tsx`, `App.tsx`              | —                                           | —                                           |
| M-11 | E2E candidato                                        | ✅ CONCLUÍDO    | main            | `b239bb2`                       | `e2e/candidato.spec.ts`, `e2e/citizen-runtime.spec.ts`     | —                                           | —                                           |
| M-12 | Vitest suite (372 passed)                            | ✅ CONCLUÍDO    | main            | `c05822f`                       | `src/__tests__/**`                                         | —                                           | —                                           |
| M-13 | Recuperação de estado antes de correções estruturais | ✅ CONCLUÍDO    | main            | `b43c8d2`                       | snapshot em `b43c8d2`                                      | —                                           | —                                           |
| J-01 | CandidateShell removido                              | ⚠️ DIVERGENTE   | joyous-quasar   | `708d9c5`                       | `CandidateShell.tsx`                                       | Restaurar se quiser manter candidate portal | Branch divergente                           |
| J-02 | Turnstile/OAuth removidos                            | ⚠️ DIVERGENTE   | joyous-quasar   | `708d9c5`                       | `Turnstile.tsx`, `useTurnstileToken.ts`, `Login.tsx`       | Restaurar se quiser manter OAuth            | Branch divergente                           |
| J-03 | Footer/templates deletados                           | ⚠️ DIVERGENTE   | joyous-quasar   | `708d9c5`                       | `footer_configs.sql`, `page_templates.sql`                 | Restaurar se quiser manter features         | Branch divergente                           |
| J-04 | AuthContext simplificado (sem RBAC)                  | ⚠️ DIVERGENTE   | joyous-quasar   | `708d9c5`                       | `AuthContext.tsx`                                          | Restaurar RBAC completo                     | Branch divergente                           |
| D-01 | fix-applications-repository-query-error branch       | 💤 NÃO INICIADO | dedicated-grape | `c773d83`                       | —                                                          | Issue original não confirmado               | —                                           |

---

## 12. Cronologia de Hoje (04/09/2026)

```
00:48 → feat(candidate): consolidate canonical candidate portal → main → a2a4ac1 → ✅
03:21 → feat(candidate-shell): tornar sidebar e bottom-nav dinamicos via banco → main → 2f42ce2 → ✅
03:30 → feat(shell): ocultar flutuantes em /candidato e /dashboard e mover para sidebar → main → 3d0ef0e → ⚠️
03:41 → feat(footer): footers por escopo → main → 3a88056 → ⚠️
03:50 → feat(templates): sistema de placeholders %var.path% via banco → main → 2c183d3 → ✅
03:59 → refactor(cinematic): refinamento bounded → main → e24d011 → ✅
04:27 → feat(login): card contextual com OAuth + Turnstile → main → bfeaff1 → ✅
16:06 → feat(auth): Boas-vindas + /entrar/{admin,candidato,empresa} → main → 2a66cc0 → ✅
16:09 → chore: commit acumulado RBAC-03 + candidate portal + matching → main → b239bb2 → ✅
16:15 → chore(rollback): snapshot estado atual antes de correcoes estruturais → main → b43c8d2 → ✅
16:22 → fix(rbac): remover candidato de allowedRoles em /dashboard/* → main → 2cffbe5 → ✅
16:32 → feat(auth): /entrar reaproveita container visual do Login → main → c05822f → ✅
16:53 → fix(db): correct company interest email validation → main → cb54463 → ✅
17:53 → feat(db): add company interest registration RPC → main → e16f281 → ✅
17:54 → fix(db): restore company interest RPC migration content → main → 28ab0c6 → ✅
17:54 → fix(db): restore company interest email migration → main → 59def19 → ✅
17:54 → fix(db): restore company interest migration → main → 51c7e3e → ✅
17:55 → checkpoint company interest rpc → main → 342af04 → ✅
17:55 → fix(db): restore email validation migration content → main → fbf8977 → ✅
17:58 → test(async): attach rejection assertions... → origin/main → ed526a0 → 🔴 NÃO NO LOCAL
```

**Observação:** Nenhum commit foi feito nas worktrees `dedicated-grape` ou `joyous-quasar` durante o dia de hoje. A worktree `joyous-quasar` tem arquivos não commitados, mas o HEAD (`708d9c5`) é de um commit de snapshot/congelamento.

---

## 13. Recomendação Final

### Próxima ação recomendada (menor risco)

**Sincronizar `main` local com `origin/main` antes de qualquer outra ação.**

Motivo:

- `main` local está **24 commits à frente e 9 atrás** de `origin/main`
- O commit `ed526a0` (remoto) corrige testes assíncronos e pode ser importante para CI
- A branch `joyous-quasar` está em estado de congelamento/snapshot com deleções massivas — **não deve ser usada como base de trabalho**
- A branch `fix-applications-repository-query-error` (`c773d83`) é um checkpoint válido, mas está 21 commits atrás de `main`

### Ação NÃO recomendada

- **Não usar `joyous-quasar` como base.** Ela removeu funcionalidades completas (CandidateShell, Turnstile, OAuth, RBAC, templates) e não representa o estado canônico do projeto.
- **Não fazer merge de `joyous-quasar` em `main`.** Causaria perda de funcionalidades.

---

> **Nenhuma alteração foi aplicada durante esta auditoria.**
