# ADR-0001 — Anexo B: Central de Comando Global (especificação de produto/arquitetura)

**Projeto:** J&S Empregos LTDA (CHECK BOULER 24H)  
**Status:** **Proposto — não aprovado. Referência histórica consolidada; sem autorização de implementação.**  
**Data:** 2026-11-06  
**Base:** `ADR-0001-GOVERNANCA_GLOBAL_ADMIN_DISPATCHER.md` (Proposto), `ARQUITETURA_CANONICA_GLOBAL_ADMIN_DISPATCHER.md`, `STAGE02_14_RECONCILIACAO_EVIDENCIAS_E_PARECERES_P0.md`, `STAGE02_14_1B_CLASSIFICACAO_101_POLICIES_PUBLIC.md`, `STAGE02_14_3B_SEGMENTED_PG_PROC_CALLER_SCAN.md`, `STAGE02_13_MATRIZ_REGRESSAO_E_INVENTARIO_COMPLEMENTAR.md`, `docs/AUDITORIA_RECONCILIACAO.md`. Incorpora referências históricas recuperadas: **Consolidação histórica J&S** (arquitetura/hierarquia/células/Active Directory conceitual/identidade/navegação/banco) e **Dashboard Global — Central de Comando** (visão funcional, 6 áreas, mosaicos, KPIs, saúde das células, Portal J&S).

**Natureza:** anexo documental de produto/UX/contratos. **Não autoriza** implementação, alteração de rotas/guards/código, migrações, DDL/DML, `GRANT/REVOKE`, RLS/policies, Storage/Edge/config, leitura/escrita operacional além de auditorias já autorizadas, commit, push ou deploy. **P0 permanecem abertos** (02.14). **Segurança, arquitetura, produto e experiência evoluem juntas, com gates independentes.**

## Classificação de evidência

| Termo                  | Significado                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| **Observado**          | Confirmado em código/docs/auditorias SQL documentadas na data-base.                      |
| **Proposto/Histórico** | Visão recuperada ou decisão alvo; requer aprovação, contrato e implementação autorizada. |
| **Pendente**           | Decisão, evidência, schema/contrato, prova controlada ou autorização faltante.           |

## 1. Objetivo e posicionamento

A **Central de Comando Global SaaS** (`/dashboard/global`, rota canônica alvo) é a superfície de **observabilidade, consolidação executiva e coordenação informacional** da plataforma multi-tenant. Ela apresenta estado agregado e autorizado de células, indicadores globais, operações, portal público e auditoria/resumo de segurança.

**Posicionamento normativo:**

- **Observa** saúde e indicadores; **não assume controle operacional** das células.
- **Consome contratos autorizados**; não executa CRUD interno de domínios de célula, não altera regras de negócio e não substitui dispatchers/serviços de célula.
- **Não é segunda autoridade de autorização.** RBAC efetivo, tenancy, RLS, Storage policies, Edge authorization e auditoria permanecem soberanos.
- **Deve permanecer disponível** mesmo quando células estiverem indisponíveis, por meio de contratos de estado e degradação graciosa.

## 2. Dimensões arquiteturais (não misturar)

| Dimensão         | Responsabilidade canônica                                                                                               | Componentes típicos                                                                                                           | Proibido                                                                                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Governança**   | Identidade, contexto, RBAC, tenancy/unidade/cidade/sistema, políticas, auditoria técnica, catálogo autorizado           | CORE, contratos de autorização, `permissions`/helpers/RLS/RPC/Edge/Storage controls, Admin Master (políticas administrativas) | Operar negócio de célula; conceder acesso por UI/redirect; bypass de RLS/Storage/Edge                                                               |
| **Orquestração** | Resolver destino, validar despacho autorizado, coordenar entrada entre superfícies, aplicar contratos de navegação/ação | **Dispatcher Master** (autoridade única de resolução/despacho), orquestradoras de fluxo, dispatchers locais de célula         | Virar repositório de regras de negócio; acessar Supabase diretamente como autoridade de dados; conceder privilégios; controlar internamente células |
| **Operação**     | Executar domínio: dados, UI local, workflows, validações, integrações e KPIs do negócio                                 | Executores, serviços/repos autorizados, células autônomas                                                                     | Definir identidade global; acessar outras células sem contrato; ignorar governança                                                                  |

## 3. Superfícies e navegação

| Superfície                                    | Finalidade                                                  | Autoridade dominante                                   |
| --------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------ |
| **Sidebar global**                            | Navegação entre células/superfícies autorizadas ao contexto | Governança + Orquestração (catálogo/RBAC/Dispatcher)   |
| **Sidebar local**                             | Navegação própria de cada célula                            | Operação da célula, limitada por Governança            |
| **Dashboard Global** `/dashboard/global`      | Central de Comando (observabilidade/consolidação)           | Governança (permissões) + contratos de observabilidade |
| **Dashboard de célula** `/dashboard/<cell>/*` | Operação do domínio                                         | Operação da célula                                     |
| **Admin Master** `/dashboard/admin-master`    | Governança administrativa privilegiada                      | Governança privilegiada                                |
| **Portal pessoal candidato** `/candidato/*`   | Identidade pessoal do candidato                             | Governança de identidade/role candidato                |
| **Perfil** `/minha-conta`                     | Conta pessoal                                               | Governança de identidade autenticada                   |

**Regra:** navegação dinâmica **não concede privilégio implícito**. Item visível exige checagem de capability/permissão e, quando aplicável, validação server-side. Acesso direto por URL/UUID/RPC/Storage API/`tenant_id` adulterado deve ser negado quando fora de escopo.

## 4. As seis áreas funcionais (Proposto/Histórico)

| Área                                                      | Objetivo                                                                                                                            | Contrato de dados (alvo)                                                                                      | Guardas                                                                                                                             |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **1. Cabeçalho executivo e ações rápidas**                | Contexto da plataforma (tenant/escopo/sistema quando aplicável), status geral, atalhos **autorizados**, identificação da superfície | Contexto server-validated + resumo de saúde agregado + catálogo de ações permitidas                           | Exibir apenas ações/dados permitidos; sem atalho que bypass RBAC/RLS/Dispatcher                                                     |
| **2. Mosaico de KPIs globais**                            | Indicadores transversais consolidados e confiáveis                                                                                  | Métricas agregadas por views/RPCs/serviços **tenant-safe e autorizados**; contratos versionáveis              | **Indicadores reais, sem números fictícios**; RBAC + RLS; respeitar P0-D (views públicas/isolamento) antes de dados reais sensíveis |
| **3. Saúde e disponibilidade das células**                | Estado, lifecycle, health, última atualização, degradação/indisponibilidade                                                         | `CellRegistry` como **catálogo canônico** + contrato de health por célula (pull/push/evento conforme decisão) | Falha de célula **não derruba** Global; cartão degradado/indisponível; sem dependência operacional entre módulos                    |
| **4. Kanban de operações globais**                        | Visão operacional cross-domain **autorizada** (filas, pendências, estados consolidados)                                             | Eventos/filas/indicadores operacionais aprovados por domínio; agregação sem escrita no domínio da célula      | Permissão por domínio/operação; minimização de dados; sem bypass de célula/Dispatcher                                               |
| **5. Portal J&S — indicadores comerciais e operacionais** | Estado do portal público, conteúdo publicado, captação/intake, sinais comerciais/SEO (resumo)                                       | Métricas de portal/intake/conteúdo **após contratos seguros** e resolução tenant/site                         | Respeitar P0-C/D/E/F (contratos, isolamento, intake antiabuso/consentimento auditável, mídia/tenant)                                |
| **6. Auditoria, segurança e atividade recente**           | Eventos, alertas, trilhas administrativas/resumidas, anomalias relevantes                                                           | `domain_events`/audit/security logs conforme permissão; agregação tenant/escopo-safe                          | Capability específica (ex. leitura de auditoria global); minimização LGPD; sem expor segredos/PII desnecessária                     |

## 5. Contrato de observabilidade entre células

**Proposto (contrato mínimo por célula):**

| Campo                          | Tipo/observação                                             | Obrigatório        |
| ------------------------------ | ----------------------------------------------------------- | ------------------ |
| `cellId`                       | ID canônico do `CellRegistry`                               | Sim                |
| `name` / `category` / `domain` | Metadados do contrato                                       | Sim                |
| `healthStatus`                 | `healthy` \| `degraded` \| `unavailable` \| `unknown`       | Sim                |
| `availability`                 | habilitada/desabilitada/manutenção                          | Sim                |
| `lastUpdatedAt`                | timestamp ISO ou nulo                                       | Sim (ou `unknown`) |
| `kpis`                         | lista tipada `{key,label,value,unit?,scope?,source?,asOf?}` | Opcional           |
| `alerts`                       | resumo não sensível                                         | Opcional           |
| `authorizedLinks`              | navegação permitida ao contexto atual                       | Opcional           |
| `errorSummary`                 | código/mensagem segura (sem stack/segredo)                  | Opcional           |

**Regras:**

- Células **independentes e tolerantes a falhas**; cada uma fornece estado por contrato próprio.
- Global **não consulta internals arbitrários**; usa conectores/contratos aprovados.
- Timeout, circuito degradado e fallback são obrigatórios no desenho de implementação (Pendente autorização).
- Indicadores agregados devem declarar fonte, escopo e momento (`asOf`) quando relevante.

## 6. KPIs e fontes reais de dados

| Princípio            | Regra                                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Realidade**        | Sem valores fictícios, seeds apresentados como produção, ou placeholders em produção sem rótulo explícito de estado.     |
| **Fonte autorizada** | View/RPC/tabela/Edge/serviço com RLS/validação compatível ao escopo.                                                     |
| **Escopo**           | Global ≠ tenant ≠ unidade ≠ cidade ≠ sistema/célula; cada KPI declara escopo.                                            |
| **Minimização**      | Agregar antes de expor; evitar PII desnecessária em cards executivos.                                                    |
| **Auditabilidade**   | Fontes críticas e acessos sensíveis rastreáveis conforme política.                                                       |
| **P0 como gate**     | Dados reais sensíveis bloqueados por P0-A–F e pendências 02.14 (Storage/contratos/views/intake/mídia/RBAC blast radius). |

## 7. Estados de disponibilidade e degradação graciosa

| Estado                | Significado                                            | Comportamento Global                                                 |
| --------------------- | ------------------------------------------------------ | -------------------------------------------------------------------- |
| `healthy`             | Contrato respondeu dentro do esperado                  | Exibir KPIs/estado normal                                            |
| `degraded`            | Resposta parcial, atraso, métrica incompleta           | Exibir dados parciais + indicador de degradação + `asOf`/erro seguro |
| `unavailable`         | Célula/contrato indisponível, timeout, erro controlado | Exibir cartão indisponível; demais áreas/células continuam           |
| `unknown`             | Sem contrato/telemetria ou não autorizado a ler estado | Exibir estado neutro; não inferir saúde positiva                     |
| `forbidden` (interno) | Contexto sem permissão para detalhe                    | Omitir detalhe sensível; nunca vazar por fallback                    |

**Invariante:** falha de uma célula **não pode** impedir renderização do shell Global, autenticação válida, navegação autorizada ou leitura de outras células permitidas.

## 8. Contrato de navegação global e local

| Regra             | Detalhe                                                                                                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Catálogo**      | `CellRegistry` é referência canônica de células/contratos; navegação master dinâmica depende de catálogo autorizado + RBAC efetivo (Pendente).                                                   |
| **Entrada**       | `/dashboard` permanece entrada neutra resolvida por `DispatcherMaster.resolveDestination()` (Observado).                                                                                         |
| **Resolução**     | Dispatcher aplica cadeia normativa (recovery/senha/onboarding/membership/termos/welcome/seleção tenant/perfil/permissões). **Não** decide por conveniência de UI.                                |
| **Separação**     | Global e Admin Master: rotas, guards, permissões e componentes canônicos distintos (ADR-0001 D1–D3). Redirect `/dashboard/global`→admin-master é conflito observado/legado, **não** estado alvo. |
| **Local**         | Cada célula controla sub-rotas internas dentro do seu domínio e permissões.                                                                                                                      |
| **Acesso direto** | URL direta exige o mesmo guard/RBAC/contexto; ausência de menu não é controle.                                                                                                                   |

## 9. Separação entre Global, Admin Master e Dispatcher

| Componente            | Pode                                                                                                                                               | Não pode                                                                                                                                            |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Central Global**    | Consolidar, observar, alertar, linkar navegação autorizada, acionar apenas fluxos explicitamente permitidos por contratos seguros                  | Administrar RBAC/tenants globalmente como autoridade primária; alterar dados internos de célula; substituir Admin Master/Dispatcher/CORE            |
| **Admin Master**      | Governança privilegiada: tenants, usuários administrativos, RBAC, segurança, configuração, catálogo/módulos/células (conforme contratos aprovados) | Absorver operação diária das células; substituir observabilidade executiva Global; virar dispatcher universal                                       |
| **Dispatcher Master** | Resolver destino autorizado e coordenar despacho validado                                                                                          | Conter regras de negócio de domínio; acessar dados diretamente como autoridade; substituir RLS/policies/Edge/Storage; controlar internals de célula |

**Correção conceitual preservada:** a Central Global pode observar saúde de todas as células, mas **não** pode assumir seu controle operacional. O Dispatcher **não** deve virar repositório de regras de negócio.

## 10. Segurança, isolamento de tenant e autorização

| Controle              | Requisito                                                                                                                                      |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Identidade**        | `auth.users != people`; cadeia `auth.users → people → tenant_memberships → role_assignments → roles → role_permissions → permissions`.         |
| **Contexto**          | Contexto server-validated (sistema/tenant/unidade/cidade quando aplicável); frontend não é autoridade.                                         |
| **Default deny**      | Ausência de permissão/contrato = negar.                                                                                                        |
| **Isolamento**        | RLS/Storage/Edge/RPCs tenant-safe; views públicas e intake exigem resolução segura (não `tenant_id` do browser). Gates P0-D/E.                 |
| **Storage sensível**  | Bunker/`private-documents` e contratos de documentos/consentimento: gates P0-A/C/LGPD.                                                         |
| **RBAC blast radius** | 570 policies/207 tabelas helpers + 417 policies A–D (02.14/02.14.1b/02.14.3b): qualquer mudança exige matriz 02.13.1 e autorização específica. |
| **Auditoria**         | Ações sensíveis, acessos administrativos e eventos relevantes auditáveis; leitura de auditoria global exige capability.                        |
| **Navegação**         | `CellRegistry`/catálogo + RBAC efetivo; sem ampliação implícita.                                                                               |

## 11. Critérios de aceite e dependências

**Aceite (para futura implementação autorizada):**

1. `/dashboard/global` e `/dashboard/admin-master` distintos em propósito, rota, guard, permissões e componente canônico.
2. Global renderiza com células `healthy/degraded/unavailable/unknown` sem falha global.
3. KPIs/cards declaram fonte/escopo/`asOf` quando aplicável; sem dados fictícios.
4. Nenhum link/ação do Global executa CRUD interno de célula sem contrato, permissão, validação server-side e auditoria.
5. Acesso direto e cenários tenant A/B/unidade/cidade/ROOT negados quando fora de escopo (02.13.1).
6. `CellRegistry` e contratos de health/KPI documentados e testáveis.

**Dependências/gates:**

- ADR-0001 aprovado (incl. D2–D4 finais).
- P0-A–F tratados ou com planos autorizados e provas controladas.
- Pendências 02.14.1b/02.14.2b/02.14.3b relevantes fechadas (incl. mapeamento `pg_depend`→`pg_policy`, varreduras complementares, Storage proofs).
- Matriz 02.13.1 executada nos domínios impactados.
- Contratos `global.dashboard.*` reconciliados com `permissions.code`/`user_has_permission`/RLS.

## 12. Pendências e decisões que exigem aprovação

1. Aprovar ADR-0001 e este Anexo B (ou versão revisada).
2. Nomes finais: “Central de Comando Global SaaS”/`global-command`/equivalente; namespaces `global.dashboard.*` e `admin_master.*`.
3. Destino pós-login ROOT/admin_master (Global com atalho governança vs Admin Master direto; perfis estritamente governança).
4. Modelo contratual: `admin-master` como governança apenas; superfície Global separada (contrato/célula técnica) sem autoridade paralela.
5. Rota administrativa canônica de candidatos (evitar colisão `/candidato/*` pessoal vs administração).
6. Contrato técnico de health/KPI por célula (schema, transporte, cache, timeout, auditoria).
7. Catálogo/fonte Supabase para navegação master dinâmica (somente após auditoria e autorização).
8. Plano autorizado para P0 e para qualquer alteração de helpers RBAC/funções com EXECUTE amplo (ex. `resolve_page_template`, `current_person_id`, `is_tenant_member`).

---

**Estado de governança:** ADR-0001 **Proposto/não aprovado**. 02.14.1b e 02.14.3b **documentados**. P0 **abertos**. Implementação **não autorizada**. Supabase remoto e Git **sem alterações**.
