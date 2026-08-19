import { useEffect, useRef } from 'react';

export function useFocusTrap(active: boolean) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    previousFocusRef.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      'textarea',
      'input',
      'select',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    const getFocusable = () =>
      Array.from(
        container.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter(
        (el) => !el.hasAttribute('disabled') && el.offsetParent !== null,
      );

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (
          document.activeElement === first ||
          !container.contains(document.activeElement)
        ) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (
          document.activeElement === last ||
          !container.contains(document.activeElement)
        ) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const firstFocusable = getFocusable()[0];
    if (firstFocusable) {
      setTimeout(() => firstFocusable.focus(), 0);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [active]);

  return containerRef;
}
