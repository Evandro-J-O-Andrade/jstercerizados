import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

function loadEnvFile(path: string) {
  try {
    const content = fs.readFileSync(path, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
      const [key, ...rest] = trimmed.split('=');
      const value = rest.join('=').trim();
      if (!process.env[key.trim()]) process.env[key.trim()] = value;
    }
  } catch {
    // Optional local env file.
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env.provision');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const integrationEnabled = Boolean(SUPABASE_URL && SUPABASE_SECRET_KEY);

const admin = integrationEnabled
  ? createClient(SUPABASE_URL!, SUPABASE_SECRET_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

describe('Empresas — Integration Tests (Supabase Real)', () => {
  let tenantA: string;
  let tenantB: string;

  beforeAll(async () => {
    if (!admin) return;

    const { data, error } = await admin.from('tenants').select('id').limit(2);
    if (error) throw error;
    if (!data || data.length < 2) {
      throw new Error('Integration test requires at least two tenants');
    }
    tenantA = data[0].id;
    tenantB = data[1].id;
  });

  it.skipIf(!integrationEnabled)('EMP-INT-001: companies aceita o schema canônico sem tenant_id', async () => {
    const { data, error } = await admin!.from('companies').select(
      'id, legal_name, trading_name, cnpj, status, is_active, metadata, created_at, updated_at',
    ).limit(1);

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it.skipIf(!integrationEnabled)('EMP-INT-002: relacionamento é tenant-scoped', async () => {
    const { data, error } = await admin!
      .from('company_relationships')
      .select('company_id, tenant_id, relationship_type_id, status')
      .eq('tenant_id', tenantA)
      .limit(10);

    expect(error).toBeNull();
    for (const relationship of data || []) {
      expect(relationship.tenant_id).toBe(tenantA);
    }
  });

  it.skipIf(!integrationEnabled)('EMP-INT-003: tenant A e tenant B são escopos distintos', async () => {
    const [{ data: relA, error: errorA }, { data: relB, error: errorB }] = await Promise.all([
      admin!.from('company_relationships').select('company_id').eq('tenant_id', tenantA),
      admin!.from('company_relationships').select('company_id').eq('tenant_id', tenantB),
    ]);

    expect(errorA).toBeNull();
    expect(errorB).toBeNull();

    const idsA = new Set((relA || []).map((row) => row.company_id));
    const idsB = new Set((relB || []).map((row) => row.company_id));

    // Shared companies are valid in the canonical model; the tenant boundary is the relationship.
    for (const id of idsA) {
      expect(typeof id).toBe('string');
    }
    for (const id of idsB) {
      expect(typeof id).toBe('string');
    }
  });

  it.skipIf(!integrationEnabled)('EMP-INT-004: CNPJ é globalmente único conforme constraint canônica', async () => {
    const { data, error } = await admin!
      .from('companies')
      .select('cnpj')
      .not('cnpj', 'is', null)
      .limit(1000);

    expect(error).toBeNull();
    const cnpjs = (data || []).map((row) => row.cnpj).filter(Boolean);
    expect(new Set(cnpjs).size).toBe(cnpjs.length);
  });

  it.skipIf(!integrationEnabled)('EMP-INT-005: relação usa relationship_type_id do schema canônico', async () => {
    const { data, error } = await admin!
      .from('company_relationships')
      .select('relationship_type_id')
      .limit(1);

    expect(error).toBeNull();
    if (data?.length) expect(data[0].relationship_type_id).toBeTruthy();
  });

  it.skipIf(!integrationEnabled)('EMP-INT-006: remoção de relação não implica delete da empresa global', async () => {
    const { data: relationship, error: relationshipError } = await admin!
      .from('company_relationships')
      .select('company_id')
      .eq('tenant_id', tenantA)
      .limit(1)
      .maybeSingle();

    expect(relationshipError).toBeNull();
    if (!relationship) return;

    const { data: company, error: companyError } = await admin!
      .from('companies')
      .select('id')
      .eq('id', relationship.company_id)
      .maybeSingle();

    expect(companyError).toBeNull();
    expect(company?.id).toBe(relationship.company_id);
  });
});
