import { resolveServiceCover, resolveServiceGallery } from './image-resolver';

describe('image-resolver', () => {
  it('slug mapeado com capa e galeria', () => {
    const cover = resolveServiceCover(undefined, { slug: 'limpeza' });
    const gallery = resolveServiceGallery(undefined, { slug: 'limpeza' });
    expect(cover).toBe('/images/servicos/limpeza/limpeza.jpg');
    expect(gallery.length).toBeGreaterThan(0);
    expect(gallery[0]).toBe('/images/servicos/limpeza/limpeza.jpg');
  });

  it('caminho existente com extensões diferentes', () => {
    const cover = resolveServiceCover(undefined, { slug: 'facilities' });
    expect(cover).toContain('.webp');
  });

  it('slug sem mapeamento', () => {
    const cover = resolveServiceCover(undefined, { slug: 'slug-inexistente' });
    // cai para fallback global
    expect(cover).toContain('fallback');
  });

  it('URL de galeria proveniente do banco', () => {
    const gallery = resolveServiceGallery(
      [
        'https://example.com/img.jpg',
        '/images/servicos/limpeza/limpeza.jpg',
        '',
      ],
      { slug: 'limpeza' },
    );
    // quando array válido não vazio, retorna o array filtrado (prioridade 1)
    expect(gallery.length).toBe(2);
    expect(gallery).toContain('/images/servicos/limpeza/limpeza.jpg');
    expect(gallery).toContain('https://example.com/img.jpg');
  });

  it('falha de carregamento e fallback (via resolve)', () => {
    const cover = resolveServiceCover('', { fallbackType: 'servicos' });
    expect(cover).toContain('/images/servicos/fallbacks/servicos.png');
  });

  it('compatibilidade com caminhos explícitos legados', () => {
    const cover = resolveServiceCover('/images/servicos/solucao-rh.jfif');
    expect(cover).toBe('/images/servicos/solucao-rh.jfif');
  });

  it('galeria vazia e ausência de imagens reais', () => {
    const gallery = resolveServiceGallery([], { slug: 'slug-inexistente' });
    expect(gallery).toHaveLength(4);
    expect(gallery[0]).toContain('gallery-01.svg');
  });
});
