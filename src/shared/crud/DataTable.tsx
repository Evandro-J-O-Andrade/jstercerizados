import { Button } from '@/components/ui/Button';
import { Pencil, Trash2, Power } from 'lucide-react';
import { cn } from '@/utils';
import type { ColumnDef } from './types';

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  items: T[];
  getItemId: (item: T) => string;
  sortKey: string;
  sortDir: 'asc' | 'desc';
  onSort: (key: string) => void;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  showActions: boolean;
  onToggleStatus?: (item: T) => void;
  getToggleState?: (item: T) => boolean;
}

export function DataTable<T>({
  columns,
  items,
  getItemId,
  sortKey,
  sortDir,
  onSort,
  onEdit,
  onDelete,
  showActions,
  onToggleStatus,
  getToggleState,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={cn(
                  'text-muted-foreground px-4 py-3 text-left font-medium',
                  col.width,
                )}
                onClick={() => col.sortable && onSort(String(col.key))}
              >
                <div className="flex items-center gap-1">
                  {col.header}
                  {col.sortable && sortKey === String(col.key) && (
                    <span className="text-xs">
                      {sortDir === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </div>
              </th>
            ))}
            {showActions && <th className="px-4 py-3 text-right">Ações</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={getItemId(item)}
              className="hover:bg-muted/50 border-b last:border-0"
            >
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className={cn('px-4 py-3', col.width)}
                >
                  {col.render
                    ? col.render(item)
                    : String(item[col.key as keyof T] ?? '')}
                </td>
              ))}
              {showActions && (
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {onToggleStatus && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleStatus(item)}
                        aria-label="Alternar status"
                        title={
                          getToggleState
                            ? getToggleState(item)
                              ? 'Ativo — clique para desativar'
                              : 'Inativo — clique para ativar'
                            : 'Alternar status'
                        }
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(item)}
                      aria-label="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() => onDelete(item)}
                      aria-label="Excluir"
                    >
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
  );
}
