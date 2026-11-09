import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BriefcaseBusiness, RefreshCw, Search } from 'lucide-react';
import { ModuleWorkspace } from '@/components/modules/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/fallback/EmptyState';
import { ErrorState } from '@/components/fallback/ErrorState';
import { RouteLoadingFallback } from '@/components/ui/RouteLoadingFallback';
import { useAuth } from '@/contexts/AuthContext';
import { jobsRepository } from '@/modules/recrutamento/repositories/jobs.repository';
import { RH_PERMISSIONS } from '@/modules/rh/permissions';

type Row = { id: string; title: string; status: string; company?: string; location?: string };
function fmtStatus(s: string): 'default' | 'secondary' | 'danger' | 'success' { const x=(s||'').toLowerCase(); return ['published','open','active'].includes(x)?'success':['cancelled','closed'].includes(x)?'danger':'secondary'; }

export default function RHVagasConsultaPage() {
  const { currentTenantId, hasAnyPermission } = useAuth();
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const canRead = hasAnyPermission([RH_PERMISSIONS.jobsRead]);
  const load = useCallback(async () => {
    if (!currentTenantId) { setItems([]); setLoading(false); return; }
    if (!canRead) { setError('Permissão jobs.read ausente para consulta de vagas.'); setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const result = await jobsRepository.list({ tenant_id: currentTenantId, search: search.trim() || undefined });
      if (result.error) throw result.error;
      setItems((result.data || []).map((j) => ({ id: j.id, title: j.title || 'Vaga', status: j.status || '—', company: j.company_name || undefined, location: [j.city, j.state].filter(Boolean).join('/') || undefined })));
    } catch (e) { setError(e instanceof Error ? e.message : 'Erro ao consultar vagas.'); setItems([]); }
    finally { setLoading(false); }
  }, [currentTenantId, canRead, search]);
  useEffect(() => { void load(); }, [load]);

  return (
    <ModuleWorkspace title="Consulta de Vagas" description="Consulta RH com dados autorizados do tenant. Página proprietária de RH: operação de vagas permanece no domínio Recrutamento." icon={BriefcaseBusiness}
      breadcrumbItems={[{ label: 'RH', href: '/dashboard/rh' }, { label: 'Vagas' }]} homeRoute="/dashboard/global"
      actions={<Button variant="outline" size="sm" onClick={() => void load()} leftIcon={<RefreshCw className="h-4 w-4" />}>Atualizar</Button>}>
      <Card className="mb-4 p-4"><div className="relative"><Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" /><Input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Buscar vaga" className="pl-9" aria-label="Buscar vagas" /></div></Card>
      {!currentTenantId ? <Card className="text-muted-foreground p-6 text-sm">Selecione um tenant ativo.</Card>
      : loading ? <RouteLoadingFallback /> : error ? <Card className="p-2"><ErrorState message={error} onRetry={() => void load()} /></Card>
      : items.length === 0 ? <Card className="p-2"><EmptyState title="Nenhuma vaga encontrada" description="Consulta vazia para os filtros/fonte autorizada atual." icon={BriefcaseBusiness} /></Card>
      : <div className="space-y-3">{items.map((item) => <Card key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="font-medium">{item.title}</div><div className="text-muted-foreground text-sm">{item.company || 'Empresa não informada'}{item.location ? ` · ${item.location}` : ''}</div></div><div className="flex items-center gap-2"><Badge variant={fmtStatus(item.status)}>{item.status}</Badge><Button asChild size="sm" variant="outline"><Link to={`/dashboard/recrutamento/vagas/${item.id}`}>Abrir no Recrutamento</Link></Button></div></Card>)}<p className="text-muted-foreground text-xs">O link abre a operação no domínio Recrutamento (rota proprietária). RH mantém apenas consulta própria nesta página.</p></div>}
    </ModuleWorkspace>
  );
}
