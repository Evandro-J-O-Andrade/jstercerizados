# Plano de Reconciliação V2.1 → Frontend

**STATUS: PLANEJAMENTO — READ-ONLY**

> Nenhuma migration, alteração de RLS, alteração de código ou deploy deve ser executado sem aprovação posterior.

---

## 1. Contrato canônico de `jobs`

Fonte: `supabase/migrations/20260816000500_jobs.sql`

### Colunas relevantes

| Coluna                    | Tipo            | Obrigatória | Observação                                                                           |
| ------------------------- | --------------- | ----------- | ------------------------------------------------------------------------------------ |
| `id`                      | `uuid`          | ✅          | PK, `gen_random_uuid()`                                                              |
| `tenant_id`               | `uuid`          | ✅          | FK → `tenants(id)`, escopo do tenant                                                 |
| `company_relationship_id` | `uuid`          | ❌          | FK → `company_relationships(id)`, relacionamento comercial com a empresa contratante |
| `title`                   | `varchar(200)`  | ✅          | Título da vaga                                                                       |
| `slug`                    | `varchar(200)`  | ✅          | URL amigável, único por `(tenant_id, slug)`                                          |
| `description`             | `text`          | ❌          | Descrição detalhada                                                                  |
| `responsibilities`        | `text`          | ❌          | Responsabilidades                                                                    |
| `requirements`            | `text`          | ❌          | Requisitos                                                                           |
| `benefits`                | `text`          | ❌          | Benefícios                                                                           |
| `salary_min`              | `numeric(10,2)` | ❌          | Salário mínimo                                                                       |
| `salary_max`              | `numeric(10,2)` | ❌          | Salário máximo                                                                       |
| `salary_type`             | `varchar(20)`   | ❌          | `range` / `monthly` / `negotiate`                                                    |
| `contract_type`           | `varchar(20)`   | ❌          | `clt` / `internship` / `temporary` / `freelance` / `contracted` / `cd`               |
| `seniority`               | `varchar(20)`   | ❌          | `internship` / `junior` / `mid` / `senior` / `master` / `leadership`                 |
| `work_hours`              | `varchar(50)`   | ❌          | Jornada                                                                              |
| `work_mode`               | `varchar(20)`   | ❌          | `onsite` / `hybrid` / `remote`                                                       |
| `city`                    | `varchar(100)`  | ❌          | Cidade                                                                               |
| `state`                   | `varchar(2)`    | ❌          | UF                                                                                   |
| `location_detail`         | `varchar(255)`  | ❌          | Detalhe do local                                                                     |
| `status`                  | `varchar(20)`   | ✅          | `draft` / `published` / `archived` / `hired` / `expired`                             |
| `views_count`             | `integer`       | ✅          | Default `0`                                                                          |
| `applications_count`      | `integer`       | ✅          | Default `0`                                                                          |
| `published_at`            | `timestamptz`   | ❌          | Data de publicação                                                                   |
| `expires_at`              | `timestamptz`   | ❌          | Data de expiração                                                                    |
| `metadata`                | `jsonb`         | ✅          | Default `'{}'::jsonb`                                                                |
| `created_by`              | `uuid`          | ❌          | FK → `people(id)`                                                                    |
| `created_at`              | `timestamptz`   | ✅          | Default `now()`                                                                      |
| `updated_at`              | `timestamptz`   | ✅          | Trigger `update_updated_at()`                                                        |

### Status válidos

| Status      | Público? | Descrição                           |
| ----------- | -------- | ----------------------------------- |
| `draft`     | ❌       | Rascunho, invisível para candidatos |
| `published` | ✅       | Publicada, visível                  |
| `archived`  | ❌       | Arquivada                           |
| `hired`     | ❌       | Preenchida                          |
| `expired`   | ❌       | Expirada                            |

### Regras de publicação

- `published` deve ser o único status visível publicamente
- `draft`, `archived`, `hired`, `expired` devem ser restritos a authenticated/admin
- `published_at` controla quando a vaga aparece
- `expires_at` controla quando a vaga deixa de ser válida

---

## 2. RLS atual

### Policies existentes

#### SELECT

```sql
create policy "Jobs visible to tenant members"
  on public.jobs for select
  using (
    tenant_id IN (
      SELECT tm.tenant_id
      FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );
```

**Comportamento:**

| 角色                           | `auth.uid()` | Resultado                          |
| ------------------------------ | ------------ | ---------------------------------- |
| `anon` (visitante)             | `null`       | ❌ Nenhum tenant encontrado → `[]` |
| `authenticated` sem membership | UUID válido  | ❌ Sem membership → `[]`           |
| `authenticated` com membership | UUID válido  | ✅ Apenas vagas do seu tenant      |
| `service_role`                 | N/A          | ✅ Acesso total                    |

#### INSERT/UPDATE/DELETE

```sql
create policy "Jobs manageable by tenant admins"
  on public.jobs for all
  using (
    tenant_id IN (
      SELECT tm.tenant_id
      FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
        AND tm.membership_role IN ('owner', 'admin', 'manager', 'recruiter')
    )
    OR auth.role() = 'service_role'
  )
  with check (...)
```

**Comportamento:**

| 角色                            | Resultado                 |
| ------------------------------- | ------------------------- |
| `anon`                          | ❌ Sem permissão          |
| `authenticated` comum           | ❌ Sem permissão          |
| `owner/admin/manager/recruiter` | ✅ CRUD no próprio tenant |
| `service_role`                  | ✅ Acesso total           |

### O que uma policy pública precisaria permitir

| Permitir               | Condição                                                  |
| ---------------------- | --------------------------------------------------------- |
| `SELECT` em `jobs`     | `status = 'published'` apenas                             |
| `anon`                 | ✅ Somente leitura de vagas publicadas                    |
| `authenticated`        | ✅ Mesmo comportamento atual para `draft`/`archived`/etc. |
| `INSERT/UPDATE/DELETE` | ❌ Manter como está (somente admins)                      |

### O que NÃO deve ser permitido

- ❌ `anon` lendo `draft`, `archived`, `hired`, `expired`
- ❌ `anon` lendo `company_relationship_id` completo se contiver dados sensíveis
- ❌ Bypass de tenant para usuários autenticados
- ❌ Exposição de `metadata` com dados internos

---

## 3. Reconciliação Frontend × Banco

### Tabela de divergências

| Frontend           | V2.1                                    | Tratamento                                                  | Arquivo afetado                |
| ------------------ | --------------------------------------- | ----------------------------------------------------------- | ------------------------------ |
| `employment_type`  | `contract_type`                         | mapper + labels                                             | `Vagas.tsx`, `VagaDetalhe.tsx` |
| `location`         | `city` + `state` + `location_detail`    | composição                                                  | `Vagas.tsx`, `VagaDetalhe.tsx` |
| `salary`           | `salary_min`/`salary_max`/`salary_type` | formatter/mapper                                            | `Vagas.tsx`, `VagaDetalhe.tsx` |
| `company_id`       | `company_relationship_id`               | mapper                                                      | `Vagas.tsx`, `VagaDetalhe.tsx` |
| `closed_at`        | `expires_at`                            | mapper                                                      | `VagaDetalhe.tsx`              |
| `benefits` (array) | `benefits` (text CSV)                   | split/join                                                  | `Vagas.tsx`, `VagaDetalhe.tsx` |
| `area`             | `metadata.area`                         | extrair de JSONB                                            | `VagaDetalhe.tsx`              |
| `workSchedule`     | `metadata.workSchedule`                 | extrair de JSONB                                            | `VagaDetalhe.tsx`              |
| `workload`         | `metadata.workload`                     | extrair de JSONB                                            | `VagaDetalhe.tsx`              |
| `salarioTipo`      | `salary_type`                           | mapper                                                      | `VagaDetalhe.tsx`              |
| `salarioMax`       | `salary_max`                            | formatter                                                   | `VagaDetalhe.tsx`              |
| `tipoContrato`     | `contract_type`                         | mapper + labels                                             | `Vagas.tsx`, `VagaDetalhe.tsx` |
| `modalidade`       | `work_mode`                             | mapper + labels                                             | `VagaDetalhe.tsx`              |
| `responsibilities` | `responsibilities`                      | ✅ já existe                                                | `VagaDetalhe.tsx`              |
| `requisitos`       | `requirements`                          | ✅ já existe                                                | `VagaDetalhe.tsx`              |
| `descricao`        | `description`                           | ✅ já existe                                                | `VagaDetalhe.tsx`              |
| `empresa`          | não existe diretamente                  | necessário join com `companies` via `company_relationships` | `VagaDetalhe.tsx`              |

### Campos que não existem na tabela `jobs`

| Campo no tipo `Job` | Origem real                             | Decisão                                               |
| ------------------- | --------------------------------------- | ----------------------------------------------------- |
| `company_id`        | `company_relationship_id`               | Alterar tipo para `company_relationship_id` ou mapper |
| `location`          | `city` + `state` + `location_detail`    | Criar getter/computed                                 |
| `salary`            | `salary_min`/`salary_max`/`salary_type` | Criar formatter                                       |
| `employment_type`   | `contract_type`                         | Alterar tipo                                          |
| `closed_at`         | `expires_at`                            | Alterar tipo                                          |
| `company`           | `companies` via join                    | Adicionar relação opcional                            |

### Campos da tabela não usados pelo frontend

| Campo                | Uso atual | Decisão                                                 |
| -------------------- | --------- | ------------------------------------------------------- |
| `views_count`        | ❌        | Manter, útil para analytics                             |
| `applications_count` | ❌        | Manter, útil para dashboard                             |
| `metadata`           | ❌        | Extrair `area`, `workSchedule`, `workload`, `vacancies` |
| `seniority`          | ❌        | Adicionar na UI se necessário                           |
| `work_hours`         | ❌        | Adicionar na UI se necessário                           |

---

## 4. Arquitetura da correção

```text
Supabase V2.1 (jobs)
     ↓
JobRow (tipo cru do banco)
     ↓
Repository (findPublished, findPublishedBySlug)
     ↓
mapJob(row: JobRow): Job (mapeamento de campos)
     ↓
Job (Domain Model)
     ↓
usePublicJobs / usePublicJob
     ↓
Vagas.tsx / VagaDetalhe.tsx
```

### Princípios

1. **Repository** retorna dados crus do Supabase
2. **Mapper** é o único lugar que converte `JobRow` → `Job`
3. **Domain model** (`Job`) não conhece nomes de colunas do banco
4. **Hooks** e **páginas** consomem apenas `Job`
5. **RLS** garante segurança no banco, não no frontend

---

## 5. Alterações por camada

### 5.1 Supabase/RLS

**Nenhuma alteração executada — apenas documentada.**

#### Necessário

```sql
-- Permitir leitura pública de vagas publicadas
CREATE POLICY "Public can view published jobs"
  ON public.jobs
  FOR SELECT
  TO anon, authenticated
  USING (
    status = 'published'
    AND published_at IS NOT NULL
    AND (expires_at IS NULL OR expires_at > now())
  );
```

#### Manter

```sql
-- Policies existentes permanecem
-- "Jobs visible to tenant members"
-- "Jobs manageable by tenant admins"
```

#### Validações necessárias

- [ ] Confirmar que `status = 'published'` é o contrato canônico
- [ ] Confirmar que `published_at` é obrigatório para público
- [ ] Confirmar que `expires_at` é opcional
- [ ] Confirmar que não há view/materialized view para publicação

### 5.2 `jobs.repository.ts`

**Nenhuma alteração executada — apenas documentada.**

#### Alterações necessárias

```ts
// Adicionar tipo cru do banco
interface JobRow {
  id: string;
  tenant_id: string;
  company_relationship_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  responsibilities: string | null;
  requirements: string | null;
  benefits: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_type: string | null;
  contract_type: string | null;
  seniority: string | null;
  work_hours: string | null;
  work_mode: string | null;
  city: string | null;
  state: string | null;
  location_detail: string | null;
  status: JobStatus;
  views_count: number;
  applications_count: number;
  published_at: string | null;
  expires_at: string | null;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// findPublished deve filtrar explicitamente por status
async findPublished(filters?: { search?: string }): Promise<Job[]> {
  if (!this.supabase) return [];
  let query = this.supabase
    .from('jobs')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (filters?.search) query = query.ilike('title', `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(mapJob);
}

// findPublishedBySlug deve filtrar por status
async findPublishedBySlug(slug: string): Promise<Job | null> {
  if (!this.supabase) return null;
  const { data, error } = await this.supabase
    .from('jobs')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
  if (error) throw error;
  return data ? mapJob(data) : null;
}

// Mapper
function mapJob(row: JobRow): Job {
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    company_id: row.company_relationship_id,
    title: row.title,
    description: row.description,
    requirements: row.requirements,
    benefits: row.benefits,
    employment_type: row.contract_type,
    location: [row.city, row.state].filter(Boolean).join(', ') || row.location_detail || null,
    salary: row.salary_type === 'range'
      ? `${formatCurrency(row.salary_min)} – ${formatCurrency(row.salary_max)}`
      : row.salary_type === 'monthly'
        ? `${formatCurrency(row.salary_min)}/mês`
        : 'A combinar',
    status: row.status,
    published_at: row.published_at,
    closed_at: row.expires_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    company: undefined,
    applicationsCount: row.applications_count,
  };
}
```

### 5.3 Tipos TypeScript

**Nenhuma alteração executada — apenas documentada.**

#### Alterações necessárias

```ts
// src/types/domain/job.ts

// Adicionar tipo cru do banco
export interface JobRow {
  id: string;
  tenant_id: string;
  company_relationship_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  responsibilities: string | null;
  requirements: string | null;
  benefits: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_type: string | null;
  contract_type: string | null;
  seniority: string | null;
  work_hours: string | null;
  work_mode: string | null;
  city: string | null;
  state: string | null;
  location_detail: string | null;
  status: JobStatus;
  views_count: number;
  applications_count: number;
  published_at: string | null;
  expires_at: string | null;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Manter Job como Domain Model
export interface Job {
  id: string;
  tenant_id: string;
  company_id: string | null;
  title: string;
  description: string | null;
  requirements: string | null;
  benefits: string | null;
  employment_type: string | null;
  location: string | null;
  salary: string | null;
  status: JobStatus;
  published_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  company?: Database['public']['Tables']['companies']['Row'];
  applicationsCount?: number;
}
```

### 5.4 Mapper

**Nenhuma alteração executada — apenas documentada.**

```ts
// src/repositories/jobs.mapper.ts (novo arquivo)
import type { Job, JobRow, EmploymentType } from '@/types/domain/job';

const CONTRACT_LABELS: Record<string, EmploymentType> = {
  clt: 'CLT',
  internship: 'ESTAGIO',
  temporary: 'TEMPORARIO',
  freelance: 'FREELA',
  contracted: 'TERCEIRIZADO',
  cd: 'CD',
};

const WORK_MODE_LABELS: Record<string, string> = {
  onsite: 'Presencial',
  hybrid: 'Híbrido',
  remote: 'Remoto',
};

function formatCurrency(value: number | null): string {
  if (value === null) return '';
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function mapJob(row: JobRow): Job {
  const contractType = row.contract_type || '';
  const employmentType =
    contractType in CONTRACT_LABELS
      ? CONTRACT_LABELS[contractType]
      : contractType || null;

  const city = row.city || '';
  const state = row.state || '';
  const locationDetail = row.location_detail || '';
  const location =
    [city, state].filter(Boolean).join(', ') || locationDetail || null;

  let salary: string | null = null;
  if (
    row.salary_type === 'range' &&
    row.salary_min != null &&
    row.salary_max != null
  ) {
    salary = `${formatCurrency(row.salary_min)} – ${formatCurrency(row.salary_max)}`;
  } else if (row.salary_type === 'monthly' && row.salary_min != null) {
    salary = `${formatCurrency(row.salary_min)}/mês`;
  } else {
    salary = 'A combinar';
  }

  return {
    id: row.id,
    tenant_id: row.tenant_id,
    company_id: row.company_relationship_id,
    title: row.title,
    description: row.description,
    requirements: row.requirements,
    benefits: row.benefits,
    employment_type: employmentType,
    location,
    salary,
    status: row.status,
    published_at: row.published_at,
    closed_at: row.expires_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    applicationsCount: row.applications_count,
  };
}
```

### 5.5 `useJobs`

**Nenhuma alteração executada — apenas documentada.**

#### Alterações necessárias

```ts
// findPublished deve usar mapJob no retorno
jobsRepository.findPublished(filters).then((data) => {
  if (!cancelled) setItems(data); // data já mapeada
});

// usePublicJob deve usar mapJob no retorno
jobsRepository.findPublishedBySlug(slug).then((data) => {
  if (!cancelled) setItem(data); // data já mapeada
});
```

### 5.6 `/vagas`

**Nenhuma alteração executada — apenas documentada.**

#### Campos que precisam de ajuste na UI

| Campo atual            | Novo campo após mapper                                           | Ação                |
| ---------------------- | ---------------------------------------------------------------- | ------------------- |
| `vaga.employment_type` | `vaga.employment_type` (mapeado de `contract_type`)              | ✅ atualizar labels |
| `vaga.location`        | `vaga.location` (composição de `city`/`state`/`location_detail`) | ✅ usar direto      |
| `vaga.salary`          | `vaga.salary` (formatado de `salary_min`/`salary_max`)           | ✅ usar direto      |
| `vaga.benefits`        | `vaga.benefits` (text CSV)                                       | ✅ manter split     |
| `vaga.published_at`    | `vaga.published_at`                                              | ✅ manter           |

### 5.7 `/vagas/:slug`

**Nenhuma alteração executada — apenas documentada.**

#### Campos que precisam de ajuste na UI

| Campo atual            | Novo campo após mapper       | Ação                       |
| ---------------------- | ---------------------------- | -------------------------- |
| `vaga.titulo`          | `vaga.title`                 | ✅ alterar                 |
| `vaga.descricao`       | `vaga.description`           | ✅ alterar                 |
| `vaga.requisitos`      | `vaga.requirements`          | ✅ alterar                 |
| `vaga.beneficios`      | `vaga.benefits`              | ✅ manter split            |
| `vaga.empresa`         | não existe diretamente       | ⚠️ necessário join         |
| `vaga.area`            | `vaga.metadata.area`         | ⚠️ extrair                 |
| `vaga.workSchedule`    | `vaga.metadata.workSchedule` | ⚠️ extrair                 |
| `vaga.workload`        | `vaga.metadata.workload`     | ⚠️ extrair                 |
| `vaga.salarioMin`      | não existe                   | ⚠️ usar `salary` formatado |
| `vaga.salarioTipo`     | não existe                   | ❌ remover                 |
| `vaga.salarioMax`      | não existe                   | ❌ remover                 |
| `vaga.cidade`/`estado` | `vaga.location`              | ✅ usar composição         |
| `vaga.modalidade`      | `vaga.work_mode`             | ⚠️ adicionar mapper        |
| `vaga.tipoContrato`    | `vaga.employment_type`       | ✅ atualizar labels        |

---

## 6. Segurança

### Garantias

| Item                      | Regra                                                            |
| ------------------------- | ---------------------------------------------------------------- |
| `draft`                   | Nunca exposto publicamente                                       |
| `archived`                | Nunca exposto publicamente                                       |
| `hired`                   | Nunca exposto publicamente                                       |
| `expired`                 | Nunca exposto publicamente                                       |
| Bypass de tenant          | Mantido via RLS para authenticated                               |
| Dados privados da empresa | `company_relationship_id` não expõe dados sensíveis diretamente  |
| `service_role`            | Nunca usado no frontend                                          |
| `metadata`                | Não exposto diretamente na UI; extrair apenas campos necessários |

### Validações

- [ ] Policy pública restringe a `status = 'published'`
- [ ] Policy existente para tenant members permanece intacta
- [ ] RLS não é desativado em `jobs`
- [ ] Frontend não faz bypass de RLS via Service Role
- [ ] `metadata` não é serializado diretamente no JSON de resposta

---

## 7. Critérios de aceite

### 7.1 `/vagas`

| Critério          | Esperado                                      |
| ----------------- | --------------------------------------------- |
| `GET /vagas`      | Lista 17 vagas publicadas reais do Supabase   |
| Filtros           | Funcionam corretamente                        |
| Estado vazio      | Exibe mensagem amigável quando não há vagas   |
| Erro              | Exibe mensagem amigável quando Supabase falha |
| Visitante anônimo | Consegue ver vagas publicadas                 |

### 7.2 `/vagas/:slug`

| Critério           | Esperado                     |
| ------------------ | ---------------------------- |
| `GET /vagas/:slug` | Vaga correta com dados reais |
| Slug inexistente   | 404                          |
| Slug não publicado | 404                          |
| Erro Supabase      | Estado de erro amigável      |

### 7.3 Segurança

| Critério        | Esperado                                 |
| --------------- | ---------------------------------------- |
| `anon`          | Somente vagas com `status = 'published'` |
| `authenticated` | Comportamento correto conforme RBAC/RLS  |
| `service_role`  | Não exposto no frontend                  |

### 7.4 Não afetados

| Item         | Esperado             |
| ------------ | -------------------- |
| `/login`     | Continua funcionando |
| `/dashboard` | Continua funcionando |
| AuthContext  | Não alterado         |
| Cinema       | Não alterado         |
| Seed         | Não alterado         |

---

## 8. Plano de implementação em ordem segura

### FASE 0 — Documentação

- [x] Gerar este documento
- [ ] Revisar com stakeholders
- [ ] Aprovar antes de qualquer alteração

### FASE 1 — Validar schema/RLS V2.1

- [ ] Confirmar `jobs.status` e valores válidos
- [ ] Confirmar política existente
- [ ] Confirmar `tenant_id`, `published_at`, `expires_at`
- [ ] Confirmar `company_relationship_id`
- [ ] Confirmar RLS atual
- [ ] Documentar policy pública necessária

### FASE 2 — Corrigir contrato TypeScript

- [ ] Adicionar `JobRow` (tipo cru do banco)
- [ ] Revisar `Job` (domain model)
- [ ] Atualizar `JobCreateInput`/`JobUpdateInput` se necessário

### FASE 3 — Implementar mapper

- [ ] Criar `jobs.mapper.ts`
- [ ] Implementar `mapJob()`
- [ ] Implementar formatters (`formatCurrency`, `formatLocation`, etc.)
- [ ] Implementar labels (`CONTRACT_LABELS`, `WORK_MODE_LABELS`)

### FASE 4 — Corrigir repository

- [ ] Aplicar `findPublished()` com filtro `status = 'published'`
- [ ] Aplicar `findPublishedBySlug()` com filtro `status = 'published'`
- [ ] Integrar `mapJob()` nos métodos públicos
- [ ] Manter métodos autenticados intactos

### FASE 5 — Ajustar RLS

- [ ] Aplicar migration com policy pública
- [ ] Validar que apenas `published` é exposto
- [ ] Validar que policies existentes permanecem

### FASE 6 — Validar `/vagas`

- [ ] Local: `/vagas` lista 17 vagas
- [ ] Local: filtros funcionam
- [ ] Local: estado vazio funciona
- [ ] Local: erro funciona

### FASE 7 — Validar `/vagas/:slug`

- [ ] Local: slug existente + publicado → página
- [ ] Local: slug inexistente → 404
- [ ] Local: slug não publicado → 404
- [ ] Local: erro → estado amigável

### FASE 8 — Validar login/dashboard

- [ ] Login continua funcionando
- [ ] Dashboard continua funcionando
- [ ] AuthContext não alterado

### FASE 9 — Build

- [ ] `npm run build` sem erros
- [ ] `npx tsc --noEmit` sem erros
- [ ] `npx vitest run` passa

### FASE 10 — Deploy

- [ ] Commit + push
- [ ] Cloudflare deploy
- [ ] Testar `/vagas` em produção
- [ ] Testar `/login` em produção
- [ ] Testar `/` (Cinema)

---

## Anexos

### A. Arquivos afetados

| Arquivo                                                     | Camada     | Alteração                                    |
| ----------------------------------------------------------- | ---------- | -------------------------------------------- |
| `src/types/domain/job.ts`                                   | Tipos      | Adicionar `JobRow`, revisar `Job`            |
| `src/repositories/jobs.repository.ts`                       | Repository | Corrigir `findPublished`, adicionar `mapJob` |
| `src/repositories/jobs.mapper.ts`                           | Mapper     | Novo arquivo                                 |
| `src/hooks/useJobs.ts`                                      | Hook       | Usar dados mapeados                          |
| `src/pages/Vagas.tsx`                                       | UI         | Atualizar campos                             |
| `src/pages/VagaDetalhe.tsx`                                 | UI         | Atualizar campos                             |
| `supabase/migrations/YYYYMMDDHHMMSS_public_jobs_policy.sql` | RLS        | Nova policy                                  |

### B. Arquivos NÃO afetados

| Arquivo                                         | Motivo                        |
| ----------------------------------------------- | ----------------------------- |
| `src/contexts/AuthContext.tsx`                  | Congelado                     |
| `src/pages/Login.tsx`                           | Congelado                     |
| `src/App.tsx`                                   | Congelado                     |
| `src/components/sections/CinematicShowcase.tsx` | Congelado                     |
| `src/contexts/IntroContext.tsx`                 | Congelado                     |
| `src/services/mock/vagas.ts`                    | Manter até validação completa |
| Supabase seed                                   | Não mexer                     |

---

**Fim do documento**
