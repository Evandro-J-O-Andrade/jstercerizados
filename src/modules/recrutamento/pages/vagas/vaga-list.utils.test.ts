import { describe, expect, it } from 'vitest';
import { isJobStatus, jobStatsCards, totalPages } from './vaga-list.utils';

describe('vaga list helpers', () => {
  it('calcula páginas sem produzir página zero', () => {
    expect(totalPages(0, 20)).toBe(1);
    expect(totalPages(21, 20)).toBe(2);
  });

  it('gera indicadores somente a partir das estatísticas recebidas', () => {
    expect(
      jobStatsCards({
        total: 8,
        draft: 2,
        published: 3,
        paused: 1,
        closed: 1,
        filled: 1,
      }),
    ).toEqual([
      { id: 'total', label: 'Total de vagas', value: 8 },
      { id: 'published', label: 'Publicadas', value: 3 },
      { id: 'draft', label: 'Rascunhos', value: 2 },
      { id: 'closed', label: 'Encerradas/preenchidas', value: 2 },
    ]);
  });

  it('rejeita status não pertencente ao contrato de vagas', () => {
    expect(isJobStatus('published')).toBe(true);
    expect(isJobStatus('inventado')).toBe(false);
  });
});
