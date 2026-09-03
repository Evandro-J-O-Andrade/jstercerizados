import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SectionLoader } from '@/components/feedback/SectionLoader';

describe('SectionLoader', () => {
  it('renders spinner variant by default', () => {
    const { getByTestId, getByText } = render(<SectionLoader />);
    expect(getByTestId('section-loader')).toBeTruthy();
    expect(getByText('Carregando...')).toBeTruthy();
  });

  it('renders custom message', () => {
    const { getByText } = render(<SectionLoader message="Buscando dados" />);
    expect(getByText('Buscando dados')).toBeTruthy();
  });

  it('renders skeleton variant with accessible status', () => {
    const { getByTestId } = render(
      <SectionLoader variant="skeleton" lines={4} message="Carregando" />,
    );
    const container = getByTestId('section-loader');
    expect(container.getAttribute('aria-busy')).toBe('true');
    expect(container.getAttribute('role')).toBe('status');
  });
});
