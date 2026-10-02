const fs = require('fs');
const rm = JSON.parse(fs.readFileSync('C:/NewWaveProjetos/jrtercerisados/docs/architecture/route-map.json', 'utf8'));
const arr = Array.isArray(rm) ? rm : Object.values(rm).flat();
console.log('=== route-map: registros sem type ===');
const sem = arr.filter((r) => !r.type);
console.log(JSON.stringify(sem, null, 2));

// contar <Route em App.tsx
const src = fs.readFileSync('C:/NewWaveProjetos/jrtercerisados/src/App.tsx', 'utf8');
const rotaTag = (src.match(/<Route\b/g) || []).length;
const pathAttr = (src.match(/\bpath=/g) || []).length;
console.log('\n=== App.tsx ===');
console.log('ocorrencias de <Route:', rotaTag);
console.log('atributos path=:', pathAttr);

// launcherRoutes derivadas
const modulosLauncher = (src.match(/launcherRoutes\.map/g) || []).length;
console.log('launcherRoutes.map presente:', modulosLauncher > 0);

// contar <Route dentro do mapa de launcher (indireto)
const i = src.indexOf('{launcherRoutes.map');
console.log('\ntrecho do launcher (300 chars):');
console.log(src.slice(i, i + 300));