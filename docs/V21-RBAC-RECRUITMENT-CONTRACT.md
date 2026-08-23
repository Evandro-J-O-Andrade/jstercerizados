# V2.1 — RBAC Contract: Recruitment Domain

**Data:** 2026-08-23  
**Empresa:** J&S Empregos LTDA  
**Escopo:** Domínio de RH/Recrutamento  
**Status:** Draft — aguardando aprovação antes de qualquer migration/seed

---

## 1. Objetivo

Definir o contrato canônico de permissões do domínio de Recrutamento/RH no Supabase V2.1, garantindo que:

- O banco é a fonte da verdade para autorização
- O frontend consome permissions, não roles hardcoded
- As rotas do dashboard respeitam o RBAC real
- `admin_master` é o root global do SaaS
- Não há duplicação de permissões entre domínios

---

## 2. Princípios

1. **Banco como fonte de verdade**: permissions, roles e assignments são definidas no Supabase
2. **Frontend consome, não define**: o `PermissionGuard` consulta permissions do banco
3. **Granularidade por domínio**: cada domínio tem suas próprias permissions
4. **Separação de concerns**: Vagas ≠ Candidatos ≠ Processos Seletivos ≠ Aplicações
5. **admin_master global**: acesso total a todos os domínios
6. **tenant_admin local**: administração do tenant, mas não acesso cross-tenant
7. **Não inventar permissions no frontend**: todas devem existir no banco antes de ser usadas

---

## 3. Domínios e Permissions

### 3.1 Vagas — `jobs`

| Permission     | Ação       | Descrição                          | Tabela |
| -------------- | ---------- | ---------------------------------- | ------ |
| `jobs.read`    | visualizar | Listar e visualizar vagas          | `jobs` |
| `jobs.create`  | criar      | Criar nova vaga                    | `jobs` |
| `jobs.update`  | editar     | Editar vaga existente              | `jobs` |
| `jobs.delete`  | excluir    | Remover vaga                       | `jobs` |
| `jobs.publish` | publicar   | Publicar vaga (status → published) | `jobs` |
| `jobs.close`   | encerrar   | Encerrar vaga (status → closed)    | `jobs` |

**Recursos relacionados:**

- `job_skills` — habilidades da vaga
- `job_matches` — matching candidato-vaga

---

### 3.2 Candidatos — `candidates`

| Permission                    | Ação             | Descrição                          | Tabela                  |
| ----------------------------- | ---------------- | ---------------------------------- | ----------------------- |
| `candidates.read`             | visualizar       | Listar e visualizar candidatos     | `candidates`            |
| `candidates.create`           | cadastrar        | Cadastrar novo candidato           | `candidates`            |
| `candidates.update`           | editar           | Editar dados do candidato          | `candidates`            |
| `candidates.delete`           | remover          | Remover candidato                  | `candidates`            |
| `candidates.documents.read`   | consultar docs   | Visualizar documentos do candidato | `candidate_documents`   |
| `candidates.documents.manage` | gerenciar docs   | Upload/remoção de documentos       | `candidate_documents`   |
| `candidates.profile.read`     | consultar perfil | Visualizar perfil completo         | `people` + `candidates` |

**Recursos relacionados:**

- `candidate_experiences`
- `candidate_education`
- `candidate_courses`
- `candidate_languages`
- `candidate_skills`
- `candidate_profile_views`
- `curricula`

---

### 3.3 Processos Seletivos — `recruitment`

| Permission                 | Ação             | Descrição                            | Tabela                       |
| -------------------------- | ---------------- | ------------------------------------ | ---------------------------- |
| `recruitment.read`         | visualizar       | Listar processos seletivos           | `recruitment_processes`      |
| `recruitment.create`       | criar            | Criar novo processo                  | `recruitment_processes`      |
| `recruitment.update`       | editar           | Editar processo                      | `recruitment_processes`      |
| `recruitment.delete`       | excluir          | Remover processo                     | `recruitment_processes`      |
| `recruitment.advance`      | avançar          | Avançar candidato para próxima etapa | `application_status_history` |
| `recruitment.reject`       | reprovar         | Reprovar candidato                   | `application_status_history` |
| `recruitment.stage.manage` | gerenciar etapas | Criar/editar etapas do processo      | `recruitment_stages`         |

**Recursos relacionados:**

- `recruitment_demands`
- `recruitment_kpis`
- `application_status_history`
- `applications`

---

### 3.4 Candidaturas — `applications`

| Permission                  | Ação       | Descrição                     | Tabela                       |
| --------------------------- | ---------- | ----------------------------- | ---------------------------- |
| `applications.read`         | visualizar | Listar candidaturas           | `applications`               |
| `applications.create`       | registrar  | Registrar nova candidatura    | `applications`               |
| `applications.update`       | atualizar  | Atualizar candidatura         | `applications`               |
| `applications.advance`      | avançar    | Avançar status da candidatura | `applications`               |
| `applications.reject`       | rejeitar   | Rejeitar candidatura          | `applications`               |
| `applications.history.read` | histórico  | Consultar histórico de status | `application_status_history` |

---

### 3.5 Banco de Talentos — `talent_pool`

| Permission           | Ação        | Descrição                        | Tabela                       |
| -------------------- | ----------- | -------------------------------- | ---------------------------- |
| `talent_pool.read`   | consultar   | Visualizar banco de talentos     | `candidates` + `skills`      |
| `talent_pool.manage` | administrar | Adicionar/remover talentos       | `candidates` + `skills`      |
| `talent_pool.match`  | matching    | Executar matching candidato-vaga | `job_matches` + `job_skills` |

---

### 3.6 Demandas de Recrutamento — `recruitment_demands`

| Permission                   | Ação      | Descrição          | Tabela                |
| ---------------------------- | --------- | ------------------ | --------------------- |
| `recruitment_demands.read`   | consultar | Listar demandas    | `recruitment_demands` |
| `recruitment_demands.create` | criar     | Abrir nova demanda | `recruitment_demands` |
| `recruitment_demands.update` | editar    | Editar demanda     | `recruitment_demands` |
| `recruitment_demands.delete` | excluir   | Remover demanda    | `recruitment_demands` |

---

## 4. Matriz de Roles

| Permission                  | recruiter | rh_manager | tenant_admin | admin_master |
| --------------------------- | :-------: | :--------: | :----------: | :----------: |
| jobs.read                   |    ✅     |     ✅     |      ✅      |      ✅      |
| jobs.create                 |    ✅     |     ✅     |      ✅      |      ✅      |
| jobs.update                 |    ✅     |     ✅     |      ✅      |      ✅      |
| jobs.delete                 |    ❌     |     ✅     |      ✅      |      ✅      |
| jobs.publish                |    ❌     |     ✅     |      ✅      |      ✅      |
| jobs.close                  |    ❌     |     ✅     |      ✅      |      ✅      |
| candidates.read             |    ✅     |     ✅     |      ✅      |      ✅      |
| candidates.create           |    ✅     |     ✅     |      ✅      |      ✅      |
| candidates.update           |    ✅     |     ✅     |      ✅      |      ✅      |
| candidates.delete           |    ❌     |     ✅     |      ✅      |      ✅      |
| candidates.documents.read   |    ✅     |     ✅     |      ✅      |      ✅      |
| candidates.documents.manage |    ❌     |     ✅     |      ✅      |      ✅      |
| candidates.profile.read     |    ✅     |     ✅     |      ✅      |      ✅      |
| recruitment.read            |    ✅     |     ✅     |      ✅      |      ✅      |
| recruitment.create          |    ✅     |     ✅     |      ✅      |      ✅      |
| recruitment.update          |    ✅     |     ✅     |      ✅      |      ✅      |
| recruitment.delete          |    ❌     |     ✅     |      ✅      |      ✅      |
| recruitment.advance         |    ✅     |     ✅     |      ✅      |      ✅      |
| recruitment.reject          |    ✅     |     ✅     |      ✅      |      ✅      |
| recruitment.stage.manage    |    ❌     |     ✅     |      ✅      |      ✅      |
| applications.read           |    ✅     |     ✅     |      ✅      |      ✅      |
| applications.update         |    ✅     |     ✅     |      ✅      |      ✅      |
| applications.advance        |    ✅     |     ✅     |      ✅      |      ✅      |
| applications.reject         |    ✅     |     ✅     |      ✅      |      ✅      |
| applications.history.read   |    ✅     |     ✅     |      ✅      |      ✅      |
| talent_pool.read            |    ✅     |     ✅     |      ✅      |      ✅      |
| talent_pool.manage          |    ❌     |     ✅     |      ✅      |      ✅      |
| talent_pool.match           |    ✅     |     ✅     |      ✅      |      ✅      |
| recruitment_demands.read    |    ✅     |     ✅     |      ✅      |      ✅      |
| recruitment_demands.create  |    ❌     |     ✅     |      ✅      |      ✅      |
| recruitment_demands.update  |    ❌     |     ✅     |      ✅      |      ✅      |
| recruitment_demands.delete  |    ❌     |     ✅     |      ✅      |      ✅      |

---

## 5. Regras Especiais

### 5.1 admin_master (global)

- Acesso total a todos os domínios
- Não herda permissões via `role_permissions` — é tratado como bypass no `PermissionGuard`
- Pode acessar dados de qualquer tenant
- scope = `global`

### 5.2 tenant_admin (tenant)

- Acesso total dentro do seu tenant
- Não pode acessar dados de outros tenants
- scope = `tenant`
- Herda permissões via `role_permissions`

### 5.3 recruiter (tenant)

- Acesso operacional a vagas e candidatos
- Não pode excluir ou publicar/encerrar vagas
- Não pode gerenciar etapas de processo
- scope = `tenant`

### 5.4 rh_manager (tenant)

- Acesso gerencial a todo o domínio de RH
- Pode excluir vagas, candidatos e processos
- Pode gerenciar etapas de processo
- scope = `tenant`

### 5.5 finance_manager (tenant)

- **Nenhuma permissão de RH/Recrutamento por padrão**
- Acesso restrito ao domínio financeiro
- scope = `tenant`

---

## 6. Mapeamento Permission → Rota

| Rota                             | Permission                 | Módulo              |
| -------------------------------- | -------------------------- | ------------------- |
| `/dashboard/vagas`               | `jobs.read`                | Vagas               |
| `/dashboard/candidatos`          | `candidates.read`          | Candidatos          |
| `/dashboard/processos-seletivos` | `recruitment.read`         | Processos Seletivos |
| `/dashboard/talent-pool`         | `talent_pool.read`         | Banco de Talentos   |
| `/dashboard/demandas`            | `recruitment_demands.read` | Demandas            |

---

## 7. Mapeamento Permission → Domínio/Tabela

| Permission                    | Tabela Principal             | Tabelas Relacionadas              |
| ----------------------------- | ---------------------------- | --------------------------------- |
| `jobs.read`                   | `jobs`                       | `job_skills`, `job_matches`       |
| `jobs.create`                 | `jobs`                       | `job_skills`                      |
| `jobs.update`                 | `jobs`                       | `job_skills`                      |
| `jobs.delete`                 | `jobs`                       | `job_skills`, `applications`      |
| `jobs.publish`                | `jobs`                       | —                                 |
| `jobs.close`                  | `jobs`                       | —                                 |
| `candidates.read`             | `candidates`                 | `people`, `candidate_*`           |
| `candidates.create`           | `candidates`                 | `people`, `candidate_*`           |
| `candidates.update`           | `candidates`                 | `people`, `candidate_*`           |
| `candidates.delete`           | `candidates`                 | `candidate_*`, `applications`     |
| `candidates.documents.read`   | `candidate_documents`        | —                                 |
| `candidates.documents.manage` | `candidate_documents`        | Storage                           |
| `candidates.profile.read`     | `people` + `candidates`      | `candidate_*`                     |
| `recruitment.read`            | `recruitment_processes`      | `recruitment_stages`              |
| `recruitment.create`          | `recruitment_processes`      | `recruitment_stages`              |
| `recruitment.update`          | `recruitment_processes`      | `recruitment_stages`              |
| `recruitment.delete`          | `recruitment_processes`      | `recruitment_stages`              |
| `recruitment.advance`         | `application_status_history` | `applications`                    |
| `recruitment.reject`          | `application_status_history` | `applications`                    |
| `recruitment.stage.manage`    | `recruitment_stages`         | —                                 |
| `applications.read`           | `applications`               | `application_status_history`      |
| `applications.update`         | `applications`               | `application_status_history`      |
| `applications.advance`        | `applications`               | `application_status_history`      |
| `applications.reject`         | `applications`               | `application_status_history`      |
| `applications.history.read`   | `application_status_history` | —                                 |
| `talent_pool.read`            | `candidates` + `skills`      | `candidate_skills`, `job_matches` |
| `talent_pool.manage`          | `candidates` + `skills`      | `candidate_skills`                |
| `talent_pool.match`           | `job_matches`                | `job_skills`, `candidate_skills`  |
| `recruitment_demands.read`    | `recruitment_demands`        | —                                 |
| `recruitment_demands.create`  | `recruitment_demands`        | —                                 |
| `recruitment_demands.update`  | `recruitment_demands`        | —                                 |
| `recruitment_demands.delete`  | `recruitment_demands`        | —                                 |

---

## 8. Regras de Negócio

### 8.1 Candidatos

- `candidates` referencia `people` via `person_id`
- `candidate_documents` referencia `candidates` via `candidate_id`
- Documentos são armazenados no bucket `curriculos` do Storage
- RLS garante que tenant só acessa seus próprios candidatos

### 8.2 Vagas

- `jobs` referencia `companies` via `company_id`
- `job_skills` referencia `jobs` e `skills`
- Apenas `jobs.delete` com cuidado — pode ter `applications` vinculadas
- Publicação/encerramento altera `status`, não deleta

### 8.3 Processos Seletivos

- `recruitment_processes` referencia `tenant_id`
- `recruitment_stages` referencia `recruitment_processes`
- `application_status_history` é imutável após criação
- Avançar/reprovar candidato cria registro em `application_status_history`

### 8.4 Candidaturas

- `applications` referencia `candidates` e `jobs`
- Histórico de status é append-only
- Não permite delete de candidatura — apenas update de status

---

## 9. Validação com o Banco

### 9.1 Tabelas necessárias existentes

| Tabela                       | Status |
| ---------------------------- | ------ |
| `jobs`                       | ✅     |
| `candidates`                 | ✅     |
| `applications`               | ✅     |
| `application_status_history` | ✅     |
| `recruitment_processes`      | ✅     |
| `recruitment_stages`         | ✅     |
| `recruitment_demands`        | ✅     |
| `candidate_documents`        | ✅     |
| `candidate_experiences`      | ✅     |
| `candidate_education`        | ✅     |
| `candidate_courses`          | ✅     |
| `candidate_languages`        | ✅     |
| `candidate_skills`           | ✅     |
| `candidate_profile_views`    | ✅     |
| `curricula`                  | ✅     |
| `skills`                     | ✅     |
| `job_skills`                 | ✅     |
| `job_matches`                | ✅     |

### 9.2 Permissions faltantes no banco

| Permission                    | Status |
| ----------------------------- | ------ |
| `jobs.read`                   | ❌     |
| `jobs.create`                 | ❌     |
| `jobs.update`                 | ❌     |
| `jobs.delete`                 | ❌     |
| `jobs.publish`                | ❌     |
| `jobs.close`                  | ❌     |
| `candidates.read`             | ❌     |
| `candidates.create`           | ❌     |
| `candidates.update`           | ❌     |
| `candidates.delete`           | ❌     |
| `candidates.documents.read`   | ❌     |
| `candidates.documents.manage` | ❌     |
| `candidates.profile.read`     | ❌     |
| `recruitment.read`            | ❌     |
| `recruitment.create`          | ❌     |
| `recruitment.update`          | ❌     |
| `recruitment.delete`          | ❌     |
| `recruitment.advance`         | ❌     |
| `recruitment.reject`          | ❌     |
| `recruitment.stage.manage`    | ❌     |
| `applications.read`           | ❌     |
| `applications.update`         | ❌     |
| `applications.advance`        | ❌     |
| `applications.reject`         | ❌     |
| `applications.history.read`   | ❌     |
| `talent_pool.read`            | ❌     |
| `talent_pool.manage`          | ❌     |
| `talent_pool.match`           | ❌     |
| `recruitment_demands.read`    | ❌     |
| `recruitment_demands.create`  | ❌     |
| `recruitment_demands.update`  | ❌     |
| `recruitment_demands.delete`  | ❌     |

**Total: 31 permissions faltantes**

---

## 10. Seed SQL (após aprovação)

```sql
-- Permissions
INSERT INTO permissions (id, resource, action, description) VALUES
('jobs-read', 'jobs', 'read', 'Visualizar vagas'),
('jobs-create', 'jobs', 'create', 'Criar vaga'),
('jobs-update', 'jobs', 'update', 'Editar vaga'),
('jobs-delete', 'jobs', 'delete', 'Excluir vaga'),
('jobs-publish', 'jobs', 'publish', 'Publicar vaga'),
('jobs-close', 'jobs', 'close', 'Encerrar vaga'),
('candidates-read', 'candidates', 'read', 'Visualizar candidatos'),
('candidates-create', 'candidates', 'create', 'Cadastrar candidato'),
('candidates-update', 'candidates', 'update', 'Editar candidato'),
('candidates-delete', 'candidates', 'delete', 'Remover candidato'),
('candidates-documents-read', 'candidates.documents', 'read', 'Consultar documentos'),
('candidates-documents-manage', 'candidates.documents', 'manage', 'Gerenciar documentos'),
('candidates-profile-read', 'candidates.profile', 'read', 'Consultar perfil'),
('recruitment-read', 'recruitment', 'read', 'Visualizar processos'),
('recruitment-create', 'recruitment', 'create', 'Criar processo'),
('recruitment-update', 'recruitment', 'update', 'Editar processo'),
('recruitment-delete', 'recruitment', 'delete', 'Excluir processo'),
('recruitment-advance', 'recruitment', 'advance', 'Avançar candidato'),
('recruitment-reject', 'recruitment', 'reject', 'Reprovar candidato'),
('recruitment-stage-manage', 'recruitment.stage', 'manage', 'Gerenciar etapas'),
('applications-read', 'applications', 'read', 'Visualizar candidaturas'),
('applications-update', 'applications', 'update', 'Atualizar candidatura'),
('applications-advance', 'applications', 'advance', 'Avançar candidatura'),
('applications-reject', 'applications', 'reject', 'Rejeitar candidatura'),
('applications-history-read', 'applications.history', 'read', 'Consultar histórico'),
('talent_pool-read', 'talent_pool', 'read', 'Consultar banco de talentos'),
('talent_pool-manage', 'talent_pool', 'manage', 'Administrar talentos'),
('talent_pool-match', 'talent_pool', 'match', 'Executar matching'),
('recruitment_demands-read', 'recruitment_demands', 'read', 'Consultar demandas'),
('recruitment_demands-create', 'recruitment_demands', 'create', 'Abrir demanda'),
('recruitment_demands-update', 'recruitment_demands', 'update', 'Editar demanda'),
('recruitment_demands-delete', 'recruitment_demands', 'delete', 'Excluir demanda');

-- role_permissions
INSERT INTO role_permissions (role_id, permission_id) VALUES
-- recruiter
('10000000-0000-0000-0000-000000000003', 'jobs-read'),
('10000000-0000-0000-0000-000000000003', 'jobs-create'),
('10000000-0000-0000-0000-000000000003', 'jobs-update'),
('10000000-0000-0000-0000-000000000003', 'candidates-read'),
('10000000-0000-0000-0000-000000000003', 'candidates-create'),
('10000000-0000-0000-0000-000000000003', 'candidates-update'),
('10000000-0000-0000-0000-000000000003', 'candidates-documents-read'),
('10000000-0000-0000-0000-000000000003', 'candidates-profile-read'),
('10000000-0000-0000-0000-000000000003', 'recruitment-read'),
('10000000-0000-0000-0000-000000000003', 'recruitment-create'),
('10000000-0000-0000-0000-000000000003', 'recruitment-update'),
('10000000-0000-0000-0000-000000000003', 'recruitment-advance'),
('10000000-0000-0000-0000-000000000003', 'recruitment-reject'),
('10000000-0000-0000-0000-000000000003', 'applications-read'),
('10000000-0000-0000-0000-000000000003', 'applications-update'),
('10000000-0000-0000-0000-000000000003', 'applications-advance'),
('10000000-0000-0000-0000-000000000003', 'applications-reject'),
('10000000-0000-0000-0000-000000000003', 'applications-history-read'),
('10000000-0000-0000-0000-000000000003', 'talent_pool-read'),
('10000000-0000-0000-0000-000000000003', 'talent_pool-match'),
('10000000-0000-0000-0000-000000000003', 'recruitment_demands-read'),

-- rh_manager
('10000000-0000-0000-0000-000000000002', 'jobs-read'),
('10000000-0000-0000-0000-000000000002', 'jobs-create'),
('10000000-0000-0000-0000-000000000002', 'jobs-update'),
('10000000-0000-0000-0000-000000000002', 'jobs-delete'),
('10000000-0000-0000-0000-000000000002', 'jobs-publish'),
('10000000-0000-0000-0000-000000000002', 'jobs-close'),
('10000000-0000-0000-0000-000000000002', 'candidates-read'),
('10000000-0000-0000-0000-000000000002', 'candidates-create'),
('10000000-0000-0000-0000-000000000002', 'candidates-update'),
('10000000-0000-0000-0000-000000000002', 'candidates-delete'),
('10000000-0000-0000-0000-000000000002', 'candidates-documents-read'),
('10000000-0000-0000-0000-000000000002', 'candidates-documents-manage'),
('10000000-0000-0000-0000-000000000002', 'candidates-profile-read'),
('10000000-0000-0000-0000-000000000002', 'recruitment-read'),
('10000000-0000-0000-0000-000000000002', 'recruitment-create'),
('10000000-0000-0000-0000-000000000002', 'recruitment-update'),
('10000000-0000-0000-0000-000000000002', 'recruitment-delete'),
('10000000-0000-0000-0000-000000000002', 'recruitment-advance'),
('10000000-0000-0000-0000-000000000002', 'recruitment-reject'),
('10000000-0000-0000-0000-000000000002', 'recruitment-stage-manage'),
('10000000-0000-0000-0000-000000000002', 'applications-read'),
('10000000-0000-0000-0000-000000000002', 'applications-update'),
('10000000-0000-0000-0000-000000000002', 'applications-advance'),
('10000000-0000-0000-0000-000000000002', 'applications-reject'),
('10000000-0000-0000-0000-000000000002', 'applications-history-read'),
('10000000-0000-0000-0000-000000000002', 'talent_pool-read'),
('10000000-0000-0000-0000-000000000002', 'talent_pool-manage'),
('10000000-0000-0000-0000-000000000002', 'talent_pool-match'),
('10000000-0000-0000-0000-000000000002', 'recruitment_demands-read'),
('10000000-0000-0000-0000-000000000002', 'recruitment_demands-create'),
('10000000-0000-0000-0000-000000000002', 'recruitment_demands-update'),
('10000000-0000-0000-0000-000000000002', 'recruitment_demands-delete');
```

---

## 11. Critérios de Aprovação

Antes de executar o seed, confirmar:

- [ ] Contrato aprovado pelo responsável pelo produto
- [ ] IDs das permissions não conflitam com seeds existentes
- [ ] Matriz de roles está correta
- [ ] Nenhuma permission duplicada
- [ ] RLS continua sendo a barreira definitiva
- [ ] Frontend não alterado até o seed ser aplicado

---

## 12. Próximos Passos (após aprovação)

1. Aplicar seed SQL no Supabase remoto
2. Validar que `admin_master` enxerga todas as permissões
3. Validar que `recruiter` enxerga apenas suas permissões
4. Atualizar `PermissionGuard` e rotas para usar permissions canônicas
5. Implementar `resolvePostLoginDestination()`
6. Testar fluxo completo de RH/Recrutamento
