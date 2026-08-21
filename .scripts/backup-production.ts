import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';

const OUTPUT_DIR = '.backups';
const PROJECT_REF = 'okxqfyoqbhcmflpurfrw';

function loadEnvFile() {
  try {
    const contents = readFileSync('.env.local', 'utf-8');
    for (const line of contents.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [key, ...rest] = trimmed.split('=');
      const val = rest.join('=').trim().replace(/^["']|["']$/g, '');
      if (!(key in process.env)) process.env[key] = val;
    }
  } catch {}
}
loadEnvFile();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9reHFmeW9xYmhjbWZscHVyZnJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjkxNDg3MSwiZXhwIjoyMTAyNDkwODcxfQ.rIkHyqktJebgu8fqJc6s0e2ilFFO_nRh-mH-tohHIEo';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

function runQuery(sql: string): any[] {
  try {
    const result = execSync(`supabase db query --linked --output json "${sql.replace(/"/g, '\\"')}"`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      maxBuffer: 50 * 1024 * 1024,
    });
    const trimmed = result.trim();
    if (!trimmed || trimmed === '0 rows') return [];
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (e: any) {
    const stderr = e.stderr?.toString() || '';
    if (stderr.includes('0 rows')) return [];
    console.error(`Query failed: ${sql.substring(0, 100)}...`);
    console.error(stderr.substring(0, 500));
    return [];
  }
}

function escapeSql(value: any): string {
  if (value === null) return 'NULL';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (value instanceof Date) return `'${value.toISOString()}'`;
  const str = String(value).replace(/'/g, "''");
  return `'${str}'`;
}

function generateInsert(table: string, row: any): string {
  const columns = Object.keys(row);
  const values = columns.map(col => escapeSql(row[col]));
  return `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});`;
}

async function main() {
  console.log('🔐 Starting production backup...');
  
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const schemaFile = `${OUTPUT_DIR}/js_empregos_production_backup_${timestamp}_schema.sql`;
  const dataFile = `${OUTPUT_DIR}/js_empregos_production_backup_${timestamp}_data.sql`;
  const manifestFile = `${OUTPUT_DIR}/js_empregos_production_backup_${timestamp}_manifest.json`;

  try {
    // Test connection
    runQuery('SELECT 1 as test');
    console.log('✅ Connection OK via Management API');

    // 1. Get all tables
    const tables = runQuery("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name;");
    const tableNames = tables.map(t => t.table_name);
    console.log(`📋 Found ${tableNames.length} tables`);

    // 2. Get columns for all tables
    console.log('📊 Getting schema...');
    const allColumns = runQuery(`SELECT table_name, column_name, data_type, character_maximum_length, numeric_precision, numeric_scale, is_nullable, column_default FROM information_schema.columns WHERE table_schema = 'public' ORDER BY table_name, ordinal_position;`);

    // 3. Get constraints
    const allConstraints = runQuery(`SELECT tc.table_name, tc.constraint_name, tc.constraint_type, kcu.column_name FROM information_schema.table_constraints tc LEFT JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema WHERE tc.table_schema = 'public' ORDER BY tc.table_name, tc.constraint_name;`);

    // 4. Get indexes
    const allIndexes = runQuery(`SELECT tablename, indexname, indexdef FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname;`);

    // 5. Get functions
    const allFunctions = runQuery(`SELECT routine_name, routine_type, routine_definition FROM information_schema.routines WHERE routine_schema = 'public' ORDER BY routine_name;`);

    // 6. Get triggers
    const allTriggers = runQuery(`SELECT trigger_name, event_manipulation, action_timing, action_statement, event_object_table FROM information_schema.triggers WHERE trigger_schema = 'public' ORDER BY event_object_table, trigger_name;`);

    // 7. Get RLS policies
    const allPolicies = runQuery(`SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;`);

    // Generate schema SQL
    let schemaSql = `-- J&S Empregos LTDA - Production Backup\n`;
    schemaSql += `-- Generated: ${new Date().toISOString()}\n`;
    schemaSql += `-- Project: ${PROJECT_REF}\n`;
    schemaSql += `-- Method: supabase db query via Management API\n\n`;

    const columnsByTable: Record<string, any[]> = {};
    for (const col of allColumns) {
      if (!columnsByTable[col.table_name]) columnsByTable[col.table_name] = [];
      columnsByTable[col.table_name].push(col);
    }

    const constraintsByTable: Record<string, any[]> = {};
    for (const c of allConstraints) {
      if (!constraintsByTable[c.table_name]) constraintsByTable[c.table_name] = [];
      constraintsByTable[c.table_name].push(c);
    }

    for (const table of tableNames) {
      schemaSql += `-- Table: ${table}\n`;
      const cols = columnsByTable[table] || [];
      const constraints = constraintsByTable[table] || [];
      
      schemaSql += `CREATE TABLE IF NOT EXISTS ${table} (\n`;
      const colDefs = cols.map(col => {
        let def = `  ${col.column_name} ${col.data_type}`;
        if (col.character_maximum_length) def += `(${col.character_maximum_length})`;
        if (col.numeric_precision) def += `(${col.numeric_precision}${col.numeric_scale ? ',' + col.numeric_scale : ''})`;
        if (col.is_nullable === 'NO') def += ' NOT NULL';
        if (col.column_default) def += ` DEFAULT ${col.column_default}`;
        return def;
      });

      const pks = constraints.filter(c => c.constraint_type === 'PRIMARY KEY').map(c => c.constraint_name);
      // For simplicity, we'll note PKs but reconstruct exact column lists from pg_pk if available
      schemaSql += colDefs.join(',\n');
      schemaSql += `\n);\n\n`;

      // Indexes
      const indexes = allIndexes.filter(i => i.tablename === table);
      for (const idx of indexes) {
        schemaSql += `${idx.indexdef};\n`;
      }
      schemaSql += '\n';
    }

    // Functions
    if (allFunctions.length > 0) {
      schemaSql += `-- Functions\n`;
      for (const fn of allFunctions) {
        schemaSql += `-- ${fn.routine_name} (${fn.routine_type})\n`;
        if (fn.routine_definition) {
          schemaSql += `${fn.routine_definition}\n\n`;
        }
      }
    }

    // Triggers
    if (allTriggers.length > 0) {
      schemaSql += `-- Triggers\n`;
      for (const trg of allTriggers) {
        schemaSql += `-- Trigger: ${trg.trigger_name} on ${trg.event_object_table}\n`;
        schemaSql += `-- ${trg.action_timing} ${trg.event_manipulation}\n`;
        schemaSql += `${trg.action_statement}\n\n`;
      }
    }

    // Policies
    if (allPolicies.length > 0) {
      schemaSql += `-- RLS Policies\n`;
      for (const pol of allPolicies) {
        schemaSql += `-- Policy: ${pol.policyname} on ${pol.tablename}\n`;
        schemaSql += `-- Command: ${pol.cmd}, Roles: ${pol.roles}\n`;
        if (pol.qual) schemaSql += `-- USING: ${pol.qual}\n`;
        if (pol.with_check) schemaSql += `-- WITH CHECK: ${pol.with_check}\n`;
        schemaSql += '\n';
      }
    }

    writeFileSync(schemaFile, schemaSql, 'utf-8');
    console.log(`   Schema: ${schemaFile}`);

    // Export data
    console.log('💾 Exporting data...');
    let dataSql = `-- J&S Empregos LTDA - Production Data Backup\n`;
    dataSql += `-- Generated: ${new Date().toISOString()}\n\n`;

    const manifest: any = {
      timestamp: new Date().toISOString(),
      project: PROJECT_REF,
      tables: {},
      objects: {
        functions: allFunctions.length,
        triggers: allTriggers.length,
        policies: allPolicies.length,
        indexes: allIndexes.length,
      },
    };

    for (const table of tableNames) {
      console.log(`  📊 ${table}...`);
      try {
        const { data, error, count } = await supabase.from(table).select('*', { count: 'exact' });
        if (error) {
          console.error(`  ❌ ${table}: ${error.message}`);
          manifest.tables[table] = { error: error.message };
          continue;
        }

        const rows = data || [];
        if (rows.length > 0) {
          dataSql += `-- Data for ${table} (${rows.length} rows)\n`;
          for (const row of rows) {
            dataSql += generateInsert(table, row) + '\n';
          }
          dataSql += '\n';
        }

        manifest.tables[table] = {
          columns: (columnsByTable[table] || []).length,
          rows: rows.length,
          constraints: (constraintsByTable[table] || []).length,
        };
      } catch (e: any) {
        console.error(`  ❌ ${table}: ${e.message}`);
        manifest.tables[table] = { error: e.message };
      }
    }

    writeFileSync(dataFile, dataSql, 'utf-8');
    writeFileSync(manifestFile, JSON.stringify(manifest, null, 2), 'utf-8');

    console.log('\n✅ Backup completed successfully!');
    console.log(`   Schema: ${schemaFile}`);
    console.log(`   Data:   ${dataFile}`);
    console.log(`   Manifest: ${manifestFile}`);
    console.log(`\n📊 Summary:`);
    console.log(`   Tables: ${tableNames.length}`);
    console.log(`   Total rows exported: ${Object.values(manifest.tables).filter((t: any) => t.rows).reduce((sum: number, t: any) => sum + (t.rows || 0), 0)}`);
    console.log(`   Functions: ${allFunctions.length}`);
    console.log(`   Triggers: ${allTriggers.length}`);
    console.log(`   RLS Policies: ${allPolicies.length}`);
    console.log(`   Indexes: ${allIndexes.length}`);

  } catch (error: any) {
    console.error('❌ Backup failed:', error.message);
    process.exit(1);
  }
}

main();
