import { describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { AvaTutorialPage } from '../pages/AvaTutorialPage';
import { AvaReactContext, AVA_CONTEXT_EMPTY_VALUE } from '../context/AvaContext';
import type { Tutorial } from '../types';

const tutorial: Tutorial = {
  id: 't1',
  slug: 'intro-rh',
  module: 'rh',
  title: 'Intro RH',
  summary: 'sum',
  description: 'desc',
  videoUrl: 'https://example.test/v.mp4',
  videoKind: 'short',
  videoDurationSeconds: 30,
  tags: [],
  status: 'published',
  steps: [],
  faq: [],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function Location() {
  const loc = useLocation();
  return <output data-testid="path">{loc.pathname}</output>;
}

describe('AVA rotas/navegação', () => {
  it('AvaTutorialPage: tutorial ausente navega para /dashboard/ava (não /ava)', () => {
    render(
      <AvaReactContext.Provider value={{ ...AVA_CONTEXT_EMPTY_VALUE, getTutorial: () => null }}>
        <MemoryRouter initialEntries={['/dashboard/ava/inexistente']}>
          <Routes>
            <Route path="/dashboard/ava" element={<Location />} />
            <Route path="/dashboard/ava/:slug" element={<AvaTutorialPage />} />
          </Routes>
        </MemoryRouter>
      </AvaReactContext.Provider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /voltar para central/i }));
    expect(screen.getByTestId('path')).toHaveTextContent('/dashboard/ava');
  });

  it('AvaTutorialPage: renderiza tutorial encontrado', () => {
    render(
      <AvaReactContext.Provider value={{ ...AVA_CONTEXT_EMPTY_VALUE, getTutorial: () => tutorial }}>
        <MemoryRouter initialEntries={['/dashboard/ava/intro-rh']}>
          <Routes>
            <Route path="/dashboard/ava/:slug" element={<AvaTutorialPage />} />
          </Routes>
        </MemoryRouter>
      </AvaReactContext.Provider>,
    );

    expect(screen.getByRole('heading', { name: 'Intro RH' })).toBeInTheDocument();
  });
});
