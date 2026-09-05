import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/components/ui/AccessibilityWidget', () => ({
  AccessibilityWidget: (props: { open: boolean }) => (
    <div data-testid="a11y-widget" data-open={props.open} />
  ),
}));
vi.mock('@/components/ui/ChatWidget', () => ({
  ChatWidget: (props: { isOpen: boolean }) => (
    <div data-testid="chat-widget" data-open={props.isOpen} />
  ),
}));
vi.mock('@/components/ui/HumanChatWidget', () => ({
  HumanChatWidget: (props: { isOpen: boolean }) => (
    <div data-testid="human-widget" data-open={props.isOpen} />
  ),
}));

import { FloatingHelpWidgets } from '@/components/layout/FloatingHelpWidgets';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <FloatingHelpWidgets />
    </MemoryRouter>,
  );
}

describe('FloatingHelpWidgets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza os 3 widgets em rota pública', () => {
    renderAt('/');
    expect(screen.getByTestId('a11y-widget')).toBeInTheDocument();
    expect(screen.getByTestId('chat-widget')).toBeInTheDocument();
    expect(screen.getByTestId('human-widget')).toBeInTheDocument();
  });

  it('renderiza em /vagas (rota pública)', () => {
    renderAt('/vagas');
    expect(screen.getByTestId('a11y-widget')).toBeInTheDocument();
    expect(screen.getByTestId('chat-widget')).toBeInTheDocument();
    expect(screen.getByTestId('human-widget')).toBeInTheDocument();
  });

  it('NÃO renderiza em /candidato', () => {
    renderAt('/candidato');
    expect(screen.queryByTestId('a11y-widget')).not.toBeInTheDocument();
    expect(screen.queryByTestId('chat-widget')).not.toBeInTheDocument();
    expect(screen.queryByTestId('human-widget')).not.toBeInTheDocument();
  });

  it('NÃO renderiza em /candidato/vagas', () => {
    renderAt('/candidato/vagas');
    expect(screen.queryByTestId('a11y-widget')).not.toBeInTheDocument();
  });

  it('NÃO renderiza em /dashboard', () => {
    renderAt('/dashboard');
    expect(screen.queryByTestId('a11y-widget')).not.toBeInTheDocument();
    expect(screen.queryByTestId('chat-widget')).not.toBeInTheDocument();
    expect(screen.queryByTestId('human-widget')).not.toBeInTheDocument();
  });

  it('NÃO renderiza em /dashboard/financeiro', () => {
    renderAt('/dashboard/financeiro');
    expect(screen.queryByTestId('a11y-widget')).not.toBeInTheDocument();
  });

  it('abre acessibilidade via CustomEvent app:open-accessibility', () => {
    renderAt('/');
    act(() => {
      window.dispatchEvent(new CustomEvent('app:open-accessibility'));
    });
    expect(screen.getByTestId('a11y-widget').getAttribute('data-open')).toBe(
      'true',
    );
  });

  it('abre chat via CustomEvent app:open-chat', () => {
    renderAt('/');
    act(() => {
      window.dispatchEvent(new CustomEvent('app:open-chat'));
    });
    expect(screen.getByTestId('chat-widget').getAttribute('data-open')).toBe(
      'true',
    );
  });
});
