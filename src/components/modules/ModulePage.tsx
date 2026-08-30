import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  X,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/utils';
import type { ReactNode } from 'react';

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
  module?: Parameters<typeof ModuleWorkspace>[0]['module'];
  permissions?: Parameters<typeof ModuleWorkspace>[0]['permissions'];
  breadcrumbItems?: Parameters<typeof ModuleWorkspace>[0]['breadcrumbItems'];
  columns: ColumnDef<T>[];
  filters?: FilterDef[];
  fetchData: (tenantId: string, filters: Record<string, string>) => Promise<T[]>;
  createItem: (tenantId: string, input: C) => Promise<T>;
  updateItem: (tenantId: string, id: string, input: Partial<C>) => Promise<T>;
  deleteItem: (tenantId: string, id: string) => Promise<void>;
  getItemId: (item: T) => string;
  emptyMessage?: string;
  renderForm?: (form: C, setForm: (form: C) => void, editMode: boolean) => ReactNode;
  defaultForm: C;
}

export function ModulePage<T extends { id: string; created_at?: string }, C>({
  title,
  description,
  icon: Icon,
  module,
  permissions = [],
  breadcrumbItems,
  columns,
  filters = [],
  fetchData,
  createItem,
  updateItem,
  deleteItem,
  getItemId,
  emptyMessage = 'Nenhum registro encontrado.',
  renderForm,
  defaultForm,
}: ModulePageConfig<T, C>) {
  const { currentTenantId, isAdminMaster } = useAuth();
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<T | null>(null);
  const [form, setForm] = useState<C>(defaultForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<T | null>(null);
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (!currentTenantId) return;
    const tenantId = currentTenantId;
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchData(tenantId, filterValues);
        if (!cancelled) setItems(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao carregar');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [currentTenantId, filterValues]);

  const filtered = useMemo(() => {
    let result = items;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((item) =>
        columns.some((col) => {
          const val = item[col.key as keyof T];
          return typeof val === 'string' && val.toLowerCase().includes(q);
        }),
      );
    }
    if (sortKey) {
      result = [...result].sort((a, b) => {
        const aVal = a[sortKey as keyof T];
        const bVal = b[sortKey as keyof T];
        if (aVal === undefined || bVal === undefined) return 0;
        const aStr = typeof aVal === 'string' ? aVal : String(aVal ?? '');
        const bStr = typeof bVal === 'string' ? bVal : String(bVal ?? '');
        const cmp = aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return result;
  }, [items, search, sortKey, sortDir, columns]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const openCreate = () => {
    setEditItem(null);
    setForm(defaultForm);
    setFormError(null);
    setFormSuccess(null);
    setModalOpen(true);
  };

  const openEdit = (item: T) => {
    setEditItem(item);
    setForm(defaultForm);
    setFormError(null);
    setFormSuccess(null);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!currentTenantId) return;
    setFormError(null);
    setFormSuccess(null);
    try {
      if (editItem) {
        await updateItem(currentTenantId, getItemId(editItem), form as Partial<C>);
        setFormSuccess('Registro atualizado com sucesso.');
      } else {
        await createItem(currentTenantId, form as C);
        setFormSuccess('Registro criado com sucesso.');
      }
      setModalOpen(false);
      const data = await fetchData(currentTenantId, filterValues);
      setItems(data);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm || !currentTenantId) return;
    try {
      await deleteItem(currentTenantId, getItemId(deleteConfirm));
      setDeleteConfirm(null);
      const data = await fetchData(currentTenantId, filterValues);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  };

  const actions = isAdminMaster ? (
    <Button onClick={openCreate}>
      <Plus className="h-4 w-4" />
      <span className="hidden sm:inline">Novo</span>
    </Button>
  ) : undefined;

  return (
    <ModuleWorkspace
      title={title}
      description={description}
      icon={Icon}
      breadcrumbItems={breadcrumbItems}
      actions={actions}
      module={module}
      permissions={permissions}
    >
      {formSuccess && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
          <CheckCircle className="h-4 w-4" />
          {formSuccess}
        </div>
      )}
      {formError && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          <AlertTriangle className="h-4 w-4" />
          {formError}
        </div>
      )}

      <Card className="mb-6 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {filters.map((f) => (
            <div key={f.key} className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">{f.label}</Label>
              {f.type === 'select' ? (
                <select
                  value={filterValues[f.key] || ''}
                  onChange={(e) => setFilterValues((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  className="border-input bg-background focus:border-primary focus:ring-primary rounded-md border px-3 py-1.5 text-sm"
                >
                  <option value="">Todos</option>
                  {f.options?.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : (
                <Input
                  placeholder={f.label}
                  value={filterValues[f.key] || ''}
                  onChange={(e) => setFilterValues((prev) => ({ ...prev, [f.key]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-red-600">
            <AlertTriangle className="h-8 w-8" />
            <p>{error}</p>
            <Button variant="outline" onClick={() => currentTenantId && fetchData(currentTenantId, filterValues).then(setItems)}>
              Tentar novamente
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
            <Eye className="h-8 w-8" />
            <p>{emptyMessage}</p>
            {isAdminMaster && (
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Criar primeiro registro
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {columns.map((col) => (
                    <th
                      key={String(col.key)}
                      className={cn('px-4 py-3 text-left font-medium text-muted-foreground', col.width)}
                      onClick={() => col.sortable && handleSort(String(col.key))}
                    >
                      <div className="flex items-center gap-1">
                        {col.header}
                        {col.sortable && sortKey === String(col.key) && (
                          <span className="text-xs">{sortDir === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                  ))}
                  {isAdminMaster && <th className="px-4 py-3 text-right">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={getItemId(item)} className="border-b last:border-0 hover:bg-muted/50">
                    {columns.map((col) => (
                      <td key={String(col.key)} className={cn('px-4 py-3', col.width)}>
                        {col.render ? col.render(item) : String(item[col.key as keyof T] ?? '')}
                      </td>
                    ))}
                    {isAdminMaster && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600" onClick={() => setDeleteConfirm(item)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border-border w-full max-w-2xl rounded-xl border p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-foreground text-lg font-semibold">
                {editItem ? 'Editar' : 'Novo'} {title.replace(/s$/, '').replace(/ções$/, 'ção')}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {formError && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
                <AlertTriangle className="h-4 w-4" />
                {formError}
              </div>
            )}
            <div className="max-h-[60vh] space-y-4 overflow-y-auto">
              {renderForm ? renderForm(form, setForm, !!editItem) : (
                <p className="text-muted-foreground text-sm">Formulário não configurado.</p>
              )}
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                {editItem ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border-border w-full max-w-md rounded-xl border p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-red-100 text-red-600 flex h-10 w-10 items-center justify-center rounded-full dark:bg-red-900 dark:text-red-300">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-foreground text-lg font-semibold">Confirmar exclusão</h3>
            </div>
            <p className="text-muted-foreground mb-6 text-sm">
              Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </ModuleWorkspace>
  );
}
