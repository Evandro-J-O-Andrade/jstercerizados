# Database Legacy MySQL → V2.1 PostgreSQL Mapping

**Projeto:** J&S Empregos LTDA — Plataforma de Recrutamento e Terceirização  
**Data:** 2026-08-21  
**Status:** Mapeamento estático concluído — sem acesso a banco vivo  
**Fonte:** `database/*.sql` (MySQL 8.0)  
**Destino:** `supabase/specs/sql/*.sql` (PostgreSQL V2.1)  
**Branch canônica:** `feat/database-v21-local-rebuild`

---

## 1. Resumo Executivo

| Categoria | MySQL Legado                         | V2.1 PostgreSQL                                      |
| --------- | ------------------------------------ | ---------------------------------------------------- |
| SGBD      | MySQL 8.0                            | PostgreSQL 15+                                       |
| Database  | `js_Empregos`                        | `public` schema                                      |
| Charset   | `utf8mb4`                            | `UTF8MB4` (nativo)                                   |
| Engine    | InnoDB                               | PostgreSQL                                           |
| IDs       | `BIGINT AUTO_INCREMENT`              | `UUID`                                               |
| Tenant    | `empresa_id` (BIGINT FK)             | `tenant_id` (UUID)                                   |
| RBAC      | `perfil` ENUM + `usuario_permissoes` | `roles` + `role_assignments` + `permissions`         |
| Auditoria | `logs` simples                       | `audit_logs` + `domain_events` + `event_outbox`      |
| Chat      | `conversas_ia`                       | `chat_rooms` + `chat_messages` + `chat_participants` |
| Storage   | Não existe                           | `files` + `document_versions` + `file_access_logs`   |
| RLS       | Não existe                           | 553 policies                                         |
| Functions | Não existe                           | 210 functions                                        |
| Triggers  | Não existe                           | 49 triggers                                          |

### Tabelas legadas identificadas

| Arquivo                      | Tabelas                                                                                                                                                                                                                   | Status    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| `02_tables_core.sql`         | `empresa`, `usuarios`, `permissoes`, `usuario_permissoes`                                                                                                                                                                 | MAP       |
| `02_tables_crm.sql`          | `clientes`, `servicos`, `cliente_servicos`, `leads`, `contratos`                                                                                                                                                          | MAP       |
| `02_tables_rh.sql`           | `candidatos`, `parceiros`, `fornecedores`, `colaboradores`, `alocacoes`                                                                                                                                                   | MAP       |
| `02_tables_suporte.sql`      | `tickets`, `notificacoes`, `logs`                                                                                                                                                                                         | MAP       |
| `02_tables_integracao.sql`   | `webhooks`, `fila_automacao`, `mensagens`, `emails_enviados`, `conversas_ia`                                                                                                                                              | TRANSFORM |
| `08_tables_recrutamento.sql` | `vagas`, `vaga_habilidades`, `habilidades`, `curriculos`, `experiencias`, `formacoes`, `cursos`, `idiomas`, `curriculo_habilidades`, `candidaturas`, `processos_seletivos`, `entrevistas`, `avaliacoes`, `vaga_favoritos` | MAP       |
| `07_automation.sql`          | `eventos_automacao`, `fluxos_automacao`, `templates_email`, `templates_whatsapp`                                                                                                                                          | MAP       |

**Total:** 24 tabelas legadas

### Views legadas identificadas

| View                        | Domínio      | Status |
| --------------------------- | ------------ | ------ |
| `vw_dashboard_leads`        | CRM          | MAP    |
| `vw_dashboard_clientes`     | CRM          | MAP    |
| `vw_dashboard_rh`           | RH           | MAP    |
| `vw_dashboard_tickets`      | Suporte      | MAP    |
| `vw_dashboard_automacao`    | Automação    | MAP    |
| `vw_dashboard_vagas`        | Recrutamento | MAP    |
| `vw_dashboard_candidaturas` | Recrutamento | MAP    |
| `vw_dashboard_processos`    | Recrutamento | MAP    |
| `vw_ranking_vagas`          | Recrutamento | MAP    |

**Total:** 9 views legadas

---

## 2. Mapeamento Tabela por Tabela

### 2.1 Core / Tenant / Auth

| Legado MySQL         | V2.1 PostgreSQL                                      | Tratamento | Observações                                                                                                                                                                                                               |
| -------------------- | ---------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `empresa`            | `tenants` + `companies`                              | TRANSFORM  | `empresa` vira `tenants` (dados da organização) + `companies` (empresas clientes/contratantes). No legado, `empresa` era o tenant master. No V2.1, `tenants` é a organização raiz e `companies` são as empresas clientes. |
| `usuarios`           | `people` + `tenant_memberships` + `role_assignments` | TRANSFORM  | `usuarios` tinha `empresa_id` + `perfil` ENUM. V2.1 separa identidade (`people`), vínculo tenant (`tenant_memberships`) e papéis (`role_assignments`). Senha migra para `auth.users`.                                     |
| `permissoes`         | `permissions`                                        | MAP        | Mantém `nome`, `descricao`, `modulo`.                                                                                                                                                                                     |
| `usuario_permissoes` | `role_permissions`                                   | MAP        | Many-to-many usuário ↔ permissão. V2.1 usa `role_permissions` (role ↔ permissão).                                                                                                                                         |

### 2.2 CRM

| Legado MySQL       | V2.1 PostgreSQL           | Tratamento | Observações                                                                                                                                                 |
| ------------------ | ------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `clientes`         | `companies` + `customers` | RECONCILE  | No legado, `clientes` eram empresas contratantes. V2.1 tem `companies` (entidade jurídica) + `customers` (cliente final). Dados precisam ser reconciliados. |
| `servicos`         | `services`                | MAP        | `nome`, `descricao`, `categoria`, `preco_base`, `unidade_medida` → `services` + `service_categories`.                                                       |
| `cliente_servicos` | `company_services`        | MAP        | Many-to-many cliente ↔ serviço.                                                                                                                             |
| `leads`            | `leads`                   | MAP        | Mantém estrutura. V2.1 adiciona `tenant_id`, RLS, auditoria.                                                                                                |
| `contratos`        | `contracts`               | MAP        | `contratos` legado tem `valor`, `data_inicio`, `data_fim`. V2.1 expande com `service_id`, `company_id`, `status` workflow, `contract_items`.                |

### 2.3 RH

| Legado MySQL    | V2.1 PostgreSQL             | Tratamento | Observações                                                                                                   |
| --------------- | --------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------- |
| `candidatos`    | `candidates`                | MAP        | `candidatos` → `candidates`. V2.1 adiciona `tenant_id`, RLS, `candidate_profile`, `candidate_documents`, etc. |
| `parceiros`     | `companies` + relationships | TRANSFORM  | `parceiros` não existe como entidade separada no V2.1. Parceiros são `companies` com `type = PARTNER`.        |
| `fornecedores`  | `suppliers`                 | MAP        | Direto. V2.1 adiciona `tenant_id`, RLS, auditoria.                                                            |
| `colaboradores` | `employees`                 | MAP        | `colaboradores` → `employees`. V2.1 usa `people` como base + `employees` como extensão RH.                    |
| `alocacoes`     | `employee_allocations`      | MAP        | Alocação de colaborador em cliente/contrato. V2.1 expande com `work_orders`, `service_executions`.            |

### 2.4 Recrutamento

| Legado MySQL            | V2.1 PostgreSQL         | Tratamento | Observações                                                                                                                                                              |
| ----------------------- | ----------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `vagas`                 | `jobs`                  | MAP        | `vagas` → `jobs`. V2.1 expande com `job_positions`, `employment_types`, `job_applications`, `recruitment_processes`, `interviews`, `stage_templates`.                    |
| `vaga_habilidades`      | `job_skills`            | MAP        | Many-to-many vaga ↔ habilidade.                                                                                                                                          |
| `habilidades`           | `skills`                | MAP        | Catálogo de habilidades.                                                                                                                                                 |
| `curriculos`            | `candidate_profiles`    | MAP        | `curriculos` → `candidate_profiles`. V2.1 expande com `candidate_documents`, `candidate_experiences`, `candidate_education`, `candidate_courses`, `candidate_languages`. |
| `experiencias`          | `candidate_experiences` | MAP        |                                                                                                                                                                          |
| `formacoes`             | `candidate_education`   | MAP        |                                                                                                                                                                          |
| `cursos`                | `candidate_courses`     | MAP        |                                                                                                                                                                          |
| `idiomas`               | `candidate_languages`   | MAP        |                                                                                                                                                                          |
| `curriculo_habilidades` | `candidate_skills`      | MAP        |                                                                                                                                                                          |
| `candidaturas`          | `job_applications`      | MAP        | `candidaturas` → `job_applications`. V2.1 expande com `application_status_history`.                                                                                      |
| `processos_seletivos`   | `recruitment_processes` | MAP        |                                                                                                                                                                          |
| `entrevistas`           | `interviews`            | MAP        |                                                                                                                                                                          |
| `avaliacoes`            | `interview_feedback`    | MAP        |                                                                                                                                                                          |
| `vaga_favoritos`        | `job_favorites`         | MAP        |                                                                                                                                                                          |

### 2.5 Suporte

| Legado MySQL   | V2.1 PostgreSQL   | Tratamento | Observações                                                                                                                                                            |
| -------------- | ----------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tickets`      | `support_tickets` | MAP        | `tickets` → `support_tickets`. V2.1 expande com `support_ticket_categories`, `support_ticket_assignments`, `support_ticket_messages`, `support_ticket_status_history`. |
| `notificacoes` | `notifications`   | MAP        |                                                                                                                                                                        |
| `logs`         | `audit_logs`      | TRANSFORM  | `logs` legado é audit simples. V2.1 tem `audit_logs` + `domain_events` + `event_outbox` + `security_events`.                                                           |

### 2.6 Integração

| Legado MySQL      | V2.1 PostgreSQL                                | Tratamento | Observações                                                                                                                       |
| ----------------- | ---------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `webhooks`        | `webhook_deliveries` + `integration_sync_jobs` | TRANSFORM  | `webhooks` legado é configuração. V2.1 separa `webhook_deliveries` (execuções) e `integration_sync_jobs` (jobs de sincronização). |
| `fila_automacao`  | `automation_jobs` + `automation_templates`     | TRANSFORM  | `fila_automacao` é fila de jobs. V2.1 expande com `automation_executions`, `automation_templates`, `automation_workflows`.        |
| `mensagens`       | `chat_messages` + `email_messages`             | TRANSFORM  | `mensagens` legado é WhatsApp. V2.1 separa `chat_messages` (chat interno) e `email_messages` (emails).                            |
| `emails_enviados` | `email_messages`                               | MAP        |                                                                                                                                   |
| `conversas_ia`    | `ai_conversations` + `ai_messages`             | TRANSFORM  | `conversas_ia` legado é chat IA simples. V2.1 expande com `ai_conversations`, `ai_messages`, `ai_usage`.                          |

### 2.7 Automação

| Legado MySQL | V2.1 PostgreSQL | Tratamento | Observações |
|---|---|---|
| `eventos_automacao` | `automation_templates` + `domain_events` | TRANSFORM | `eventos_automacao` é catálogo de eventos. V2.1 separa `domain_events` (eventos de domínio) e `automation_templates` (templates de automação). |
| `fluxos_automacao` | `automation_workflows` | MAP | |
| `templates_email` | `email_templates` | MAP | |
| `templates_whatsapp` | `whatsapp_templates` | MAP | V2.1 ainda não tem `whatsapp_templates` como tabela separada. Considerar adicionar. |

---

## 3. Mapeamento de Colunas

### 3.1 Tipos de dados

| MySQL                   | PostgreSQL       | Observações                                         |
| ----------------------- | ---------------- | --------------------------------------------------- |
| `BIGINT AUTO_INCREMENT` | `UUID`           | IDs mudam de numérico para UUID                     |
| `VARCHAR(n)`            | `VARCHAR(n)`     | Direto                                              |
| `TEXT` / `LONGTEXT`     | `TEXT`           | Direto                                              |
| `JSON`                  | `JSONB`          | Migração simples                                    |
| `TIMESTAMP`             | `TIMESTAMPTZ`    | Adiciona timezone                                   |
| `DECIMAL(10,2)`         | `NUMERIC`        | Direto                                              |
| `INT`                   | `INTEGER`        | Direto                                              |
| `TINYINT(1)`            | `BOOLEAN`        | `1` → `true`, `0` → `false`                         |
| `ENUM(...)`             | `TEXT` + `CHECK` | ENUMs viram CHECK constraints ou tabelas de domínio |
| `DATE`                  | `DATE`           | Direto                                              |
| `VARCHAR(500)` URL      | `TEXT`           | URLs podem ser longas                               |

### 3.2 Colunas transformadas

| Legado       | Coluna           | V2.1                 | Coluna                       | Transformação                               |
| ------------ | ---------------- | -------------------- | ---------------------------- | ------------------------------------------- |
| `empresa`    | `id`             | `tenants`            | `id`                         | BIGINT → UUID                               |
| `empresa`    | `razao_social`   | `tenants`            | `name`                       | Direto                                      |
| `empresa`    | `nome_fantasia`  | `tenants`            | `slug`                       | Deriva slug                                 |
| `empresa`    | `cnpj`           | `tenants`            | `metadata`                   | Mover para metadata                         |
| `empresa`    | `ativo`          | `tenants`            | `status`                     | `TINYINT(1)` → `TEXT` (`active`/`inactive`) |
| `usuarios`   | `empresa_id`     | `tenant_memberships` | `tenant_id`                  | FK → membership                             |
| `usuarios`   | `perfil`         | `roles`              | `name`                       | ENUM → role name                            |
| `usuarios`   | `senha_hash`     | `auth.users`         | `encrypted_password`         | Migrar para Auth                            |
| `clientes`   | `origem`         | `leads`              | `origin`                     | ENUM → TEXT                                 |
| `clientes`   | `status`         | `companies`          | `status`                     | ENUM → TEXT + lifecycle                     |
| `candidatos` | `vaga_interesse` | `job_applications`   | `job_id`                     | ENUM → FK                                   |
| `tickets`    | `protocolo`      | `support_tickets`    | `protocol`                   | Direto                                      |
| `logs`       | `usuario_id`     | `audit_logs`         | `actor_person_id`            | FK → person                                 |
| `logs`       | `detalhes`       | `audit_logs`         | `before_data` / `after_data` | JSON → JSONB                                |

---

## 4. Mapeamento de Relacionamentos

### 4.1 FKs legadas

| Tabela                  | Coluna           | Referência                | CASCADE/RESTRICT | V2.1 Equivalente                       |
| ----------------------- | ---------------- | ------------------------- | ---------------- | -------------------------------------- |
| `usuarios`              | `empresa_id`     | `empresa(id)`             | RESTRICT         | `tenant_memberships.tenant_id`         |
| `usuario_permissoes`    | `usuario_id`     | `usuarios(id)`            | CASCADE          | `role_assignments.person_id`           |
| `usuario_permissoes`    | `permissao_id`   | `permissoes(id)`          | CASCADE          | `role_assignments.role_id`             |
| `clientes`              | `usuario_id`     | `usuarios(id)`            | RESTRICT         | `companies.created_by`                 |
| `cliente_servicos`      | `cliente_id`     | `clientes(id)`            | CASCADE          | `company_services.company_id`          |
| `cliente_servicos`      | `servico_id`     | `servicos(id)`            | CASCADE          | `company_services.service_id`          |
| `leads`                 | `responsavel_id` | `usuarios(id)`            | SET NULL         | `leads.assigned_to`                    |
| `contratos`             | `cliente_id`     | `clientes(id)`            | RESTRICT         | `contracts.company_id`                 |
| `candidatos`            | `responsavel_id` | `usuarios(id)`            | SET NULL         | `candidates.recruiter_id`              |
| `parceiros`             | `responsavel_id` | `usuarios(id)`            | SET NULL         | `companies.partner_manager_id`         |
| `colaboradores`         | `usuario_id`     | `usuarios(id)`            | RESTRICT         | `employees.person_id`                  |
| `alocacoes`             | `colaborador_id` | `colaboradores(id)`       | RESTRICT         | `employee_allocations.employee_id`     |
| `alocacoes`             | `cliente_id`     | `clientes(id)`            | RESTRICT         | `employee_allocations.company_id`      |
| `alocacoes`             | `contrato_id`    | `contratos(id)`           | SET NULL         | `employee_allocations.contract_id`     |
| `tickets`               | `cliente_id`     | `clientes(id)`            | SET NULL         | `support_tickets.company_id`           |
| `tickets`               | `usuario_id`     | `usuarios(id)`            | RESTRICT         | `support_tickets.created_by`           |
| `tickets`               | `responsavel_id` | `usuarios(id)`            | SET NULL         | `support_ticket_assignments.person_id` |
| `notificacoes`          | `usuario_id`     | `usuarios(id)`            | CASCADE          | `notifications.recipient_id`           |
| `logs`                  | `usuario_id`     | `usuarios(id)`            | SET NULL         | `audit_logs.actor_person_id`           |
| `conversas_ia`          | `cliente_id`     | `clientes(id)`            | SET NULL         | `ai_conversations.company_id`          |
| `conversas_ia`          | `usuario_id`     | `usuarios(id)`            | SET NULL         | `ai_conversations.person_id`           |
| `vagas`                 | `empresa_id`     | `usuarios(id)`            | CASCADE          | `jobs.tenant_id`                       |
| `vaga_habilidades`      | `vaga_id`        | `vagas(id)`               | CASCADE          | `job_skills.job_id`                    |
| `vaga_habilidades`      | `habilidade_id`  | `habilidades(id)`         | CASCADE          | `job_skills.skill_id`                  |
| `curriculos`            | `candidato_id`   | `colaboradores(id)`       | CASCADE          | `candidate_profiles.candidate_id`      |
| `experiencias`          | `curriculo_id`   | `curriculos(id)`          | CASCADE          | `candidate_experiences.profile_id`     |
| `formacoes`             | `curriculo_id`   | `curriculos(id)`          | CASCADE          | `candidate_education.profile_id`       |
| `cursos`                | `curriculo_id`   | `curriculos(id)`          | CASCADE          | `candidate_courses.profile_id`         |
| `idiomas`               | `curriculo_id`   | `curriculos(id)`          | CASCADE          | `candidate_languages.profile_id`       |
| `curriculo_habilidades` | `curriculo_id`   | `curriculos(id)`          | CASCADE          | `candidate_skills.profile_id`          |
| `curriculo_habilidades` | `habilidade_id`  | `habilidades(id)`         | CASCADE          | `candidate_skills.skill_id`            |
| `candidaturas`          | `vaga_id`        | `vagas(id)`               | CASCADE          | `job_applications.job_id`              |
| `candidaturas`          | `candidato_id`   | `colaboradores(id)`       | CASCADE          | `job_applications.candidate_id`        |
| `candidaturas`          | `curriculo_id`   | `curriculos(id)`          | SET NULL         | `job_applications.profile_id`          |
| `processos_seletivos`   | `vaga_id`        | `vagas(id)`               | CASCADE          | `recruitment_processes.job_id`         |
| `processos_seletivos`   | `empresa_id`     | `usuarios(id)`            | CASCADE          | `recruitment_processes.tenant_id`      |
| `processos_seletivos`   | `responsavel_id` | `usuarios(id)`            | SET NULL         | `recruitment_processes.recruiter_id`   |
| `entrevistas`           | `processo_id`    | `processos_seletivos(id)` | CASCADE          | `interviews.process_id`                |
| `entrevistas`           | `candidatura_id` | `candidaturas(id)`        | CASCADE          | `interviews.application_id`            |
| `avaliacoes`            | `entrevista_id`  | `entrevistas(id)`         | CASCADE          | `interview_feedback.interview_id`      |
| `avaliacoes`            | `avaliador_id`   | `usuarios(id)`            | SET NULL         | `interview_feedback.interviewer_id`    |
| `vaga_favoritos`        | `candidato_id`   | `colaboradores(id)`       | CASCADE          | `job_favorites.candidate_id`           |
| `vaga_favoritos`        | `vaga_id`        | `vagas(id)`               | CASCADE          | `job_favorites.job_id`                 |

---

## 5. Mapeamento de ENUMs

| Legado MySQL ENUM                                                                           | V2.1 PostgreSQL                     | Tratamento                        |
| ------------------------------------------------------------------------------------------- | ----------------------------------- | --------------------------------- |
| `usuarios.perfil`: ADMIN, GESTOR, COMERCIAL, RH, ATENDIMENTO, FINANCEIRO, CLIENTE, PARCEIRO | `roles.name` + RBAC                 | TRANSFORM — vira roles granulares |
| `clientes.origem`: SITE, WHATSAPP, INDICACAO, GOOGLE, EVENTO                                | `leads.origin`                      | MAP                               |
| `clientes.status`: LEAD, PROSPECT, NEGOCIACAO, CLIENTE_ATIVO, INATIVO                       | `companies.status` / `leads.status` | RECONCILE — split em duas tabelas |
| `servicos.categoria`: Segurança, Limpeza, etc.                                              | `service_categories.name`           | MAP                               |
| `tickets.categoria`: SEGURANCA, LIMPEZA, ACESSO, ZELADORIA, FACILITIES, OUTROS              | `support_ticket_categories.name`    | MAP                               |
| `tickets.prioridade`: BAIXA, MEDIA, ALTA, URGENTE                                           | `support_tickets.priority`          | MAP                               |
| `tickets.status`: ABERTO, EM_ANALISE, AGUARDANDO, RESOLVIDO, FECHADO                        | `support_tickets.status`            | MAP                               |
| `candidatos.status`: NOVO, TRIAGEM, ENTREVISTA, APROVADO, BANCO_TALENTOS, REPROVADO         | `job_applications.status`           | MAP                               |
| `fornecedores.categoria`: MATERIAL, EQUIPAMENTO, SERVICO, OUTROS                            | `suppliers.category`                | MAP                               |
| `parceiros.status`: NOVO, VALIDANDO, ATIVO, INATIVO                                         | `companies.status`                  | MAP                               |
| `colaboradores.status`                                                                      | `employees.status`                  | MAP                               |
| `webhooks.metodo`: GET, POST, PUT, PATCH, DELETE                                            | `webhook_deliveries.method`         | MAP                               |
| `fila_automacao.status`: PENDENTE, PROCESSANDO, CONCLUIDO, ERRO                             | `automation_jobs.status`            | MAP                               |
| `mensagens.tipo`: ENTRADA, SAIDA                                                            | `chat_messages.direction`           | MAP                               |
| `mensagens.status`: ENVIADA, ENTREGUE, LIDA, ERRO                                           | `chat_messages.status`              | MAP                               |
| `emails_enviados.status`: ENVIADO, ERRO, ABERTO, CLICK                                      | `email_messages.status`             | MAP                               |
| `conversas_ia.canal`: CHAT, WHATSAPP, WEBSITE                                               | `ai_conversations.channel`          | MAP                               |
| `vagas.tipo_salario`: FAIXA, MENSAL, NEGOCIAR                                               | `jobs.salary_type`                  | MAP                               |
| `vagas.tipo_contrato`: CLT, ESTAGIO, TEMPORARIO, FREELA, TERCEIRIZADO, CD                   | `employment_types.code`             | MAP                               |
| `vagas.nivel`: ESTAGIO, JUNIOR, PLENO, SENIOR, MASTER, LIDERANCA                            | `job_positions.level`               | MAP                               |
| `vagas.modalidade`: PRESENCIAL, HIBRIDO, REMOTO                                             | `jobs.modality`                     | MAP                               |
| `vagas.status`: BORRAR, ATIVA, ARQUIVADA, CONTRATADA                                        | `jobs.status`                       | MAP                               |
| `curriculos.disponibilidade`: IMEDIATA, 15_DIAS, 30_DIAS, 90_DIAS                           | `candidate_profiles.availability`   | MAP                               |
| `curriculos.status`: ATIVO, INATIVO, ARQUIVADO                                              | `candidate_profiles.status`         | MAP                               |
| `candidaturas.status`: ENVIADO, EM_ANALISE, ENTREVISTA, APROVADO, REJEITADO, SEM_INTERESSE  | `job_applications.status`           | MAP                               |
| `processos_seletivos.status`: ABERTO, EM_ANDAMENTO, PAUSADO, CONCLUIDO, CANCELADO           | `recruitment_processes.status`      | MAP                               |
| `entrevistas.status`: AGENDADA, REALIZADA, CANCELADA, REAGENDADA                            | `interviews.status`                 | MAP                               |
| `habilidades.nivel`: BASICO, INTERMEDIARIO, AVANCADO                                        | `candidate_skills.level`            | MAP                               |
| `formacoes.nivel`: FUNDAMENTAL, MEDIO, TECNICO, GRADUACAO, POS, MESTRADO, DOUTORADO         | `candidate_education.level`         | MAP                               |
| `idiomas.nivel`: BASICO, INTERMEDIARIO, AVANCADO, FLUENTE, NATIVO                           | `candidate_languages.level`         | MAP                               |
| `vaga_habilidades.nivel_requerido`: BASICO, INTERMEDIARIO, AVANCADO                         | `job_skills.required_level`         | MAP                               |

---

## 6. Mapeamento de Views

| View Legada                 | V2.1 PostgreSQL      | Tratamento                          |
| --------------------------- | -------------------- | ----------------------------------- |
| `vw_dashboard_leads`        | View de leads        | MAP — recriar com `tenant_id` e RLS |
| `vw_dashboard_clientes`     | View de clientes     | MAP — recriar com `tenant_id` e RLS |
| `vw_dashboard_rh`           | View de RH           | MAP — recriar com `tenant_id` e RLS |
| `vw_dashboard_tickets`      | View de tickets      | MAP — recriar com `tenant_id` e RLS |
| `vw_dashboard_automacao`    | View de automação    | MAP — recriar com `tenant_id` e RLS |
| `vw_dashboard_vagas`        | View de vagas        | MAP — recriar com `tenant_id` e RLS |
| `vw_dashboard_candidaturas` | View de candidaturas | MAP — recriar com `tenant_id` e RLS |
| `vw_dashboard_processos`    | View de processos    | MAP — recriar com `tenant_id` e RLS |
| `vw_ranking_vagas`          | View de ranking      | MAP — recriar com `tenant_id` e RLS |

---

## 7. Mapeamento de Seeds

| Seed Legado                               | V2.1 PostgreSQL                                      | Tratamento |
| ----------------------------------------- | ---------------------------------------------------- | ---------- |
| Empresa padrão (`JS Empregos Ltda`)       | `tenants` + `companies`                              | TRANSFORM  |
| Usuário admin (`admin@jsEmpregos.com.br`) | `people` + `tenant_memberships` + `role_assignments` | TRANSFORM  |
| Permissões padrão                         | `permissions`                                        | MAP        |
| Serviços padrão                           | `services` + `service_categories`                    | MAP        |
| Clientes de teste (5)                     | `companies` + `customers`                            | MAP        |
| Leads de teste (10)                       | `leads`                                              | MAP        |
| Candidatos de teste (5)                   | `candidates`                                         | MAP        |
| Tickets de teste (5)                      | `support_tickets`                                    | MAP        |
| Webhooks padrão                           | `webhook_deliveries`                                 | MAP        |
| Eventos de automação                      | `domain_events` + `automation_templates`             | TRANSFORM  |
| Fluxos de automação                       | `automation_workflows`                               | MAP        |
| Templates de email                        | `email_templates`                                    | MAP        |
| Templates de WhatsApp                     | `whatsapp_templates`                                 | MAP        |
| Habilidades                               | `skills`                                             | MAP        |

---

## 8. Mapeamento de Automação

| Legado MySQL         | V2.1 PostgreSQL                          | Tratamento |
| -------------------- | ---------------------------------------- | ---------- |
| `eventos_automacao`  | `domain_events` + `automation_templates` | TRANSFORM  |
| `fluxos_automacao`   | `automation_workflows`                   | MAP        |
| `templates_email`    | `email_templates`                        | MAP        |
| `templates_whatsapp` | `whatsapp_templates`                     | MAP        |
| `fila_automacao`     | `automation_jobs`                        | MAP        |

---

## 9. Estratégia de Migração

### 9.1 Princípios

1. **Não migrar schema antigo.** O V2.1 canônico é a fonte de verdade.
2. **Migrar apenas dados válidos.** Dados de teste/exemplo podem ser descartados.
3. **Preservar histórico.** Nenhum dado de negócio é apagado.
4. **Transformar, não importar.** Dados legados passam por transformação para o modelo V2.1.
5. **Backup antes de migrar.** Backup completo do MySQL legado antes de qualquer operação.

### 9.2 Fases da migração

```text
FASE 1 — Backup MySQL legado
FASE 2 — Extração de dados (SELECT only)
FASE 3 — Transformação para V2.1
FASE 4 — Carga no PostgreSQL V2.1
FASE 5 — Validação de integridade
FASE 6 — Corte de operação
```

### 9.3 Tratamento por entidade

| Entidade                | Ação      | Motivo                                                    |
| ----------------------- | --------- | --------------------------------------------------------- |
| `empresa`               | TRANSFORM | Vira `tenants` + `companies`                              |
| `usuarios`              | TRANSFORM | Vira `people` + `tenant_memberships` + `role_assignments` |
| `permissoes`            | MAP       | Direto                                                    |
| `usuario_permissoes`    | MAP       | Direto                                                    |
| `clientes`              | RECONCILE | Split em `companies` + `customers`                        |
| `servicos`              | MAP       | Direto                                                    |
| `cliente_servicos`      | MAP       | Direto                                                    |
| `leads`                 | MAP       | Direto                                                    |
| `contratos`             | MAP       | Direto                                                    |
| `candidatos`            | MAP       | Direto                                                    |
| `parceiros`             | TRANSFORM | Vira `companies` com tipo PARTNER                         |
| `fornecedores`          | MAP       | Direto                                                    |
| `colaboradores`         | MAP       | Direto                                                    |
| `alocacoes`             | MAP       | Direto                                                    |
| `tickets`               | MAP       | Direto                                                    |
| `notificacoes`          | MAP       | Direto                                                    |
| `logs`                  | DESCARTAR | V2.1 tem `audit_logs` + `domain_events`                   |
| `webhooks`              | TRANSFORM | Split em `webhook_deliveries` + `integration_sync_jobs`   |
| `fila_automacao`        | TRANSFORM | Vira `automation_jobs`                                    |
| `mensagens`             | TRANSFORM | Split em `chat_messages` + `email_messages`               |
| `emails_enviados`       | MAP       | Direto                                                    |
| `conversas_ia`          | TRANSFORM | Vira `ai_conversations` + `ai_messages`                   |
| `eventos_automacao`     | TRANSFORM | Vira `domain_events` + `automation_templates`             |
| `fluxos_automacao`      | MAP       | Direto                                                    |
| `templates_email`       | MAP       | Direto                                                    |
| `templates_whatsapp`    | MAP       | Direto                                                    |
| `vagas`                 | MAP       | Direto                                                    |
| `vaga_habilidades`      | MAP       | Direto                                                    |
| `habilidades`           | MAP       | Direto                                                    |
| `curriculos`            | MAP       | Direto                                                    |
| `experiencias`          | MAP       | Direto                                                    |
| `formacoes`             | MAP       | Direto                                                    |
| `cursos`                | MAP       | Direto                                                    |
| `idiomas`               | MAP       | Direto                                                    |
| `curriculo_habilidades` | MAP       | Direto                                                    |
| `candidaturas`          | MAP       | Direto                                                    |
| `processos_seletivos`   | MAP       | Direto                                                    |
| `entrevistas`           | MAP       | Direto                                                    |
| `avaliacoes`            | MAP       | Direto                                                    |
| `vaga_favoritos`        | MAP       | Direto                                                    |

---

## 10. Exceções e Notas

### 10.1 Entidades que não existem no V2.1

| Entidade Legada  | Motivo                                                        | Ação      |
| ---------------- | ------------------------------------------------------------- | --------- |
| `logs`           | Substituída por `audit_logs` + `domain_events`                | DESCARTAR |
| `fila_automacao` | Substituída por `automation_jobs`                             | TRANSFORM |
| `conversas_ia`   | Substituída por `ai_conversations` + `ai_messages`            | TRANSFORM |
| `mensagens`      | Split em `chat_messages` + `email_messages`                   | TRANSFORM |
| `webhooks`       | Expandida para `webhook_deliveries` + `integration_sync_jobs` | TRANSFORM |

### 10.2 Entidades que não existem no legado

| Entidade V2.1            | Origem | Motivo                  |
| ------------------------ | ------ | ----------------------- |
| `tenants`                | Nova   | Multi-tenancy           |
| `people`                 | Nova   | Identidade global       |
| `tenant_memberships`     | Nova   | Vínculo tenant          |
| `role_assignments`       | Nova   | RBAC granular           |
| `companies`              | Nova   | Empresas clientes       |
| `customers`              | Nova   | Clientes finais         |
| `employees`              | Nova   | Extensão RH             |
| `departments`            | Nova   | Organograma             |
| `positions`              | Nova   | Cargos                  |
| `employment_types`       | Nova   | Tipos de vínculo        |
| `suppliers`              | Nova   | Fornecedores            |
| `products`               | Nova   | Produtos                |
| `inventory`              | Nova   | Estoque                 |
| `purchasing`             | Nova   | Compras                 |
| `finance`                | Nova   | Financeiro              |
| `fiscal`                 | Nova   | Fiscal                  |
| `pos`                    | Nova   | PDV                     |
| `operations`             | Nova   | Operações/Field Service |
| `epi`                    | Nova   | EPI                     |
| `documents`              | Nova   | Documentos              |
| `files`                  | Nova   | Arquivos                |
| `chat_rooms`             | Nova   | Chat                    |
| `notifications`          | Nova   | Notificações            |
| `security_events`        | Nova   | Eventos de segurança    |
| `data_deletion_requests` | Nova   | LGPD                    |
| `privacy_requests`       | Nova   | LGPD                    |

### 10.3 Regras de negócio preservadas

| Regra                          | Legado                                 | V2.1                                                         | Status        |
| ------------------------------ | -------------------------------------- | ------------------------------------------------------------ | ------------- |
| Soft lifecycle (ativo/inativo) | `ativo TINYINT(1)`                     | `status TEXT`                                                | ✅ Preservado |
| Multi-tenant por empresa       | `empresa_id`                           | `tenant_id`                                                  | ✅ Preservado |
| RBAC por perfil                | `perfil ENUM`                          | `roles` + `permissions`                                      | ✅ Expandido  |
| Auditoria                      | `logs`                                 | `audit_logs` + `domain_events`                               | ✅ Expandido  |
| Automação                      | `fila_automacao` + `eventos_automacao` | `automation_jobs` + `domain_events` + `automation_workflows` | ✅ Expandido  |
| Chat                           | `conversas_ia`                         | `chat_rooms` + `chat_messages`                               | ✅ Expandido  |
| Notificações                   | `notificacoes`                         | `notifications` + `notification_deliveries`                  | ✅ Expandido  |

---

## 11. Ações Necessárias Antes da Migração

1. **Confirmar banco de produção do hosting** — PostgreSQL ou MySQL?
2. **Se MySQL:** avaliar viabilidade de rodar V2.1 em MySQL (recurso limitado, sem RLS nativo)
3. **Se PostgreSQL:** proceder com migração direta
4. **Gerar script de transformação** — ETL legado → V2.1
5. **Validar integridade** — contagens, FKs, checksums
6. **Backup do legado** — antes de qualquer operação

---

## 12. Documentos Relacionados

| Documento                               | Descrição                    |
| --------------------------------------- | ---------------------------- |
| `docs/V21-LOCAL-REBUILD-EXECUTION.md`   | Guia de rebuild V2.1         |
| `docs/V21-CANONICAL-SNAPSHOT.md`        | Snapshot canônico            |
| `docs/V21-SCHEMA-AUDIT.md`              | Auditoria de schema          |
| `docs/V21-POST-IMPLEMENTATION-AUDIT.md` | Auditoria pós-implementação  |
| `docs/V21-GAP-CLOSURE-MATRIX.md`        | Matriz de gap closure        |
| `database/README_DATABASE.md`           | Documentação do banco legado |

---

**Nota:** Este documento é baseado em análise estática dos arquivos `database/*.sql`. Não foi executada consulta direta ao banco MySQL legado. Para validação final, recomenda-se conexão read-only ao banco para confirmar contagens e integridade.
