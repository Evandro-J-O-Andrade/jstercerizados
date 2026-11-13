#!/usr/bin/env node
/**
 * J&S Empregos — SEO production healthcheck (read-only)
 * Usage: node seo-prod-healthcheck.mjs --origin https://jsempregos.com.br [--all] [--json]
 * Node.js >= 20. No Supabase credentials or mutations.
 */
const argv = process.argv.slice(2);
const valueFor = (flag, fallback) => {
  const index = argv.indexOf(flag);
  return index !== -1 && argv[index + 1] ? argv[index + 1] : fallback;
};
const origin = new URL(valueFor('--origin', 'https://jsempregos.com.br')).origin;
const checkAll = argv.includes('--all');
const jsonOnly = argv.includes('--json');
const TIMEOUT_MS = Math.max(1000, Number(valueFor('--timeout', '12000')) || 12000);
const MAX_URLS = 1000;
const failures = [];
const warnings = [];
const results = [];
const note = (ok, name, detail, critical = true) => {
  results.push({ ok, name, detail });
  if (!ok) (critical ? failures : warnings).push({ name, detail });
};
const decodeXML = (value) => value.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&apos;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>');
const xmlLocs = (xml) => [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((m) => decodeXML(m[1].trim()));
const escRe = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const absolutePath = (url) => {
  const parsed = new URL(url);
  if (parsed.origin !== origin) throw new Error(`Fora do domínio: ${url}`);
  if (parsed.search || parsed.hash) throw new Error(`URL não canônica: ${url}`);
  return parsed.pathname;
};
async function get(path) {
  const url = new URL(path, origin);
  const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(TIMEOUT_MS), headers: { 'user-agent': 'JSE-SEO-Healthcheck/1.0' } });
  return { url: response.url, status: response.status, type: response.headers.get('content-type') || '', body: await response.text() };
}
async function checkedGet(path, label) {
  try {
    const result = await get(path);
    note(result.status === 200, `${label}: HTTP 200`, `HTTP ${result.status}, ${result.type}`);
    return result;
  } catch (e) {
    note(false, `${label}: fetch`, String(e));
    return null;
  }
}
const xmlPaths = ['sitemap-pages.xml', 'sitemap-vagas.xml', 'sitemap-servicos.xml'];
const sitemap = await checkedGet('/sitemap.xml', 'Índice de sitemap');
let sitemapUrls = [];
if (sitemap) {
  note(/<sitemapindex\b/i.test(sitemap.body) && !/<html\b/i.test(sitemap.body), 'Índice é sitemapindex, não HTML/URLSET', sitemap.body.slice(0, 160));
  note(/(?:application|text)\/xml/i.test(sitemap.type), 'MIME do sitemap', sitemap.type);
  const locs = xmlLocs(sitemap.body);
  for (const pathname of xmlPaths) note(locs.includes(`${origin}/${pathname}`), `Índice referencia ${pathname}`, locs.join(', '));
}
const robots = await checkedGet('/robots.txt', 'robots.txt');
if (robots) {
  note(!/<html\b/i.test(robots.body) && /User-agent:\s*\*/i.test(robots.body), 'Robots em texto, com user-agent', robots.body.slice(0, 120));
  note(/text\/plain/i.test(robots.type), 'MIME de robots.txt', robots.type, false);
  note(new RegExp(`^Sitemap:\\s*${escRe(origin)}\\/sitemap\\.xml\\s*$`, 'im').test(robots.body), 'Robots referencia sitemap canônico', robots.body.match(/^Sitemap:.*$/gim)?.join(', ') || 'ausente');
  note(!/^Disallow:\s*\/(?:vagas|servicos)(?:\/|\s|$)/im.test(robots.body), 'Robots não bloqueia vagas/serviços públicos', 'Disallow indevido');
}
for (const pathname of xmlPaths) {
  const response = await checkedGet(`/${pathname}`, pathname);
  if (!response) continue;
  note(/<urlset\b/i.test(response.body) && !/<html\b/i.test(response.body), `${pathname} contém urlset`, response.body.slice(0, 160));
  note(/(?:application|text)\/xml/i.test(response.type), `${pathname} tem MIME XML`, response.type);
  const locs = xmlLocs(response.body);
  note(locs.length > 0, `${pathname} não está vazio`, `${locs.length} URLs`);
  for (const loc of locs) {
    try { absolutePath(loc); } catch (e) { note(false, `URL inválida em ${pathname}`, String(e)); }
  }
  sitemapUrls.push(...locs);
  const reportedLastmod = [...response.body.matchAll(/<lastmod>\s*([^<]+)\s*<\/lastmod>/gi)].map((m) => m[1].trim());
  for (const d of reportedLastmod) if (!Number.isFinite(Date.parse(d)) || Date.parse(d) > Date.now() + 86_400_000) note(false, `${pathname} lastmod incorreto`, d);
}
const unique = [...new Set(sitemapUrls)];
note(unique.length === sitemapUrls.length, 'URLs canônicas sem duplicatas entre sitemaps', `únicas=${unique.length}; total=${sitemapUrls.length}`);
const mandatoryPaths = ['/', '/vagas', '/servicos', '/servicos/processo-de-rh', '/servicos/mao-de-obra-temporaria', '/vagas/consultor-de-vendas-hibrido'];
for (const path of mandatoryPaths) note(unique.includes(`${origin}${path}`), `Sitemap contém ${path}`, 'Verificar inventário');
const samplePages = checkAll ? unique.slice(0, MAX_URLS).map((url) => new URL(url).pathname) : mandatoryPaths;
async function checkPage(path) {
  const response = await checkedGet(path, `Página ${path}`);
  if (!response) return;
  const html = response.body;
  note(/text\/html/i.test(response.type) && /<html\b/i.test(html), `${path}: HTML`, response.type);
  note(/<title>[^<]+<\/title>/i.test(html), `${path}: title inicial`, 'Missing <title>');
  note(/<meta\s+[^>]*name=["']description["'][^>]*>/i.test(html) || /<meta\s+[^>]*content=["'][^"']+["'][^>]*name=["']description["'][^>]*>/i.test(html), `${path}: meta description`, 'meta description ausente');
  const canonicals = [...html.matchAll(/<link\s+[^>]*rel=["']canonical["'][^>]*>/gi)];
  note(canonicals.length === 1, `${path}: canonical único`, `quantidade=${canonicals.length}`);
  if (canonicals.length) note(canonicals[0][0].includes(`${origin}${path}`), `${path}: canonical correto`, canonicals[0][0]);
  note(/<h1\b/i.test(html), `${path}: H1 no HTML inicial`, 'sem H1');
  note(/<script\s+[^>]*type=["']application\/ld\+json["']/i.test(html), `${path}: JSON-LD inicial`, 'ausente');
  note(/data-prerendered=["']true["']|id=["']seo-prerendered["']/i.test(html), `${path}: bloco prerenderizado`, 'possível shell SPA');
}
for (let i = 0; i < samplePages.length; i += 4) await Promise.all(samplePages.slice(i, i + 4).map(checkPage));
for (const path of ['/vagas/nao-existe-validacao-seo-84914', '/servicos/nao-existe-validacao-seo-84914']) {
  try {
    const response = await get(path);
    note([404,410].includes(response.status), `${path}: HTTP 404/410 real`, `HTTP ${response.status}`);
  } catch (e) { note(false, `${path}: fetch`, String(e)); }
}
const report = { origin, checkedAt: new Date().toISOString(), urls: { sitemapTotal: sitemapUrls.length, sitemapUnique: unique.length, sampled: samplePages.length }, checks: results.length, errors: failures, warnings, results };
if (jsonOnly) process.stdout.write(JSON.stringify(report, null, 2) + '\n');
else {
  console.log(`J&S SEO healthcheck — ${origin}\n${report.checkedAt}\nURLs ${unique.length}/${sitemapUrls.length} | verificações ${results.length} | erros ${failures.length} | alertas ${warnings.length}`);
  for (const item of failures) console.error(`ERRO  ${item.name}: ${item.detail}`);
  for (const item of warnings) console.warn(`AVISO ${item.name}: ${item.detail}`);
  if (!failures.length) console.log('OK: validações HTTP amostradas passaram (não é confirmação de indexação).');
}
process.exitCode = failures.length ? 1 : 0;
