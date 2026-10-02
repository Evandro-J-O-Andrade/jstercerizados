import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { DataTable } from './DataTable';
import { CrudFilters } from './CrudFilters';
import { FormSuccessAlert, FormErrorAlert } from './CrudAlerts';
import { CrudDialog, CrudConfirmDialog } from './CrudDialog';
import {
  CrudLoadingState,
  CrudErrorState,
  CrudEmptyState,
  CrudCreateButton,
} from './CrudStates';
import type { ModulePageConfig } from './types';

export function ModulePage<T extends { id: string; created_at?: string }, C>({
  title,
  description,
  icon: Icon,
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
  renderWorkspace,
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
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Erro ao carregar');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
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
        await updateItem(
          currentTenantId,
          getItemId(editItem),
          form as Partial<C>,
        );
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
    <CrudCreateButton onClick={openCreate} />
  ) : undefined;

  const content = (
    <>
      {formSuccess && <FormSuccessAlert message={formSuccess} />}
      {formError && <FormErrorAlert message={formError} />}

      <CrudFilters
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={(key, value) =>
          setFilterValues((prev) => ({ ...prev, [key]: value }))
        }
      />

      <Card className="overflow-hidden">
        {isLoading ? (
          <CrudLoadingState />
        ) : error ? (
          <CrudErrorState
            message={error}
            onRetry={
              currentTenantId
                ? () => fetchData(currentTenantId, filterValues).then(setItems)
                : undefined
            }
          />
        ) : filtered.length === 0 ? (
          <CrudEmptyState
            message={emptyMessage}
            canCreate={isAdminMaster}
            onCreate={openCreate}
          />
        ) : (
          <DataTable
            columns={columns}
            items={filtered}
            getItemId={getItemId}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={handleSort}
            onEdit={openEdit}
            onDelete={setDeleteConfirm}
            showActions={isAdminMaster}
          />
        )}
      </Card>

      {modalOpen && (
        <CrudDialog
          onClose={() => setModalOpen(false)}
          title={`${editItem ? 'Editar' : 'Novo'} ${title
            .replace(/s$/, '')
            .replace(/ções$/, 'ção')}`}
          submitLabel={editItem ? 'Salvar' : 'Criar'}
          onSubmit={handleSubmit}
          errorMessage={formError}
        >
          {renderForm ? (
            renderForm(form, setForm, !!editItem)
          ) : (
            <p className="text-muted-foreground text-sm">
              Formulário não configurado.
            </p>
          )}
        </CrudDialog>
      )}

      {deleteConfirm && (
        <CrudConfirmDialog
          onCancel={() => setDeleteConfirm(null)}
          onConfirm={handleDelete}
          title="Confirmar exclusão"
          message="Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita."
          confirmLabel="Excluir"
        />
      )}
    </>
  );

  if (!renderWorkspace) return content;

  return (
    <>
      {renderWorkspace({
        title,
        description,
        icon: Icon,
        breadcrumbItems,
        actions,
        children: content,
      })}
    </>
  );
}
