import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Search, UserRoundSearch } from 'lucide-react';
import { ModuleWorkspace } from '@/components/modules/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/fallback/EmptyState';
import { ErrorState } from '@/components/fallback/ErrorState';
import { RouteLoadingFallback } from '@/components/ui/RouteLoadingFallback';
import { useAuth } from '@/contexts/AuthContext';
import { candidatesRepository } from '@/modules/candidato/repositories/candidates.repository';
import { RH_PERMISSIONS } from '@/modules/rh/permissions';

type Row = { id: string; name: string; email: string; status: string; headline: string };
function fmtStatus(s: string): 'default' | 'secondary' | 'danger' | 'success' { const x=(s||'').toLowerCase(); return ['active','ativo'].includes(x)?'success':['inactive','inativo','archived','blacklisted'].includes(x)?'danger':'secondary'; }

export default function RHCandidatosConsultaPage() {
  const { currentTenantId, hasAnyPermission } = useAuth();
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const canRead = hasAnyPermission([RH_PERMISSIONS.candidatesRead]);

  const load = useCallback(async () => {
    if (!currentTenantId) { setItems([]); setLoading(false); return; }
    if (!canRead) { setError('Permissão candidates.read ausente para consulta de candidatos.'); setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const data = await candidatesRepository.findAll(currentTenantId, { search: search.trim() || undefined, status: status || undefined });
      setItems((data as Array<{ id: string; status?: string; headline?: string | null; person?: { full_name?: string | null; email?: string | null } | null }>).map((c) => ({
        id: c.id, name: c.person?.full_name || c.headline || `Candidato ${c.id.slice(0,8)}`, email: c.person?.email || '—', status: c.status || '—', headline: c.headline || '—',
      })));
    } catch (e) { setError(e instanceof Error ? e.message : 'Erro ao consultar candidatos.'); setItems([]); }
    finally { setLoading(false); }
  }, [currentTenantId, canRead, search, status]);
  useEffect(() => { void load(); }, [load]);

  return (
    <ModuleWorkspace title="Consulta de Candidatos" description="Consulta RH com dados autorizados do tenant. Página proprietária de RH: não reutiliza a tela operacional de Recrutamento." icon={UserRoundSearch}
      breadcrumbItems={[{ label: 'RH', href: '/dashboard/rh' }, { label: 'Candidatos' }]} homeRoute="/dashboard/global"
      actions={<Button variant="outline" size="sm" onClick={() => void load()} leftIcon={<RefreshCw className="h-4 w-4" />}>Atualizar</Button>}>
      <Card className="mb-4 p-4"><div className="grid gap-3 md:grid-cols-[1fr_220px]"><div className="relative"><Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" /><Input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Buscar candidato" className="pl-9" aria-label="Buscar candidatos" /></div><select className="border-input bg-surface h-11 rounded-lg border px-3 text-sm" value={status} onChange={(e)=>setStatus(e.target.value)} aria-label="Status"><option value="">Todos os status</option><option value="active">Ativo</option><option value="inactive">Inativo</option><option value="archived">Arquivado</option></select></div></Card>
      {!currentTenantId ? <Card className="text-muted-foreground p-6 text-sm">Selecione um tenant ativo.</Card>
      : loading ? <RouteLoadingFallback /> : error ? <Card className="p-2"><ErrorState message={error} onRetry={() => void load()} /></Card>
      : items.length === 0 ? <Card className="p-2"><EmptyState title="Nenhum candidato encontrado" description="A consulta retornou vazio para os filtros/fonte autorizada atual." icon={UserRoundSearch} /></Card>
      : <div className="space-y-3">{items.map((item) => <Card key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="font-medium">{item.name}</div><div className="text-muted-foreground text-sm">{item.email}</div><div className="text-muted-foreground mt-1 text-xs">Headline: {item.headline}</div></div><div className="flex items-center gap-2"><Badge variant={fmtStatus(item.status)}>{item.status}</Badge><Button asChild size="sm" variant="outline"><Link to={`/dashboard/recrutamento/candidatos/${item.id}`}>Abrir no Recrutamento</Link></Button></div></Card>)}<p className="text-muted-foreground text-xs">O link abre a operação no domínio Recrutamento (rota proprietária). RH mantém apenas consulta própria nesta página.</p></div>}
    </ModuleWorkspace>
  );
}
