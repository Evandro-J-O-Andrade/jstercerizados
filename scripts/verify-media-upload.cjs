const fs = require('fs');
const path = require('path');

// Ler o conteúdo da Edge Function
const functionPath = path.join('supabase', 'functions', 'media-upload', 'index.ts');
let functionCode;
try {
  functionCode = fs.readFileSync(functionPath, 'utf8');
  console.log('Edge Function media-upload lida com sucesso:', functionCode.length, 'caracteres');
} catch (e) {
  console.error('Erro ao ler Edge Function:', e.message);
  process.exit(1);
}

// Verificar se as correções estão presentes
const checks = [
  { name: 'ALLOWED_DOC_MIME_TYPES', present: functionCode.includes('ALLOWED_DOC_MIME_TYPES') },
  { name: 'application/pdf', present: functionCode.includes('application/pdf') },
  { name: 'person em ENTITY_TO_RESOURCE', present: functionCode.includes("person: 'people.media'") },
  { name: 'cv propósito', present: functionCode.includes("'cv'") },
  { name: 'SHA-256 hash', present: functionCode.includes('computeSha256') },
  { name: 'file_hash persistido', present: functionCode.includes('file_hash: fileHash') },
  { name: 'private-documents bucket para cv', present: functionCode.includes("'cv': 'private-documents'") },
  { name: 'n8n webhook', present: functionCode.includes('notifyN8nWebhook') },
  { name: 'N8N_WEBHOOK_URL env', present: functionCode.includes('N8N_WEBHOOK_URL') },
];

console.log('\n=== Verificações da Edge Function ===');
checks.forEach(c => {
  console.log(`${c.present ? '✅' : '❌'} ${c.name}`);
});

const allOk = checks.every(c => c.present);
console.log('\n' + (allOk ? '✅ Todas as verificações passaram' : '❌ Algumas verificações falharam'));
process.exit(allOk ? 0 : 1);
