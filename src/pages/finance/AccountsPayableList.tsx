import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { accountsPayableRepository } from '@/repositories/accounts-payable.repository';
import { useAuth } from '@/contexts/AuthContext';
import type { AccountPayable } from '@/types/domain/finance';

const statusLabels: Record<string, string> = {
  open: 'Em aberto',
  paid: 'Pago',
  overdue: 'Vencido',
  cancelled: 'Cancelado',
  partially_paid: 'Parcialmente pago',
};

export function AccountsPayableList() {
  const { currentTenantId } = useAuth();
  const [items, setItems] = useState<AccountPayable[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!currentTenantId) return;

    const fetch = async () => {
      try {
        const data = await accountsPayableRepository.findAll(currentTenantId);
        setItems(data);
      } catch (error) {
        console.error('[AccountsPayableList] Falha ao carregar dados', error);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [currentTenantId]);

  const filtered = items.filter((item) =>
    item.description.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar contas a pagar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pr-3 pl-9 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Nova conta
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-500">
          Nenhuma conta a pagar encontrada.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-500">
                  Descrição
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">
                  Vencimento
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">
                  Valor
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">
                  Status
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-900">
                    {item.description}
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {new Date(item.due_date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-2 text-gray-900">
                    {item.amount.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </td>
                  <td className="px-4 py-2">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                      {statusLabels[item.status] ?? item.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <button className="rounded p-1 text-gray-500 hover:bg-gray-100">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="rounded p-1 text-red-500 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
