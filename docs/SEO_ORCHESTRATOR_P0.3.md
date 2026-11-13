# SEO Orchestrator (P0.3) — J&S Empregos

## Pipeline integrado (build local)
`npm run build` executa `scripts/seo-orchestrator.mjs --build`:
1. `node scripts/generate-seo-files.mjs` (gera sitemaps/robots em `public/` a partir de fontes públicas autorizadas, tenant `js-empregos`).
2. `npm run build:app` (`tsc -b && vite build` → `dist/`).
3. Pré-checagem fail-closed: aborta se `dist/index.html` ausente/inválido (não sobrescreve saídas válidas com resultado vazio).
4. `node scripts/prerender-public-seo.mjs` (gera HTML por rota em `dist/` para URLs públicas elegíveis e **regera sitemaps/robots consistentes com o mesmo inventário** em `public/` e `dist/`; grava `scripts/.prerender-report.json`).
5. Validação de integridade/cobertura (A=elegíveis, B=sitemaps, C=prerender/dist), URLs obrigatórias e artefatos; falha em inconsistência crítica.

Relatórios: `scripts/.seo-orchestrator-report.json`, `scripts/SEO_ORCHESTRATOR_REPORT.md`, snapshot `scripts/.seo-public-snapshot.json`.

Comandos: `npm run seo:audit` (inspeciona sem build/prerender completo), `npm run seo:generate`, `npm run seo:validate`, `npm run build`.

## Cobertura e inventário
- Inventário dinâmico (sem contagem fixa): páginas públicas estáticas + vagas publicadas/não expiradas/slug válido do tenant `js-empregos` + serviços publicados em `public_services_v1`.
- Sitemaps preservados: `sitemap.xml` (índice), `sitemap-pages.xml`, `sitemap-vagas.xml`, `sitemap-servicos.xml`, `sitemap-index.xml`, `robots.txt`.
- Obrigatórias verificadas: `/servicos/processo-de-rh`, `/servicos/mao-de-obra-temporaria`, `/vagas/consultor-de-vendas-hibrido`.

## Boot React e limitações (não é hidratação)
- `dist/*/index.html` contém HTML inicial rastreável (H1/conteúdo/head por URL). `src/main.tsx` limpa `#root` antes de `createRoot` (evita reconciliação incompatível) — **substituição**, não hidratação SSR.
- `src/App.tsx` aplica `aria-hidden`/`inert` no conteúdo subjacente apenas após mount e enquanto o cinema está ativo, para não bloquear leitura sem JS.
- Validação local automatizada confirma presença de conteúdo/head/JSON-LD nos HTMLs gerados. **Homologação obrigatória em navegador real/Hostinger:** entrada direta, cinema, ausência de flash excessivo, navegação com/sem JS, persistência de H1/canonical/JSON-LD no DOM após montagem e consultas assíncronas. Se houver regressão visual/SEO pós-mount, migrar para estratégia de hidratação/prerender compatível incrementalmente.

## Hostinger / HTTP (homologação em servidor real)
- `public/.htaccess` e `public/_redirects` mantidos (não alterados). SPA fallback pode retornar 200/soft-404 em rotas inexistentes — **exige teste real** para HTTP 200 (existentes), 404/410 (inexistentes), 301 (slugs antigos), MIME de XML/robots e entrega do HTML correto por URL/prerender.
- Verificações Google preservadas (`public/google-site-verification.html`, meta em `index.html`); DNS não alterado.

## Publicação Supabase vs build
- **A. Build via Git (deploy Hostinger):** atualiza sitemaps e HTML estático apenas quando o pipeline roda.
- **B. Publicação/edição/encerramento direto no Supabase:** **não** dispara build Hostinger automaticamente; HTML/sitemaps ficam desatualizados até novo build.
- Mecanismo seguro (planejado, **não implementado sem autorização**): webhook/evento autenticado do Supabase (Database Webhook/Edge Function) → endpoint seguro de CI/CD (ex.: trigger de deploy no provedor/GitHub Actions) usando segredo de deploy armazenado no servidor/CI (nunca no cliente), com autenticação HMAC/token, idempotência e rate-limit. Alternativa: job agendado no CI que roda `seo:generate`+build/deploy quando houver mudanças elegíveis. Requer autorização explícita para qualquer integração produtiva.

## Segurança
- Apenas tenant `js-empregos` e fontes públicas autorizadas (`jobs` publicados, `public_services_v1`). Sem dados privados/candidatos. Textos do Supabase sanitizados/escapados em HTML, atributos e JSON-LD. Sem invenção de empregador/localização/conteúdo.

## Rollback
- Reverter `package.json` (`build` → `tsc -b && vite build`, remover scripts `seo:*`/`build:app`), remover `scripts/seo-orchestrator.mjs`, `docs/SEO_ORCHESTRATOR_P0.3.md`, `src/tests/seo/seo-safety.test.ts` e alterações em `src/main.tsx`, `src/App.tsx`, `scripts/prerender-public-seo.mjs`, `scripts/generate-seo-files.mjs` conforme diff; regenerar artefatos anteriores se necessário. Sem migrations/commit/push/deploy.
