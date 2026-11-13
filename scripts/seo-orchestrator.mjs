import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PUBLIC_DIR = path.join(ROOT, 'public');
const SITE_URL = 'https://jsempregos.com.br';
const REPORT_JSON = path.join(ROOT, 'scripts', '.seo-orchestrator-report.json');
const REPORT_MD = path.join(ROOT, 'scripts', 'SEO_ORCHESTRATOR_REPORT.md');
const SNAPSHOT = path.join(ROOT, 'scripts', '.seo-public-snapshot.json');

function parseArgs(argv) {
  const args = { mode: 'build', dryRun: false };
  for (const a of argv.slice(2)) {
    if (a === '--audit') args.mode = 'audit';
    else if (a === '--generate') args.mode = 'generate';
    else if (a === '--build') args.mode = 'build';
    else if (a === '--validate') args.mode = 'validate';
    else if (a === '--dry-run') args.dryRun = true;
  }
  return args;
}

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32', ...opts });
    child.on('error', reject);
    child.on('close', (code) => code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(' ')} falhou (exit ${code})`)));
  });
}

function fileSet(dir, rel = '') {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const r = path.join(rel, e.name);
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...fileSet(full, r));
    else out.push(r.replace(/\\/g, '/'));
  }
  return out;
}

function sha1File(file) {
  if (!fs.existsSync(file)) return null;
  return createHash('sha1').update(fs.readFileSync(file)).digest('hex');
}
void sha1File;

function readJsonSafe(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }
}

function extractLocs(xml) { return [...String(xml || '').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]); }

async function snapshotSeoFiles(where, label) {
  const files = ['sitemap.xml','sitemap-pages.xml','sitemap-vagas.xml','sitemap-servicos.xml','sitemap-index.xml','robots.txt'];
  const snap = { label, where, files: {} };
  for (const f of files) {
    const p = path.join(where, f);
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf8');
      snap.files[f] = { exists: true, bytes: Buffer.byteLength(content, 'utf8'), locs: extractLocs(content) };
    } else {
      snap.files[f] = { exists: false, bytes: 0, locs: [] };
    }
  }
  return snap;
}

function validateSitemaps(snap) {
  const issues = [];
  for (const [name, meta] of Object.entries(snap.files)) {
    if (name.endsWith('.xml') && !meta.exists) issues.push(`sitemap ausente: ${name} (${snap.label})`);
    if (name === 'robots.txt' && !meta.exists) issues.push(`robots ausente (${snap.label})`);
    if (meta.exists && meta.bytes < 20) issues.push(`arquivo suspeito/vazio: ${name} (${snap.label})`);
  }
  const urls = [...(snap.files['sitemap-pages.xml']?.locs || []), ...(snap.files['sitemap-vagas.xml']?.locs || []), ...(snap.files['sitemap-servicos.xml']?.locs || [])];
  const seen = new Set(); const dups = [];
  for (const u of urls) { if (seen.has(u)) dups.push(u); seen.add(u); }
  if (dups.length) issues.push(`URLs duplicadas nos sitemaps (${snap.label}): ${dups.slice(0,10).join(', ')}`);
  return { urls, unique: seen.size, issues, duplicates: dups };
}

function validateDistHtml(distSnapUrls, distDir) {
  const issues = [];
  const required = ['/', '/vagas', '/servicos', '/servicos/processo-de-rh', '/servicos/mao-de-obra-temporaria', '/vagas/consultor-de-vendas-hibrido'];
  const all = new Set();
  if (fs.existsSync(path.join(distDir, 'index.html'))) all.add(SITE_URL + '/');
  for (const rel of fileSet(distDir)) {
    if (!rel.endsWith('/index.html') && rel !== 'index.html') continue;
    if (rel === 'index.html') continue;
    const route = '/' + rel.replace(/\/index\.html$/, '');
    all.add(SITE_URL + route);
  }
  for (const r of required) if (!all.has(SITE_URL + r)) issues.push(`HTML obrigatório ausente em dist: ${r}`);
  const htmlIssues = [];
  for (const r of required) {
    const p = r === '/' ? path.join(distDir, 'index.html') : path.join(distDir, r.replace(/^\//,''), 'index.html');
    if (!fs.existsSync(p)) continue;
    const c = fs.readFileSync(p, 'utf8');
    if (!/<title[^>]*>.+<\/title>/is.test(c)) htmlIssues.push(`${r}: sem <title>`);
    if (!/rel=["']canonical["']/i.test(c)) htmlIssues.push(`${r}: sem canonical`);
    if (!/<h1\b/i.test(c)) htmlIssues.push(`${r}: sem h1`);
    if (!/application\/ld\+json/i.test(c)) htmlIssues.push(`${r}: sem JSON-LD`);
    if (!/data-prerendered="true"/.test(c)) htmlIssues.push(`${r}: sem marcador prerender`);
  }
  issues.push(...htmlIssues);
  return { count: all.size, urls: [...all], issues };
}

function mdReport(report) {
  const lines = [];
  lines.push('# Relatório SEO Orchestrator');
  lines.push('');
  lines.push(`- Gerado em: ${report.generatedAt}`);
  lines.push(`- Modo: ${report.mode}`);
  lines.push(`- Sucesso: ${report.ok ? 'sim' : 'não'}`);
  lines.push('');
  lines.push('## Cobertura');
  lines.push(`- Sitemaps (public, URLs únicas): ${report.coverage?.sitemapUnique ?? 'n/d'}`);
  lines.push(`- HTML em dist: ${report.coverage?.distHtml ?? 'n/d'}`);
  lines.push(`- Manifesto prerender total: ${report.coverage?.prerenderTotal ?? 'n/d'}`);
  lines.push('');
  if (report.required) {
    lines.push('## URLs obrigatórias');
    for (const [u, ok] of Object.entries(report.required)) lines.push(`- ${ok ? 'OK' : 'FALTA'} ${u}`);
    lines.push('');
  }
  lines.push('## Divergências');
  const div = report.divergences || {};
  lines.push(`- Faltando no sitemap: ${(div.missingInSitemap||[]).length ? div.missingInSitemap.join(', ') : 'nenhuma'}`);
  lines.push(`- Órfãs no sitemap: ${(div.orphanInSitemap||[]).length ? div.orphanInSitemap.join(', ') : 'nenhuma'}`);
  lines.push(`- Faltando no prerender/dist: ${(div.missingInPrerender||[]).length ? div.missingInPrerender.join(', ') : 'nenhuma'}`);
  lines.push('');
  lines.push('## Erros/Avisos');
  for (const e of (report.errors||[])) lines.push(`- ERRO: ${e}`);
  for (const w of (report.warnings||[])) lines.push(`- AVISO: ${w}`);
  if (!(report.errors||[]).length && !(report.warnings||[]).length) lines.push('- nenhum');
  lines.push('');
  lines.push('## Comandos executados');
  for (const c of (report.commands||[])) lines.push(`- ${c}`);
  lines.push('');
  lines.push('## Observações');
  lines.push('- Inventário cresce com publicações elegíveis (sem contagem fixa).');
  lines.push('- Publicação direta no Supabase exige novo build/deploy para atualizar HTML estático (sitemaps/HTML gerados no pipeline).');
  lines.push('- HTTP 404/410 reais e comportamento .htaccess/_redirects exigem homologação em Hostinger (não verificável localmente).');
  lines.push('- `src/main.tsx` limpa #root antes de createRoot: não é hidratação; requer validação visual (cinema/flash/conteúdo).');
  return lines.join('\n');
}

async function main() {
  const args = parseArgs(process.argv);
  const report = { generatedAt: new Date().toISOString(), mode: args.mode, dryRun: args.dryRun, commands: [], errors: [], warnings: [], ok: false, coverage: {}, required: {}, divergences: {} };

  const beforePublic = await snapshotSeoFiles(PUBLIC_DIR, 'public-before');
  await fsp.writeFile(SNAPSHOT, JSON.stringify(beforePublic, null, 2), 'utf8');

  try {
    if (args.mode === 'audit') {
      // Auditoria read-only: não gera/sobrescreve artefatos; inspeciona estado atual (public + relatório prerender existente)
      report.commands.push('audit:read-only (sem generate/build/prerender)');
      const currentPublic = await snapshotSeoFiles(PUBLIC_DIR, 'public-current');
      const smVal = validateSitemaps(currentPublic);
      if (smVal.issues.length) report.errors.push(...smVal.issues);
      const prer = readJsonSafe(path.join(ROOT, 'scripts', '.prerender-report.json'));
      report.coverage = { sitemapUnique: smVal.unique, prerenderTotal: prer?.counts?.total ?? null, distHtml: fs.existsSync(DIST) ? validateDistHtml([], DIST).count : null };
      report.required = prer?.required || {};
      report.divergences = prer?.crossCheck ? { missingInSitemap: prer.crossCheck.missingInSitemap||[], orphanInSitemap: prer.crossCheck.orphanInSitemap||[], missingInPrerender: prer.crossCheck.missingInPrerender||[] } : {};
      if (!prer) report.warnings.push('Relatório de prerender ausente; cobertura dinâmica de elegíveis/prerender não pode ser confirmada sem gerar/buildar.');
      report.ok = report.errors.length === 0;
    } else if (args.mode === 'validate') {
      // Validação read-only dos artefatos existentes (public + dist) sem gerar/sobrescrever
      report.commands.push('validate:read-only (public + dist, sem generate/build/prerender)');
      const currentPublic = await snapshotSeoFiles(PUBLIC_DIR, 'public-current');
      const smVal = validateSitemaps(currentPublic);
      if (smVal.issues.length) report.errors.push(...smVal.issues);

      const distSnap = await snapshotSeoFiles(DIST, 'dist');
      const distVal = validateSitemaps(distSnap);
      if (distVal.issues.length) report.errors.push(...distVal.issues);

      const prer = readJsonSafe(path.join(ROOT, 'scripts', '.prerender-report.json'));
      const distHtml = fs.existsSync(DIST) ? validateDistHtml([], DIST) : { count: 0, urls: [], issues: ['dist ausente'] };
      if (distHtml.issues.length) report.errors.push(...distHtml.issues);

      // Paridade sitemap (public) x prerender/dist
      const sitemapUrls = new Set(smVal.urls);
      const prerUrls = new Set((prer?.crossCheck?.eligibleA ? null : null, []));
      if (prer?.crossCheck) {
        for (const u of (prer.crossCheck.missingInSitemap || [])) report.errors.push(`Sitemap sem URL elegível: ${u}`);
        for (const u of (prer.crossCheck.orphanInSitemap || [])) report.errors.push(`Sitemap com órfã: ${u}`);
        for (const u of (prer.crossCheck.missingInPrerender || [])) report.errors.push(`Prerender/dist faltando URL elegível: ${u}`);
      } else {
        report.errors.push('Relatório de prerender ausente; não é possível confirmar cobertura/prerender.');
      }
      // Garantir que dist contenha HTML para cada URL do sitemap
      const distHtmlSet = new Set((distHtml.urls || []));
      for (const u of sitemapUrls) {
        if (distHtmlSet.size && !distHtmlSet.has(u)) report.errors.push(`dist sem HTML prerenderizado para URL do sitemap: ${u}`);
      }

      report.coverage = { sitemapUnique: smVal.unique, prerenderTotal: prer?.counts?.total ?? null, distHtml: distHtml.count };
      report.required = prer?.required || {};
      report.divergences = prer?.crossCheck ? { missingInSitemap: prer.crossCheck.missingInSitemap||[], orphanInSitemap: prer.crossCheck.orphanInSitemap||[], missingInPrerender: prer.crossCheck.missingInPrerender||[] } : {};
      report.ok = report.errors.length === 0;
    } else {
      // 1) gerar sitemaps/robots (public) a partir de fonte autorizada
      report.commands.push('node scripts/generate-seo-files.mjs');
      if (!args.dryRun) await run('node', ['scripts/generate-seo-files.mjs']);

      const afterGenPublic = await snapshotSeoFiles(PUBLIC_DIR, 'public-after-generate');
      const smVal = validateSitemaps(afterGenPublic);
      if (smVal.issues.length) report.errors.push(...smVal.issues);

      if (args.mode === 'generate') {
        const prer = readJsonSafe(path.join(ROOT, 'scripts', '.prerender-report.json'));
        report.coverage = { sitemapUnique: smVal.unique, prerenderTotal: prer?.counts?.total ?? null, distHtml: null };
        report.ok = report.errors.length === 0;
      } else {
        // build completo: sitemap -> tsc+vite -> prerender -> validação
        report.commands.push('npm run build:app');
        if (!args.dryRun) await run('npm', ['run', 'build:app']);

        // não sobrescrever public/dist com resultado vazio: pré-checagem
        const distIndex = path.join(DIST, 'index.html');
        if (!fs.existsSync(distIndex) || fs.statSync(distIndex).size < 200) throw new Error('dist/index.html ausente ou inválido após build:app; prerender abortado para preservar saídas.');

        report.commands.push('node scripts/prerender-public-seo.mjs');
        if (!args.dryRun) await run('node', ['scripts/prerender-public-seo.mjs']);

        const prer = readJsonSafe(path.join(ROOT, 'scripts', '.prerender-report.json'));
        const distSnap = await snapshotSeoFiles(DIST, 'dist-after-prerender');
        const distSmVal = validateSitemaps(distSnap);
        const distHtml = validateDistHtml([], DIST);
        if (distSmVal.issues.length) report.errors.push(...distSmVal.issues);
        if (distHtml.issues.length) report.errors.push(...distHtml.issues);
        if (prer?.crossCheck?.missingInSitemap?.length) report.errors.push(`Sitemap sem URLs elegíveis: ${prer.crossCheck.missingInSitemap.join(', ')}`);
        if (prer?.crossCheck?.orphanInSitemap?.length) report.errors.push(`Sitemap com órfãs: ${prer.crossCheck.orphanInSitemap.join(', ')}`);
        if (prer?.crossCheck?.missingInPrerender?.length) report.errors.push(`Prerender faltando: ${prer.crossCheck.missingInPrerender.join(', ')}`);

        report.coverage = { sitemapUnique: smVal.unique, prerenderTotal: prer?.counts?.total ?? null, distHtml: distHtml.count };
        report.required = prer?.required || {};
        report.divergences = prer?.crossCheck ? { missingInSitemap: prer.crossCheck.missingInSitemap||[], orphanInSitemap: prer.crossCheck.orphanInSitemap||[], missingInPrerender: prer.crossCheck.missingInPrerender||[] } : {};
        report.ok = report.errors.length === 0;
      }
    }

    if (report.ok) {
      report.warnings.push('Homologação HTTP real (200/404/301, .htaccess/_redirects) e validação visual/boot React dependem de ambiente Hostinger/navegador.');
    }
  } catch (e) {
    report.errors.push(e.message || String(e));
    report.ok = false;
  }

  if (!args.dryRun) {
    await fsp.mkdir(path.join(ROOT, 'scripts'), { recursive: true });
    await fsp.writeFile(REPORT_JSON, JSON.stringify(report, null, 2), 'utf8');
    await fsp.writeFile(REPORT_MD, mdReport(report), 'utf8');
  }
  console.log(JSON.stringify({ ok: report.ok, mode: report.mode, coverage: report.coverage, errors: report.errors.length, warnings: report.warnings.length, reportJson: path.relative(ROOT, REPORT_JSON), reportMd: path.relative(ROOT, REPORT_MD) }, null, 2));
  if (!report.ok) process.exit(1);
}

main();
