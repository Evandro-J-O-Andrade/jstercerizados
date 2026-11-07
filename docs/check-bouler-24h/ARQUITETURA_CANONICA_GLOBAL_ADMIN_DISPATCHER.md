# Arquitetura Canônica — CORE, Dispatcher Master, Central Global SaaS, Admin Master e Células

**Projeto:** J&S Empregos LTDA (CHECK BOULER 24H)  
**Data:** 2026-11-06  
**Base:** `main@b9de729`; Stage 02.1–02.14; `docs/AUDITORIA_RECONCILIACAO.md`; `docs/check-bouler-24h/AUDITORIA_TECNICA_NAVEGACAO_DINAMICA.md`; código local observado (`src/App.tsx`, `src/core/dispatcher/DispatcherMaster.ts`, `src/modules/admin-master/cellContract.ts`, `src/modules/admin-master/dashboard/*`, `src/pages/dashboard/*`).  
**Natureza:** especificação arquitetural **docs-only**. **Não autoriza** implementação, migração, alteração remota, RLS/Storage/Edge, commit, push ou deploy.

## Classificação

| Termo                   | Significado                                                                                                                                                                   |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Observado**           | Confirmado em código/docs/Stage 02 na data desta especificação.                                                                                                               |
| **Proposto/Registrado** | Direção funcional/visual já registrada pelo projeto (incl. proposta da Central de Comando em 6 áreas citada pelo operador); requer decisão formal e implementação autorizada. |
| **Pendente**            | Requer decisão, evidência, contrato, migration ou autorização.                                                                                                                |

## 1. Problema canônico a resolver

**Observado (conflito local):**

- `DispatcherMaster.resolveDestination()` retorna `/dashboard/admin-master` para `admin_master` (ROOT) — trata Admin Master como destino pós-login.
- `src/App.tsx` redireciona `/dashboard/global` para `/dashboard/admin-master` sob guarda `admin_master`.
- `admin-master` cell contract (`src/modules/admin-master/cellContract.ts`) declara `homeRoute: '/dashboard/admin-master'`, `domain/scope: global`.
- Existem páginas duplicadas/sobrepostas: `src/modules/admin-master/dashboard/GlobalDashboardPage.tsx`, `src/modules/admin-master/dashboard/AdminMasterDashboardPage.tsx`, `src/pages/dashboard/GlobalDashboardPage.tsx` (e uso em rotas conforme App/reconciliação).
- `docs/AUDITORIA_RECONCILIACAO.md` registra o conflito como crítico: **Central de Comando Global (indicadores transversais/observabilidade SaaS)** ≠ **Admin Master (governança administrativa privilegiada)**.

**Risco (Inferido):** manter um único destino/componente para dois domínios mistura observabilidade executiva com governança privilegiada, dificulta RBAC mínimo por superfície, polui navegação e bloqueia evolução segura da plataforma.

## 2. Princípios arquiteturais (normativos)

1. **Separação de responsabilidades:** Global SaaS ≠ Admin Master ≠ Dispatcher Master ≠ Células.
2. **CORE governa, não opera o negócio:** identidade, contexto, autorização, tenancy, auditoria e despacho pertencem ao CORE; regras de negócio pertencem às células/serviços autorizados.
3. **Default deny:** rota visível, menu, contexto frontend ou redirecionamento **nunca** substituem RBAC, RLS, Storage policies, Edge authorization ou auditoria.
4. **Cadeia de autorização:** `auth.users → people → tenant_memberships → role_assignments → roles → role_permissions → permissions` → contexto validado no servidor (`PlatformUserContext`/equivalente) → `DispatcherMaster`/guardas → dispatcher da célula → operação autorizada + RLS/Storage/Edge + auditoria.
5. **Autonomia das células:** cada célula possui contrato, rotas, dados, UI local, serviços, permissões e ciclo operacional próprios. A Central Global **consulta contratos/indicadores consolidados**; não executa CRUD interno das células nem se torna dona de suas regras.
6. **Degradação graciosa:** indisponibilidade de uma célula/indicador não derruba Global, Admin Master ou navegação; exibe estado degradado auditável.
7. **Sem duplicação canônica:** uma rota canônica por superfície; aliases/redirecionamentos legados apenas quando explícitos, temporários, documentados e sem criar autoridade paralela.
8. **Multi-tenant por resolução segura:** visitante/tenant resolvido por host/domínio/site/contrato autorizado; **nunca** por UUID confiado ao browser.

## 3. Mapa de responsabilidades

| Camada                                                                                   | Responsabilidade canônica                                                                                                                                                                      | Não faz                                                                                                                                                               | Estado atual (Observado/Pendente)                                                                                                                                                                            |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **CORE**                                                                                 | Identidade, vínculo `people`, memberships/roles/permissões, contexto tenant/unidade/cidade/sistema, contratos base, auditoria, políticas de governança técnica                                 | Não renderiza dashboards de negócio; não substitui célula                                                                                                             | Parcial: `AuthContext`, Platform/Account contexts, contratos core, RBAC utils; alinhamento server-validated **Pendente**.                                                                                    |
| **Dispatcher Master**                                                                    | Autoridade única de **resolução de destino pós-login/entrada** e coordenação de despacho autorizado; valida contexto, tenant isolation, autorização declarada, célula habilitada               | Não acessa Supabase diretamente; não aplica RLS; não executa regra de negócio da célula; não concede privilégio implícito                                             | **Observado**: `src/core/dispatcher/DispatcherMaster.ts` (default deny, correlationId, `resolveDestination`, `dispatch`, registry). Destino ROOT conflita com separação Global/Admin — **Pendente decisão**. |
| **Central Global SaaS** (`/dashboard/global`)                                            | Observabilidade executiva/operacional cross-cell: KPIs consolidados, saúde das células, operações globais, portal J&S, auditoria/visão executiva **conforme permissão**                        | Não gerencia usuários/papéis/tenants/config sensível como autoridade administrativa primária; não altera dados internos de célula sem passar por contratos/permissões | **Pendente implementação canônica**. Localmente rota redireciona para Admin Master; páginas “Global” existem mas conflitam.                                                                                  |
| **Admin Master** (`/dashboard/admin-master`)                                             | Governança administrativa privilegiada da plataforma: tenants, usuários/pessoas administrativas, papéis/permissões, configurações globais, módulos/células, segurança/auditoria administrativa | Não é painel executivo genérico; não absorve operação diária das células; não substitui Global                                                                        | **Observado parcial**: célula `admin-master`, routes, `AdminMasterDashboardPage`, sidebar própria. Mistura conceitual com Global no contrato/código — **Pendente reconciliação**.                            |
| **Células independentes** (`/dashboard/<cell>/*`, portais dedicados como `/candidato/*`) | Operação do domínio: UI local, rotas internas, services/repos autorizados, contratos, KPIs do domínio, workflows e validações                                                                  | Não definem identidade global; não concedem acesso a outras células; não viram autoridade de roteamento global                                                        | **Observado parcial**: `CellRegistry` + 26 células registradas; sidebars/layouts variáveis; maturidade heterogênea.                                                                                          |
| **Portal público J&S** (`/`, `/vagas`, `/servicos`, intake etc.)                         | Experiência pública tenant-resolved, SEO, captação controlada, consentimento/auditoria                                                                                                         | Não expõe dados cross-tenant; não aceita `tenant_id` do browser como autoridade                                                                                       | **Observado** com P0 de isolamento/intake/contratos (Stage 02).                                                                                                                                              |

## 4. Árvore canônica de rotas (Proposto — decisão necessária)

| Superfície                                     | Rota canônica                                                                       | Acesso principal                                                                                                          | Finalidade                                                                                | Status de migração                                                                                                  |
| ---------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Entrada dashboard                              | `/dashboard`                                                                        | autenticados                                                                                                              | `DispatcherMaster.resolveDestination()` decide destino permitido                          | **Observado** (manter).                                                                                             |
| Central Global SaaS                            | `/dashboard/global`                                                                 | perfis com permissão de visão global/plataforma (ex.: `global.dashboard.read`/escopo equivalente — **Pendente contrato**) | Central de Comando Global: 6 áreas (seção 7)                                              | **Conflito atual:** redireciona para admin-master. **Proposto:** tornar rota canônica real, com guard próprio.      |
| Admin Master                                   | `/dashboard/admin-master`                                                           | `admin_master`/governança global privilegiada (permissões administrativas explícitas)                                     | Governança: tenants, usuários, RBAC, segurança, configuração, catálogo de células/módulos | **Observado** como destino/rota atual; escopo conceitual deve ser restrito.                                         |
| Gestão de usuários                             | `/dashboard/usuarios`                                                               | permissão administrativa de pessoas/usuários                                                                              | Reuso de `UsuariosPage`/futura célula canônica                                            | **Observado** rota adicionada localmente.                                                                           |
| Minha conta                                    | `/minha-conta`                                                                      | autenticado                                                                                                               | Perfil pessoal (não CRUD administrativo global)                                           | **Observado**.                                                                                                      |
| Células operacionais                           | `/dashboard/<cell>/*`                                                               | conforme `cellContract.permissions`/RBAC + tenant                                                                         | Domínios: RH, Recrutamento, Financeiro, Operações, etc.                                   | **Parcial**; normalizar por `CellRegistry`/contratos.                                                               |
| Portal candidato                               | `/candidato/*`                                                                      | identidade/role candidato, conforme política                                                                              | Portal pessoal do candidato                                                               | **Observado**.                                                                                                      |
| Administração de candidatos                    | `/dashboard/candidato/*` ou rota administrativa sob Recrutamento (decisão canônica) | permissão administrativa (`candidates.read`/equiv.), **não** identidade pessoal de candidato                              | Gestão administrativa                                                                     | **Pendente reconciliação** (evitar colisão semântica com portal pessoal).                                           |
| Legado `/dashboard/global` (enquanto conflita) | —                                                                                   | —                                                                                                                         | **Nenhum alias canônico que esconda conflito**; migração controlada com telemetria        | **Proposto:** manter comportamento atual somente até autorização de separação; documentar redirect como temporário. |

### 4.1 Resolução do conflito (direção proposta)

| Decisão                      | Proposta                                                                                                                                                                                                                                                                                        |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/dashboard/global`          | Passa a ser **Central Global SaaS** (observabilidade). Guard por permissão global de leitura executiva/plataforma + contexto válido. Não exige “ser Admin Master” para visualizar indicadores permitidos, salvo política explícita.                                                             |
| `/dashboard/admin-master`    | Permanece **governança privilegiada**. Guard estrito `admin_master`/permissões administrativas globais.                                                                                                                                                                                         |
| Pós-login ROOT               | **Pendente decisão de produto/RBAC:** ROOT pode ir para `/dashboard/global` (visão executiva) com acesso explícito a Admin Master via navegação autorizada, **ou** para `/dashboard/admin-master` quando o papel for estritamente governança. O destino não pode confundir as duas superfícies. |
| Páginas duplicadas           | Consolidar: **uma** implementação canônica Global SaaS; **uma** Admin Master. Remover/aposentar duplicatas somente após migração autorizada e testes.                                                                                                                                           |
| `admin-master` cell contract | **Pendente:** avaliar se “Admin Master” é célula de governança global; ajustar `domain/scope/homeRoute/navigation` para não absorver Global SaaS. Possível split contratual: `admin-master` (governança) + `global-command`/`saas-global` (observabilidade) — decisão arquitetural necessária.  |

## 5. Contratos entre CORE, Dispatcher e Células

### 5.1 Contrato CORE → sessão

- Entrada: sessão Auth, `person`, memberships, role assignments, permissions efetivas, tenant/unidade/cidade/sistema selecionados ou resolvidos.
- Saída: contexto de identidade/autorização validado para UI/dispatch; **fonte de verdade de autorização final permanece no backend** (RLS/RPC/Edge/Storage).

### 5.2 Contrato Dispatcher Master

- `resolveDestination(context, flags, options)`: puro em relação à identidade carregada; aplica ordem normativa (recovery → senha → onboarding/membership → termos → welcome → seleção tenant → perfil/role/permissões → default). **Proposto:** separar “destino por perfil” de “superfícies disponíveis”.
- `dispatch(action, context, cellId)`: valida contexto estrutural, permissão declarada da ação, tenant isolation, célula registrada/habilitada. Não substitui RLS.
- Falha segura: célula ausente/desabilitada → erro controlado; UI mostra indisponibilidade.

### 5.3 Contrato de Célula (mínimo)

- Identidade: `id`, nome, versão, categoria, `domain/scope`, lifecycle/health.
- Navegação: `homeRoute`, rotas, labels/ícones, children, `implementationStatus`.
- Segurança: `permissions` requeridas; guards de rota; sem acesso cross-tenant.
- Dados: fontes Supabase/RPC/views/Edge autorizadas; indicadores opcionais para Global.
- Resiliência: timeout/fallback/estado degradado; não quebra shell global.

### 5.4 Contrato Global SaaS → Células (Proposto)

- Global **somente lê** indicadores/saúde/eventos agregados expostos por contratos aprovados (views/RPCs/serviços com RLS adequada).
- Campos mínimos por célula no painel: `cellId`, status/health, KPIs autorizados, última atualização, link de navegação autorizado, erros degradados.
- Célula indisponível: cartão “indisponível/degradado”, sem exception global.

## 6. Permissões e escopos (Proposto — alinhar ao RBAC canônico)

| Escopo              | Exemplos                                                | Regra                                                                                                   |
| ------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Global plataforma   | visão executiva, auditoria consolidada, governança      | Concedido apenas por papéis/permissões globais explícitas; ROOT/admin master segue contrato específico. |
| Tenant              | operação do tenant, usuários do tenant, dados do tenant | Exige membership ativa + permissão + tenant resolvido.                                                  |
| Unidade/cidade      | operação local                                          | Exige escopo válido; não amplia para outros escopos.                                                    |
| Célula/recurso/ação | `resource.action`                                       | Default deny; menu ≠ permissão.                                                                         |

**Pendente:** definir `resource.action` formais para `global.dashboard.*` (ou equivalente), `admin_master.*`, navegação master dinâmica e leitura de eventos consolidados; reconciliar com funções `user_has_permission`/RLS (blast radius 570 policies — Stage 02.14).

## 7. Central de Comando Global SaaS — composição visual/funcional (Proposto/Registrado)

A proposta registrada prevê **6 áreas**. Implementação deve ser schema-driven/contrato-driven quando possível, sem código executável vindo do banco.

| Área                       | Objetivo                                                                     | Dados/contrato (alvo)                                                               | Guardas                                                              |
| -------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 1. **Cabeçalho executivo** | Contexto da plataforma, tenant/escopo, status geral, atalhos autorizados     | Identidade/contexto + resumo de saúde                                               | Exibir apenas dados permitidos ao escopo                             |
| 2. **KPIs**                | Indicadores transversais consolidados                                        | Métricas agregadas por contratos aprovados; evitar consultas cross-tenant indevidas | RBAC + RLS/views tenant-safe; P0 views públicas/isolamento pendentes |
| 3. **Saúde das células**   | Status, lifecycle, health, erros, última sincronização                       | `CellRegistry` + telemetria/health contracts                                        | Célula falha = degradada, não quebra shell                           |
| 4. **Operações globais**   | Fila/visão operacional cross-domain autorizada                               | Eventos/filas/indicadores operacionais aprovados                                    | Permissão por domínio/operação; sem bypass de célula                 |
| 5. **Portal J&S**          | Estado do portal público, captações, conteúdo publicado, SEO/intake (resumo) | Métricas de portal/intake **após** contratos seguros                                | Respeitar P0 intake/views/tenant resolution                          |
| 6. **Auditoria**           | Eventos, alertas de segurança, trilhas administrativas/resumidas             | `domain_events`/audit logs conforme permissão                                       | `domain_events.read`/equivalente; minimização LGPD                   |

**Dependências de segurança (Observado):** antes de indicadores reais, resolver P0 de views públicas, intake, Storage/Bunker, mídia e contratos de consentimento/documentos; não expor métricas sensíveis sem RLS/auditoria.

## 8. Comportamento em indisponibilidade

| Situação                           | Comportamento                                                                                |
| ---------------------------------- | -------------------------------------------------------------------------------------------- |
| Célula desabilitada/não registrada | `DispatcherMaster`/guardas negam ou retornam estado controlado; Global exibe “indisponível”. |
| Falha de KPI de uma célula         | Card da célula degradado; demais áreas continuam.                                            |
| Falha de permissão                 | Ocultar ação sensível **e** negar no backend/RLS; logar tentativa quando aplicável.          |
| Tenant não resolvido               | `/selecionar-tenant` ou fluxo canônico; bloquear operações tenant-scoped.                    |
| Conflito de rota legada            | Redirect temporário documentado, sem ampliar acesso.                                         |

## 9. Plano de implementação faseada (somente sob autorização específica)

1. **ADR/contrato:** aprovar esta separação, nomes finais, `resource.action` e destino pós-login ROOT.
2. **Rotas/guards:** restaurar `/dashboard/global` canônico com guard de permissão global; manter `/dashboard/admin-master` privilegiado; ajustar `DispatcherMaster`/`AuthRoute`/`ProtectedRoute` sem enfraquecer deny.
3. **UI:** implementar Central Global (6 áreas) com dados mockados tipados/contratos claros **ou** conectores autorizados; consolidar/remover duplicatas `GlobalDashboardPage`.
4. **Contratos de célula:** padronizar `cellContract`, `homeRoute`, navegação dinâmica, health/KPI opcional.
5. **Dados reais:** somente após P0 críticos e contratos tenant-safe (views/RPCs/Edge/Storage) aprovados.
6. **Regressão:** usar Stage 02.13/02.14; acesso direto, tenant A/B, unidade/cidade, ROOT, auditoria.

## 10. Critérios de aceite arquitetural

- `/dashboard/global` e `/dashboard/admin-master` têm propósitos, guards e componentes canônicos distintos.
- `DispatcherMaster` permanece autoridade de resolução de entrada, sem autoridade de dados/RLS.
- Nenhuma célula é controlada internamente pela Global; falha isolada não derruba shell.
- Navegação dinâmica usa `CellRegistry`/catálogo autorizado + RBAC efetivo.
- Acesso direto por URL/UUID não vaza dados cross-tenant.
- P0 abertos permanecem bloqueadores para dados reais sensíveis.

## 11. Itens explícitos pendentes de decisão

- Nome final da superfície executiva: “Central de Comando Global SaaS”, “Dashboard Global”, ou `global-command`.
- Permissões exatas para acessar Global vs Admin Master.
- Destino pós-login do `admin_master` (Global com atalho governança vs Admin Master direto).
- Modelo contratual: `admin-master` permanece única célula ou separa governança/observabilidade.
- Rota administrativa canônica de candidatos (`/dashboard/candidato/*` vs subrota Recrutamento) sem colidir com `/candidato/*`.
- Fonte/catálogo Supabase para navegação master dinâmica (somente após auditoria de schema e autorização).

---

**Status:** especificação canônica **proposta** para destravar o conflito Global/Admin; **não implementada**. Próximo passo recomendado: ADR curto de decisão (itens seção 11) + plano de implementação autorizado, mantendo Stage 02.14/P0 como gate de segurança.
