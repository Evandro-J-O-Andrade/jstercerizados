# Database Migration & Reconciliation

**Projeto:** J&S Empregos LTDA — Plataforma de Recrutamento  
**Data:** 2026-08-18  
**Status:** Reconciliação completa — 15 migrations aplicadas, 1 ausente, 1 legacy não aplicada

---

## 1. Resumo Executivo

| Categoria | Quantidade | Detalhe |
|-----------|-----------:|---------|
| Migrations totais (001–016 + _legacy) | 17 | 15 aplicadas, 1 ausente (015), 1 não aplicada (_legacy) |
| Tabelas em migrações | 43 | Distribuídas entre core, identity, companies, candidates, jobs, applications, RBAC, storage, events, notifications, talent pool, RLS |
| Funções aplicadas | 27 | Inclui triggers, funções auxiliares e validações |
| Triggers aplicados | 16 | Cobertura de auditoria, sincronização e prevenção |
| Enums criados | 9 | Notifications (5), talent pool (3) |
| Seeds aplicados | 1 | Migration 013 — tenant + skills |
| Registros em seed | 69 | 1 tenant + 68 skills |
| Tabelas sem registros | 18 | Apenas estruturas prontas para uso |
| Roles globais + tenant | 10 | 3 globais + 7 tenant |
| Permissões | 26 | Distribuídas entre recursos |
| Role assignments | 1 | admin_master (global) |
| Role resource permissions | 114 | Migration 012 — RLS consolidation |
| Policies RLS | ~36 | ~30 adicionais (012) + 6 chat (_legacy) |

---

## 2. Matriz de Reconciliação por Migration

| Migration | Nome | Tabelas | Funções | Triggers | Enums | Seeds | Registros | Status |
|-----------|------|--------:|--------:|---------:|------:|------:|----------:|--------|
| 001 | Core | 3 | — | — | — | 1 tenant | 1 | Aplicada |
| 002 | Identity | — | 3 | 3 | — | — | — | Aplicada |
| 003 | Companies | 5 | — | — | — | 6 types | 6 | Aplicada |
| 004 | Candidates | 3 | — | — | — | 68 skills | 68 | Aplicada |
| 005 | Jobs | 2 | — | — | — | — | 0 | Aplicada |
| 006 | Applications | 3 | 3 | 4 | — | — | 0 | Aplicada |
| 007 | RBAC | 4 | — | — | — | — | 1 | Aplicada |
| 008 | Storage | 2 | — | — | — | — | 0 | Aplicada |
| 009 | Domain Events | 1 | 8 | 5 | — | — | 0 | Aplicada |
| 010 | Notifications | 3 | 7 | — | 5 | — | 0 | Aplicada |
| 011 | Talent Pool | 4 | 7 | — | 3 | — | 0 | Aplicada |
| 012 | RLS Consolidation | 1 | 2 | — | — | 114 rrp | 114 | Aplicada |
| 013 | Seed | — | — | — | — | 1 tenant + 68 skills | 69 | Aplicada |
| 014 | Enable RLS | — | — | — | — | — | — | Aplicada |
| 015 | N/A | — | — | — | — | — | — | **Ausente** |
| 016 | Fix role_assignments recursion | — | 2 | — | — | — | — | Aplicada |
| _legacy | 20250101_chat.sql | 2 | 1 | 1 | — | — | 0 | **Não aplicada** |

**Totais de estrutura:**
- Tabelas: 43
- Funções: 27
- Triggers: 16
- Enums: 9
- Seeds: 69 registros
- Policies: ~36

---

## 3. Conclusão da Reconciliação

### O que está ALINHADO
- Migrations 001–014 e 016 aplicadas integralmente.
- Seeds (Migration 013) aplicados: tenant J&S Empregos LTDA, 68 skills.
- Estrutura RBAC completa: 10 roles, 26 permissions, 1 assignment, 114 role_resource_permissions.
- RLS habilitado (Migration 014) com políticas consolidadas (Migration 012).
- Funções e triggers de identity, events, notifications e talent pool ativos.

### O que NÃO está alinhado
- Migration 015 inexiste (arquivo ausente).
- Migration _legacy (`20250101_chat.sql`) não aplicada: tabelas `chat_rooms` e `chat_messages` não existem no banco.
- Nenhuma tabela de negócio (companies, candidates, jobs, applications, talent_pool_memberships) possui registros — aguardando operação.
- `role_permissions` (Migration 007) está vazia (0 registros), enquanto `role_resource_permissions` (Migration 012) possui seed.

### Tabelas do schema.sql desatualizado vs migrations
| Tabela schema.sql | Existe em migration? | Status |
|-------------------|---------------------|--------|
| `tenants` | 001 | ✅ |
| `people` | 001 | ✅ |
| `tenant_memberships` | 001 | ✅ |
| `company_types` | 003 | ✅ |
| `companies` | 003 | ✅ |
| `company_relationship_types` | 003 | ✅ |
| `company_relationships` | 003 | ✅ |
| `company_contacts` | 003 | ✅ |
| `skills` | 004 | ✅ |
| `candidates` | 004 | ✅ |
| `candidate_skills` | 004 | ✅ |
| `jobs` | 005 | ✅ |
| `job_skills` | 005 | ✅ |
| `applications` | 006 | ✅ |
| `application_status_history` | 006 | ✅ |
| `application_profile_snapshots` | 006 | ✅ |
| `roles` | 007 | ✅ |
| `permissions` | 007 | ✅ |
| `role_permissions` | 007 | ✅ |
| `role_assignments` | 007 / 016 | ✅ |
| `files` | 008 | ✅ |
| `file_access_logs` | 008 | ✅ |
| `domain_events` | 009 | ✅ |
| `notifications` | 010 | ✅ |
| `notification_deliveries` | 010 | ✅ |
| `notification_preferences` | 010 | ✅ |
| `talent_pool_memberships` | 011 | ✅ |
| `candidate_preferences` | 011 | ✅ |
| `candidate_profile_views` | 011 | ✅ |
| `job_matches` | 011 | ✅ |
| `role_resource_permissions` | 012 | ✅ |
| `chat_rooms` | _legacy | ❌ Não aplicada |
| `chat_messages` | _legacy | ❌ Não aplicada |

---

## 4. Comparação AS-IS vs V2.1

### Tabelas PRESERVAR (estrutura mantida)
| Tabela | Justificativa |
|--------|---------------|
| `tenants` | Core multi-tenant, sem alterações |
| `people` | Identidade base, sem alterações |
| `tenant_memberships` | Associação tenant/pessoa, sem alterações |
| `skills` | Catálogo mestre, sem alterações |
| `roles` / `permissions` | RBAC base, sem alterações |
| `role_assignments` | Corrigida recursão em 016, estrutura mantida |
| `domain_events` | Estrutura mantida, funções adicionais em 009 |

### Tabelas REBUILD (alterações estruturais aplicadas)
| Tabela | Alteração |
|--------|-----------|
| `role_permissions` | Migração 012 introduziu `role_resource_permissions` como camada consolidada; `role_permissions` mantida porém vazia |
| `companies` | Escopo tenant aplicado via RLS; estrutura preservada mas comportamento alterado |
| `candidates` | Depende de `people` via trigger; estrutura mantida |

### Tabelas NEW (criadas em migrações)
| Tabela | Migration |
|--------|----------|
| `company_types` | 003 |
| `company_relationships` | 003 |
| `company_relationship_types` | 003 |
| `company_contacts` | 003 |
| `candidate_skills` | 004 |
| `jobs` | 005 |
| `job_skills` | 005 |
| `applications` | 006 |
| `application_status_history` | 006 |
| `application_profile_snapshots` | 006 |
| `files` | 008 |
| `file_access_logs` | 008 |
| `domain_events` | 009 |
| `notifications` | 010 |
| `notification_deliveries` | 010 |
| `notification_preferences` | 010 |
| `talent_pool_memberships` | 011 |
| `candidate_preferences` | 011 |
| `candidate_profile_views` | 011 |
| `job_matches` | 011 |
| `role_resource_permissions` | 012 |

### Tabelas REMOVER (não aplicadas / obsoletas)
| Tabela | Motivo |
|--------|--------|
| `chat_rooms` | Migration _legacy não aplicada |
| `chat_messages` | Migration _legacy não aplicada |

---

## 5. Conflitos estruturais

### companies: global vs tenant-scoped
- **Schema desejado (V2.1):** Empresas devem ser tenant-scoped (cada tenant vê apenas suas empresas).
- **AS-IS:** Migration 003 cria tabela sem multi-tenancy explícita no schema.
- **Resolução:** Migration 014 habilita RLS. Migration 012 adiciona `can_access_tenant()`. Políticas RLS devem filtrar `tenant_id` em `companies`. **Conflito resolvido via RLS.**

### jobs: company_relationship_id vs company_id
- **Schema desejado (V2.1):** `jobs` deve referenciar `company_id` diretamente.
- **AS-IS:** Migration 005 define `company_relationship_id` em `jobs`.
- **Resolução:** Se V2.1 requer `company_id`, migration 005 precisa ser alterada ou nova migration de ajuste criada. **Conflito pendente de migração de dados.**

### notifications: user_id vs recipient_person_id
- **Schema desejado (V2.1):** `notifications` deve referenciar `recipient_person_id` (da tabela `people`).
- **AS-IS:** Migration 010 define `user_id` em `notifications` e `notification_deliveries`.
- **Resolução:** Se `user_id` é FK para `auth.users`, mas V2.1 quer `recipient_person_id` para `people`, há divergência de modelo. **Conflito pendente de alinhamento de domínio.**

### domain_events: estrutura atual vs V2.1
- **AS-Is (Migration 009):** Tabela `domain_events` com campos básicos de evento, funções de prevenção e emissão.
- **V2.1:** Pode requerer payload tipado, correlation_id, causation_id, ou agregação de eventos.
- **Resolução:** Se V2.1 adiciona campos, nova migration deve alterar tabela. **Conflito pendente de evolução de schema.**

---

## 6. Checkpoint atualizado

| Item | Valor |
|------|-------|
| Última migration aplicada | 016 |
| Total de migrations aplicadas | 15 |
| Migrations pendentes/ausentes | 2 (015 ausente, _legacy não aplicada) |
| Tabelas no banco | 41 (43 em migrations - 2 legacy) |
| Tabelas com dados | 1 (`company_types` com 6 registros do seed) |
| Tabelas vazias prontas | 40 |
| Seeds aplicados | 69 registros (1 tenant, 68 skills) |
| Funções ativas | 27 |
| Triggers ativos | 16 |
| Policies RLS ativas | ~36 |
| RLS habilitado | Sim (Migration 014) |
| RBAC funcional | Sim (10 roles, 26 perms, 1 assignment, 114 rrp) |
| Identity sincronizada | Sim (triggers auth.users → people) |
| Conflitos estruturares abertos | 4 (jobs, notifications, domain_events, chat legacy) |
| Recomendação | Criar migration 017 para resolver conflitos estruturais; decidir fate da migration _legacy (aplicar ou remover) |

---

*Documento gerado para fins de reconciliação de schema e migrações. Não alterar nome da empresa "J&S Empregos LTDA" nem conteúdo do footer.*
