import { Card } from '@/components/ui/Card';
import { Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';
import { useEffect, useState } from 'react';
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

export default function CandidateNotificacoes() {
  const { person } = useAuth();
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

        {error && (
          <Card className="border-destructive/40 bg-destructive/5 p-4">
            <p className="text-destructive text-sm">{error}</p>
          </Card>
        )}

        {isLoading ? (
          <p className="text-muted-foreground text-sm">Carregando...</p>
        ) : items.length === 0 ? (
          <Card className="p-8 text-center">
            <Bell className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
            <p className="text-foreground font-medium">
              Nenhuma notificação no momento
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              Você será notificado quando houver novidades.
            </p>
          </Card>
        ) : (
          <ul className="space-y-3">
            {items.map((n) => (
              <li key={n.id}>
                <Card
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
        )}
      </div>
    </>
  );
}
