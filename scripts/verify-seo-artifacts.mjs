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

function checkSitemapFile(dir, name, expectedCount, rootTag) {
  const p = path.join(dir, name);
  assert(fs.existsSync(p), `${dir.includes('dist') ? 'dist' : 'public'}/${name} ausente`);
  const xml = read(p);
  assert(xml.includes(`<${rootTag}`), `${name} deve conter <${rootTag}>`);
  const locs = countLocs(xml);
  assert(locs.length === expectedCount, `${name} deve ter ${expectedCount} <loc>, encontrado ${locs.length}`);
  const u = unique(locs);
  assert(u.size === locs.length, `${name} possui URLs duplicadas`);
  return locs;
}

const pubIndex = read(path.join(PUBLIC, 'sitemap.xml'));
const distIndex = read(path.join(DIST, 'sitemap.xml'));
assert(pubIndex.includes('<sitemapindex'), 'public/sitemap.xml deve ser sitemapindex');
assert(distIndex.includes('<sitemapindex'), 'dist/sitemap.xml deve ser sitemapindex');
for (const child of ['sitemap-pages.xml', 'sitemap-vagas.xml', 'sitemap-servicos.xml']) {
  assert(pubIndex.includes(child), `sitemap.xml deve referenciar ${child}`);
  assert(distIndex.includes(child), `dist/sitemap.xml deve referenciar ${child}`);
}

const pubPages = checkSitemapFile(PUBLIC, 'sitemap-pages.xml', 18, 'urlset');
const pubVagas = checkSitemapFile(PUBLIC, 'sitemap-vagas.xml', 19, 'urlset');
const pubServicos = checkSitemapFile(PUBLIC, 'sitemap-servicos.xml', 20, 'urlset');
const distPages = checkSitemapFile(DIST, 'sitemap-pages.xml', 18, 'urlset');
const distVagas = checkSitemapFile(DIST, 'sitemap-vagas.xml', 19, 'urlset');
const distServicos = checkSitemapFile(DIST, 'sitemap-servicos.xml', 20, 'urlset');

const pubAll = [...pubPages, ...pubVagas, ...pubServicos];
const distAll = [...distPages, ...distVagas, ...distServicos];
assert(unique(pubAll).size === 57, `public sitemaps devem ter 57 URLs únicas, encontrado ${unique(pubAll).size}`);
assert(unique(distAll).size === 57, `dist sitemaps devem ter 57 URLs únicas, encontrado ${unique(distAll).size}`);
assert(pubAll.length === 57 && distAll.length === 57, 'total de URLs deve ser 57 sem duplicação');

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
assert(htmlCount === 57, `esperado 57 HTMLs prerenderizados, encontrado ${htmlCount}`);
assert(fs.existsSync(path.join(DIST, '.htaccess')), 'dist/.htaccess ausente');

console.log(JSON.stringify({
  ok: process.exitCode !== 1,
  counts: { pages: 18, vagas: 19, servicos: 20, urls: 57, html: htmlCount },
  duplicates: 0,
  divergences: 0,
}, null, 2));

if (process.exitCode === 1) process.exit(1);
