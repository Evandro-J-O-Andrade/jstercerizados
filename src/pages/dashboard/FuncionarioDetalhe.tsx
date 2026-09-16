import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Briefcase,
  Calendar,
  DollarSign,
  FileText,
} from 'lucide-react';
import { employeesRepository } from '@/repositories/employees.repository';
import { employeeDocumentsRepository } from '@/repositories/employee-documents.repository';
import { useAuth } from '@/contexts/AuthContext';
import type { Employee } from '@/types/domain/employee';
import type { EmployeeDocument } from '@/types/domain/employee-document';

type TabValue = 'overview' | 'documents';

const EMPLOYEE_STATUS = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'terminated', label: 'Desligado' },
  { value: 'suspended', label: 'Suspenso' },
  { value: 'on_leave', label: 'Afastado' },
] as const;

export default function FuncionarioDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTenantId } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabValue>('overview');

  useEffect(() => {
    if (!id || !currentTenantId) return;

    const fetchData = async () => {
      try {
        const [emp, docsData] = await Promise.all([
          employeesRepository.findById(id, currentTenantId),
          employeeDocumentsRepository.findAll(id),
        ]);

        setEmployee(emp);
        setDocuments(docsData);
      } catch (error) {
        console.error('[FuncionarioDetalhe] Falha ao carregar dados', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, currentTenantId]);

  const formatCurrency = (value: number | null) => {
    if (!value) return '—';
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatDate = (value: string | null) => {
    if (!value) return '—';
    return new Date(value + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const getStatusLabel = (value: string) => {
    return EMPLOYEE_STATUS.find((s) => s.value === value)?.label || value;
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Carregando funcionário...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6">
        <p className="text-destructive">Funcionário não encontrado.</p>
      </div>
    );
  }

  const tabs: { value: TabValue; label: string }[] = [
    { value: 'overview', label: 'Visão geral' },
    { value: 'documents', label: 'Documentos' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/funcionarios')}
          className="hover:bg-muted rounded-lg p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-foreground text-xl font-semibold">
            {employee.person?.full_name || 'Funcionário'}
          </h1>
          <p className="text-muted-foreground text-sm">
            Matrícula: {employee.employee_code || '—'}
          </p>
        </div>
      </div>

      <div className="border-border flex gap-2 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? 'border-b-2 border-blue-600 text-blue-700'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="border-border bg-background rounded-xl border p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Status</p>
                <p className="text-foreground text-lg font-semibold">
                  {getStatusLabel(employee.status || '')}
                </p>
              </div>
            </div>
          </div>
          <div className="border-border bg-background rounded-xl border p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-50 p-2 text-yellow-700">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">
                  Data de admissão
                </p>
                <p className="text-foreground text-lg font-semibold">
                  {formatDate(employee.hire_date)}
                </p>
              </div>
            </div>
          </div>
          <div className="border-border bg-background rounded-xl border p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Salário</p>
                <p className="text-foreground text-lg font-semibold">
                  {formatCurrency(employee.salary)}
                </p>
              </div>
            </div>
          </div>
          <div className="border-border bg-background rounded-xl border p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-muted text-foreground rounded-lg p-2">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Matrícula</p>
                <p className="text-foreground text-lg font-semibold">
                  {employee.employee_code || '—'}
                </p>
              </div>
            </div>
          </div>
          <div className="border-border bg-background rounded-xl border p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-50 p-2 text-green-700">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">
                  Data de desligamento
                </p>
                <p className="text-foreground text-lg font-semibold">
                  {formatDate(employee.termination_date)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="space-y-3">
          {documents.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhum documento registrado.
            </p>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="border-border bg-background rounded-lg border p-4"
              >
                <p className="text-foreground font-medium">
                  {doc.document_type}
                </p>
                <p className="text-muted-foreground text-xs">
                  Validade: {doc.expiry_date || '—'}
                </p>
                {doc.file_url && (
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-sm text-blue-600 hover:underline"
                  >
                    Visualizar documento
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
