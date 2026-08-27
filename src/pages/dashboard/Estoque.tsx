'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState, ErrorState } from '@/components/fallback';
import { stockRepository } from '@/repositories/stock.repository';
import type { Product, StockMovement } from '@/types/domain/stock';
import { useAuth } from '@/contexts/AuthContext';

type Tab = 'products' | 'movements';

export default function Estoque() {
  const { currentTenantId } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!currentTenantId) return;
    setLoading(true);
    setError(null);
    Promise.all([
      stockRepository.findProducts(currentTenantId),
      stockRepository.findMovements(currentTenantId),
    ]).then(([p, m]) => {
      setProducts(p);
      setMovements(m);
    }).catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar estoque'))
      .finally(() => setLoading(false));
  }, [currentTenantId]);

  const filteredProducts = useMemo(() => {
    let data = products;
    if (search) {
      const term = search.toLowerCase();
      data = data.filter((p) =>
        p.name.toLowerCase().includes(term)
      );
    }
    return data;
  }, [products, search]);

  const kpis = useMemo(() => {
    const totalProducts = products.length;
    const totalMovements = movements.length;
    return { totalProducts, totalMovements };
  }, [products, movements]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Carregando estoque...</p>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Estoque</h1>
          <p className="text-sm text-muted-foreground">Produtos, materiais e movimentações.</p>
        </div>
        <Button variant="secondary" onClick={() => alert('Exportar relatório de estoque...')}>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Produtos</p>
          <p className="text-lg font-semibold text-foreground">{kpis.totalProducts}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Movimentações</p>
          <p className="text-lg font-semibold text-foreground">{kpis.totalMovements}</p>
        </Card>
      </div>

      <div className="flex gap-2 border-b border-border overflow-x-auto">
        {[
          { key: 'products', label: 'Produtos' },
          { key: 'movements', label: 'Movimentações' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as Tab)}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'products' && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome ou SKU..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <Button onClick={() => alert('Formulário de novo produto')}>
              <Plus className="mr-2 h-4 w-4" />
              Novo produto
            </Button>
          </div>

          {filteredProducts.length === 0 ? (
            <EmptyState
              title="Nenhum produto cadastrado"
              description="Quando houver produtos registrados, eles aparecerão aqui."
              actionLabel="Novo produto"
              onAction={() => alert('Formulário de novo produto')}
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Nome</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Unidade</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Categoria</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-muted">
                      <td className="px-4 py-3 text-foreground">{product.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{product.unit ?? '-'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{product.category ?? '-'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={product.status === 'active' ? 'success' : 'secondary'}>
                          {product.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'movements' && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-end">
            <Button onClick={() => alert('Formulário de nova movimentação')}>
              <Plus className="mr-2 h-4 w-4" />
              Nova movimentação
            </Button>
          </div>

          {movements.length === 0 ? (
            <EmptyState
              title="Nenhuma movimentação registrada"
              description="Quando houver movimentações, elas aparecerão aqui."
              actionLabel="Nova movimentação"
              onAction={() => alert('Formulário de nova movimentação')}
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Quantidade</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Observação</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {movements.map((movement) => (
                    <tr key={movement.id} className="hover:bg-muted">
                      <td className="px-4 py-3">
                        <Badge variant={
                          movement.movement_type === 'entry' ? 'success' :
                          movement.movement_type === 'exit' ? 'danger' : 'secondary'
                        }>
                          {movement.movement_type === 'entry' ? 'Entrada' : movement.movement_type === 'exit' ? 'Saída' : 'Ajuste'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-foreground">{movement.quantity}</td>
                      <td className="px-4 py-3 text-muted-foreground">{movement.notes ?? '-'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(movement.created_at).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
