import { Search, X } from 'lucide-react';
import { cn } from '@/utils';

interface TutorialSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function TutorialSearch({
  value,
  onChange,
  placeholder = 'Busque por modulo, etapa ou palavra-chave...',
  className,
}: TutorialSearchProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-input bg-background focus:ring-primary w-full rounded-md border py-2 pr-9 pl-9 text-sm focus:ring-2 focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
          aria-label="Limpar busca"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
