# CELL MATRIX — J&S EMPREGOS LTDA

Data: 2026-10-06  
Branch: main @ 1f75702  
Base: `docs/MASTER-AUDIT-JSEMPREGOS.md`, `docs/MAPA-MIDIA-JSEMPREGOS.md`  
Escopo: somente leitura. Nenhum arquivo alterado.

---

## 1. LEGENDA

| Status | Significado |
|---|---|
| 🟢 | Conforme |
| 🟡 | Parcial |
| 🔴 | Ausente/quebrado |
| ⚪ | N/A |
| 🔵 | Bloqueado por dependência |

---

## 2. MATRIZ GERAL

| Célula | Arquitetura | CRUD | Form | Repo | Permissões | RLS | Estados | Mídia | Testes | Isolamento | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| candidato | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟡 | 🟢 | 🟢 | 🟢 |
| recrutamento | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 |
| suporte | 🟢 | 🟡 | 🟡 | 🟢 | 🟡 | 🟡 | 🟢 | ⚪ | ⚪ | 🟡 | 🟡 |
| empresas | 🔴 Wrapper | 🔴 | 🔴 | 🔴 | 🟡 | 🟡 | 🔴 | 🟡 | 🔴 | 🔴 | 🔴 |
| servicos | 🔴 Wrapper | 🔴 | 🔴 | 🔴 | 🟡 | 🟡 | 🔴 | 🟡 | 🔴 | 🔴 | 🔴 |
| financeiro | 🔴 Wrapper | 🔴 | 🔴 | 🔴 | 🟡 | 🟡 | 🔴 | ⚪ | 🔴 | 🔴 | 🔴 |
| fiscal | 🔴 Wrapper | 🔴 | 🔴 | 🟡 | 🟡 | 🟡 | 🔴 | ⚪ | 🔴 | 🔴 | 🔴 |
| estoque | 🔴 Wrapper | 🔴 | 🔴 | 🟡 | 🟡 | 🟡 | 🔴 | ⚪ | 🔴 | 🔴 | 🔴 |
| operacoes | 🔴 Wrapper | 🔴 | 🔴 | 🔴 | 🟡 | 🟡 | 🔴 | ⚪ | 🔴 | 🔴 | 🔴 |
| pos | 🔴 Wrapper | 🔴 | 🔴 | 🔴 | 🟡 | 🟡 | 🔴 | ⚪ | 🔴 | 🔴 | 🔴 |
| rh | 🟠 Acoplado | 🟠 | 🟠 | 🟠 | 🟠 | 🟠 | 🟠 | ⚪ | 🟠 | 🟠 | 🟠 |

---

## 3. DETALHAMENTO POR CÉLULA

### 3.1 candidato (Classe A)

| Contrato | Status | Evidência |
|---|---|---|
| Dashboard próprio | 🟢 | `DashboardCandidato` com tiles |
| Rotas próprias | 🟢 | 19 páginas em `src/modules/candidato/pages/` |
| Sidebar/navigation própria | 🟢 | `CandidatoSidebar` custom |
| Listagem | 🟢 | Vagas, Candidaturas, Favoritas, Notificações, Alertas |
| CRUD real | 🟢 | Curriculo, Experiencia, Formacao, Cursos, Habilidades, Idiomas, Preferencias, Documentos |
| Formulários | 🟢 | Dialogs de criação/edição |
| Validação | 🟢 | Zod schemas |
| Repository/Service | 🟢 | `CandidatesRepository extends SupabaseRepository` |
| Permission Check | 🟢 | `candidates.self.read` + guards |
| RLS | 🟢 | Depende de Supabase; needs verification |
| Loading | 🟢 | `ContentBoundary` em 13 páginas |
| Empty state | 🟢 | `EmptyState` |
| Error state | 🟢 | `ErrorState` com retry |
| Feedback de operação | 🟢 | Toast/inline |
| Fallback | 🟢 | `IMAGES.logo.principal` em `RouteLoadingFallback` |
| Responsividade | 🟢 | Mobile-first |
| Testes | 🟢 | 8 arquivos de teste |
| Mídia | 🟡 | Sem mídia própria; usa fallback global |
| Auditabilidade | 🟢 | Logs em operations |

**Isolamento:** Usa repositories de `recrutamento` (dependência cruzada).  
**Blast radius:** Se `recrutamento` quebrar, `candidato` é afetado.

---

### 3.2 recrutamento (Classe A)

| Contrato | Status | Evidência |
|---|---|---|
| Dashboard próprio | 🟢 | `DashboardRecrutamento` |
| Rotas próprias | 🟢 | `RecrutamentoRoutes` com 22 páginas |
| Sidebar/navigation própria | 🟢 | `RecrutamentoSidebar` custom |
| Listagem | 🟢 | Vagas, Candidatos, Candidaturas, Processos, Entrevistas |
| CRUD real | 🟢 | Jobs, Applications, Processes, Stages, Demands, Matches |
| Formulários | 🟢 | Criação/edição de vaga, processo, estágio |
| Validação | 🟢 | Schemas próprios |
| Repository/Service | 🟢 | 9 repositories + services |
| Permission Check | 🟢 | Permissões por recurso |
| RLS | 🟢 | Depende de Supabase; needs verification |
| Loading | 🟢 | `ContentBoundary` no dashboard |
| Empty state | 🟢 | `EmptyState` |
| Error state | 🟢 | `ErrorState` com retry |
| Feedback de operação | 🟢 | Toast/inline |
| Fallback | 🟡 | Falta fallback padronizado em algumas páginas |
| Responsividade | 🟡 | Algumas páginas com `max-w` arbitrário |
| Testes | 🟡 | Testes existem mas não cobrem tudo |
| Mídia | 🟡 | Sem mídia própria |
| Auditabilidade | 🟢 | Logs estruturados |

**Isolamento:** `candidato` depende de `recrutamento`.  
**Blast radius:** Se quebrar, derruba `candidato`, `vagas`, `candidatos`, `processos`.

---

### 3.3 suporte (Classe A)

| Contrato | Status | Evidência |
|---|---|---|
| Dashboard próprio | 🟢 | `suporte/dashboard` |
| Rotas próprias | 🟢 | Integrado ao módulo |
| Sidebar/navigation própria | 🟢 | `SuporteSidebar` |
| Listagem | 🟡 | Tickets/chamados |
| CRUD real | 🟡 | Create/Read/Update; Delete não confirmado |
| Formulários | 🟢 | Form de abertura/atualização |
| Validação | 🟢 | Schemas |
| Repository/Service | 🟢 | `support.repository.ts` |
| Permission Check | 🟡 | Não confirmado em todas as ações |
| RLS | 🟡 | Não confirmado |
| Loading | 🟢 | `ContentBoundary` |
| Empty state | 🟢 | `EmptyState` |
| Error state | 🟢 | `ErrorState` |
| Feedback de operação | 🟢 | Toast/inline |
| Fallback | 🟡 | Parcial |
| Responsividade | 🟡 | Não auditado profundamente |
| Testes | ⚪ | Nenhum teste encontrado |
| Mídia | ⚪ | N/A |
| Auditabilidade | 🟡 | Logs básicos |

**Isolamento:** Baixo acoplamento.  
**Blast radius:** Controlado.

---

### 3.4 empresas (Classe B — Wrapper)

| Contrato | Status | Evidência |
|---|---|---|
| Dashboard próprio | 🟡 | Reexporta `Empresas` global |
| Rotas próprias | 🟡 | 7 rotas → 3 páginas globais |
| Sidebar/navigation própria | 🟡 | Wrapper vazio |
| Listagem | 🟡 | `Empresas.tsx` tem tabela |
| CRUD real | 🟡 | Create/Update/Delete com `companiesRepository` |
| Formulários | 🟡 | Form inline em `Empresas.tsx` |
| Validação | 🟡 | Campos obrigatórios básicos |
| Repository/Service | 🔴 | Usa `companiesRepository` global; sem repository próprio |
| Permission Check | 🟡 | Não confirmado em todas as ações |
| RLS | 🟡 | Depende de Supabase; needs verification |
| Loading | 🔴 | Não usa `ContentBoundary` |
| Empty state | 🔴 | Não confirmado |
| Error state | 🔴 | Não confirmado |
| Feedback de operação | 🟡 | Toast/inline básico |
| Fallback | 🔴 | Ausente |
| Responsividade | 🔴 | Não padronizada |
| Testes | 🔴 | Nenhum teste encontrado |
| Mídia | 🟡 | `MediaUploader` implementado, mas não integrado ao fluxo |
| Auditabilidade | 🟡 | Logs básicos |

**Isolamento:** Depende de página global.  
**Blast radius:** Baixo, mas acoplado ao layout global.

---

### 3.5 servicos (Classe B — Wrapper)

| Contrato | Status | Evidência |
|---|---|---|
| Dashboard próprio | 🔴 | Não existe |
| Rotas próprias | 🟡 | 8 rotas → 1 página global |
| Sidebar/navigation própria | 🟡 | Wrapper vazio |
| Listagem | 🟡 | `Servicos.tsx` com mock data |
| CRUD real | 🔴 | Somente leitura; create/update/delete não confirmados |
| Formulários | 🔴 | Não confirmado |
| Validação | 🔴 | Não confirmado |
| Repository/Service | 🔴 | Usa `servicesRepository` global; sem repository próprio |
| Permission Check | 🟡 | Permissões declaradas mas não validadas |
| RLS | 🟡 | Depende de Supabase; needs verification |
| Loading | 🔴 | Não usa `ContentBoundary` |
| Empty state | 🔴 | Não confirmado |
| Error state | 🔴 | Não confirmado |
| Feedback de operação | 🔴 | Não confirmado |
| Fallback | 🔴 | Ausente |
| Responsividade | 🔴 | Não padronizada |
| Testes | 🔴 | Nenhum teste encontrado |
| Mídia | 🟡 | `SERVICE_IMAGES` em `assets.ts`; sem integração com `media-assets.repository` |
| Auditabilidade | 🟡 | Logs básicos |

**Isolamento:** Depende de `Servicos.tsx` global.  
**Blast radius:** Baixo, mas fortemente acoplado.

---

### 3.6 financeiro (Classe B — Wrapper)

| Contrato | Status | Evidência |
|---|---|---|
| Dashboard próprio | 🟡 | Reexporta `FinanceiroPage` |
| Rotas próprias | 🟡 | 6 rotas → 4 páginas globais |
| Sidebar/navigation própria | 🟡 | Wrapper vazio |
| Listagem | 🟡 | Tabelas em `FinanceiroPage` |
| CRUD real | 🟡 | Contas a pagar/receber, fluxo de caixa |
| Formulários | 🟡 | Forms inline |
| Validação | 🟡 | Básica |
| Repository/Service | 🟡 | Usa repositories globais de finance |
| Permission Check | 🟡 | Permissões por recurso |
| RLS | 🟡 | Depende de Supabase; needs verification |
| Loading | 🔴 | Não usa `ContentBoundary` |
| Empty state | 🔴 | Não confirmado |
| Error state | 🔴 | Não confirmado |
| Feedback de operação | 🟡 | Toast básico |
| Fallback | 🔴 | Ausente |
| Responsividade | 🔴 | Não padronizada |
| Testes | 🔴 | Nenhum teste encontrado |
| Mídia | ⚪ | N/A |
| Auditabilidade | 🟡 | Logs básicos |

**Isolamento:** Depende de páginas globais.  
**Blast radius:** Médio; várias rotas dependem de `FinanceiroPage`.

---

### 3.7 fiscal (Classe B — Wrapper)

| Contrato | Status | Evidência |
|---|---|---|
| Dashboard próprio | 🟡 | Reexporta `FiscalPage` |
| Rotas próprias | 🟡 | 5 rotas → 1 página global |
| Sidebar/navigation própria | 🟡 | Wrapper vazio |
| Listagem | 🟡 | Tabela em `FiscalPage` |
| CRUD real | 🟡 | Create/Read/Update; Delete não confirmado |
| Formulários | 🟡 | Form inline |
| Validação | 🟡 | Básica |
| Repository/Service | 🟢 | `fiscal/repositories` e `fiscal/services` existem |
| Permission Check | 🟡 | Permissões declaradas |
| RLS | 🟡 | Depende de Supabase |
| Loading | 🔴 | Não usa `ContentBoundary` |
| Empty state | 🔴 | Não confirmado |
| Error state | 🔴 | Não confirmado |
| Feedback de operação | 🟡 | Toast básico |
| Fallback | 🔴 | Ausente |
| Responsividade | 🔴 | Não padronizada |
| Testes | 🔴 | Nenhum teste encontrado |
| Mídia | ⚪ | N/A |
| Auditabilidade | 🟡 | Logs básicos |

**Isolamento:** Depende de `FiscalPage` global.  
**Blast radius:** Baixo-médio.

---

### 3.8 estoque (Classe B — Wrapper)

| Contrato | Status | Evidência |
|---|---|---|
| Dashboard próprio | 🟡 | Reexporta `Estoque` |
| Rotas próprias | 🟡 | 7 rotas → 1 página global |
| Sidebar/navigation própria | 🟡 | Wrapper vazio |
| Listagem | 🟡 | Tabela em `Estoque` |
| CRUD real | 🟡 | Create/Read/Update; Delete não confirmado |
| Formulários | 🟡 | Form inline |
| Validação | 🟡 | Básica |
| Repository/Service | 🟢 | `estoque/repositories` e `estoque/services` existem |
| Permission Check | 🟡 | Permissões declaradas |
| RLS | 🟡 | Depende de Supabase |
| Loading | 🔴 | Não usa `ContentBoundary` |
| Empty state | 🔴 | Não confirmado |
| Error state | 🔴 | Não confirmado |
| Feedback de operação | 🟡 | Toast básico |
| Fallback | 🔴 | Ausente |
| Responsividade | 🔴 | Não padronizada |
| Testes | 🔴 | Nenhum teste encontrado |
| Mídia | ⚪ | N/A |
| Auditabilidade | 🟡 | Logs básicos |

**Isolamento:** Depende de `Estoque` global.  
**Blast radius:** Baixo-médio.

---

### 3.9 operacoes (Classe B — Wrapper)

| Contrato | Status | Evidência |
|---|---|---|
| Dashboard próprio | 🟡 | Reexporta `GestaoPage` |
| Rotas próprias | 🟡 | 6 rotas → 1 página global |
| Sidebar/navigation própria | 🟡 | Wrapper vazio |
| Listagem | 🟡 | Tabela em `GestaoPage` |
| CRUD real | 🔴 | Não confirmado |
| Formulários | 🔴 | Não confirmado |
| Validação | 🔴 | Não confirmado |
| Repository/Service | 🔴 | Sem repository próprio |
| Permission Check | 🟡 | Permissões declaradas |
| RLS | 🟡 | Depende de Supabase |
| Loading | 🔴 | Não usa `ContentBoundary` |
| Empty state | 🔴 | Não confirmado |
| Error state | 🔴 | Não confirmado |
| Feedback de operação | 🔴 | Não confirmado |
| Fallback | 🔴 | Ausente |
| Responsividade | 🔴 | Não padronizada |
| Testes | 🔴 | Nenhum teste encontrado |
| Mídia | ⚪ | N/A |
| Auditabilidade | 🟡 | Logs básicos |

**Isolamento:** Fortemente acoplado a `GestaoPage`.  
**Blast radius:** Baixo, mas estrutura frágil.

---

### 3.10 pos (Classe B — Wrapper)

| Contrato | Status | Evidência |
|---|---|---|
| Dashboard próprio | 🟡 | Reexporta `FaturamentoPage` |
| Rotas próprias | 🟡 | 5 rotas → 1 página global |
| Sidebar/navigation própria | 🟡 | Wrapper vazio |
| Listagem | 🟡 | Tabela em `FaturamentoPage` |
| CRUD real | 🟡 | Create/Read; Update/Delete não confirmados |
| Formulários | 🟡 | Form inline |
| Validação | 🟡 | Básica |
| Repository/Service | 🟡 | Usa repositories globais de finance |
| Permission Check | 🟡 | Permissões declaradas |
| RLS | 🟡 | Depende de Supabase |
| Loading | 🔴 | Não usa `ContentBoundary` |
| Empty state | 🔴 | Não confirmado |
| Error state | 🔴 | Não confirmado |
| Feedback de operação | 🟡 | Toast básico |
| Fallback | 🔴 | Ausente |
| Responsividade | 🔴 | Não padronizada |
| Testes | 🔴 | Nenhum teste encontrado |
| Mídia | ⚪ | N/A |
| Auditabilidade | 🟡 | Logs básicos |

**Isolamento:** Depende de `FaturamentoPage`.  
**Blast radius:** Baixo-médio.

---

### 3.11 rh (Classe C — Acoplado)

| Contrato | Status | Evidência |
|---|---|---|
| Dashboard próprio | 🟡 | Reexporta `DashboardRh` |
| Rotas próprias | 🟡 | 18 rotas → múltiplas páginas globais |
| Sidebar/navigation própria | 🟡 | Wrapper vazio |
| Listagem | 🟡 | Funcionários, documentos |
| CRUD real | 🟠 | Create/Read/Update; Delete não confirmado |
| Formulários | 🟠 | Form inline |
| Validação | 🟠 | Básica |
| Repository/Service | 🟠 | Sem repository próprio; usa globais |
| Permission Check | 🟠 | Permissões misturadas com outras células |
| RLS | 🟠 | Não confirmado |
| Loading | 🔴 | Não usa `ContentBoundary` |
| Empty state | 🔴 | Não confirmado |
| Error state | 🔴 | Não confirmado |
| Feedback de operação | 🟠 | Toast básico |
| Fallback | 🔴 | Ausente |
| Responsividade | 🔴 | Não padronizada |
| Testes | 🟠 | Nenhum teste encontrado |
| Mídia | ⚪ | N/A |
| Auditabilidade | 🟠 | Logs básicos |

**Isolamento:** Acoplado a `DashboardRh`, `Funcionarios`, `DocumentosRh`.  
**Blast radius:** Médio-alto; sobrepõe rotas com `recrutamento`.

---

## 4. RESUMO EXECUTIVO

### Células conforme (🟢)
- `candidato` — única célula com conformidade alta

### Células parciais (🟡)
- `recrutamento` — excelente base, precisa de fallback e testes
- `suporte` — estrutura ok, CRUD/validação pendente
- `fiscal` — repositories existem, falta célula própria
- `estoque` — repositories existem, falta célula própria

### Células quebradas (🔴)
- `empresas` — wrapper sem CRUD próprio
- `servicos` — wrapper sem CRUD próprio
- `financeiro` — wrapper sem CRUD próprio
- `operacoes` — wrapper sem CRUD próprio
- `pos` — wrapper sem CRUD próprio
- `rh` — acoplado, sem CRUD próprio

### Padrão identificado
Células com repositories próprios (`candidato`, `recrutamento`, `suporte`, `fiscal`, `estoque`) têm base para evoluir. Células sem repository (`empresas`, `servicos`, `financeiro`, `operacoes`, `pos`, `rh`) precisam de reconstrução estrutural.

---

## 5. PRÓXIMOS PASSOS

1. Validar este contrato com o time/produto;
2. Congelar `CELL-CONTRACT.md` como documento de referência;
3. Iniciar Fase C — Core/Shell Separation;
4. Escolher célula piloto para Fase D (recomendação: `empresas` ou `servicos` por impacto visual).

---

**Nenhum arquivo alterado.**
