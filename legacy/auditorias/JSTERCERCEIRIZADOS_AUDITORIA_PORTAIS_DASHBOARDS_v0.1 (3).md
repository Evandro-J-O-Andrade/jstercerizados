# J&S --- Registro incremental de auditoria: portais, dashboards e navegação

**Versão:** 0.1 --- parcial \| **Data:** 02/11/2026\
**Repositório:** `Evandro-J-O-Andrade/jstercerizados`\
**Baseline publicada consultada:** `main` ---
`21f74d3aa736a336fea7c582375a6613a1f059ca`\
**Modo:** somente leitura. Nenhuma alteração em código, branches, rotas,
banco ou deploy.

> Documento vivo da auditoria. No encerramento da varredura, as
> descobertas serão consolidadas em um único documento mestre com matriz
> de reaproveitamento, riscos, dependências e ordem de implementação.
> Este registro parcial não autoriza implementação.

## 1. Regras invioláveis

- Preservar os módulos/células atuais, contratos, responsabilidades,
  dados, permissões e autonomia.
- Reaproveitar somente padrões visuais, componentes genéricos e
  modelos arquiteturais comprovadamente melhores; não restaurar
  módulos antigos inteiros.
- Preservar CHECK BOULER 24H: Core, DispatcherMaster, orquestradores e
  células autônomas.
- Sidebar é projeção visual da autorização, nunca mecanismo de
  segurança.
- Não inferir tenant com `tenantMemberships[0]`.
- Sem autorização explícita: não alterar AuthContext, RBAC, rotas,
  migrations, banco, branches, commits, push ou deploy.
- Inspeção de código não equivale a QA visual em navegador; overflow,
  altura, responsividade e aparência exigem preview/screenshot real.

## 2. Portais que devem permanecer no desenho

### 2.1 Governança / suporte da plataforma

Central técnica do SaaS: gestão de células, configurações globais,
integrações, parâmetros, segurança, auditoria, diagnóstico, políticas e
operação da plataforma. Não confundir com suporte operacional de
chamados.

### 2.2 Portal analítico do ecossistema

Não deve ser uma grade de módulos nem apenas oito KPIs. Deve consolidar
dados reais das células e domínios autorizados: RH/pessoas,
recrutamento, candidatos, vagas, candidaturas, empresas, financeiro,
faturamento, assinaturas, contratos, serviços, operações, suporte/SLA,
segurança, auditoria, eventos e infraestrutura/saúde das células.

Cada indicador deve explicitar origem, período, atualização, escopo
global/tenant e permissão. O portal analítico oferece visão transversal,
drill-down autorizado e comparação. Dashboards especializados permanecem
nas células e não são substituídos.

Arquitetura a investigar: contratos de métricas/analytics por célula
e/ou read models agregados. Evitar acoplamento do dashboard a todas as
tabelas e consultas ad hoc sem contrato.

### 2.3 Portal público e AVA

Separar aprendizagem pública/externa, treinamento interno do SaaS e
tutoriais associados aos módulos. Investigar catálogo público, cursos,
trilhas, aulas, inscrições, progresso e certificados. A existência de
tutoriais não comprova uma plataforma completa de cursos.

## 3. Descoberta --- AVA possui duas implementações de dashboard

Arquivos examinados no `main`: -
`src/modules/ava/dashboard/AvaDashboard.tsx` -
`src/modules/ava/dashboard/AvaDashboardPage.tsx` -
`src/modules/ava/dashboard/index.ts` -
`src/modules/ava/pages/AvaPage.tsx` -
`src/modules/ava/routes/AvaRoutes.tsx` -
`src/modules/ava/context/AvaContext.tsx` -
`src/modules/ava/cellContract.ts` - `src/modules/ava/manifest.ts` -
`src/App.tsx`

Constatações: 1. `AvaDashboard.tsx` é praticamente uma cópia de
`AvaPage.tsx`: "Central de Aprendizado", filtro lateral por módulo,
busca e cards de tutoriais. 2. `AvaDashboard.tsx` não é exportado por
`dashboard/index.ts`; o barrel exporta apenas `AvaDashboardPage`. 3.
`AvaDashboardPage.tsx` é uma segunda experiência: filtros horizontais,
busca, loading/erro, cards e botão "Assistir". 4. `AvaRoutes.tsx`
registra a home como `AvaPage` e o detalhe como `AvaTutorialPage`. 5.
`App.tsx` declara diretamente as rotas `ava` e `ava/:slug`, usando
`AvaDashboardPage` na home, com `AvaProvider` e `PermissionGuard`. 6.
`AvaProvider` carrega `video_assets` por `currentTenantId`, lê metadados
`tutorial` e constrói módulos disponíveis. 7. Em `AvaDashboardPage`,
`handlePlayTutorial()` apenas mostra toast "Abrindo tutorial"; não
comprova reprodução/abertura real. 8. `AvaPage` resolve tutorial e
navega para `/ava/${slug}`. 9. O contrato da célula declara
`domain: tenant`, `scope: tenant`, `homeRoute: /dashboard/ava`, sidebar
habilitada e rotas derivadas de `avaRoutes`.

Conclusão provisória: - Não apagar nem escolher um arquivo pelo nome. -
`AvaDashboard.tsx` aparenta redundância com `AvaPage.tsx`. -
`AvaDashboardPage.tsx` é usada pela rota direta em `App.tsx`, mas há
divergência com `AvaRoutes`/`ModuleRouter`. - Mapear `/dashboard/ava`,
`/ava` e `/ava/:slug`, imports, histórico e intenção original antes de
decidir se as duas experiências eram complementares ou se uma é
duplicada. - Nenhuma correção nesta etapa.

## 4. Portal analítico --- estado encontrado

### `src/modules/admin-master/dashboard/GlobalDashboardPage.tsx`

- KPIs reais: tenants, empresas, pessoas, candidatos, vagas,
  candidaturas, ordens de serviço e chamados.
- Eventos recentes de `domain_events`, quando permitido.
- Grade de módulos disponíveis.
- Usa `useGlobalDashboardStats`, `DashboardMetricGrid`,
  `DashboardCard`, `DashboardSection` e filtro de permissões.

### `src/hooks/useGlobalDashboardStats.ts`

- Consulta contagens reais em `tenants`, `companies`, `people`,
  `candidates`, `jobs`, `applications`, `service_orders`,
  `support_tickets`.
- Verifica permissões antes de consultar.
- ROOT usa escopo global; demais usuários filtram pelo
  `currentTenantId`.
- Busca até oito eventos recentes se `domain_events.read` estiver
  disponível.
- Já é uma base real, mas cobre apenas uma parte do ecossistema.
  Evoluir por contratos de métricas/read models das células, não por
  consultas sem governança a todas as tabelas.

### `src/modules/admin-tenant/pages/OwnerDashboardPage.tsx`

- Usa `CellRegistry` para saúde e mosaico de células.
- Alerta: métrica chamada `Tenants` recebe `stats.total`, descrito
  como "Células registradas no CellRegistry"; semântica incorreta ou
  ambígua.
- `CellTile` usa somente a primeira rota e primeira permissão para
  decidir acesso ao card; não representa todas as permissões/rotas da
  célula.
- Ícone genérico `LayoutDashboard` nos tiles, apesar de os contratos
  declararem ícones.
- Reaproveitar ideia de registry/saúde, não copiar sem corrigir
  semântica e autorização.

### `src/modules/admin/DashboardAdmin/DashboardAdmin.tsx`

- Dashboard administrativo com indicadores de tenants, usuários,
  papéis, sessões e atividade recente.
- Layout flexível com header e área de rolagem interna.
- Comparar com Admin Tenant e Admin Master para evitar sobreposição de
  responsabilidades.

## 5. Branches/referências já identificadas

---

Branch SHA consultado Interesse

---

`feat/admin-master-global-dashboard` `7e06f7a22207b741cfb3f814f405ffc80aff5a0d` Dashboard global e
modelo de KPIs

`checkpoint-before-enterprise-dashboard` `52f0306324cbce09387ac61752259a8b0d328e2a` Portal/dashboard
administrativo anterior

`checkpoint/kilo-governance-laws-2026-10-11` `779e0225e1d29d607f52925a06c3fed32f58c6b7` AVA, dashboards de
candidato, Metric Grid
e testes

`feat/candidate-avatar-storage-security` `ce0448b9bb19cad1fa08e242bbf6bcfb0f2e7950` Continuidade de
AVA/candidato

`fix/cells-independent-of-portal` `9f23d58b4d73eecbc5e618654d8c3f5af645884b` Independência das
células

`fix/patch-vulnerabilities-9d909f5b-1793358941` `76d87fc8a82a4051c4dbbae1e4228f0931cc5f50` Admin Master, Admin e
AVA

`main` `21f74d3aa736a336fea7c582375a6613a1f059ca` Baseline publicada
----------------------------------------------------------------------------------------------------------------------

Datas usadas na ordem das branches refletem atividade/último commit
observado, não necessariamente criação.

## 6. Referências visuais/arquiteturais para aprofundar

- `src/components/portal/PortalSidebar.tsx`: agrupamento, expansão,
  ativo, colapso e rolagem. Não importar troca de conta antiga.
- `src/components/portal/PortalHeader.tsx`: composição de cabeçalho;
  evitar seletor de conta duplicado.
- `src/components/portal/PortalShell.tsx`: shell antigo; revisar
  `h-screen` contra `h-dvh`, `min-h-0` e scroll único.
- `src/components/portal/CandidateShell.tsx`: hierarquia visual
  candidata; preservar os componentes atuais.
- `src/components/dashboard/DashboardMetricGrid.tsx` e
  `dashboard-model.ts` na branch Kilo: padrões reutilizáveis de KPI.
- `src/modules/admin-tenant/pages/OwnerDashboardPage.tsx`:
  CellRegistry/saúde com ressalvas.
- `src/modules/admin-master/dashboard/GlobalDashboardPage.tsx`: KPIs
  reais e eventos globais.

## 7. Pendências/riscos

1.  Divergência entre rotas AVA em `App.tsx` e
    `ModuleRouter`/`AvaRoutes.tsx`.
2.  Intenção original dos dois dashboards AVA ainda não confirmada por
    histórico, imports e testes.
3.  Inventário de fontes reais de analytics por célula, com permissões,
    escopo, granularidade e atualização.
4.  Diferenciar zero, sem permissão, erro e célula indisponível.
5.  Corrigir semântica de métricas de Admin Tenant.
6.  Tiles devem considerar autorização por rota/ação, não apenas
    primeira rota.
7.  Confirmar se AVA público é separado da central interna de tutoriais.
8.  Código não comprova aparência visual em execução.

## 8. Próximas etapas --- somente leitura

1.  Percorrer branches por família: dashboards global/admin master/admin
    tenant, suporte/governança, RH, recrutamento, financeiro, operações,
    candidato e AVA.
2.  Registrar para cada arquivo: branch/SHA/caminho, finalidade,
    dados/fonte, componentes, dependências, permissões, estado e risco.
3.  Comparar candidato histórico com `main`, separando padrão visual
    reaproveitável de lógica legada.
4.  Mapear rotas/imports reais e duplicidades.
5.  Consolidar matriz final de aproveitamento e plano faseado.
6.  Solicitar autorização antes de qualquer implementação.

## 9. Controle de mudanças

Até autorização explícita: sem edição de código, checkout/alteração de
branch, merge/rebase, migration/escrita no Supabase, commit, push ou
deploy.
