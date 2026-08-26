import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { useAuth } from '@/contexts/AuthContext';
import { settingsRepository } from '@/repositories/settings.repository';
import { Settings } from 'lucide-react';
import type { TenantSetting } from '@/repositories/settings.repository';

export default function Configuracoes() {
  const { currentTenantId } = useAuth();
  const [settings, setSettings] = useState<TenantSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!currentTenantId) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await settingsRepository.findAll(currentTenantId);
        if (!cancelled) {
          setSettings(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Erro ao carregar configurações',
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [currentTenantId]);

  return (
    <ModuleWorkspace
      title="Configurações"
      description="Configurações do sistema."
      icon={Settings}
      breadcrumbItems={[{ label: 'Configurações' }]}
    >
      {isLoading && (
        <Card className="p-6">
          <p className="text-muted-foreground">Carregando configurações...</p>
        </Card>
      )}

      {error && (
        <Card className="p-6">
          <p className="text-destructive">{error}</p>
        </Card>
      )}

      {!isLoading && !error && settings.length === 0 && (
        <Card className="p-6">
          <p className="text-muted-foreground">
            Nenhuma configuração cadastrada no momento.
          </p>
        </Card>
      )}

      {!isLoading && !error && settings.length > 0 && (
        <div className="space-y-4">
          {settings.map((setting) => (
            <Card key={setting.id} className="p-6">
              <h3 className="text-foreground text-lg font-semibold">
                {setting.key}
              </h3>
              <p className="text-muted-foreground mt-1">{setting.value}</p>
            </Card>
          ))}
        </div>
      )}
    </ModuleWorkspace>
  );
}
