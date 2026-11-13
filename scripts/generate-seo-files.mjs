import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

const SITE_URL = 'https://jsempregos.com.br';
const TENANT_SLUG = 'js-empregos';
const OUT_DIR = path.join(process.cwd(), 'public');
const MAX_URLS_PER_SITEMAP = 50000;
const MAX_BYTES_PER_SITEMAP = 50 * 1024 * 1024;

function loadSeoRegistry() {
  const p = path.join(process.cwd(), 'src', 'seo', 'public-seo-registry.json');
  if (!fs.existsSync(p)) throw new Error(`Registry SEO ausente: ${p}`);
  const raw = fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(raw);
}

function loadDotEnv(file) {
  const p = path.join(process.cwd(), file);
  if (!fs.existsSync(p)) return;
  const text = fs.readFileSync(p, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2];
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadDotEnv('.env');
loadDotEnv('.env.local');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || '';

function toDate(v) {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function normalizeLoc(loc) {
  try {
    const u = new URL(loc);
    if (u.protocol !== 'https:') throw new Error('URL não-HTTPS');
    u.hash = '';
    let p = u.pathname || '/';
    if (p !== '/' && p.endsWith('/')) p = p.slice(0, -1);
    u.pathname = p;
    return u.toString();
  } catch {
    throw new Error(`URL inválida/não canônica no sitemap: ${loc}`);
  }
}

function urlEntry(loc, lastmod) {
  const canonical = normalizeLoc(loc);
  const lines = ['  <url>', `    <loc>${esc(canonical)}</loc>`];
  if (lastmod) lines.push(`    <lastmod>${lastmod}</lastmod>`);
  lines.push('  </url>');
  return lines.join('\n');
}

function wrapUrlset(entries, comment) {
  const body = entries.length ? `\n${entries.join('\n\n')}\n` : '\n';
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${comment ? `  <!-- ${comment} -->\n` : ''}${body}</urlset>\n`;
}

function wrapIndex(items) {
  const body = items.map(i => `  <sitemap>\n    <loc>${esc(normalizeLoc(i.loc))}</loc>${i.lastmod ? `\n    <lastmod>${i.lastmod}</lastmod>` : ''}\n  </sitemap>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
}

function dedupeEntries(entries, label, issues) {
  const seen = new Set();
  const out = [];
  for (const e of entries) {
    if (seen.has(e.loc)) { issues.push(`URL duplicada removida (${label}): ${e.loc}`); continue; }
    seen.add(e.loc);
    out.push(e);
  }
  return out;
}

function chunkEntries(entries) {
  if (!entries.length) return [entries];
  const chunks = [];
  let cur = [];
  for (const e of entries) {
    cur.push(e);
    const xml = wrapUrlset(cur.map(x => x.xml));
    if (cur.length > MAX_URLS_PER_SITEMAP || Buffer.byteLength(xml, 'utf8') > MAX_BYTES_PER_SITEMAP) {
      const last = cur.pop();
      if (cur.length) chunks.push(cur);
      cur = last ? [last] : [];
    }
  }
  if (cur.length) chunks.push(cur);
  return chunks;
}

async function fetchPublishedJobs(supabase, tenantId) {
  const select = 'slug,published_at,updated_at,created_at,expires_at,status';
  let q = supabase.from('jobs').select(select).eq('status', 'published').not('slug', 'is', null);
  if (tenantId) q = q.eq('tenant_id', tenantId);
  const { data, error } = await q;
  if (error) throw error;
  const now = new Date();
  return (data || [])
    .filter(r => typeof r.slug === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(r.slug.trim()))
    .filter(r => !r.expires_at || new Date(r.expires_at) > now);
}

async function fetchPublishedServices(supabase) {
  const { data, error } = await supabase.from('public_services_v1').select('slug,published_at,status');
  if (error) throw error;
  return (data || [])
    .filter(r => typeof r.slug === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(r.slug.trim()))
    .filter(r => !r.status || String(r.status) === 'published');
}

async function resolveTenantId(supabase) {
  const { data, error } = await supabase.from('tenants').select('id,slug').eq('slug', TENANT_SLUG).maybeSingle();
  if (error) {
    console.warn('[sitemap] tenant lookup failed:', error.message);
    return null;
  }
  return data?.id || null;
}

function buildStaticPages(fallbackDate) {
  const reg = loadSeoRegistry();
  const pages = Array.isArray(reg.staticPages) ? reg.staticPages : [];
  return pages
    .filter(p => p && p.indexable && p.sitemap === 'pages' && typeof p.path === 'string')
    .map(p => ({
      path: p.path === '/' ? '/' : String(p.path).replace(/\/+$/, '') || '/',
      lastmod: toDate(p.lastmod) || fallbackDate,
    }));
}

function write(file, content) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, file), content, 'utf8');
  console.log('wrote', file);
}

function buildRobots() {
  return `# ROBOTS.TXT - J&S Empregos LTDA
# Controle de indexação para motores de busca

Sitemap: ${SITE_URL}/sitemap.xml

User-agent: *
Allow: /

# Áreas privadas / autenticação
Disallow: /login
Disallow: /entrar/
Disallow: /cadastro/
Disallow: /recuperar-senha
Disallow: /redefinir-senha
Disallow: /auth/
Disallow: /onboarding
Disallow: /primeiro-acesso/

# Áreas administrativas / dashboard
Disallow: /dashboard/
Disallow: /candidato/
Disallow: /admin/

# APIs e internos
Disallow: /api/
Disallow: /supabase/

# Parâmetros de sessão/autenticação
Disallow: /*?session=*
Disallow: /*?code=*
Disallow: /*?token=*
Disallow: /*?error=*
Disallow: /*?redirect_to=*
`;
}

function makeSitemapFiles(prefix, label, items, fallbackDate, issues) {
  const normalized = items.map(i => ({ loc: normalizeLoc(`${SITE_URL}${i.path}`), lastmod: i.lastmod || fallbackDate }));
  const deduped = dedupeEntries(normalized, prefix, issues);
  const chunks = chunkEntries(deduped.map(i => ({ ...i, xml: urlEntry(i.loc, i.lastmod) })));
  const files = [];
  if (chunks.length === 1) {
    const name = `${prefix}.xml`;
    write(name, wrapUrlset(chunks[0].map(x => x.xml), label));
    const lm = chunks[0].map(x => x.lastmod).filter(Boolean).sort().at(-1) || fallbackDate;
    files.push({ loc: `${SITE_URL}/${name}`, lastmod: lm, urls: chunks[0].map(x => x.loc) });
  } else {
    for (let i = 0; i < chunks.length; i++) {
      const name = `${prefix}-${i + 1}.xml`;
      write(name, wrapUrlset(chunks[i].map(x => x.xml), `${label} (parte ${i + 1})`));
      const lm = chunks[i].map(x => x.lastmod).filter(Boolean).sort().at(-1) || fallbackDate;
      files.push({ loc: `${SITE_URL}/${name}`, lastmod: lm, urls: chunks[i].map(x => x.loc) });
    }
  }
  return files;
}

async function main() {
  const fallbackDate = new Date().toISOString().slice(0, 10);
  let jobs = [];
  let services = [];
  let blogArticles = [];
  let regionalPages = [];
  const warnings = [];
  const issues = [];

  if (SUPABASE_URL && SUPABASE_KEY) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
    try {
      const tenantId = await resolveTenantId(supabase);
      if (!tenantId) warnings.push(`Tenant '${TENANT_SLUG}' not resolved; skipping job URLs to avoid cross-tenant leakage.`);
      else jobs = await fetchPublishedJobs(supabase, tenantId);
    } catch (e) {
      warnings.push(`Jobs fetch failed: ${e.message}`);
    }
    try {
      services = await fetchPublishedServices(supabase);
    } catch (e) {
      warnings.push(`Services fetch failed: ${e.message}`);
    }
    // Blog/regional: integrar apenas fontes reais/publicadas quando existirem no futuro (sem sitemap vazio)
    void blogArticles; void regionalPages;
  } else {
    warnings.push('Supabase credentials missing; dynamic job/service URLs omitted (static pages only).');
  }

  const staticItems = buildStaticPages(fallbackDate);
  const jobItems = jobs.map(j => ({ path: `/vagas/${j.slug}`, lastmod: toDate(j.updated_at || j.published_at || j.created_at) || fallbackDate }));
  const serviceItems = services.map(s => ({ path: `/servicos/${s.slug}`, lastmod: toDate(s.updated_at || s.published_at) || fallbackDate }));

  const pageFiles = makeSitemapFiles('sitemap-pages', 'Páginas públicas', staticItems, fallbackDate, issues);
  const jobFiles = makeSitemapFiles('sitemap-vagas', `Vagas publicadas (tenant: ${TENANT_SLUG})`, jobItems, fallbackDate, issues);
  const serviceFiles = makeSitemapFiles('sitemap-servicos', `Serviços publicados (tenant: ${TENANT_SLUG})`, serviceItems, fallbackDate, issues);

  const indexItems = [...pageFiles, ...jobFiles, ...serviceFiles].map(f => ({ loc: f.loc, lastmod: f.lastmod }));
  const indexXml = wrapIndex(indexItems);
  write('sitemap-index.xml', indexXml);
  write('sitemap.xml', indexXml);
  write('robots.txt', buildRobots());

  const allUrls = [...pageFiles, ...jobFiles, ...serviceFiles].flatMap(f => f.urls);
  const unique = new Set(allUrls);
  if (unique.size !== allUrls.length) issues.push(`Duplicatas canônicas detectadas entre sitemaps: ${allUrls.length - unique.size}`);
  for (const u of allUrls) {
    if (!u.startsWith('https://')) issues.push(`URL não-HTTPS: ${u}`);
  }

  const summary = {
    tenant: TENANT_SLUG,
    site: SITE_URL,
    generatedAt: new Date().toISOString(),
    counts: { pages: staticItems.length, jobs: jobItems.length, services: serviceItems.length, blog: blogArticles.length, regional: regionalPages.length, sitemapFiles: indexItems.length, urlsUnique: unique.size },
    warnings,
    issues,
  };
  fs.writeFileSync(path.join(process.cwd(), 'scripts', '.seo-generate-last.json'), JSON.stringify(summary, null, 2), 'utf8');
  console.log(JSON.stringify(summary, null, 2));
  if (warnings.length) console.warn('WARNINGS:', warnings.join(' | '));
  if (issues.length) console.warn('ISSUES:', issues.join(' | '));
}

import { fileURLToPath } from 'node:url';
const isDirect = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirect) {
  main().catch(e => { console.error(e); process.exit(1); });
}

export { main, buildStaticPages, fetchPublishedJobs, fetchPublishedServices, resolveTenantId, loadDotEnv, SITE_URL, TENANT_SLUG, OUT_DIR };
