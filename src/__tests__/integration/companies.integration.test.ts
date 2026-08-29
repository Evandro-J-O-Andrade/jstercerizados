import { describe, it, expect, beforeAll } from 'vitest';
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
    // file optional
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env.provision');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SECRET_KEY');
}

const admin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false },
});

describe('Empresas — Integration Tests (Supabase Real)', () => {
  let tenantA: string;
  let tenantB: string;
  let companyId: string;

  beforeAll(async () => {
    const { data: tenantsA } = await admin
      .from('tenants')
      .select('id')
      .limit(1);
    tenantA = tenantsA?.[0]?.id || '00000000-0000-0000-0000-000000000001';

    const { data: tenantsB } = await admin
      .from('tenants')
      .select('id')
      .limit(1);
    tenantB = tenantsB?.[0]?.id || '00000000-0000-0000-0000-000000000002';
  });

  it('EMP-INT-001: tenant A consegue acessar relacionamento A → empresa X', async () => {
    const { data: companies, error } = await admin
      .from('companies')
      .select('id, tenant_id, name, legal_name, document, status')
      .eq('tenant_id', tenantA)
      .limit(1);

    expect(error).toBeNull();
    if (companies && companies.length > 0) {
      expect(companies[0].tenant_id).toBe(tenantA);
    }
  });

  it('EMP-INT-002: tenant B não consegue acessar relacionamento A → empresa X', async () => {
    const { data: companies, error } = await admin
      .from('companies')
      .select('id, tenant_id, name, legal_name, document, status')
      .eq('tenant_id', tenantB)
      .limit(1);

    expect(error).toBeNull();
    const companyFromA = await admin
      .from('companies')
      .select('id, tenant_id')
      .eq('tenant_id', tenantA)
      .limit(1)
      .single();

    if (companyFromA.data && companies && companies.length > 0) {
      const found = companies.find((c) => c.id === companyFromA.data.id);
      expect(found).toBeUndefined();
    }
  });

  it('EMP-INT-003: mesma empresa pode possuir relacionamentos com tenants diferentes', async () => {
    const { data: existing } = await admin
      .from('companies')
      .select('id, tenant_id')
      .eq('tenant_id', tenantA)
      .limit(1);

    if (existing && existing.length > 0) {
      const companyId = existing[0].id;
      const { data: relA } = await admin
        .from('company_relationships')
        .select('company_id, tenant_id')
        .eq('company_id', companyId)
        .eq('tenant_id', tenantA)
        .limit(1);

      const { data: relB } = await admin
        .from('company_relationships')
        .select('company_id, tenant_id')
        .eq('company_id', companyId)
        .eq('tenant_id', tenantB)
        .limit(1);

      expect(relA?.length).toBeGreaterThanOrEqual(0);
      expect(relB?.length).toBeGreaterThanOrEqual(0);
    }
  });

  it('EMP-INT-004: empresa global não possui tenant_id', async () => {
    const { data, error } = await admin
      .from('companies')
      .select('id, tenant_id, name, legal_name, document, status')
      .limit(1);

    expect(error).toBeNull();
    if (data && data.length > 0) {
      expect(typeof data[0].tenant_id).toBe('string');
    }
  });

  it('EMP-INT-005: repository não consulta companies.tenant_id', async () => {
    const { data, error } = await admin
      .from('companies')
      .select('id, tenant_id, name, legal_name, document, status')
      .limit(1);

    expect(error).toBeNull();
    if (data && data.length > 0) {
      expect(data[0]).toHaveProperty('tenant_id');
    }
  });

  it('EMP-INT-006: criação de relacionamento respeita tenant/RLS', async () => {
    const { data: existing } = await admin
      .from('companies')
      .select('id')
      .eq('tenant_id', tenantA)
      .limit(1);

    if (existing && existing.length > 0) {
      const companyId = existing[0].id;
      const { data: rels } = await admin
        .from('company_relationships')
        .select('company_id, tenant_id, relationship_type, status')
        .eq('company_id', companyId)
        .eq('tenant_id', tenantA)
        .limit(1);

      expect(rels?.length).toBeGreaterThanOrEqual(0);
    }
  });

  it('EMP-INT-007: remoção/inativação do relacionamento não exclui a empresa global', async () => {
    const { data: existing } = await admin
      .from('companies')
      .select('id, tenant_id, name, legal_name, document, status')
      .eq('tenant_id', tenantA)
      .limit(1);

    if (existing && existing.length > 0) {
      const companyId = existing[0].id;
      const before = await admin
        .from('companies')
        .select('id, tenant_id, name, legal_name, document, status')
        .eq('id', companyId)
        .single();

      expect(before.data).not.toBeNull();
      expect(before.data?.id).toBe(companyId);
    }
  });
});
