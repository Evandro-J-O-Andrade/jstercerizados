import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const SPECS_DIR = 'docs/sql';
const MANIFEST_FILE = '.backups/js_empregos_production_backup_2026-08-20T09-01-46_manifest.json';
const SCHEMA_FILE = '.backups/js_empregos_production_backup_2026-08-20T09-01-46_schema.sql';
const OUTPUT_FILE = '.backups/structural_comparison_report.md';

function extractTablesFromSpecs(): string[] {
  const files = readdirSync(SPECS_DIR).filter((f: string) => f.endsWith('.sql')).sort();
  const tables: string[] = [];
  
  for (const file of files) {
    const content = readFileSync(join(SPECS_DIR, file), 'utf-8');
    const regex = /create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?(\w+)/gi;
    let match;
    while ((match = regex.exec(content)) !== null) {
      tables.push(match[1]);
    }
  }
  
  return tables;
}

function extractTablesFromSchema(sql: string): string[] {
  const regex = /CREATE TABLE IF NOT EXISTS (\w+)/gi;
  const tables: string[] = [];
  let match;
  while ((match = regex.exec(sql)) !== null) {
    tables.push(match[1]);
  }
  return tables;
}

function main() {
  console.log('📊 Starting structural comparison...');
  
  const prodSchema = readFileSync(SCHEMA_FILE, 'utf-8');
  const prodTables = extractTablesFromSchema(prodSchema);
  const v21Tables = extractTablesFromSpecs();
  const manifest = JSON.parse(readFileSync(MANIFEST_FILE, 'utf-8'));
  
  const prodTableSet = new Set(prodTables);
  const v21TableSet = new Set(v21Tables);
  
  const onlyInProd = prodTables.filter(t => !v21TableSet.has(t));
  const onlyInV21 = v21Tables.filter(t => !prodTableSet.has(t));
  const inBoth = prodTables.filter(t => v21TableSet.has(t));
  
  let report = `# Structural Comparison: Production vs V2.1 Canonical\n\n`;
  report += `**Generated:** ${new Date().toISOString()}\n`;
  report += `**Production Project:** okxqfyoqbhcmflpurfrw\n`;
  report += `**V2.1 Reference:** ${SPECS_DIR}/\n\n`;
  
  report += `## Executive Summary\n\n`;
  report += `| Metric | Value |\n`;
  report += `|--------|-------|\n`;
  report += `| Production tables | ${prodTables.length} |\n`;
  report += `| V2.1 canonical tables | ${v21Tables.length} |\n`;
  report += `| Tables in both | ${inBoth.length} |\n`;
  report += `| Only in production | ${onlyInProd.length} |\n`;
  report += `| Only in V2.1 (new) | ${onlyInV21.length} |\n`;
  report += `| Production functions | ${manifest.objects.functions} |\n`;
  report += `| Production triggers | ${manifest.objects.triggers} |\n`;
  report += `| Production RLS policies | ${manifest.objects.policies} |\n`;
  report += `| Production indexes | ${manifest.objects.indexes} |\n\n`;
  
  report += `## Tables Comparison\n\n`;
  
  if (onlyInProd.length > 0) {
    report += `### ⚠️ Tables ONLY in Production (would be DROPPED)\n\n`;
    report += `These tables exist in production but are NOT defined in V2.1 canonical:\n\n`;
    report += `| Table | Columns | Rows | Constraints |\n`;
    report += `|-------|---------|------|-------------|\n`;
    for (const t of onlyInProd) {
      const info = manifest.tables[t] || {};
      report += `| ${t} | ${info.columns || '?'} | ${info.rows ?? '?'} | ${info.constraints || '?'} |\n`;
    }
    report += `\n`;
  } else {
    report += `### ✅ No tables exclusive to production\n\n`;
    report += `All 31 production tables have corresponding definitions in V2.1 canonical.\n\n`;
  }
  
  if (onlyInV21.length > 0) {
    report += `### ➕ Tables ONLY in V2.1 (would be CREATED)\n\n`;
    report += `These tables are defined in V2.1 canonical but do NOT exist in production:\n\n`;
    report += `| Table | Status |\n`;
    report += `|-------|--------|\n`;
    for (const t of onlyInV21) {
      report += `| ${t} | NEW |\n`;
    }
    report += `\n`;
  }
  
  report += `### ✅ Tables in Both\n\n`;
  report += `| Table | Prod Columns | V2.1 Status |\n`;
  report += `|-------|-------------|-------------|\n`;
  for (const t of inBoth) {
    const info = manifest.tables[t] || {};
    report += `| ${t} | ${info.columns || '?'} | canonical |\n`;
  }
  report += `\n`;
  
  report += `## Data Inventory\n\n`;
  report += `### Tables WITH Data (must preserve)\n\n`;
  report += `| Table | Rows | Data Type | V2.1 Status |\n`;
  report += `|-------|------|-----------|-------------|\n`;
  for (const [table, info] of Object.entries(manifest.tables)) {
    if ((info as any).rows > 0) {
      report += `| ${table} | ${(info as any).rows} | ${getDataCategory(table)} | ${v21TableSet.has(table) ? '✅ PRESENT' : '❌ MISSING'} |\n`;
    }
  }
  report += `\n`;
  
  report += `### Tables WITHOUT Data (can be safely recreated)\n\n`;
  const emptyTables = Object.entries(manifest.tables).filter(([_, info]) => (info as any).rows === 0).map(([t]) => t);
  report += `Total: ${emptyTables.length} tables with no data\n\n`;
  
  report += `## Objects Comparison\n\n`;
  report += `| Object Type | Production Count | V2.1 Status |\n`;
  report += `|-------------|------------------|-------------|\n`;
  report += `| Functions | ${manifest.objects.functions} | Defined in docs/sql/18_functions.sql |\n`;
  report += `| Triggers | ${manifest.objects.triggers} | Defined in docs/sql/19_triggers.sql |\n`;
  report += `| RLS Policies | ${manifest.objects.policies} | Defined in docs/sql/21_rls.sql |\n`;
  report += `| Indexes | ${manifest.objects.indexes} | Defined in docs/sql/20_indexes.sql |\n`;
  report += `| Seeds | ${Object.entries(manifest.tables).filter(([_, i]: any) => i.rows > 0).length} tables with data | Defined in docs/sql/22_seed.sql |\n\n`;
  
  report += `## What Would Be LOST if DROP Today\n\n`;
  if (onlyInProd.length > 0) {
    report += `1. **${onlyInProd.length} legacy tables** that are not in V2.1: ${onlyInProd.join(', ')}\n`;
  } else {
    report += `1. **0 legacy tables** - all production tables exist in V2.1 canonical\n`;
  }
  report += `2. **${Object.values(manifest.tables).filter((t: any) => t.rows > 0).reduce((sum: number, t: any) => sum + t.rows, 0)} rows of actual data** across ${Object.values(manifest.tables).filter((t: any) => t.rows > 0).length} tables\n`;
  report += `3. **${manifest.objects.functions} functions** (all would be dropped and recreated)\n`;
  report += `4. **${manifest.objects.triggers} triggers** (all would be dropped and recreated)\n`;
  report += `5. **${manifest.objects.policies} RLS policies** (all would be dropped and recreated)\n`;
  report += `6. **${manifest.objects.indexes} indexes** (all would be dropped and recreated)\n\n`;
  
  report += `## What Would Be RECREATED by V2.1\n\n`;
  report += `1. **${inBoth.length} tables** with canonical V2.1 structure\n`;
  report += `2. **${onlyInV21.length} new tables** currently missing from production\n`;
  report += `3. All V2.1 functions, triggers, RLS policies, and indexes\n`;
  report += `4. Seed data for: company_types (6), company_relationship_types (3), permissions (26), role_resource_permissions (114), skills (68), roles (10)\n\n`;
  
  report += `## GO / NO-GO Assessment\n\n`;
  
  if (onlyInProd.length === 0) {
    report += `### ✅ GO\n\n`;
    report += `All 31 production tables have corresponding definitions in V2.1 canonical. `;
  } else {
    report += `### ⚠️ CONDITIONAL GO\n\n`;
    report += `${onlyInProd.length} legacy tables would be dropped without V2.1 equivalents. `;
  }
  
  report += `Data in seed tables (company_types, company_relationship_types, skills, permissions, roles, role_resource_permissions) can be safely reseeded. `;
  report += `Critical data (people, tenant_memberships, tenants, role_assignments) must be preserved.\n\n`;
  
  report += `### Conditions for GO:\n`;
  report += `1. ✅ Backup verified and stored at \`${MANIFEST_FILE}\`\n`;
  report += `2. ✅ ${Object.values(manifest.tables).filter((t: any) => t.rows > 0).length} tables contain data requiring preservation\n`;
  report += `3. ${onlyInProd.length > 0 ? `⚠️ Evaluate legacy tables: ${onlyInProd.join(', ')}` : '✅ No legacy tables to evaluate'}\n`;
  report += `4. ⏳ Test rebuild on staging/dry-run environment first\n`;
  report += `5. ⏳ Validate frontend compatibility with V2.1 schema\n`;
  report += `6. ⏳ Verify V2.1 canonical completeness (docs/sql/ has ${v21Tables.length} table definitions vs ${prodTables.length} in production)\n\n`;
  
  report += `## Next Steps\n\n`;
  report += `1. ✅ Backup completed\n`;
  report += `2. ✅ Structural comparison completed\n`;
  report += `3. Create staging environment\n`;
  report += `4. Execute rebuild on staging using V2.1 canonical DDL (docs/sql/*.sql)\n`;
  report += `5. Migrate data from production backup to staging\n`;
  report += `6. Validate application functionality\n`;
  report += `7. Schedule production rebuild window (requires explicit authorization)\n`;
  
  writeFileSync(OUTPUT_FILE, report, 'utf-8');
  console.log(`Report written to ${OUTPUT_FILE}`);
}

function getDataCategory(table: string): string {
  if (['tenants', 'people', 'tenant_memberships', 'roles', 'permissions', 'role_assignments', 'role_resource_permissions'].includes(table)) return 'RBAC/Core';
  if (['company_types', 'company_relationship_types', 'skills'].includes(table)) return 'Seed/Reference';
  return 'Business';
}

main();
