'use client';

import { useLocation } from 'react-router-dom';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/fallback';
import { Clock } from 'lucide-react';

interface ComingSoonPageProps {
  title?: string;
  description?: string;
}

export default function ComingSoonPage({
  title,
  description,
}: ComingSoonPageProps) {
  const location = useLocation();
  const path = location.pathname.replace(/^\/dashboard\/?/, '') || 'Painel';
  const displayTitle =
    title || path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');

  return (
    <ModuleWorkspace
      title={displayTitle}
      description={
        description ||
        'Esta funcionalidade está em desenvolvimento e estará disponível em breve.'
      }
      icon={Clock}
      breadcrumbItems={[{ label: displayTitle }]}
    >
      <Card className="p-6">
        <EmptyState
          title="Em breve"
          description={
            description ||
            'Esta funcionalidade está em desenvolvimento e estará disponível em breve.'
          }
        />
      </Card>
    </ModuleWorkspace>
  );
}
