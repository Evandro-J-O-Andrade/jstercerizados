/**
 * scripts/reconcile-permissions.ts
 *
 * Reconcilia permissões do ModuleRegistry com o banco de dados.
 * Cria permissões faltantes e atualiza descrições.
 *
 * Uso:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SECRET_KEY=sb_secret_xxx \
 *   npx tsx scripts/reconcile-permissions.ts
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

function loadEnvFile(path: string) {
  try {
    const content = fs.readFileSync(path, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('='))
        continue;
      const [key, ...rest] = trimmed.split('=');
      const value = rest.join('=').trim();
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = value;
      }
    }
  } catch {
    // .env files optional
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env.provision');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error('❌ Missing required env vars.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false },
});

const PERMISSION_DESCRIPTIONS: Record<string, string> = {
  'tenants.read': 'Visualizar tenants',
  'tenants.create': 'Criar tenant',
  'tenants.update': 'Atualizar tenant',
  'tenants.delete': 'Remover tenant',
  'tenants.activate': 'Ativar tenant',
  'companies.read': 'Visualizar empresas/clientes',
  'companies.create': 'Criar empresa/cliente',
  'companies.update': 'Atualizar empresa/cliente',
  'companies.delete': 'Remover empresa/cliente',
  'companies.convert': 'Converter lead em cliente',
  'people.read': 'Visualizar pessoas/usuários',
  'people.create': 'Criar pessoa/usuário',
  'people.update': 'Atualizar pessoa/usuário',
  'people.delete': 'Remover pessoa/usuário',
  'people.disable': 'Desativar pessoa/usuário',
  'people.export': 'Exportar pessoas/usuários',
  'roles.read': 'Visualizar roles',
  'roles.create': 'Criar role',
  'roles.update': 'Atualizar role',
  'roles.delete': 'Remover role',
  'permissions.read': 'Visualizar permissões',
  'permissions.create': 'Criar permissão',
  'permissions.update': 'Atualizar permissão',
  'permissions.delete': 'Remover permissão',
  'audit.read': 'Visualizar logs de auditoria',
  'audit.export': 'Exportar logs de auditoria',
  'audit.filter': 'Filtrar logs de auditoria',
  'security_events.read': 'Visualizar eventos de segurança',
  'security_events.export': 'Exportar eventos de segurança',
  'finance.read': 'Visualizar financeiro',
  'finance.create': 'Criar lançamento financeiro',
  'finance.update': 'Atualizar lançamento financeiro',
  'finance.delete': 'Remover lançamento financeiro',
  'finance.approve': 'Aprovar pagamento',
  'finance.reject': 'Rejeitar pagamento',
  'finance.reconcile': 'Reconciliar lançamento',
  'finance.export': 'Exportar financeiro',
  'finance.forecast': 'Projetar fluxo de caixa',
  'billing.read': 'Visualizar faturamento',
  'billing.create': 'Criar fatura',
  'billing.update': 'Atualizar fatura',
  'billing.cancel': 'Cancelar fatura',
  'billing.export': 'Exportar faturamento',
  'fiscal.read': 'Visualizar fiscal',
  'fiscal.export': 'Exportar fiscal',
  'fiscal.invoices.read': 'Visualizar notas fiscais',
  'fiscal.invoices.create': 'Emitir nota fiscal',
  'fiscal.invoices.update': 'Atualizar nota fiscal',
  'fiscal.invoices.cancel': 'Cancelar nota fiscal',
  'fiscal.invoices.correct': 'Corrigir nota fiscal',
  'fiscal.invoices.export': 'Exportar notas fiscais',
  'fiscal.invoices.import': 'Importar notas recebidas',
  'fiscal.retentions.read': 'Visualizar retenções',
  'fiscal.retentions.create': 'Criar retenção',
  'fiscal.retentions.update': 'Atualizar retenção',
  'fiscal.reports.read': 'Visualizar relatórios fiscais',
  'fiscal.reports.generate': 'Gerar relatório fiscal',
  'accounting.read': 'Visualizar contabilidade',
  'accounting.export': 'Exportar contabilidade',
  'accounting.chart.read': 'Visualizar plano de contas',
  'accounting.chart.create': 'Criar conta contábil',
  'accounting.chart.update': 'Atualizar conta contábil',
  'accounting.chart.delete': 'Remover conta contábil',
  'accounting.entries.read': 'Visualizar lançamentos',
  'accounting.entries.create': 'Criar lançamento',
  'accounting.entries.update': 'Atualizar lançamento',
  'accounting.entries.delete': 'Remover lançamento',
  'accounting.statements.read': 'Visualizar balancetes',
  'accounting.statements.generate': 'Gerar balancete',
  'accounting.closing.read': 'Visualizar fechamento',
  'accounting.closing.create': 'Abrir período contábil',
  'accounting.closing.close': 'Fechar período contábil',
  'accounting.closing.reopen': 'Reabrir período contábil',
  'accounting.reports.read': 'Visualizar relatórios contábeis',
  'accounting.reports.generate': 'Gerar relatório contábil',
  'accounting.reports.sped': 'Gerar SPED',
  'jobs.read': 'Visualizar vagas',
  'jobs.create': 'Criar vaga',
  'jobs.update': 'Atualizar vaga',
  'jobs.archive': 'Arquivar vaga',
  'jobs.publish': 'Publicar vaga',
  'jobs.export': 'Exportar vagas',
  'candidates.read': 'Visualizar candidatos',
  'candidates.create': 'Criar candidato',
  'candidates.update': 'Atualizar candidato',
  'candidates.delete': 'Remover candidato',
  'candidates.export': 'Exportar candidatos',
  'applications.read': 'Visualizar candidaturas',
  'applications.approve': 'Aprovar candidatura',
  'applications.reject': 'Rejeitar candidatura',
  'applications.interview': 'Agendar entrevista',
  'domain_events.read': 'Visualizar eventos/indicadores',
  'domain_events.export': 'Exportar eventos',
  'files.read': 'Visualizar arquivos',
  'files.create': 'Upload de arquivo',
  'files.update': 'Atualizar arquivo',
  'files.delete': 'Remover arquivo',
  'contracts.read': 'Visualizar contratos',
  'contracts.create': 'Criar contrato',
  'contracts.update': 'Atualizar contrato',
  'contracts.delete': 'Remover contrato',
  'contracts.renew': 'Renovar contrato',
  'contracts.export': 'Exportar contrato',
  'documents.read': 'Visualizar documentos',
  'documents.update': 'Atualizar documento',
  'documents.publish': 'Publicar documento',
  'service_orders.read': 'Visualizar ordens de serviço',
  'service_orders.create': 'Criar ordem de serviço',
  'service_orders.update': 'Atualizar ordem de serviço',
  'service_orders.complete': 'Concluir ordem de serviço',
  'service_orders.cancel': 'Cancelar ordem de serviço',
  'support_tickets.read': 'Visualizar chamados',
  'support_tickets.create': 'Criar chamado',
  'support_tickets.update': 'Atualizar chamado',
  'support_tickets.resolve': 'Resolver chamado',
  'support_tickets.close': 'Fechar chamado',
  'stock_movements.read': 'Visualizar movimentações',
  'stock_movements.create': 'Criar movimentação',
  'stock_movements.export': 'Exportar movimentações',
  'products.read': 'Visualizar produtos',
  'products.create': 'Criar produto',
  'products.update': 'Atualizar produto',
  'products.delete': 'Remover produto',
  'reports.read': 'Visualizar relatórios',
  'reports.generate': 'Gerar relatório',
  'reports.export': 'Exportar relatório',
  'integrations.manage': 'Gerenciar integrações',
  'integrations.create': 'Criar integração',
  'integrations.update': 'Atualizar integração',
  'integrations.delete': 'Remover integração',
  'integrations.test': 'Testar integração',
  'ai.configure': 'Configurar IA',
  'ai.test': 'Testar IA',
  'automations.create': 'Criar automação',
  'automations.update': 'Atualizar automação',
  'automations.toggle': 'Ativar/desativar automação',
  'auth.change_password': 'Alterar senha',
  'auth.revoke_session': 'Encerrar sessão',
  'tenant.manage': 'Gerenciar tenant',
};

function extractPermissionsFromRegistry(): string[] {
  const registryPath = 'src/components/portal/ModuleRegistry.ts';
  const content = fs.readFileSync(registryPath, 'utf8');
  const permissions = new Set<string>();
  const regex = /requiredPermissions:\s*\[([^\]]*)\]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const perms = match[1]
      .split(',')
      .map((p) => p.trim().replace(/['"]/g, ''))
      .filter(Boolean);
    perms.forEach((p) => permissions.add(p));
  }
  const actionRegex = /permission:\s*['"]([^'"]+)['"]/g;
  while ((match = actionRegex.exec(content)) !== null) {
    permissions.add(match[1]);
  }
  return Array.from(permissions).sort();
}

async function reconcile() {
  console.log('[PERMISSION-SYNC] Starting...\n');

  const registryPermissions = extractPermissionsFromRegistry();
  console.log(
    `[PERMISSION-SYNC] Found ${registryPermissions.length} permissions in ModuleRegistry`,
  );

  const { data: existingPermissions, error: fetchError } = await supabase
    .from('permissions')
    .select('id, resource, action, description');

  if (fetchError) {
    console.error('❌ Failed to fetch permissions:', fetchError.message);
    process.exit(1);
  }

  const existingMap = new Map(
    (existingPermissions || []).map((p) => [`${p.resource}.${p.action}`, p]),
  );

  let created = 0;
  const updated = 0;
  let unchanged = 0;

  for (const permName of registryPermissions) {
    const lastDot = permName.lastIndexOf('.');
    const resource = lastDot >= 0 ? permName.slice(0, lastDot) : permName;
    const action = lastDot >= 0 ? permName.slice(lastDot + 1) : 'unknown';
    const description = PERMISSION_DESCRIPTIONS[permName] || permName;

    if (existingMap.has(permName)) {
      existingMap.delete(permName);
      unchanged++;
      continue;
    }

    const { error: insertError } = await supabase.from('permissions').insert({
      resource,
      action,
      description,
    });

    if (insertError) {
      console.error(
        `❌ Failed to create permission ${permName}:`,
        insertError.message,
      );
    } else {
      created++;
      console.log(`  ✅ Created: ${permName}`);
    }
  }

  console.log(`\n[PERMISSION-SYNC] Summary:`);
  console.log(`  Created: ${created}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Unchanged: ${unchanged}`);
  console.log(`[PERMISSION-SYNC] Completed`);
}

reconcile().catch((err) => {
  console.error('❌ Permission sync failed:', err.message || err);
  process.exit(1);
});
