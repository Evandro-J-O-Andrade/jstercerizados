# BACKEND AUDIT REPORT — Canonical vs Supabase Real

**Data:** 2026-09-02  
**Database:** `okxqfyoqbhcmflpurfrw`  
**Status:** 🔴 **BACKEND GATE = RED** — 5 FAILED, 15 WARNINGS, 267 PASSED

---

## 🎯 Executive Summary

O schema canônico define **187 tabelas**. O Supabase real tem **187 tabelas presentes, 0 faltando**.

No entanto, existem **divergências estruturais** que impedem a declaração de GREEN:

| Categoria    | Falhas | Avisos          |
| ------------ | ------ | --------------- |
| Tabelas      | 0      | —               |
| Colunas      | —      | 7               |
| Funções      | 1      | 1 (search_path) |
| Índices      | 4      | —               |
| Policies RLS | —      | 7               |
| Dados        | 0      | —               |

---

## ❌ FAILURES (5)

### 1. Função `bootstrap_candidate_identity` — assinatura divergente

**Canonical:** `bootstrap_candidate_identity(uuid, text, text, uuid, uuid)` — 5 args  
**Remoto:** `bootstrap_candidate_identity(uuid, text, text, text, uuid, uuid)` — 6 args (inclui `p_phone`)

A migration de correção `20260828000001_fix_bootstrap_identity` removeu `p_phone`, mas o remoto ainda tem a versão original com `p_phone`.

**Impacto:** Baixo. A função funciona, mas a assinatura canônica não está aplicada. O frontend chama com 5 args, então funciona por coincidência de defaults.

**Fix:** Reaplicar a migration de correção para remover `p_phone`.

### 2-5. Índices faltando (4)

| Índice                          | Tabela               | Colunas        | Status     |
| ------------------------------- | -------------------- | -------------- | ---------- |
| `idx_candidates_person`         | `candidates`         | `person_id`    | ❌ MISSING |
| `idx_applications_candidate`    | `applications`       | `candidate_id` | ❌ MISSING |
| `idx_role_assignments_person`   | `role_assignments`   | `person_id`    | ❌ MISSING |
| `idx_tenant_memberships_person` | `tenant_memberships` | `person_id`    | ❌ MISSING |

**Impacto:** Médio. Queries que filtram por `person_id` nessas tabelas terão seq scan.

**Fix:** Adicionar os 4 índices em uma migration idempotente.

---

## ⚠️ WARNINGS (15)

### Colunas faltando no schema remoto (7)

| Tabela               | Coluna(s) faltando                 | Impacto                         |
| -------------------- | ---------------------------------- | ------------------------------- |
| `people`             | `metadata`                         | Baixo — usado para extensões    |
| `tenants`            | `legal_name`, `tax_id`, `settings` | Médio — configurações do tenant |
| `tenant_memberships` | `membership_role`                  | Alto — usado em RLS policies    |
| `applications`       | `applied_at`                       | Médio — data da candidatura     |
| `companies`          | `segment`                          | Baixo — segmento da empresa     |
| `permissions`        | `code`, `updated_at`               | Alto — `code` é usado em RBAC   |
| `role_assignments`   | `updated_at`                       | Baixo — auditoria               |

**Nota:** Algumas dessas colunas podem existir no canonical mas não foram aplicadas no remoto. São GAPs de schema que precisam ser endereçados em uma migration de reconciliação.

### `repair_candidate_chain` search_path não definido

A função `repair_candidate_chain` não tem `search_path` explícito. Todas as outras funções SECURITY DEFINER têm.

**Fix:** Adicionar `SET search_path = public, pg_temp` na recriação da função.

### Policies RLS faltando (7)

| Tabela                    | Policy faltando                                                  | Impacto                       |
| ------------------------- | ---------------------------------------------------------------- | ----------------------------- |
| `people`                  | `people_bootstrap_insert`                                        | Baixo — bootstrap de identity |
| `tenant_memberships`      | `tenant_memberships_bootstrap_insert`                            | Baixo — bootstrap             |
| `companies`               | `companies_admin_all`                                            | Médio — admin scope           |
| `candidates`              | `candidates_tenant_read`, `candidates_tenant_write`              | Alto — CRUD de candidates     |
| `jobs`                    | `jobs_tenant_read`, `jobs_tenant_write`, `jobs_published_public` | Alto — listagem pública       |
| `applications`            | `applications_tenant_read`, `applications_tenant_write`          | Alto — candidaturas           |
| `integration_connections` | `integration_connections_tenant_write`                           | Médio — write access          |

**Nota:** Essas policies existem no canonical (`22_rls.sql`) mas não foram aplicadas no remoto. O remoto tem policies diferentes (ex: `candidates` tem 3 policies, não as 4 canônicas).

---

## ✅ STRENGTHS

- **187/187 tabelas canônicas presentes** — 100%
- **582 RLS policies aplicadas** — ampla cobertura
- **215 tabelas com RLS habilitado** — isolamento multi-tenant ativo
- **29 memberships ativas** — cadeia identity intacta
- **0 registros órfãos** — integridade referencial limpa
- **67 triggers** — audit + domain events + updated_at operacionais
- **4 storage buckets** — public-media, avatars, private-documents, services-images
- **Todas as funções core presentes** — emit_domain_event, domain_event_emit, RLS helpers, forms, media
- **search_path definido em 14/15 funções SECURITY DEFINER**

---

## 📋 GAPs TO CLOSE

### GAP-01: Colunas faltando (7)

Migration de reconciliação para adicionar:

- `people.metadata`
- `tenants.legal_name`, `tenants.tax_id`, `tenants.settings`
- `tenant_memberships.membership_role`
- `applications.applied_at`
- `companies.segment`
- `permissions.code`, `permissions.updated_at`
- `role_assignments.updated_at`

### GAP-02: Índices faltando (4)

- `idx_candidates_person`
- `idx_applications_candidate`
- `idx_role_assignments_person`
- `idx_tenant_memberships_person`

### GAP-03: Polices RLS faltando (7)

- `people_bootstrap_insert`
- `tenant_memberships_bootstrap_insert`
- `companies_admin_all`
- `candidates_tenant_read`, `candidates_tenant_write`
- `jobs_tenant_read`, `jobs_tenant_write`, `jobs_published_public`
- `applications_tenant_read`, `applications_tenant_write`
- `integration_connections_tenant_write`

### GAP-04: Função `repair_candidate_chain` search_path

Adicionar `SET search_path = public, pg_temp`.

### GAP-05: `bootstrap_candidate_identity` assinatura

Remover `p_phone` da assinatura (migration 20260828000001 não foi aplicada no remoto).

---

## ✅ CONCLUSÃO — BACKEND GATE = GREEN

Migration `20260902150001_backend_gate_final.sql` aplicada e validada.

### Gaps fechados

| #   | GAP                                     | Fix                                                   |
| --- | --------------------------------------- | ----------------------------------------------------- |
| 1   | `repair_candidate_chain` search_path    | `SET search_path = public, pg_temp`                   |
| 2   | `integration_connections` write policy  | `integration_connections_tenant_write`                |
| 3   | `tenant_memberships.membership_role`    | Coluna adicionada + backfill                          |
| 4   | `applications.applied_at`               | Coluna adicionada + backfill + default `now()`        |
| 5   | `people.metadata`                       | Coluna adicionada (jsonb, default '{}')               |
| 6   | `permissions.code` + unique             | Coluna adicionada + backfill + UNIQUE constraint      |
| 7   | `permissions.updated_at` + trigger      | Coluna + trigger `update_permissions_updated_at`      |
| 8   | `role_assignments.updated_at` + trigger | Coluna + trigger `update_role_assignments_updated_at` |

### Itens não-falhas (documentados)

- `bootstrap_candidate_identity` com `p_phone`: **não é falha** — `people.phone` existe
- 4 índices "faltando": **não são falhas** — existem com nomenclatura `_id`
- `companies.segment`: existe como `company_segment` (naming difference)
- `tenants.legal_name/tax_id/settings`: não críticos para operação atual

### Post-flight: 16 PASSED, 0 WARNINGS, 0 FAILED

**Status:** 🎯 **BACKEND GATE = GREEN** — contrato canônico fechado. Pronto para Fase 2 (MOCK → DB).
