import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

const migrationSql = readFileSync(
  join(__dirname, '../../supabase/migrations/20250101_chat.sql'),
  'utf-8',
);

describe('GATE-DATA-04 Stage 2A — Chat Humano schema', () => {
  it('creates chat_rooms table with multi-tenancy and areas', () => {
    expect(migrationSql).toContain('create table public.chat_rooms');
    expect(migrationSql).toContain('tenant_id');
    expect(migrationSql).toContain(
      'references public.tenants(id) on delete cascade',
    );
    expect(migrationSql).toContain(
      "area in ('central','rh','financeiro','comercial','suporte')",
    );
    expect(migrationSql).toContain("status in ('waiting','active','closed')");
    expect(migrationSql).toContain('assigned_to');
    expect(migrationSql).toContain(
      'references auth.users(id) on delete set null',
    );
  });

  it('creates chat_messages table with role check', () => {
    expect(migrationSql).toContain('create table public.chat_messages');
    expect(migrationSql).toContain('tenant_id');
    expect(migrationSql).toContain(
      'references public.tenants(id) on delete cascade',
    );
    expect(migrationSql).toContain('room_id');
    expect(migrationSql).toContain(
      'references public.chat_rooms(id) on delete cascade',
    );
    expect(migrationSql).toContain(
      "role in ('user','assistant','system','agent')",
    );
  });

  it('enables RLS on both tables', () => {
    expect(migrationSql).toContain(
      'alter table public.chat_rooms enable row level security',
    );
    expect(migrationSql).toContain(
      'alter table public.chat_messages enable row level security',
    );
  });

  it('creates RLS policies for chat_rooms', () => {
    expect(migrationSql).toContain(
      'create policy "Chat rooms visible within tenant"',
    );
    expect(migrationSql).toContain(
      'create policy "Chat rooms manageable within tenant"',
    );
    expect(migrationSql).toContain(
      'create policy "Chat rooms updatable within tenant"',
    );
  });

  it('creates RLS policies for chat_messages', () => {
    expect(migrationSql).toContain(
      'create policy "Chat messages visible within tenant"',
    );
    expect(migrationSql).toContain(
      'create policy "Chat messages insertable within tenant"',
    );
  });

  it('creates indexes for chat_rooms', () => {
    expect(migrationSql).toContain(
      'create index idx_chat_rooms_tenant on public.chat_rooms(tenant_id)',
    );
    expect(migrationSql).toContain(
      'create index idx_chat_rooms_visitor on public.chat_rooms(visitor_id)',
    );
    expect(migrationSql).toContain(
      'create index idx_chat_rooms_status on public.chat_rooms(status)',
    );
    expect(migrationSql).toContain(
      'create index idx_chat_rooms_area on public.chat_rooms(area)',
    );
  });

  it('creates indexes for chat_messages', () => {
    expect(migrationSql).toContain(
      'create index idx_chat_messages_tenant on public.chat_messages(tenant_id)',
    );
    expect(migrationSql).toContain(
      'create index idx_chat_messages_room on public.chat_messages(room_id)',
    );
    expect(migrationSql).toContain(
      'create index idx_chat_messages_created on public.chat_messages(created_at)',
    );
  });

  it('does not use DROP or TRUNCATE', () => {
    expect(migrationSql).not.toContain('DROP TABLE');
    expect(migrationSql).not.toContain('TRUNCATE');
    expect(migrationSql).not.toContain('DELETE FROM');
  });

  it('does not alter existing tables', () => {
    expect(migrationSql).not.toContain('alter table public.tenants');
    expect(migrationSql).not.toContain('alter table public.profiles');
    expect(migrationSql).not.toContain('alter table public.jobs');
  });
});
