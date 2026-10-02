import type { ReactNode } from 'react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface WorkspaceSlotProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  breadcrumbItems?: BreadcrumbItem[];
  actions?: ReactNode;
  children: ReactNode;
}

export type WorkspaceRenderer = (slot: WorkspaceSlotProps) => ReactNode;

export interface ColumnDef<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface FilterDef {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date';
  options?: { value: string; label: string }[];
}

export interface ModulePageConfig<T, C> {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  breadcrumbItems?: BreadcrumbItem[];
  columns: ColumnDef<T>[];
  filters?: FilterDef[];
  fetchData: (
    tenantId: string,
    filters: Record<string, string>,
  ) => Promise<T[]>;
  createItem: (tenantId: string, input: C) => Promise<T>;
  updateItem: (tenantId: string, id: string, input: Partial<C>) => Promise<T>;
  deleteItem: (tenantId: string, id: string) => Promise<void>;
  getItemId: (item: T) => string;
  emptyMessage?: string;
  renderForm?: (
    form: C,
    setForm: (form: C) => void,
    editMode: boolean,
  ) => ReactNode;
  defaultForm: C;
  renderWorkspace?: WorkspaceRenderer;
}
