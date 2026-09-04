import { describe, it, expect } from 'vitest';
import {
  CINEMATIC_TIMING,
  CINEMATIC_EASING,
  CINEMATIC_TEXT_TIMING,
} from '@/components/sections/cinematic-timing';

describe('CINEMATIC_TIMING', () => {
  it('EXIT_MS esta entre 1300 e 1500 ms', () => {
    expect(CINEMATIC_TIMING.EXIT_MS).toBeGreaterThanOrEqual(1300);
    expect(CINEMATIC_TIMING.EXIT_MS).toBeLessThanOrEqual(1500);
  });

  it('ENTER_MS continua sendo 3500 ms (preserva timing cinematico existente)', () => {
    expect(CINEMATIC_TIMING.ENTER_MS).toBe(3500);
  });

  it('HOLD_MS continua sendo 5000 ms (preserva timing cinematico existente)', () => {
    expect(CINEMATIC_TIMING.HOLD_MS).toBe(5000);
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

  it('delays de entrada cabem no ENTER_MS total (3500ms = 3.5s)', () => {
    expect(CINEMATIC_TEXT_TIMING.SUBTITLE_DELAY_ENTER_S).toBeLessThanOrEqual(
      3.5,
    );
  });

  it('duracao de saida do texto e menor que EXIT_MS (1400ms = 1.4s)', () => {
    expect(
      CINEMATIC_TEXT_TIMING.TEXT_EXIT_DURATION_S * 1000,
    ).toBeLessThanOrEqual(CINEMATIC_TIMING.EXIT_MS);
  });
});
