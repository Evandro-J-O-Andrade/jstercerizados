import {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useAuth } from '@/contexts/AuthContext';
import { usersRepository } from '@/repositories/users.repository';
import { roleRepository } from '@/repositories/role.repository';
import { roleAssignmentRepository } from '@/repositories/role-assignment.repository';
import { employeesRepository } from '@/repositories/employees.repository';
import { cn } from '@/utils';
import {
  Users,
  Search,
  Pencil,
  Trash2,
  Eye,
  Shield,
  Mail,
  Phone,
  Briefcase,
  UserPlus,
  Monitor,
  LogOut,
  Clock,
} from 'lucide-react';
import type { Person } from '@/types/domain/person';
import type { Role } from '@/types/domain/role';
import type { UserCreateInput, UserUpdateInput } from '@/repositories/users.repository';
import { getSupabaseClient } from '@/lib/supabase';
import { useToast } from '@/components/feedback/ToastContext';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';

interface SessionRow {
  id: string;
  token: string;
  expires_at: string;
  created_at: string;
  ip_address?: string | null;
  user_agent?: string | null;
}

interface UserRowProps {
  user: Person & { current_role?: string | null };
  onEdit: (user: Person) => void;
  onToggleStatus: (user: Person) => void;
  onChangeRole: (user: Person) => void;
  onConvertToEmployee: (user: Person) => void;
  onViewSessions: (user: Person) => void;
  onDelete: (id: string) => void;
}

function UserRow({
  user,
  onEdit,
  onToggleStatus,
  onChangeRole,
  onConvertToEmployee,
  onViewSessions,
  onDelete,
}: UserRowProps) {
  const isActive = user.status === 'active';

  return (
    <tr
      key={user.id}
      className="hover:bg-muted/50 transition-colors border-b border-border/50"
    >
      <td className="px-4 py-3 text-foreground text-sm font-medium">
        {user.full_name}
      </td>
      <td className="px-4 py-3 text-muted-foreground text-sm">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 shrink-0" />
          <span className="truncate">{user.email}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-muted-foreground text-sm">
        {user.phone ? (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 shrink-0" />
            <span>{user.phone}</span>
          </div>
        ) : (
          <span className="text-muted-foreground/50">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
            isActive
              ? 'bg-success/10 text-success border border-success/20'
              : user.status === 'inactive'
                ? 'bg-warning/10 text-warning border border-warning/20'
                : 'bg-muted text-muted-foreground border border-muted/50',
          )}
        >
          {isActive ? 'Ativo' : user.status === 'inactive' ? 'Inativo' : 'Pendente'}
        </span>
      </td>
      <td className="px-4 py-3 text-muted-foreground text-sm">
        {user.current_role || '—'}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onEdit(user)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Editar usuário"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onChangeRole(user)}
            className="text-primary hover:text-primary/90 transition-colors"
            aria-label="Alterar papel"
          >
            <Shield className="h-4 w-4" />
          </button>
          {isActive ? (
            <button
              type="button"
              onClick={() => onToggleStatus(user)}
              className="text-destructive hover:text-destructive/90 transition-colors"
              aria-label="Desativar usuário"
            >
              <Eye className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onToggleStatus(user)}
              className="text-success hover:text-success/90 transition-colors"
              aria-label="Ativar usuário"
            >
              <Shield className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onConvertToEmployee(user)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Converter em funcionário"
          >
            <Briefcase className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewSessions(user)}
            className="text-primary hover:text-primary/90 transition-colors"
            aria-label="Ver sessões ativas"
          >
            <Monitor className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(user.id)}
            className="text-destructive hover:text-destructive/90 transition-colors"
            aria-label="Excluir usuário"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

interface UserFormDialogProps {
  onClose: () => void;
  onSave: (data: UserCreateInput | UserUpdateInput & { id: string }) => Promise<void>;
  editingUser: Person | null;
  isLoading: boolean;
}

function UserFormDialog({
  onClose,
  onSave,
  editingUser,
  isLoading,
}: UserFormDialogProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    document: '',
    city: '',
    state: '',
    status: 'active' as 'active' | 'inactive' | 'pending',
  });

  useEffect(() => {
    if (editingUser) {
      setFormData({
        full_name: editingUser.full_name,
        email: editingUser.email,
        phone: editingUser.phone ?? '',
        document: editingUser.document ?? '',
        city: editingUser.city ?? '',
        state: editingUser.state ?? '',
        status: editingUser.status,
      });
    } else {
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        document: '',
        city: '',
        state: '',
        status: 'active',
      });
    }
  }, [editingUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({ id: editingUser?.id ?? '', ...formData });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card border border-border p-6 rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">
            {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome completo</Label>
            <Input
              type="text"
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              placeholder="Nome completo do usuário"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="usuario@exemplo.com"
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="(11) 99999-9999"
              />
            </div>
            <div className="space-y-2">
              <Label>Documento</Label>
              <Input
                type="text"
                value={formData.document}
                onChange={(e) =>
                  setFormData({ ...formData, document: e.target.value })
                }
                placeholder="CPF/CNPJ"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input
                type="text"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                placeholder="Cidade"
              />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Input
                type="text"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                placeholder="UF"
                maxLength={2}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as 'active' | 'inactive' | 'pending',
                })
              }
              className="rounded-lg border px-3 py-2 text-sm bg-background"
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="pending">Pendente</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {editingUser ? 'Salvar alterações' : 'Criar usuário'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface RoleChangeDialogProps {
  onClose: () => void;
  onSave: (roleId: string, tenantId: string | null) => Promise<void>;
  user: Person;
  roles: Role[];
  isLoading: boolean;
}

function RoleChangeDialog({
  onClose,
  onSave,
  user,
  roles,
  isLoading,
}: RoleChangeDialogProps) {
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoleId) return;
    await onSave(selectedRoleId, selectedTenantId);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card border border-border p-6 rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">
            Alterar Papel — {user.full_name}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Papel (role)</Label>
            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm bg-background"
              required
            >
              <option value="">Selecione um papel</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name} ({role.scope === 'global' ? 'Global' : 'Tenant'})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Tenant (opcional, para papéis de tenant)</Label>
            <select
              value={selectedTenantId ?? ''}
              onChange={(e) =>
                setSelectedTenantId(e.target.value || null)
              }
              className="rounded-lg border px-3 py-2 text-sm bg-background"
            >
              <option value="">Nenhum (global)</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !selectedRoleId}>
              Salvar papel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ConvertToEmployeeDialogProps {
  onClose: () => void;
  onSave: (data: {
    employee_code: string;
    hire_date: string;
    job_title?: string;
    department?: string;
    salary?: number;
  }) => Promise<void>;
  user: Person;
  isLoading: boolean;
}

function ConvertToEmployeeDialog({
  onClose,
  onSave,
  user,
  isLoading,
}: ConvertToEmployeeDialogProps) {
  const [formData, setFormData] = useState({
    employee_code: '',
    hire_date: '',
    job_title: '',
    department: '',
    salary: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      employee_code: formData.employee_code,
      hire_date: formData.hire_date,
      job_title: formData.job_title || undefined,
      department: formData.department || undefined,
      salary: formData.salary ? parseFloat(formData.salary) : undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card border border-border p-6 rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">
            Converter em Funcionário — {user.full_name}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Matrícula do funcionário</Label>
            <Input
              type="text"
              value={formData.employee_code}
              onChange={(e) =>
                setFormData({ ...formData, employee_code: e.target.value })
              }
              placeholder="Ex: EMP-001"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Data de admissão</Label>
            <Input
              type="date"
              value={formData.hire_date}
              onChange={(e) =>
                setFormData({ ...formData, hire_date: e.target.value })
              }
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Cargo</Label>
              <Input
                type="text"
                value={formData.job_title}
                onChange={(e) =>
                  setFormData({ ...formData, job_title: e.target.value })
                }
                placeholder="Ex: Analista de RH"
              />
            </div>
            <div className="space-y-2">
              <Label>Departamento</Label>
              <Input
                type="text"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                placeholder="Ex: Recursos Humanos"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Salário (R$)</Label>
            <Input
              type="number"
              value={formData.salary}
              onChange={(e) =>
                setFormData({ ...formData, salary: e.target.value })
              }
              placeholder="0,00"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !formData.employee_code || !formData.hire_date}>
              Converter
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UserSessionsDialog({
  onClose,
  user,
  isLoading,
  sessions,
  onRevoke,
  revokeConfirm,
}: {
  onClose: () => void;
  user: Person;
  isLoading: boolean;
  sessions: SessionRow[];
  onRevoke: (sessionId: string) => Promise<void>;
  revokeConfirm: string | null;
}) {
  const handleRevoke = async (sessionId: string) => {
    await onRevoke(sessionId);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card border border-border p-6 rounded-xl shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">
            Sessões Ativas — {user.full_name}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-foreground text-sm font-medium">
              {user.email}
            </p>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-success/10 text-success border border-success/20',
              )}
            >
              {sessions.length} sessão(ões) ativa(s)
            </span>
          </div>
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              <Clock className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p>Carregando sessões...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center">
              <Monitor className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">
                Nenhuma sessão ativa encontrada
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      IP / Endereço
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      Dispositivo / User Agent
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      Criada em
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      Expira em
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">
                      Ação
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 text-sm">
                        <span className="text-foreground font-medium">
                          {s.ip_address || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground truncate max-w-xs">
                        {s.user_agent || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(s.created_at).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(s.expires_at).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRevoke(s.id)}
                          disabled={revokeConfirm === s.id}
                          className={cn(
                            'text-destructive hover:text-destructive/90 transition-colors inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium',
                            revokeConfirm === s.id && 'opacity-50',
                          )}
                        >
                          {revokeConfirm === s.id ? (
                            <Clock className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <LogOut className="h-3.5 w-3.5" />
                          )}
                          {revokeConfirm === s.id ? 'Encerrando...' : 'Encerrar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Fechar
            </Button>
          </div>
        </div>
      </div>

      {revokeConfirm && (
        <ConfirmDialog
          open
          title="Encerrar sessão?"
          message="Tem certeza que deseja encerrar esta sessão? O usuário precisará fazer login novamente."
          confirmLabel="Encerrar"
          variant="danger"
          onConfirm={() => {
            // O revoke será tratado pelo onRevoke do pai
          }}
          onCancel={() => {
            // Não faz nada, o estado é gerenciado pelo pai
          }}
        />
      )}
    </div>
  );
}

export default function UsuariosPage() {
  const { isAdminMaster, person, currentTenantId } = useAuth();
  const { addToast } = useToast();
  const [users, setUsers] = useState<(Person & { current_role?: string | null })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Person | null>(null);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [roleUser, setRoleUser] = useState<Person | null>(null);
  const [roleLoading, setRoleLoading] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [convertUser, setConvertUser] = useState<Person | null>(null);
  const [convertLoading, setConvertLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<Person | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [userSessions, setUserSessions] = useState<SessionRow[]>([]);
  const [revokeConfirm, setRevokeConfirm] = useState<string | null>(null);

  const loadUserSessions = useCallback(async (personId: string) => {
    setSessionLoading(true);
    try {
      const supabase = getSupabaseClient();
      if (!supabase) return;
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('person_id', personId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setUserSessions((data || []) as SessionRow[]);
    } catch (err) {
      addToast({
        type: 'error',
        message:
          err instanceof Error ? err.message : 'Erro ao carregar sessões',
      });
    } finally {
      setSessionLoading(false);
    }
  }, [addToast]);

  const handleRevokeSession = useCallback(async (sessionId: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId);
      if (error) throw error;
      setUserSessions((prev) => prev.filter((s) => s.id !== sessionId));
      setRevokeConfirm(null);
      addToast({ type: 'success', message: 'Sessão encerrada com sucesso.' });
    } catch (err) {
      addToast({
        type: 'error',
        message:
          err instanceof Error ? err.message : 'Erro ao encerrar sessão',
      });
      setRevokeConfirm(null);
    }
  }, [addToast]);

  const handleOpenSessions = useCallback((user: Person) => {
    setSessionUser(user);
    setSessionDialogOpen(true);
    void loadUserSessions(user.id);
  }, [loadUserSessions]);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await usersRepository.findAll('');
      const rolesData = await roleRepository.findAll('');
      setRoles(rolesData);

      // Buscar role assignments para cada pessoa
      const usersWithRoles = await Promise.all(
        data.map(async (u) => {
          const assignments = await roleAssignmentRepository.findByPerson(u.id);
          const currentRole = assignments.length > 0
            ? assignments[0].role_id
            : null;
          const roleName = rolesData.find((r) => r.id === currentRole)?.name || null;
          return { ...u, current_role: roleName };
        }),
      );
      setUsers(usersWithRoles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.full_name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || u.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [users, search, statusFilter]);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter((u) => u.status === 'active').length,
    inactive: users.filter((u) => u.status === 'inactive').length,
    pending: users.filter((u) => u.status === 'pending').length,
  }), [users]);

  const handleCreate = useCallback(() => {
    setEditingUser(null);
    setDialogError(null);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((user: Person) => {
    setEditingUser(user);
    setDialogError(null);
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(
    async (data: UserCreateInput | (UserUpdateInput & { id: string })) => {
      setDialogLoading(true);
      setDialogError(null);
      try {
        if (editingUser) {
          await usersRepository.update(editingUser.id, data as UserUpdateInput);
        } else {
          await usersRepository.create(data as UserCreateInput);
        }
        setDialogOpen(false);
        setEditingUser(null);
        await loadUsers();
      } catch (err) {
        setDialogError(
          err instanceof Error ? err.message : 'Erro ao salvar usuário',
        );
      } finally {
        setDialogLoading(false);
      }
    },
    [editingUser, loadUsers],
  );

  const handleToggleStatus = useCallback(
    async (user: Person) => {
      const newStatus: 'active' | 'inactive' =
        user.status === 'active' ? 'inactive' : 'active';
      try {
        await usersRepository.toggleStatus(user.id, newStatus);
        await loadUsers();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : `Erro ao ${newStatus === 'active' ? 'ativar' : 'desativar'} usuário`,
        );
      }
    },
    [loadUsers],
  );

  const handleChangeRole = useCallback(
    async (user: Person) => {
      setRoleUser(user);
      setRoleDialogOpen(true);
    },
    [],
  );

  const handleSaveRole = useCallback(
    async (roleId: string, tenantId: string | null) => {
      setRoleLoading(true);
      try {
        if (!roleUser) return;
        // Remover atribuições existentes para esta pessoa
        const existing = await roleAssignmentRepository.findByPerson(roleUser.id);
        for (const a of existing) {
          await roleAssignmentRepository.removeById(a.id);
        }
        // Inserir nova atribuição
        await roleAssignmentRepository.assign({
          person_id: roleUser.id,
          role_id: roleId,
          tenant_id: tenantId,
          assigned_by: person?.id ?? undefined,
        });
        setRoleDialogOpen(false);
        setRoleUser(null);
        await loadUsers();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Erro ao alterar papel do usuário',
        );
      } finally {
        setRoleLoading(false);
      }
    },
    [roleUser, person, loadUsers],
  );

  const handleConvertToEmployee = useCallback(
    (user: Person) => {
      setConvertUser(user);
      setConvertDialogOpen(true);
    },
    [],
  );

  const handleSaveConvert = useCallback(
    async (data: {
      employee_code: string;
      hire_date: string;
      job_title?: string;
      department?: string;
      salary?: number;
    }) => {
      setConvertLoading(true);
      try {
        if (!convertUser) return;
        await employeesRepository.create({
          tenant_id: currentTenantId || '',
          employee_code: data.employee_code,
          hire_date: data.hire_date,
          status: 'active',
        });
        setConvertDialogOpen(false);
        setConvertUser(null);
        await loadUsers();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Erro ao converter em funcionário',
        );
      } finally {
        setConvertLoading(false);
      }
    },
    [convertUser, loadUsers],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!window.confirm('Tem certeza que deseja excluir este usuário?')) {
        return;
      }
      try {
        await usersRepository.remove(id);
        await loadUsers();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Erro ao excluir usuário',
        );
      }
    },
    [loadUsers],
  );

  const canManage = isAdminMaster;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Configuração de Usuários
          </h1>
          <p className="text-muted-foreground">
            Crie, edite, desative, exclua e defina papéis de usuários do sistema.
          </p>
        </div>
        {canManage && (
          <Button
            onClick={handleCreate}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Novo usuário
          </Button>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Total de usuários
              </p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="text-muted-foreground h-8 w-8">👥</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Ativos
              </p>
              <p className="text-2xl font-bold text-foreground">{stats.active}</p>
            </div>
            <div className="text-muted-foreground h-8 w-8">✅</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Inativos
              </p>
              <p className="text-2xl font-bold text-foreground">{stats.inactive}</p>
            </div>
            <div className="text-muted-foreground h-8 w-8">⏸️</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Pendentes
              </p>
              <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
            </div>
            <div className="text-muted-foreground h-8 w-8">⏳</div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4">
          <div className="flex items-center gap-2 rounded-lg border px-3 py-2 w-full sm:w-auto">
            <Search className="text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar usuário..."
              className="bg-transparent text-sm outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm bg-background"
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
            <option value="pending">Pendente</option>
          </select>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                  E-mail
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                  Telefone
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                  Papel
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center">
                    <p className="text-muted-foreground">
                      Carregando usuários...
                    </p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-destructive text-sm">{error}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={loadUsers}
                      >
                        Tentar novamente
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Users className="h-8 w-8 text-muted-foreground/50" />
                      <p className="text-muted-foreground text-sm">
                        Nenhum usuário encontrado
                      </p>
                      {canManage && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCreate}
                        >
                          Criar primeiro usuário
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onEdit={handleEdit}
                    onToggleStatus={handleToggleStatus}
                    onChangeRole={handleChangeRole}
                    onConvertToEmployee={handleConvertToEmployee}
                    onViewSessions={handleOpenSessions}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {dialogOpen && (
        <UserFormDialog
          onClose={() => setDialogOpen(false)}
          onSave={handleSave}
          editingUser={editingUser}
          isLoading={dialogLoading}
        />
      )}

      {roleDialogOpen && roleUser && (
        <RoleChangeDialog
          onClose={() => setRoleDialogOpen(false)}
          onSave={handleSaveRole}
          user={roleUser}
          roles={roles}
          isLoading={roleLoading}
        />
      )}

      {convertDialogOpen && convertUser && (
        <ConvertToEmployeeDialog
          onClose={() => setConvertDialogOpen(false)}
          onSave={handleSaveConvert}
          user={convertUser}
          isLoading={convertLoading}
        />
      )}

      {sessionDialogOpen && sessionUser && (
        <UserSessionsDialog
          onClose={() => setSessionDialogOpen(false)}
          user={sessionUser}
          isLoading={sessionLoading}
          sessions={userSessions}
          onRevoke={handleRevokeSession}
          revokeConfirm={revokeConfirm}
        />
      )}

      {dialogError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/50 p-4">
          <h3 className="text-sm font-medium text-destructive">
            Erro ao salvar
          </h3>
          <p className="mt-1 text-sm text-destructive">{dialogError}</p>
        </div>
      )}
    </div>
  );
}
