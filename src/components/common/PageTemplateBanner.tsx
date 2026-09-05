import { usePageTemplate } from '@/hooks/usePageTemplate';
import { cn } from '@/utils';

export function PageTemplateBanner({
  templateKey,
  fallback,
  className,
}: {
  templateKey: string;
  fallback?: string;
  className?: string;
}) {
  const { data, loading } = usePageTemplate(templateKey);

  if (loading) {
    return (
      <div
        data-template-loading="true"
        className={cn(
          'bg-muted/30 text-muted-foreground rounded-md p-3 text-xs',
          className,
        )}
      >
        Carregando saudacao personalizada...
      </div>
    );
  }

  if (!data.found) {
    if (!fallback) return null;
    return (
      <div
        data-template-fallback="true"
        data-template-key={templateKey}
        className={cn(
          'bg-muted/30 text-foreground rounded-md p-3 text-sm',
          className,
        )}
      >
        {fallback}
      </div>
    );
  }

  return (
    <div
      data-template="true"
      data-template-key={data.key}
      data-missing={data.missing.length > 0 ? data.missing.join(',') : ''}
      className={cn(
        'bg-primary/5 text-foreground rounded-md p-4 text-sm',
        className,
      )}
    >
      {data.resolved}
    </div>
  );
}
