/**
 * CHECK BOULER 24H — auditoria não destrutiva de navegação (somente leitura).
 * Execute NA RAIZ DO REPOSITÓRIO com Node >=22 e @playwright/test instalado.
 * Exemplo (PowerShell):
 *   $env:ROUTE_AUDIT_STATES='anon;admin_master:playwright/.auth/admin-master.json'
 *   node scripts/teste_rotas_jsempregos.mjs
 * Opcional: ROUTE_AUDIT_BASE=http://localhost:3000
 *           ROUTE_AUDIT_MAX_PAGES=350, ROUTE_AUDIT_MAX_CLICKS=300
 * Arquivos de sessão são lidos localmente; não copie nem compartilhe tokens.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const BASE = new URL(process.env.ROUTE_AUDIT_BASE || 'http://localhost:3000');
const OUT = path.resolve(process.env.ROUTE_AUDIT_OUT || './route-audit-resultados');
const MAX_PAGES = Number(process.env.ROUTE_AUDIT_MAX_PAGES || 350);
const MAX_CLICKS = Number(process.env.ROUTE_AUDIT_MAX_CLICKS || 300);
const TIMEOUT_MS = Number(process.env.ROUTE_AUDIT_TIMEOUT_MS || 8000);
const WAIT_MS = Number(process.env.ROUTE_AUDIT_SETTLE_MS || 450);
const HEADLESS = process.env.ROUTE_AUDIT_HEADLESS !== 'false';
const sources = [];
const knownUrls = new Set([
  '/', '/login', '/candidatos', '/candidato', '/candidato/vagas',
  '/dashboard', '/dashboard/global', '/dashboard/admin-master',
  '/dashboard/recrutamento', '/dashboard/recrutamento/candidatos',
  '/dashboard/rh', '/dashboard/rh/candidatos', '/dashboard/ava',
  '/dashboard/suporte', '/dashboard/financeiro',
  '/dashboard/candidatos', '/dashboard/candidato',
  '/dashboard/candidatos/habilidades', '/dashboard/recrutamento/habilidades',
  '/dashboard/vagas', '/dashboard/candidaturas',
]);
const invalidText = /página não encontrada|pagina nao encontrada|404|em breve|rota não encontrada|not found|não foi possível carregar/i;
const authPaths = /^\/(login|entrar|auth\/|primeiro-acesso|selecionar-tenant|onboarding|redefinir-senha)/;
const SAFE = (u) => /^\/[\wÀ-ÿ.\-/:]*\/?$/.test(u) && !/[?:*]/.test(u) && !u.includes('..');

if (!fs.existsSync(path.join(ROOT, 'src', 'App.tsx'))) {
  throw new Error('Execute na raiz do projeto: src/App.tsx não encontrado.');
}
fs.mkdirSync(OUT, { recursive: true });

function scan(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) { if (!['node_modules', 'dist', 'coverage', '__tests__'].includes(entry.name)) scan(abs); continue; }
    if (!/\.(tsx|ts)$/.test(entry.name) || /\.test\.|\.spec\./.test(entry.name)) continue;
    const text = fs.readFileSync(abs, 'utf8');
    const relative = path.relative(ROOT, abs).replaceAll('\\', '/');
    const patterns = [
      /\b(?:to|href|route|homeRoute)\s*[:=]\s*["'`](\/[^"'`\s]+)["'`]/g,
      /\bnavigate\(\s*["'`](\/[^"'`\s]+)["'`]/g,
      /<Route\b[\s\S]{0,180}?\bpath\s*=\s*["'`](\/[^"'`\s]+)["'`]/g,
    ];
    for (const re of patterns) {
      for (const match of text.matchAll(re)) {
        let u = match[1].replace(/\/$/, '') || '/';
        if (!SAFE(u)) continue;
        knownUrls.add(u);
        sources.push({ url: u, file: relative, line: text.slice(0, match.index).split('\n').length });
      }
    }
  }
}
scan(path.join(ROOT, 'src'));

const stateItems = (process.env.ROUTE_AUDIT_STATES || 'anon')
  .split(';').map((s) => s.trim()).filter(Boolean).map((s) => {
    const i = s.indexOf(':');
    return i === -1 ? { role: s, stateFile: null } : { role: s.slice(0,i), stateFile: s.slice(i+1) };
  });
const normalized = (u) => u.replace(/\/+$/, '') || '/';
const same = (a,b) => normalized(a) === normalized(b);
const readTarget = (href) => {
  try {const u = new URL(href, BASE); return u.origin === BASE.origin && SAFE(u.pathname) ? normalized(u.pathname) : null;} catch {return null;}
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const hrefsOf = async (page) => {
  const a = await page.locator('a[href]').evaluateAll((nodes) => nodes.map((el) => ({href: el.getAttribute('href'), text: (el.textContent || '').trim().slice(0,90)})));
  return a.map((v,i) => ({...v, index:i, target:readTarget(v.href)})).filter((v) => !!v.target);
};

async function inspect(page, requested, role, via='direct', origin=null) {
  const messages = [];
  const pageErrors=[];
  const onError = (e) => pageErrors.push(String(e).slice(0,180));
  const onConsole = (m) => {if(m.type()==='error') messages.push(m.text().slice(0,180));};
  page.on('pageerror',onError);page.on('console',onConsole);
  let http = null, final = null, heading = '', body = '', anchors=[],error = null;
  try {
    const response=await page.goto(new URL(requested,BASE).toString(),{waitUntil:'domcontentloaded',timeout:TIMEOUT_MS});
    http=response?.status()??null;
    await sleep(WAIT_MS);
    final=normalized(new URL(page.url()).pathname);
    heading=await page.locator('h1').first().innerText({timeout:800}).catch(()=> '');
    body=(await page.locator('body').innerText({timeout:1300}).catch(()=> '')).slice(0,850);
    anchors=await hrefsOf(page);
  }catch(e){error=String(e).slice(0,220);try{final=normalized(new URL(page.url()).pathname)}catch{}}
  page.off('pageerror',onError);page.off('console',onConsole);
  let status='OK';
  if(error || (http && http >= 400))status='ERRO_TECNICO';
  else if(final && !same(final,requested)) {
    status=authPaths.test(final)?(role==='anon'?'AUTH_OU_CONTEXTO':final==='/login'?'SESSAO_AUSENTE':'CONTEXTO_NECESSARIO'):'REDIRECT';
    if(final==='/dashboard/admin-master' && requested.startsWith('/dashboard/recrutamento'))status='RETORNO_INDEVIDO_ADMIN';
  }else if(invalidText.test(heading) || (/^(404|página não encontrada|em breve)$/i.test(body.trim().slice(0,50))))status='FALLBACK_OU_404';
  if(pageErrors.length)status=status==='OK'?'EXCECAO_JAVASCRIPT':status;
  return {role,via,origin,requested,final,http,status,heading:heading.slice(0,100),error,
    browserErrors:pageErrors.slice(0,2),consoleErrors:messages.slice(0,2),links:anchors.length,anchors};
}

const reports=[];
const coverage=[];
const browser=await chromium.launch({headless:HEADLESS});
try {
  for (const {role,stateFile} of stateItems) {
    if(stateFile && !fs.existsSync(path.resolve(ROOT,stateFile))) {
      reports.push({role,via:'profile',requested:'-',status:'PERFIL_AUSENTE',error:'Arquivo de sessão local não encontrado'});
      continue;
    }
    const context=await browser.newContext({...(stateFile?{storageState:path.resolve(ROOT,stateFile)}:{}),viewport:{width:1280,height:840}});
    const queue=[...knownUrls];const seen=new Set();let clicks=0;
    for(let i=0;i<queue.length && seen.size<MAX_PAGES;i++){
      const target=queue[i];if(seen.has(target))continue;seen.add(target);
      const page=await context.newPage();
      const entry=await inspect(page,target,role);
      for(const a of entry.anchors){if(!seen.has(a.target)&&!queue.includes(a.target))queue.push(a.target)}
      if(entry.status!=='OK'&&entry.status!=='AUTH_OU_CONTEXTO') console.log(`[${role}] ${entry.status} ${target} => ${entry.final??'?'} (${entry.http??'-'})`);
      reports.push({...entry,anchors:undefined});
      // Clica em links renderizados reais. Usa página nova, sem executar formulários/mutações.
      if(entry.status==='OK' && clicks<MAX_CLICKS){
        for(const a of entry.anchors){
          if(clicks>=MAX_CLICKS)break;
          if(!a.href || !a.target || a.target===target)continue;
          if(/^\/(logout|sair|auth\/signout)/.test(a.target) || /\b(sair|logout|excluir|apagar|remover|desativar|suspender|aprovar|rejeitar|cancelar)\b/i.test(a.text))continue;
          clicks++;
          const clickPage=await context.newPage();
          try {
            await clickPage.goto(new URL(target,BASE).toString(),{waitUntil:'domcontentloaded',timeout:TIMEOUT_MS});
            await sleep(180);
            // Seleção por href exato e não pelo texto evita ambiguidade em menus.
            const cssHref=a.href.replaceAll('\\','\\\\').replaceAll('"','\\"');
            const anchor=clickPage.locator(`a[href="${cssHref}"]`).first();
            if(await anchor.count() && await anchor.isVisible()){
              await anchor.click({timeout:2500,noWaitAfter:true});
              await sleep(WAIT_MS);
              const final=normalized(new URL(clickPage.url()).pathname);
              const status=same(final,a.target)?'OK_CLICK':authPaths.test(final)?(role==='anon'?'AUTH_OU_CONTEXTO':final==='/login'?'SESSAO_AUSENTE':'CONTEXTO_NECESSARIO'):
                (final==='/dashboard/admin-master'&&a.target.startsWith('/dashboard/recrutamento'))?'RETORNO_INDEVIDO_ADMIN':'REDIRECT_CLICK';
              reports.push({role,via:'click',origin:target,requested:a.target,final,status,linkText:a.text});
            } else reports.push({role,via:'click',origin:target,requested:a.target,status:'LINK_NAO_VISIVEL',linkText:a.text});
          }catch(e){reports.push({role,via:'click',origin:target,requested:a.target,status:'ERRO_CLICK',error:String(e).slice(0,130)});}
          finally{await clickPage.close()}
        }
      }
      await page.close();
    }
    await context.close();
    coverage.push({role,visited:seen.size,discovered:queue.length,clicks,maxPages:MAX_PAGES,maxClicks:MAX_CLICKS,truncatedPages:queue.length>seen.size,truncatedClicks:clicks>=MAX_CLICKS});
    console.log(`[${role}] Visitadas ${seen.size} de ${queue.length} URLs; ${clicks} tentativas de clique`);
  }
}finally{await browser.close()}

const counts={};for(const r of reports)counts[r.status]=(counts[r.status]||0)+1;
const sanitize=(r)=>({...r,consoleErrors:r.consoleErrors?.map(s=>s.replace(/(Bearer|apikey|access_token|refresh_token)\s*[:=]\s*\S+/gi,'[credencial ocultada]'))});
const data={checkedAt:new Date().toISOString(),base:BASE.origin,sourceCount:sources.length,staticUrls:knownUrls.size,coverage,counts,results:reports.map(sanitize)};
fs.writeFileSync(path.join(OUT,'rotas.json'),JSON.stringify(data,null,2));
const interesting=reports.filter(r=>!['OK','OK_CLICK'].includes(r.status));
const md=[`# Auditoria CHECK BOULER 24H — Links e rotas`,``,`Data: ${data.checkedAt}`,`Base: ${data.base}`,`URLs estáticas descobertas: ${knownUrls.size}`,`URLs/links verificados: ${reports.length}`,``,`Cobertura por perfil: ${coverage.map(c=>`${c.role}: ${c.visited}/${c.discovered} páginas, ${c.clicks} cliques${c.truncatedPages?" (LIMITE DE PÁGINAS ATINGIDO)":""}${c.truncatedClicks?" (LIMITE DE CLIQUES ATINGIDO)":""}`).join("; ")}`,``,`## Resultados`,``,...Object.entries(counts).sort().map(([k,v])=>`- ${k}: ${v}`),``,`## Ocorrências`,``,`| Perfil | Tipo | Origem | Solicitada | Destino | Status |`,`|---|---|---|---|---|---|`,...interesting.map(r=>`| ${r.role} | ${r.via} | ${r.origin??'-'} | ${r.requested??'-'} | ${r.final??'-'} | ${r.status} |`),``,`## Limites`,``,`- Rota inacessível por Auth/tenant não é link quebrado: precisa de sessão autorizada por perfil.`,`- Rotas parametrizadas são verificadas somente quando a aplicação oferece links reais para IDs existentes.`,`- A auditoria testa links renderizados e destinos estáticos; não clica em botões que executem operações de escrita.`,`- Status HTTP 200 de SPA não prova que a página correta foi renderizada; conferir relatório e headings.`];
fs.writeFileSync(path.join(OUT,'rotas.md'),md.join('\n'));
console.log('Resumo:',counts);
console.log('Relatórios:',path.join(OUT,'rotas.md'),path.join(OUT,'rotas.json'));
if(coverage.some(c=>c.truncatedPages||c.truncatedClicks)||Object.keys(counts).some(s=>['RETORNO_INDEVIDO_ADMIN','ERRO_TECNICO','EXCECAO_JAVASCRIPT','ERRO_CLICK','FALLBACK_OU_404'].includes(s)))process.exitCode=1;
