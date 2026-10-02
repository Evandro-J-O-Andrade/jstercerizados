import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Search } from 'lucide-react';
import type { FilterDef } from './types';

interface CrudFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  filters: FilterDef[];
  filterValues: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
}

export function CrudFilters({
  search,
  onSearchChange,
  filters,
  filterValues,
  onFilterChange,
}: CrudFiltersProps) {
  return (
    <Card className="mb-6 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        {filters.map((f) => (
          <div key={f.key} className="flex flex-col gap-1">
            <Label className="text-muted-foreground text-xs">{f.label}</Label>
            {f.type === 'select' ? (
              <select
                value={filterValues[f.key] || ''}
                onChange={(e) => onFilterChange(f.key, e.target.value)}
                className="border-input bg-background focus:border-primary focus:ring-primary rounded-md border px-3 py-1.5 text-sm"
              >
                <option value="">Todos</option>
                {f.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                placeholder={f.label}
                value={filterValues[f.key] || ''}
                onChange={(e) => onFilterChange(f.key, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
