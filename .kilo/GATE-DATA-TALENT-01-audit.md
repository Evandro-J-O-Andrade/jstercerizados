# GATE-DATA-TALENT-01 — Auditoria Backend Banco de Talentos

## 1. Objetivo

Auditar o backend existente para o fluxo de Banco de Talentos sem executar alterações em código, schema ou banco.

## 2. Escopo auditado

- `supabase/schema.sql`
- `supabase/migrations/`
- `src/lib/supabase.ts`
- `src/config/app.ts`
- `functions/api/`
- `.env.example` / `.env.local`
- `src/services/mock/curriculos.ts`
- `docs/GATE-DATA-04-AUDIT.md`
- `docs/GATE-DATA-04-STAGE2-PROPOSAL.md`

## 3. Achados

### 3.1 Schema Supabase

O `supabase/schema.sql` contém **todas as tabelas necessárias** para o fluxo de candidaturas:

| Tabela                       | Propósito                           | Status no schema   |
| ---------------------------- | ----------------------------------- | ------------------ |
| `tenants`                    | Tenant principal J&S                | ✅ Definida + seed |
| `profiles`                   | Perfis de usuário                   | ✅ Definida        |
| `tenant_memberships`         | Vínculo usuário/tenant/papel        | ✅ Definida        |
| `companies`                  | Empresas                            | ✅ Definida        |
| `candidates`                 | Candidatos do banco de talentos     | ✅ Definida        |
| `curricula`                  | Currículo do candidato              | ✅ Definida        |
| `experiences`                | Experiências profissionais          | ✅ Definida        |
| `education`                  | Formação acadêmica                  | ✅ Definida        |
| `courses`                    | Cursos complementares               | ✅ Definida        |
| `languages`                  | Idiomas                             | ✅ Definida        |
| `skills`                     | Catálogo de skills                  | ✅ Definida        |
| `candidate_skills`           | Skills do candidato                 | ✅ Definida        |
| `jobs`                       | Vagas                               | ✅ Definida        |
| `recruitment_processes`      | Processos seletivos                 | ✅ Definida        |
| `applications`               | Candidaturas a vagas                | ✅ Definida        |
| `application_status_history` | Histórico de status                 | ✅ Definida        |
| `interviews`                 | Entrevistas                         | ✅ Definida        |
| `evaluations`                | Avaliações                          | ✅ Definida        |
| `hires`                      | Contratações                        | ✅ Definida        |
| `candidate_documents`        | Documentos/currículos               | ✅ Definida        |
| `consents`                   | Consentimentos LGPD                 | ✅ Definida        |
| `favorite_jobs`              | Vagas favoritas                     | ✅ Definida        |
| `leads`                      | Leads (candidate, company, partner) | ✅ Definida        |
| `webhooks`                   | Webhooks externos                   | ✅ Definida        |
| `automation_queue`           | Fila de automação                   | ✅ Definida        |

### 3.2 RLS e Políticas

Todas as tabelas principais possuem **RLS habilitado** com políticas baseadas em `tenant_memberships`:

- `candidates`: select/insert/update dentro do tenant
- `curricula`: select/insert/update dentro do tenant
- `applications`: select/insert/update dentro do tenant
- `candidate_documents`: select/insert dentro do tenant
- `consents`: select dentro do tenant
- `automation_queue`: all dentro do tenant

**Observação:** O schema não inclui políticas RLS para **Supabase Storage**. Isso já foi apontado em `GATE-DATA-04-AUDIT.md`.

### 3.3 Migrations

Apenas uma migration existe:

- `supabase/migrations/20250101_chat.sql` — Chat humano (`chat_rooms`, `chat_messages`)

**Não existem migrations para:**

- storage buckets
- RLS de storage
- triggers adicionais de candidaturas
- seeds de dados de teste

### 3.4 Frontend — Serviços

`src/services/mock/` contém apenas mocks:

| Arquivo           | Propósito                           | Integração real      |
| ----------------- | ----------------------------------- | -------------------- |
| `curriculos.ts`   | Submit/get/update/delete candidatos | ❌ localStorage      |
| `auth.ts`         | Mock de autenticação                | ❌ localStorage      |
| `vagas.ts`        | Mock de vagas                       | ❌ arrays em memória |
| `clientes.ts`     | Mock de clientes                    | ❌ arrays em memória |
| `contatos.ts`     | Mock de contatos                    | ❌ arrays em memória |
| `fornecedores.ts` | Mock de fornecedores                | ❌ arrays em memória |
| `parceiros.ts`    | Mock de parceiros                   | ❌ arrays em memória |
| `services.ts`     | Mock de serviços                    | ❌ arrays em memória |

**Nenhum serviço real de Supabase foi implementado para candidaturas.**

### 3.5 Supabase Client

`src/lib/supabase.ts`:

- Exporta `getSupabaseClient()` — singleton lazy
- Retorna `SupabaseClient | null` se variáveis não estiverem definidas
- **Usado por:** `AuthContext.tsx`, `HumanChatWidget.tsx`, `useRealtimeChat.ts`
- **NÃO usado por:** formulário de Banco de Talentos

### 3.6 Variáveis de Ambiente

`.env.example`:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
N8N_WEBHOOK_URL=
```

`.env.local`:

- **Não existe** no workspace

Consequência: `getSupabaseClient()` retorna `null` em qualquer ambiente local sem `.env.local`.

### 3.7 Functions (Edge/Server)

`functions/api/`:

- `chat.ts` — Proxy OpenRouter para Chat IA
- `handoff.ts` — Proxy n8n para handoff humano

**Não existe:**

- `/api/candidates`
- `/api/curriculos`
- `/api/applications`
- `/api/leads` (embora a tabela `leads` exista no schema)

### 3.8 Integração n8n

- `handoff.ts` já implementa proxy para `N8N_WEBHOOK_URL`
- Mas **não existe integração n8n para candidaturas**
- `automation_queue` existe no schema, mas não há código que a utilize

### 3.9 Storage

- Schema define `cv_storage_path` (text) em `curricula`
- Schema define `storage_path` (text) em `candidate_documents`
- **Não há definição de buckets Supabase Storage**
- **Não há código de upload/download de currículo**
- O formulário atual recebe o arquivo mas não o envia para lugar nenhum

### 3.10 LGPD / Consentimento

- Tabela `consents` existe no schema com campos: purpose, status, version, granted_at, revoked_at, metadata
- **O formulário atual NÃO possui checkbox de consentimento**
- Dados são coletados sem registro explícito de consentimento

## 4. Comparação com definição DATA-02.1

| Item DATA-02.1                         | Status no código/schema                           |
| -------------------------------------- | ------------------------------------------------- |
| membership separado de `profiles.role` | ✅ Implementado (`tenant_memberships`)            |
| candidato pertencente ao tenant J&S    | ✅ Schema suporta (`tenant_id` em `candidates`)   |
| `skills` GLOBAL/TENANT                 | ✅ Implementado (`scope` em `skills`)             |
| `application_status_history` imutável  | ✅ Implementado (tabela existe)                   |
| `consents` para LGPD                   | ✅ Schema existe, ❌ não implementado no frontend |
| RLS em todas as tabelas                | ✅ Implementado no schema                         |
| `favorite_jobs`                        | ✅ Implementado                                   |
| Storage buckets para currículos        | ❌ Não definido                                   |
| RLS para storage                       | ❌ Não definido                                   |
| API endpoints para candidaturas        | ❌ Não existem                                    |
| Serviço frontend Supabase              | ❌ Não implementado                               |
| n8n para notificações de candidatura   | ❌ Não implementado                               |
| Formulário com consentimento LGPD      | ❌ Não implementado                               |

## 5. Diagnóstico

### 5.1 Backend

O schema do Supabase está **muito avançado** e cobre praticamente todo o domínio de RH:

- ✅ Identidade/multi-tenant: `tenants`, `profiles`, `tenant_memberships`
- ✅ Candidatos: `candidates`, `curricula`, `experiences`, `education`, `courses`, `languages`
- ✅ Skills: `skills`, `candidate_skills`
- ✅ Vagas/processos: `jobs`, `recruitment_processes`
- ✅ Candidaturas: `applications`, `application_status_history`
- ✅ Entrevistas/avaliações/contratações: `interviews`, `evaluations`, `hires`
- ✅ Documentos: `candidate_documents`
- ✅ LGPD: `consents`
- ✅ Automação: `webhooks`, `automation_queue`

### 5.2 Frontend

O frontend está **desconectado do backend**:

- ❌ Nenhuma tabela é acessada via Supabase
- ❌ Nenhum upload de arquivo é implementado
- ❌ Nenhuma API route existe para candidaturas
- ❌ O formulário usa mock + localStorage
- ❌ Não há tratamento de erro real
- ❌ Não há loading/loading states além do botão
- ❌ Não há prevenção de duplo envio além de `disabled={isSubmitting}`

### 5.3 Integrações

- ✅ Supabase client: existe, mas não usado para candidaturas
- ✅ n8n proxy: existe, mas apenas para chat humano
- ❌ Storage buckets: não definidos
- ❌ RLS storage: não definida
- ❌ Webhooks de candidatura: não implementados

## 6. Bloqueadores para GATE-TALENT-02

| #   | Bloqueador                                      | Impacto                        | Requerido antes da implementação                                      |
| --- | ----------------------------------------------- | ------------------------------ | --------------------------------------------------------------------- |
| 1   | `.env.local` não existe                         | Supabase client retorna null   | Criar `.env.local` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` |
| 2   | Storage buckets não definidos                   | Upload de currículo impossível | Migration SQL + configuração no Supabase                              |
| 3   | RLS para storage ausente                        | Upload/download inseguro       | Migration SQL                                                         |
| 4   | Nenhuma API route para candidaturas             | Frontend sem endpoint          | Criar `functions/api/candidates.ts` ou usar Supabase direto           |
| 5   | Serviço `src/services/candidates.ts` não existe | Frontend sem camada de dados   | Implementar                                                           |
| 6   | Consentimento LGPD no formulário                | Risco LGPD                     | Adicionar checkbox + registro em `consents`                           |
| 7   | n8n webhook para candidaturas                   | Sem notificação                | Configurar `N8N_WEBHOOK_URL` + trigger                                |
| 8   | Migration de storage não aplicada               | Buckets não existem            | Criar e aplicar migration                                             |

## 7. Recomendação de Arquitetura

### 7.1 Fluxo proposto

```text
Frontend (TrabalheConosco.tsx)
       │
       ▼
Serviço: src/services/candidates.ts
       │
       ├── validateCandidate(data)
       ├── validateConsent(consent)
       │
       ▼
Supabase Client (src/lib/supabase.ts)
       │
       ├── insert em candidates
       ├── insert em curricula (cv_storage_path)
       ├── upload de currículo para Storage bucket 'curriculos'
       ├── insert em candidate_documents
       ├── insert em consents (LGPD)
       │
       ▼
Automation Queue / n8n
       │
       └── webhook para notificação (WhatsApp/e-mail)
```

### 7.2 Alternativa com API Route

```text
Frontend
       │
       ▼
POST /api/candidates
       │
       ├── validação Zod
       ├── verifica consentimento
       ├── upload de currículo (se houver)
       │
       ▼
Supabase (server-side via service role)
       │
       ├── insert candidates
       ├── insert candidate_documents
       ├── insert consents
       ├── insert automation_queue
       │
       ▼
n8n webhook
```

**Recomendação:** Usar Supabase direto do frontend com `anon key` para operações de insert, pois o schema já possui RLS. Isso evita expor `service_role` e mantém a arquitetura limpa. A API route pode ser usada apenas para upload de arquivos grandes ou para orquestração complexa.

## 8. Campos do formulário vs Schema

| Campo no formulário | Tipo         | Tabela destino                  | Campo no schema                                        |
| ------------------- | ------------ | ------------------------------- | ------------------------------------------------------ |
| `name`              | text         | `candidates`                    | `name`                                                 |
| `cpf`               | text         | `candidates`                    | `cpf`                                                  |
| `rg`                | text         | `candidates`                    | `rg`                                                   |
| `phone`             | text         | `candidates`                    | `phone`                                                |
| `email`             | text         | `candidates`                    | `email`                                                |
| `city`              | text         | `candidates`                    | `city`                                                 |
| `positions`         | array → text | `candidates`                    | `target_area`                                          |
| `experience`        | text         | `curricula`                     | `experience_summary`                                   |
| `courses`           | text         | `curricula`                     | não existe diretamente; iria para `courses`            |
| `availability`      | text         | `curricula`                     | `availability`                                         |
| `schedule`          | text         | `curricula`                     | não existe diretamente                                 |
| `resume`            | text         | `curricula`                     | `objective` + `experiences`                            |
| `resumeFile`        | file         | `candidate_documents` + Storage | `storage_path`, `file_name`, `mime_type`, `size_bytes` |

**Ajustes necessários no mapeamento:**

- `positions` (array de strings) não tem correspondente direto em `target_area` (text). Pode ser concatenado ou mapeado para `target_role`.
- `schedule` não existe no schema atual.
- `resume` (texto longo) precisa ser dividido entre `curricula.objective` e `experiences`.
- `courses` deveria popular a tabela `courses`, não apenas um campo text.

## 9. Próximos Passos

### 9.1 Imediatos (pré-implementação)

1. Criar `.env.local` com Supabase configurado
2. Aplicar `supabase/schema.sql` no Supabase do projeto
3. Criar migration de storage buckets + RLS
4. Validar seed do tenant J&S

### 9.2 Implementação (GATE-TALENT-02)

1. Criar `src/services/candidates.ts`
2. Implementar upload de currículo para Storage
3. Implementar insert em `candidates`, `curricula`, `candidate_documents`
4. Implementar registro de consentimento LGPD
5. Adicionar tratamento de erro e loading
6. Conectar n8n via `automation_queue` ou webhook direto

### 9.3 Validação (GATE-TALENT-03)

1. Teste E2E: preencher → enviar → banco → storage → consentimento → n8n → confirmação
2. Verificar RLS
3. Verificar duplo envio
4. Verificar mensagens de erro
5. Verificar LGPD

## 10. Conclusão

**O backend do Banco de Talentos NÃO está conectado, mas o schema do Supabase está completo e bem estruturado.**

O trabalho necessário é:

1. Infraestrutura (`.env.local`, migrations, storage)
2. Serviço frontend (`src/services/candidates.ts`)
3. Integração n8n
4. LGPD no formulário
5. Tratamento de erro

**Nenhuma alteração foi executada.** Este é um relatório de auditoria para embasar o `GATE-TALENT-02`.
