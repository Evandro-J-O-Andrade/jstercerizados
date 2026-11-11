import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BriefcaseBusiness } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { crmRepository } from '@/modules/crm/repositories';
import type { Lead } from '@/modules/crm/repositories';

const STATUS_LABELS: Record<string, string> = {
  new: 'Novo',
  contacted: 'Contatado',
  proposal: 'Proposta',
  won: 'Ganho',
  lost: 'Perdido',
};

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'danger' | 'success' | 'warning'> = {
  new: 'default',
  contacted: 'secondary',
  proposal: 'default',
  won: 'success',
  lost: 'danger',
};

export default function CrmDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTenantId } = useAuth();
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !currentTenantId) {
      setIsLoading(false);
      return;
    }
    crmRepository.findById(id, currentTenantId)
      .then((data) => { setLead(data); setIsLoading(false); })
      .catch((err) => { setError(err instanceof Error ? err.message : 'Erro ao carregar'); setIsLoading(false); });
  }, [id, currentTenantId]);

  if (isLoading) return (
    <div className="flex h-full items-center justify-center"><div className="animate-pulse rounded-full h-8 w-8 bg-primary"></div></div>
  );
  if (error) return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
      <h2 className="text-foreground font-semibold">Erro ao carregar</h2>
      <p className="text-muted-foreground text-sm">{error}</p>
      <Button variant="outline" onClick={() => navigate('/dashboard/crm/oportunidades')}>Voltar</Button>
    </div>
  );
  if (!lead) return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
      <h2 className="text-foreground font-semibold">Oportunidade não encontrada</h2>
      <Button variant="outline" onClick={() => navigate('/dashboard/crm/oportunidades')}>Voltar à lista</Button>
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-border bg-background/50 border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary rounded-xl p-2"><BriefcaseBusiness className="h-5 w-5" /></div>
            <div>
              <h1 className="text-foreground text-xl font-semibold">{lead.name}</h1>
              <p className="text-muted-foreground text-sm">Oportunidade #{lead.id.slice(0, 8)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/crm/oportunidades')}>Voltar à lista</Button>
            <Button size="sm" onClick={() => navigate(`/dashboard/crm/oportunidades/${lead.id}/editar`)}>Editar</Button>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <div className="p-4">
                <p className="text-muted-foreground text-[10px] uppercase font-medium">Nome</p>
                <p className="text-foreground text-sm font-medium">{lead.name}</p>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <p className="text-muted-foreground text-[10px] uppercase font-medium">E-mail</p>
                <p className="text-foreground text-sm font-medium">{lead.email}</p>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <p className="text-muted-foreground text-[10px] uppercase font-medium">Telefone</p>
                <p className="text-foreground text-sm font-medium">{lead.phone || 'Não informado'}</p>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <div className="p-4">
                <p className="text-muted-foreground text-[10px] uppercase font-medium">Status</p>
                <Badge variant={STATUS_VARIANT[lead.status] ?? 'secondary'} className="w-fit">
                  {STATUS_LABELS[lead.status] || lead.status}
                </Badge>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <p className="text-muted-foreground text-[10px] uppercase font-medium">Criado em</p>
                <p className="text-foreground text-sm font-medium">{new Date(lead.created_at).toLocaleString('pt-BR')}</p>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <p className="text-muted-foreground text-[10px] uppercase font-medium">Atualizado em</p>
                <p className="text-foreground text-sm font-medium">{new Date(lead.updated_at).toLocaleString('pt-BR')}</p>
              </div>
            </Card>
          </div>

          <Card>
            <div className="p-4">
              <p className="text-muted-foreground text-[10px] uppercase font-medium">Mensagem / Observações</p>
              <p className="text-foreground text-sm">{lead.message || 'Sem observações.'}</p>
            </div>
          </Card>

          <Card>
            <div className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase font-medium">Ações rápidas</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/crm/oportunidades/${lead.id}/editar`)}>
                    Editar
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => { if (window.confirm('Excluir esta oportunidade?')) { navigate('/dashboard/crm/oportunidades'); } }}>
                    Excluir
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
