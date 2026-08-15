# GATE-DATA-04 — AUDITORIA DE SCHEMA

> **Fase:** Auditoria (somente leitura / análise)
> **Data:** 2026-08-15
> **Regra:** Nenhuma migration destrutiva será executada até aprovação deste relatório.

---

## 1. Schema atual — Visão geral

### 1.1 Fonte canônica

- **`supabase/schema.sql`** — Schema PostgreSQL unificado (1330 linhas). É a autoridade atual.
- **`database/*.sql`** — Migrations MySQL legadas, fragmentadas por camada. Não devem ser apagadas durante a auditoria.

### 1.2 Camadas do schema canônico (supabase/schema.sql)

| #   | Camada                                        | Tabelas principais                                                                |
| --- | --------------------------------------------- | --------------------------------------------------------------------------------- |
| 01  | Extensions / Types                            | uuid-ossp, pgcrypto                                                               |
| 02  | Tenancy                                       | `tenants`                                                                         |
| 03  | Identity / Profiles / Memberships             | `profiles`, `tenant_memberships`                                                  |
| 04  | Organizations / Companies                     | `companies`                                                                       |
| 05  | Candidates / Curriculum                       | `candidates`, `curricula`, `experiences`, `education`, `courses`, `languages`     |
| 06  | Skills                                        | `skills`, `candidate_skills`, `job_skills`                                        |
| 07  | Jobs                                          | `jobs`                                                                            |
| 08  | Recruitment Processes                         | `recruitment_processes`                                                           |
| 09  | Applications                                  | `applications`, `application_status_history`                                      |
| 10  | Interviews / Evaluations / Hires              | `interviews`, `evaluations`, `hires`                                              |
| 11  | Documents                                     | `candidate_documents`                                                             |
| 12  | Consents / LGPD                               | `consents`                                                                        |
| 13  | Favorites                                     | `favorite_jobs`                                                                   |
| 14  | Leads / Contact Requests                      | `leads`, `contact_requests`                                                       |
| 15  | Notifications                                 | `notifications`                                                                   |
| 16  | Audit Logs                                    | `audit_logs`                                                                      |
| 17  | Services                                      | `services`                                                                        |
| 18  | Support Tickets                               | `tickets`                                                                         |
| 19  | Automation / Webhooks / WhatsApp / Email / IA | `webhooks`, `automation_queue`, `whatsapp_messages`, `emails`, `ai_conversations` |
| 20  | Functions / Triggers                          | `update_updated_at()`, `increment_job_views()`, `increment_application_count()`   |
| 21  | Seed / Bootstrap                              | Tenant J&S Empregos LTDA                                                          |

---

## 2. Tabelas existentes — Mapeamento completo

### 2.1 Tabelas no schema canônico (PostgreSQL / Supabase)

| Tabela                       | Propósito                                              | Multi-tenant              | RLS |
| ---------------------------- | ------------------------------------------------------ | ------------------------- | --- |
| `tenants`                    | Tenant/organização raiz                                | Sim (tenant_id)           | Sim |
| `profiles`                   | Perfil de usuário (1:1 com auth.users)                 | Sim (tenant_id)           | Sim |
| `tenant_memberships`         | Membro ↔ tenant (papel)                                | Sim (tenant_id)           | Sim |
| `companies`                  | Empresas (clientes, parceiros, fornecedores, internas) | Sim (tenant_id)           | Sim |
| `candidates`                 | Candidatos (Banco de Talentos)                         | Sim (tenant_id)           | Sim |
| `curricula`                  | Currículo 1:1 com candidato                            | Sim (tenant_id)           | Sim |
| `experiences`                | Histórico profissional                                 | Via curricula             | Sim |
| `education`                  | Formação acadêmica                                     | Via curricula             | Sim |
| `courses`                    | Cursos / certificados                                  | Via curricula             | Sim |
| `languages`                  | Idiomas                                                | Via curricula             | Sim |
| `skills`                     | Catálogo de habilidades                                | Sim (tenant_id ou global) | Sim |
| `candidate_skills`           | Habilidades do candidato                               | Via candidate             | Sim |
| `job_skills`                 | Habilidades da vaga                                    | Via job                   | Sim |
| `jobs`                       | Vagas de emprego                                       | Sim (tenant_id)           | Sim |
| `recruitment_processes`      | Processos seletivos                                    | Sim (tenant_id)           | Sim |
| `applications`               | Candidaturas                                           | Sim (tenant_id)           | Sim |
| `application_status_history` | Histórico de status da candidatura                     | Via application           | Sim |
| `interviews`                 | Entrevistas                                            | Sim (tenant_id)           | Sim |
| `evaluations`                | Avaliações de entrevista                               | Sim (tenant_id)           | Sim |
| `hires`                      | Contratações                                           | Sim (tenant_id)           | Sim |
| `candidate_documents`        | Documentos do candidato (storage)                      | Sim (tenant_id)           | Sim |
| `consents`                   | Consentimentos LGPD                                    | Sim (tenant_id)           | Sim |
| `favorite_jobs`              | Vagas favoritas                                        | Sim (tenant_id)           | Sim |
| `leads`                      | Leads / contatos do site                               | Sim (tenant_id)           | Sim |
| `contact_requests`           | Solicitações de orçamento                              | Sim (tenant_id)           | Sim |
| `notifications`              | Notificações                                           | Sim (tenant_id)           | Sim |
| `audit_logs`                 | Logs de auditoria                                      | Sim (tenant_id)           | Sim |
| `services`                   | Catálogo de serviços                                   | Sim (tenant_id)           | Sim |
| `tickets`                    | Tickets de suporte                                     | Sim (tenant_id)           | Sim |
| `webhooks`                   | Webhooks (n8n / externos)                              | Sim (tenant_id)           | Sim |
| `automation_queue`           | Fila de automação                                      | Sim (tenant_id)           | Sim |
| `whatsapp_messages`          | Log de mensagens WhatsApp                              | Sim (tenant_id)           | Sim |
| `emails`                     | Log de e-mails                                         | Sim (tenant_id)           | Sim |
| `ai_conversations`           | Conversas com IA                                       | Sim (tenant_id)           | Sim |

### 2.2 Tabelas no schema legado (MySQL — database/*.sql)

| Arquivo                      | Tabelas                                                                                                                                                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `02_tables_core.sql`         | `empresa`, `usuarios`, `permissoes`, `usuario_permissoes`                                                                                                                                                                 |
| `02_tables_rh.sql`           | `candidatos`, `parceiros`, `fornecedores`, `colaboradores`, `alocacoes`                                                                                                                                                   |
| `02_tables_suporte.sql`      | `tickets`, `notificacoes`, `logs`                                                                                                                                                                                         |
| `02_tables_crm.sql`          | `clientes`, `servicos`, `cliente_servicos`, `leads`, `contratos`                                                                                                                                                          |
| `02_tables_integracao.sql`   | `webhooks`, `fila_automacao`, `mensagens`, `emails_enviados`, `conversas_ia`                                                                                                                                              |
| `08_tables_recrutamento.sql` | `vagas`, `vaga_habilidades`, `habilidades`, `curriculos`, `experiencias`, `formacoes`, `cursos`, `idiomas`, `curriculo_habilidades`, `candidaturas`, `processos_seletivos`, `entrevistas`, `avaliacoes`, `vaga_favoritos` |
| `07_automation.sql`          | `eventos_automacao`, `fluxos_automacao`, `templates_email`, `templates_whatsapp`                                                                                                                                          |
| `06_seed.sql`                | Dados de teste                                                                                                                                                                                                            |
| `novo_schema.sql`            | Consolidação MySQL (817 linhas)                                                                                                                                                                                           |

---

## 3. Divergências — Schema legado vs Canônico

### 3.1 Tabelas duplicadas / renomeadas

| Nome legado (MySQL)                 | Nome canônico (PostgreSQL)                   | Ação                                                                               |
| ----------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------- |
| `empresa`                           | `tenants` + `companies`                      | **Migrar** — `empresa` vira `tenants` (holding) e `companies` (clientes/parceiros) |
| `usuarios`                          | `profiles` + `auth.users`                    | **Migrar** — `auth.users` é do Supabase; `profiles` armazena papel e tenant        |
| `permissoes` / `usuario_permissoes` | `tenant_memberships` + (roles em `profiles`) | **Migrar** — RBAC é diferente no canônico                                          |
| `candidatos`                        | `candidates`                                 | **Migrar**                                                                         |
| `curriculos`                        | `curricula`                                  | **Migrar**                                                                         |
| `experiencias`                      | `experiences`                                | **Migrar**                                                                         |
| `formacoes`                         | `education`                                  | **Migrar**                                                                         |
| `cursos`                            | `courses`                                    | **Migrar**                                                                         |
| `idiomas`                           | `languages`                                  | **Migrar**                                                                         |
| `habilidades`                       | `skills`                                     | **Migrar**                                                                         |
| `curriculo_habilidades`             | `candidate_skills` / `job_skills`            | **Migrar**                                                                         |
| `vagas`                             | `jobs`                                       | **Migrar**                                                                         |
| `candidaturas`                      | `applications`                               | **Migrar**                                                                         |
| `processos_seletivos`               | `recruitment_processes`                      | **Migrar**                                                                         |
| `entrevistas`                       | `interviews`                                 | **Migrar**                                                                         |
| `avaliacoes`                        | `evaluations`                                | **Migrar**                                                                         |
| `vaga_favoritos`                    | `favorite_jobs`                              | **Migrar**                                                                         |
| `clientes`                          | `companies` (type='client')                  | **Migrar**                                                                         |
| `servicos`                          | `services`                                   | **Migrar**                                                                         |
| `cliente_servicos`                  | (não existe no canônico)                     | **Obsoleta** — relacionamento implícito via `companies.type`                       |
| `leads`                             | `leads`                                      | **Migrar**                                                                         |
| `contratos`                         | (não existe no canônico)                     | **Obsoleta** — manter referência histórica                                         |
| `parceiros`                         | `companies` (type='partner')                 | **Migrar**                                                                         |
| `fornecedores`                      | `companies` (type='supplier')                | **Migrar**                                                                         |
| `colaboradores`                     | (não existe no canônico)                     | **Obsoleta** — funcionários são `profiles` com role                                |
| `alocacoes`                         | (não existe no canônico)                     | **Obsoleta**                                                                       |
| `tickets`                           | `tickets`                                    | **Migrar**                                                                         |
| `notificacoes`                      | `notifications`                              | **Migrar**                                                                         |
| `logs`                              | `audit_logs`                                 | **Migrar**                                                                         |
| `webhooks`                          | `webhooks`                                   | **Migrar**                                                                         |
| `fila_automacao`                    | `automation_queue`                           | **Migrar**                                                                         |
| `mensagens`                         | `whatsapp_messages`                          | **Migrar**                                                                         |
| `emails_enviados`                   | `emails`                                     | **Migrar**                                                                         |
| `conversas_ia`                      | `ai_conversations`                           | **Migrar**                                                                         |
| `eventos_automacao`                 | (não existe no canônico)                     | **Obsoleta** — eventos são strings em `automation_queue.event`                     |
| `fluxos_automacao`                  | (não existe no canônico)                     | **Obsoleta**                                                                       |
| `templates_email`                   | (não existe no canônico)                     | **Obsoleta**                                                                       |
| `templates_whatsapp`                | (não existe no canônico)                     | **Obsoleta**                                                                       |
| `documentos`                        | `candidate_documents`                        | **Migrar**                                                                         |
| `demandas_recrutamento`             | (não existe no canônico)                     | **Criar** — fluxo "Empresa solicita profissionais"                                 |
| `vaga_habilidades`                  | `job_skills`                                 | **Migrar**                                                                         |
| `curriculo_habilidades`             | `candidate_skills`                           | **Migrar**                                                                         |

### 3.2 Tabelas faltantes no canônico

| Tabela faltante         | Motivo                                                                     | Ação sugerida                                              |
| ----------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `demandas_recrutamento` | Fluxo B2B "Empresa solicita profissionais" (definido em `novo_schema.sql`) | **Criar**                                                  |
| `contracts`             | Contratos de prestação de serviços (RH / Facilities)                       | **Criar**                                                  |
| `allocations`           | Alocação de colaboradores em clientes                                      | **Criar** (se Facilities for usar)                         |
| `suppliers`             | Fornecedores                                                               | **Criar** (se Facilities for usar)                         |
| `partners`              | Parceiros                                                                  | **Criar** (se for usar além de `companies.type='partner'`) |

> Nota: `companies` com `type in ('client','partner','supplier','internal')` já cobre parte desses casos no canônico.

### 3.3 Tabelas obsoletas (não migrar)

| Tabela obsoleta      | Motivo                                                                                 |
| -------------------- | -------------------------------------------------------------------------------------- |
| `cliente_servicos`   | Relacionamento many-to-many substituído por categoria em `services` e `companies.type` |
| `contratos`          | Não existe no canônico; contratos devem ser modelados futuramente                      |
| `colaboradores`      | Substituído por `profiles` + `tenant_memberships`                                      |
| `alocacoes`          | Sem equivalente no canônico; avaliar necessidade                                       |
| `eventos_automacao`  | Eventos são strings em `automation_queue`                                              |
| `fluxos_automacao`   | Sem equivalente direto                                                                 |
| `templates_email`    | Sem equivalente direto                                                                 |
| `templates_whatsapp` | Sem equivalente direto                                                                 |

---

## 4. Multi-tenancy

### 4.1 Status atual

O schema canônico JÁ IMPLEMENTA multi-tenancy corretamente:

- **`tenants`**: Tenant raiz (ex: J&S Empregos LTDA).
- **`profiles.tenant_id`**: Todo usuário pertence a um tenant.
- **`tenant_memberships`**: Relacionamento many-to-many usuário ↔ tenant com papel (`owner`, `admin`, `manager`, `member`, `viewer`).
- **RLS em todas as tabelas**: Isolamento por `tenant_id` via `tenant_memberships`.

### 4.2 Observações

- O trigger `handle_new_user()` já cria tenant automaticamente para novos usuários.
- O tenant padrão `js-empregos` está seedado.
- **Não há necessidade de alterar a estrutura de multi-tenancy.**

---

## 5. RLS (Row Level Security)

### 5.1 Status atual

Todas as tabelas do canônico têm RLS habilitado. Padrão consistente:

- **SELECT**: Visível para membros do tenant.
- **INSERT**: Permitido para membros do tenant.
- **UPDATE/DELETE**: Permitido apenas para `owner`, `admin`, `manager`.
- **Exceções**:
  - `services`: SELECT público (`using (true)`) — adequado para catálogo público.
  - `skills`: SELECT para authenticated.
  - `notifications`: SELECT apenas para o próprio usuário (`user_id = auth.uid()`).

### 5.2 Observações

- RLS está bem estruturado e não precisa de refatoração.
- Falta RLS explícito para storage buckets (currículos, documentos). Deve ser adicionado na migration.

---

## 6. LGPD / Consentimento

### 6.1 Status atual

- Tabela `consents` existe com campos: `purpose`, `status` (`granted`/`revoked`/`pending`), `version`, `granted_at`, `revoked_at`.
- RLS aplicado.
- **Pendente**: garantir que `candidates` e `curricula` só sejam criados/consultados mediante consentimento válido.

---

## 7. Storage

### 7.1 Status atual

- `candidate_documents.cv_storage_path` e `candidate_documents.storage_path` apontam para Supabase Storage.
- **Falta**: definição dos buckets no schema (deve ser criada via migration separada ou console Supabase).
- **Falta**: RLS para storage buckets.

---

## 8. Chat / Atendimento

### 8.1 Status atual

- `ai_conversations`: Log de conversas com IA.
- `whatsapp_messages`: Log de mensagens WhatsApp.
- `tickets`: Tickets de suporte.
- **Falta**: tabela `conversations` e `messages` para chat humano em tempo real (Supabase Realtime).

### 8.2 Código frontend espera

O código atual (`src/hooks/useRealtimeChat.ts`, `src/components/ui/HumanChatWidget.tsx`) consome:

```typescript
supabase.from('chat_messages').insert({...})
supabase.from('chat_rooms').select('*')
```

**Essas tabelas não existem no schema canônico.** Isso é um bloqueador para o `GATE-CHAT-REALTIME-01`.

---

## 9. Leads

### 9.1 Status atual

- `leads` no canônico é bem estruturado: `tenant_id`, `origin`, `lead_type`, `status`, `utm_*`.
- `contact_requests` separa solicitações de orçamento/serviços.
- Cobertura: site, WhatsApp, Instagram, Google, referral, event.

---

## 10. Vagas / Candidaturas

### 10.1 Status atual

- `jobs`: Slug único por tenant, status, tipo de contrato, modalidade, nível, área.
- `applications`: Candidaturas com histórico de status.
- `application_status_history`: Imutável.
- `recruitment_processes`: Pipeline configurável via JSON.
- `interviews`, `evaluations`, `hires`: Fluxo completo.

### 10.2 Regras de negócio

| Regra                                  | Status no schema                                                |
| -------------------------------------- | --------------------------------------------------------------- |
| Vaga com descrição → publicada         | `jobs.description` existe; status controla publicação           |
| Vaga sem descrição → Banco de Talentos | Não mapeado explicitamente; pode ser `job_source='talent_pool'` |
| Candidatura → formulário               | Via `applications`                                              |
| Mensagem → WhatsApp primeiro           | Via `whatsapp_messages`                                         |
| Persistência → banco                   | OK                                                              |
| Notificações → e-mail/n8n              | Via `emails`, `automation_queue`                                |

---

## 11. Empresas / Pessoas

### 11.1 Status atual

- `companies`: Armazena clientes, parceiros, fornecedores, internas.
- `profiles`: Pessoas (usuários do sistema) com `role`.
- `candidates`: Pessoas físicas candidatas (Banco de Talentos).
- **Separação clara**: `profiles` (auth + papel) ≠ `candidates` (dados de candidato) ≠ `companies` (empresas).

### 11.2 Observação

- O conceito "Pessoa" está fragmentado em `profiles`, `candidates`, `companies`. Isso está correto para o modelo atual.

---

## 12. Auditoria

### 12.1 Status atual

- `audit_logs` existe com `action`, `table_name`, `record_id`, `details`, `ip_address`, `user_agent`.
- RLS restrito a `owner`/`admin`.
- **Falta**: triggers automáticos para popular `audit_logs` em INSERT/UPDATE/DELETE.

---

## 13. Plano de migration

### 13.1 Ordem sugerida

1. **Extensões e tipos** (uuid-ossp, pgcrypto)
2. **Tenancy** (`tenants`, seed J&S)
3. **Auth / Profiles / Memberships** (trigger `handle_new_user`)
4. **Companies / Services**
5. **Candidates / Curricula / Education / Courses / Languages / Skills**
6. **Jobs / Applications / Processes / Interviews / Evaluations / Hires**
7. **Leads / Contact Requests**
8. **Tickets / Notifications / Audit Logs**
9. **Automation / WhatsApp / Email / AI**
10. **RLS em todas as tabelas**
11. **Storage buckets + RLS**
12. **Chat tables** (se aprovado)
13. **Demandas recrutamento** (se aprovado)

### 13.2 Regras

- **Não executar DROP em tabelas legadas durante a migration.**
- Criar novas tabelas com `IF NOT EXISTS`.
- Migrar dados legados para o novo schema via script idempotente.
- Manter `database/*.sql` como referência histórica.

---

## 14. Tabela resumo — Ação por entidade

| Atual (legado)          | Canônico                      | Ação         |
| ----------------------- | ----------------------------- | ------------ |
| `empresa`               | `tenants` + `companies`       | Migrar       |
| `usuarios`              | `profiles` + `auth.users`     | Migrar       |
| `permissoes`            | `tenant_memberships`          | Migrar       |
| `usuario_permissoes`    | `tenant_memberships`          | Migrar       |
| `candidatos`            | `candidates`                  | Migrar       |
| `curriculos`            | `curricula`                   | Migrar       |
| `experiencias`          | `experiences`                 | Migrar       |
| `formacoes`             | `education`                   | Migrar       |
| `cursos`                | `courses`                     | Migrar       |
| `idiomas`               | `languages`                   | Migrar       |
| `habilidades`           | `skills`                      | Migrar       |
| `curriculo_habilidades` | `candidate_skills`            | Migrar       |
| `vaga_habilidades`      | `job_skills`                  | Migrar       |
| `vagas`                 | `jobs`                        | Migrar       |
| `candidaturas`          | `applications`                | Migrar       |
| `processos_seletivos`   | `recruitment_processes`       | Migrar       |
| `entrevistas`           | `interviews`                  | Migrar       |
| `avaliacoes`            | `evaluations`                 | Migrar       |
| `vaga_favoritos`        | `favorite_jobs`               | Migrar       |
| `clientes`              | `companies` (type='client')   | Migrar       |
| `servicos`              | `services`                    | Migrar       |
| `cliente_servicos`      | —                             | **Obsoleta** |
| `leads`                 | `leads`                       | Migrar       |
| `contratos`             | —                             | **Obsoleta** |
| `parceiros`             | `companies` (type='partner')  | Migrar       |
| `fornecedores`          | `companies` (type='supplier') | Migrar       |
| `colaboradores`         | —                             | **Obsoleta** |
| `alocacoes`             | —                             | **Obsoleta** |
| `tickets`               | `tickets`                     | Migrar       |
| `notificacoes`          | `notifications`               | Migrar       |
| `logs`                  | `audit_logs`                  | Migrar       |
| `webhooks`              | `webhooks`                    | Migrar       |
| `fila_automacao`        | `automation_queue`            | Migrar       |
| `mensagens`             | `whatsapp_messages`           | Migrar       |
| `emails_enviados`       | `emails`                      | Migrar       |
| `conversas_ia`          | `ai_conversations`            | Migrar       |
| `eventos_automacao`     | —                             | **Obsoleta** |
| `fluxos_automacao`      | —                             | **Obsoleta** |
| `templates_email`       | —                             | **Obsoleta** |
| `templates_whatsapp`    | —                             | **Obsoleta** |
| `documentos`            | `candidate_documents`         | Migrar       |
| `demandas_recrutamento` | —                             | **Criar**    |
| `chat_rooms`            | —                             | **Criar**    |
| `chat_messages`         | —                             | **Criar**    |

---

## 15. Próximos passos

1. **Aprovação deste relatório** pelo usuário.
2. Criar `supabase/migrations/` com DDL PostgreSQL idempotente.
3. Script de migração de dados legados (MySQL → PostgreSQL).
4. RLS + Storage buckets.
5. Chat tables (se aprovado).
6. Testes de integração.

---

**Fim do relatório.**
