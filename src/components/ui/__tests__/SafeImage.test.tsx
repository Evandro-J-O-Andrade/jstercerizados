import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';

import { SafeImage } from '@/components/ui/SafeImage';

describe('SafeImage', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('does not pass children to the <img> element (prevents React #137)', () => {
    const { container } = render(
      <SafeImage src="/test.jpg" alt="Test">
        <div data-testid="overlay">Overlay</div>
      </SafeImage>,
    );

    const img = container.querySelector('img');
    expect(img).toBeTruthy();
    expect(img?.children.length).toBe(0);
    expect(img?.innerHTML).toBe('');
    expect(container.querySelector('[data-testid="overlay"]')).toBeTruthy();
  });

  it('renders an img element with correct attributes when no children are provided', () => {
    const { container } = render(
      <SafeImage src="/test.jpg" alt="Test image" />,
    );

    const img = container.querySelector('img');
    expect(img).toBeTruthy();
    expect(img?.getAttribute('src')).toBe('/test.jpg');
    expect(img?.getAttribute('alt')).toBe('Test image');
    expect(img?.getAttribute('loading')).toBe('lazy');
  });

  it('calls external onLoad handler when the image loads', async () => {
    const onLoad = vi.fn();
    const { container } = render(
      <SafeImage src="/test.jpg" alt="Test" onLoad={onLoad} />,
    );

    const img = container.querySelector('img');
    expect(img).toBeTruthy();

    fireEvent.load(img!);

    await waitFor(() => {
      expect(onLoad).toHaveBeenCalledTimes(1);
    });
  });

  it('calls external onError handler only after all fallbacks are exhausted', async () => {
    const onError = vi.fn();
    const { container } = render(
      <SafeImage
        src="/broken.jpg"
        fallbackSrc="/images/global/fallbacks/default.svg"
        alt="Test"
        onError={onError}
      />,
    );

    const img = container.querySelector('img');
    expect(img).toBeTruthy();

    fireEvent.error(img!);

    await waitFor(() => {
      expect(img?.getAttribute('src')).toBe(
        '/images/global/fallbacks/default.svg',
      );
    });

    expect(onError).not.toHaveBeenCalled();

    fireEvent.error(img!);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledTimes(1);
    });
  });

  it('renders fallback UI when all image sources fail', async () => {
    const customFallback = (
      <div data-testid="fallback">Image unavailable</div>
    );
    const { container, getByTestId } = render(
      <SafeImage
        src="/broken.jpg"
        fallbackSrc="/images/global/fallbacks/default.svg"
        alt="Test"
        fallback={customFallback}
      />,
    );

    const img = container.querySelector('img');

    fireEvent.error(img!);

    await waitFor(() => {
      expect(img?.getAttribute('src')).toBe(
        '/images/global/fallbacks/default.svg',
      );
    });

    fireEvent.error(img!);

    await waitFor(() => {
      expect(getByTestId('fallback')).toBeTruthy();
    });
    expect(container.querySelector('img')).toBeNull();
  });

  it('renders children as sibling of img (outside the void element)', () => {
    const { container } = render(
      <SafeImage src="/test.jpg" alt="Test" className="custom-class">
        <span data-testid="child">Child</span>
      </SafeImage>,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.tagName).toBe('DIV');

    const img = wrapper.querySelector('img');
    expect(img).toBeTruthy();
    expect(img?.children.length).toBe(0);

    const child = wrapper.querySelector('[data-testid="child"]');
    expect(child).toBeTruthy();
    expect(child?.tagName).toBe('SPAN');
  });
});
