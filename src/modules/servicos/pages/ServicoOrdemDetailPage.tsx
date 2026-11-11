'use client';

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Edit, Trash2, X, Play, CheckCircle, AlertTriangle, Star, ClipboardList } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { servicesRepository } from '@/repositories/services.repository';
import { useAuth } from '@/contexts/AuthContext';
import type { ServiceOrder } from '@/types/domain/service';

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  scheduled: 'Agendada',
  in_progress: 'Em Andamento',
  on_hold: 'Suspensa',
  completed: 'Concluída',
  cancelled: 'Cancelada',
};

const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200',
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
  in_progress: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200',
  on_hold: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200',
  cancelled: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200',
};

export default function ServicoOrdemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTenantId } = useAuth();
  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [executions, setExecutions] = useState<any[]>([]);
  [executions];
  const [acceptances, setAcceptances] = useState<any[]>([]);
  const [occurrences, setOccurrences] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !currentTenantId) {
      setIsLoading(false);
      return;
    }
    const load = async () => {
      try {
        setIsLoading(true);
        const [orderData, itemsData, historyData, executionsData, acceptancesData, occurrencesData, ratingsData, attachmentsData] = await Promise.all([
          servicesRepository.findOrders(currentTenantId),
          servicesRepository.findOrderItems(currentTenantId, id),
          servicesRepository.findOrderStatusHistory(currentTenantId, id),
          servicesRepository.findExecutions(currentTenantId),
          servicesRepository.findAcceptances(currentTenantId),
          servicesRepository.findOccurrencesByOrder(currentTenantId, id),
          servicesRepository.findRatingsByOrder(currentTenantId, id),
          servicesRepository.findAttachments(currentTenantId, 'service_order', id),
        ]);

        const found = orderData.find((o) => o.id === id);
        if (found) {
          setOrder(found);
          setItems(itemsData);
          setHistory(historyData);
          setExecutions(executionsData.filter((e) => e.service_order_id === id));
          setAcceptances(acceptancesData.filter((a) => a.service_order_id === id));
          setOccurrences(occurrencesData);
          setRatings(ratingsData);
          setAttachments(attachmentsData);
        } else {
          setError('Ordem de serviço não encontrada');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar ordem');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id, currentTenantId]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse rounded-full h-8 w-8 bg-primary"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">{error || 'Ordem não encontrada'}</p>
          <button onClick={() => navigate('/dashboard/servicos/ordens')} className="text-primary mt-4 hover:underline">
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard/servicos/ordens')} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-foreground text-xl font-semibold">{order.title}</h1>
            <p className="text-muted-foreground text-sm">{order.description || 'Sem descrição'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={ORDER_STATUS_COLORS[order.status]}>
            {ORDER_STATUS_LABELS[order.status] ?? order.status}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/servicos/ordens/${id}/editar`)}>
            <Edit className="mr-2 h-4 w-4" /> Editar
          </Button>
          <Button variant="danger" size="sm" onClick={() => { if (window.confirm('Excluir esta ordem?')) { navigate('/dashboard/servicos/ordens'); } }}>
            <Trash2 className="mr-2 h-4 w-4" /> Excluir
          </Button>
        </div>
      </div>

      <Card className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="text-muted-foreground text-[10px] uppercase font-medium">ID</label>
            <p className="text-foreground font-mono text-sm">{order.id}</p>
          </div>
          <div>
            <label className="text-muted-foreground text-[10px] uppercase font-medium">Tenant</label>
            <p className="text-foreground font-mono text-sm">{order.tenant_id}</p>
          </div>
          <div>
            <label className="text-muted-foreground text-[10px] uppercase font-medium">Relacionamento</label>
            <p className="text-foreground text-sm">{order.company_relationship_id || '-'}</p>
          </div>
          <div>
            <label className="text-muted-foreground text-[10px] uppercase font-medium">Quantidade</label>
            <p className="text-foreground text-sm">{order.quantity ?? '-'}</p>
          </div>
          <div>
            <label className="text-muted-foreground text-[10px] uppercase font-medium">Valor</label>
            <p className="text-foreground text-sm font-mono">
              {order.value ? order.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
            </p>
          </div>
          <div>
            <label className="text-muted-foreground text-[10px] uppercase font-medium">Local</label>
            <p className="text-foreground text-sm">{order.location || '-'}</p>
          </div>
          <div className="sm:col-span-2">
            <label className="text-muted-foreground text-[10px] uppercase font-medium">Observações</label>
            <p className="text-foreground text-sm">{order.notes || '-'}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="text-muted-foreground text-[10px] uppercase font-medium">Agendamento</label>
            <p className="text-foreground text-sm">{order.scheduled_at ? new Date(order.scheduled_at).toLocaleString('pt-BR') : '-'}</p>
          </div>
          <div>
            <label className="text-muted-foreground text-[10px] uppercase font-medium">Conclusão</label>
            <p className="text-foreground text-sm">{order.completed_at ? new Date(order.completed_at).toLocaleString('pt-BR') : '-'}</p>
          </div>
          <div>
            <label className="text-muted-foreground text-[10px] uppercase font-medium">Período Início</label>
            <p className="text-foreground text-sm">{order.period_start ? new Date(order.period_start).toLocaleDateString('pt-BR') : '-'}</p>
          </div>
          <div>
            <label className="text-muted-foreground text-[10px] uppercase font-medium">Período Fim</label>
            <p className="text-foreground text-sm">{order.period_end ? new Date(order.period_end).toLocaleDateString('pt-BR') : '-'}</p>
          </div>
          <div>
            <label className="text-muted-foreground text-[10px] uppercase font-medium">Criado em</label>
            <p className="text-foreground text-sm">{new Date(order.created_at).toLocaleString('pt-BR')}</p>
          </div>
          <div>
            <label className="text-muted-foreground text-[10px] uppercase font-medium">Atualizado em</label>
            <p className="text-foreground text-sm">{new Date(order.updated_at).toLocaleString('pt-BR')}</p>
          </div>
        </div>
      </Card>

        <Tabs defaultValue="itens">
          <TabsList className="w-full">
          <TabsTrigger value="itens" className="flex-1">
            <ClipboardList className="mr-2 h-4 w-4" /> Itens
          </TabsTrigger>
          <TabsTrigger value="historico" className="flex-1">
            <FileText className="mr-2 h-4 w-4" /> Histórico
          </TabsTrigger>
          <TabsTrigger value="execucoes" className="flex-1">
            <Play className="mr-2 h-4 w-4" /> Execuções
          </TabsTrigger>
          <TabsTrigger value="aceites" className="flex-1">
            <CheckCircle className="mr-2 h-4 w-4" /> Aceites
          </TabsTrigger>
          <TabsTrigger value="ocorrencias" className="flex-1">
            <AlertTriangle className="mr-2 h-4 w-4" /> Ocorrências
          </TabsTrigger>
          <TabsTrigger value="anexos" className="flex-1">
            <Star className="mr-2 h-4 w-4" /> Anexo
          </TabsTrigger>
          <TabsTrigger value="avaliacoes" className="flex-1">
            <Star className="mr-2 h-4 w-4" /> Avaliações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="itens" className="space-y-4 p-6">
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhum item cadastrado.</div>
          ) : (
            <div className="rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="text-left pb-2 font-medium">Descrição</th>
                    <th className="text-right pb-2 font-medium">Quantidade</th>
                    <th className="text-right pb-2 font-medium">Unitário</th>
                    <th className="text-right pb-2 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="pb-3">{item.description}</td>
                      <td className="text-right pb-3">{item.quantity ?? '-'}</td>
                      <td className="text-right pb-3">{item.unit_value ? item.unit_value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}</td>
                      <td className="text-right pb-3 font-medium">{item.total_value ? item.total_value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="historico" className="space-y-4 p-6">
          {history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Sem histórico de mudanças.</div>
          ) : (
            <div className="rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="text-left pb-2 font-medium">De</th>
                    <th className="text-left pb-2 font-medium">Para</th>
                    <th className="text-left pb-2 font-medium">Alterado por</th>
                    <th className="text-left pb-2 font-medium">Data</th>
                    <th className="text-left pb-2 font-medium">Observações</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id} className="border-b">
                      <td className="pb-3">{h.from_status || '-'}</td>
                      <td className="pb-3">{h.to_status}</td>
                      <td className="pb-3">{h.changed_by || '-'}</td>
                      <td className="pb-3">{new Date(h.changed_at).toLocaleString('pt-BR')}</td>
                      <td className="pb-3">{h.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="execucoes" className="space-y-4 p-6">
          {executions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhuma execução registrada.</div>
          ) : (
            <div className="rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="text-left pb-2 font-medium">Executado por</th>
                    <th className="text-left pb-2 font-medium">Início</th>
                    <th className="text-left pb-2 font-medium">Fim</th>
                    <th className="text-left pb-2 font-medium">Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {executions.map((e) => (
                    <tr key={e.id} className="border-b">
                      <td className="pb-3">{e.executed_by || '-'}</td>
                      <td className="pb-3">{new Date(e.started_at).toLocaleString('pt-BR')}</td>
                      <td className="pb-3">{e.finished_at ? new Date(e.finished_at).toLocaleString('pt-BR') : '-'}</td>
                      <td className="pb-3">{e.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="aceites" className="space-y-4 p-6">
          {acceptances.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhum aceite registrado.</div>
          ) : (
            <div className="rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="text-left pb-2 font-medium">Aceite por</th>
                    <th className="text-left pb-2 font-medium">Data</th>
                    <th className="text-left pb-2 font-medium">Assinatura</th>
                    <th className="text-left pb-2 font-medium">Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {acceptances.map((a) => (
                    <tr key={a.id} className="border-b">
                      <td className="pb-3">{a.accepted_by || '-'}</td>
                      <td className="pb-3">{a.accepted_at ? new Date(a.accepted_at).toLocaleString('pt-BR') : '-'}</td>
                      <td className="pb-3">{a.signature_url ? <a href={a.signature_url} target="_blank" rel="noopener noreferrer" className="text-primary">Ver</a> : '-'}</td>
                      <td className="pb-3">{a.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="ocorrencias" className="space-y-4 p-6">
          {occurrences.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhuma ocorrência registrada.</div>
          ) : (
            <div className="rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="text-left pb-2 font-medium">Título</th>
                    <th className="text-left pb-2 font-medium">Tipo</th>
                    <th className="text-left pb-2 font-medium">Severidade</th>
                    <th className="text-left pb-2 font-medium">Reportado por</th>
                    <th className="text-left pb-2 font-medium">Data</th>
                    <th className="text-left pb-2 font-medium">Resolvido em</th>
                  </tr>
                </thead>
                <tbody>
                  {occurrences.map((o) => (
                    <tr key={o.id} className="border-b">
                      <td className="pb-3">{o.title}</td>
                      <td className="pb-3">{o.type || '-'}</td>
                      <td className="pb-3">{o.severity || '-'}</td>
                      <td className="pb-3">{o.reported_by || '-'}</td>
                      <td className="pb-3">{new Date(o.reported_at).toLocaleString('pt-BR')}</td>
                      <td className="pb-3">{o.resolved_at ? new Date(o.resolved_at).toLocaleString('pt-BR') : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="anexos" className="space-y-4 p-6">
          {attachments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhum anexo enviado.</div>
          ) : (
            <div className="rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="text-left pb-2 font-medium">Arquivo</th>
                    <th className="text-left pb-2 font-medium">Propósito</th>
                    <th className="text-left pb-2 font-medium">Enviado por</th>
                    <th className="text-left pb-2 font-medium">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {attachments.map((a) => (
                    <tr key={a.id} className="border-b">
                      <td className="pb-3">
                        <a href={a.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {a.file_name || 'Arquivo'}
                        </a>
                      </td>
                      <td className="pb-3">{a.purpose || '-'}</td>
                      <td className="pb-3">{a.uploaded_by || '-'}</td>
                      <td className="pb-3">{new Date(a.created_at).toLocaleString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="avaliacoes" className="space-y-4 p-6">
          {ratings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhuma avaliação registrada.</div>
          ) : (
            <div className="rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="text-left pb-2 font-medium">Nota</th>
                    <th className="text-left pb-2 font-medium">Comentário</th>
                    <th className="text-left pb-2 font-medium">Avaliado por</th>
                    <th className="text-left pb-2 font-medium">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {ratings.map((r) => (
                    <tr key={r.id} className="border-b">
                      <td className="pb-3">{r.rating} / 5</td>
                      <td className="pb-3">{r.comment || '-'}</td>
                      <td className="pb-3">{r.rated_by || '-'}</td>
                      <td className="pb-3">{new Date(r.rated_at).toLocaleString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
