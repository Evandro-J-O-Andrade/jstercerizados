'use client';

import { FileText } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/fallback';

export default function RelatorioContabilidadePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Relatórios Contábeis</h1>
        <p className="text-sm text-muted-foreground">Demonstrativos e análises do módulo de contabilidade.</p>
      </div>
      <Card className="p-8">
        <EmptyState
          title="Relatórios em desenvolvimento"
          description="Os relatórios contábeis serão disponibilizados quando o módulo for concluído."
          icon={FileText}
        />
      </Card>
    </div>
  );
}


