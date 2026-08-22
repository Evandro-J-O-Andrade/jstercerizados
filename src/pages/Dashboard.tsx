import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Users,
  Briefcase,
  FileText,
  TrendingUp,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  LogOut,
} from 'lucide-react';
import type {
  BudgetRequest,
  Partner,
  Supplier,
  Candidate,
} from '@/types/common';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  mockGetBudgets,
  mockDeleteBudget,
  mockGetPartners,
  mockDeletePartner,
  mockGetSuppliers,
  mockDeleteSupplier,
  mockGetCandidates,
  mockDeleteCandidate,
} from '@/services/mock';
import { STATUS_COLORS, type StatusColorKey } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils';
import { normalizeError } from '@/lib/error-normalizer';

type Tab =
  | 'dashboard'
  | 'clientes'
  | 'parceiros'
  | 'fornecedores'
  | 'curriculos'
  | 'vagas'
  | 'usuarios'
  | 'relatorios';

const tabMap: {
  key: Tab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: 'dashboard', label: 'Visão Geral', icon: TrendingUp },
  { key: 'clientes', label: 'Clientes', icon: FileText },
  { key: 'parceiros', label: 'Parceiros', icon: Users },
  { key: 'fornecedores', label: 'Fornecedores', icon: Briefcase },
  { key: 'curriculos', label: 'Currículos', icon: FileText },
  { key: 'vagas', label: 'Vagas', icon: Briefcase },
  { key: 'usuarios', label: 'Usuários', icon: Users },
  { key: 'relatorios', label: 'Relatórios', icon: TrendingUp },
];

const STATUS_VARIANTS: Record<string, StatusColorKey> = {
  new: 'primary',
  contacted: 'warning',
  proposal: 'accent',
  won: 'success',
  lost: 'danger',
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  active: 'success',
  inactive: 'warning',
  received: 'primary',
  review: 'warning',
  interview: 'accent',
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const { roles, logout, authError } = useAuth();
  const navigate = useNavigate();
  const role = roles[0]?.name ?? 'member';

  const budgets = mockGetBudgets();
  const partners = mockGetPartners();
  const suppliers = mockGetSuppliers();
  const candidates = mockGetCandidates();

  const stats = [
    {
      label: 'Orçamentos',
      value: budgets.length,
      icon: FileText,
      color: 'primary' as const,
    },
    {
      label: 'Parceiros',
      value: partners.length,
      icon: Users,
      color: 'success' as const,
    },
    {
      label: 'Fornecedores',
      value: suppliers.length,
      icon: Briefcase,
      color: 'accent' as const,
    },
    {
      label: 'Currículos',
      value: candidates.length,
      icon: FileText,
      color: 'warning' as const,
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  function renderTable() {
    switch (activeTab) {
      case 'clientes':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="px-6 py-3">Nome</th>
                  <th className="px-6 py-3">Empresa</th>
                  <th className="px-6 py-3">Serviço</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Data</th>
                  <th className="px-6 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {budgets.map((b: BudgetRequest) => (
                  <tr key={b.id} className="border-border border-b">
                    <td className="text-foreground px-6 py-4 font-medium">
                      {b.name}
                    </td>
                    <td className="text-muted-foreground px-6 py-4">
                      {b.company}
                    </td>
                    <td className="text-muted-foreground px-6 py-4">
                      {b.service}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          STATUS_COLORS[STATUS_VARIANTS[b.status]],
                        )}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="text-muted-foreground px-6 py-4">
                      {new Date(b.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" aria-label="Ver">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" aria-label="Editar">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => mockDeleteBudget(b.id)}
                          aria-label="Excluir"
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'parceiros':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="px-6 py-3">Empresa</th>
                  <th className="px-6 py-3">CNPJ</th>
                  <th className="px-6 py-3">Responsável</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((p: Partner) => (
                  <tr key={p.id} className="border-border border-b">
                    <td className="text-foreground px-6 py-4 font-medium">
                      {p.company}
                    </td>
                    <td className="text-muted-foreground px-6 py-4">
                      {p.cnpj}
                    </td>
                    <td className="text-muted-foreground px-6 py-4">
                      {p.responsible}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          STATUS_COLORS[STATUS_VARIANTS[p.status]],
                        )}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" aria-label="Ver">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" aria-label="Editar">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => mockDeletePartner(p.id)}
                          aria-label="Excluir"
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'fornecedores':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="px-6 py-3">Empresa</th>
                  <th className="px-6 py-3">Produtos</th>
                  <th className="px-6 py-3">Representante</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((s: Supplier) => (
                  <tr key={s.id} className="border-border border-b">
                    <td className="text-foreground px-6 py-4 font-medium">
                      {s.company}
                    </td>
                    <td className="text-muted-foreground px-6 py-4">
                      {s.products}
                    </td>
                    <td className="text-muted-foreground px-6 py-4">
                      {s.representative}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          STATUS_COLORS[STATUS_VARIANTS[s.status]],
                        )}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" aria-label="Ver">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" aria-label="Editar">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => mockDeleteSupplier(s.id)}
                          aria-label="Excluir"
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'curriculos':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="px-6 py-3">Nome</th>
                  <th className="px-6 py-3">Vaga</th>
                  <th className="px-6 py-3">Cidade</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Data</th>
                  <th className="px-6 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c: Candidate) => (
                  <tr key={c.id} className="border-border border-b">
                    <td className="text-foreground px-6 py-4 font-medium">
                      {c.name}
                    </td>
                    <td className="text-muted-foreground px-6 py-4">
                      {c.position}
                    </td>
                    <td className="text-muted-foreground px-6 py-4">
                      {c.city}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          STATUS_COLORS[STATUS_VARIANTS[c.status]],
                        )}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="text-muted-foreground px-6 py-4">
                      {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" aria-label="Ver">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" aria-label="Editar">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => mockDeleteCandidate(c.id)}
                          aria-label="Excluir"
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return null;
    }
  }

  const isAdminMaster = role === 'admin_master';

  return (
    <div className="min-h-screen">
      {authError && (
        <div className="bg-warning/10 text-warning mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
          <div className="rounded-xl p-4 text-sm">
            {normalizeError(authError).userMessage}
          </div>
        </div>
      )}
      {/* Header */}
      <section className="bg-muted py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="text-primary h-8 w-8" />
              <div>
                <h1 className="text-foreground text-3xl font-bold">
                  {isAdminMaster ? 'Painel Administrativo' : 'Área do Usuário'}
                </h1>
                <p className="text-muted-foreground">
                  {isAdminMaster
                    ? 'Gerencie clientes, parceiros, fornecedores e currículos.'
                    : 'Acompanhe suas informações e atividades.'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<LogOut className="h-4 w-4" />}
              onClick={handleLogout}
            >
              Sair
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card shadow-premium rounded-xl p-6"
            >
              <div
                className={cn(
                  'mb-4 inline-flex items-center justify-center rounded-lg p-3',
                  stat.color === 'primary' && 'bg-primary/10 text-primary',
                  stat.color === 'success' && 'bg-success/10 text-success',
                  stat.color === 'accent' && 'bg-accent/10 text-accent',
                  stat.color === 'warning' && 'bg-warning/10 text-warning',
                )}
              >
                <stat.icon className="h-6 w-6" />
              </div>
              <p className="text-foreground text-2xl font-bold">{stat.value}</p>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tabs */}
      {isAdminMaster && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border-border mb-6 border-b">
            <nav className="flex gap-6 overflow-x-auto" aria-label="Tabs">
              {tabMap.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-colors',
                    activeTab === tab.key
                      ? 'border-primary text-primary'
                      : 'text-muted-foreground hover:text-foreground border-transparent',
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Pesquisar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" leftIcon={<Filter className="h-4 w-4" />}>
              Filtros
            </Button>
            <Button
              variant="outline"
              leftIcon={<Download className="h-4 w-4" />}
            >
              Exportar CSV
            </Button>
          </div>

          {/* Content */}
          <div className="bg-card shadow-premium overflow-hidden rounded-2xl">
            {activeTab === 'dashboard' ? (
              <div className="p-8 text-center">
                <TrendingUp className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <h3 className="text-foreground mb-2 text-lg font-semibold">
                  Visão Geral
                </h3>
                <p className="text-muted-foreground mb-6">
                  Selecione uma aba para visualizar os dados.
                </p>
                <div className="grid grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-surface-alt rounded-lg p-4"
                    >
                      <p className="text-foreground text-2xl font-bold">
                        {stat.value}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6">
                {budgets.length === 0 &&
                partners.length === 0 &&
                suppliers.length === 0 &&
                candidates.length === 0 ? (
                  <div className="py-12 text-center">
                    <FileText className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                    <p className="text-muted-foreground">
                      Nenhum registro encontrado.
                    </p>
                  </div>
                ) : (
                  renderTable()
                )}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
