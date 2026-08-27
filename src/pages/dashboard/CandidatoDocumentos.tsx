import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { Plus, Pencil, Trash2, Search, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { candidateDocumentsRepository } from '@/repositories/candidate-documents.repository';
import { candidatesRepository } from '@/repositories/candidates.repository';
import type {
  CandidateDocument,
  CandidateDocumentCreateInput,
  CandidateDocumentUpdateInput,
} from '@/types/domain/candidate';

const DOCUMENT_TYPES = [
  { value: 'cv', label: 'Currículo' },
  { value: 'certificate', label: 'Certificado' },
  { value: 'identity', label: 'Documento de identidade' },
  { value: 'address', label: 'Comprovante de residência' },
  { value: 'other', label: 'Outro' },
] as const;

export default function CandidatoDocumentos() {
  const { currentTenantId, isAdminMaster } = useAuth();
  const [documents, setDocuments] = useState<CandidateDocument[]>([]);
  const [candidates, setCandidates] = useState<
    Array<{ id: string; person?: { full_name?: string } | null }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [candidateFilter, setCandidateFilter] = useState<string>('all');
  const [selected, setSelected] = useState<CandidateDocument | null>(null);
  const [form, setForm] = useState({
    candidate_id: '',
    type: 'cv',
    url: '',
    name: '',
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!currentTenantId) return;

      setIsLoading(true);
      setError(null);

      try {
        const candidatesData =
          await candidatesRepository.findAll(currentTenantId);

        if (!cancelled) {
          setCandidates(
            candidatesData.map((c) => ({
              id: c.id,
              person: c.person,
            })),
          );

          const allDocuments = candidatesData.flatMap((c) => c.documents || []);
          setDocuments(allDocuments);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Erro ao carregar documentos',
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [currentTenantId]);

  const openCreate = () => {
    setSelected(null);
    setForm({
      candidate_id: '',
      type: 'cv',
      url: '',
      name: '',
    });
  };

  const openEdit = (item: CandidateDocument) => {
    setSelected(item);
    setForm({
      candidate_id: item.candidate_id,
      type: item.type,
      url: item.url,
      name: item.name || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenantId) return;

    try {
      const payload:
        CandidateDocumentCreateInput | CandidateDocumentUpdateInput = {
        candidate_id: form.candidate_id,
        type: form.type,
        url: form.url,
        name: form.name || null,
      };

      if (selected) {
        const updated = await candidateDocumentsRepository.update(
          selected.id,
          selected.candidate_id,
          payload as CandidateDocumentUpdateInput,
        );
        setDocuments((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item)),
        );
      } else {
        const created = await candidateDocumentsRepository.create(
          payload as CandidateDocumentCreateInput,
        );
        setDocuments((prev) => [created, ...prev]);
      }

      setSelected(null);
      setForm({
        candidate_id: '',
        type: 'cv',
        url: '',
        name: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar documento');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const item = documents.find((e) => e.id === id);
      if (!item) return;
      await candidateDocumentsRepository.delete(id, item.candidate_id);
      setDocuments((prev) => prev.filter((e) => e.id !== id));
      if (selected?.id === id) {
        setSelected(null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao remover documento',
      );
    }
  };

  const filtered = documents.filter((item) => {
    const text = `${item.type} ${item.name || ''} ${item.url}`.toLowerCase();
    const matchesSearch = !search || text.includes(search.toLowerCase());
    const matchesCandidate =
      candidateFilter === 'all' || item.candidate_id === candidateFilter;
    return matchesSearch && matchesCandidate;
  });

  const candidateLabel = (candidateId: string) => {
    const c = candidates.find((item) => item.id === candidateId);
    return c?.person?.full_name || '—';
  };

  const typeLabel = (type: string) => {
    const opt = DOCUMENT_TYPES.find((o) => o.value === type);
    return opt?.label || type;
  };

  return (
    <ModuleWorkspace
      title="Documentos dos Candidatos"
      description="Gerencie os documentos dos candidatos."
      icon={Search}
      breadcrumbItems={[{ label: 'Documentos' }]}
      actions={
        isAdminMaster ? (
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Novo documento
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 rounded-lg border px-3 py-1.5">
            <Search className="text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por documento..."
              className="bg-transparent text-sm outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="rounded-lg border px-3 py-1.5 text-sm"
            value={candidateFilter}
            onChange={(e) => setCandidateFilter(e.target.value)}
          >
            <option value="all">Todos os candidatos</option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.person?.full_name || 'Sem nome'}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <Card className="p-6">
            <p className="text-destructive">{error}</p>
          </Card>
        )}

        {isLoading ? (
          <Card className="p-6">
            <p className="text-muted-foreground">Carregando documentos...</p>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="p-6">
            <p className="text-muted-foreground">
              Nenhum documento encontrado.
            </p>
          </Card>
        ) : (
          <div className="bg-card border-border overflow-hidden rounded-xl border shadow-sm">
            <table className="divide-border min-w-full divide-y">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Candidato
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Tipo
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Nome
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    URL
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="text-foreground px-4 py-3 text-sm font-medium">
                      {candidateLabel(item.candidate_id)}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {typeLabel(item.type)}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {item.name || '—'}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {item.url.length > 40
                          ? `${item.url.slice(0, 40)}...`
                          : item.url}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Card className="p-6">
          <h3 className="text-foreground mb-4 text-lg font-semibold">
            {selected ? 'Editar documento' : 'Novo documento'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                  Candidato
                </label>
                <select
                  required
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={form.candidate_id}
                  onChange={(e) =>
                    setForm({ ...form, candidate_id: e.target.value })
                  }
                >
                  <option value="">Selecione um candidato</option>
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.person?.full_name || 'Sem nome'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                  Tipo
                </label>
                <select
                  required
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  {DOCUMENT_TYPES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                  URL
                </label>
                <input
                  type="url"
                  required
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                  Nome (opcional)
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" variant="primary" size="sm">
                {selected ? 'Salvar alterações' : 'Criar documento'}
              </Button>
              {selected && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelected(null);
                    setForm({
                      candidate_id: '',
                      type: 'cv',
                      url: '',
                      name: '',
                    });
                  }}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </ModuleWorkspace>
  );
}
