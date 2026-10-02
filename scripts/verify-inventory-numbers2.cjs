const fs = require('fs');
const path = 'C:/NewWaveProjetos/jrtercerisados/docs/architecture';
const j = (f) => JSON.parse(fs.readFileSync(`${path}/${f}`, 'utf8'));

const si = j('supabase-inventory.json');
console.log('=== supabase-inventory totals ===');
console.log(JSON.stringify(si.totals, null, 2));

// triggers: contar de verdade
let trig = 0;
const nomes = new Set();
for (const o of si.objects) {
  const t = o.triggers || (o.trigger_count != null ? o.trigger_count : 0);
  trig += Array.isArray(t) ? t.length : t;
}
console.log('\nsoma de triggers em objects:', trig);
console.log('chaves do primeiro object:', Object.keys(si.objects[0]).join(', '));
console.log('exemplo object[0]:', JSON.stringify(si.objects[0]).slice(0, 400));

// kinds
const kinds = {};
for (const o of si.objects) kinds[o.kind || o.object_type || o.type] = (kinds[o.kind || o.object_type || o.type] || 0) + 1;
console.log('\nkinds:', JSON.stringify(kinds));

const fi = j('frontend-inventory.json');
console.log('\n=== frontend-inventory totals ===');
console.log(JSON.stringify(fi.totals, null, 2));
console.log('roles:', fi.roles.length, '| duplicates:', fi.duplicates.length);
const nFiles = Object.keys(fi.files).length;
console.log('arquivos no map:', nFiles);

// role-cell
const byRole = {};
for (const [f, v] of Object.entries(fi.files)) {
  const r = v.role || '?';
  byRole[r] = byRole[r] || { total: 0, unreachable: 0, noConsumers: 0 };
  byRole[r].total++;
  if (v.reachable === false) byRole[r].unreachable++;
  if ((v.consumers || []).length === 0) byRole[r].noConsumers++;
}
console.log('\npor papel:');
Object.entries(byRole)
  .sort((a, b) => b[1].total - a[1].total)
  .forEach(([r, s]) => console.log(`  ${r.padEnd(16)} total ${String(s.total).padStart(4)}  inalc ${String(s.unreachable).padStart(4)}  semConsumidor ${String(s.noConsumers).padStart(4)}`));

const mm = j('migration-map.json');
console.log('\n=== migration-map ===');
console.log('count:', mm.count);
console.log('amostra migration:', JSON.stringify(mm.migration).slice(0, 600));

const rm = j('route-map.json');
console.log('\n=== route-map: 2 registros sem type ===');
console.log(JSON.stringify(rm.filter((r) => !r.type && !(r.source || r.kind)), null, 2).slice(0, 800));