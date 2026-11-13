import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PUBLIC_DIR = path.join(ROOT, 'public');

function loadSeoRegistry() {
  const p = path.join(ROOT, 'src', 'seo', 'public-seo-registry.json');
  if (!fs.existsSync(p)) throw new Error(`Registry SEO ausente: ${p}`);
  const raw = fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(raw);
}
const REGISTRY = loadSeoRegistry();
const SITE_URL = REGISTRY.siteUrl || 'https://jsempregos.com.br';
const TENANT_SLUG = REGISTRY.tenantSlug || 'js-empregos';
const BRAND = REGISTRY.brand?.name || 'J&S Empregos LTDA';
const BRAND_ALIASES = Array.isArray(REGISTRY.brand?.alternateNames) ? REGISTRY.brand.alternateNames : ['J&S Empregos', 'JS Empregos', 'JSEmpregos'];

function loadDotEnv(file) {
  const p = path.join(ROOT, file);
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

function escHtml(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function safeText(v) {
  return String(v ?? '')
    .replace(/<[^>]*>/g, ' ')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function trimDesc(s, max = 160) {
  const v = safeText(s);
  if (v.length <= max) return v;
  return v.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
}
function absUrl(p) { return SITE_URL + (p === '/' ? '/' : p); }
function validSlug(s) { return typeof s === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s); }
function jsonLd(obj) { return JSON.stringify(obj).replace(/</g, '\\u003c'); }
function toDate(v) { if (!v) return null; const d = new Date(v); return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10); }
function escXml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;'); }
function normalizeLoc(loc) {
  try {
    const u = new URL(loc);
    if (u.protocol !== 'https:') throw new Error('URL nao-HTTPS');
    u.hash = '';
    let pth = u.pathname || '/';
    if (pth !== '/' && pth.endsWith('/')) pth = pth.slice(0, -1);
    u.pathname = pth;
    return u.toString();
  } catch { throw new Error(`URL invalida/nao canonica no sitemap: ${loc}`); }
}
function urlEntry(loc, lastmod) {
  const canonical = normalizeLoc(loc);
  const lines = ['  <url>', `    <loc>${escXml(canonical)}</loc>`];
  if (lastmod) lines.push(`    <lastmod>${lastmod}</lastmod>`);
  lines.push('  </url>');
  return lines.join('\n');
}
function wrapUrlset(entries, comment) { const body = entries.length ? `\n${entries.join('\n\n')}\n` : '\n'; return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${comment ? `  <!-- ${comment} -->\n` : ''}${body}</urlset>\n`; }
function wrapIndex(items) { const body = items.map(i => `  <sitemap>\n    <loc>${escXml(normalizeLoc(i.loc))}</loc>${i.lastmod ? `\n    <lastmod>${i.lastmod}</lastmod>` : ''}\n  </sitemap>`).join('\n'); return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`; }
function dedupeLocEntries(entries, issues, label) {
  const seen = new Set(); const out = [];
  for (const e of entries) { if (seen.has(e.loc)) { issues.push(`Duplicata removida (${label}): ${e.loc}`); continue; } seen.add(e.loc); out.push(e); }
  return out;
}

const STATIC_META = Object.fromEntries(
  (REGISTRY.staticPages || []).filter(p => p && p.indexable && p.sitemap === 'pages').map(p => [
    p.path,
    {
      title: p.title || `${BRAND}`,
      description: p.description || BRAND,
      h1: p.h1 || p.title || BRAND,
      intro: p.description || '',
      changefreq: p.changefreq || 'monthly',
      priority: p.priority || '0.5',
    },
  ])
);
const STATIC_PATHS = Object.keys(STATIC_META);

async function resolveTenantId(supabase) {
  const { data, error } = await supabase.from('tenants').select('id,slug').eq('slug', TENANT_SLUG).maybeSingle();
  if (error) throw new Error(`Tenant lookup failed: ${error.message}`);
  if (!data?.id) throw new Error(`Tenant '${TENANT_SLUG}' não encontrado`);
  return data.id;
}
async function fetchAll(supabase, table, select, build) {
  const out = []; const pageSize = 500;
  for (let offset = 0; offset < 100000; offset += pageSize) {
    let q = supabase.from(table).select(select).range(offset, offset + pageSize - 1);
    q = build(q);
    const { data, error } = await q;
    if (error) throw new Error(`${table}: ${error.message}`);
    const rows = data || [];
    out.push(...rows);
    if (rows.length < pageSize) break;
  }
  return out;
}
function buildStaticEntries() {
  return STATIC_PATHS.map(p => { const m = STATIC_META[p]; return { kind: 'static', path: p, name: m.h1, title: m.title, description: trimDesc(m.description), h1: m.h1, intro: m.intro, image: '/images/brand/og-image.svg', source: null }; });
}
function buildJobEntry(job) {
  const name = safeText(job.title); const city = safeText(job.city); const loc = city ? `${city}${job.state ? '/' + safeText(job.state) : ''}` : '';
  const title = `${name}${city ? ` em ${city}` : ''} — Vaga de Emprego | ${BRAND}`;
  const desc = trimDesc(job.description || `Vaga de ${name}${loc ? ` em ${loc}` : ''}. Confira requisitos e candidate-se pela J&S Empregos.`);
  return { kind: 'job', path: `/vagas/${job.slug}`, name, title, description: desc, h1: name, intro: desc, image: job.company_logo_url || '/images/brand/og-image.svg', source: job, lastmod: toDate(job.updated_at || job.published_at || job.created_at) };
}
function buildServiceEntry(svc) {
  const name = safeText(svc.name);
  const title = `${safeText(svc.seo_title) || name} | ${BRAND}`;
  const desc = trimDesc(svc.seo_description || svc.short_description || svc.description || `Conheça o serviço ${name} da J&S Empregos.`);
  return { kind: 'service', path: `/servicos/${svc.slug}`, name, title, description: desc, h1: name, intro: trimDesc(svc.short_description || svc.description || desc, 220), image: svc.hero_image_url || svc.card_image_url || '/images/brand/og-image.svg', source: svc, lastmod: toDate(svc.published_at) };
}
function breadcrumbs(entry) {
  const items = [{ name: 'Início', item: absUrl('/') }];
  if (entry.kind === 'job') items.push({ name: 'Vagas', item: absUrl('/vagas') });
  if (entry.kind === 'service') items.push({ name: 'Serviços', item: absUrl('/servicos') });
  if (entry.path !== '/') items.push({ name: entry.name, item: absUrl(entry.path) });
  return { '@type': 'BreadcrumbList', itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.item })) };
}
function pageSchema(entry) {
  const url = absUrl(entry.path);
  const graph = [
    { '@type': 'Organization', '@id': SITE_URL + '/#organization', name: BRAND, alternateName: BRAND_ALIASES, url: SITE_URL + '/' },
    { '@type': 'WebSite', '@id': SITE_URL + '/#website', name: REGISTRY.brand?.shortName || 'J&S Empregos', alternateName: BRAND_ALIASES, url: SITE_URL + '/', inLanguage: 'pt-BR', publisher: { '@id': SITE_URL + '/#organization' } },
    { '@type': 'WebPage', '@id': url + '#webpage', url, name: entry.title, description: entry.description, inLanguage: 'pt-BR', isPartOf: { '@id': SITE_URL + '/#website' } },
  ];
  if (entry.path !== '/') graph.push(breadcrumbs(entry));
  if (entry.kind === 'service') graph.push({ '@type': 'Service', name: entry.name, description: entry.description, url, provider: { '@id': SITE_URL + '/#organization' } });
  if (entry.kind === 'job') {
    const j = entry.source || {};
    const posted = j.published_at || j.updated_at || j.created_at;
    const desc = safeText(j.description || entry.description);
    if (entry.name && desc && posted) {
      const posting = { '@type': 'JobPosting', title: entry.name, description: desc, url, datePosted: posted, hiringOrganization: { '@type': 'Organization', name: 'Confidencial' } };
      if (j.city || j.state) posting.jobLocation = { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: safeText(j.city) || undefined, addressRegion: safeText(j.state) || undefined, addressCountry: 'BR' } };
      if (j.contract_type) posting.employmentType = ({ clt: 'FULL_TIME', internship: 'INTERN', temporary: 'TEMPORARY', freelance: 'CONTRACTOR', contracted: 'CONTRACTOR' }[String(j.contract_type).toLowerCase()] || undefined);
      if (String(j.work_mode || '').toLowerCase() === 'remote') posting.jobLocationType = 'TELECOMMUTE';
      if (j.expires_at) posting.validThrough = j.expires_at;
      graph.push(posting);
    }
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}
function renderBody(entry, allServices, allJobs) {
  const h = escHtml; const t = (v) => h(safeText(v));
  let nav = `<nav aria-label="Navegação"><a href="/">Início</a>`;
  if (entry.kind === 'job') nav += ` / <a href="/vagas">Vagas</a>`;
  if (entry.kind === 'service') nav += ` / <a href="/servicos">Serviços</a>`;
  if (entry.path !== '/' && entry.kind === 'static') nav += ` / <span>${t(entry.name)}</span>`;
  if (entry.kind !== 'static') nav += ` / <span>${t(entry.name)}</span>`;
  nav += `</nav>`;
  let inner = `${nav}<article><h1>${t(entry.h1 || entry.name)}</h1><p>${t(entry.intro || entry.description)}</p>`;
  if (entry.kind === 'job') {
    const j = entry.source || {}; const loc = [safeText(j.city), safeText(j.state)].filter(Boolean).join(' / ');
    if (loc) inner += `<p><strong>Local:</strong> ${h(loc)}</p>`;
    const mode = ({ onsite: 'Presencial', hybrid: 'Híbrido', remote: 'Remoto' })[String(j.work_mode || '').toLowerCase()]; if (mode) inner += `<p><strong>Modalidade:</strong> ${h(mode)}</p>`;
    const ct = ({ clt: 'CLT', internship: 'Estágio', temporary: 'Temporário', freelance: 'Freelance', contracted: 'Terceirizado' })[String(j.contract_type || '').toLowerCase()]; if (ct) inner += `<p><strong>Contrato:</strong> ${h(ct)}</p>`;
    if (safeText(j.description)) inner += `<section><h2>Descrição da vaga</h2><p>${t(j.description)}</p></section>`;
    if (safeText(j.responsibilities)) inner += `<section><h2>Responsabilidades</h2><p>${t(j.responsibilities)}</p></section>`;
    if (safeText(j.requirements)) inner += `<section><h2>Requisitos</h2><p>${t(j.requirements)}</p></section>`;
    if (safeText(j.benefits)) inner += `<section><h2>Benefícios</h2><p>${t(j.benefits)}</p></section>`;
    inner += `<p><a href="/vagas">Ver todas as vagas</a> · <a href="/candidatos">Área do candidato</a> · <a href="/contato">Contato</a></p>`;
  } else if (entry.kind === 'service') {
    const s = entry.source || {};
    if (safeText(s.short_description)) inner += `<p><strong>${t(s.short_description)}</strong></p>`;
    if (safeText(s.description)) inner += `<section><h2>Sobre o serviço</h2><p>${t(s.description)}</p></section>`;
    const benefits = Array.isArray(s.benefits) ? s.benefits.filter(x => safeText(x)) : (typeof s.benefits === 'string' && safeText(s.benefits) ? [s.benefits] : []);
    if (benefits.length) inner += `<section><h2>Benefícios</h2><ul>${benefits.map(b => `<li>${t(b)}</li>`).join('')}</ul></section>`;
    inner += `<p><a href="/servicos">Ver todos os serviços</a> · <a href="/empresas">Soluções para empresas</a> · <a href="/contato">Solicitar contato</a></p>`;
  } else if (entry.path === '/vagas') {
    inner += `<section><h2>Oportunidades publicadas</h2><ul>${allJobs.slice(0, 80).map(j => `<li><a href="/vagas/${h(j.slug)}">${t(j.title)}</a></li>`).join('')}</ul></section>`;
  } else if (entry.path === '/servicos') {
    inner += `<section><h2>Serviços disponíveis</h2><ul>${allServices.slice(0, 80).map(s => `<li><a href="/servicos/${h(s.slug)}">${t(s.name)}</a></li>`).join('')}</ul></section>`;
  } else if (entry.path === '/') {
    inner += `<section><h2>Vagas em destaque</h2><ul>${allJobs.slice(0, 10).map(j => `<li><a href="/vagas/${h(j.slug)}">${t(j.title)}</a></li>`).join('')}</ul><p><a href="/vagas">Ver todas as vagas</a></p></section>`;
    inner += `<section><h2>Serviços</h2><ul>${allServices.slice(0, 10).map(s => `<li><a href="/servicos/${h(s.slug)}">${t(s.name)}</a></li>`).join('')}</ul><p><a href="/servicos">Ver todos os serviços</a></p></section>`;
  } else {
    inner += `<p><a href="/vagas">Vagas</a> · <a href="/servicos">Serviços</a> · <a href="/contato">Contato</a></p>`;
  }
  inner += `</article>`;
  return `<main id="seo-prerendered" data-prerendered="true" lang="pt-BR" style="max-width:1100px;margin:0 auto;padding:2rem 1rem;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.6">${inner}</main>`;
}
function injectHtml(template, entry, allServices, allJobs) {
  const url = absUrl(entry.path); const title = escHtml(entry.title); const desc = escHtml(entry.description);
  const image = absUrl(entry.image && entry.image.startsWith('http') ? entry.image : (entry.image || '/images/brand/og-image.svg'));
  const ogType = entry.kind === 'job' ? 'article' : 'website';
  const head = [
    `<title data-seo="1">${title}</title>`, `<meta data-seo="1" name="description" content="${desc}">`,
    `<meta data-seo="1" name="robots" content="index, follow">`, `<link data-seo="1" rel="canonical" href="${escHtml(url)}">`,
    `<meta data-seo="1" property="og:title" content="${title}">`, `<meta data-seo="1" property="og:description" content="${desc}">`,
    `<meta data-seo="1" property="og:url" content="${escHtml(url)}">`, `<meta data-seo="1" property="og:type" content="${ogType}">`,
    `<meta data-seo="1" property="og:site_name" content="J&S Empregos">`, `<meta data-seo="1" property="og:locale" content="pt_BR">`,
    `<meta data-seo="1" property="og:image" content="${escHtml(image)}">`, `<meta data-seo="1" name="twitter:card" content="summary_large_image">`,
    `<meta data-seo="1" name="twitter:title" content="${title}">`, `<meta data-seo="1" name="twitter:description" content="${desc}">`,
    `<meta data-seo="1" name="twitter:image" content="${escHtml(image)}">`,
    `<script data-seo="1" type="application/ld+json">${jsonLd(pageSchema(entry))}</script>`,
  ].join('\n    ');
  let html = template;
  html = html.replace(/<title>[\s\S]*?<\/title>/i, '');
  html = html.replace(/<meta\b[^>]*\bname=["']description["'][^>]*>/gi, '');
  html = html.replace(/<meta\b[^>]*\bname=["']robots["'][^>]*>/gi, '');
  html = html.replace(/<link\b[^>]*\brel=["']canonical["'][^>]*>/gi, '');
  html = html.replace(/<meta\b[^>]*\bproperty=["']og:[^"']+["'][^>]*>/gi, '');
  html = html.replace(/<meta\b[^>]*\bname=["']twitter:[^"']+["'][^>]*>/gi, '');
  html = html.replace(/<script\b[^>]*\btype=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace('</head>', `    ${head}\n  </head>`);
  const body = renderBody(entry, allServices, allJobs);
  if (!html.includes('<div id="root"></div>')) throw new Error('Template dist/index.html sem <div id="root"></div>');
  html = html.replace('<div id="root"></div>', `<div id="root">${body}</div>`);
  if (html.includes('id="root"></div>')) throw new Error(`Injeção falhou para ${entry.path}`);
  return html;
}
async function writeRouteHtml(entry, html) {
  if (entry.path === '/') { await fsp.writeFile(path.join(DIST, 'index.html'), html, 'utf8'); return; }
  const dir = path.join(DIST, entry.path.replace(/^\//, ''));
  await fsp.mkdir(dir, { recursive: true });
  await fsp.writeFile(path.join(dir, 'index.html'), html, 'utf8');
}
function readSitemapUrls(file) {
  const p = path.join(PUBLIC_DIR, file); if (!fs.existsSync(p)) return [];
  const xml = fs.readFileSync(p, 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
}
void readSitemapUrls;
async function main() {
  if (!fs.existsSync(path.join(DIST, 'index.html'))) throw new Error('dist/index.html não encontrado. Execute o build (vite) antes do prerender.');
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Credenciais Supabase ausentes (VITE_SUPABASE_URL/PUBLISHABLE_KEY).');
  const template = await fsp.readFile(path.join(DIST, 'index.html'), 'utf8');
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const tenantId = await resolveTenantId(supabase);
  const jobs = await fetchAll(supabase, 'jobs', 'id,slug,title,description,responsibilities,requirements,benefits,city,state,contract_type,work_mode,seniority,published_at,updated_at,created_at,expires_at,status', q => q.eq('status', 'published').eq('tenant_id', tenantId).not('slug', 'is', null).order('published_at', { ascending: false }));
  const services = await fetchAll(supabase, 'public_services_v1', 'slug,name,short_description,description,seo_title,seo_description,hero_image_url,card_image_url,published_at,status,benefits', q => q.order('slug', { ascending: true }));
  const now = new Date();
  const eligibleJobs = jobs.filter(j => validSlug(j.slug) && (!j.expires_at || new Date(j.expires_at) > now));
  const eligibleServices = services.filter(s => validSlug(s.slug) && String(s.status || 'published') === 'published');
  const staticEntries = buildStaticEntries(); const jobEntries = eligibleJobs.map(buildJobEntry); const serviceEntries = eligibleServices.map(buildServiceEntry);
  const allEntries = [...staticEntries, ...jobEntries, ...serviceEntries];
  const seen = new Set(); for (const e of allEntries) { if (seen.has(e.path)) throw new Error(`Duplicata: ${e.path}`); seen.add(e.path); }
  for (const entry of allEntries) { const html = injectHtml(template, entry, eligibleServices, eligibleJobs); await writeRouteHtml(entry, html); }

  // Gera sitemaps/robots consistentes com o inventario usado no prerender (fonte: mesmo snapshot elegivel)
  const today = new Date().toISOString().slice(0, 10);
  const seoIssues = [];
  const staticUrlEntries = dedupeLocEntries(STATIC_PATHS.map(p => ({ loc: normalizeLoc(absUrl(p)), lastmod: today })), seoIssues, 'pages');
  const jobUrlEntries = dedupeLocEntries(eligibleJobs.map(j => ({ loc: normalizeLoc(absUrl(`/vagas/${j.slug}`)), lastmod: toDate(j.updated_at || j.published_at || j.created_at) || today })), seoIssues, 'vagas');
  const serviceUrlEntries = dedupeLocEntries(eligibleServices.map(s => ({ loc: normalizeLoc(absUrl(`/servicos/${s.slug}`)), lastmod: toDate(s.updated_at || s.published_at) || today })), seoIssues, 'servicos');
  const sitemapPages = wrapUrlset(staticUrlEntries.map(e => urlEntry(e.loc, e.lastmod)), 'Paginas publicas');
  const sitemapVagas = wrapUrlset(jobUrlEntries.map(e => urlEntry(e.loc, e.lastmod)), `Vagas publicadas (tenant: ${TENANT_SLUG})`);
  const sitemapServicos = wrapUrlset(serviceUrlEntries.map(e => urlEntry(e.loc, e.lastmod)), `Servicos publicados (tenant: ${TENANT_SLUG})`);
  // Blog/regional: sem sitemap vazio ate existir conteudo real publicado
  const indexItems = [
    { loc: `${SITE_URL}/sitemap-pages.xml`, lastmod: staticUrlEntries.map(x => x.lastmod).filter(Boolean).sort().at(-1) || today },
    { loc: `${SITE_URL}/sitemap-vagas.xml`, lastmod: jobUrlEntries.map(x => x.lastmod).filter(Boolean).sort().at(-1) || today },
    { loc: `${SITE_URL}/sitemap-servicos.xml`, lastmod: serviceUrlEntries.map(x => x.lastmod).filter(Boolean).sort().at(-1) || today },
  ];
  const sitemapIndex = wrapIndex(indexItems);
  const robots = `# ROBOTS.TXT - J&S Empregos LTDA\n# Controle de indexacao para motores de busca\n\nSitemap: ${SITE_URL}/sitemap.xml\n\nUser-agent: *\nAllow: /\n\n# Areas privadas / autenticacao\nDisallow: /login\nDisallow: /entrar/\nDisallow: /cadastro/\nDisallow: /recuperar-senha\nDisallow: /redefinir-senha\nDisallow: /auth/\nDisallow: /onboarding\nDisallow: /primeiro-acesso/\n\n# Areas administrativas / dashboard\nDisallow: /dashboard/\nDisallow: /candidato/\nDisallow: /admin/\n\n# APIs e internos\nDisallow: /api/\nDisallow: /supabase/\n\n# Parametros de sessao/autenticacao\nDisallow: /*?session=*\nDisallow: /*?code=*\nDisallow: /*?token=*\nDisallow: /*?error=*\nDisallow: /*?redirect_to=*\n`;
  const seoFiles = {
    'sitemap-pages.xml': sitemapPages,
    'sitemap-vagas.xml': sitemapVagas,
    'sitemap-servicos.xml': sitemapServicos,
    'sitemap-index.xml': sitemapIndex,
    'sitemap.xml': sitemapIndex,
    'robots.txt': robots,
  };
  for (const [name, content] of Object.entries(seoFiles)) {
    await fsp.writeFile(path.join(PUBLIC_DIR, name), content, 'utf8');
    await fsp.writeFile(path.join(DIST, name), content, 'utf8');
  }

  // Cruzamento A (elegíveis), B (sitemaps gerados do mesmo inventário), C (prerenderizados)
  const setA = new Set(allEntries.map(e => absUrl(e.path)));
  const urlsB = new Set([
    ...[...sitemapPages.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]),
    ...[...sitemapVagas.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]),
    ...[...sitemapServicos.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]),
  ]);
  const setC = new Set(allEntries.map(e => absUrl(e.path)));
  const missingInB = [...setA].filter(u => !urlsB.has(u)); const orphanInB = [...urlsB].filter(u => !setA.has(u)); const missingInC = [...setA].filter(u => !setC.has(u));
  const requiredPaths = ['/servicos/processo-de-rh', '/servicos/mao-de-obra-temporaria', '/vagas/consultor-de-vendas-hibrido'];
  const report = { generatedAt: new Date().toISOString(), counts: { static: staticEntries.length, jobs: jobEntries.length, services: serviceEntries.length, total: allEntries.length }, required: Object.fromEntries(requiredPaths.map(p => [p, setA.has(absUrl(p))])), crossCheck: { eligibleA: setA.size, sitemapB: urlsB.size, prerenderedC: setC.size, missingInSitemap: missingInB, orphanInSitemap: orphanInB, missingInPrerender: missingInC }, seoIssues };
  await fsp.mkdir(path.join(ROOT, 'scripts'), { recursive: true });
  await fsp.writeFile(path.join(ROOT, 'scripts', '.prerender-report.json'), JSON.stringify(report, null, 2), 'utf8');
  console.log(JSON.stringify(report, null, 2));
  if (!(report.counts.total > 0 && missingInC.length === 0 && Object.values(report.required).every(Boolean))) throw new Error('Prerender incompleto ou URLs obrigatórias ausentes');
  if (missingInB.length || orphanInB.length) throw new Error(`Divergência sitemap vs elegíveis: faltantes=${missingInB.length} órfãos=${orphanInB.length}`);
}
main().catch(e => { console.error('PRERENDER FALHOU:', e.message); process.exit(1); });
