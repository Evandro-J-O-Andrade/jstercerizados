import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { Construction } from 'lucide-react';

interface UnderConstructionProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  breadcrumbItems?: Array<{ label: string; href?: string }>;
  expectedDate?: string;
}

export default function UnderConstruction({
  title,
  description,
  icon,
  breadcrumbItems,
  expectedDate,
}: UnderConstructionProps) {
  return (
    <ModuleWorkspace
      title={title}
      description={description}
      icon={icon}
      breadcrumbItems={breadcrumbItems}
    >
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-primary/10 text-primary mb-6 flex h-20 w-20 items-center justify-center rounded-2xl">
          <Construction className="h-10 w-10" />
        </div>
        <h3 className="text-foreground mb-2 text-xl font-semibold">
          Área em construção
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md text-sm">
          Este módulo está sendo desenvolvido pela equipe da J&amp;S Empregos
          LTDA. Em breve você terá acesso completo às funcionalidades.
        </p>
        {expectedDate && (
          <p className="text-muted-foreground mb-6 text-xs">
            Previsão: {expectedDate}
          </p>
        )}
        <Button variant="primary" onClick={() => window.history.back()}>
          Voltar
        </Button>
      </div>
    </ModuleWorkspace>
  );
}
