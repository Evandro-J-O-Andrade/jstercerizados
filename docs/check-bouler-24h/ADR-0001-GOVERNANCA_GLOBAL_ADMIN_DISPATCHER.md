# ADR-0001 — Governança: CORE, Dispatcher Master, Central Global SaaS e Admin Master

**Projeto:** J&S Empregos LTDA (CHECK BOULER 24H)  
**Status:** Proposto (docs-only; sem implementação)  
**Data:** 2026-11-06  
**Base:** `main@b9de729`; `ARQUITETURA_CANONICA_GLOBAL_ADMIN_DISPATCHER.md`; Stage 02.13/02.14; `docs/AUDITORIA_RECONCILIACAO.md`; código observado `src/core/dispatcher/DispatcherMaster.ts`, `src/App.tsx`, `src/modules/admin-master/*`.

## Contexto

A plataforma possui conflito canônico entre observabilidade executiva global e governança administrativa privilegiada. **Observado:** `DispatcherMaster.resolveDestination()` envia `admin_master` para `/dashboard/admin-master`; `App.tsx` redireciona `/dashboard/global` para `/dashboard/admin-master`; o contrato `admin-master` declara `domain/scope: global` e `homeRoute: /dashboard/admin-master`; existem páginas duplicadas/sobrepostas de “Global/Admin Master”.

Stage 02.14 comprovou blast radius de autorização (570 policies públicas / 207 tabelas dependentes de `is_tenant_member`/`user_has_permission`), lacunas estruturais de Storage (`private-documents` sem policy dedicada em `storage.objects`; `storage.buckets` sem policies; `services-images` cross-tenant no predicado), superfície ampla de `EXECUTE` em funções públicas selecionadas e P0 abertos. **Nenhuma correção está liberada.**

## Decisão (proposta normativa)

### D1 — Separação de autoridades

| Componente                                    | Autoridade                                                                                                                                          | Proibido                                                                                                                   |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **CORE**                                      | Identidade, contexto, RBAC efetivo, tenancy/unidade/cidade/sistema, contratos, auditoria técnica                                                    | Executar regra de negócio de célula; conceder acesso por UI; substituir RLS/Edge/Storage                                   |
| **Dispatcher Master**                         | **Única** autoridade de resolução de destino pós-login/entrada e coordenação de despacho autorizado (`resolveDestination`/`dispatch`)               | Acessar Supabase diretamente; criar autoridade de dados; ignorar RLS; conceder privilégios; controlar internamente células |
| **Central Global SaaS** (`/dashboard/global`) | Observabilidade executiva/operacional cross-cell: KPIs consolidados, saúde das células, operações globais, portal J&S, auditoria/resumo             | Tornar-se segunda autoridade de autorização; executar CRUD interno de células; expor dados sem contrato tenant-safe/RBAC   |
| **Admin Master** (`/dashboard/admin-master`)  | Governança administrativa privilegiada: tenants, usuários/pessoas administrativas, RBAC, segurança, configurações globais, catálogo/módulos/células | Absorver Dispatcher Master; absorver operação diária das células; substituir Central Global                                |
| **Células**                                   | Autonomia de domínio: contrato, rotas, UI local, serviços/repos autorizados, regras de negócio, indicadores próprios                                | Definir identidade global; acessar outras células sem contrato; bypass de RBAC/RLS                                         |

### D2 — Rotas canônicas

| Rota                      | Superfície               | Guard canônico (alvo)                                                                                                                                   |
| ------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/dashboard`              | Entrada neutra           | `DispatcherMaster.resolveDestination()` após contexto válido                                                                                            |
| `/dashboard/global`       | Central Global SaaS      | Permissão global de leitura executiva/plataforma (**ver D4**), escopo válido, auditoria quando aplicável; **não** equivalente automático a Admin Master |
| `/dashboard/admin-master` | Governança Admin Master  | `admin_master`/permissões administrativas globais explícitas (**ver D4**); acesso estrito                                                               |
| `/dashboard/<cell>/*`     | Célula operacional       | `cellContract.permissions` + RBAC + tenant/escopo + RLS                                                                                                 |
| `/candidato/*`            | Portal pessoal candidato | Política de identidade/role candidato                                                                                                                   |
| `/minha-conta`            | Perfil pessoal           | autenticado                                                                                                                                             |

**Regra de migração:** `/dashboard/global` não deve permanecer como redirect funcional para Admin Master após separação autorizada. Qualquer alias legado deve ser temporário, documentado, sem ampliar acesso e com telemetria.

### D3 — Resolução de identidade ROOT e destino pós-login

**Cadeia:** `auth.users → people → tenant_memberships/role_assignments → roles → role_permissions → permissions` → contexto server-validated → `DispatcherMaster`.

**Identidade ROOT (`admin_master`):** papel/escopo global privilegiado de governança da plataforma. ROOT **não** é sinônimo automático de “qualquer superfície visível”; o acesso efetivo continua sujeito a permissões/contratos/auditoria quando aplicável. ROOT não deve receber amplificação implícita no frontend.

**Destino pós-login (proposta recomendada):**

1. Aplicar gates normativos existentes: recovery → senha obrigatória → onboarding/membership → termos → welcome → seleção de tenant quando exigida.
2. Para **ROOT/admin_master com permissão de Central Global**: destino padrão **`/dashboard/global`** (visão executiva), com navegação explícita e autorizada para `/dashboard/admin-master`.
3. Para perfil estritamente de governança, se modelado separadamente: destino `/dashboard/admin-master`.
4. Nunca escolher destino que colapse as duas superfícies; o usuário deve perceber contexto/superfície distintos.

**Alternativa rejeitada (neste ADR):** manter ROOT sempre em `/dashboard/admin-master` e tratar `/dashboard/global` como alias — perpetua o conflito e mistura observabilidade com governança.

**Pendente formal:** confirmar com produto/RBAC se todo `admin_master` recebe `global.dashboard.read` (ou equivalente) ou se haverá perfis ROOT apenas-governança.

### D4 — Permissões `global.dashboard.*` vs `admin_master.*`

Proposta de namespace (nomes finais **pendentes** de reconciliação com `permissions.code` e `user_has_permission`):

| Namespace            | Finalidade                                     | Exemplos (propostos)                                                                                                                                        | Notas                                                                                                               |
| -------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `global.dashboard.*` | Leitura/observabilidade da Central Global SaaS | `global.dashboard.read`, `global.dashboard.kpis.read`, `global.dashboard.cell_health.read`, `global.dashboard.audit.read`, `global.dashboard.portal.read`   | Menor privilégio; pode ser concedido a perfis executivos globais autorizados, não apenas ROOT, se política permitir |
| `admin_master.*`     | Governança administrativa privilegiada         | `admin_master.tenants.*`, `admin_master.users.*`, `admin_master.rbac.*`, `admin_master.security.*`, `admin_master.config.*`, `admin_master.cells.catalog.*` | Estrito; trilha de auditoria obrigatória para ações sensíveis                                                       |

**Regras:**

- `global.dashboard.*` **não** concede escrita administrativa, gestão RBAC, alteração de tenant/configuração ou acesso privilegiado Admin Master.
- `admin_master.*` **não** deve ser exigido para visualizar KPIs executivos se a política aprovar perfil executivo separado.
- `admin_master` (papel ROOT) pode acumular permissões, mas a UI/rotas devem checar **capabilities/permissões específicas**, não apenas nome de papel, salvo guarda de bootstrap explicitamente aprovada.
- Toda permissão nova deve mapear para `resource.action` canônico e ser validada contra RLS/RPC/Edge.

### D5 — Contrato Global SaaS ↔ Células

- Central Global consome apenas indicadores/saúde/eventos **agregados e autorizados** por contratos aprovados.
- Célula indisponível/degradada: cartão de estado; sem falha global.
- Global não escreve no domínio da célula sem passar por permissão, dispatcher/serviço autorizado, validação server-side e auditoria.

### D6 — Gates de segurança (bloqueadores)

Implementação de dados reais da Central Global, endurecimento de grants, correções RLS/Storage/Edge e separação de rotas com efeitos funcionais **somente após**:

1. ADR final aprovado (decisões D2–D4 fechadas).
2. Stage 02.14 pendências relevantes fechadas (101 policies, varredura `pg_proc` segmentada, provas controladas).
3. Planos de correção P0 com autorização específica por fase (Storage, consents/candidate_documents/Bunker, views públicas, intake, mídia/Edge).
4. Matriz 02.13.1 executada como prova controlada nos domínios impactados.

## Consequências

- **Positivas:** elimina ambiguidade de superfície; reduz risco de privilégio por conveniência; alinha UI com least privilege; prepara Central Global schema/contrato-driven.
- **Negativas/custo:** refatoração de rotas/guards/contratos/páginas duplicadas; coordenação com RBAC e P0; necessidade de testes cross-tenant/ROOT/células.
- **Riscos controlados:** mudanças em helpers RBAC/funções públicas afetam 570 policies e domínios fiscal/financeiro/eventos (Stage 02.14) — proibido alterar sem plano autorizado.

## Checklist de implementação autorizada (futura)

- [ ] Aprovar nomes finais de permissões e destino ROOT.
- [ ] Ajustar `admin-master` cell contract/scope/navigation para governança apenas.
- [ ] Criar contrato/superfície `global-command` ou equivalente (decisão) sem duplicar autoridade.
- [ ] Reverter redirect `/dashboard/global` → Admin Master apenas quando nova Central Global estiver protegida e funcional.
- [ ] Consolidar `GlobalDashboardPage` duplicadas.
- [ ] Atualizar `DispatcherMaster`/guards/tests de navegação.
- [ ] Validar RBAC/RLS/auditoria/acesso direto/tenant A-B.

## Não autorizado por este ADR

Alterações em Supabase remoto, migrations, DDL/DML, RLS/policies/grants, Storage, Edge, código funcional, configuração, commit, push ou deploy. P0 permanecem abertos.
