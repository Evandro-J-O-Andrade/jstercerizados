# DATABASE-REMOTE-RECONCILIATION-3B.1.md

**Data:** 2026-08-19  
**Empresa:** J&S Empregos LTDA  
**Fase:** 3B — Remote Reconciliation  
**Gate:** 3B.1 — Functions / RPCs  
**Status:** READ-ONLY | REMOTE_UNVERIFIED | PENDENTE_EVIDÊNCIA  

---

## Regras operacionais

- READ-ONLY.
- NÃO executar CREATE, ALTER, DROP, INSERT, UPDATE, DELETE, TRUNCATE, GRANT ou REVOKE.
- NÃO criar migration.
- NÃO corrigir divergências.
- NÃO avançar para 3B.2 antes de preencher a seção 3B.1.

---

## Sumário executivo

| Categoria | Local | Remote | LOCAL_ONLY | REMOTE_ONLY | SIGNATURE_CONFLICT | IMPLEMENTATION_CONFLICT | LEGACY | UNKNOWN |
|-----------|------:|-------:|-----------:|------------:|-------------------:|------------------------:|-------:|--------:|
| Functions/RPCs | 30 | **REMOTE_UNVERIFIED** | — | — | — | — | — | — |
| Grants | — | **REMOTE_UNVERIFIED** | — | — | — | — | — | — |

**Legenda:**
- `LOCAL_ONLY` — existe no repositório, não existe no remoto
- `REMOTE_ONLY` — existe no remoto, não existe no repositório
- `SIGNATURE_CONFLICT` — nome igual, assinatura diferente
- `IMPLEMENTATION_CONFLICT` — assinatura igual, implementação diferente
- `LEGACY` — objeto antigo mantido por compatibilidade
- `UNKNOWN` — não foi possível classificar

---

## Evidência remota pendente

Para preencher este documento, execute **somente estas consultas** no SQL Editor do Supabase:

### 1/3 — Functions/RPCs

```sql
SELECT
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_get_function_identity_arguments(p.oid) AS arguments,
    pg_get_function_result(p.oid) AS return_type,
    l.lanname AS language,
    CASE
        WHEN p.prosecdef THEN 'SECURITY DEFINER'
        ELSE 'SECURITY INVOKER'
    END AS security_type,
    p.provolatile AS volatility,
    pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n
    ON p.pronamespace = n.oid
JOIN pg_language l
    ON p.prolang = l.oid
WHERE n.nspname = 'public'
ORDER BY p.proname, arguments;
```

### 2/3 — Routines

```sql
SELECT
    routine_schema,
    routine_name,
    routine_type,
    data_type AS return_type,
    security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
```

### 3/3 — Grants

```sql
SELECT
    routine_schema,
    routine_name,
    grantee,
    privilege_type
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
ORDER BY routine_name, grantee, privilege_type;
```

Cole o resultado aqui no documento, em seções separadas, para reconciliação.

---

## Baseline local — Functions/RPCs

Fonte: `docs/DATABASE-LOGIC-INVENTORY-V2.1.md` (Fase 3A)

| Nome | Schema | Tipo | Retorno | SECURITY DEFINER | Dependências | Status local |
|------|--------|------|---------|------------------|--------------|--------------|
| `emit_domain_event` | public | plpgsql | uuid | SIM | `domain_events` | LOCAL_VERIFIED |
| `emit_application_created_event` | public | plpgsql | trigger | NÃO | `emit_domain_event` | LOCAL_VERIFIED |
| `emit_application_status_changed_event` | public | plpgsql | trigger | NÃO | `emit_domain_event` | LOCAL_VERIFIED |
| `emit_candidate_created_event` | public | plpgsql | trigger | NÃO | `emit_domain_event` | LOCAL_VERIFIED |
| `emit_job_published_event` | public | plpgsql | trigger | NÃO | `emit_domain_event` | LOCAL_VERIFIED |
| `emit_talent_pool_joined_event` | public | plpgsql | trigger | NÃO | `emit_domain_event` | LOCAL_VERIFIED |
| `emit_job_match_found_event` | public | plpgsql | trigger | NÃO | `emit_domain_event` | LOCAL_VERIFIED |
| `prevent_event_modification` | public | plpgsql | trigger | NÃO | — | LOCAL_VERIFIED |
| `skip_expired_notification_deliveries` | public | plpgsql | trigger | NÃO | — | LOCAL_VERIFIED |
| `validate_talent_pool_consent` | public | plpgsql | trigger | NÃO | — | LOCAL_VERIFIED |
| `validate_candidate_preferences_update` | public | plpgsql | trigger | NÃO | — | LOCAL_VERIFIED |
| `update_updated_at` | public | plpgsql | trigger | NÃO | — | LOCAL_VERIFIED |
| `user_has_permission` | public | plpgsql | boolean | SIM | `role_assignments`, `roles`, `role_resource_permissions`, `tenant_memberships` | LOCAL_VERIFIED |
| `can_access_tenant` | public | sql | boolean | SIM | `tenant_memberships`, `people` | LOCAL_VERIFIED |
| `create_notification` | public | plpgsql | uuid | SIM | `notifications` | LOCAL_VERIFIED |
| `create_notification_delivery` | public | plpgsql | uuid | SIM | `notification_deliveries` | LOCAL_VERIFIED |
| `mark_delivery_sent` | public | plpgsql | void | SIM | `notification_deliveries` | LOCAL_VERIFIED |
| `mark_delivery_delivered` | public | plpgsql | void | SIM | `notification_deliveries` | LOCAL_VERIFIED |
| `mark_delivery_failed` | public | plpgsql | void | SIM | `notification_deliveries` | LOCAL_VERIFIED |
| `mark_event_published` | public | plpgsql | void | SIM | `domain_events` | LOCAL_VERIFIED |
| `mark_event_failed` | public | plpgsql | void | SIM | `domain_events` | LOCAL_VERIFIED |
| `mark_notification_read` | public | plpgsql | void | SIM | `notifications` | LOCAL_VERIFIED |
| `is_channel_enabled` | public | sql | boolean | SIM | `notification_preferences` | LOCAL_VERIFIED |
| `join_talent_pool` | public | plpgsql | uuid | SIM | `talent_pool_memberships`, `candidates` | LOCAL_VERIFIED |
| `remove_from_talent_pool` | public | plpgsql | void | SIM | `talent_pool_memberships` | LOCAL_VERIFIED |
| `pause_talent_pool` | public | plpgsql | void | SIM | `talent_pool_memberships` | LOCAL_VERIFIED |
| `get_active_candidates_for_matching` | public | sql | table | SIM | `talent_pool_memberships`, `candidates`, `job_matches`, `candidate_preferences`, `candidate_skills` | LOCAL_VERIFIED |
| `get_pending_domain_events` | public | sql | table | SIM | `domain_events` | LOCAL_VERIFIED |
| `get_pending_deliveries` | public | sql | table | SIM | `notification_deliveries`, `notifications` | LOCAL_VERIFIED |
| `get_due_deliveries` | public | sql | table | SIM | `notification_deliveries`, `notifications` | LOCAL_VERIFIED |
| `is_frontend_safe_role` | public | sql | boolean | SIM | — | LOCAL_VERIFIED |
| `create_default_notification_preferences` | public | plpgsql | void | SIM | `notification_preferences` | LOCAL_VERIFIED |
| `handle_new_user` | public | plpgsql | trigger | SIM | `tenants`, `profiles` | LOCAL_VERIFIED |

**Total LOCAL:** 30 funções

---

## Matriz LOCAL × REMOTE

| Function/RPC | Local | Remote | Signature | Implementation | Status | V2.1 Action |
|--------------|-------|--------|-----------|----------------|--------|-------------|
| `emit_domain_event` | SIM | REMOTE_UNVERIFIED | — | — | UNKNOWN | — |
| `emit_application_created_event` | SIM | REMOTE_UNVERIFIED | — | — | UNKNOWN | — |
| `emit_application_status_changed_event` | SIM | REMOTE_UNVERIFIED | — | — | UNKNOWN | — |
| `emit_candidate_created_event` | SIM | REMOTE_UNVERIFIED | — | — | UNKNOWN | — |
| `emit_job_published_event` | SIM | REMOTE_UNVERIFIED | — | — | UNKNOWN | — |
| `emit_talent_pool_joined_event` | SIM | REMOTE_UNVERIFIED | — | — | UNKNOWN | — |
| `emit_job_match_found_event` | SIM | REMOTE_UNVERIFIED | — | — | UNKNOWN | — |
| `prevent_event_modification` | SIM | REMOTE_UNVERIFIED | — | — | UNKNOWN | — |
| `skip_expired_notification_deliveries` | SIM | REMOTE_UNVERIFIED | — | — | UNKNOWN | — |
| `validate_talent_pool_consent` | SIM | REMOTE_UNVERIFIED | — | — | UNKNOWN | — |
| `validate_candidate_preferences_update` | SIM | REMOTE_UNVERIFIED | — | — | UNKNOWN | — |
| `update_updated_at` | SIM | REMOTE_UNVERIFIED | — | — | UNKNOWN | — |
| `user_has_permission` | SIM | REMOTE_UNVERIFIED | — | — | UNKNOWN | — |
| `can_access_tenant` | SIM | REMOTE_UNVERIFIED | — | — | UNKNOWN | — |
| `create_notification` | SIM | REMOTE_UNVERIFIED | — | — | UNKNOWN | — |
| `create_notification_delivery` | SIM | REMOTE_UNVERIFIED | — | — | UNKNOWN | — |
| `mark_delivery_sent` | SIM | REMOTE_UNVERIFIED | — | — | UNKNOWN | — |
| `mark_delivery_delivered` | SIM | REMOTE_UNVERIFIED | — | — | UNKNOWN | — |
| `mark_delivery_failed` | SIM | REMOTE_UNVERIFIED | — | — | UNKNOWN | — |
| `mark_event_published` | SIM | REMOTE_UNVERIFIED | — | — | UNKNOWN | — |
| `mark_event_failed` | SIM | REMOTE_UNVERIFIED | — | — | UNKNOWN | — |
| `mark_notification_read` | SIM | REMOTE_UNVERIFIED | — | — | UNKNOWN | — |
| `is_channel_enabled` | SIM | REMOTE_UNVERIFIED | — | — | UNKNOWN | — |
| `join_talent_pool` | SIM | REMOTE_UNVERIFIED | — | — | UNKNOWN | — |
| `remove_from_talent_pool` | SIM | REMOTE_UNVERIFIED | — | — | UNKNOWN | — |
| `pause_talent_pool` | SIM | REMOTE_UNVERIFIED | — | — | UNKNOWN | — |
| `get_active_candidates_for_matching` | SIM | REMOTE_UNVERIFIED | — | — | UNKNOWN | — |
| `get_pending_domain_events` | SIM | REMOTE_UNVERIFIED | — | — | UNKNOWN | — |
| `get_pending_deliveries` | SIM | REMOTE_UNVERIFIED | — | — | UNKNOWN | — |
| `get_due_deliveries` | SIM | REMOTE_UNVERIFIED | — | — | UNKNOWN | — |
| `is_frontend_safe_role` | SIM | REMOTE_UNVERIFIED | — | — | UNKNOWN | — |
| `create_default_notification_preferences` | SIM | REMOTE_UNVERIFIED | — | — | UNKNOWN | — |
| `handle_new_user` | SIM | REMOTE_UNVERIFIED | — | — | UNKNOWN | — |

---

## LOCAL_ONLY

| Function/RPC | Motivo | V2.1 Action |
|--------------|--------|-------------|
| — | Nenhum identificado até o momento | — |

---

## REMOTE_ONLY

| Function/RPC | Motivo | V2.1 Action |
|--------------|--------|-------------|
| — | Nenhum identificado até o momento | — |

---

## SIGNATURE_CONFLICT

| Function/RPC | Local signature | Remote signature | Impacto | V2.1 Action |
|--------------|-----------------|------------------|---------|-------------|
| — | Nenhum identificado até o momento | — | — | — |

---

## IMPLEMENTATION_CONFLICT

| Function/RPC | Local definition | Remote definition | Impacto | V2.1 Action |
|--------------|------------------|-------------------|---------|-------------|
| — | Nenhum identificado até o momento | — | — | — |

---

## LEGACY

| Function/RPC | Motivo | V2.1 Action |
|--------------|--------|-------------|
| `handle_new_user` | Usa `profiles` + `tenant_memberships.user_id`; V2.1 usa `people.auth_user_id` | Reconciliar ou remover |

---

## UNKNOWN

| Function/RPC | Motivo | V2.1 Action |
|--------------|--------|-------------|
| Todas as demais listadas | Evidência remota ainda não coletada | Aguardar queries 3B.1 |

---

## Grants — Baseline local

Nenhum inventário local de grants foi coletado na Fase 3A.

**Ação:** preencher com o resultado da query 3/3.

---

## Evidência remota coletada

### 3/3 — Resultado

```text
REMOTE_UNVERIFIED
```

---

## Próximos passos

1. Cole o resultado das 3 queries nas seções correspondentes acima.
2. Atualize as tabelas `LOCAL × REMOTE`, `LOCAL_ONLY`, `REMOTE_ONLY`, `SIGNATURE_CONFLICT`, `IMPLEMENTATION_CONFLICT`, `LEGACY` e `UNKNOWN`.
3. Valide as divergências contra `docs/DATABASE-LOGIC-INVENTORY-V2.1.md`.
4. Não corrija nada ainda; apenas registre evidências.
5. Somente após fechamento desta seção, avance para **3B.2 — Triggers**.

---

## Confirmação de gate

- [ ] Nenhuma operação de escrita foi executada no banco remoto.
- [ ] Nenhuma migration foi criada.
- [ ] Nenhuma divergência foi corrigida.
- [ ] Evidência remota coletada e registrada.
- [ ] Matriz LOCAL × REMOTO preenchida.
- [ ] Próximo gate autorizado: 3B.2.
