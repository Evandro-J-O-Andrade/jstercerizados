# Fase 2 — Auditoria e Reconciliacao Código × Banco

## 1. Objetivo

Definir a fonte de verdade operacional e mapear cada domínio do projeto para:

- código existente,
- estado no Supabase,
- ação correta antes de migrar páginas para dados reais.

## 2. Fonte de verdade

| Camada                             | Função                              |
| ---------------------------------- | ----------------------------------- |
| `Supabase V2.1`                    | Fonte de verdade operacional        |
| `src/repositories/`                | Acesso oficial ao Supabase          |
| `src/hooks/`                       | Camada de dados para componentes    |
| `src/mock/` e `src/services/mock/` | Temporário — não é fonte de verdade |
| Páginas públicas (`src/pages/`)    | Consumidoras — devem ser migradas   |
| Dashboard (`src/pages/dashboard/`) | Consumidoras — já em migração       |

## 3. Regras de proteção

- Não remover conteúdo editorial existente.
- Não substituir textos boas por placeholders.
- Não inventar dados para evitar empty state.
- Não misturar domínios (ex.: `people` ≠ RH).
- Seed deve ser idempotente (`ON CONFLICT DO UPDATE`).
- Nenhuma credencial no seed nem no repositório.

## 4. Matriz Código × Banco × Estado × Ação

### 4.1 Identidade / Auth

| Código                          | Banco                                                                                    | Estado                | Ação                                                   |
| ------------------------------- | ---------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------ |
| `AuthContext.tsx`               | `auth.users`, `people`, `tenant_memberships`, `roles`, `permissions`, `role_assignments` | Conectado e funcional | **Manter baseline**                                    |
| `src/hooks/` (sem hook de auth) | —                                                                                        | —                     | Não criar hook de auth; `AuthContext` é a fonte        |
| `src/mock/auth.ts`              | —                                                                                        | Mock legado           | **Remover após migração das páginas que ainda o usam** |

### 4.2 Recrutamento

| Código                                       | Banco                       | Estado                              | Ação                                           |
| -------------------------------------------- | --------------------------- | ----------------------------------- | ---------------------------------------------- |
| `jobs.repository.ts`                         | `jobs`                      | Conectado                           | **Manter** — 17 vagas já existem no banco      |
| `useJobs` hook                               | `jobs` via repository       | Existente, não usado pelo dashboard | **Adotar** nas páginas do dashboard            |
| `src/services/mock/vagas.ts`                 | —                           | 16 vagas hardcoded                  | **Migrar** — extrair conteúdo editorial → seed |
| `src/pages/Vagas.tsx`                        | —                           | Usa mock                            | **Conectar** a `useJobs()`                     |
| `src/pages/VagaDetalhe.tsx`                  | —                           | Usa mock                            | **Conectar** a repository + mini-landpage      |
| `src/pages/dashboard/Vagas.tsx`              | `jobs` via repository       | Conectado                           | **Manter** — adotar `useJobs()`                |
| `candidates.repository.ts`                   | `candidates`                | Conectado                           | **Manter**                                     |
| `useCandidates` hook                         | `candidates` via repository | Existente, não usado pelo dashboard | **Adotar** nas páginas do dashboard            |
| `src/services/mock/curriculos.ts`            | —                           | localStorage                        | **Migrar** — candidatos devem vir do Supabase  |
| `src/pages/Candidatos.tsx`                   | —                           | Estático                            | **Conectar** a `useCandidates()`               |
| `src/pages/TrabalheConosco.tsx`              | Supabase                    | Conectado                           | **Manter**                                     |
| `recruitment-processes.repository.ts`        | `recruitment_processes`     | Conectado                           | **Manter**                                     |
| `src/pages/dashboard/ProcessosSeletivos.tsx` | `recruitment_processes`     | Conectado                           | **Manter**                                     |

### 4.3 Empresas / CRM

| Código                              | Banco                      | Estado                                     | Ação                                                                        |
| ----------------------------------- | -------------------------- | ------------------------------------------ | --------------------------------------------------------------------------- |
| `companies.repository.ts`           | `companies`                | Conectado                                  | **Manter** — 0 empresas no banco atual                                      |
| `useCompanies` hook                 | `companies` via repository | Existente, não usado pelo dashboard        | **Adotar** nas páginas do dashboard                                         |
| `src/mock/clients.ts`               | —                          | 4 clientes mockados                        | **Reconciliar** — mapear para `companies` + relação `clients`               |
| `src/mock/company.ts`               | —                          | Dados editoriais J&S                       | **Separar** — manter como conteúdo institucional, não como dado operacional |
| `src/services/mock/clientes.ts`     | —                          | localStorage (`jst_budgets`)               | **Migrar** — `companies` + relacionamentos                                  |
| `src/services/mock/parceiros.ts`    | —                          | localStorage (`jst_partners`)              | **Migrar** — `partners` table                                               |
| `src/services/mock/fornecedores.ts` | —                          | localStorage (`jst_suppliers`)             | **Migrar** — `suppliers` table                                              |
| `partners.repository.ts`            | `partners`                 | Conectado                                  | **Manter**                                                                  |
| `suppliers.repository.ts`           | `suppliers`                | Conectado                                  | **Manter**                                                                  |
| `leads.repository.ts`               | `leads`                    | Conectado, não usado                       | **Adotar** no módulo CRM                                                    |
| `src/pages/Empresas.tsx`            | —                          | Usa mock `CLIENTS_LIST` e `PARTNERS_LOGOS` | **Conectar** a repositories reais                                           |
| `src/pages/Clientes.tsx`            | —                          | Mock                                       | **Conectar** a `companiesRepository` com filtro                             |
| `src/pages/Parceiros.tsx`           | —                          | Mock service                               | **Conectar** a `partnersRepository`                                         |
| `src/pages/Fornecedores.tsx`        | —                          | Mock service                               | **Conectar** a `suppliersRepository`                                        |

### 4.4 Serviços

| Código                             | Banco            | Estado                | Ação                                      |
| ---------------------------------- | ---------------- | --------------------- | ----------------------------------------- |
| `services.repository.ts`           | `service_orders` | Conectado             | **Manter**                                |
| `src/services/mock/services.ts`    | —                | 20 serviços hardcoded | **Migrar** — extrair conteúdo → seed      |
| `src/pages/Servicos.tsx`           | —                | Usa mock              | **Conectar** a `servicesRepository`       |
| `src/pages/ServicoDetalhe.tsx`     | —                | Usa mock              | **Conectar** a repository + mini-landpage |
| `src/pages/dashboard/Servicos.tsx` | `service_orders` | Conectado             | **Manter**                                |

### 4.5 Financeiro

| Código                                 | Banco                    | Estado              | Ação       |
| -------------------------------------- | ------------------------ | ------------------- | ---------- |
| `financial-transactions.repository.ts` | `financial_transactions` | Conectado           | **Manter** |
| `src/pages/dashboard/Financeiro.tsx`   | `financial_transactions` | Conectado           | **Manter** |
| `src/mock/`                            | —                        | Sem mock financeiro | —          |

### 4.6 Estoque

| Código                            | Banco             | Estado    | Ação       |
| --------------------------------- | ----------------- | --------- | ---------- |
| `stock-movements.repository.ts`   | `stock_movements` | Conectado | **Manter** |
| `src/pages/dashboard/Estoque.tsx` | `stock_movements` | Conectado | **Manter** |

### 4.7 Suporte

| Código                            | Banco                         | Estado         | Ação                                      |
| --------------------------------- | ----------------------------- | -------------- | ----------------------------------------- |
| `support-tickets.repository.ts`   | `support_tickets`             | Conectado      | **Manter**                                |
| `useRealtimeChat` hook            | `chat_rooms`, `chat_messages` | Conectado      | **Manter**                                |
| `src/pages/Suporte.tsx`           | —                             | Estático + n8n | **Conectar** a `supportTicketsRepository` |
| `src/pages/dashboard/Suporte.tsx` | `support_tickets`             | Conectado      | **Manter**                                |

### 4.8 RH / Usuários

| Código                             | Banco    | Estado         | Ação       |
| ---------------------------------- | -------- | -------------- | ---------- |
| `users.repository.ts`              | `people` | Conectado      | **Manter** |
| `src/pages/dashboard/Usuarios.tsx` | `people` | Conectado      | **Manter** |
| `src/mock/`                        | —        | Sem mock de RH | —          |

### 4.9 Conteúdo editorial / Marketing

| Código                     | Banco | Estado            | Ação                                                                |
| -------------------------- | ----- | ----------------- | ------------------------------------------------------------------- |
| `src/mock/home.ts`         | —     | Conteúdo estático | **Seed opcional** — tabela `site_content` ou manter como constantes |
| `src/mock/services.ts`     | —     | 6 serviços        | **Migrar** para `service_categories` + `services`                   |
| `src/mock/testimonials.ts` | —     | 4 depoimentos     | **Seed opcional** — tabela `testimonials`                           |
| `src/mock/partners.ts`     | —     | 6 parceiros       | **Reconciliar** com `partners` table                                |
| `src/mock/company.ts`      | —     | Timeline, equipe  | **Manter como conteúdo institucional** — não é dado operacional     |
| `src/pages/Blog.tsx`       | —     | Hardcoded         | **Seed opcional** — tabela `blog_posts`                             |

## 5. Domínios com tabela mas sem repository/página

| Domínio        | Tabela                                              | Repository            | Página | Ação                                               |
| -------------- | --------------------------------------------------- | --------------------- | ------ | -------------------------------------------------- |
| Applications   | `applications`                                      | ❌                    | ❌     | **Criar** `ApplicationsRepository` + mini-landpage |
| Skills         | `skills`                                            | ❌                    | ❌     | **Criar** `SkillsRepository` + seed canônico       |
| Candidate docs | `candidate_documents`, `candidate_experience`, etc. | ❌                    | ❌     | **Criar** quando necessário                        |
| Chat           | `chat_rooms`, `chat_messages`                       | ❌ (usa raw Supabase) | ❌     | **Criar** `ChatRepository` ou manter hook atual    |
| Audit          | `audit_log`                                         | ❌                    | ❌     | **Criar** quando necessário                        |

## 6. Conteúdo editorial a preservar

Estes conteúdos existem nos mocks e devem ser preservados durante a migração:

### Vagas (src/services/mock/vagas.ts)

- 16 vagas com títulos, descrições, locais, tipos, salários
- Ação: seed idempotente em `jobs` com `tenant_id` canônico

### Serviços (src/services/mock/services.ts)

- 6 serviços: Segurança, Portaria, Limpeza, Jardinagem, Facilities, Terceirização
- Ação: seed em `service_categories` + `services`

### Clientes (src/mock/clients.ts)

- 4 clientes com nome, logo, website, descrição
- Ação: seed em `companies` com relacionamento `clients`

### Parceiros (src/mock/partners.ts)

- 6 parceiros com logos
- Ação: reconciliar com `partners` table

### Fornecedores (src/mock/fornecedores.ts)

- Dados em localStorage
- Ação: migrar para `suppliers` table

### Conteúdo institucional (src/mock/company.ts)

- Timeline, equipe, valores
- Ação: manter como constantes ou seed em tabela `site_content`

## 7. Plano de execução

### Fase 2.1 — Reconciliar conteúdo editorial

1. Extrair conteúdo dos mocks para seeds idempotentes
2. Criar migration/seed para `jobs`, `services`, `companies`, `partners`, `suppliers`
3. Aplicar seed no Supabase
4. Validar dados no banco

### Fase 2.2 — Hooks de dados

1. Garantir que `useJobs`, `useCompanies`, `useCandidates` estão prontos
2. Criar hooks faltantes (`usePartners`, `useSuppliers`, `useServices`, etc.)
3. Padronizar interface: `{ data, isLoading, error, refetch }`

### Fase 2.3 — Migrar páginas públicas

1. `/vagas` → `useJobs()`
2. `/vagas/:slug` → repository + mini-landpage
3. `/empresas` → `useCompanies()`
4. `/clientes` → `useCompanies()` com filtro
5. `/parceiros` → `usePartners()`
6. `/fornecedores` → `useSuppliers()`
7. `/servicos` → `useServices()`
8. `/servicos/:slug` → repository + mini-landpage
9. Home → `useJobs()` para vagas em destaque

### Fase 2.4 — Mini-landpages

1. `/recrutamento/vagas/:id`
2. `/recrutamento/candidatos/:id`
3. `/empresas/:id`
4. `/servicos/:id`

### Fase 2.5 — Dashboard Master

1. Conectar `VisaoGeral` aos hooks
2. Garantir que cada módulo do dashboard usa repository correto
3. Implementar filtros, busca, paginação

## 8. Tarefas imediatas

- [ ] Criar seed idempotente para vagas (`jobs`)
- [ ] Criar seed idempotente para serviços (`service_categories` + `services`)
- [ ] Criar seed idempotente para empresas/clientes (`companies`)
- [ ] Criar seed idempotente para parceiros (`partners`)
- [ ] Criar seed idempotente para fornecedores (`suppliers`)
- [ ] Adotar hooks existentes nas páginas do dashboard
- [ ] Migrar página `/vagas` para `useJobs()`
- [ ] Migrar página `/empresas` para `useCompanies()`
