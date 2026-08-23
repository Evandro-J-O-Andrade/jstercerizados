# AUDITORIA DAS ABAS DO DASHBOARD — FASE V2.1

**Data:** 2026-08-22  
**Branch:** `feat/database-v21-local-rebuild`  
**Commit base:** `46d7cac`  
**Status:** Somente leitura / sem alterações de código

---

## 1. ESCOPO

Auditar as abas do `Dashboard.tsx` que estão **não implementadas** ou com implementação insuficiente:

- `vagas`
- `usuarios`
- `relatorios`

E verificar reaproveitamento de código existente no frontend.

---

## 2. ESTADO ATUAL NO DASHBOARD

### Código atual (`src/pages/Dashboard.tsx`)

```typescript
function renderTable() {
  switch (activeTab) {
    case 'clientes':
      /* ... */ break;
    case 'parceiros':
      /* ... */ break;
    case 'fornecedores':
      /* ... */ break;
    case 'curriculos':
      /* ... */ break;
    case 'vagas': // ❌ não implementado
    case 'usuarios': // ❌ não implementado
    case 'relatorios': // ❌ não implementado
    default:
      return null;
  }
}
```

**Nenhuma das três abas possui conteúdo no Dashboard atual.**

---

## 3. ABA `vagas`

### 3.1 O que existe no frontend

| Arquivo                               | Tipo               | Status                   |
| ------------------------------------- | ------------------ | ------------------------ |
| `src/pages/Vagas.tsx`                 | Página pública     | ✅ UI completa, mockada  |
| `src/pages/VagaDetalhe.tsx`           | Página pública     | ✅ UI completa           |
| `src/pages/DivulgarVaga.tsx`          | Formulário público | ✅ UI completa           |
| `src/services/mock/vagas.ts`          | Mock               | ✅ Dados mockados        |
| `src/types/common.ts`                 | Tipos              | ✅ Inclui `Job`          |
| `src/hooks/useJobs.ts`                | Hook real          | ✅ Integrado ao Supabase |
| `src/repositories/jobs.repository.ts` | Repository         | ✅ Implementado          |

### 3.2 Mapeamento V2.1

| Conceito Dashboard                                        | Entidade V2.1  | Tabela         | Prontidão |
| --------------------------------------------------------- | -------------- | -------------- | --------- |
| Lista de vagas                                            | `jobs`         | `jobs`         | 🟡        |
| Filtros (cidade, estado, área, tipo, modalidade, salário) | `jobs`         | `jobs`         | 🟡        |
| Status da vaga                                            | `jobs.status`  | `jobs`         | 🟢        |
| Empresa da vaga                                           | `companies`    | `companies`    | 🟡        |
| Candidaturas por vaga                                     | `applications` | `applications` | 🟡        |
| Ações (ver/editar/excluir)                                | RPCs           | Functions      | 🔴        |

### 3.3 Diferenças entre página pública e Dashboard

| Aspecto | Página pública (`Vagas.tsx`)                                 | Dashboard (necessário)                       |
| ------- | ------------------------------------------------------------ | -------------------------------------------- |
| Público | Sim                                                          | Não — apenas admin/RH                        |
| Filtros | Busca, cidade, estado, área, tipo, modalidade, salário, data | Mesmos + status, empresa, data de publicação |
| Ações   | Ver vaga, Candidatar-se                                      | Ver, Editar, Excluir, Publicar, Encerrar     |
| Criação | Não                                                          | Sim (`DivulgarVaga` integrado)               |
| Mock    | Sim (`mockGetVagas`)                                         | Não — Supabase real                          |
| Dados   | Todos os usuários                                            | Tenant-scoped                                |

### 3.4 O que pode ser reaproveitado

**UI preservável:**

- Layout de cards de vaga
- Filtros visuais
- Animações
- Tipografia
- Estados vazios

**Código reaproveitável:**

- `useJobs.ts` — hook já conectado
- `jobs.repository.ts` — repository já implementado
- Tipos de `Job` em `src/types/`

**Não reaproveitável:**

- `mockGetVagas()` — deve ser removido
- Filtros hardcoded em `Vagas.tsx` — precisam ser parametrizados

### 3.5 Gaps para fechar

| #   | Gap                                                                | Prioridade |
| --- | ------------------------------------------------------------------ | ---------- |
| 1   | Repository de `jobs` já existe, mas falta integrar no Dashboard    | Alta       |
| 2   | Hook `useJobs` existe, mas falta parametrizar filtros do Dashboard | Alta       |
| 3   | Faltam RPCs: `publish_job()`, `close_job()`, `update_job()`        | Alta       |
| 4   | Falta mapear ações do Dashboard (ver/editar/excluir)               | Média      |
| 5   | Falta filtro por `company_id` no repository                        | Média      |
| 6   | Falta ordenação e paginação                                        | Baixa      |

---

## 4. ABA `usuarios`

### 4.1 O que existe no frontend

| Arquivo                                  | Tipo            | Status           |
| ---------------------------------------- | --------------- | ---------------- |
| `src/pages/Login.tsx`                    | Página de login | ✅ UI completa   |
| `src/contexts/AuthContext.tsx`           | Context         | ✅ Alinhado V2.1 |
| `src/types/auth.ts`                      | Tipos           | ✅ Alinhado V2.1 |
| `src/components/auth/ProtectedRoute.tsx` | Componente      | ✅ Implementado  |

**Nenhuma página de gestão de usuários existe.**

### 4.2 Mapeamento V2.1

| Conceito Dashboard             | Entidade V2.1                | Tabela                      | Prontidão |
| ------------------------------ | ---------------------------- | --------------------------- | --------- |
| Lista de usuários              | `people`                     | `people`                    | 🟡        |
| Vínculo com tenant             | `tenant_memberships`         | `tenant_memberships`        | 🟡        |
| Roles                          | `role_assignments` + `roles` | `role_assignments`, `roles` | 🟡        |
| Permissões                     | `permissions`                | `permissions`               | 🟡        |
| Status                         | `people.status`              | `people`                    | 🟢        |
| Ações (editar role, suspender) | RPCs                         | Functions                   | 🔴        |

### 4.3 O que pode ser reaproveitado

**UI preservável:**

- Padrão de tabela com ações (Ver, Editar, Excluir) já usado em outras abas
- Badges de status
- Filtros de busca

**Código reaproveitável:**

- `AuthContext` — carrega `people`, `tenant_memberships`, `role_assignments`, `roles`, `permissions`
- Tipos de `Person`, `Role`, `Permission` em `src/types/auth.ts`

**Não reaproveitável:**

- Nenhuma página de gestão de usuários existe
- Nenhum repository de `people`/`users` existe ainda

### 4.4 Gaps para fechar

| #   | Gap                                                              | Prioridade |
| --- | ---------------------------------------------------------------- | ---------- |
| 1   | Criar `people.repository.ts`                                     | Alta       |
| 2   | Criar `usePeople.ts`                                             | Alta       |
| 3   | Criar `useRoles.ts` / `usePermissions.ts`                        | Alta       |
| 4   | Faltam RPCs: `assign_role()`, `remove_role()`, `update_person()` | Alta       |
| 5   | Falta mapear actions do Dashboard (editar role, suspender)       | Média      |
| 6   | Falta filtro por role/status                                     | Baixa      |

---

## 5. ABA `relatorios`

### 5.1 O que existe no frontend

| Arquivo                             | Tipo            | Status               |
| ----------------------------------- | --------------- | -------------------- |
| `src/pages/Dashboard.tsx`           | Aba placeholder | ❌ Apenas título     |
| `docs/V21-DATABASE-FINAL-MATRIX.md` | Documentação    | ✅ Define KPIs       |
| `docs/BUSINESS-RULES-V2.1.md`       | Documentação    | ✅ Define relatórios |

**Nenhuma página de relatórios existe.**

### 5.2 Mapeamento V2.1

| KPI / Relatório            | Entidade V2.1                         | Tabela(s)                | Tipo | Prontidão |
| -------------------------- | ------------------------------------- | ------------------------ | ---- | --------- |
| Vagas abertas              | `jobs`                                | `jobs`                   | VIEW | 🔴        |
| Vagas fechadas             | `jobs`                                | `jobs`                   | VIEW | 🔴        |
| Candidaturas               | `applications`                        | `applications`           | VIEW | 🔴        |
| Entrevistas                | `interviews`                          | `interviews`             | VIEW | 🔴        |
| Contratações               | `employees`                           | `employees`              | VIEW | 🔴        |
| Tempo médio de contratação | `applications` + `employees`          | VIEW                     | 🔴   |
| Clientes ativos            | `companies` + `company_relationships` | VIEW                     | 🔴   |
| Contratos ativos           | `contracts`                           | `contracts`              | VIEW | 🔴        |
| Contratos vencendo         | `contracts`                           | `contracts`              | VIEW | 🔴        |
| Ordens de serviço          | `service_orders`                      | `service_orders`         | VIEW | 🔴        |
| Estoque                    | `stock_balances`                      | `stock_balances`         | VIEW | 🔴        |
| Financeiro                 | `financial_transactions`              | `financial_transactions` | VIEW | 🔴        |
| Tickets                    | `support_tickets`                     | `support_tickets`        | VIEW | 🔴        |
| Faturamento                | `invoices` + `payments`               | VIEW                     | 🔴   |

### 5.3 O que pode ser reaproveitado

**UI preservável:**

- Nenhuma UI de relatório existe atualmente
- Botão "Exportar CSV" existe no Dashboard mas não implementado

**Código reaproveitável:**

- Nenhum repository de relatórios existe
- Nenhuma view/materialized view existe no frontend

**Não reaproveitável:**

- Tudo precisa ser criado

### 5.4 Gaps para fechar

| #   | Gap                                        | Prioridade |
| --- | ------------------------------------------ | ---------- |
| 1   | Criar views SQL para cada KPI              | Alta       |
| 2   | Criar `reports.repository.ts`              | Alta       |
| 3   | Criar `useReports.ts`                      | Alta       |
| 4   | Implementar exportação CSV/PDF             | Média      |
| 5   | Implementar gráficos (Chart.js ou similar) | Média      |
| 6   | Implementar filtros por período            | Baixa      |

---

## 6. MATRIZ DE COBERTURA DAS ABAS

| Aba          | UI                     | Mock | Supabase    | Repository | Hook | RPCs | Views | Prontidão |
| ------------ | ---------------------- | ---- | ----------- | ---------- | ---- | ---- | ----- | --------- |
| `vagas`      | 🟡 Parcial (Vagas.tsx) | ✅   | 🔄 Iniciado | ✅         | ✅   | 🔴   | 🔴    | 🟡        |
| `usuarios`   | 🔴 Nenhuma             | ❌   | ❌          | ❌         | ❌   | 🔴   | 🔴    | 🔴        |
| `relatorios` | 🔴 Placeholder         | ❌   | ❌          | ❌         | ❌   | ❌   | 🔴    | 🔴        |

---

## 7. REPOSITÓRIOS/HOOKS NECESSÁRIOS POR ABA

### `vagas`

```text
repositories/
  └── jobs.repository.ts         ✅ EXISTE
hooks/
  └── useJobs.ts                  ✅ EXISTE
Faltam:
  └── useDashboardJobs.ts         🔴 NOVO (filtros administrativos)
```

### `usuarios`

```text
repositories/
  ├── people.repository.ts        🔴 NOVO
  ├── roles.repository.ts         🔴 NOVO
  └── permissions.repository.ts   🔴 NOVO
hooks/
  ├── usePeople.ts                🔴 NOVO
  ├── useRoles.ts                 🔴 NOVO
  └── usePermissions.ts           🔴 NOVO
```

### `relatorios`

```text
repositories/
  └── reports.repository.ts       🔴 NOVO
hooks/
  └── useReports.ts               🔴 NOVO
```

---

## 8. ORDEM DE IMPLEMENTAÇÃO SUGERIDA

### Fase 1 — `vagas` (mais próximo de pronto)

1. Ajustar `useJobs.ts` para suportar filtros do Dashboard
2. Criar `useDashboardJobs.ts` com filtros administrativos
3. Substituir mock no Dashboard por dados reais
4. Implementar ações (editar, excluir, publicar, encerrar)
5. Reaproveitar UI de `Vagas.tsx` adaptando para tabela administrativa

**Estimativa:** 1-2 dias

### Fase 2 — `usuarios`

1. Criar repositories (`people`, `roles`, `permissions`)
2. Criar hooks (`usePeople`, `useRoles`, `usePermissions`)
3. Implementar tabela de usuários no Dashboard
4. Implementar ações (editar role, suspender, reativar)
5. Implementar filtros (por role, status, tenant)

**Estimativa:** 2-3 dias

### Fase 3 — `relatorios`

1. Criar views SQL para KPIs
2. Criar `reports.repository.ts`
3. Criar `useReports.ts`
4. Implementar UI de relatórios (cards + tabelas + gráficos)
5. Implementar exportação CSV

**Estimativa:** 3-5 dias

---

## 9. RISCOS E PONTOS DE ATENÇÃO

### 9.1 Vagas

- **Risco:** `Vagas.tsx` é página pública; o Dashboard precisa de uma versão administrativa
- **Mitigação:** Manter `Vagas.tsx` como página pública; criar componente separado para admin
- **Risco:** Filtros da página pública são diferentes dos necessários no Dashboard
- **Mitigação:** Parametrizar filtros; não duplicar lógica

### 9.2 Usuários

- **Risco:** `people` pode conter usuários de múltiplos tenants
- **Mitigação:** RLS garante isolamento; repository deve sempre filtrar por `tenant_id`
- **Risco:** `role_assignments` é global + tenant
- **Mitigação:** Exibir roles globais e tenant separadamente

### 9.3 Relatórios

- **Risco:** Views podem ficar pesadas com muitos dados
- **Mitigação:** Começar com views simples; considerar materialized views depois
- **Risco:** Exportação CSV pode ser complexa
- **Mitigação:** Implementar apenas CSV primeiro; PDF depois

---

## 10. COMPARAÇÃO COM OUTRAS ABAS DO DASHBOARD

| Aba            | Fonte de dados                         | Mock | Repository | Hook | Prontidão |
| -------------- | -------------------------------------- | ---- | ---------- | ---- | --------- |
| `clientes`     | `companies` + `company_relationships`  | Sim  | ✅         | ✅   | 🟡        |
| `parceiros`    | `company_relationships` (type=partner) | Sim  | ✅         | ✅   | 🟡        |
| `fornecedores` | `suppliers`                            | Sim  | ✅         | ✅   | 🟡        |
| `curriculos`   | `candidates` + `people`                | Sim  | ✅         | ✅   | 🟡        |
| `vagas`        | `jobs`                                 | Sim  | ✅         | ✅   | 🟡        |
| `usuarios`     | `people` + `role_assignments`          | Não  | ❌         | ❌   | 🔴        |
| `relatorios`   | Views agregadas                        | Não  | ❌         | ❌   | 🔴        |

---

## 11. CONCLUSÃO

### `vagas`

- **Estado:** UI existente em `Vagas.tsx`, mas mockada
- **Caminho:** Reaproveitar UI, substituir mock por `useJobs` real
- **Bloqueios:** RPCs de edição/publicação/encerramento
- **Próximo passo:** Ajustar filtros e integrar repository

### `usuarios`

- **Estado:** Não existe implementação
- **Caminho:** Criar repositories/hooks do zero
- **Bloqueios:** Nenhum repository de `people`/`roles`/`permissions`
- **Próximo passo:** Criar repositories básicos

### `relatorios`

- **Estado:** Placeholder apenas
- **Caminho:** Criar views SQL + repositories + UI
- **Bloqueios:** Views SQL não existem; sem repository de relatórios
- **Próximo passo:** Definir KPIs prioritários e criar views

### Ordem recomendada

1. `vagas` — reaproveita mais código, menos risco
2. `usuarios` — médio esforço, alta utilidade
3. `relatorios` — maior esforço, depende de views SQL

---

## 12. EVIDÊNCIAS

### Dashboard.tsx — abas não implementadas

```typescript
// Linha 47-49
| 'vagas'
| 'usuarios'
| 'relatorios';

// Linha 61-63
{ key: 'vagas', label: 'Vagas', icon: Briefcase },
{ key: 'usuarios', label: 'Usuários', icon: Users },
{ key: 'relatorios', label: 'Relatórios', icon: TrendingUp },

// Linha 376-378 (renderTable)
default:
  return null;
```

### Vagas.tsx — mock

```typescript
// Linha 11
import { mockGetVagas } from '@/services/mock/vagas';

// Linha 34-44
const vagas = useMemo(() => {
  return mockGetVagas({...});
}, [...]);
```

### Repositórios existentes

```text
src/repositories/
  ├── jobs.repository.ts         ✅
  ├── companies.repository.ts    ✅
  └── candidates.repository.ts   ✅
```

### Ausentes

```text
src/repositories/
  ├── people.repository.ts       ❌
  ├── roles.repository.ts        ❌
  ├── permissions.repository.ts  ❌
  └── reports.repository.ts      ❌
```

---

**Fim da auditoria das abas do Dashboard.**
