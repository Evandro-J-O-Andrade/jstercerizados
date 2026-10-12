'use client';

import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/fallback';
import { useToast } from '@/components/feedback/ToastContext';
import { useAuth } from '@/contexts/AuthContext';

export default function CategoriasPage() {
  const { currentTenantId } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!currentTenantId) return;
    setLoading(true);
    // TODO: Implement financialCategoryRepository.findAll when ready
    setCategories([]);
    setLoading(false);
  }, [currentTenantId]);

  const filtered = categories.filter((c) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return c.name?.toLowerCase().includes(term);
  });

  if (loading) {
    return <p className="text-sm text-muted-foreground">Carregando categorias...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Categorias Financeiras</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie categorias e subcategorias (hierárquico) para classificação de lançamentos.
          </p>
        </div>
        <Button onClick={() => addToast({ type: 'info', message: 'Nova categoria - Em desenvolvimento' })}>
          <Plus className="mr-2 h-4 w-4" />
          Nova categoria
        </Button>
      </div>

      <div className="border-border bg-background flex flex-1 items-center gap-2 rounded-lg border px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome..."
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhuma categoria cadastrada"
          description="As categorias financeiras aparecerão aqui quando implementadas."
          actionLabel="Nova categoria"
          onAction={() => addToast({ type: 'info', message: 'Em desenvolvimento' })}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 font-medium text-muted-foreground">Nome</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Categoria pai</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-muted">
                  <td className="px-4 py-3 text-foreground">{item.name}</td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{item.type}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.parent_id ? 'Sim' : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      item.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                    }`}>
                      {item.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
