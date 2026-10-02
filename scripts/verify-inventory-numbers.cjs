const fs = require('fs');
const path = 'C:/NewWaveProjetos/jrtercerisados/docs/architecture';

const j = (f) => JSON.parse(fs.readFileSync(`${path}/${f}`, 'utf8'));

// --- migration-map.json: contrato quebrado + destinos
const mm = j('migration-map.json');
const top = Object.keys(mm);
console.log('=== migration-map.json ===');
console.log('chaves raiz:', top.join(', '));

const arr = (o) => (Array.isArray(o) ? o : Object.values(o).flat());

// --- route-map.json
const rm = j('route-map.json');
const rotas = arr(rm);
console.log(`\n=== route-map.json === ${rotas.length} registros`);
const byTipo = {};
for (const r of rotas) {
  const t = r.type || r.source || r.kind || 'desconhecido';
  byTipo[t] = (byTipo[t] || 0) + 1;
}
Object.entries(byTipo).forEach(([k, v]) => console.log(`  ${k}: ${v}`));

// --- supabase-inventory.json: contagens
const si = j('supabase-inventory.json');
console.log(`\n=== supabase-inventory.json === chaves: ${Object.keys(si).join(', ')}`);
for (const k of Object.keys(si)) {
  const v = si[k];
  if (Array.isArray(v)) console.log(`  ${k}: ${v.length} itens`);
  else if (v && typeof v === 'object') console.log(`  ${k}: objeto (${Object.keys(v).length} chaves)`);
  else console.log(`  ${k}: ${v}`);
}

// --- frontend-inventory.json
const fi = j('frontend-inventory.json');
console.log(`\n=== frontend-inventory.json === chaves: ${Object.keys(fi).join(', ')}`);
for (const k of Object.keys(fi)) {
  const v = fi[k];
  if (Array.isArray(v)) console.log(`  ${k}: ${v.length} itens`);
  else if (v && typeof v === 'object') console.log(`  ${k}: objeto (${Object.keys(v).slice(0, 8).join(', ')})`);
  else console.log(`  ${k}: ${v}`);
}