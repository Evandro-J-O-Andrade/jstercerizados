import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';
import { useCallback, useEffect, useState } from 'react';
import { ContentBoundary } from '@/components/feedback/ContentBoundary';
import { SEO } from '@/components/ui/SEO';
import { COMPANY } from '@/config';
import { normalizeError } from '@/lib/error-normalizer';

interface NotificationRow {
  id: string;
  title: string;
  message: string;
  read_at: string | null;
  created_at: string;
}

const CANDIDATO_HOME = '/candidato';

export default function CandidateNotificacoes() {
  const { person } = useAuth();
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    const sb = getSupabaseClient();
    if (!sb || !person) return;
    setIsLoading(true);
    setError(null);
    void sb
      .from('notifications')
      .select('id, title, message, read_at, created_at')
      .or(`recipient_person_id.eq.${person.id},user_id.eq.${person.id}`)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data, error: err }) => {
        if (err) setError(normalizeError(err).userMessage);
        setItems((data || []) as NotificationRow[]);
        setIsLoading(false);
      });
  }, [person]);

  useEffect(load, [load]);

  return (
    <>
      <SEO
        title={`Notificações — ${COMPANY.name}`}
        description="Notificações do candidato"
        noindex
      />

      <div className="space-y-6">
        <header>
          <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
            Notificações
          </h1>
          <p className="text-muted-foreground mt-1">
            Atualizações sobre suas candidaturas e conta.
          </p>
        </header>

        <ContentBoundary
          status={
            isLoading ? 'loading' : error ? 'error' : items.length === 0 ? 'empty' : 'success'
          }
          error={error}
          onRetry={load}
          homeRoute={CANDIDATO_HOME}
          emptyTitle="Nenhuma notificação no momento"
          emptyDescription="Você será notificado quando houver novidades."
        >
          <ul className="space-y-3">
            {items.map((n) => (
              <li key={n.id}>
                <Card
                  variant="interactive"
                  hover
                  className={`p-4 ${!n.read_at ? 'border-primary/40 bg-primary/5' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground text-sm font-medium">
                        {n.title || 'Atualização'}
                      </p>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {n.message}
                      </p>
                    </div>
                    <span className="text-muted-foreground shrink-0 text-xs">
                      {new Date(n.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </ContentBoundary>
      </div>
    </>
  );
}
