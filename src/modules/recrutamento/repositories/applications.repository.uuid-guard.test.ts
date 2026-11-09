import { beforeEach, describe, expect, it, vi } from 'vitest';

const fromMock = vi.fn();
vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: () => ({ from: fromMock }),
}));

import { applicationsRepository } from './applications.repository';

describe('applicationsRepository UUID guards (no eq.%3Aid)', () => {
  beforeEach(() => {
    fromMock.mockReset();
  });

  it('list returns empty without querying when job_id is ":id"', async () => {
    const result = await applicationsRepository.list({ job_id: ':id' });
    expect(result.error).toBeNull();
    expect(result.data).toEqual([]);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it('getById returns null without querying when id is invalid', async () => {
    const result = await applicationsRepository.getById('not-a-uuid');
    expect(result.data).toBeNull();
    expect(fromMock).not.toHaveBeenCalled();
  });

  it('getWithDetails returns null without querying when id is ":id"', async () => {
    const result = await applicationsRepository.getWithDetails(':id');
    expect(result.data).toBeNull();
    expect(fromMock).not.toHaveBeenCalled();
  });
});
