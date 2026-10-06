import { describe, it, expect } from 'vitest';
import {
  LOADING_PROTECTED_COMPONENTS,
  LOADING_HIERARCHY,
  assertLoadingComponent,
  type LoadingContract,
} from '@/components/ui/loading-contract';
import { PageLoader } from '@/components/ui/PageLoader';
import { RouteLoadingFallback } from '@/components/ui/RouteLoadingFallback';
import { LoadingSpinner, LoadingOverlay } from '@/components/ui/LoadingSpinner';

describe('loading-contract', () => {
  it('exposes all 4 protected components', () => {
    expect(Object.keys(LOADING_PROTECTED_COMPONENTS)).toEqual([
      'PageLoader',
      'RouteLoadingFallback',
      'LoadingSpinner',
      'LoadingOverlay',
    ]);
  });

  it('defines the 3-level hierarchy', () => {
    expect(LOADING_HIERARCHY.page).toBe(PageLoader);
    expect(LOADING_HIERARCHY.route).toBe(RouteLoadingFallback);
    expect(typeof LOADING_HIERARCHY.crud).toBe('function');
  });

  it('assertLoadingComponent accepts protected components', () => {
    expect(assertLoadingComponent(PageLoader)).toBe(true);
    expect(assertLoadingComponent(RouteLoadingFallback)).toBe(true);
    expect(assertLoadingComponent(LoadingSpinner)).toBe(true);
    expect(assertLoadingComponent(LoadingOverlay)).toBe(true);
  });

  it('assertLoadingComponent rejects non-loading components', () => {
    expect(assertLoadingComponent(() => null)).toBe(false);
    expect(assertLoadingComponent({})).toBe(false);
    expect(assertLoadingComponent(null)).toBe(false);
  });

  it('LoadingContract type is usable', () => {
    const contract: LoadingContract = LOADING_PROTECTED_COMPONENTS;
    expect(contract.PageLoader).toBeDefined();
    expect(contract.LoadingSpinner).toBeDefined();
  });
});
