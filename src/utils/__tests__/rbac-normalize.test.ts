import { describe, it, expect } from 'vitest';
import {
  getPermissionKey,
  normalizePermission,
  normalizeResourceAction,
} from '../rbac-normalize';
import type { Permission } from '@/types/auth';

describe('normalizeResourceAction', () => {
  it('deriva chave resource.action quando ambos presentes', () => {
    expect(normalizeResourceAction('contracts', 'read')).toBe(
      'contracts.read',
    );
    expect(normalizeResourceAction('stock_movements', 'create')).toBe(
      'stock_movements.create',
    );
  });

  it('retorna null quando resource está ausente', () => {
    expect(normalizeResourceAction(null, 'read')).toBeNull();
    expect(normalizeResourceAction(undefined, 'read')).toBeNull();
    expect(normalizeResourceAction('', 'read')).toBeNull();
  });

  it('retorna null quando action está ausente', () => {
    expect(normalizeResourceAction('contracts', null)).toBeNull();
    expect(normalizeResourceAction('contracts', undefined)).toBeNull();
    expect(normalizeResourceAction('contracts', '')).toBeNull();
  });

  it('retorna null quando ambos estão ausentes', () => {
    expect(normalizeResourceAction(null, null)).toBeNull();
    expect(normalizeResourceAction('', '')).toBeNull();
  });
});

describe('getPermissionKey', () => {
  it('retorna resource.action para permissão válida', () => {
    const perm: Permission = {
      id: 'c49ddf68-ed63-4cf2-b54d-d2251a815272',
      resource: 'tenants',
      action: 'create',
      description: 'Criar tenant',
      created_at: '2026-08-22T05:35:13.661Z',
    };
    expect(getPermissionKey(perm)).toBe('tenants.create');
  });

  it('retorna string vazia quando resource está vazio', () => {
    const perm: Permission = {
      id: 'x',
      resource: '',
      action: 'read',
      description: null,
      created_at: '2026-08-22T05:35:13.661Z',
    };
    expect(getPermissionKey(perm)).toBe('');
  });

  it('retorna string vazia quando action está vazio', () => {
    const perm: Permission = {
      id: 'x',
      resource: 'tenants',
      action: '',
      description: null,
      created_at: '2026-08-22T05:35:13.661Z',
    };
    expect(getPermissionKey(perm)).toBe('');
  });
});

describe('normalizePermission', () => {
  it('normaliza registro bruto do Supabase (resource/action)', () => {
    const raw = {
      id: 'c49ddf68-ed63-4cf2-b54d-d2251a815272',
      resource: 'tenants',
      action: 'read',
      description: 'Ler tenant',
      created_at: '2026-08-22T05:35:13.661Z',
    };
    const result = normalizePermission(raw);
    expect(result).toEqual({
      id: 'c49ddf68-ed63-4cf2-b54d-d2251a815272',
      resource: 'tenants',
      action: 'read',
      description: 'Ler tenant',
      created_at: '2026-08-22T05:35:13.661Z',
    });
  });

  it('retorna null quando id está ausente', () => {
    const raw = {
      resource: 'tenants',
      action: 'read',
      description: 'Ler tenant',
      created_at: '2026-08-22T05:35:13.661Z',
    };
    expect(normalizePermission(raw)).toBeNull();
  });

  it('retorna null quando resource está ausente', () => {
    const raw = {
      id: 'x',
      action: 'read',
      description: null,
      created_at: '2026-08-22T05:35:13.661Z',
    };
    expect(normalizePermission(raw)).toBeNull();
  });

  it('retorna null quando action está ausente', () => {
    const raw = {
      id: 'x',
      resource: 'tenants',
      description: null,
      created_at: '2026-08-22T05:35:13.661Z',
    };
    expect(normalizePermission(raw)).toBeNull();
  });

  it('trim espaços em branco de resource e action', () => {
    const raw = {
      id: 'x',
      resource: '  tenants  ',
      action: '  read  ',
      description: null,
      created_at: '2026-08-22T05:35:13.661Z',
    };
    const result = normalizePermission(raw);
    expect(result?.resource).toBe('tenants');
    expect(result?.action).toBe('read');
  });

  it('usa data atual quando created_at está ausente', () => {
    const raw = {
      id: 'x',
      resource: 'tenants',
      action: 'read',
      description: null,
    };
    const result = normalizePermission(raw);
    expect(result?.created_at).toBeDefined();
    expect(typeof result?.created_at).toBe('string');
  });
});
