'use client';

import { FileText } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/fallback';

export default function RelatorioSuportePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Relatórios de Suporte</h1>
        <p className="text-sm text-muted-foreground">Demonstrativos e análises do módulo de suporte.</p>
      </div>
      <Card className="p-8">
        <EmptyState
          title="Relatórios em desenvolvimento"
          description="Os relatórios de suporte serão disponibilizados quando o módulo for concluído."
          icon={FileText}
        />
      </Card>
    </div>
  );
}


