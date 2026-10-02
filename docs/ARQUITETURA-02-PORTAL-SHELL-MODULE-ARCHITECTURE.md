# ARQUITETURA-02 — Portal Shell / Module Architecture

> **Status:** ⚠️ **RASCUNHO — NÃO VIGENTE.** Este documento **não pode ser usado como fundamento** enquanto o P0 não for encerrado pelo usuário.
> **Razão:** ele foi escrito antes da errata de inventário e portanto herda premissas numéricas que já se provaram erradas.
> **Bloqueio:** ver `docs/architecture/ERRATA-INVENTARIO-01.md` §7 e o backlog P0.
> **Natureza:** documental. Nenhuma alteração de código, banco ou Git acompanha este documento.
> **Precedência:** este documento **supersede a árvore de diretórios** de `docs/ARQUITETURA-01-ESTRUTURA-MIGRACAO.md` §1. Não supersede as decisões de Portal, autorização nem identidade — apenas a topologia de pastas e os contratos de shell, loading, registry e célula modular.

---

## 1. Por que este documento existe

A worktree em andamento reorganizou Portal/Sidebar/ModulePage/RH PoC. A auditoria read-only do Supabase e do inventário frontend revelou que essa organização está correta na direção, mas incompleta no contrato, e que quatro documentos existentes divergem entre si.

Este documento fixa:

- a árvore de diretórios oficial;
- os contratos de AppShell, Contextos, Registry, Loading, Célula, Dashboard e Isolamento;
- as correções factuais apuradas contra o banco e o código;
- as decisões que **ainda não podem ser tomadas** sem o usuário.

Nenhuma página, repositório ou migration nasce deste documento sem passar pelo ciclo de checkpoint.

---

## 2. Árvore oficial de diretórios

```
src/
├── app/                    runtime e bootstrap da aplicação
│   ├── router/
│   ├── providers/
│   ├── layouts/
│   └── bootstrap/
│
├── platform/               capacidades transversais, sem domínio
│   ├── auth/
│   ├── identity/
│   ├── tenant/
│   ├── rbac/
│   ├── audit/
│   ├── events/
│   ├── files/
│   ├── reports/
│   └── dashboard/
│
├── modules/                células independentes por domínio
│   ├── rh/
│   ├── empresas/
│   ├── operacoes/
│   ├── suprimentos/
│   ├── vendas/
│   ├── financeiro/
│   ├── fiscal/
│   ├── contabilidade/
│   ├── contratos/
│   ├── pos/
│   └── sistema/
│
├── candidate/              contexto Autônomo, separado de RH
│
├── shared/                 biblioteca reutilizável, cega ao Portal
│   ├── crud/
│   ├── ui/
│   ├── hooks/
│   ├── lib/
│   └── types/
│
└── integrations/
    └── supabase/
        ├── client.ts
        ├── types/
        ├── repositories/
        └── storage/
```

### 2.1 Divisão `app/` vs `platform/`

`ARQUITETURA-01` usava `src/app/` como plataforma inteira. A distinção correta é:

- `app/` responde **"como a aplicação sobe e roteia"** — providers, router, layouts, bootstrap.
- `platform/` responde **"o que a aplicação sabe fazer, independente de domínio"** — identidade, autorização, tenant, auditoria, upload, eventos.
- `modules/` responde **"o que o negócio faz"** — e só ele conhece tabelas de negócio.

Um módulo **nunca** importa de outro módulo. Dependência entre módulos resolve-se por evento (`platform/events`) ou por composição no registry, nunca por import direto.

### 2.2 Camada pública

`src/public/` colide conceitualmente com o `public/` estático do Vite. **Decisão pendente (D-02):** adotar `src/site/`, `src/web-public/` ou manter `public/` apenas para assets.

### 2.3 Regras de fronteira

| Camada          | Pode importar                                                      | Proibido                                                      |
| --------------- | ------------------------------------------------------------------ | ------------------------------------------------------------- |
| `app/`          | `platform/`, `modules/` (via registry), `shared/`, `integrations/` | lógica de negócio                                             |
| `platform/`     | `shared/`, `integrations/`                                         | qualquer `modules/*`                                          |
| `modules/<m>/`  | `shared/`, `platform/`, `integrations/`                            | outro `modules/*`                                             |
| `shared/`       | apenas `shared/` interno                                           | `AppContext`, `AuthContext`, `ModuleContext`, qualquer tabela |
| `integrations/` | `shared/`                                                          | `modules/*`, `app/`                                           |

`shared/` que importa `AuthContext` é violação de fronteira, não estilo. Hoje `src/shared/crud/ModulePage.tsx:3` faz exatamente isso.

---

## 3. AppShell

```
AppShell (100dvh, sem scroll no body)
├── Header                  persistente, nunca remonta
├── Sidebar (global)        persistente, recolhível
├── Content
│   ├── Sidebar (contextual do módulo)
│   └── ContentBoundary
│       └── Outlet
└── Footer                  persistente, fino
```

### 3.1 Regras estruturais

1. Header, Sidebar global e Footer **não desmontam** na troca de rota.
2. O shell ocupa `100dvh`. O body não rola junto com o dashboard.
3. O scroll pertence a `ContentShell` (`overflow-y-auto`). `Main` recebe `min-width: 0` para não forçar overflow horizontal.
4. O conteúdo ocupa **100% da largura disponível**. Não há `max-width` estrutural arbitrário.
5. CRUDs e tabelas aproveitam a largura toda; formulários adaptam densidade, mas não ganham shell paralelo.
6. A navegação do Portal segue a ordem: **explícitas → launcher → catch-all**.
7. O Footer mantém exatamente o texto atual e o link `NEW_WAVE_URL`. `COMPANY.name = 'J&S Empregos LTDA'` é intocável.

### 3.2 Sidebar

Duas camadas:

- **Sidebar global** — ordem dos módulos, recolhível para ícones.
- **Sidebar contextual** — sub-rotas do módulo ativo.

Cada módulo declara sua própria sidebar por registry. O Portal não deve saber a lista de sub-rotas de RH; ele recebe o slot do módulo ativo.

---

## 4. Contextos e Autorização

### 4.1 Cadeia canônica

```
AuthUser
  ↓
TenantContext
  ↓
RoleContext
  ↓
PermissionContext
  ↓
ModuleContext
  ↓
Feature
  ↓
CRUD
  ↓
Query
```

### 4.2 Origem dos dados

O banco já possui a espinha completa:

```
auth.users → people
people     → tenant_memberships → tenants
tenant_memberships + roles → role_assignments
roles → role_permissions → permissions
```

O frontend **materializa** essa cadeia em providers. Não inventa bypass. `admin_master` é um papel, não um atalho que pula RLS.

### 4.3 Roles depreciadas

O banco já modela `status = 'deprecated'` e `replacement_role_id` (`it_admin`, `operator`, `support`).

O frontend consome o estado canônico e resolve effective role:

```ts
resolveEffectiveRole(role): Role
```

Não se cria camada de compatibilidade paralela no frontend.

### 4.4 Constraints que valem para o código

- `people` **não** tem `UNIQUE(email)`. `ON CONFLICT (email)` é inválido. Buscar por email antes de inserir.
- Unique válidas: `tenant_memberships (person_id, tenant_id)` e `role_assignments (person_id, role_id, tenant_id)`.
- Triggers `trg_bootstrap_candidate_from_auth_user` e `trg_bootstrap_company_from_auth_user` criam registros a partir de `auth.users`. O código deve tolerar bootstrap do banco e evitar duplicação.

---

## 5. Registry e Rotas

O Registry é a fonte única. `MODULE_PERMISSION_MAP` continua no launcher — a divergência em relação ao registry é intencional.

### 5.1 Ordem de resolução

```
1. rota explícita
2. rota gerada pelo launcher do módulo
3. catch-all
```

### 5.2 Contagem canônica de rotas

O inventário registra **62 explícitas + 27 launcher = 89**. A contagem de 106/28 que consta no `02C.2` **não é a contagem canônica** — ver §10.

---

## 6. Contrato de Loading

Três níveis, sem sobreposição:

| Nível | Escopo                     | Artefato                                                    |
| ----- | -------------------------- | ----------------------------------------------------------- |
| 1     | bootstrap / auth / crítico | loader J&S em tela cheia                                    |
| 2     | navegação de rota e região | `ContentBoundary` + skeleton/loader J&S **dentro** do shell |
| 3     | ação pontual               | loading local de botão, linha ou formulário                 |

Regras obrigatórias:

- `CinematicShowcase` é **intro de marca**, não loader de dados. Não deve bloquear dados e não deve desmontar o shell.
- Anti-flicker por limiar de tempo, nunca por atraso artificial.
- Timeout e cancelamento (`AbortController`) são obrigatórios.
- Falha preserva estado anterior (`stale-while-revalidate`) em vez de tela vazia.
- Estados já implementados e **sem consumidor**: `DataState.tsx`, `SectionLoader.tsx`, `InlineLoader.tsx`, `TimeoutState.tsx`. Adotá-los precede criar componentes novos.

### 6.1 Pendências de loading

- `IntroContext.tsx` inicia `introComplete=false` sem `localStorage`/`sessionStorage`; a intro repete a cada reload. **Decisão pendente (D-04).**
- `App.tsx` retorna `CinematicShowcase` **antes** de `RoutesAndLayout`, desmontando Header, Sidebar e Footer. Fora de contrato.
- Estratégia de cache não está decidida. Não há TanStack Query/SWR instalado. **Decisão pendente (D-05).**

---

## 7. Anatomia da célula de módulo

```
modules/rh/employees/
├── pages/
│   ├── EmployeesPage.tsx
│   └── EmployeeDetailPage.tsx
├── components/
│   ├── EmployeeTable.tsx
│   ├── EmployeeFilters.tsx
│   └── EmployeeSummary.tsx
├── forms/
│   ├── EmployeeForm.tsx
│   └── EmployeeContractForm.tsx
├── repositories/
│   └── employeeRepository.ts
├── services/
│   └── employeeService.ts
├── hooks/
│   └── useEmployees.ts
├── types/
│   └── employee.ts
└── routes/
    └── index.ts
```

O Portal sabe apenas: módulo → contexto → permissão → rota. **Não sabe** como RH salva um funcionário. Isso pertence ao módulo.

### 7.1 `shared/crud/`

Infraestrutura genérica apenas:

```
shared/crud/
├── types.ts
├── DataTable.tsx
├── CrudFilters.tsx
├── CrudAlerts.tsx
├── CrudDialog.tsx
├── CrudStates.tsx
├── ModulePage.tsx
└── index.ts
```

Formulários de negócio **não** entram aqui. `ModulePage.tsx` deve parar de importar `AuthContext` (§2.3).

### 7.2 Cadeia de dados obrigatória

```
UI → hook → service → repository → query → Supabase
```

Sem mock, sem array local como CRUD. Sem Given/When/Then.

### 7.3 Contrato de repository

- Assinatura única de CRUD.
- Escopo por `tenant_id` explícito.
- Erro tipado; sem `any` silencioso.
- `AbortSignal` em toda leitura.

---

## 8. Dashboard

### 8.1 Onde o Metro se aplica

Metro/Windows 8 é linguagem de **dashboards analíticos e gerenciais**. `/dashboard` pode ser o Portal Launcher se o visual atual for recuperável sem regressão; caso contrário, o Metro vira a linguagem das telas gerenciais.

Telas operacionais (CRUD, listas, formulários) usam **tabelas, filtros e CRUD densos** — nunca Metro.

### 8.2 Persistência — já existe

O banco já possui o necessário. **Não criar tabelas novas.**

```
dashboard_widgets(tenant_id, name, type, config, created_at, updated_at)
dashboard_layouts(tenant_id, person_id, widget_id, position_x, position_y,
                  width, height, created_at, updated_at)
```

Ambas com RLS habilitada e 0 linhas. Nenhum frontend importa essas tabelas hoje — não há repository nem engine.

### 8.3 Contrato de widget

Widgets **não concedem acesso**. O caminho é:

```
AuthUser → Tenant → Role → Permission → catálogo permitido → query autorizada
```

O catálogo da engine filtra por permissão; a query revalida no banco.

### 8.4 Escopo do layout

`dashboard_layouts.person_id` é nullable, sugerindo personalização por usuário. Um dashboard **padrão do tenant** exigiria modelagem separada. **Decisão pendente (D-03).**

### 8.5 Ordem de construção

```
mapear contrato → repository → dashboard engine → catálogo de widgets → salvar layout
```

Sem migration.

---

## 9. Check Bouer 24H — Isolamento de falha

Requisito declarado em `02C.1` §7: _"Falha de RH não deve impedir Empresas/Financeiro de abrir."_

Três condições:

1. **Falha de módulo** não derruba o Portal.
2. **Falha de função dentro do módulo** (ex.: Suporte/TI) não derruba o módulo inteiro.
3. **Falha de integração** degrada a região afetada, não a aplicação.

Requisitos técnicos derivados:

- Import dinâmico por módulo — hoje `App.tsx` importa dashboards eager e `ModuleRegistry.ts` tem ~74 KB como dependência transversal.
- `ErrorBoundary` por módulo e por região, acima do `ContentBoundary`.
- Falha de repository degrada a feature, não a tela.

**Estado atual:** não implementado. Registrado como GAP, não como entregue.

---

## 10. Correções factuais apuradas

> ⚠️ **Substituído por `docs/architecture/ERRATA-INVENTARIO-01.md`, que é a fonte vigente.**
> A tabela abaixo foi medida antes da forense de critérios e **substitui 84 por 66 sem explicar a origem do 84**. Mantida apenas como histórico do que motivou a errata. **Não citar.**

A errata rastreou a origem de cada número e introduziu algo que esta tabela não tinha: **o critério de medição**. O erro não era aritmética solta — era métrica sem critério declarado. Por isso a errata é um documento próprio, e esta seção é rebaixada a histórico.

| #    | Documento                                     | Afirma               | Real                                                     |
| ---- | --------------------------------------------- | -------------------- | -------------------------------------------------------- |
| C-01 | `supabase-inventory.json` · `ARQUITETURA-01C` | 84 triggers          | **66 em `public`**; 79 em todos os schemas               |
| C-02 | `ARQUITETURA-01F` quadrantes                  | 74 + 151 = 225       | denominadores diferentes. Objetos 74/152; tabelas 70/151 |
| C-03 | `ARQUITETURA-01F` pendência #4                | 152 sem tela         | ambos válidos, em denominadores diferentes               |
| C-04 | `02C.2` §3.2                                  | 28 rotas de launcher | **27** — o filtro exclui `inicio`                        |
| C-05 | `02C.2` §3.2                                  | 22 de 28 duplicadas  | **21** — `configuracoes` só existe no launcher           |
| C-06 | `02C.2` §3.1                                  | 106 rotas manuais    | `App.tsx` tem **118** `<Route>`                          |

**Confiável, não alterar:** inventário frontend — 478 arquivos, 264 alcançáveis, 214 inalcançáveis, 124 sem consumidor. Recomputado do zero, bate exatamente.

`migration-map.json` é a referência operacional. Não migrar por pasta.

---

## 11. Decisões pendentes

Nenhuma implementação começa antes destas respostas.

| ID       | Decisão                                                                                                           | Por que bloqueia                                        |
| -------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| **D-01** | `app/` + `platform/` é a divisão oficial?                                                                         | Define toda a árvore de §2                              |
| **D-02** | Nome da camada pública: `site/` ou `web-public/`?                                                                 | Colide com `public/` do Vite                            |
| **D-03** | Layout de dashboard é por pessoa ou padrão do tenant?                                                             | `dashboard_layouts.person_id` é nullable; muda o modelo |
| **D-04** | Intro J&S: `localStorage`, `sessionStorage` ou remover após primeira visita?                                      | Repetição a cada reload                                 |
| **D-05** | Estratégia de cache (nenhuma lib instalada)                                                                       | Afeta toda a camada de dados                            |
| **D-06** | Dono de `administrative_approvals`, `administrative_documents`, `administrative_requests`, `administrative_tasks` | 4 tabelas sem domínio inequívoco                        |
| **D-07** | Escopo canônico da contagem de rotas: 62/27 ou a métrica alternativa                                              | §5.2 depende disso                                      |
| **D-08** | `src/modules/rh/` é absorvido ou permanece façade?                                                                | §12                                                     |

---

## 12. Fate dos artefatos existentes

| Artefato                  | Veredito                                                                                                                                                                                                                   |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/features/candidato/` | única célula com forma modular coerente; migrar para `src/candidate/`                                                                                                                                                      |
| `src/modules/rh/`         | **congelado.** PoC/façade de transição: ~160 linhas, majoritariamente barrels/re-exports, `routes/index.ts` com stub `(() => null)`. Não expandir, não tratar como domínio completo, não apagar antes do plano de migração |
| `src/shared/crud/`        | base válida; remover acoplamento a `AuthContext`                                                                                                                                                                           |
| `src/components/portal/`  | base válida; remover container duplicado e provider duplicado                                                                                                                                                              |

### 12.1 Defeitos conhecidos a corrigir

- `ModuleProvider` montado **duas vezes**: `src/App.tsx:229` e `src/components/portal/PortalShell.tsx:82`.
- Container/padding duplicado: `PortalShell.tsx:50` e `ModuleWorkspace.tsx:32`.
- `/dashboard/financeiro` pode renderizar contas a pagar por rota explícita conflitante.
- `ModuleSidebar` é passado como child, apesar do slot `sidebar` declarado.
- Importações eager de dashboards em `App.tsx`; `ModuleRegistry.ts` (~74 KB) é dependência transversal.

---

## 13. Contratos de tabela ausentes

12 contratos confirmadamente **ausentes** em `pg_class`:

```
accounting_entries   bank_accounts        candidate_preferences
cash_flows           chart_of_accounts    curriculos
epis                 support_faqs         warehouse_custodies
warehouse_entries    warehouse_issues     warehouse_returns
```

**Não criar automaticamente.** Cada um exige decisão própria sobre se o frontend deve ser adaptado ao banco (preferível) ou se falta migration real (exige checkpoint).

Consequências já apuradas:

- `accounting.*` tem 6 permissões RBAC mas nenhuma tabela contábil canônica → módulo Contabilidade é **backlog**, não CRUD falso.
- `cost_centers` existe e pertence naturalmente a Financeiro.
- `interviews`, `interview_participants`, `interview_feedback`, `interview_followups` formam GAP funcional real de RH.

---

## 14. Regras permanentes

1. **Documentação primeiro, código depois.** Ler os `.md` vigentes antes de qualquer alteração.
2. **Supabase é a fonte da verdade.** Não inventar dados nem substituir por mock.
3. **Não duplicar.** Antes de criar componente/hook/repository/rota, provar que não existe.
4. **Banco primeiro, código depois.**
5. **Não destruir o que funciona.** Strangler Fig; presença em `migration-map.json` é pré-requisito.
6. **Commit, push e deploy somente com autorização explícita e separada.** "Terminou" não é autorização.
7. **`J&S Empregos LTDA` e o footer são intocáveis.**
8. **RLS, policies, roles, triggers, constraints e migrations** só com GAP fechado e checkpoint aprovado.
9. **Nunca afirmar implementação sem evidência** no código e, quando aplicável, no banco.

---

## 15. Estado da worktree no momento deste documento

Validações executadas sobre `main` @ `8482111`, `ahead 3` de `origin/main`:

| Comando     | Resultado                                                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `typecheck` | ✅ pass                                                                                                                        |
| `test:run`  | ✅ 549 passed, 2 skipped, 64 arquivos                                                                                          |
| `build`     | ✅ pass em 42s                                                                                                                 |
| `lint`      | ❌ 8 erros — **todos** em `test-hero-dimensions.js`, script Playwright descartável não rastreado (26/09), alheio à refatoração |

Diff contra HEAD: 57 arquivos, +3261 / −3570. Staged: 20 arquivos. Untracked: 138.

O chunk `index` de 1.364,88 kB (327 kB gzip) confirma o problema de import eager de §9.

⚠️ **Staging parcial:** 20 arquivos staged de 57 alterados. Um commit agora capturaria menos da metade do trabalho.
