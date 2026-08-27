import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { Plus, Pencil, Trash2, Search, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { employeeDocumentsRepository } from '@/repositories/employee-documents.repository';
import { employeesRepository } from '@/repositories/employees.repository';
import type {
  EmployeeDocument,
  EmployeeDocumentCreateInput,
  EmployeeDocumentUpdateInput,
} from '@/types/domain/employee-document';

export default function DocumentosRh() {
  const { currentTenantId, isAdminMaster } = useAuth();
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [employees, setEmployees] = useState<
    Array<{
      id: string;
      job_title?: string | null;
      person?: { full_name?: string } | null;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [selected, setSelected] = useState<EmployeeDocument | null>(null);
  const [form, setForm] = useState({
    employee_id: '',
    document_type: '',
    document_name: '',
    document_url: '',
    issue_date: '',
    expiry_date: '',
    is_verified: false,
    notes: '',
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!currentTenantId) return;

      setIsLoading(true);
      setError(null);

      try {
        const [documentsData, employeesData] = await Promise.all([
          employeeDocumentsRepository.findAll(''),
          employeesRepository.findAll(currentTenantId),
        ]);
        if (!cancelled) {
          setDocuments(documentsData);
          setEmployees(
            employeesData.map((emp) => ({
              id: emp.id,
              job_title: emp.job_title,
              person: emp.person,
            })),
          );
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
      employee_id: '',
      document_type: '',
      document_name: '',
      document_url: '',
      issue_date: '',
      expiry_date: '',
      is_verified: false,
      notes: '',
    });
  };

  const openEdit = (document: EmployeeDocument) => {
    setSelected(document);
    setForm({
      employee_id: document.employee_id,
      document_type: document.document_type,
      document_name: document.document_name,
      document_url: document.document_url,
      issue_date: document.issue_date || '',
      expiry_date: document.expiry_date || '',
      is_verified: document.is_verified,
      notes: document.notes || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenantId) return;

    try {
      const payload: EmployeeDocumentCreateInput | EmployeeDocumentUpdateInput =
        {
          employee_id: form.employee_id,
          document_type: form.document_type,
          document_name: form.document_name,
          document_url: form.document_url,
          issue_date: form.issue_date || null,
          expiry_date: form.expiry_date || null,
          is_verified: form.is_verified,
          notes: form.notes || null,
        };

      if (selected) {
        const updated = await employeeDocumentsRepository.update(
          selected.id,
          selected.employee_id,
          payload as EmployeeDocumentUpdateInput,
        );
        if (updated) {
          setDocuments((prev) =>
            prev.map((doc) => (doc.id === updated.id ? updated : doc)),
          );
        }
      } else {
        const created = await employeeDocumentsRepository.create(
          payload as EmployeeDocumentCreateInput,
        );
        if (created) {
          setDocuments((prev) => [created, ...prev]);
        }
      }

      setSelected(null);
      setForm({
        employee_id: '',
        document_type: '',
        document_name: '',
        document_url: '',
        issue_date: '',
        expiry_date: '',
        is_verified: false,
        notes: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar documento');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const document = documents.find((doc) => doc.id === id);
      if (!document) return;
      await employeeDocumentsRepository.remove(id, document.employee_id);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      if (selected?.id === id) {
        setSelected(null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao remover documento',
      );
    }
  };

  const filtered = documents.filter((doc) => {
    const matchesSearch =
      !search ||
      doc.document_name.toLowerCase().includes(search.toLowerCase()) ||
      doc.document_type.toLowerCase().includes(search.toLowerCase());
    const matchesEmployee =
      employeeFilter === 'all' || doc.employee_id === employeeFilter;
    return matchesSearch && matchesEmployee;
  });

  const employeeLabel = (employeeId: string) => {
    const emp = employees.find((e) => e.id === employeeId);
    const name = emp?.person?.full_name;
    return name || emp?.job_title || '—';
  };

  return (
    <ModuleWorkspace
      title="Documentos"
      description="Gerencie os documentos dos funcionários."
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
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
          >
            <option value="all">Todos os funcionários</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {employeeLabel(emp.id)}
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
                    Funcionário
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Tipo
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Nome
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Validade
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {filtered.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="text-foreground px-4 py-3 text-sm font-medium">
                      {employeeLabel(doc.employee_id)}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {doc.document_type}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      <a
                        href={doc.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:underline"
                      >
                        {doc.document_name}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {doc.expiry_date || '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(doc)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(doc.id)}
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

        {(selected || !selected) && (
          <Card className="p-6">
            <h3 className="text-foreground mb-4 text-lg font-semibold">
              {selected ? 'Editar documento' : 'Novo documento'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Funcionário
                  </label>
                  <select
                    required
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.employee_id}
                    onChange={(e) =>
                      setForm({ ...form, employee_id: e.target.value })
                    }
                  >
                    <option value="">Selecione um funcionário</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {employeeLabel(emp.id)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Tipo
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.document_type}
                    onChange={(e) =>
                      setForm({ ...form, document_type: e.target.value })
                    }
                    placeholder="Ex: RG, CPF, CNH"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Nome
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.document_name}
                    onChange={(e) =>
                      setForm({ ...form, document_name: e.target.value })
                    }
                    placeholder="Ex: RG 123456789"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    URL
                  </label>
                  <input
                    type="url"
                    required
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.document_url}
                    onChange={(e) =>
                      setForm({ ...form, document_url: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Data Emissão
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.issue_date}
                    onChange={(e) =>
                      setForm({ ...form, issue_date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Data Validade
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.expiry_date}
                    onChange={(e) =>
                      setForm({ ...form, expiry_date: e.target.value })
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_verified"
                    checked={form.is_verified}
                    onChange={(e) =>
                      setForm({ ...form, is_verified: e.target.checked })
                    }
                  />
                  <label htmlFor="is_verified" className="text-sm">
                    Verificado
                  </label>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Observações
                  </label>
                  <textarea
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    rows={3}
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                    placeholder="Notas adicionais"
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
                        employee_id: '',
                        document_type: '',
                        document_name: '',
                        document_url: '',
                        issue_date: '',
                        expiry_date: '',
                        is_verified: false,
                        notes: '',
                      });
                    }}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </Card>
        )}
      </div>
    </ModuleWorkspace>
  );
}

