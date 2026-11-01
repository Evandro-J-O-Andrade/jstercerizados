import { beforeEach, describe, expect, it, vi } from 'vitest';

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: () => ({ from: fromMock }),
}));

import { securityEventRepository } from './security.repository';

describe('SecurityEventRepository global reads', () => {
  const event = {
    id: 'event-1',
    event_type: 'login',
    tenant_id: 'tenant-1',
    person_id: 'person-1',
    ip: null,
    user_agent: null,
    metadata: {},
    created_at: '2026-11-01T00:00:00.000Z',
  };
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
  };

  beforeEach(() => {
    fromMock.mockReset();
    query.select.mockReset().mockReturnThis();
    query.eq.mockReset().mockReturnThis();
    query.order.mockReset().mockResolvedValue({ data: [event], error: null });
    fromMock.mockReturnValue(query);
  });

  it('reads all events without applying a tenant fallback filter', async () => {
    await expect(securityEventRepository.findAllGlobal()).resolves.toEqual([
      event,
    ]);

    expect(fromMock).toHaveBeenCalledWith('security_events');
    expect(query.eq).not.toHaveBeenCalled();
    expect(query.order).toHaveBeenCalledWith('created_at', {
      ascending: false,
    });
  });
});
