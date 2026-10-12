/**
 * CellRegistryContract — typed registry for cell contracts.
 * Cells register their metadata, routes, and lifecycle hooks.
 * The registry does NOT grant permissions — it only discovers cells.
 */

import type { CellContract } from '../types';

export interface RegistryEntry {
  cell: CellContract;
  registeredAt: string;
}

export interface RegistryStats {
  total: number;
  enabled: number;
  disabled: number;
  byModule: Record<string, number>;
}

/**
 * CellRegistry — in-memory registry of cell contracts.
 * Thread-safe for single-threaded JS (no locks needed).
 */
export class CellRegistry {
  private cells = new Map<string, RegistryEntry>();
  private order: string[] = [];

  /**
   * Register a cell. Overwrites if already registered (with warning).
   */
  register(cell: CellContract): void {
    if (this.cells.has(cell.id)) {
      console.warn(`[CellRegistry] Cell "${cell.id}" already registered, overwriting.`);
    }
    this.cells.set(cell.id, { cell, registeredAt: new Date().toISOString() });
    if (!this.order.includes(cell.id)) {
      this.order.push(cell.id);
    }
  }

  /**
   * Unregister a cell.
   */
  unregister(cellId: string): boolean {
    return this.cells.delete(cellId);
  }

  /**
   * Get a cell by ID.
   */
  get(cellId: string): RegistryEntry | undefined {
    return this.cells.get(cellId);
  }

  /**
   * Get all enabled cells.
   */
  getEnabled(): RegistryEntry[] {
    return this.order
      .map((id) => this.cells.get(id)!)
      .filter((entry) => entry.cell.enabled);
  }

  /**
   * Get all cells (enabled and disabled).
   */
  getAll(): RegistryEntry[] {
    return this.order.map((id) => this.cells.get(id)!);
  }

  /**
   * Get cells by module prefix.
   */
  getByModule(moduleId: string): RegistryEntry[] {
    return this.getAll().filter((entry) => entry.cell.id.startsWith(moduleId));
  }

  /**
   * Check if a cell is registered.
   */
  has(cellId: string): boolean {
    return this.cells.has(cellId);
  }

  /**
   * Get registry statistics.
   */
  stats(): RegistryStats {
    const all = this.getAll();
    const byModule: Record<string, number> = {};
    for (const entry of all) {
      // Module is the prefix before the first '/'
      const slashIndex = entry.cell.id.indexOf('/');
      const module = slashIndex > 0 ? entry.cell.id.substring(0, slashIndex) : entry.cell.id;
      byModule[module] = (byModule[module] || 0) + 1;
    }
    return {
      total: all.length,
      enabled: all.filter((e) => e.cell.enabled).length,
      disabled: all.filter((e) => !e.cell.enabled).length,
      byModule,
    };
  }

  /**
   * Clear all cells.
   */
  clear(): void {
    this.cells.clear();
    this.order = [];
  }
}

/**
 * Singleton registry instance for the application.
 */
export const cellRegistry = new CellRegistry();