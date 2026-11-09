# Auditoria do catálogo visual das 26 células

**Projeto:** J&S Empregos LTDA — CHECK BOULER 24H  
**Data:** 2026-11-09  
**Modalidade:** leitura e documentação; nenhuma implementação autorizada  
**Matriz de dados canônica:** `docs/database-driven-ui/STAGE02_MATRIZ_PAGINA_SECAO_DADOS.md`

## 1. Evidência de leitura

O caminho solicitado `dashboard/` não existe. O pacote está no worktree em `dashaboard/`, com erro ortográfico no nome da pasta. A pasta não foi renomeada nesta auditoria.

Foram abertas visualmente e analisadas:

- 26 imagens de dashboards;
- 26 imagens de listagem;
- 26 imagens de criação;
- 26 imagens de detalhe;
- 26 imagens de edição;
- 17 referências conceituais anteriores.

Total estruturado: **130/130 telas**. Total adicional: **17 referências**. Também foram lidos `README.md`, `MATRIZ_26_CELULAS.md`, `PROMPT_EXECUCAO_CODEX.md`, `REACT_TECNICO.md`, o protótipo `App.tsx`, seus estilos e `moduleCatalog.json`.

O protótipo é `REFERÊNCIA_VISUAL_NÃO_IMPLEMENTADA`: usa números e registros fictícios, `window.alert`, navegação por query string e formulários genéricos sem Auth, Supabase, RBAC/RLS ou persistência. Ele não pode substituir o `src/App.tsx` real.

## 2. Contrato de rotas alvo

```text
/dashboard/<modulo>                           dashboard analítico
/dashboard/<modulo>/<recurso>                 listagem / CRUD
/dashboard/<modulo>/<recurso>/novo            criação exclusiva
/dashboard/<modulo>/<recurso>/<id>            detalhes, histórico e relações
/dashboard/<modulo>/<recurso>/<id>/editar     edição exclusiva
```

Exceções canônicas já protegidas:

- Candidato usa `/candidato` e subrotas, pois é um portal pessoal, não um dashboard administrativo.
- Central 24H usa `/dashboard/global`.
- Governança Admin Master usa `/dashboard/admin-master`.
- Aliases antigos permanecem temporariamente até haver prova de desuso; não são fonte de verdade.

`novo` é o padrão alvo. Rotas atuais com `criar` devem ser reconciliadas por alias e telemetria antes de qualquer retirada. Esta auditoria não autoriza alterar rotas.

## 3. Parecer visual transversal

O catálogo estabelece uma identidade coerente: sidebar escura, cabeçalho claro, breadcrumbs, ações primárias, superfícies claras, acentos discretos, tabelas densas e páginas separadas. Ele é adequado como referência de shell, hierarquia e densidade.

Entretanto, a maior parte das 26 células repete o mesmo molde: seis KPIs, gráfico de linha, donut, kanban de cinco etapas, atividades e tabela. As listagens repetem busca e dois filtros; New/Edit repetem o mesmo wizard; Details repetem seis metadados e uma timeline. Isso não constitui especificação operacional suficiente.

Princípio de implementação futura:

- compartilhar tokens, shell, tabela, filtros, estados, form layout e primitives;
- não compartilhar artificialmente modelo de dados, workflow, KPIs, formulário ou autorização;
- usar as imagens como referência visual;
- usar contratos, repositories, Supabase e políticas reais como comportamento e dados.

## 4. Matriz consolidada

Legenda: `REAL` existe no código; `PARCIAL` existe sem a jornada completa; `PROPOSTO` aparece apenas no catálogo; `PENDENTE` exige comprovação de schema/RLS/remoto.

| # | Célula e referência | Rota real / estado | Recurso e cadeia atual | Lacuna operacional prioritária | Testes obrigatórios futuros |
|---:|---|---|---|---|---|
| 01 | Admin Master — `01_admin-master_*` | `/dashboard/admin-master`; Central separada em `/dashboard/global` — REAL | contrato, manifesto, permissions e `people.repository`; tenants/people/roles/memberships/eventos aparecem em contextos | tenants, identidade, limites, suspensão, auditoria e disponibilidade funcional sem health fictício | rotas separadas, global/tenant, permissão, suspensão/reativação, auditoria |
| 02 | Admin Tenant — `02_admin-tenant_*` | `/dashboard/admin-tenant/*` — PARCIAL; não segue ainda `usuarios/novo/:id` | pages/context e permissions `owner.*`; sem repository próprio identificado | convite não é criação direta; memberships, múltiplos papéis, unidade, expiração, MFA e revogação | convite, aceite, expiração, RBAC, isolamento tenant, concorrência |
| 03 | Administração — `03_admin_*` | `/dashboard/admin/*` — PARCIAL | rotas/permissions `admin.*`; contexto consulta tenants, people, roles e eventos | “cadastro” é abstrato; separar usuários, roles, sessões, assinaturas, integrações e auditoria | cada recurso, guard, ações sensíveis, confirmação e trilha |
| 04 | CORE — `04_core_*` | Central observável em `/dashboard/global`; não existe `src/modules/core` — CONFLITANTE | CORE está em `src/core`, CellRegistry e observabilidade | CORE não deve virar CRUD livre; inspeção contratual é read-only salvo operação autorizada | contratos, probes, rotas index, ausência de heartbeat fictício |
| 05 | Integrações — `05_integracoes_*` | `/dashboard/integracoes` somente home — PARCIAL | contrato/manifest/permissions; repository não identificado | provedor, endpoint, segredo, scopes, webhook, retry/DLQ, rate limit e rotação | segredo mascarado, assinatura, retry, idempotência, tenant |
| 06 | Configurações SaaS — `06_configuracoes-saas_*` | home real `/dashboard/configuracoes`, diferente da proposta do catálogo — CONFLITANTE | permission `tenant.manage`; home simples | configuração tipada, escopo, versão, diff, aprovação, vigência e rollback | autorização global, publicação concorrente, rollback e auditoria |
| 07 | Preferências — `07_preferencias_*` | `/dashboard/configuracoes/preferencias` — REAL como home, CRUD genérico PROPOSTO | permissions existem; repository não identificado | preferências pessoais são upsert; separar tema, acessibilidade, notificações, privacidade e sessões | usuário atual, troca de tenant, reset, dark/light, acessibilidade |
| 08 | Candidato — `08_candidato_*` | `/candidato` com 22 rotas — REAL/PARCIAL | repositories de perfil, experiência, formação, cursos, documentos, skills, vagas e alertas; permissions self/jobs/applications | candidatura deve nascer de vaga real; currículo, consentimento, documentos privados, agenda e retirada; P0 e-mail separado | ownership, RLS, confirmação real, candidatura duplicada, upload privado, mobile |
| 09 | Recrutamento — `09_recrutamento_*` | `/dashboard/recrutamento`; vagas já possuem nova/detalhe/editar — PARCIAL forte | repositories jobs, applications, candidates, matches, stages, processos e talent pool | completar candidatos/processos/entrevistas/pareceres; separar vaga, candidatura e pipeline | ATS, transições, tenant, publicação, entrevistas, LGPD, alias |
| 10 | RH — `10_rh_*` | `/dashboard/rh/*` com funcionários, candidatos, vagas e processos — PARCIAL | repository index e permissions people/candidates/jobs/applications | ficha funcional, vínculo, lotação, benefícios, afastamentos, dependentes e histórico salarial | PII, documentos, unidade, transições admissão/desligamento, RLS |
| 11 | Empresas — `11_empresas_*` | home, `lista`, `nova`, `:id`, `:id/editar` — PARCIAL e próximo do alvo | repository index; permissions companies/customers/leads/contracts/quotes/sales | reconciliar `lista/nova` com recurso/`novo`; CNPJ, unidades, papéis comerciais e contratos | unicidade CNPJ, tipo de vínculo, tenant, alias, create/detail/edit |
| 12 | CRM — `12_crm_*` | `/dashboard/crm` somente home — PARCIAL | permissions reutilizam `companies.read`; repository não identificado | lead, contato, owner, valor, probabilidade, etapa, previsão, atividades e perda | ownership, funil, auditoria de etapa, filtros, isolamento tenant |
| 13 | Serviços — `13_servicos_*` | catálogo, ordens, `ordens/criar`, execuções, aceites, ocorrências, avaliações — PARCIAL | repository index e permissions; integração de mídia pendente | separar publicação do catálogo, solicitação e execução; preço, escopo, SLA, cobertura e versão | publicação, snapshot, ordem, aceite, imagem, alias criar→novo |
| 14 | Operações — `14_operacoes_*` | ordens, `ordens/criar`, checklists, materiais, ocorrências e aceites — PARCIAL | permissions existem; repository não identificado | ordem, local, equipe, agenda, checklist versionado, evidência, material e aceite | máquina de estados, timestamps, offline honesto, alias e auditoria |
| 15 | Suporte — `15_suporte_*` | tickets, `tickets/criar`, categorias e tarefas — PARCIAL | permissions support/tasks; repository não identificado | impacto, urgência, SLA, mensagens, anexos, escalonamento, solução e satisfação | isolamento tenant, comunicação, anexos privados, SLA, alias |
| 16 | Estoque — `16_estoque_*` | produtos, `produtos/criar`, movimentos, almoxarifados, compras e inventário — PARCIAL | repository index; permissions stock/purchases/suppliers | saldo deriva de ledger; SKU, lote, validade, reserva, transferência, custo e inventário | concorrência, ledger, saldo, inventário, alias, tenant |
| 17 | AVA — `17_ava_*` | `/dashboard/ava` e `:slug` — PARCIAL | tutorials repository e permissions `ava.read/manage` | cursos, módulos, aulas, turmas, matrículas, progresso, avaliações e certificados | troca de tenant, progresso por matrícula, conteúdo/mídia, acesso negado |
| 18 | Financeiro — `18_financeiro_*` | várias rotas operacionais, sem CRUD canônico completo — PARCIAL | permissions existem; repository dedicado não identificado | valores decimais, conta, categoria, parcelas, rateio, aprovação, liquidação, conciliação e estorno | precisão, idempotência, segregação, fechamento, concorrência |
| 19 | Faturamento — `19_faturamento_*` | `/dashboard/faturamento` somente home — PARCIAL | permission `finance.billing.read`; repository não identificado | itens, competência, vencimento, moeda, impostos, retenções, cobrança, pagamento e cancelamento | cálculo, emissão, idempotência, cancelamento, conciliação, tenant |
| 20 | Contabilidade — `20_contabilidade_*` | dashboard, lançamentos, plano de contas e balancetes — PARCIAL | permissions accounting; repository não identificado | partidas, débito/crédito, lotes, competência, conciliação, fechamento e estorno | equilíbrio contábil, período fechado, auditoria, exportação |
| 21 | Fiscal — `21_fiscal_*` | documentos, `documentos/criar`, configurações, tributos e eventos — PARCIAL | repository index e permissions fiscal | CNPJ, chave, CFOP/NCM, tributos, XML/PDF, manifestação, guias e rejeições | arquivo seguro, validação fiscal, eventos, alias, retenção |
| 22 | Contratos — `22_contratos_*` | `/dashboard/contratos` somente home — PARCIAL | permissions contracts; repository não identificado | contraparte, objeto, vigência, reajuste, cláusulas, aditivos, versões e assinaturas | versionamento, concorrência, assinatura, vencimento, documento privado |
| 23 | POS — `23_pos_*` | vendas, caixas, terminais, cancelamentos e fechamento — PARCIAL | permissions existem; repository não identificado | itens, caixa/sessão, operador, pagamento, autorização, troco, estorno e comprovante | baixa latência, idempotência, concorrência de caixa, fechamento |
| 24 | Relatórios/BI — `24_relatorios_*` | `/dashboard/relatorios` somente home — PARCIAL | permission `reports.read` também usada como manage — CONFLITANTE | datasets autorizados, filtros, agregações, parâmetros, agenda, execução e retenção | cross-tenant, carga, exportação, timezone, falha, autorização por dataset |
| 25 | IA — `25_ia_*` | `/dashboard/ia` somente home — PARCIAL | permissions existem; repository não identificado | provider/modelo, prompt versionado, ferramentas, RAG, custo, guardrails, revisão e kill switch | autorização de fontes, prompt injection, PII, custo, avaliação e auditoria |
| 26 | Mídia — `26_media_*` | `/dashboard/media` com upload/gallery/assets — PARCIAL; `src/modules/midia` paralelo — CONFLITANTE | `media_assets`, permissions media/media_assets e Edge upload; policies remotas pendentes | separar público/privado, MIME/hash, alt/dimensões, versões, preview, retenção e revogação | magic bytes, tenant, bucket, signed URL, PDF privado, duplicidade media/midia |

## 5. Divergências de roteamento encontradas

1. Recrutamento já implementa o padrão mais completo para `vagas`, mas usa `nova`, enquanto o padrão aprovado usa `novo`.
2. Empresas usa `lista` e `nova` em vez de `empresas` e `empresas/novo`.
3. Serviços, Operações, Suporte, Estoque e Fiscal usam `criar` em parte das rotas.
4. Admin Tenant possui páginas administrativas, mas não a jornada canônica de `usuarios` proposta pelo catálogo.
5. CRM, Faturamento, Contratos, Relatórios e IA possuem apenas home registrada.
6. AVA possui dashboard/tutorial, não um CRUD de cursos completo.
7. Financeiro, Contabilidade e POS possuem subrotas operacionais, porém não a família uniforme list/new/detail/edit.
8. Mídia possui implementação `media` e legado/paralelo `midia`; consolidar exige inventário de consumidores.
9. Configurações SaaS e Preferências têm homes diferentes da proposta visual. O contrato real prevalece até decisão arquitetural explícita.
10. Candidato permanece em `/candidato`; não deve ser forçado para `/dashboard/candidato`.

## 6. Ordem de migração recomendada

### Gate V0 — preservar antes de alterar

- estabilizar suíte Gate 1 e auditoria de links;
- registrar baseline visual dark/light/mobile;
- preservar aliases, Auth, footer, Central 24H e DispatcherMaster;
- concluir inventário `media` versus `midia` e rotas legacy.

### Gate V1 — padrão operacional piloto

Escolher uma célula com domínio e dados suficientemente comprovados. Recrutamento/Vagas possui a jornada de rotas mais próxima do alvo; Admin Tenant possui alto risco de identidade/RBAC e não deve ser piloto sem contrato de convite fechado.

Implementar somente após autorização: dashboard → lista → novo → detalhe → editar, usando componentes existentes, repositories reais, permissões e testes.

### Gate V2 — pessoas e recrutamento

Candidato, Recrutamento e RH, mantendo owners funcionais separados e P0 de confirmação de e-mail em trilha protegida.

### Gate V3 — publicação e operação

Empresas, Serviços, Operações, Suporte, Estoque e AVA. Conteúdo público segue DDUI-AVAIL-01; operações privadas não entram em snapshot público.

### Gate V4 — alto risco transacional

Financeiro, Faturamento, Contabilidade, Fiscal, Contratos e POS somente após contratos, precisão, idempotência, segregação e auditoria definidos.

### Gate V5 — plataforma e inteligência

Admin, Admin Master/Tenant, Integrações, Configurações, Preferências, Relatórios, IA e Mídia com gates próprios de segurança.

## 7. Critério de aceite por célula

Uma célula não será considerada reconstruída apenas por possuir sidebar ou dashboard. Deve comprovar:

1. rota canônica e aliases controlados;
2. dashboard com métricas reais ou estado sem fonte;
3. listagem paginada, filtrada e autorizada;
4. criação exclusiva com schema específico;
5. detalhe com relações, histórico e documentos autorizados;
6. edição com pré-carregamento, dirty state e concorrência;
7. cadeia UI → hook/context → repository/service → RPC/query → Supabase;
8. RBAC, RLS, tenant e ownership;
9. loading, empty, error, forbidden, offline e sucesso honesto;
10. dark/light, mobile, teclado e WCAG 2.2 AA;
11. testes unitários, integração, rota e E2E;
12. rollback e ausência de consumidor legacy antes de remoção.

## 8. Estado desta auditoria

- Catálogo visual: `REAL`, lido integralmente.
- Protótipo React: `ESPECIFICADO`, sem integração produtiva.
- Padrão das cinco páginas: `APROVADO COMO ALVO`, implementação desigual.
- Dados das imagens: `FICTÍCIOS`, proibidos como seed ou mock runtime.
- Supabase remoto, Auth, migrations, RLS e Storage: não alterados.
- Código, rotas e componentes: não alterados.
- Commit, push e deploy: não executados.
