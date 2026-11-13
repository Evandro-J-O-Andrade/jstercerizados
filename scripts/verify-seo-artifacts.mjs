import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const PUBLIC = path.join(ROOT, 'public');

function fail(msg) {
  console.error(`VERIFY_FAIL: ${msg}`);
  process.exitCode = 1;
}

function read(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

function countLocs(xml) {
  return [...String(xml || '').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

function unique(arr) {
  return new Set(arr);
}

function assert(cond, msg) {
  if (!cond) fail(msg);
}

function readSitemapFile(dir, name, rootTag) {
  const label = `${path.basename(dir)}/${name}`;
  const p = path.join(dir, name);
  assert(fs.existsSync(p), `${label} ausente`);
  const xml = read(p);
  assert(xml.includes(`<${rootTag}`), `${name} deve conter <${rootTag}>`);
  const locs = countLocs(xml);
  assert(locs.length > 0, `${label} não pode estar vazio`);
  const u = unique(locs);
  assert(u.size === locs.length, `${label} possui URLs duplicadas`);
  return locs;
}

function sameSet(a, b) {
  if (a.length !== b.length) return false;
  const sb = new Set(b);
  return a.every((x) => sb.has(x));
}

function sameOrdered(a, b) {
  return a.length === b.length && a.every((x, i) => x === b[i]);
}

const pubIndex = read(path.join(PUBLIC, 'sitemap.xml'));
const distIndex = read(path.join(DIST, 'sitemap.xml'));
assert(pubIndex.includes('<sitemapindex'), 'public/sitemap.xml deve ser sitemapindex');
assert(distIndex.includes('<sitemapindex'), 'dist/sitemap.xml deve ser sitemapindex');
for (const child of ['sitemap-pages.xml', 'sitemap-vagas.xml', 'sitemap-servicos.xml']) {
  assert(pubIndex.includes(child), `sitemap.xml deve referenciar ${child}`);
  assert(distIndex.includes(child), `dist/sitemap.xml deve referenciar ${child}`);
}

const pubPages = readSitemapFile(PUBLIC, 'sitemap-pages.xml', 'urlset');
const pubVagas = readSitemapFile(PUBLIC, 'sitemap-vagas.xml', 'urlset');
const pubServicos = readSitemapFile(PUBLIC, 'sitemap-servicos.xml', 'urlset');
const distPages = readSitemapFile(DIST, 'sitemap-pages.xml', 'urlset');
const distVagas = readSitemapFile(DIST, 'sitemap-vagas.xml', 'urlset');
const distServicos = readSitemapFile(DIST, 'sitemap-servicos.xml', 'urlset');

assert(sameOrdered(pubPages, distPages), 'sitemap-pages.xml diverge entre public e dist');
assert(sameOrdered(pubVagas, distVagas), 'sitemap-vagas.xml diverge entre public e dist');
assert(sameOrdered(pubServicos, distServicos), 'sitemap-servicos.xml diverge entre public e dist');

const pubAll = [...pubPages, ...pubVagas, ...pubServicos];
const distAll = [...distPages, ...distVagas, ...distServicos];
assert(unique(pubAll).size === pubAll.length, 'public sitemaps possuem URLs duplicadas entre arquivos');
assert(unique(distAll).size === distAll.length, 'dist sitemaps possuem URLs duplicadas entre arquivos');
assert(sameSet(pubAll, distAll), 'URLs divergentes entre sitemaps public e dist');

const robots = read(path.join(DIST, 'robots.txt'));
assert(robots.includes('Sitemap: https://jsempregos.com.br/sitemap.xml'), 'robots.txt deve apontar para sitemap index');

function urlToDistPath(url) {
  const u = new URL(url);
  const p = u.pathname === '/' ? '/index.html' : `${u.pathname.replace(/\/$/, '')}/index.html`;
  return path.join(DIST, p);
}

let htmlCount = 0;
const missing = [];
for (const url of distAll) {
  const file = urlToDistPath(url);
  if (fs.existsSync(file)) htmlCount += 1;
  else missing.push(url);
}
assert(missing.length === 0, `HTML prerenderizado ausente para: ${missing.slice(0, 10).join(', ')}`);
assert(htmlCount === distAll.length, `esperado ${distAll.length} HTMLs prerenderizados, encontrado ${htmlCount}`);
assert(fs.existsSync(path.join(DIST, '.htaccess')), 'dist/.htaccess ausente');

console.log(JSON.stringify({
  ok: process.exitCode !== 1,
  counts: { pages: distPages.length, vagas: distVagas.length, servicos: distServicos.length, urls: distAll.length, html: htmlCount },
  duplicates: 0,
  divergences: 0,
}, null, 2));

if (process.exitCode === 1) process.exit(1);
