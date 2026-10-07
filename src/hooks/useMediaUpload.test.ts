import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaUpload } from '@/hooks/useMediaUpload';

const mockSupabaseClient = {
  functions: {
    invoke: vi.fn(),
  },
};

vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: () => mockSupabaseClient,
}));

const defaultProps = {
  entityType: 'company' as const,
  entityId: '123e4567-e89b-12d3-a456-426614174000',
  purpose: 'logo' as const,
  onUploadComplete: vi.fn(),
  onError: vi.fn(),
  onDelete: vi.fn(),
};

function createFile(name: string, type: string, size: number): File {
  const file = new File(['dummy content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

describe('useMediaUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('uploadFile', () => {
    it('rejects invalid MIME type', async () => {
      const { result } = renderHook(() => useMediaUpload(defaultProps));
      const file = createFile('test.svg', 'image/svg+xml', 1000);

      await act(async () => {
        await result.current.uploadFile(file);
      });

      expect(result.current.errors[file.name]).toBe('Formato não suportado. Use PNG, JPG ou WebP.');
      expect(mockSupabaseClient.functions.invoke).not.toHaveBeenCalled();
    });

    it('rejects file too large', async () => {
      const { result } = renderHook(() => useMediaUpload({ ...defaultProps, maxSizeMB: 1 }));
      const file = createFile('large.png', 'image/png', 2 * 1024 * 1024);

      await act(async () => {
        await result.current.uploadFile(file);
      });

      expect(result.current.errors[file.name]).toBe('Arquivo muito grande. Máximo 1 MB.');
      expect(mockSupabaseClient.functions.invoke).not.toHaveBeenCalled();
    });

    it('accepts valid PNG', async () => {
      const { result } = renderHook(() => useMediaUpload(defaultProps));
      const file = createFile('valid.png', 'image/png', 1000);

      mockSupabaseClient.functions.invoke.mockResolvedValue({
        data: { success: true, asset: { id: 'asset-1', file_url: 'https://example.com/asset-1.webp' } },
        error: null,
      });

      await act(async () => {
        await result.current.uploadFile(file);
      });

      expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledWith(
        'media-upload',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        }),
      );
      expect(result.current.errors[file.name]).toBeUndefined();
      expect(defaultProps.onUploadComplete).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'asset-1' }),
      );
    });

    it('accepts valid JPEG', async () => {
      const { result } = renderHook(() => useMediaUpload(defaultProps));
      const file = createFile('valid.jpg', 'image/jpeg', 1000);

      mockSupabaseClient.functions.invoke.mockResolvedValue({
        data: { success: true, asset: { id: 'asset-2', file_url: 'https://example.com/asset-2.webp' } },
        error: null,
      });

      await act(async () => {
        await result.current.uploadFile(file);
      });

      expect(result.current.errors[file.name]).toBeUndefined();
    });

    it('accepts valid WebP', async () => {
      const { result } = renderHook(() => useMediaUpload(defaultProps));
      const file = createFile('valid.webp', 'image/webp', 1000);

      mockSupabaseClient.functions.invoke.mockResolvedValue({
        data: { success: true, asset: { id: 'asset-3', file_url: 'https://example.com/asset-3.webp' } },
        error: null,
      });

      await act(async () => {
        await result.current.uploadFile(file);
      });

      expect(result.current.errors[file.name]).toBeUndefined();
    });

    it('handles Edge Function error response', async () => {
      const { result } = renderHook(() => useMediaUpload(defaultProps));
      const file = createFile('test.png', 'image/png', 1000);

      mockSupabaseClient.functions.invoke.mockResolvedValue({
        data: { success: false, error: 'PERMISSION_DENIED', code: 'PERMISSION_DENIED' },
        error: null,
      });

      await act(async () => {
        await result.current.uploadFile(file);
      });

      expect(result.current.errors[file.name]).toBe('PERMISSION_DENIED');
      expect(defaultProps.onError).toHaveBeenCalled();
    });

    it('handles network error', async () => {
      const { result } = renderHook(() => useMediaUpload(defaultProps));
      const file = createFile('test.png', 'image/png', 1000);

      mockSupabaseClient.functions.invoke.mockRejectedValue(new Error('Network error'));

      await act(async () => {
        await result.current.uploadFile(file);
      });

      expect(result.current.errors[file.name]).toBe('Network error');
      expect(defaultProps.onError).toHaveBeenCalled();
    });

    it('tracks uploading state', async () => {
      const { result } = renderHook(() => useMediaUpload(defaultProps));
      const file = createFile('test.png', 'image/png', 1000);

      let resolveInvoke: (value: unknown) => void;
      const invokePromise = new Promise((resolve) => {
        resolveInvoke = resolve;
      });
      mockSupabaseClient.functions.invoke.mockReturnValue(invokePromise);

      let uploadPromise: Promise<void>;
      act(() => {
        uploadPromise = result.current.uploadFile(file);
      });

      expect(result.current.uploading).toBe(true);
      expect(result.current.progress[file.name]).toBe(0);

      resolveInvoke!({ data: { success: true, asset: { id: 'asset-1' } }, error: null });
      await act(async () => {
        await uploadPromise;
      });

      expect(result.current.uploading).toBe(false);
      expect(result.current.progress[file.name]).toBeUndefined();
    });
  });

  describe('deleteAsset', () => {
    it('invokes media-admin with archive action', async () => {
      const { result } = renderHook(() => useMediaUpload(defaultProps));

      mockSupabaseClient.functions.invoke.mockResolvedValue({
        data: { success: true, archived: true },
        error: null,
      });

      await act(async () => {
        await result.current.deleteAsset('asset-1');
      });

      expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledWith(
        'media-admin',
        expect.objectContaining({
          method: 'POST',
          body: expect.objectContaining({
            action: 'archive',
            media_id: 'asset-1',
            entity_type: 'company',
            entity_id: defaultProps.entityId,
          }),
        }),
      );
      expect(defaultProps.onDelete).toHaveBeenCalledWith('asset-1');
    });

    it('propagates media-admin error', async () => {
      const { result } = renderHook(() => useMediaUpload(defaultProps));

      mockSupabaseClient.functions.invoke.mockResolvedValue({
        data: { success: false, error: 'MEDIA_NOT_FOUND' },
        error: null,
      });

      await act(async () => {
        try {
          await result.current.deleteAsset('asset-1');
        } catch (e) {
          expect(e).toBeInstanceOf(Error);
        }
      });

      expect(defaultProps.onDelete).not.toHaveBeenCalled();
    });
  });

  describe('setPrimaryAsset', () => {
    it('invokes media-admin with set_primary action', async () => {
      const { result } = renderHook(() => useMediaUpload(defaultProps));

      mockSupabaseClient.functions.invoke.mockResolvedValue({
        data: { success: true, is_primary: true },
        error: null,
      });

      await act(async () => {
        await result.current.setPrimaryAsset('asset-1');
      });

      expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledWith(
        'media-admin',
        expect.objectContaining({
          method: 'POST',
          body: expect.objectContaining({
            action: 'set_primary',
            media_id: 'asset-1',
            entity_type: 'company',
            entity_id: defaultProps.entityId,
          }),
        }),
      );
    });
  });

  describe('reorderAssets', () => {
    it('invokes media-admin with reorder action', async () => {
      const { result } = renderHook(() => useMediaUpload(defaultProps));

      mockSupabaseClient.functions.invoke.mockResolvedValue({
        data: { success: true, sort_order: 5 },
        error: null,
      });

      await act(async () => {
        await result.current.reorderAssets('asset-1', 5);
      });

      expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledWith(
        'media-admin',
        expect.objectContaining({
          method: 'POST',
          body: expect.objectContaining({
            action: 'reorder',
            media_id: 'asset-1',
            entity_type: 'company',
            entity_id: defaultProps.entityId,
            sort_order: 5,
          }),
        }),
      );
    });

    it('rejects negative sort_order', async () => {
      const { result } = renderHook(() => useMediaUpload(defaultProps));

      mockSupabaseClient.functions.invoke.mockResolvedValue({
        data: { success: false, error: 'INVALID_SORT_ORDER' },
        error: null,
      });

      await act(async () => {
        try {
          await result.current.reorderAssets('asset-1', -1);
        } catch (e) {
          expect(e).toBeInstanceOf(Error);
        }
      });
    });
  });

  describe('entity type variations', () => {
    const entityTypes = ['company', 'service', 'partner', 'supplier'] as const;

    entityTypes.forEach((entityType) => {
      it(`works with entityType=${entityType}`, async () => {
        const { result } = renderHook(() =>
          useMediaUpload({ ...defaultProps, entityType }),
        );
        const file = createFile('test.png', 'image/png', 1000);

        mockSupabaseClient.functions.invoke.mockResolvedValue({
          data: { success: true, asset: { id: 'asset-1' } },
          error: null,
        });

        await act(async () => {
          await result.current.uploadFile(file);
        });

        const invokeCall = mockSupabaseClient.functions.invoke.mock.calls[0];
        const formData = invokeCall[1].body as FormData;
        expect(formData.get('entity_type')).toBe(entityType);
      });
    });
  });

  describe('purpose variations', () => {
    const purposes = ['logo', 'hero', 'card', 'gallery'] as const;

    purposes.forEach((purpose) => {
      it(`works with purpose=${purpose}`, async () => {
        const { result } = renderHook(() =>
          useMediaUpload({ ...defaultProps, purpose }),
        );
        const file = createFile('test.png', 'image/png', 1000);

        mockSupabaseClient.functions.invoke.mockResolvedValue({
          data: { success: true, asset: { id: 'asset-1' } },
          error: null,
        });

        await act(async () => {
          await result.current.uploadFile(file);
        });

        const invokeCall = mockSupabaseClient.functions.invoke.mock.calls[0];
        const formData = invokeCall[1].body as FormData;
        expect(formData.get('purpose')).toBe(purpose);
      });
    });
  });
});