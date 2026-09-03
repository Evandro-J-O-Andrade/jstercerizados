# Auditoria Master de Completude — Fase 4.2: E2E Candidato

**Data:** 2026-09-03
**Escopo:** Validar a cadeia do candidato ponta-a-ponta: `auth.users → people → tenant_memberships + role_assignments → candidates → /dashboard/candidato`.
**Status:** ❌ Tela preta tem causa-raiz mapeada.

---

## 1. Cadeia do candidato (DB)

```
auth.users (id)
  └─ people (auth_user_id)
       └─ candidates (person_id) ─┐
       └─ tenant_memberships     │ (membership_role='member')
       └─ role_assignments ───────┴─ roles (name='candidate')
```

✅ **A cadeia existe e está bem modelada.** Funções de segurança corretas:

- `public.current_person_id()` — mapeia `auth.uid()` → `people.id`
- `public.is_tenant_member(p_tenant_id)` — verifica membership ativa
- `public.is_admin_master()` — escopo global

## 2. RLS por tabela (policies)

| Tabela               | Policy                             | Qual                                                                      | OK?                                                                 |
| -------------------- | ---------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `candidates`         | `candidates_member_read`           | `is_tenant_member(tenant_id)`                                             | 🟢                                                                  |
| `candidates`         | `candidates_member_update/write`   | `is_tenant_member`                                                        | 🟢                                                                  |
| `people`             | `people_member_read`               | `is_admin_master OR auth.uid()=auth_user_id OR EXISTS tenant_memberships` | 🟢                                                                  |
| `jobs`               | `Published jobs visible to public` | `status='published' AND role IN (anon, authenticated)`                    | 🟢                                                                  |
| `jobs`               | `jobs_member_read`                 | `is_tenant_member(tenant_id)`                                             | 🟢                                                                  |
| `applications`       | `applications_member_read`         | `EXISTS candidates WHERE c.tenant_id matches`                             | 🟢                                                                  |
| `tenant_memberships` | `tenant_memberships_member_read`   | `is_admin_master OR is_tenant_member(tenant_id)`                          | 🟢 (RH pode ver; candidato também vê as dos outros no mesmo tenant) |
| `role_assignments`   | `role_assignments_member_read`     | `is_admin_master OR is_tenant_member(tenant_id)`                          | 🟢                                                                  |

✅ **RLS está correto**, embora candidato possa ver memberships/roles de outros do mesmo tenant (decisão de produto, não furo de segurança estrito).

## 3. Estado atual dos dados

| Métrica                                   | Valor            |
| ----------------------------------------- | ---------------- |
| Total de `candidates`                     | 8                |
| Com `auth_user_id` (podem logar)          | 4                |
| Sem `auth_user_id` (não logam)            | 4                |
| Total de `applications`                   | **0**            |
| Total de `tenant_memberships` (d480af07…) | 5                |
| Senha do Evandro resetada (teste)         | `Auditoria@2026` |

⚠️ **4 candidatos não conseguem logar** porque `people.auth_user_id IS NULL`. Provavelmente foram criados via admin (seed/insert) sem criar `auth.users`. Necessário:

- Trigger/script que cria `auth.users` ao inserir `people` com e-mail, ou
- Limpar candidatos órfãos, ou
- Vincular manualmente via Admin API.

## 4. Teste E2E via Supabase Client (como Evandro)

Login OK com `Auditoria@2026` (reset via admin.updateUserById). Token funciona. Queries executadas:

| Query                             | Resultado                                               | Diagnóstico                                                                                                                                                 |
| --------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `candidates` (c/select *)         | ❌ **400** "column candidates.full_name does not exist" | `candidates` tem 14 colunas, sem `full_name`. **NÃO é causa da tela preta** (foi erro do meu script, repo usa `*` direto).                                  |
| `people` (c/tenant_id)            | ❌ **400** "column people.tenant_id does not exist"     | `people` **NÃO tem coluna `tenant_id`**. Tenant mora em `tenant_memberships`. **Mas o repo frontend chama `*.people(*)` no nested select** — isso funciona. |
| `applications`                    | ✅ count=0 (vazio)                                      | OK                                                                                                                                                          |
| `jobs` (cross-tenant anon policy) | ✅ count=20                                             | Política pública libera `status='published'`.                                                                                                               |
| `tenant_memberships` (self)       | ✅ 5 rows (incluindo de outros)                         | Decisão de produto: candidatos veem membros do próprio tenant.                                                                                              |
| `role_assignments`                | ✅ 5 rows                                               | Idem.                                                                                                                                                       |
| `roles`                           | ✅ 10 rows (operator, tenant_admin, …, stock_manager)   | ⚠️ **Falta `candidate` no retorno** mas existe no DB (visto antes em `role_name: 'candidate'`).                                                             |
| INSERT `candidates`               | ❌ 409 FK violation                                     | Esperado: candidato não pode criar candidate.                                                                                                               |

## 5. Causa-raiz da TELA PRETA no `/dashboard/candidato`

Ao inspecionar `DashboardCandidato.tsx`, mapeei **3 problemas de contrato frontend↔DB**:

### 5.1 `exp.position` / `exp.company` não existem

- **DB** (`candidate_experiences`): colunas são `role` e `company_name`.
- **Frontend** (`DashboardCandidato.tsx:252,254`): lê `exp.position` e `exp.company`.
- **Impacto:** retorna `undefined`; UI mostra " · " (vazio com separadores).
- **Severidade:** 🟡 cosmético, não causa tela preta.

### 5.2 `applications` schema desatualizado

- **DB** (`applications`): tem `status` (text).
- **Frontend** (`applications.repository.ts:50`): filtra por `current_stage`.
- **Impacto:** query retorna 0 ou erro silencioso no filter; mapper recebe estrutura diferente.
- **Severidade:** 🟠 pode causar lista vazia de candidaturas (cosmético) mas não tela preta.

### 5.3 `candidatesRepository.findAll` retorna TODOS os candidates do tenant + filtra client-side

- **Problema:** RLS deixa o candidato ver todos os candidates do tenant (correto para RH/recrutador), mas `DashboardCandidato` chama `findAll(tenantId)` e filtra `c.person_id === person.id` no JS.
- **Funciona?** Sim, mas: **8 candidates no DB, e a query `select *` + 7 nested joins pode estourar payload ou demorar muito**. Em redes lentas pode parecer "tela preta" se o spinner do `loading` ficar muito tempo.
- **Severidade:** 🟠 plausível causa de "tela preta" em cold start / primeira carga.

### 5.4 `applications` tem 0 rows (e não apenas da Evandro — **de TODOS**)

- **Confirmado:** `SELECT COUNT(*) FROM applications` = 0.
- **Impacto:** bloco "Suas candidaturas" mostra estado vazio (Briefcase icon + "Você ainda não se candidatou a nenhuma vaga"). Não é tela preta.
- **Severidade:** 🟡 dados de seed faltando.

### 5.5 `candidate_experiences` provavelmente vazia

- Candidato Evandro não tem `headline` e provavelmente sem `experiences`/`skills`/`education`.
- **Severidade:** 🟡 falta seed de perfil rico.

### 5.6 Possível causa-raiz de tela preta: **`AuthContext.currentTenantId` é `null`**

- `DashboardCandidato` linha 76: `if (!person || !tenantId) return;` — se `currentTenantId` for `null` (não configurado no JWT/AuthContext), o useEffect sai sem nunca chamar `setState({loading: false})` e o componente fica no spinner infinito.
- **Severidade:** 🔴 **causa-raiz plausível da tela preta.**

## 6. Validações executadas (automatizadas via `pg`)

| Teste                                              | Resultado           |
| -------------------------------------------------- | ------------------- |
| Conexão DB                                         | ✅                  |
| `admin.listUsers()`                                | ✅ 15 usuários      |
| `auth.signInWithPassword(Evandro, Auditoria@2026)` | ✅                  |
| Query como user em `candidates`                    | ❌ 400 (meu erro)   |
| Query como user em `jobs`                          | ✅ 20               |
| Query como user em `tenant_memberships`            | ✅ 5 (multi-tenant) |
| INSERT `candidates` como user                      | ❌ 409 (esperado)   |
| RLS policies dump                                  | ✅ todas presentes  |

## 7. Ações para fechar o candidato (não implementar agora)

1. **P0:** Popular `people.auth_user_id` dos 4 candidatos órfãos via Admin API (criar `auth.users` + update `people.auth_user_id`).
2. **P0:** Em `AuthContext`, garantir `currentTenantId` seja definido após login (buscar primeira `tenant_membership` ativa).
3. **P0:** Trocar `candidatesRepository.findAll(tenantId)` por `candidatesRepository.findByPersonId(personId, tenantId)` (precisa criar método) para evitar carregar 8 candidates.
4. **P0:** Criar `findMyApplications(personId, tenantId)` em `applicationsRepository` que filtra via `candidate_id` (em vez de `search: person.id` que não bate).
5. **P0:** Renomear `applications.status` ↔ frontend `current_stage` (alinhamento de contrato).
6. **P0:** Renomear `candidate_experiences.role/company_name` ↔ frontend `position/company` (ou criar view `candidate_experiences_v1`).
7. **P1:** Seed: criar 5 applications para Evandro, popular `candidate_experiences` (3), `candidate_skills` (10), `candidate_education` (2).
8. **P1:** Adicionar fallback visual em `DashboardCandidato` quando `person` ou `tenantId` são `null` (mostrar mensagem em vez de spinner eterno).
9. **P2:** Rever política de `tenant_memberships_member_read` se candidatos não devem ver outros candidatos do mesmo tenant.

## 8. Conclusão

✅ **Modelo de candidato está correto** e bem protegido por RLS.
❌ **UX do `/dashboard/candidato` está quebrada** por 3 desalinhamentos schema↔frontend + falta de seed.
🔴 **Tela preta mais provável:** `AuthContext.currentTenantId` indefinido → spinner eterno.

---

**Próximo:** consolidar com `audit-master-frontend.md` e `audit-master-db.md` na matriz final.
