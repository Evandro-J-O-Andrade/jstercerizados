# STAGE 02.14.3b — Varredura segmentada de chamadores `pg_proc` (RBAC/identidade/autorização)

**Projeto:** J&S Empregos LTDA (CHECK BOULER 24H / `js-empregos`, Supabase `okxqfyoqbhcmflpurfrw`, `sa-east-1`)  
**Data:** 2026-11-06  
**Base:** `STAGE02_14_RECONCILIACAO_EVIDENCIAS_E_PARECERES_P0.md` (02.14.3 erro na varredura ampla `pg_get_functiondef`/`array_agg`), `STAGE02_14_1B_CLASSIFICACAO_101_POLICIES_PUBLIC.md`.  
**Método (read-only):** consultas remotas via `supabase db query --linked` (CLI 2.117.0) sobre `pg_proc`, `pg_namespace`, `pg_depend`, `pg_policies`, `information_schema.triggers`, `has_function_privilege` e `pg_get_functiondef` segmentado por lista de funções detectadas. **Nenhum** DDL/DML, `GRANT/REVOKE`, alteração de RLS/policies/funções/Storage/Edge/config/código, commit, push ou deploy.

## Classificação de evidência

- **Comprovado por SQL:** resultado observado nesta sessão em catálogo/função/corpo/policy consultado.
- **Observado:** evidência prévia (02.1–02.14.1b).
- **Inferido:** conclusão lógica; não prova execução em runtime nem cobertura completa.
- **Pendente:** prova controlada, catálogo adicional (views/extensões/Edge/cliente), ou varredura fora do escopo.

**Limitações críticas:** referência textual em `pg_proc.prosrc`/`pg_policies.qual|with_check` **não comprova execução**. Ausência textual **não comprova ausência** de chamada (SQL dinâmico, clientes, Edge Functions, views/RPCs fora do filtro, migrações futuras). `pg_depend` para policies retorna `objid` de `pg_policy`; mapeamento `objid→policyname` não foi materializado aqui (Pendente), mas os `refobjid` confirmam dependência catalogada.

## 1. Funções-alvo (Comprovado por SQL)

| Função                                     |    OID | Sec     | Vol | EXECUTE anon | authenticated | service_role | postgres |
| ------------------------------------------ | -----: | ------- | --- | -----------: | ------------: | -----------: | -------: |
| `is_admin_master()`                        | 235515 | DEFINER | s   |        false |          true |         true |     true |
| `is_admin_master(uuid)`                    | 240812 | DEFINER | s   |        false |          true |         true |     true |
| `can_manage_role_assignment()`             | 240813 | DEFINER | s   |        false |          true |         true |     true |
| `can_manage_role_assignment(uuid)`         | 240814 | DEFINER | s   |        false |          true |         true |     true |
| `current_person_id()`                      | 240382 | INVOKER | s   |     **true** |          true |         true |     true |
| `can_read_person(uuid)`                    | 247359 | DEFINER | s   |        false |          true |         true |     true |
| `is_tenant_member(uuid)`                   | 235514 | DEFINER | s   |     **true** |          true |         true |     true |
| `user_has_permission(uuid,text,text,uuid)` | 235512 | DEFINER | s   |        false |          true |         true |     true |
| `resolve_page_template(text,uuid,uuid)`    | 240982 | INVOKER | s   |     **true** |          true |         true |     true |

Corpos A–D (resumo SQL): `is_admin_master`* verifica `people→role_assignments→roles` `admin_master/global` não expirado; `can_manage_role_assignment()` = admin_master global; `can_manage_role_assignment(tenant)` = admin_master global **ou** `tenant_admin` no tenant com membership ativa; `current_person_id()` retorna `people.id` de `auth.uid()` (INVOKER, `search_path` restrito); `can_read_person` = self/admin_master/mesmo tenant ativo com `can_manage_role_assignment` ou permissões `people|candidates|employees|applications|recruitment|support_tickets|tasks|chat|companies.read`.

## 2. Chamadores textuais em `pg_proc.prosrc` (Comprovado por SQL)

Consulta segmentada (`nspname not in pg_catalog/information_schema/extensions/graphql/graphql_public/pg_toast`, `prosrc ilike` por alvo, excluindo as próprias definições) encontrou **12 funções `public`**:

| Caller                             | Sec     | is_admin_master | can_manage_role_assignment | current_person_id | can_read_person | is_tenant_member | user_has_permission |
| ---------------------------------- | ------- | --------------: | -------------------------: | ----------------: | --------------: | ---------------: | ------------------: |
| `audit_log_insert()`               | DEFINER |               0 |                          0 |                 1 |               0 |                0 |                   0 |
| `domain_event_emit(...)`           | DEFINER |               0 |                          0 |                 1 |               0 |                0 |                   0 |
| `emit_domain_event(...)`           | DEFINER |               1 |                          1 |                 0 |               0 |                1 |                   1 |
| `financial_reversal(uuid)`         | DEFINER |               0 |                          0 |                 0 |               0 |                1 |                   1 |
| `fiscal_cancel_invoice(uuid)`      | DEFINER |               0 |                          0 |                 0 |               0 |                1 |                   1 |
| `fiscal_emit_invoice(uuid)`        | DEFINER |               0 |                          0 |                 0 |               0 |                1 |                   1 |
| `lgpd_consent_register()`          | DEFINER |               0 |                          0 |                 1 |               0 |                0 |                   0 |
| `match_candidates_to_demand(uuid)` | DEFINER |               0 |                          0 |                 0 |               0 |                1 |                   1 |
| `purchase_receipt_confirm()`       | DEFINER |               0 |                          0 |                 1 |               0 |                0 |                   0 |
| `stock_movement_insert()`          | DEFINER |               0 |                          0 |                 1 |               0 |                0 |                   0 |
| `sync_application_context()`       | DEFINER |               1 |                          1 |                 0 |               0 |                0 |                   1 |
| `user_permissions(uuid,uuid)`      | DEFINER |               1 |                          0 |                 0 |               0 |                0 |                   0 |

Corpos inspecionados (`pg_get_functiondef`, segmentado): predominam **triggers/funções de domínio**; `current_person_id()` usado para atribuir ator (`performed_by_person_id`/`created_by_person_id`/`person_id`) — risco de nulos/escopo incorreto se contexto ausente, não escalada direta. Funções fiscal/financeiro/eventos/matching combinam membership+permissão (blast radius confirmado em 02.14). `sync_application_context` e `emit_domain_event` combinam admin/gestão+permissão/membership. **`resolve_page_template` não apareceu como chamador textual em `public` (Pendente fora `public`/dinâmico/cliente).**

## 3. Dependências catalogadas `pg_depend` (Comprovado por SQL)

- `refobjid` dos alvos presentes: `235515` `is_admin_master()`, `240382` `current_person_id()`, `240814` `can_manage_role_assignment(uuid)`, `247359` `can_read_person(uuid)`. (**Não retornados:** `is_admin_master(uuid)` 240812, `can_manage_role_assignment()` 240813, `is_tenant_member` 235514, `user_has_permission` 235512, `resolve_page_template` 240982 — **Pendente**; ausência pode refletir tipo de dependência/normalização, não ausência de uso.)
- Dependentes: majoritariamente `pg_policy` (muitos), alguns `pg_rewrite`/outros conforme saída; contagem exata por policyname **Pendente** (requer join a `pg_policy`). Saída completa salva: `C:\Users\Evandro Andrade\.local\share\kilo\tool-output\tool_1b0b59d8d001EguaS2zxogXp4q`.

## 4. Policies `public` citando A–D (Comprovado por SQL)

| Helper                                   | Ocorrências em policies (contagem por texto) |
| ---------------------------------------- | -------------------------------------------: |
| `is_admin_master`                        |                                          776 |
| `can_manage_role_assignment`             |                                          660 |
| `current_person_id`                      |                                           35 |
| `can_read_person`                        |                                            1 |
| **Policies únicas citando qualquer A–D** |                                      **417** |

Interpretação: 417 policies citam pelo menos um helper A–D; 776/660 refletem menções em `qual` e/ou `with_check` e podem contar duas vezes por policy/expressão (por isso excedem 417). Isso confirma o **blast radius administrativo/identidade/self** independente do subconjunto 570 que cita `is_tenant_member`/`user_has_permission`.

## 5. Triggers (Comprovado por SQL)

`information_schema.triggers` com `action_statement` citando os 7 alvos: **0 linhas**. Pendente: corpos de trigger functions já cobertos parcialmente pela varredura `pg_proc`; triggers em outros schemas não consultados.

## 6. Riscos e dependências indiretas (Inferido, sustentado por SQL)

| Domínio                                | Dependência                                                                                                                                    | Risco de mudança sem prova controlada                                                                       |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| RBAC/identidade                        | `is_admin_master`, `can_manage_role_assignment`, `current_person_id`, `can_read_person`                                                        | Bloqueio indevido ou ampliação de acesso administrativo/self; impacto em 417 policies e funções de domínio. |
| Membership/permissão canônica          | `is_tenant_member`, `user_has_permission`                                                                                                      | 570 policies/207 tabelas + fiscal/financeiro/eventos/matching/aplicações (02.14/02.14.3b).                  |
| Auditoria/LGPD/estoque/compras         | `audit_log_insert`, `domain_event_emit`, `lgpd_consent_register`, `purchase_receipt_confirm`, `stock_movement_insert` usam `current_person_id` | Atribuição de ator incorreta/nula; impacto de rastreabilidade.                                              |
| Fiscal/financeiro/estoque/recrutamento | funções acima combinam `is_tenant_member`+`user_has_permission`                                                                                | Negação/permissão indevida em fluxos críticos.                                                              |
| Templates/PII                          | `resolve_page_template` EXECUTE público/INVOKER + PII condicionado (02.14)                                                                     | Exposição condicionada; sem chamadores `public` textuais detectados, mas superfície de chamada permanece.   |

## 7. Pendências objetivas (fechamento 02.14.3b)

1. Materializar `pg_policy.objid→schemaname/tablename/policyname` para os `pg_depend` de `is_admin_master`/`current_person_id`/`can_manage_role_assignment`/`can_read_person`.
2. Investigar ausência de `pg_depend` para `is_tenant_member`/`user_has_permission`/`resolve_page_template`/overloads 240812/240813 (normalização vs limitação).
3. Varredura textual fora de `public` (schemas `storage`/outros relevantes) e em views/RPC expostos, se autorizada.
4. Inventário controlado de chamadas cliente/Edge a `resolve_page_template`, `current_person_id`, `user_has_permission` (superfície RPC) — requer inspeção de código/Edge, não só SQL.
5. Cruzar 417 policies A–D com 570 helper policies e 101 do 02.14.1b para mapa de sobreposição (sem inferir autorização efetiva).

## 8. Estado

- **02.14.3b concluído documentalmente** (read-only). **Nenhuma alteração remota/código/config/Git.**
- P0 permanecem abertos. Próximo recomendado: **02.14.2b** (plano de prova controlada Storage/buckets) **ou** fechamento das pendências 1–2 acima, conforme autorização.
