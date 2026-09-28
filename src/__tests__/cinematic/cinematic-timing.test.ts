import { describe, it, expect } from 'vitest';
import {
  CINEMATIC_TIMING,
  CINEMATIC_EASING,
  CINEMATIC_TEXT_TIMING,
} from '@/components/sections/cinematic-timing';

describe('CINEMATIC_TIMING', () => {
  it('EXIT_MS esta entre 1100 e 1300 ms', () => {
    expect(CINEMATIC_TIMING.EXIT_MS).toBeGreaterThanOrEqual(1100);
    expect(CINEMATIC_TIMING.EXIT_MS).toBeLessThanOrEqual(1300);
  });

  it('ENTER_MS continua sendo 2200 ms (preserva timing cinematico existente)', () => {
    expect(CINEMATIC_TIMING.ENTER_MS).toBe(2200);
  });

  it('HOLD_MS continua sendo 2500 ms (preserva timing cinematico existente)', () => {
    expect(CINEMATIC_TIMING.HOLD_MS).toBe(2500);
  });

  it('todas as duracoes sao positivas', () => {
    expect(CINEMATIC_TIMING.ENTER_MS).toBeGreaterThan(0);
    expect(CINEMATIC_TIMING.HOLD_MS).toBeGreaterThan(0);
    expect(CINEMATIC_TIMING.EXIT_MS).toBeGreaterThan(0);
  });
});

describe('CINEMATIC_EASING', () => {
  it('e um cubic bezier valido com 4 valores em [0,1]', () => {
    expect(CINEMATIC_EASING).toHaveLength(4);
    for (const v of CINEMATIC_EASING) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });
});

describe('CINEMATIC_TEXT_TIMING', () => {
  it('titulo entra antes do subtitulo', () => {
    expect(CINEMATIC_TEXT_TIMING.TITLE_DELAY_ENTER_S).toBeLessThan(
      CINEMATIC_TEXT_TIMING.SUBTITLE_DELAY_ENTER_S,
    );
  });

  it('delays de entrada cabem no ENTER_MS total (2200ms = 2.2s)', () => {
    expect(CINEMATIC_TEXT_TIMING.SUBTITLE_DELAY_ENTER_S).toBeLessThanOrEqual(
      2.2,
    );
  });

  it('duracao de saida do texto e menor que EXIT_MS (1200ms = 1.2s)', () => {
    expect(
      CINEMATIC_TEXT_TIMING.TEXT_EXIT_DURATION_S * 1000,
    ).toBeLessThanOrEqual(CINEMATIC_TIMING.EXIT_MS);
  });
});
