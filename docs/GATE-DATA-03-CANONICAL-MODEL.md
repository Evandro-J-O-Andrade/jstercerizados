# GATE-DATA-03 — Modelo Canônico J&S Empregos (Pessoas-First)

**Status:** Proposto  
**Baseado em:** Auditoria do schema MySQL existente (`database/*.sql`) + decisões arquiteturais aprovadas (Pessoas-first, multi-tenant, RBAC, LGPD)  
**Fonte de verdade:** `docs/GATE-DATA-03-CANONICAL-MODEL.md`

---

## 1. Princípios Fundamentais

### 1.0 Portabilidade: domínio separado de infraestrutura

> **Nenhuma tabela de domínio pode depender diretamente de uma implementação proprietária de infraestrutura quando existir uma abstração de domínio equivalente.**

Exemplos de domínio (portáveis):

- `people`, `tenants`, `companies`, `jobs`, `applications`, `recruitment_processes`, `leads`, `communication_channels`, `automation_queue`, `files`, `audit_logs`, `tickets`, `services`, `notifications`

Exemplos de infraestrutura proprietária (Supabase):

- `auth.users` — substituível por Keycloak, Auth.js, Firebase Auth, etc.
- `Supabase Storage` — substituível por S3, R2, MinIO, etc.
- `Supabase Edge Functions` — substituível por workers próprios

**Implicações:**

1. Tabelas de domínio usam `tenant_id` para escopo multi-tenant (não usuário global)
2. `auth.users` é referenciado via `people.auth_user_id` (FK opcional, UNIQUE)
3. `files` armazena metadados + referência do objeto (provider, bucket, object_key), não depende da estrutura interna do Supabase Storage
4. Integrações (WhatsApp, e-mail, SMS, Google, LinkedIn) são modeladas como `communication_channels` e `integrations` — não acopladas ao provedor

Isso permite migrar futuramente de Supabase para hosting próprio sem reconstruir o SaaS.

### 1.0.1 Regra de segurança: identidade isolada de domínio

> **Nenhuma migration nova será considerada "pronta" apenas porque o schema funciona. Ela precisa respeitar o modelo de segurança da plataforma: identidade → sessão → autorização → tenant isolation → RLS → constraints → aplicação segura.**

| Camada       | Responsável         | Implementação                                             |
| ------------ | ------------------- | --------------------------------------------------------- |
| Autenticação | Supabase Auth / IdP | JWT em HttpOnly cookie, `auth.users` técnico              |
| Sessão       | Browser/HTTPS       | HttpOnly + Secure + SameSite                              |
| Autorização  | People-First        | `auth.uid() → people.auth_user_id → tenant_memberships`   |
| Isolamento   | Multi-tenant        | `tenant_id` em relacionamentos, não em entidades globais  |
| RLS          | PostgreSQL          | Policies scoped via cadeia people → memberships → tenants |
| Constraints  | PostgreSQL          | NOT NULL, UNIQUE, CHECK, FK com ON DELETE apropriado      |
| Aplicação    | Frontend/API        | Validação server-side, rate limiting, input sanitization  |

Proteções que **não** pertencem ao PostgreSQL:

❌ HTTP → HTTPS (infraestrutura/CDN)
❌ Rate limiting (WAF/CDN/edge)
❌ DDoS protection (CDN/WAF)
❌ SQL Injection (queries parametrizadas em aplicação, não no schema)
❌ XSS/CSRF (HttpOnly cookie + backend validation, não no banco)
❌ `service_role` exposta (credencial server-side exclusivamente)

### 1.1 Pessoas é a entidade de negócio

```text
auth.users  (Supabase Auth — técnico, NÃO negócio)
     │
     ▼
people   (entidade de negócio)
     │
     ├── tenant_memberships
     │       └── tenant
     │
     ├── candidate_profiles
     │
     └── contact_infos / documents
```

**Regra:** `auth.users` é apenas o mecanismo de autenticação. A entidade de negócio é `people`. Um mesmo `people` pode ter múltiplos vínculos (candidato, empresa, colaborador) sem duplicar identidade.

### 1.2 Multi-tenant

- `tenants` é o escopo de isolamento de dados
- `tenant_memberships` liga `people` ao `tenant` com um `membership_role`
- **NÃO** usar `profiles.role` como critério de acesso — usar `tenant_memberships`

### 1.3 RBAC

```text
roles
     │
     └── role_permissions
             └── permissions
```

- `roles` são específicos de `tenant` (não globais)
- Exemplo: `owner`, `rh_manager`, `recruiter`, `candidate`, `viewer`, `accounting`

### 1.4 LGPD

```text
people_consents
```

Registra todos os consentimentos com versão, timestamp e IP.

### 1.5 Histórico imutável

```text
application_status_history
```

Nunca sobrescrever status — sempre append.

---

## 2. Reconciliação com Schema MySQL Existente

| MySQL existente   | Modelo canônico                                                     | Ação                                      |
| ----------------- | ------------------------------------------------------------------- | ----------------------------------------- |
| `empresa`         | `tenants`                                                           | Renomear + adicionar `tenant_type`        |
| `usuarios`        | `people` + `auth.users`                                             | Desacoplar — `people` é entidade          |
| `usuarios.perfil` | `tenant_memberships.membership_role`                                | Migrar role → membership                  |
| `candidatos`      | `candidate_profiles`                                                | Adicionar `people_id`, `tenant_id`        |
| `colaboradores`   | `people` (contexto interno)                                         | Unificar                                  |
| `clientes`        | `companies` + `company_relationships` (relationship_type: client)   | Unificar em arquitetura de relacionamento |
| `parceiros`       | `companies` + `company_relationships` (relationship_type: partner)  | Unificar em arquitetura de relacionamento |
| `fornecedores`    | `companies` + `company_relationships` (relationship_type: supplier) | Unificar em arquitetura de relacionamento |
| `leads`           | `leads`                                                             | Manter — mas `person_id` opcional         |
| `vagas`           | `jobs`                                                              | Adicionar `tenant_id`                     |
| `candidaturas`    | `applications`                                                      | Adicionar `tenant_id`, histórico imutável |

---

## 3. Modelo Canônico — Tabelas

### 3.1 Tenants

```sql
CREATE TABLE tenants (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(200)  NOT NULL,
    trading_name VARCHAR(100),
    cnpj        VARCHAR(18)   UNIQUE,
    phone       VARCHAR(20),
    email       VARCHAR(255),
    website     VARCHAR(255),
    logo_url    TEXT,
    address     JSONB,
    tenant_type VARCHAR(20)   CHECK (tenant_type IN ('holding', 'juridical_person')),
    is_active   BOOLEAN       DEFAULT TRUE,
    created_at  TIMESTAMP     DEFAULT NOW(),
    updated_at  TIMESTAMP     DEFAULT NOW()
);
```

### 3.2 People (entidade de negócio)

```sql
CREATE TABLE people (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id    UUID,         -- referência a auth.users (opcional — guest candidate)
    full_name       VARCHAR(150)  NOT NULL,
    cpf             VARCHAR(14)   UNIQUE,
    rg              VARCHAR(20),
    birth_date      DATE,
    gender          VARCHAR(20)   CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    status          VARCHAR(20)   DEFAULT 'active'
                                   CHECK (status IN ('active', 'inactive', 'archived')),
    created_at      TIMESTAMP     DEFAULT NOW(),
    updated_at      TIMESTAMP     DEFAULT NOW(),

    -- Índice para lookup por auth
    UNIQUE(auth_user_id)
);
```

### 3.3 People Contacts

```sql
CREATE TABLE people_contacts (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id   UUID          NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    type        VARCHAR(20)   NOT NULL CHECK (type IN ('email', 'phone', 'whatsapp')),
    value       VARCHAR(255)  NOT NULL,
    is_primary  BOOLEAN       DEFAULT FALSE,
    created_at  TIMESTAMP     DEFAULT NOW()
);
```

### 3.4 Tenant Memberships

```sql
CREATE TABLE tenant_memberships (
    id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    person_id           UUID          NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    membership_role     VARCHAR(50)   NOT NULL,  -- 'owner', 'rh_manager', 'recruiter', 'candidate', 'viewer'
    is_primary          BOOLEAN       DEFAULT FALSE,
    joined_at           TIMESTAMP     DEFAULT NOW(),
    left_at             TIMESTAMP,
    created_at          TIMESTAMP     DEFAULT NOW(),

    UNIQUE(tenant_id, person_id),
    UNIQUE(tenant_id, person_id, is_primary) WHERE (is_primary = TRUE)
);
```

### 3.5 People Documents (LGPD)

```sql
CREATE TABLE people_documents (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    person_id       UUID          NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    type            VARCHAR(50)   NOT NULL,  -- 'cpf', 'rg', 'cnh', 'curriculo_pdf', 'contract'
    storage_path    TEXT          NOT NULL,
    file_name       VARCHAR(255)  NOT NULL,
    mime_type       VARCHAR(100),
    size_bytes      BIGINT,
    uploaded_at     TIMESTAMP     DEFAULT NOW()
);
```

### 3.6 Consentimento (LGPD)

```sql
CREATE TABLE people_consents (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID          REFERENCES tenants(id) ON DELETE CASCADE,
    person_id       UUID          NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    consent_type    VARCHAR(50)   NOT NULL,  -- 'data_processing', 'marketing', 'whatsapp', 'curriculum'
    version         VARCHAR(20)   NOT NULL,
    accepted_at     TIMESTAMP     DEFAULT NOW(),
    revoked_at      TIMESTAMP,
    ip_address      INET,
    user_agent      TEXT
);
```

### 3.7 Companies Architecture

Unificação de `clientes`, `parceiros`, `fornecedores` em uma arquitetura de três níveis:

```text
                    companies          (entidade jurídica/comercial)
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
   company_types  company_relationship_types  company_contacts
   (natureza)     (CLIENT/PARTNER/SUPPLIER)    (contatos via people)
```

#### Decisões arquiteturais

| #   | Decisão                                                                                 | Justificativa                                                                                  |
| --- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 1   | `companies` não possui `tenant_id` obrigatório                                          | Empresa é entidade global — pode ser reutilizada por múltiplos tenants                         |
| 2   | `company_type` ≠ `company_relationship_type`                                            | Tipo da empresa (corporation, epp, MEI) ≠ relacionamento comercial (CLIENT, PARTNER, SUPPLIER) |
| 3   | Relacionamento comercial é scoped por `tenant_id`                                       | Mesma empresa pode ser CLIENT de um tenant e PARTNER de outro                                  |
| 4   | `client/partner/supplier` são _relacionamentos_, não _atributos intrínsecos_ da empresa | Uma empresa pode exercer múltiplos papéis simultaneamente                                      |
| 5   | `company_contacts → people`                                                             | Respeita arquitetura People-First — contatos são pessoas do domínio                            |
| 6   | Unicidade: `company + tenant + relationship_type`                                       | Evita duplicação de relacionamento sem limitar papéis múltiplos                                |
| 7   | CNPJ único globalmente                                                                  | Empresa jurídica única — CNPJ não muda por tenant                                              |
| 8   | `cnpj_root` apenas dado técnico                                                         | Matriz/filiaais modelados futuramente se necessário                                            |
| 9   | `internal` não pertence a relationship types                                            | É um contexto organizacional, não um relacionamento comercial                                  |

#### `companies` Table

```sql
CREATE TABLE companies (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identidade jurídica (global)
    legal_name      VARCHAR(200)  NOT NULL,
    trading_name    VARCHAR(100),
    cnpj            VARCHAR(18)   UNIQUE,
    cnpj_root       VARCHAR(15),
    state_registration  VARCHAR(20),
    municipal_registration VARCHAR(20),
    company_type    VARCHAR(20)   NOT NULL CHECK (company_type IN ('corporation','limited_company','epp','mei','nonprofit','government')),
    industry        VARCHAR(100),

    -- Dados comerciais (global)
    phone           VARCHAR(20),
    email           VARCHAR(255),
    website         VARCHAR(255),
    linkedin_url    VARCHAR(255),
    logo_url        TEXT,
    address         JSONB,
    size            VARCHAR(20)   CHECK (size IN ('micro','small','medium','large','enterprise')),

    -- Status da empresa (não é status do relacionamento)
    status          VARCHAR(20)   NOT NULL DEFAULT 'active'
                                   CHECK (status IN ('active','inactive','suspended','pending')),
    is_active       BOOLEAN       NOT NULL DEFAULT TRUE,

    -- Extensibilidade
    metadata        JSONB         NOT NULL DEFAULT '{}'::jsonb,

    -- Auditoria
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    created_by      UUID          REFERENCES people(id)
);
```

#### `company_relationship_types` Table

```sql
CREATE TABLE company_relationship_types (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(20)   NOT NULL UNIQUE,  -- 'client', 'partner', 'supplier'
    name        VARCHAR(100)  NOT NULL,
    description TEXT,
    created_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);
```

#### `company_relationships` Table

```sql
CREATE TABLE company_relationships (
    id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id          UUID          NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    tenant_id           UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    relationship_type_id UUID         NOT NULL REFERENCES company_relationship_types(id),

    -- Status do relacionamento (não da empresa)
    status              VARCHAR(20)   NOT NULL DEFAULT 'active'
                                       CHECK (status IN ('active','inactive','pending','suspended')),

    -- Período do relacionamento
    started_at          TIMESTAMP,
    ended_at            TIMESTAMP,

    -- Contexto
    metadata            JSONB         NOT NULL DEFAULT '{}'::jsonb,
    created_by          UUID          REFERENCES people(id),

    -- Timestamps
    created_at          TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP     NOT NULL DEFAULT NOW(),

    -- Unicidade: uma empresa não pode ter dois relacionamentos do mesmo tipo no mesmo tenant
    UNIQUE (company_id, tenant_id, relationship_type_id)
);

CREATE INDEX idx_company_relationships_company ON company_relationships(company_id);
CREATE INDEX idx_company_relationships_tenant ON company_relationships(tenant_id);
CREATE INDEX idx_company_relationships_type ON company_relationships(relationship_type_id);
```

#### `company_contacts` Table

```sql
CREATE TABLE company_contacts (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID          NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    person_id       UUID          NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    tenant_id       UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    role            VARCHAR(100),              -- 'Financeiro', 'Comercial', 'RH', etc.
    is_primary      BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP     NOT NULL DEFAULT NOW(),

    -- Uma pessoa pode ser contato de uma empresa apenas uma vez por tenant
    UNIQUE (company_id, person_id, tenant_id)
);

CREATE INDEX idx_company_contacts_company ON company_contacts(company_id);
CREATE INDEX idx_company_contacts_person ON company_contacts(person_id);
```

#### RLS — Companies scoped via tenant membership

```text
auth.uid()
    ↓
people.auth_user_id (1:1)
    ↓
tenant_memberships (person belongs to tenant?)
    ↓
company_relationships.tenant_id
    ↓
companies (via company_id)
```

### 3.8 Candidate Profiles

```sql
CREATE TABLE candidate_profiles (
    id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    person_id           UUID          NOT NULL UNIQUE REFERENCES people(id) ON DELETE CASCADE,
    position_interest   VARCHAR(150),
    area_of_activity    VARCHAR(150),
    salary_expectation_min  NUMERIC(10,2),
    salary_expectation_max  NUMERIC(10,2),
    salary_type         VARCHAR(20)   CHECK (salary_type IN ('range', 'monthly', 'negotiate')) DEFAULT 'negotiate',
    availability        VARCHAR(20)   CHECK (availability IN ('immediate', '15_days', '30_days', '90_days')) DEFAULT 'immediate',
    linkedin_url        VARCHAR(255),
    portfolio_url       TEXT,
    cv_file_path        TEXT,  -- storage path
    status              VARCHAR(20)   DEFAULT 'new'
                                   CHECK (status IN ('new', 'screening', 'interview', 'approved', 'talent_pool', 'rejected', 'inactive')),
    created_at          TIMESTAMP     DEFAULT NOW(),
    updated_at          TIMESTAMP     DEFAULT NOW()
);
```

### 3.9 Candidate Education / Experience / Courses / Languages / Skills

```sql
CREATE TABLE candidate_education (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id    UUID          NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    institution     VARCHAR(200)  NOT NULL,
    course          VARCHAR(200)  NOT NULL,
    degree          VARCHAR(50),
    start_date      DATE,
    end_date        DATE,
    completed       BOOLEAN       DEFAULT TRUE,
    created_at      TIMESTAMP     DEFAULT NOW()
);

CREATE TABLE candidate_experience (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id    UUID          NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    company_name    VARCHAR(200)  NOT NULL,
    position        VARCHAR(200)  NOT NULL,
    start_date      DATE,
    end_date        DATE,
    is_current      BOOLEAN       DEFAULT FALSE,
    description     TEXT,
    created_at      TIMESTAMP     DEFAULT NOW()
);

CREATE TABLE candidate_courses (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id    UUID          NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    name            VARCHAR(200)  NOT NULL,
    institution     VARCHAR(200),
    hours           VARCHAR(50),
    completion_date DATE,
    certificate_url TEXT,
    created_at      TIMESTAMP     DEFAULT NOW()
);

CREATE TABLE candidate_languages (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id    UUID          NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    language        VARCHAR(50)   NOT NULL,
    proficiency     VARCHAR(20)   CHECK (proficiency IN ('beginner', 'intermediate', 'advanced', 'fluent', 'native')),
    created_at      TIMESTAMP     DEFAULT NOW(),
    UNIQUE(candidate_id, language)
);

CREATE TABLE skills (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100)  NOT NULL,
    category        VARCHAR(100),
    created_at      TIMESTAMP     DEFAULT NOW(),
    UNIQUE(name, category)
);

CREATE TABLE candidate_skills (
    id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id        UUID          NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    skill_id            UUID          NOT NULL REFERENCES skills(id),
    proficiency_level     VARCHAR(20)   CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced')),
    months_experience     INTEGER,
    last_used_at          DATE,
    created_at            TIMESTAMP     DEFAULT NOW(),
    UNIQUE(candidate_id, skill_id)
);
```

### 3.10 Jobs

```sql
CREATE TABLE jobs (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    company_id      UUID          REFERENCES companies(id),
    title           VARCHAR(200)  NOT NULL,
    slug            VARCHAR(200)  UNIQUE NOT NULL,
    description     TEXT,
    responsibilities TEXT,
    requirements    TEXT,
    benefits        TEXT,
    salary_min      NUMERIC(10,2),
    salary_max      NUMERIC(10,2),
    salary_type     VARCHAR(20)   CHECK (salary_type IN ('range', 'monthly', 'negotiate')) DEFAULT 'negotiate',
    contract_type   VARCHAR(20)   CHECK (contract_type IN ('clt', 'internship', 'temporary', 'freelance', 'contracted', 'cd')) DEFAULT 'clt',
    seniority       VARCHAR(20)   CHECK (seniority IN ('internship', 'junior', 'mid', 'senior', 'master', 'leadership')),
    work_hours      VARCHAR(50),
    work_mode       VARCHAR(20)   CHECK (work_mode IN ('onsite', 'hybrid', 'remote')) DEFAULT 'onsite',
    city            VARCHAR(100),
    state           VARCHAR(2),
    location_detail VARCHAR(255),
    status          VARCHAR(20)   DEFAULT 'draft'
                                   CHECK (status IN ('draft', 'published', 'archived', 'hired', 'expired')),
    views_count     INTEGER       DEFAULT 0,
    applications_count INTEGER    DEFAULT 0,
    published_at    TIMESTAMP,
    expires_at      TIMESTAMP,
    created_at      TIMESTAMP     DEFAULT NOW(),
    updated_at      TIMESTAMP     DEFAULT NOW(),
    UNIQUE(tenant_id, slug)
);
```

### 3.11 Job Skills

```sql
CREATE TABLE job_skills (
    id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id              UUID          NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id            UUID          NOT NULL REFERENCES skills(id),
    required_level      VARCHAR(20)   CHECK (required_level IN ('beginner', 'intermediate', 'advanced')),
    is_required         BOOLEAN       DEFAULT TRUE,
    created_at          TIMESTAMP     DEFAULT NOW(),
    UNIQUE(job_id, skill_id)
);
```

### 3.12 Applications (Candidaturas)

```sql
CREATE TABLE applications (
    id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    job_id              UUID          NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id        UUID          NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    current_stage       VARCHAR(50)   DEFAULT 'submitted'
                                   CHECK (current_stage IN ('submitted', 'screening', 'interview', 'offer', 'hired', 'rejected', 'withdrawn')),
    notes               TEXT,
    applied_at          TIMESTAMP     DEFAULT NOW(),
    updated_at          TIMESTAMP     DEFAULT NOW(),
    UNIQUE(job_id, candidate_id)
);
```

### 3.13 Application Status History (Imutável)

```sql
CREATE TABLE application_status_history (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id  UUID          NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    stage           VARCHAR(50)   NOT NULL,
    previous_stage  VARCHAR(50),
    changed_by      UUID,  -- person_id do recrutador
    reason          TEXT,
    changed_at      TIMESTAMP     DEFAULT NOW()
);
```

### 3.14 Recruitment Processes

```sql
CREATE TABLE recruitment_processes (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    job_id          UUID          REFERENCES jobs(id),
    company_id      UUID          REFERENCES companies(id),
    title           VARCHAR(200),
    stages          JSONB,       -- estrutura customizada de etapas
    status          VARCHAR(20)   DEFAULT 'open'
                                   CHECK (status IN ('open', 'in_progress', 'paused', 'concluded', 'canceled')),
    started_at      DATE,
    ended_at        DATE,
    responsible_id  UUID,  -- person_id
    created_at      TIMESTAMP     DEFAULT NOW(),
    updated_at      TIMESTAMP     DEFAULT NOW()
);

CREATE TABLE interviews (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    process_id      UUID          NOT NULL REFERENCES recruitment_processes(id) ON DELETE CASCADE,
    application_id  UUID          REFERENCES applications(id),
    stage_name      VARCHAR(100),
    scheduled_at    TIMESTAMP,
    location        VARCHAR(255),
    video_link      TEXT,
    status          VARCHAR(20)   DEFAULT 'scheduled'
                                   CHECK (status IN ('scheduled', 'completed', 'canceled', 'rescheduled')),
    notes           TEXT,
    created_at      TIMESTAMP     DEFAULT NOW()
);

CREATE TABLE evaluations (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id    UUID          NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    candidate_id    UUID          NOT NULL REFERENCES candidate_profiles(id),
    criterion       VARCHAR(100),
    score           NUMERIC(3,1),
    notes           TEXT,
    evaluator_id    UUID,
    created_at      TIMESTAMP     DEFAULT NOW()
);
```

### 3.15 Leads

```sql
CREATE TABLE leads (
    id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID          REFERENCES tenants(id) ON DELETE CASCADE,
    person_id           UUID          REFERENCES people(id) ON DELETE SET NULL,
    company_id          UUID          REFERENCES companies(id) ON DELETE SET NULL,
    name                VARCHAR(150),
    company_name        VARCHAR(150),
    email               VARCHAR(255),
    phone               VARCHAR(20),
    source              VARCHAR(50)   CHECK (source IN ('site', 'whatsapp', 'instagram', 'google', 'indication')),
    lead_type           VARCHAR(20)   CHECK (lead_type IN ('client', 'company', 'candidate', 'partner', 'supplier', 'press')),
    message             TEXT,
    utm_source          VARCHAR(100),
    utm_campaign        VARCHAR(100),
    ip_address          INET,
    status              VARCHAR(20)   DEFAULT 'new'
                                   CHECK (status IN ('new', 'contacted', 'qualified', 'proposal_sent', 'converted', 'discarded')),
    created_at          TIMESTAMP     DEFAULT NOW(),
    updated_at          TIMESTAMP     DEFAULT NOW()
);
```

### 3.16 Candidate Favorites

```sql
CREATE TABLE candidate_favorite_jobs (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    candidate_id    UUID          NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    job_id          UUID          NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    created_at      TIMESTAMP     DEFAULT NOW(),
    UNIQUE(candidate_id, job_id)
);
```

### 3.17 Service Catalog

```sql
CREATE TABLE services (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name            VARCHAR(100)  NOT NULL,
    description     TEXT,
    icon            VARCHAR(50),
    category        VARCHAR(50)   CHECK (category IN ('rh', 'facilities', 'combined')),
    service_type    VARCHAR(20)   CHECK (service_type IN ('recovery', 'temporary', 'permanent', 'consulting')),
    base_price      NUMERIC(10,2) DEFAULT 0,
    unit_of_measure VARCHAR(20),
    is_active       BOOLEAN       DEFAULT TRUE,
    created_at      TIMESTAMP     DEFAULT NOW()
);

CREATE TABLE company_services (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID          NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    service_id      UUID          NOT NULL REFERENCES services(id),
    created_at      TIMESTAMP     DEFAULT NOW(),
    UNIQUE(company_id, service_id)
);
```

### 3.18 Contracts

```sql
CREATE TABLE contracts (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    company_id      UUID          REFERENCES companies(id),
    service_id      UUID          REFERENCES services(id),
    contract_number VARCHAR(50)   UNIQUE NOT NULL,
    start_date      DATE          NOT NULL,
    end_date        DATE,
    value           NUMERIC(14,2) DEFAULT 0,
    frequency       VARCHAR(20)   CHECK (frequency IN ('monthly', 'biannual', 'quarterly', 'semiannual', 'annual')) DEFAULT 'monthly',
    status          VARCHAR(20)   DEFAULT 'active'
                                   CHECK (status IN ('active', 'suspended', 'closed', 'canceled')),
    document_url    TEXT,
    notes           TEXT,
    created_at      TIMESTAMP     DEFAULT NOW(),
    updated_at      TIMESTAMP     DEFAULT NOW()
);
```

### 3.19 Communication / WhatsApp

```sql
CREATE TABLE whatsapp_messages (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    phone_number    VARCHAR(20)   NOT NULL,
    message         TEXT          NOT NULL,
    direction       VARCHAR(10)   CHECK (direction IN ('inbound', 'outbound')),
    status          VARCHAR(20)   DEFAULT 'pending'
                                   CHECK (status IN ('pending', 'sent', 'error', 'delivered', 'read')),
    session_id      VARCHAR(100),
    created_at      TIMESTAMP     DEFAULT NOW()
);

CREATE TABLE email_messages (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    recipient       VARCHAR(255)  NOT NULL,
    subject         VARCHAR(255)  NOT NULL,
    body_html       TEXT,
    body_text       TEXT,
    status          VARCHAR(20)   DEFAULT 'sent'
                                   CHECK (status IN ('sent', 'error', 'opened', 'clicked')),
    template_id     VARCHAR(100),
    provider        VARCHAR(50),
    created_at      TIMESTAMP     DEFAULT NOW()
);
```

### 3.20 Automation

```sql
CREATE TABLE automation_events (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name            VARCHAR(100)  NOT NULL,
    event           VARCHAR(100)  NOT NULL,
    channel         VARCHAR(20)   CHECK (channel IN ('email', 'whatsapp', 'integration')),
    is_active       BOOLEAN       DEFAULT TRUE,
    created_at      TIMESTAMP     DEFAULT NOW()
);

CREATE TABLE automation_flows (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id        UUID          NOT NULL REFERENCES automation_events(id) ON DELETE CASCADE,
    step_order      INTEGER       NOT NULL,
    action          VARCHAR(50)   NOT NULL,
    config          JSONB,
    created_at      TIMESTAMP     DEFAULT NOW()
);

CREATE TABLE automation_queue (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    event           VARCHAR(100)  NOT NULL,
    payload         JSONB,
    status          VARCHAR(20)   DEFAULT 'pending'
                                   CHECK (status IN ('pending', 'processing', 'success', 'error')),
    attempts        INTEGER       DEFAULT 0,
    max_attempts    INTEGER       DEFAULT 5,
    next_run        TIMESTAMP,
    error           TEXT,
    created_at      TIMESTAMP     DEFAULT NOW(),
    updated_at      TIMESTAMP     DEFAULT NOW()
);
```

### 3.21 Roles & Permissions (RBAC por tenant)

```sql
CREATE TABLE roles (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name            VARCHAR(50)   NOT NULL,
    description     VARCHAR(255),
    created_at      TIMESTAMP     DEFAULT NOW(),
    UNIQUE(tenant_id, name)
);

CREATE TABLE permissions (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name            VARCHAR(100)  NOT NULL,
    module          VARCHAR(50),
    description     VARCHAR(255),
    created_at      TIMESTAMP     DEFAULT NOW(),
    UNIQUE(tenant_id, name)
);

CREATE TABLE role_permissions (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    role_id         UUID          NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id   UUID          NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    granted_at      TIMESTAMP     DEFAULT NOW(),
    UNIQUE(tenant_id, role_id, permission_id)
);

CREATE TABLE role_user (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    person_id       UUID          NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    role_id         UUID          NOT NULL REFERENCES roles(id),
    assigned_by     UUID,  -- person_id
    assigned_at     TIMESTAMP     DEFAULT NOW(),
    UNIQUE(tenant_id, person_id, role_id)
);
```

### 3.22 Work With Us Submissions

```sql
CREATE TABLE work_with_us_submissions (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    person_id       UUID          REFERENCES people(id) ON DELETE SET NULL,
    position_interest VARCHAR(150),
    area            VARCHAR(100),
    city            VARCHAR(100),
    phone           VARCHAR(20),
    email           VARCHAR(255),
    message         TEXT,
    cv_path         TEXT,
    consent_given   BOOLEAN       DEFAULT FALSE,
    status          VARCHAR(20)   DEFAULT 'new'
                                   CHECK (status IN ('new', 'analyzed', 'converted', 'discarded')),
    created_at      TIMESTAMP     DEFAULT NOW(),
    updated_at      TIMESTAMP     DEFAULT NOW()
);
```

### 3.23 Audit / Logs

```sql
CREATE TABLE audit_logs (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID          REFERENCES tenants(id) ON DELETE SET NULL,
    person_id       UUID          REFERENCES people(id) ON DELETE SET NULL,
    module          VARCHAR(50),
    action          VARCHAR(100),
    details         JSONB,
    ip_address      INET,
    user_agent      TEXT,
    created_at      TIMESTAMP     DEFAULT NOW()
);
```

---

## 4. Views (Dashboard)

```sql
-- Resumo de leads por status/origem
CREATE VIEW vw_dashboard_leads AS
SELECT
    tenant_id,
    status,
    source,
    COUNT(*) as total
FROM leads
GROUP BY tenant_id, status, source;

-- Funnel de candidaturas por vaga
CREATE VIEW vw_dashboard_applications AS
SELECT
    j.tenant_id,
    j.title,
    a.current_stage,
    COUNT(*) as total
FROM applications a
JOIN jobs j ON a.job_id = j.id
GROUP BY j.tenant_id, j.title, a.current_stage;

-- Resumo de empresas
CREATE VIEW vw_dashboard_companies AS
SELECT
    tenant_id,
    company_type,
    status,
    COUNT(*) as total
FROM companies
GROUP BY tenant_id, company_type, status;
```

---

## 5. RLS (Row Level Security)

Todas as tabelas operacionais devem ter `tenant_id` e RLS:

```sql
-- Exemplo para jobs
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant isolation: jobs"
ON jobs FOR ALL
USING (tenant_id = auth.uid()::uuid);  -- ou via função custom

-- Política de escrita: apenas membros do tenant com role adequado
CREATE POLICY "tenant members can insert jobs"
ON jobs FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM tenant_memberships tm
        WHERE tm.tenant_id = jobs.tenant_id
        AND tm.person_id = people_id_from_jwt()  -- função custom
        AND tm.membership_role IN ('owner', 'rh_manager', 'recruiter')
    )
);
```

---

## 6. Reconciliação de Tabelas Existentes

### 6.1 De onde vem cada dado novo?

| Nova tabela          | Origem (MySQL)                              | Observação                                |
| -------------------- | ------------------------------------------- | ----------------------------------------- |
| `tenants`            | `empresa`                                   | Adicionar coluna `tenant_type`            |
| `people`             | `usuarios` + `colaboradores` + `candidatos` | Unificar em uma entidade                  |
| `candidate_profiles` | `candidatos`                                | Remover `usuario_id`, usar `person_id`    |
| `applications`       | `candidaturas`                              | Adicionar `tenant_id`, histórico imutável |
| `jobs`               | `vagas`                                     | Adicionar `tenant_id`                     |
| `companies`          | `clientes` + `parceiros` + `fornecedores`   | Unificar com `company_type`               |
| `leads`              | `leads`                                     | Adicionar `tenant_id`, `person_id`        |
| `automation_queue`   | `fila_automacao`                            | JSONB payload                             |
| `whatsapp_messages`  | `mensagens`                                 | Adicionar `tenant_id`                     |
| `email_messages`     | `emails_enviados`                           | Adicionar `tenant_id`                     |
| `automation_events`  | `eventos_automacao`                         | Migrar                                    |
| `automation_flows`   | `fluxos_automacao`                          | JSONB config                              |
| `services`           | `servicos`                                  | Unificar com `category`                   |
| `contracts`          | `contratos`                                 | Adicionar `tenant_id`                     |

---

## 7. Próximos Passos

1. **Aplicar migrations no Supabase** seguindo a ordem:
   - `01_core.sql` (tenants, people, memberships, documents, consents)
   - `02_candidate.sql` (candidate_profiles, education, experience, courses, languages, skills)
   - `03_company.sql` (companies, company_services, contracts)
   - `04_jobs.sql` (jobs, job_skills, applications, application_status_history)
   - `05_recruitment.sql` (recruitment_processes, interviews, evaluations)
   - `06_crm.sql` (leads, work_with_us_submissions, candidate_favorite_jobs)
   - `07_communication.sql` (whatsapp_messages, email_messages)
   - `08_automation.sql` (automation_events, automation_flows, automation_queue)
   - `09_rbac.sql` (roles, permissions, role_permissions, role_user)
   - `10_audit.sql` (audit_logs)
   - `11_views.sql` (dashboard views)
   - `12_rls.sql` (políticas de row-level security)

2. **Atualizar AuthContext** para usar `people_id` em vez de `user.id` direto

3. **Migrar dados do MySQL** (se houver produção ativa)

4. **Frontend mock preservado** — `mockVagas`, `mockServices`, etc. continuam como fallback

---

## 8. Regra de Proteção

**Nenhuma alteração de schema deve acontecer sem atualizar este documento.**

| Ação             | Aprovação necessária               |
| ---------------- | ---------------------------------- |
| Nova tabela      | ✅ Revisão de arquitetura          |
| Remover coluna   | ❌ Proibido sem análise de impacto |
| Alterar RLS      | ✅ Revisão de segurança            |
| Adicionar índice | ⚠️ Apenas se justificado           |
| Unificar tabelas | ✅ Documentar mapeamento           |

---

## 12. Integrações Externas (Providers ≠ Dados de negócio)

### 12.1 Princípio

```text
Provedores externos  │  Dados de negócio
                     │
Google / LinkedIn    │  people
                     │
WhatsApp / WATI      │  jobs / companies / candidates
                     │
n8n                  │  applications / recruitment_processes
                     │
Google Calendar      │  interviews / calendar_events
                     │
E-mail (SMTP/Resend) │  contacts / notifications
                     │
SMS (Twilio)         │  messages
```

**Regra:** `people` é a identidade de negócio. Provedores são integrações.

### 12.2 Tabela de integrações

```sql
CREATE TABLE integrations (
    id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID          REFERENCES tenants(id) ON DELETE CASCADE,
    integration_type    VARCHAR(50)   NOT NULL,
    provider            VARCHAR(50)   NOT NULL,
    name                VARCHAR(100),
    status              VARCHAR(20)   DEFAULT 'disconnected'
                                   CHECK (status IN ('connected', 'disconnected', 'error')),
    external_account_id VARCHAR(255),
    external_account_name VARCHAR(255),
    scopes              TEXT[],
    configuration       JSONB,
    metadata            JSONB,
    connected_by        UUID          REFERENCES people(id),
    connected_at        TIMESTAMP,
    last_sync_at        TIMESTAMP,
    expires_at          TIMESTAMP,
    created_at          TIMESTAMP     DEFAULT NOW(),
    updated_at          TIMESTAMP     DEFAULT NOW(),
    UNIQUE(tenant_id, integration_type, provider)
);

CREATE TABLE person_external_profiles (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID          REFERENCES tenants(id) ON DELETE CASCADE,
    person_id       UUID          NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    provider        VARCHAR(50)   NOT NULL,
    external_id     VARCHAR(255),
    profile_url     TEXT,
    display_name    VARCHAR(255),
    metadata        JSONB,
    created_at      TIMESTAMP     DEFAULT NOW(),
    UNIQUE(person_id, provider, external_id)
);
```

### 12.3 Fluxo de login

```text
Google / LinkedIn / GitHub
           │
           ▼
     Supabase Auth
           │
           ▼
        people
           │
           ▼
tenant_memberships → tenant → RBAC
```

**Não criar** `users` como entidade de negócio. Não duplicar pessoa para login.

---

## 13. Comunicação Unificada (n8n / WhatsApp / E-mail / SMS)

### 13.1 Princípio

```text
Supabase (fonte de verdade)
   │
   ▼
automation_queue (buffer transacional)
   │
   ▼
n8n (orquestrador)
   │
   ├─ WhatsApp (WATI / Meta)
   ├─ E-mail (SMTP / Resend)
   └─ SMS (Twilio)
```

### 13.2 Canais

```sql
CREATE TABLE communication_channels (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    channel_type    VARCHAR(20)   NOT NULL CHECK (channel_type IN ('whatsapp', 'email', 'sms')),
    provider        VARCHAR(50)   NOT NULL CHECK (provider IN ('wati', 'meta', 'smtp', 'resend', 'twilio', 'n8n')),
    name            VARCHAR(100),
    status          VARCHAR(20)   DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
    configuration   JSONB,
    created_at      TIMESTAMP     DEFAULT NOW(),
    updated_at      TIMESTAMP     DEFAULT NOW()
);
```

### 13.3 Campanhas/Disparos

```sql
CREATE TABLE communication_campaigns (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name            VARCHAR(200)  NOT NULL,
    channel         VARCHAR(20)   NOT NULL,
    subject         VARCHAR(255),
    content         TEXT,
    template_id     UUID,
    status          VARCHAR(20)   DEFAULT 'draft'
                                   CHECK (status IN ('draft', 'scheduled', 'running', 'completed', 'cancelled')),
    scheduled_at    TIMESTAMP,
    started_at      TIMESTAMP,
    completed_at    TIMESTAMP,
    created_by      UUID          REFERENCES people(id),
    created_at      TIMESTAMP     DEFAULT NOW(),
    updated_at      TIMESTAMP     DEFAULT NOW()
);

CREATE TABLE communication_recipients (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id     UUID          NOT NULL REFERENCES communication_campaigns(id) ON DELETE CASCADE,
    person_id       UUID          REFERENCES people(id),
    company_id      UUID          REFERENCES companies(id),
    destination     VARCHAR(255)  NOT NULL,
    status          VARCHAR(20)   DEFAULT 'pending'
                                   CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed', 'cancelled')),
    sent_at         TIMESTAMP,
    delivered_at    TIMESTAMP,
    read_at         TIMESTAMP,
    failed_at       TIMESTAMP,
    error_message   TEXT,
    metadata        JSONB,
    created_at      TIMESTAMP     DEFAULT NOW()
);
```

### 13.4 Templates

```sql
CREATE TABLE message_templates (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name            VARCHAR(100)  NOT NULL,
    channel         VARCHAR(20)   NOT NULL,
    event_type      VARCHAR(50),
    subject         VARCHAR(255),
    content         TEXT          NOT NULL,
    variables       TEXT[],
    status          VARCHAR(20)   DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at      TIMESTAMP     DEFAULT NOW(),
    updated_at      TIMESTAMP     DEFAULT NOW(),
    UNIQUE(tenant_id, name)
);
```

### 13.5 Automation Queue

```sql
CREATE TABLE automation_queue (
    id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    event_type          VARCHAR(100)  NOT NULL,
    entity_type         VARCHAR(50),
    entity_id           UUID,
    channel             VARCHAR(20),
    provider            VARCHAR(50),
    payload             JSONB,
    status              VARCHAR(20)   DEFAULT 'pending'
                                   CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    priority            INTEGER       DEFAULT 10,
    attempts            INTEGER       DEFAULT 0,
    max_attempts        INTEGER       DEFAULT 5,
    available_at        TIMESTAMP     DEFAULT NOW(),
    locked_at           TIMESTAMP,
    processed_at        TIMESTAMP,
    failed_at           TIMESTAMP,
    last_error          TEXT,
    idempotency_key     VARCHAR(255),
    created_at          TIMESTAMP     DEFAULT NOW(),
    updated_at          TIMESTAMP     DEFAULT NOW()
);
```

### 13.6 Delivery Logs

```sql
CREATE TABLE communication_delivery_logs (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    channel         VARCHAR(20)   NOT NULL,
    provider        VARCHAR(50),
    message_id      UUID,
    external_message_id VARCHAR(255),
    person_id       UUID          REFERENCES people(id),
    campaign_id     UUID          REFERENCES communication_campaigns(id),
    status          VARCHAR(20)   NOT NULL
                                   CHECK (status IN ('queued', 'sent', 'delivered', 'read', 'failed', 'cancelled')),
    provider_response JSONB,
    error_code      VARCHAR(50),
    error_message   TEXT,
    sent_at         TIMESTAMP,
    delivered_at    TIMESTAMP,
    read_at         TIMESTAMP,
    failed_at       TIMESTAMP,
    created_at      TIMESTAMP     DEFAULT NOW()
);
```

### 13.7 Webhooks

```sql
CREATE TABLE webhook_events (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID          REFERENCES tenants(id) ON DELETE SET NULL,
    provider        VARCHAR(50)   NOT NULL,
    event_type      VARCHAR(100)  NOT NULL,
    external_event_id VARCHAR(255),
    payload         JSONB,
    signature_valid BOOLEAN       DEFAULT FALSE,
    processing_status VARCHAR(20) DEFAULT 'pending'
                                   CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    processed_at    TIMESTAMP,
    error           TEXT,
    created_at      TIMESTAMP     DEFAULT NOW(),
    UNIQUE(provider, external_event_id)
);
```

---

## 14. Arquivos / Storage

### 14.1 Storage de arquivos

Arquivos físicos no **Supabase Storage (bucket privado)**.

Banco mantém referência:

```sql
CREATE TABLE files (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    owner_person_id UUID          REFERENCES people(id),
    entity_type     VARCHAR(50),
    entity_id       UUID,
    bucket          VARCHAR(100)  NOT NULL,
    storage_path    TEXT          NOT NULL,
    original_name   VARCHAR(255),
    stored_name     VARCHAR(255),
    mime_type       VARCHAR(100),
    extension       VARCHAR(20),
    size_bytes      BIGINT,
    checksum        VARCHAR(255),
    visibility      VARCHAR(20)   DEFAULT 'private'
                                   CHECK (visibility IN ('private', 'tenant', 'public')),
    status          VARCHAR(20)   DEFAULT 'active'
                                   CHECK (status IN ('active', 'deleted')),
    uploaded_by     UUID          REFERENCES people(id),
    created_at      TIMESTAMP     DEFAULT NOW(),
    updated_at      TIMESTAMP     DEFAULT NOW(),
    deleted_at      TIMESTAMP
);
```

### 14.2 Access logs

```sql
CREATE TABLE file_access_logs (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    file_id         UUID          NOT NULL REFERENCES files(id),
    person_id       UUID          REFERENCES people(id),
    action          VARCHAR(20)   NOT NULL CHECK (action IN ('view', 'download', 'upload', 'delete', 'share')),
    ip_address      INET,
    user_agent      TEXT,
    created_at      TIMESTAMP     DEFAULT NOW()
);
```

---

## 15. Eventos de domínio

```sql
CREATE TABLE domain_events (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    event_type      VARCHAR(100)  NOT NULL,
    entity_type     VARCHAR(50),
    entity_id       UUID,
    actor_person_id UUID          REFERENCES people(id),
    payload         JSONB,
    created_at      TIMESTAMP     DEFAULT NOW(),
    processed_at    TIMESTAMP
);
```

Exemplos:

- `candidate.created`
- `candidate.updated`
- `job.published`
- `job.expired`
- `application.created`
- `application.status_changed`
- `interview.scheduled`
- `interview.cancelled`
- `lead.created`
- `lead.converted`
- `contract.created`
- `file.uploaded`
- `file.deleted`

---

## 16. Calendário (n8n + Google Calendar)

```sql
CREATE TABLE calendar_integrations (
    id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    integration_id      UUID          NOT NULL REFERENCES integrations(id),
    calendar_id         VARCHAR(255),
    calendar_name       VARCHAR(255),
    is_default          BOOLEAN       DEFAULT FALSE,
    sync_enabled        BOOLEAN       DEFAULT TRUE,
    created_at          TIMESTAMP     DEFAULT NOW(),
    updated_at          TIMESTAMP     DEFAULT NOW()
);

CREATE TABLE calendar_events (
    id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    integration_id      UUID          REFERENCES integrations(id),
    person_id           UUID          REFERENCES people(id),
    company_id          UUID          REFERENCES companies(id),
    event_type          VARCHAR(50)   NOT NULL CHECK (event_type IN ('interview', 'meeting', 'follow_up', 'appointment', 'recruitment', 'onboarding', 'other')),
    title               VARCHAR(255)  NOT NULL,
    description         TEXT,
    starts_at           TIMESTAMP     NOT NULL,
    ends_at             TIMESTAMP     NOT NULL,
    timezone            VARCHAR(50),
    location            VARCHAR(255),
    meeting_url         TEXT,
    external_event_id   VARCHAR(255),
    external_calendar_id VARCHAR(255),
    status              VARCHAR(20)   DEFAULT 'scheduled'
                                   CHECK (status IN ('scheduled', 'completed', 'canceled', 'rescheduled')),
    metadata            JSONB,
    created_at          TIMESTAMP     DEFAULT NOW(),
    updated_at          TIMESTAMP     DEFAULT NOW()
);
```

---

## 17. Ordem de implementação

```text
GATE-DATA-01
Auditoria do banco atual
        ↓
GATE-DATA-02
Reconciliação MySQL/Postgres
        ↓
GATE-DATA-SAAS-01
Modelo People + Tenant definitivo (este documento)
        ↓
GATE-DATA-01
Schema de integrações / comunicação
        ↓
GATE-DATA-RLS-01
Policies e segurança
        ↓
GATE-DATA-FUNCTIONS-01
Functions / procedures
        ↓
GATE-DATA-TRIGGERS-01
Triggers
        ↓
GATE-DATA-VIEWS-01
Views / dashboards
        ↓
GATE-DATA-SEED-01
Seed inicial
        ↓
GATE-DATA-MIGRATE-01
Migração do MySQL existente
        ↓
GATE-JOBS-01
Frontend começa a consumir Supabase
```

---

*Documento criado em 16/08/2026. Fonte única para arquitectura de dados do J&S Empregos. Atualizado com módulos de integração, comunicação, storage e calendário.
