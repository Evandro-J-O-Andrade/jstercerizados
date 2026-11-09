# J&S Empregos LTDA — LEVANTAMENTO MESTRE PARA CODEX
## Visão original × arquitetura CHECK BOULER 24H × execução real × lacunas × próximo plano

**Data do retrato:** 07/11/2026 (Brasil)  
**Propósito:** passagem de conhecimento de engenharia ChatGPT ↔ Codex no VS Code.  
**Código remoto consultado:** `Evandro-J-O-Andrade/jstercerizados`, `main@972af8e4f4181ff7f56e5c8c20d14ea14cd60e54`.  
**Workspace informado pelo Codex/Kilo:** `C:\NewWaveProjetos\jrtercerisados`, branch `main`, `HEAD` e `origin/main` local em `972af8e`; trabalho de código rastreado limpo no último relatório. Confirmar novamente no PC.  
**Supabase exclusivo:** `okxqfyoqbhcmflpurfrw` (`js-empregos`). **Domínio citado no projeto:** `jsempregos.com.br`; não assumir que o deploy corresponda ao último commit.  
**Natureza:** fotografia documental consolidada — NÃO é ordem para implementar, alterar banco, rodar migration, enviar e-mails, fazer commit/push ou deploy.  
**Prioridade do agente:** obedecer ao `AGENTS.md` real do workspace, às regras locais e às autorizações do proprietário. Este documento não as substitui.

> **LEGENDA DE EVIDÊNCIAS**: **VERIFICADO/GITHUB** = observado na `main@972af8e`; **VERIFICADO/SQL** = consultas remotas de leitura referidas no histórico de 07/11; **RELATO LOCAL** = evidência fornecida pelo Codex/Kilo, ainda não repetida por este documento no PC; **HISTÓRICO/REQUISITO** = intenção de produto/decisão anterior; **PROPOSTO** = ADR/plano ainda não aprovado ou não executado; **PENDENTE** = exige validação; **MOCK/STUB** = efeito simulado ou interface sem operação correspondente. Não transformar uma categoria em outra sem evidência.

---

## 1. Em uma frase: o que é o sistema

**J&S Empregos LTDA** deve ser uma **plataforma SaaS real e multi-tenant** que conecta candidatos a oportunidades e empresas à contratação e gestão de serviços de RH/terceirização (segurança, limpeza, zeladoria, controle de acesso, facilities e serviços relacionados), com portais públicos e áreas privadas de candidatos, empresas e equipes internas. O produto evolui sob a arquitetura **CHECK BOULER 24H**, que mantém **governança centralizada no CORE, despacho coordenado pelo DispatcherMaster e execução autônoma em células**.

**Não é:** landing page estática, CMS apenas visual, dashboard decorativo, CRUD falso, protótipo com RBAC simulado, website isolado sem operações, ou um portal especial com poderes ilimitados.

**Regra inegociável do `AGENTS.md`:** preservar exatamente o nome **“J&S Empregos LTDA”** na aplicação e **NÃO alterar o footer**. Fontes históricas falam “J&S Terceirizados”; não renomear a marca por causa disso.

**Separação obrigatória de projetos:** NÃO misturar código, contexto, dados, identidade, infraestrutura ou migrations com **Remoção Alpha** nem com **Angel Cosméticos**.

## 2. O QUE ERA PARA SER — objetivo do cliente, requisitos e promessa operacional

### 2.1 Origem do escopo (histórico de agosto de 2026)

A intenção evoluiu de um portal institucional de terceirização/captação de interessados para um **site SaaS com rotas e funcionalidades reais**. Solicitações do cliente incluíram as mensagens de capa **“Mais eficiência em RH. Mais resultados para sua empresa”**, **“Mais eficiência em Recursos Humanos, mais agilidade para sua empresa”** e **“Conectando talentos às melhores oportunidades.”** A comunicação deve articular atração de candidatos e eficiência de contratação para empresas.

**Página pública/Home esperada:** logo, início, vagas, empresas, candidatos, serviços, sobre nós, blog, contato, botões “Cadastrar Currículo” e “Divulgar Vaga”; banner, apresentação dos serviços, destaque de vagas reais, etapas de inscrição/seleção, diferenciais, parceiros/clientes reais, depoimentos autorizados e CTA B2B “Solicitar Orçamento”. O usuário explicitou que **não quer apenas landing page**.

**Jornada do candidato:** navegar vagas; pesquisar por cargo/cidade/estado/área/tipo de contrato/faixa salarial/data; visualizar requisitos/benefícios; criar conta; confirmar e-mail; acessar área protegida; preencher formação, experiências, habilidades, idiomas; enviar/atualizar currículo PDF; salvar vagas e alertas; acompanhar histórico/candidaturas, entrevistas e processos; gerir preferências. Interesses históricos em cargos de limpeza, controlador de acesso, zelador e funções operacionais, além de vagas administrativas/industriais.

**Jornada da empresa:** cadastro/autenticação; perfil institucional; solicitar profissionais/orçamentos; divulgar vagas; gerenciar processos seletivos e entrevistas; banco de talentos conforme autorização e LGPD; acompanhar contratações e relatórios; vincular serviços terceirizados; imagens/logos e eventual galeria empresarial autorizada.

**Jornadas de captação diferenciadas:** formulários separados para **Contato, Parceiros, Fornecedores** e **Trabalhe Conosco**, cada um com finalidade e persistência adequadas. Não confundir *lead comercial*, *inscrição em vaga*, *cadastro de identidade Auth*, *currículo* e *candidatura*: são entidades/fluxos distintos.

**Outras expectativas históricas:** serviços de recrutamento/seleção, mão de obra temporária, terceirização, hunting, avaliação de perfil, banco de talentos, orientação ao candidato; blog, SEO, WhatsApp, e-mails/alertas, páginas de políticas/termos, integração com redes; design responsivo, dark/light, segurança e painéis administrativos. Recursos e métricas citados em esboços (ex.: milhares de currículos, parceiros, contratações ou 95% de satisfação) eram **exemplos de conteúdo**, NÃO dados apurados. Nunca publicá-los como números reais sem fonte.

### 2.2 Critério de produto concluído

Uma tela é **REAL** quando há rota acessível sob perfil autorizado, componente conectado ao serviço/repository correto, operação persistida ou consulta efetiva, permissões apropriadas, RLS/tenancy verificados, tratamento de `loading/erro/vazio/sucesso` e testes. Uma rota que existe, menu visível, `alert('sucesso')`, toast “em desenvolvimento”, `localStorage` ou `lifecycle.health='healthy'` estático **não basta**.

### 2.3 Entregáveis comerciais e contratuais da origem

O pedido inicial também incluía **proposta contratual, orçamento de desenvolvimento/venda do site, domínio, hospedagem/deploy e responsabilidades de entrega/manutenção**. Essa é uma **exigência comercial histórica**, não prova de que já exista contrato aprovado, preço final, titularidade formal de domínio ou deploy homologado. O Codex deve localizar documentos comerciais existentes antes de preparar qualquer novo orçamento ou termo; não fabricar valores nem criar obrigação contratual no código.

**Outras entregas que dependem de operação real:** política de privacidade/termos adequados à LGPD, consentimento para currículos, políticas de retenção, disponibilização da aplicação em domínio próprio e rotinas de suporte. A existência de páginas `/privacidade` e `/termos` não homologa o conteúdo jurídico.

## 3. O QUE DECIDIMOS COMO ARQUITETURA — CHECK BOULER 24H

### 3.1 Separação de autoridades (histórico + documentos normativos)

```text
VISITANTE / USUÁRIO AUTENTICADO
      |
      v
CORE / GOVERNANÇA GLOBAL
   identidade • tenant/contexto • RBAC • segurança • auditoria
      |
      v
DispatcherMaster — valida contexto/destino/despacho; default deny
      |
      v
Orquestradores globais — contratos e coordenação entre células
      |
      v
Dispatchers locais — validação e direcionamento por domínio
      |
      v
Executores / Services / Repositories / RPC / Edge
      |
      v
CÉLULAS OPERACIONAIS — UI + dados próprios + rotas + regras + testes
      |
      v
SUPABASE — fonte de verdade, banco multi-tenant, RLS, Auth, Storage
```

**CORE governa, não executa o negócio da célula.** `DispatcherMaster` coordena despacho e valida contexto; não é menu, não é sidebar, não deve consultar Supabase diretamente nem conceder privilégios. Cada célula deve possuir contratos, rotas, dashboard/sidebar quando aplicável, operações, services/repositories, executores, indicadores e segurança próprios. A ideia de orquestradores/dispatchers locais é **objetivo arquitetural**; sua implementação completa não foi comprovada para 26 células.

**Hierarquia inspirada conceitualmente em Active Directory:** domínios, grupos, escopos, delegação, políticas e herança **sem instalar AD**. Um nível inferior não pode ampliar privilégios ausentes no nível superior. Não introduzir ROOT automático como bypass de RLS.

**Central de Comando Global ≠ Admin Master ≠ DispatcherMaster.** Central Global observa saúde/KPIs cross-cell com fontes autorizadas; Admin Master governa tenants/usuários/RBAC/segurança; DispatcherMaster resolve despacho e contexto. Os ADR-0001, Anexo B e demais documentos dessa separação foram publicados como **proposta normativa**, não aprovação de mudança irrestrita. Parte do roteamento legado ainda pode enviar `admin_master` para `/dashboard/admin-master`; não redesenhar esse destino sem decisão.

**Não criar “Portal J&S” privilegiado paralelo.** A aplicação tem portais e superfícies próprios, mas poderes vêm somente dos contratos e do banco.

### 3.2 Identidade e autorização canônica

```text
auth.users → public.people → tenant_memberships
                         → role_assignments → roles
                                            → role_permissions → permissions
```

- `people` representa pessoa do domínio; `auth.users` é identidade de autenticação.
- `roles.scope` distingue global e tenant; papel global `admin_master` com `tenant_id=NULL`, conforme contrato real.
- Seleção de tenant é **explícita e validada**; não escolher automaticamente a primeira membership nem confiar em UUID fornecido pelo browser.
- `PermissionGuard`, `ProtectedRoute`, `AuthRoute`, `ModuleRouter` e adapters não substituem autorização no servidor/RLS/Storage/Edge.
- `CellRegistry` descobre contratos; **registro não concede acesso**.
- `MODULE_PERMISSION_MAP` + contratos de células + `public.permissions.code` precisam da **mesma chave canônica ou tradução provada**.
- O `ModuleRouter` usa `some()` em `requiredPermissions`: atualmente trata lista multi-permissão como **ANY/OR**; verificar quais rotas precisam de **ALL/AND**, sem alterar semântica geral às cegas.
- O `scope` `global/tenant`, o contexto de execução, políticas de RLS e eventual autorização Edge devem ser coerentes.

### 3.3 Navegação e design

**Dois níveis de navegação:** sidebar global apresenta células permitidas; sidebar local pertence à célula e apresenta suas funcionalidades autorizadas. Não duplicar menus, não inventar links, não misturar sidebar com DispatcherMaster.

**Database-Driven UI/UX:** UI e regras executáveis em código, dados/configurações/identidades/permissões no banco. Banco alimenta a UI — **não constrói componentes React arbitrários nem autoriza só por JSON/menu**. Fazer inventário de páginas, serviços e dados existentes antes de propor schema.

**Visual e tecnologia verificados:** React 19, TSX/TypeScript, Vite, Tailwind CSS, React Router, Zod, React Hook Form, Supabase JS, Vitest; tema canônico `ThemeContext.tsx`, tokens J&S, dark/light/system e responsividade. Preservar padrões atuais, sem novo ThemeProvider paralelo nem redesign desnecessário. A plataforma deve ser SaaS utilizável, com tabelas/filas operacionais legíveis, não cards decorativos gigantes.

## 4. AS 26 CÉLULAS — inventário de intenção e evidência (07/11)

As 26 foram encontradas em `src/core/cells/register-cells.ts`. A registry de `ModuleRoute[]` em `src/platform/router/module-routes.ts` lista 16 famílias; outras podem existir em `App.tsx`/rotas próprias. **Ausência em `module-routes.ts` não prova ausência de rota, e presença no registry não prova CRUD.**

| # | Célula | Função esperada | Evidência / limite conhecido |
|---:|---|---|---|
| 1 | `candidato` | Portal, perfil, currículo, vagas, favoritos, alertas, candidaturas, entrevistas | ~22 entradas de rotas com componentes próprios. Bootstrap real confirmado em casos examinados; confirmação/login/E2E/RLS por identidade não homologados. |
| 2 | `recrutamento` | Gestão de vagas, candidatos, etapas, matches, demandas, talent pool | Rotas canônicas reconciliadas e dashboard com dados reais via `useRecrutamento`; testes alvo 19 passaram; full build/visual pendente; rotas de criação ausentes do contrato não foram inventadas. |
| 3 | `empresas` | Cadastro/gestão B2B, vagas, perfil, demandas, candidatos autorizados | ~5 rotas próprias de dashboard/lista/nova/detalhe/editar; CRUD real e segregação de tenants ainda exigem homologação. |
| 4 | `admin` | Administração de usuários, tenants, segurança, módulos, auditoria | ~13 rotas declaradas; chaves `admin.*` divergentes do catálogo remoto em amostra histórica. Testar guards e operações. |
| 5 | `media` | Biblioteca, ativos, uploads, galerias e seleção de mídias | ~4 rotas próprias; contratos/frontend/buckets/permissões não reconciliados integralmente; histórico de bunker é proposta, não bucket real. |
| 6 | `rh` | Funcionários, recrutamento interno, processos, documentos, matching | ~13 rotas; uma rota detalhe de processo possui `null`/`coming_soon`; reusa componentes de recrutamento. |
| 7 | `financeiro` | Contas, caixa, transações, conciliação, centros de custo | ~11 rotas distintas, queries reais em áreas; ações “Nova transação”/“Nova conciliação” com toast “Em desenvolvimento” (não CRUD completo). |
| 8 | `contabilidade` | Plano de contas, lançamentos, balancetes | ~4 rotas distintas declaradas; operação, integrações e RLS não validados E2E. |
| 9 | `suporte` | Chamados, categorias, tarefas, atendimento | ~5 rotas; 4 reutilizam `SuportePage` genérica. |
| 10 | `estoque` | Produtos, movimentos, almoxarifados, compras, inventário | ~7 rotas; 6 renderizam `Estoque` genérica; contrato de estoque/permissões incompleto em amostra. |
| 11 | `ava` | Aprendizado, treinamentos, tutoriais | ~2 rotas declaradas; verificar serviço real e catálogo de permissões. |
| 12 | `servicos` | Catálogo, ordens, execuções, aceites, ocorrências, avaliações | ~8 rotas; 7 renderizam `ServicosListPage` (com tabs/CRUD parcial), insuficiente para presumir operações especializadas completas. |
| 13 | `fiscal` | Documentos fiscais, tributos, eventos e configurações | ~6 rotas apontam para `FiscalPage` genérica. |
| 14 | `operacoes` | Ordens operacionais, checklist, materiais e ocorrências | ~7 rotas apontam para `GestaoPage` genérica. |
| 15 | `pos` | Caixa, venda, terminais, cancelamentos e fechamento | ~6 rotas apontam para `FaturamentoPage`; operação PDV real não homologada. |
| 16 | `admin-master` | Governança ROOT/global de tenants, RBAC, segurança | Existe contrato e rotas; não confundir com Central Global. Roteamento ROOT/Global historicamente conflitante. |
| 17 | `admin-tenant` | Governança interna de um tenant/sistemas/unidades | ~9 rotas declaradas; divergências de chaves `owner.*` na amostra histórica. |
| 18 | `core` | Contratos fundacionais, contexto e governança técnica | Registrada; não presumir superfície operacional completa por existir contrato. |
| 19 | `integracoes` | Webhooks/conectores/sincronizações autorizadas | **Conflito específico verificado:** `src/cells/integracoes/cellContract.ts` é registrado com `routes:[]`; há outro contrato em `src/modules/integracoes/cellContract.ts` com rotas mapeadas. Reconciliar sem duplicar. |
| 20 | `contratos` | Contratos com clientes/parceiros/fornecedores | Página raiz explicitamente `Em construção` no snapshot auditado. |
| 21 | `crm` | Leads, relacionamento comercial, pipeline B2B | Página raiz explicitamente `Em construção`. |
| 22 | `faturamento` | Faturamento comercial/integrado | Página raiz explicitamente `Em construção` (não confundir com Financeiro). |
| 23 | `relatorios` | Indicadores, relatórios auditáveis por domínio | Página raiz explicitamente `Em construção`. |
| 24 | `ia` | Recursos assistivos autorizados e auditáveis | Página raiz explicitamente `Em construção`; não expor PII a serviços externos sem governança. |
| 25 | `configuracoes-saas` | Configuração institucional global por escopo | Página raiz explicitamente `Em construção`. |
| 26 | `preferencias` | Preferências seguras e contextuais do usuário | Página raiz explicitamente `Em construção`. |

**Classificação disciplinada:** `REAL`, `PARCIAL`, `MOCK`, `STUB`, `ESPECIFICADO`, `PROPOSTO`, `ÓRFÃO`, `OBSOLETO`, `CONFLITANTE`, `NÃO VERIFICADO`. Não rotular toda a célula como pronta quando apenas dashboard/rota existir.

### 4.1 A matriz definitiva que ainda falta completar por cada uma das 26

`célula → CellContract (id/scope/homeRoute/routes/permissions) → rota montada (App/moduleRoute) → menu/sidebar → guard + semântica ANY/ALL → componente → hook/context → service/repository/executor → RPC/query/Edge → entidade/tenant_id → RLS/Storage → CRUD realmente executado → testes → estado`.

A matriz deve incluir links para **arquivo/linha**, estados de loading/empty/error, se há toast sem operação, se há redirecionamentos/rotas órfãs, se o dado é real, se a UI cumpre dark/light e mobile. Manter “indeterminado” se não há evidência.

## 5. SITE PÚBLICO E PORTAIS — presente versus faltante

**Rotas públicas verificadas no inventário anterior:** `/`, `/vagas`, `/vagas/:slug`, `/empresas`, `/empresas/divulgar-vaga`, `/candidatos`, `/clientes`, `/parceiros`, `/fornecedores`, `/servicos`, `/servicos/:slug`, `/trabalhe-conosco`, `/processo-seletivo`, `/sobre`, `/blog`, `/blog/:slug`, `/suporte`, `/faq`, `/contato`, `/privacidade`, `/termos`.

**Acesso/identidade e recuperação:** `/login`, `/entrar`, `/entrar/admin`, `/entrar/candidato`, `/entrar/empresa`, `/cadastro`, `/cadastro/candidato`, `/cadastro/empresa`, `/recuperar-senha`, `/redefinir-senha`, `/auth/callback`, `/auth/terms`, `/auth/welcome`, primeiro acesso, seleção de tenant e onboarding. Existem rotas; fluxo E2E não homologado.

**Persistência pública P0 comprovada:**
- `src/pages/Contato.tsx` → `src/services/mock/contatos.ts` → `localStorage` (`jst_contacts`), exibindo confirmação sem persistência central.
- `Parceiros.tsx` → `mock/parceiros.ts` → `jst_partners`.
- `Fornecedores.tsx` → `mock/fornecedores.ts` → `jst_suppliers`.
- `JobApplicationForm.tsx` usa `fetch(...HEAD, mode:'no-cors')` em fluxo WhatsApp e confirma sem prova de candidatura persistida.
- `ServiceRequestForm.tsx` abre WhatsApp e sinaliza sucesso sem confirmação de envio. **`TrabalheConosco.tsx` é um fluxo distinto** que chama `submitCandidateApplication`; não igualar tudo a mock.

**Resultado requerido:** submissões de leads/vagas/candidaturas com backend aprovado, antiabuso, LGPD, deduplicação, estados reais e integração CRM/operacional quando existente; ou estado honesto de indisponibilidade até o backend estar pronto. Não criar novas tabelas nem RPCs sem inventário de schema e autorização.

## 6. P0 CANDIDATO/AUTH — o que foi comprovado até aqui

### 6.1 Evidência remota consolidada (07/11; somente leitura)

- `trg_bootstrap_candidate_from_auth_user`, `on_auth_user_created`, `trg_bootstrap_company_from_auth_user` **presentes e habilitados** em `auth.users`; ausência de trigger **não** é explicação para os casos analisados.
- Desde setembro/2026, entre registros `signup_context='candidato'`: **2 Auth**, **2 people**, **2 candidates**, **2 memberships ativas**, **2 papéis `candidato`**, **2 estados de primeiro acesso**, **1 confirmado**, **1 ainda pendente**.
- Candidato pendente tem `confirmation_sent_at` e evento histórico `user_confirmation_requested`. **Esses sinais não provam entrega no mailbox**.
- Candidato confirmado possui registro de login; mecanismo pelo qual confirmou não foi reconstruído.
- Janela sanitizada de Auth logs examinada por Kilo (06/11/2026 11:12 a 07/11/2026 11:12 BRT): 15 registros Auth e 12 de audit, sem erro SMTP explícito; a solicitação de confirmação era anterior à janela. **Ausência de log não prova funcionamento SMTP.**
- Configurações hospedadas Confirm Email/SMTP, template, URL allow-list, evidência do provedor e uso do link **continuam não verificadas** no acesso de leitura disponível. `supabase/config.toml` local e `docs/AUTH-EMAIL-SMTP.md` são fontes **de intenção/local**, não prova da hospedagem.
- Bootstrap remoto lido: resolve tenant fixo `slug='js-empregos'`, cria `people`, membership, `first_login_state`, `candidates` e atribuição de `candidato` se o papel existir; ignora explicitamente `signup_context='empresa'` mas não exige estritamente `candidato` em todos os contextos. **Achado separado para auditoria**, não gatilho para refazer função agora.
- RLS habilitado em tabelas de identidade; **política existente não comprova, por si, a eficácia de isolamento sob identidade de candidato real**.

### 6.2 Problemas de frontend comprovados e ainda sem correção publicada

- `CadastroCandidato.tsx`: `email_pending` exibido por `setError()` no bloco destrutivo; deveria ser estado informativo com orientação.
- `CadastroCandidato.tsx`/`Login.tsx`: dupla normalização de strings de erro já amigáveis do `AuthContext`, perdendo orientação de e-mail não confirmado; mocks de teste podem mascarar.
- `AuthCallback.tsx`: examina `location.search` para `error`, ignora erros do hash/fragmento; encaminha texto à rota `/login?error=...` e o login não consome esse valor adequadamente.
- `AuthCallback.tsx`: possibilidade de spinner permanente se não houver sessão/pessoa; solução requer hidratação tardia respeitada, timeout de interface/fallback, sem invalidar sessão.
- `CadastroCandidato` envia `emailRedirectTo='/entrar/candidato'`, documento `AUTH-EMAIL-SMTP.md` descreve `/auth/callback`; **conflito, não prova de defeito real** devido a `detectSessionInUrl` e configs remotas não verificadas.
- Não foi localizado fluxo de `supabase.auth.resend()` no frontend; **reenvio é subescopo separado**, com regras de rate limit/CAPTCHA/UX e política de URL.

### 6.3 Proposta mínima para execução futura — ainda requer liberação expressa

**Arquivos previstos:** `src/pages/CadastroCandidato.tsx`, `src/pages/auth/AuthCallback.tsx`, `src/pages/Login.tsx`, talvez um utilitário puro `src/lib/auth-callback-error.ts` se comprovadamente não houver equivalente, testes em `src/__tests__/auth/*`. Reutilizar `FormAlert`, `ErrorState`, `TimeoutState`, `useTimeout` existentes. Não modificar contrato público do `AuthContext` nesta etapa.

**Correções:** status informativo de confirmação pendente; exibição de mensagens já sanitizadas do Auth sem normalizar duas vezes; parsing seguro de erros de query e fragmento usando códigos permitidos (nunca espelhar token/descrição arbitrária); fallback determinístico no callback que não reprova hidratação tardia; mensagem segura única no login; testes com normalizador real, timer fake e contexto de candidato/empresa/admin.

**Preservar:** `emailRedirectTo`, `signup_context`, Turnstile, seleção explícita de tenant, AuthRoute/ProtectedRoute, `DispatcherMaster`, RLS, triggers, configs do Auth. **Não** enviar e-mail nem alterar SMTP como parte dessa correção. `docs/AUTH-EMAIL-SMTP.md` contém proibição histórica de editar três arquivos; uma liberação do proprietário para esses arquivos precisa ser registrada como **exceção restrita** antes de implementar.

**DoD P0:** front-end UX/testes aprovados ≠ confirmação entregue. O P0 só se encerra depois de provar em ambiente autorizado cadastro → solicitação → recebimento → link válido → `email_confirmed_at` → login → identidade/tenant → Portal do Candidato sob RLS.

## 7. CENTRAL GLOBAL, ADMIN MASTER E RECRUTAMENTO — última execução publicada

**GitHub main** aponta para `972af8e` (commit `feat: add global command observability and reconcile recrutamento UI`, 32 arquivos no commit). Inclui:
- `src/pages/dashboard/GlobalCommandPage.tsx` e testes; observabilidade `src/core/observability/*`, integração em `CellRegistryContract.ts`, `useGlobalDashboardStats.ts`, `App.tsx` e sidebar Admin Master.
- Recrutamento: `src/modules/recrutamento/RecrutamentoRoutes.tsx` agora **reexporta** o canônico `RecrutamentoRoutes/RecrutamentoRoutes.tsx`; `cellContract.ts` alinhado, DashboardRecrutamento com fontes reais via `useRecrutamento` + estados honestos; navegação remove rotas de criação não declaradas (`vagas/nova`, `candidatos/novo`, `processos/novo`, `demandas/nova`).
- `RecrutamentoProvider` montado por rota via `withProvider`; não foi detectada dupla instância simultânea. Remount por navegação é comportamento atual a avaliar, não bug automaticamente.
- Central Global consulta estado de contrato/observabilidade e métricas permitidas; `health:'healthy'` estático em diversos contratos **não** é prova de monitoramento de infraestrutura, uptime ou operação real. Probes locais devem se apresentar como tais.

**Validação apresentada:** Vitest alvo **5 arquivos/18 testes** + `RecrutamentoContext.tenant-isolation.test.tsx` **1 teste** = **19 testes direcionados**, aprovados no checkpoint local. **Não existem outputs finais registrados** para `npx tsc --noEmit` global, `npm run lint`, `npm run build` com exit codes, ou smoke visual dark/light/mobile/loading/vazio/erro. Não declarar produção homologada. Em alterações subsequentes, reexecutar após autorização e registrar resultados.

**Governança de dashboards:** Central Global observa/consolida; Admin Master executa governança; dashboards de células não se confundem com formulários/CRUDs. Não transformar o ROOT em bypass nem criar “portal privilegiado” alternativo.

## 8. SEGURANÇA P0-B E MÍDIA — estado real versus proposta histórica

### 8.1 Estado real P0-B `services-images`

- Migration `supabase/migrations/20261106120000_p0b_services_images_drop_authenticated_and_public_policies.sql` **versionada na `main@972af8e`**, **NÃO registrada/aplicada** no remoto em 07/11.
- Quatro políticas ainda presentes em `storage.objects`: `services_images_public_read` (`SELECT/public`); `services_images_authenticated_write` (`INSERT/authenticated`), `_update` (`UPDATE/authenticated`), `_delete` (`DELETE/authenticated`).
- O predicado de escrita confere pessoa/membership ativa, **sem amarrar ao tenant dono do path/objeto/entidade e ao código de permissão de operação**. Há risco de escrita cross-tenant (análise de predicado); não afirmar exploração reproduzida.
- Bucket `services-images` existe, **0 objetos** no levantamento de 07/11. Isso reduz conteúdo atual exposto, **não elimina o defeito de autorização de upload futuro**.
- P0-B fase 1 removeria quatro policies sem substitutas; isso pode interromper uso futuro de imagens. **NÃO APLICAR sem plano de impacto, testes ST-003/ST-004/ST-006, decisão sobre leitura pública/privada e aprovação explícita separada**.

### 8.2 Mídia — não confundir ideia com infraestrutura hospedada

- Visão histórica/proposta: **célula única de Mídia + catálogo `media_assets` + bucket central `bunker`**, reuso de logo/capa/galeria em empresas, serviços, vagas, usuários, blogs e parceiros; currículos/documentos privados com URLs assinadas, políticas e LGPD.
- **Realidade remota consultada:** buckets `avatars`, `private-documents`, `public-media` e `services-images` existentes; `bunker` e `curriculos` **não existem**. Não inventar nem criar bucket com base em documento antigo.
- Auditoria de mídia encontrou divergências entre contratos, permissões, tenant do frontend versus tenant resolvido em funções e tipos gerados; plano anterior de componentes/services e Edge Functions não constitui implementação aprovada.
- O `services-images` é um P0 específico; as decisões de armazenamento de documentos privados e mídia pública exigem inventário próprio. Não converter documentos privados em públicos para simplificar UI.

### 8.3 Outras pendências de segurança

Riscos documentais P0-A/C/D/E/F citados em auditorias incluem exposição via views públicas, Storage privado, grants/RPCs privilegiadas, identificação/tenancy, LGPD e formulários; **verificar matriz atual de cada código P0 antes de associar letra a ação**. Não supor que um relatório histórico reflita exatamente schema atual. Auditorias antigas mostram escala grande de políticas/tabelas; não reutilizar contagens históricas como estado novo sem query.

## 9. PERMISSÕES/RBAC E CRUDE OPERACIONAL — lacunas sistêmicas

**Amostras de discrepância do relatório anterior:** entre 63 chaves diferentes retiradas de `MODULE_PERMISSION_MAP` + rotas, **32 não foram encontradas em `public.permissions.code`**; segunda amostra de 81 chaves em constantes de algumas células indicou **41 ausências**. **As amostras se sobrepõem e não devem ser somadas.** São achados datados de auditoria, exigem refresh contra a baseline atual.

Exemplos históricos: `services.read`, `stock.read`, `fiscal.read`, `operations.read`, `pos.read`, `media.read`, `roles.manage`, `saas.manage`, `ai.read`, `auth.manage`, `admin.*`, `owner.*`. Não é permissão para inserir tudo no catálogo; é tarefa de reconciliação de contratos, aliases e modelo de autorização efetivo.

**Problemas de fluxo:** múltiplas rotas apontam à mesma tela genérica (Serviços, Fiscal, Estoque, Operações, POS, Suporte); algumas funcionalidades possuem botão “em desenvolvimento” (Financeiro); sete células têm raiz `Em construção`; falsos sucessos em formulários públicos. Uma tela genérica pode conter tabs/CRUD reais, mas seu uso em vários caminhos não comprova capacidade especializada.

**Inventário de fechamento por rota:** identificar quais têm criar, editar, listar, detalhar, excluir/arquivar, filtros, validações, anexos, auditoria e fonte real; testar ambiente autenticado com papel e tenant apropriados. Onde não existir capacidade, mostrar estado honesto e não anunciar como concluído.

## 10. MIGRATIONS / GIT — histórico reconciliado com ressalvas

**Supabase remoto em 07/11:** **137 migrations registradas** (agosto 46, setembro 46, outubro 44, novembro 1), última `20261101023853_current_person_id_auth_uid_only`. Histórico registrado ≠ schema efetivo/identidade do SQL executado.

**CLI `migration list --linked` (relato Kilo):** 96 versões coincidentes, **5 arquivos locais não registrados** (`20251101000000`, `20261026100000`, `20261030000001`, `20261031000001`, `20261106120000` P0-B), **41 versões registradas no remoto sem SQL local correspondente**. São contas do conjunto interpretado pelo CLI, não de toda e qualquer extensão/recursão do FS.

**Inventário do filesystem local posterior (relato Codex):** **100 arquivos `.sql` na raiz**, **109 recursivamente em subpastas**, correspondentes à referência Git local; os nove previamente descritos como “ausentes” estavam em subpastas com hashes correspondentes. **Nenhum restore necessário.** A API de diretório do GitHub na raiz de `main@972af8e` também retornou 100 `.sql`, compatível com a contagem de raiz. Não comparar contagem recursiva com listagem rasa como se fossem a mesma métrica.

**M2:** recuperar proveniência/origem confiável dos 41 registros remotos sem fonte SQL local; não recriar scripts por aproximação. **M3:** comparar schema real/RLS/Storage/RPCs e alterações fora do histórico. **M4:** avaliar pré-condições e efeitos das cinco migrations locais sem histórico. **P0-B NÃO aplicar.** Proibido `db push`, `migration up`, `migration repair`, `db reset` sem autorização específica. Nunca alterar o banco apenas para “alinhar contagens”.

**Git:** `main` pública verificada em `972af8e`; commit incluiu P0-B em controle de versão, mas **isso não autoriza deploy de migrações**. O último relatório local informa `main@972af8e` com índice/diff rastreado limpos, arquivos não rastreados de apoio e `adm.txt` preservados. **Não executar `git clean/reset/checkout/pull` destrutivo para “corrigir” estados sem solicitação.**

## 11. LINHA DO TEMPO DAS DECISÕES (histórico documentado)

| Período | O que aconteceu / mudou de direção |
|---|---|
| **Ago/2026** | Cliente amplia de site institucional de terceirização para agência de empregos com vagas, empresas, candidatos, portais, RH, currículos, formulários, blog, serviços e B2B. |
| **Ago–Set/2026** | Modelagem de identidade/tenants/empresas/candidatos/vagas/candidaturas, Auth, dados editoriais, RLS, portal candidato e serviços em migrations. Evolução do código e conteúdo, nem sempre acompanhada de QA integral. |
| **Set/2026** | Bootstrap candidato e empresa, papel/tenant/primeiro acesso, portais e correções históricas de trigger. Relatórios de Auth antigos podem contradizer o estado remoto atual. |
| **Out/2026** | Auditorias de segurança/RLS/RBAC, permissões, mídia, tenancy; migrações remotas sem SQL local e endurecimento; decisões de governança ROOT e documentação por stages. |
| **03–06/nov/2026** | Recuperação explícita da visão CHECK BOULER 24H: CORE, DispatcherMaster, células autônomas, Active Directory conceitual, duas sidebars dinâmicas, Database-Driven UI/UX; ADRs separando Global/Admin; P0-B continua aberta. |
| **07/nov/2026** | Commit `972af8e` publica Central de Comando/observabilidade, reconciliação de Recrutamento e documentação. Codex/Kilo e ChatGPT completam diagnósticos locais/remotos de Auth e migrations, **sem resolver entrega SMTP, validação global nem P0-B**. |

## 12. O QUE FALTA — backlog ordenado por dependência e risco

### P0 — bloquear falsos sucessos, falhas de entrada e segurança

**P0 Auth/candidato (duas trilhas independentes):**
- **Trilha A local, alteração só quando aprovada:** status `email_pending` informativo; remover dupla normalização; callback query/hash seguro; fallback sem loader infinito; login receber mensagem segura; testes de hidratação tardia/contexto; sem reenvio nessa etapa.
- **Trilha B hospedada/read-only:** verificação de Confirm Email, SMTP, URLs allow-list, templates e prova de envio/entrega/uso de link em caso autorizado. Sem adivinhar causa e sem trocar redirect antes da evidência.
- Homologação posterior com test account e email autorizados; auditoria de session/tenant/portal sob RLS.

**P0 Segurança P0-B:** avaliar consumidores do `services-images`, storage/public vs privado, 4 policies inseguras e STs; migration versionada não aplicada. Qualquer mudança exige proposta de rollout/rollback, impacto e autorização exclusiva.

**P0 Captação pública:** substituir sucesso baseado em `localStorage`/WhatsApp não persistido por contratos e repositories efetivos aprovados, com antiabuso e minimização LGPD; enquanto isso, estados honestos. Não mudar o frontend “para funcionar” sem backend seguro.

### G2/G3 — qualidade do código entregue

Obter **código de saída e logs** para `npm run typecheck`/`npx tsc --noEmit` (confirmar configuração), `npm run lint`, `npm run build` e suíte Vitest relevante; detectar processos Node concorrentes; smoke de Central Global/Recrutamento em desktop/mobile e dark/light/empty/error/loading. Testar acesso negado e isolamento de tenant. Sem afirmar que os 19 testes direcionados representam a suíte inteira.

### P1 — integridade da arquitetura e produto

- Matriz das 26 células com evidência por rota, menu, provider, operação, serviços/repositórios, DB e RLS.
- Conflitos `CellContract` ↔ `ModuleRoute` ↔ `MODULE_PERMISSION_MAP` ↔ permissões do DB; investigar semântica `ANY/ALL` e `admin_master`/escopo.
- Reconciliar contratos duplicados/legados, inclusive Integrações e Central/Admin Master, sem apagar com base apenas no nome do arquivo.
- Completar fluxos CRUD e rotas específicas nas células; substituir “Em construção” somente após dados/contratos aprovados; homologar B2B/empresas, RH, Financeiro, Serviços.
- Consolidar Mídia com modelo real de buckets/permissões e contratos; não criar `bunker` automaticamente por proposta histórica.

### M2–M4 — governança do banco (paralela, não bloqueia correção de UX local)

Recuperar SQL histórico, auditar schema/RLS efetivo e avaliar migrações locais isoladamente; sem `repair` nem push. Produzir rastreabilidade entre migrations, schema real e código. Corrigir DB apenas por mudança autorizada, revisada e testada.

### P2 — experiência SaaS e operação madura

Unificar padrão visual sem duplicação; métricas reais; dashboards próprios por célula; relatórios; SEO/performance; notificações/WhatsApp com persistência comprovada; analytics/observabilidade real, auditoria e qualidade cross-tenant; acessibilidade e mobile. Publicar métricas/depoimentos apenas com fonte verificada e consentimento.

## 13. CRITÉRIOS DE ACEITE QUE NÃO PODEM SER NEGOCIADOS

1. **Uma única autoridade** por função: CORE, Dispatcher, CellRegistry e RLS não se substituem.
2. **Autenticação e autorização:** sucesso de cadastro ≠ e-mail entregue ≠ acesso validado; testar cada etapa.
3. **Banco source of truth:** UI não inventa dados, permissões, uptime, KPIs ou persistência.
4. **Rastreabilidade:** fonte, SHA/branch, query/teste, timestamp, resultados, exit codes, limitações.
5. **Autonomia:** cada célula com contratos e lógica local, falha isolada, sem imports cruzados improvisados.
6. **Multi-tenant:** contexto explícito, contratos de escopo, RLS e teste negativo de acesso cruzado.
7. **LGPD:** evitar expor CPF/e-mails/tokens/currículos/doc privado em chat/logs; segregação de Storage por sensibilidade.
8. **Regressão:** preservar footer, marca J&S Empregos LTDA, tema existente, guards, legado útil e fluxos válidos.
9. **Aprovação separada:** diagnóstico, código local, testes com efeitos colaterais, acesso remoto, migrations/DB, commit, push e deploy são etapas independentes.
10. **Documento não é execução:** ADR proposto, rota registrada, mock validado ou migration versionada não significam produção homologada.

## 14. O QUE O CODEX PRECISA LER NA ORDEM

**Regras primeiro:**
- `AGENTS.md` (marca/footer/documentação/Git/segurança)
- `.kilo/rules/01-documentacao-rastreabilidade.md` e outros `AGENTS.md` de subpastas
- Este documento e `docs/check-bouler-24h/CODEX_HANDOFF_JS_EMPREGOS_2026-11-07.md` (anterior; comparar data)

**História, norma e evidência:**
- `docs/check-bouler-24h/ARQUITETURA_CANONICA_GLOBAL_ADMIN_DISPATCHER.md`
- `docs/check-bouler-24h/ADR-0001-GOVERNANCA_GLOBAL_ADMIN_DISPATCHER.md` e `ADR-0001-ANEXO-B-CENTRAL_COMANDO_GLOBAL.md` (status PROPOSTO; Anexo A não localizado na auditoria histórica)
- `docs/check-bouler-24h/RECONCILIACAO_HISTORICA_NORMATIVA_E_EVIDENCIAS.md`
- `docs/check-bouler-24h/STAGE02_13_*`, `STAGE02_14_*`, `PARECER_P0_SERVICES_IMAGES.md`, `P0B_ST004_SERVICES_IMAGES_INVENTARIO_CONTROLADO.md`, `P0B_ST003_ST004_TEST_PLAN.md`
- `AUDITORIA_JS_CHECK_BOULER_24H_2026-11-07.md` (auditoria geral baseada em SHA antigo `b9de729`, conferir contra atual)
- `docs/AUTH-EMAIL-SMTP.md` e `supabase/config.toml` (local ≠ settings hospedados)

**Arquitetura e operações:**
- `package.json`, `src/main.tsx`, `src/App.tsx`, `src/core/cells/register-cells.ts`, `src/core/dispatcher/DispatcherMaster.ts`, `src/core/registry/CellRegistryContract.ts`, `src/core/observability/*`
- `src/platform/router/ModuleRouter.tsx`, `src/platform/router/module-routes.ts`, `src/core/cells/cell-to-module-definition.ts`, `src/core/permissions/modulePermissionMap.ts`, `src/platform/permissions/*`, `src/components/auth/*`
- `src/modules/*/cellContract.ts`, `src/modules/*/routes/*`, `src/cells/*/cellContract.ts`; localizar estruturas duplicadas antes de tocar
- `src/pages/dashboard/GlobalCommandPage.tsx`, `src/modules/admin-master/*`, `src/modules/recrutamento/*`, `src/modules/candidato/*`

**P0 candidato:**
- `src/pages/CadastroCandidato.tsx`, `src/pages/Login.tsx`, `src/pages/auth/AuthCallback.tsx`, `src/contexts/AuthContext.tsx`, `src/lib/error-normalizer.ts`, `src/lib/async/timeout.ts`, `src/__tests__/auth/*`

**P0 formulários/mídia:**
- `src/pages/{Contato,Parceiros,Fornecedores,TrabalheConosco}.tsx`; `src/services/mock/*`; `src/components/forms/JobApplicationForm.tsx` / `ServiceRequestForm.tsx` (confirmar paths); `src/modules/media/*`, `src/cells/integracoes/*`, `src/modules/integracoes/*`

## 15. PRIMEIRA MISSÃO DO CODEX AO RECEBER ESTE DOCUMENTO

**Somente leitura até haver autorização específica.** Entregar:

1. Identidade do workspace: pasta, remotes, `HEAD`, branch, `git status`, `origin/main` e, se permitido, ponta remota — sem mudar refs.
2. Matriz curta `PRETENDIDO × OBSERVADO × FALTANTE` para website, candidato/Auth, empresas, recrutamento, RH, Central Global, Admin Master, Serviços, Financeiro, Mídia, P0-B e RBAC.
3. Verificação do que mudou desde `972af8e` (não assumir que arquivo do handoff reflete código novo).
4. Inventário prioritário dos mocks/stubs/rotas sem operação, sem criar páginas.
5. Estado das ferramentas/conexões disponíveis; **não** assumir compartilhamento de credenciais ou memórias entre ChatGPT e Codex.
6. Proposta de **um próximo lote pequeno** (arquivos, riscos, testes, critérios de aceite, autorizações necessárias). Sugestão: P0-UX Auth com escopo restrito; P0 de envio hospedado é trilha separada.
7. Responder **expressamente** se houve alteração (esperado: ZERO).

**Nunca executar automaticamente:** `git clean`, `git reset --hard`, `git push`, merge, deploy, `supabase db push`, `supabase migration up`, `supabase migration repair`, `supabase db reset`, DDL/DML remoto, `DROP POLICY`, criação de usuário/email teste, troca de SMTP, mudança de `DispatcherMaster`/P0-B, renomeação da marca ou footer.

**Ao concluir qualquer trabalho autorizado:** reportar paths exatos, diff, testes+exit codes, comandos, alterações de infra (se autorizadas), estado de Git, pendências e riscos; colar retorno no ChatGPT para atualização da memória documental.

## 16. MATRIZ EXECUTIVA — O QUE ERA × O QUE É × O QUE FALTA

| Eixo | Era para ser | Está sendo/foi visto | Falta completar |
|---|---|---|---|
| Produto | SaaS RH e serviços multi-tenant, portais operacionais | Navegação, rotas, DB real e muitas telas estruturadas | Ciclos E2E, CRUD efetivo, B2B e captação reais |
| CHECK BOULER 24H | CORE governante, Dispatcher, orquestração, células autônomas | CORE/Dispatcher/CellRegistry/26 contratos em código | Alinhar rotas/guards/executores/tenancy, resolver legados |
| Central/ROOT | Observabilidade Global separada de governança Admin Master | Central com observabilidade local publicada; ROOT encaminhamento legado | Contratos/rota/indicadores reais, acesso e testes completos |
| Candidato | Cadastro → confirmação → portal → vagas → candidatura | 2 registros com bootstrap íntegro; UX Auth defeituosa | SMTP/redirect/log, correção UX, E2E/tenant/RLS |
| Recrutamento | Pipeline, vagas, matching, banco de talentos | Dashboard canônico, 19 testes alvo, rotas conciliadas | Build/lint/typecheck, visual, operações em criação e E2E |
| Empresas/RH | Portal B2B e backoffice completo | Rotas e telas implementadas em parte | CRUD/permissão/RLS/testes, fluxo de contratação real |
| Forms públicos | Leads comerciais e candidaturas persistidos | Contato/Parceiros/Fornecedores usam localStorage; alguns CTAs WhatsApp sem prova | Repositories, contratos, proteção e confirmação verdadeira |
| Mídia | Catálogo central reutilizável e privado por sensibilidade | Módulo mídia parcial; buckets reais diferentes do bunker proposto | Governança de upload/assets, P0-B e documentos privados |
| Segurança | Default deny e fronteiras por tenant | Muitas policies/roles, divergência de keys e predicates | Auditoria de permissão/RLS/Storage testada por usuário |
| Migrations | Histórico reprodutível e sincronizado | 137 remotas; 41 sem fonte SQL local em comparação; 5 locais fora do histórico | M2 provenance, M3 schema/RLS, M4 efeitos; sem aplicar automaticamente |
| Qualidade | Deploy homologado, dark/light e mobile | Código publicado com testes direcionados | Full typecheck/lint/build/E2E/smoke/regressão |

---

### Fontes de referência

- GitHub: <https://github.com/Evandro-J-O-Andrade/jstercerizados>
- Commit verificado: <https://github.com/Evandro-J-O-Andrade/jstercerizados/commit/972af8e4f4181ff7f56e5c8c20d14ea14cd60e54>
- `AGENTS.md`: <https://github.com/Evandro-J-O-Andrade/jstercerizados/blob/972af8e4f4181ff7f56e5c8c20d14ea14cd60e54/AGENTS.md>
- `src/core/cells/register-cells.ts`: <https://github.com/Evandro-J-O-Andrade/jstercerizados/blob/972af8e4f4181ff7f56e5c8c20d14ea14cd60e54/src/core/cells/register-cells.ts>
- `src/pages/auth/AuthCallback.tsx`: <https://github.com/Evandro-J-O-Andrade/jstercerizados/blob/972af8e4f4181ff7f56e5c8c20d14ea14cd60e54/src/pages/auth/AuthCallback.tsx>
- Documentos e relatórios deste histórico (`AUDITORIA_JS_CHECK_BOULER_24H_2026-11-07.md`, `CODEX_HANDOFF_JS_EMPREGOS_2026-11-07.md`, relatórios Kilo 07/11). Documentos têm baselines diferentes; comparar SHA antes de tratar achados como atuais.

**Fim da passagem — leitura e reconciliação antes de execução.**
