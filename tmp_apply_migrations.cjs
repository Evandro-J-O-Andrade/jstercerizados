const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  host: 'db.okxqfyoqbhcmflpurfrw.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '@An2907081831',
  ssl: { rejectUnauthorized: false }
});

const sqlDir = path.join(process.cwd(), 'supabase', 'specs', 'sql');

// Corrected execution order based on dependency analysis
// 03b_crm_commercial.sql moved after 06_products.sql
// 04b_service_orders.sql moved after 34_crm_services.sql
// 45b_scheduling_integrations.sql after 45_indexes.sql
const migrationOrder = [
  '00_extensions.sql',
  '01_core.sql',
  '02_rbac.sql',
  '03_crm.sql',
  '04_rh_recruitment.sql',
  '05_services_contracts.sql',
  '06_products.sql',
  '06_suppliers_purchasing.sql',
  '07_inventory_custody.sql',
  '09_chat.sql',
  '10_notifications_events.sql',
  '11_audit_security.sql',
  '12_custody.sql',
  '14_tasks.sql',
  '15_support.sql',
  '18_storage_documents.sql',
  '20_lgpd.sql',
  '21_functions_triggers.sql',
  '14b_support_tickets.sql',
  '22_rls.sql',
  '23_indexes.sql',
  '25_validation.sql',
  '26_error_codes.sql',
  '27_finance.sql',
  '28_fiscal.sql',
  '29_pos.sql',
  '30_recruitment.sql',
  '31_automation.sql',
  '32_seed.sql',
  '33_employees.sql',
  '34_crm_services.sql',
  '35_recruitment_talent_pool.sql',
  '36_inventory.sql',
  '37_purchasing.sql',
  '39_fiscal.sql',
  '40_tasks_support.sql',
  '41_chat_security.sql',
  '42_automation.sql',
  '43_notifications.sql',
  '44_reports_views.sql',
  '03b_crm_commercial.sql',
  '04b_service_orders.sql',
  '45b_scheduling_integrations.sql',
  '46_operations_field_service.sql',
  '45_rls_remaining.sql',
  '45_indexes.sql'
];

async function applyMigrations() {
  await client.connect();
  
  // Clean remote state before applying migrations
  console.log('=== V2.1 REBUILD — DROPPING REMOTE STATE ===\n');
  
  try {
    const triggersResult = await client.query(`
      SELECT tgname, tgrelid::regclass::text as table_name 
      FROM pg_trigger 
      WHERE tgisinternal = false
      AND tgrelid::regnamespace::text = 'public'
    `);
    
    for (const trigger of triggersResult.rows) {
      try {
        await client.query(`DROP TRIGGER IF EXISTS "${trigger.tgname}" ON "${trigger.table_name}" CASCADE;`);
        console.log(`  Dropped trigger: ${trigger.tgname}`);
      } catch (e) {
        console.log(`  Error dropping trigger ${trigger.tgname}: ${e.message}`);
      }
    }
    
    const funcsResult = await client.query(`
      SELECT p.proname, pg_get_function_identity_arguments(p.oid) as args
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
      AND p.proname NOT LIKE 'uuid-%'
      AND p.proname NOT LIKE 'pg_%'
    `);
    
    for (const func of funcsResult.rows) {
      const args = func.args ? `(${func.args})` : '()';
      try {
        await client.query(`DROP FUNCTION IF EXISTS public."${func.proname}"${args} CASCADE;`);
        console.log(`  Dropped function: ${func.proname}${args}`);
      } catch (e) {
        console.log(`  Error dropping function ${func.proname}${args}: ${e.message}`);
      }
    }
    
    const tablesResult = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    for (const table of tablesResult.rows) {
      try {
        await client.query(`DROP TABLE IF EXISTS public."${table.table_name}" CASCADE;`);
        console.log(`  Dropped table: ${table.table_name}`);
      } catch (e) {
        console.log(`  Error dropping table ${table.table_name}: ${e.message}`);
      }
    }
    
    const enumsResult = await client.query(`
      SELECT typname FROM pg_type 
      WHERE typtype = 'e' 
      AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    `);
    
    for (const enumItem of enumsResult.rows) {
      try {
        await client.query(`DROP TYPE IF EXISTS public."${enumItem.typname}" CASCADE;`);
        console.log(`  Dropped enum: ${enumItem.typname}`);
      } catch (e) {
        console.log(`  Error dropping enum ${enumItem.typname}: ${e.message}`);
      }
    }
    
    console.log('\n✓ Remote state cleaned\n');
    
  } catch (e) {
    console.error('Error during cleanup:', e.message);
  }
  
  const results = [];
  
  for (const file of migrationOrder) {
    const filePath = path.join(sqlDir, file);
    
    // Skip if file doesn't exist
    if (!fs.existsSync(filePath)) {
      console.log(`\nSkipping: ${file} (not found)`);
      results.push({ file, result: 'SKIPPED', error: null });
      continue;
    }
    
    const sql = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\nApplying: ${file}`);
    
    // Log search_path before applying
    const pathResult = await client.query("SHOW search_path");
    console.log(`  search_path: ${pathResult.rows[0].search_path}`);
    
    // Check if uuid_generate_v4 exists before applying 14b
    if (file === '14b_support_tickets.sql') {
      const uuidFunc = await client.query("SELECT proname FROM pg_proc WHERE proname = 'uuid_generate_v4'");
      console.log(`  uuid_generate_v4 exists: ${uuidFunc.rows.length > 0}`);
      if (uuidFunc.rows.length > 0) {
        const schemaResult = await client.query(`
          SELECT pg_namespace.nspname as schema 
          FROM pg_proc 
          JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid 
          WHERE proname = 'uuid_generate_v4'
        `);
        console.log(`  uuid_generate_v4 schema: ${schemaResult.rows[0].schema}`);
      }
    }
    
    try {
      await client.query(sql);
      console.log(`  ✓ Success`);
      results.push({ file, result: 'SUCCESS', error: null });
    } catch (e) {
      console.log(`  ✗ Failed: ${e.message}`);
      results.push({ file, result: 'FAILED', error: e.message });
      
      // Stop on first failure as per instructions
      console.log('\n⚠ Migration failed. Stopping as instructed.');
      break;
    }
  }
  
  await client.end();
  
  // Summary
  console.log('\n=== MIGRATION SUMMARY ===');
  const successful = results.filter(r => r.result === 'SUCCESS').length;
  const failed = results.filter(r => r.result === 'FAILED').length;
  const skipped = results.filter(r => r.result === 'SKIPPED').length;
  const total = results.length;
  
  console.log(`Total: ${total}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
  console.log(`Skipped: ${skipped}`);
  
  if (failed > 0) {
    console.log('\nFailed migrations:');
    results.filter(r => r.result === 'FAILED').forEach(r => {
      console.log(`  ${r.file}: ${r.error}`);
    });
  }
  
  return results;
}

applyMigrations().catch(e => {
  console.error('Fatal error:', e.message);
  process.exit(1);
});
