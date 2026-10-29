import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus } from 'lucide-react';

interface FiscalPageProps {
  moduleTitle: string;
  moduleDescription: string;
}

export default function FiscalPage({
  moduleTitle,
  moduleDescription,
}: FiscalPageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Carregando {moduleTitle}...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-destructive">{error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">{moduleTitle}</h1>
          <p className="text-muted-foreground">{moduleDescription}</p>
        </div>
        <Button onClick={() => {}} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo documento
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full items-center gap-2 rounded-lg border px-3 py-2 sm:w-auto">
              <Search className="text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar documentos fiscais..."
                className="bg-transparent text-sm outline-none"
              />
            </div>
          </div>
          <div className="pt-6">
            <p className="text-muted-foreground py-8 text-center">
              Nenhum documento fiscal encontrado
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
