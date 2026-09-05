# Mapa Consolidado — J&S Empregos LTDA

**Data**: 2026-09-04/05  
**Tipo**: Análise estratégica fechada  
**Base**: Auditoria técnica completa + análise de produto

---

## 1. Resumo executivo

Hoje avançamos em **3 eixos simultâneos**:

1. **Portal candidato** — código consolidado, parcialmente validado em runtime.
2. **RBAC** — inventário, roles, permissões, isolamento.
3. **Infraestrutura** — footers, templates, navegação dinâmica, OAuth UI.

Mas também criamos **5 pendências estruturais** que precisam ser fechadas antes de abrir novos trabalhos:

1. Reconciliação `main ↔ origin/main`
2. Fechamento do gate `company_interest`
3. Runtime validation B/C
4. OAuth callback + providers
5. Feature inventory + documentação comercial

Se não fecharmos essas, **qualquer nova funcionalidade aumenta a divergência**, não o produto.

---

## 2. Feito e validado

### Código

| Item                                                               | Evidência                                       | Status |
| ------------------------------------------------------------------ | ----------------------------------------------- | ------ |
| Portal candidato canônico                                          | `main`, commits `a2a4ac1`, `7c34db5`            | ✅     |
| 8 páginas/fluxos do portal                                         | `src/pages/dashboard/candidato/*`               | ✅     |
| `CandidateRoute`                                                   | `src/components/auth/CandidateRoute.tsx`        | ✅     |
| `CandidateShell`                                                   | `src/components/portal/CandidateShell.tsx`      | ✅     |
| Sidebar dinâmica                                                   | `useNavigation`, `candidate_portal_modules`     | ✅     |
| Bottom navigation dinâmica                                         | `CandidateShell.tsx`                            | ✅     |
| Favoritos                                                          | `favorite_jobs`, `favoriteJobs.repository.ts`   | ✅     |
| Job alerts                                                         | `candidate_job_alerts` migration + código       | ✅     |
| Skills free-form                                                   | `candidate_skills` migration + código           | ✅     |
| Preferências/matching                                              | `matching.ts`, `candidatePreferencesRepository` | ✅     |
| RBAC candidato em `/dashboard/*`                                   | fix `2cffbe5`                                   | ✅     |
| Isolamento do candidato                                            | RLS + `candidate_self_service` migration        | ✅     |
| `/entrar`, `/entrar/admin`, `/entrar/candidato`, `/entrar/empresa` | `Entrar.tsx`, `BoasVindas.tsx`                  | ✅     |
| `/login` preservado                                                | commit `c05822f`                                | ✅     |
| Login contextual                                                   | `EntrarContexto.tsx`                            | ✅     |
| Cadastro inline                                                    | `Entrar.tsx`                                    | ✅     |
| Google/Microsoft UI                                                | `Entrar.tsx` + Turnstile                        | ✅     |
| Turnstile integrado                                                | `Turnstile.tsx`, `useTurnstileToken.ts`         | ✅     |
| CinematicShowcase bounded                                          | commit `e24d011`                                | ✅     |
| Widgets flutuantes escondidos                                      | commits `3d0ef0e`, `3a88056`                    | ✅     |
| Home pública preservada                                            | `src/pages/Home.tsx`                            | ✅     |
| Rotas públicas preservadas                                         | `App.tsx`                                       | ✅     |
| `PublicLayout` preservado                                          | `src/components/layout/PublicLayout.tsx`        | ✅     |
| Footer público preservado                                          | `global_public` scope                           | ✅     |
| Correção `retry.test.ts` local                                     | commit `a958c81`                                | ✅     |

### Banco / Supabase

| Item                       | Evidência                           | Status |
| -------------------------- | ----------------------------------- | ------ |
| 52 roles aplicadas         | `SELECT * FROM roles`               | ✅     |
| RBAC-01/02/03 aplicadas    | migrations `rbac03_canonical_roles` | ✅     |
| `user_has_permission()`    | Função PL/pgSQL confirmada          | ✅     |
| `footer_configs`           | 6 linhas, RLS OK                    | ✅     |
| `candidate_portal_modules` | 9 linhas, RLS OK                    | ✅     |
| `global_navigation_links`  | 5 linhas, RLS OK                    | ✅     |
| `page_templates`           | 1 linha, RLS OK                     | ✅     |
| `candidate_job_alerts`     | Tabela existe, 0 linhas             | ✅     |
| `candidate_skills`         | Tabela existe                       | ✅     |
| `candidate_favorite_jobs`  | Tabela existe                       | ✅     |

### Documentação

| Item                             | Status |
| -------------------------------- | ------ |
| RBAC-04-INVENTORY.md             | ✅     |
| AUDITORIA-COMPLETA-2026-09-04.md | ✅     |
| Vários snapshots/checkpoints     | ✅     |

---

## 3. Feito, mas não fechado

### 3.1 Footer por escopo

**Código**: ✅  
**Migration**: ✅  
**Runtime**: ⚠️  
**Arquitetura final**: 🔴

Problema:

- `PublicLayout` ancora em `Footer.tsx` antigo.
- Os demais contextos usam `RoleBasedFooter`.
- Ainda não foi definido qual é o caminho canônico.

Risco:

- Dois sistemas de footer competindo.
- `global_public` pode ser sobrescrito indevidamente.

### 3.2 OAuth

**Frontend**: ✅  
**Supabase Auth**: ❌ providers desabilitados  
**AuthCallback**: ❌ stub

Problemas separados:

- **Problema A**: Google/Microsoft não estão habilitados no projeto Supabase `okxqfyoqbhcmflpurfrw`.
- **Problema B**: `AuthCallback.tsx` não trata `?error=`, `?code=`, `#access_token=` corretamente.

Portanto o fluxo não é ponta a ponta.

### 3.3 CI / Vitest

**Commit local**: `a958c81`  
**Commit remoto**: `ed526a0`

São duas soluções diferentes para o mesmo problema (`retry.test.ts`).

Precisa ser reconciliado no merge.

### 3.4 Page templates

**Código**: ✅  
**Migration**: ✅  
**Runtime**: ⚠️

Falta:

- `resolve_page_template()` confirmada no banco.
- Seeds validadas.
- RLS confirmada.
- Runtime validation.

### 3.5 Candidate portal navigation

**Código**: ✅  
**Migration**: ✅  
**Runtime**: ⚠️

Falta:

- Reconciliar migration no histórico final.
- Validar carregamento em runtime.

### 3.6 RBAC-03 histórico

**Schema**: ✅  
**Código**: ✅  
**Migration**: ⚠️  
**History**: ⚠️

A migration `20260904000003_rbac03_canonical_roles.sql` não está corretamente representada no histórico remoto.

---

## 4. O que ficou para trás

### 4.1 Reconciliação Git (P0)

**Estado atual**:

- `main` local: 24 commits ahead
- `origin/main`: 9 commits ahead

**Commits locais exclusivos**:

```
c05822f, 2cffbe5, b43c8d2, b239bb2, 2a66cc0, bfeaff1, e24d011,
2c183d3, 3a88056, 3d0ef0e, 2f42ce2, a2a4ac1, 7c34db5, b8b248c,
a00480c, a0c0e5f, 17fc573, f4eb448, e1fece5, 9835c5e, a958c81,
dc95374, b72b5c8, 08a6c1b
```

**Commits remotos exclusivos**:

```
ed526a0, 342af04, 51c7e3e, 59def19, a1ed280, fbf8977,
28ab0c6, cb54463, e16f281
```

**Ação necessária**:

1. Revisar cada commit de ambos os lados.
2. Identificar duplicatas.
3. Decidir qual solução de `retry.test.ts` manter.
4. Fazer merge/rebase limpo.

**Bloqueio**: Nenhum código novo deve ser criado até isso ser fechado.

### 4.2 Company Interest (Bloqueado)

**Estado**:

- RPC `register_company_interest()` existe apenas em `origin/main`.
- `company_interests` não confirmada como existente no banco.
- Migrations não foram puxadas para `main` local.

**Ação necessária**:

1. `git pull` para trazer migrations.
2. Aplicar migration no Supabase.
3. Confirmar tabela + RPC.
4. Validar CNPJ, e-mail, duplicidade.
5. Validar `domain_event_emit`, `activity_logs`.
6. Testar formulário público.

### 4.3 `activity_logs` (Arquitetura)

**Problema**: Tabela `activity_logs` aparece nos requisitos mas não foi encontrada nas migrations locais.

**Pergunta**: O projeto usa `audit_logs`, `domain_events` ou `activity_logs` como fonte canônica?

**Ação necessária**:

1. Definir fonte canônica.
2. Se for `activity_logs`, criar migration.
3. Se for outra, documentar e remover referências.

### 4.4 `role_resource_permissions` (RBAC-04)

**Estado**: Tabela não existe.

**Decisão**: Implementar em RBAC-04 Fase 2 ou manter `role_permissions` simples?

### 4.5 OAuth Callback + Providers

**AuthCallback.tsx**: ❌ não trata erros nem tokens corretamente.  
**Supabase Auth**: ❌ Google/Microsoft desabilitados.

**Ação necessária**:

1. Implementar callback completo.
2. Habilitar providers no painel Supabase.
3. Testar fluxo ponta a ponta.

### 4.6 Runtime Gates B/C

**Gate B**: login → session → people → membership → RBAC → dashboard → logout  
**Gate C**: candidate → portal → navigation → job alerts → skills → favorites → RLS

**Estado**: Código existe, mas não foi validado em browser real com dados reais.

### 4.7 `database.ts` alinhamento

**Problema**: Tipos TypeScript ainda refletem `scope = global` vs schema real.

**Ação necessária**: Alinhar tipos com schema real antes de RBAC-05.

### 4.8 `joyous-quasar`

**Estado**: Dirty + 37 arquivos não rastreados + migrations desatualizadas.

**Decisão**: Congelar como snapshot ou descartar após garantir que nada exclusivo será perdido.

### 4.9 `feature/media-storage-v1`

**Estado**: Branch separada com correção de policy.

**Decisão**: Merge para `main` ou arquivar?

---

## 5. Matriz consolidada

### ✅ Concluído

| ID  | Área      | Item                                 | Worktree | Commit    |
| --- | --------- | ------------------------------------ | -------- | --------- |
| 1   | Candidato | Portal canônico                      | main     | múltiplos |
| 2   | Candidato | 8 páginas                            | main     | múltiplos |
| 3   | Candidato | CandidateRoute                       | main     | múltiplos |
| 4   | Candidato | CandidateShell                       | main     | múltiplos |
| 5   | Candidato | Sidebar dinâmica                     | main     | 2f42ce2   |
| 6   | Candidato | Bottom nav dinâmica                  | main     | 3d0ef0e   |
| 7   | Candidato | Favoritos                            | main     | f4eb448   |
| 8   | Candidato | Job alerts                           | main     | f4eb448   |
| 9   | Candidato | Skills free-form                     | main     | múltiplos |
| 10  | Candidato | Preferências/matching                | main     | a00480c   |
| 11  | RBAC      | Candidato removido de `/dashboard/*` | main     | 2cffbe5   |
| 12  | RBAC      | RBAC-01/02/03                        | main     | b239bb2   |
| 13  | RBAC      | Isolamento candidato                 | main     | múltiplos |
| 14  | Auth      | `/entrar` + contextos                | main     | 2a66cc0   |
| 15  | Auth      | `/login` preservado                  | main     | c05822f   |
| 16  | Auth      | Login contextual                     | main     | bfeaff1   |
| 17  | Auth      | Cadastro inline                      | main     | bfeaff1   |
| 18  | Auth      | Google/Microsoft UI                  | main     | bfeaff1   |
| 19  | Auth      | Turnstile                            | main     | bfeaff1   |
| 20  | UI        | CinematicShowcase                    | main     | e24d011   |
| 21  | UI        | Widgets flutuantes                   | main     | 3d0ef0e   |
| 22  | UI        | Footer código                        | main     | 3a88056   |
| 23  | UI        | Templates %var.path%                 | main     | 2c183d3   |
| 24  | Público   | Home preservada                      | main     | —         |
| 25  | Público   | Rotas públicas                       | main     | —         |
| 26  | Público   | PublicLayout                         | main     | —         |
| 27  | Testes    | retry.test.ts fix local              | main     | a958c81   |
| 28  | DB        | 52 roles                             | main     | b239bb2   |
| 29  | DB        | Tabelas candidate                    | main     | múltiplos |
| 30  | DB        | footer_configs                       | main     | 3a88056   |
| 31  | DB        | page_templates                       | main     | 2c183d3   |
| 32  | Docs      | RBAC-04-INVENTORY                    | main     | —         |
| 33  | Docs      | Auditoria completa                   | main     | —         |

### 🟡 Feito, mas não fechado

| ID  | Área       | Item                      | Falta                                   |
| --- | ---------- | ------------------------- | --------------------------------------- |
| 1   | Footer     | Arquitetura final         | Definir PublicLayout vs RoleBasedFooter |
| 2   | OAuth      | Callback                  | Tratar ?error=, ?code=, tokens          |
| 3   | OAuth      | Providers                 | Habilitar no Supabase                   |
| 4   | CI         | Reconciliar retry.test.ts | Escolher solução local ou remota        |
| 5   | Templates  | Runtime                   | validar resolve_page_template() + seeds |
| 6   | Navigation | Runtime                   | Validar carregamento em browser         |
| 7   | RBAC-03    | History                   | Repair/reconciliation do histórico      |

### 🔴 Bloqueado / Pendente

| ID  | Área    | Item                        | Bloqueio                             |
| --- | ------- | --------------------------- | ------------------------------------ |
| 1   | Git     | Reconciliação main ↔ origin | 24 ahead / 9 behind                  |
| 2   | DB      | Company Interest RPC        | Migration só em origin/main          |
| 3   | DB      | `company_interests`         | Não confirmada no banco              |
| 4   | DB      | `activity_logs`             | Arquitetura não definida             |
| 5   | OAuth   | Callback + providers        | Implementação + configuração externa |
| 6   | Runtime | Gate B/C                    | Validação em browser real            |
| 7   | DB      | `role_resource_permissions` | Decisão arquitetural                 |
| 8   | Types   | `database.ts`               | Alinhamento com schema real          |

### 🔵 Próximos blocos

| ID  | Área       | Item                                                     |
| --- | ---------- | -------------------------------------------------------- |
| 1   | RBAC       | RBAC-05 — administração de usuários/roles/permissões     |
| 2   | Roteamento | ROUTING-ARCH-02 — ProtectedRoute/AdminRoute/CompanyRoute |
| 3   | E2E        | Testes ponta a ponta                                     |
| 4   | Produto    | Feature inventory final                                  |
| 5   | Comercial  | Documentação contratual + orçamento + deploy             |

---

## 6. Sequência recomendada

### Fase 1 — Fechar divergências (P0)

1. **Reconciliar `main ↔ origin/main`**
   - Revisar commits de ambos os lados.
   - Resolver duplicatas.
   - Fazer merge/rebase limpo.

2. **Trazer Company Interest**
   - `git pull` das migrations.
   - Aplicar no Supabase.
   - Validar RPC + tabela.

3. **Fechar OAuth callback**
   - Implementar tratamento completo em `AuthCallback.tsx`.
   - Habilitar providers no Supabase.

### Fase 2 — Fechar módulos existentes

4. **Runtime Gates B/C**
   - Validar fluxos em browser real.

5. **Footer arquitetura final**
   - Definir `PublicLayout` vs `RoleBasedFooter`.

6. **Templates + Navigation runtime**
   - Validar seeds, RLS, carregamento.

### Fase 3 — Próximos blocos

7. **RBAC-05** — administração de RBAC.
8. **ROUTING-ARCH-02** — rotas protegidas.
9. **E2E completo** — fluxos críticos.
10. **Documentação comercial** — proposta, contrato, deploy.

---

## 7. Regra final

> Não abrir nova funcionalidade enquanto **1–3** não estiverem fechados.

Qualquer trabalho novo agora aumenta divergência entre:

- código local
- código remoto
- banco local
- banco remoto
- documentação
- runtime

**Fechar 1–3 antes de qualquer outra coisa.**

---

**Fim do documento.**
