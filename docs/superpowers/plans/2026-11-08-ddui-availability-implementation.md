# DDUI Availability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar resolução resiliente e publicação versionada de conteúdo público dirigido por dados, sem interromper o site atual nem transformar cache em fonte concorrente.

**Architecture:** Um resolver tipado consome memória, IndexedDB, snapshot publicado e Supabase, valida tudo com Zod e atualiza caches somente após integridade comprovada. A migração usa strangler por página; dados privados, Auth, RBAC e operações permanecem fora do snapshot público.

**Tech Stack:** React 19, TypeScript 5.9, Vite 7, Zod 3, Supabase JS 2, Vitest 4, Playwright 1.62, IndexedDB e CDN/Storage a decidir sob gate próprio.

**Spec:** `docs/superpowers/specs/2026-11-08-ddui-availability-design.md`

## Global Constraints

- Manter “J&S Empregos LTDA” e não alterar o conteúdo do footer institucional.
- Não alterar P0.1, P0.2, OBS-01, P0-B ou DispatcherMaster neste programa.
- Nenhuma migration, RLS, Storage, Auth, SMTP, commit, push ou deploy sem autorização específica.
- Resposta vazia válida não ativa fallback.
- Snapshot público nunca contém dados privados, permissões, tokens, currículos ou documentos.
- URLs existentes permanecem funcionais durante migração por aliases explícitos e temporários.
- Cada tarefa de implementação futura começa com teste falhando e termina com verificação direcionada.

## Review Focus

- Cache de tenant A nunca pode ser apresentado no tenant B; Task 3 inclui teste de chave composta e descarte por tenant divergente.
- Despublicação durante modo offline não pode manter conteúdo indefinidamente; Tasks 3 e 5 cobrem tombstone e revogação.
- Resposta `[]` válida não pode ressuscitar snapshot antigo; Task 4 cobre `EMPTY` sem fallback.
- Snapshot parcialmente enviado não pode virar versão publicada; Task 5 cobre falha antes da troca do ponteiro.
- Formulário ou upload sem confirmação do servidor não pode exibir sucesso; Task 9 cobre rascunho e falha de escrita.

---

## Organização em subplanos

Este programa contém subsistemas independentes. Antes de cada gate, o executor deve produzir um plano de implementação específico e obter autorização. Este documento define ordem, interfaces e critérios entre eles.

### Task 1: Baseline e inventário executável

**Files:**
- Modify: `docs/database-driven-ui/STAGE02_MATRIZ_PAGINA_SECAO_DADOS.md`
- Create: `docs/database-driven-ui/DDUI_CONTENT_INVENTORY.generated.md`
- Create: `scripts/audit-ddui-content.mjs`
- Test: `scripts/__tests__/audit-ddui-content.test.mjs`

**Interfaces:**
- Consumes: páginas, mocks, hooks e repositories atuais.
- Produces: relatório gerado `page → section → source → cache class → privacy → migration status`, subordinado e referenciado pela matriz canônica, nunca uma segunda autoridade.

- [ ] Escrever teste que detecta hero, card, CTA, imagem, formulário e fonte por página sem alterar arquivos de produto.
- [ ] Executar o teste e confirmar falha pela ausência do auditor.
- [ ] Implementar auditor read-only e gerar inventário determinístico.
- [ ] Classificar cada mock como snapshot-seed, dado fictício a remover, fixture de teste ou rascunho local.
- [ ] Inventariar nominalmente as 26 células, owner, rota canônica, recursos e ordem de migração a partir do CellRegistry real.
- [ ] Executar auditor e revisar manualmente Home, Vagas, Serviços, Blog, Empresas e Candidato.

### Task 2: Contratos e registro seguro de componentes

**Files:**
- Create: `src/core/content/contracts.ts`
- Create: `src/core/content/schemas.ts`
- Create: `src/core/content/component-registry.ts`
- Test: `src/core/content/__tests__/schemas.test.ts`
- Test: `src/core/content/__tests__/component-registry.test.ts`

**Interfaces:**
- Produces: contratos completos de manifesto, página, seção, componente/props, mídia, SEO, visibilidade e versão; `parseManifest(input)` e `parsePageSnapshot(input)`.

- [ ] Escrever testes para manifesto válido, componente desconhecido, props inválidas, URL insegura, hash inválido, tenant divergente e colisão de rota/locale.
- [ ] Executar testes e confirmar falha por módulos ausentes.
- [ ] Implementar schemas Zod com `schemaVersion: 1`.
- [ ] Implementar registry fechado de componentes e schemas de props.
- [ ] Executar testes, typecheck e ESLint direcionado.

### Task 3: Cache em memória e IndexedDB

**Files:**
- Create: `src/core/content/cache/content-cache.ts`
- Create: `src/core/content/cache/memory-cache.ts`
- Create: `src/core/content/cache/indexeddb-cache.ts`
- Create: `src/core/content/cache/cache-key.ts`
- Test: `src/core/content/cache/__tests__/content-cache.test.ts`

**Interfaces:**
- Consumes: contratos da Task 2.
- Produces: `ContentCache.get(key)`, `put(entry)`, `remove(key)`, `revoke(snapshotIds)` e `prune(policy)`.

- [ ] Decidir e documentar API nativa ou dependência IndexedDB sem instalar antes de autorização.
- [ ] Escrever testes de isolamento por ambiente/tenant/locale/page, duas versões máximas, revogação e corrupção.
- [ ] Implementar cache em memória.
- [ ] Implementar adapter IndexedDB e fallback quando a API estiver indisponível.
- [ ] Executar testes em JSDOM e Chromium.
- [ ] Testar quota excedida, eviction, private mode/IndexedDB indisponível, logout e troca de tenant.

### Task 4: Resolver e máquina de estados

**Files:**
- Create: `src/core/content/content-resolver.ts`
- Create: `src/core/content/content-state.ts`
- Create: `src/hooks/usePublishedPage.ts`
- Test: `src/core/content/__tests__/content-resolver.test.ts`
- Test: `src/hooks/__tests__/usePublishedPage.test.tsx`

**Interfaces:**
- Consumes: parsers da Task 2 e cache da Task 3.
- Produces: `resolvePublishedPage(request, sources): Promise<ContentResolution>` e hook com `state`, `data`, `origin`, `version`, `refresh()`.

- [ ] Escrever testes para estado, conectividade e origem independentes, incluindo `fresh`, `stale`, `offline`, `timeout`, `empty`, `error`, `unpublished` e `rollback`.
- [ ] Fixar em teste que `EMPTY` não consulta snapshot antigo como conteúdo substituto.
- [ ] Implementar corrida controlada: renderização local imediata e revalidação remota sem misturar versões.
- [ ] Implementar timeout, cancelamento e descarte de resposta de tenant anterior.
- [ ] Executar testes e verificação de atualizações assíncronas sem warning React.

### Task 5: Contrato de publicação atômica

**Files:**
- Create: `docs/database-driven-ui/DDUI_PUBLISHING_CONTRACT.md`
- Create after schema authorization: Edge Function/RPC server-side de publicação; o frontend recebe somente um client autorizado.
- Test after authorization: testes de integração server-side e do client sem credenciais privilegiadas.

**Interfaces:**
- Produces server-side: `buildSnapshot(candidate)`, `verifySnapshot(artifact)`, `publishPointer(manifestRef, expectedVersion)` e `rollbackPointer(version, expectedVersion)`.

- [ ] Auditar em read-only o schema remoto e registrar quais objetos existem.
- [ ] Elaborar ADR de tabelas/Edge Function/Storage necessários, sem migration nesta tarefa.
- [ ] Testar publicação completa, staging privado, falha de upload, hash divergente, ponteiro corrompido, publishers concorrentes/CAS, troca atômica e rollback.
- [ ] Implementar somente após autorização separada de schema/Storage/RLS.
- [ ] Validar com duas versões e comprovar que leitores nunca recebem composição híbrida.

### Task 6: Renderer declarativo

**Files:**
- Create: `src/components/content/PublishedPageRenderer.tsx`
- Create: `src/components/content/PublishedSectionRenderer.tsx`
- Create: `src/components/content/registry.ts`
- Test: `src/components/content/__tests__/PublishedPageRenderer.test.tsx`

**Interfaces:**
- Consumes: `PublishedPageSnapshot` e registry da Task 2.
- Produces: renderização acessível de componentes permitidos.

- [ ] Escrever testes de ordem, seção desabilitada, props inválidas, componente desconhecido e tema dark/light.
- [ ] Implementar renderer sem `dangerouslySetInnerHTML` não sanitizado.
- [ ] Mapear componentes existentes antes de criar novos.
- [ ] Verificar mobile, teclado, loading, empty e error.

### Task 7: Primeira fatia pública — Home

**Files:**
- Modify: `src/pages/Home.tsx`
- Modify: hooks públicos identificados na Task 1.
- Test: `src/pages/__tests__/Home.database-driven.test.tsx`
- Test: `e2e/home-content-resilience.spec.ts`

**Interfaces:**
- Consumes: hook e renderer das Tasks 4 e 6.
- Produces: primeira página migrada por strangler com fallback versionado.

- [ ] Capturar baseline visual e estrutural da Home atual.
- [ ] Migrar uma seção piloto atrás de flag local, sem alterar footer.
- [ ] Testar Supabase saudável, timeout, offline, vazio, despublicação e snapshot revogado.
- [ ] Migrar seções restantes somente após paridade da piloto.
- [ ] Comprovar rollback para renderer atual.

### Task 8: Fatias públicas de entidades

**Files:**
- Modify: `src/pages/Vagas.tsx`, `src/pages/VagaDetalhe.tsx`
- Modify: `src/pages/Servicos.tsx`, `src/pages/ServicoDetalhe.tsx`
- Modify: `src/pages/Blog.tsx`, `src/pages/Empresas.tsx`
- Test: suites direcionadas e Playwright por rota.

**Interfaces:**
- Consumes: infraestrutura aprovada pela Home.
- Produces: páginas públicas reais de vagas, serviços, blog e empresas.

- [ ] Migrar uma entidade por vez e manter URL/SEO.
- [ ] Substituir mock runtime por snapshot-seed somente após equivalência dos dados.
- [ ] Testar detalhe inexistente, lista vazia válida, expiração e despublicação.
- [ ] Validar imagens versionadas, alt text e ausência de dado privado.

### Task 9: Formulários, CRUDs e uploads

**Files:**
- Create: `src/components/forms/canonical/` somente após inventário de equivalentes.
- Modify: repositories e páginas por célula em subplanos próprios.
- Test: integração por operação, perfil e tenant.

**Interfaces:**
- Produces: padrão de listagem, criação, detalhe e edição por recurso.

- [ ] Definir contrato de rascunho local sem armazenar segredo ou documento privado.
- [ ] Testar que falha de submit nunca mostra sucesso.
- [ ] Testar create/read/update/archive, validação e auditoria por recurso.
- [ ] Implementar upload público e privado em fluxos separados.
- [ ] Validar RLS e Storage sob autorização específica.

### Task 10: P0 do candidato

**Files:**
- Planejamento separado obrigatório para Auth/SMTP.
- Possíveis arquivos sob autorização: cadastro, callback, login, reenvio e testes.

**Interfaces:**
- Produces: jornada real `signUp → e-mail → callback → primeiro acesso → /candidato`.

- [ ] Auditar SMTP, URLs, templates e logs em leitura autorizada.
- [ ] Especificar reenvio e recuperação sem alterar contrato remotamente.
- [ ] Homologar com conta de teste autorizada e recebimento real.
- [ ] Manter cache fora da decisão de confirmação e sessão.

### Task 11: Células autenticadas e retirada do legado

**Files:**
- Modify por célula: contratos, rotas, páginas e repositories.
- Remove somente após prova: consumidores de `src/components/legacy/portal/`.
- Test: matriz de rotas e operações das 26 células.

**Interfaces:**
- Consumes: padrão CRUD da Task 9 e contratos canônicos do CHECK BOULER 24H.
- Produces: células independentes sem registry operacional legado.

- [ ] Estabilizar Gate 1 e aliases antes de retirar qualquer consumidor.
- [ ] Migrar por célula na ordem Candidato/Recrutamento/RH, Empresas/Serviços, Admin, Financeiro e demais domínios.
- [ ] Validar as cinco rotas padrão por recurso.
- [ ] Remover alias somente após telemetria demonstrar ausência de uso.
- [ ] Remover componente legado somente após `rg`, testes e build comprovarem desuso.

### Task 12: Homologação e corte

**Files:**
- Create: `docs/database-driven-ui/DDUI_ACCEPTANCE_REPORT.md`
- Test: suítes Vitest, Playwright, acessibilidade, performance e segurança.

**Interfaces:**
- Produces: decisão de promoção ou rollback por página/célula.

- [ ] Executar matriz anon, candidato, tenant, admin tenant e admin master.
- [ ] Testar dark/light, mobile, offline, timeout, revogação e troca de tenant.
- [ ] Testar SEO/crawler, canonical, sitemap, locale, colisões de rota e revogação recebida com a página aberta.
- [ ] Confirmar ausência de dados privados em snapshots e caches.
- [ ] Confirmar zero dependência produtiva do registry legado antes de remoção final.
- [ ] Registrar resultados, riscos aceitos e procedimento de rollback.

## Sequência recomendada de autorização

1. Tasks 1–2: inventário e contratos locais.
2. Tasks 3–4: cache/resolver local.
3. Task 5: auditoria remota read-only e ADR de publicação.
4. Tasks 6–7: renderer e Home piloto.
5. Tasks 8–9: entidades, formulários, CRUDs e mídia.
6. Task 10 em trilha paralela e protegida de Auth.
7. Tasks 11–12: 26 células, retirada do legado e homologação.

Cada autorização deve nomear arquivos, testes e limites remotos. Nenhuma etapa implica commit, push ou deploy.
