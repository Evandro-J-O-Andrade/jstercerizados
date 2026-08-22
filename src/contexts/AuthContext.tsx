import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { normalizeError } from '@/lib/error-normalizer';
import type {
  Person,
  TenantMembership,
  Role,
  Permission,
  RoleAssignment,
} from '@/types/auth';

interface AuthContextType {
  user: User | null;
  person: Person | null;
  tenantMemberships: TenantMembership[];
  currentTenantId: string | null;
  tenantIds: string[];
  roles: Role[];
  permissions: Permission[];
  roleAssignments: RoleAssignment[];
  isAdminMaster: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  register: (
    email: string,
    password: string,
    profileData: {
      full_name: string;
      email: string;
      phone?: string;
      tenantId?: string;
      roleId?: string;
    },
  ) => Promise<{ error?: string }>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updateProfile: (data: Partial<Person>) => Promise<{ error?: string }>;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [person, setPerson] = useState<Person | null>(null);
  const [tenantMemberships, setTenantMemberships] = useState<
    TenantMembership[]
  >([]);
  const [currentTenantId, setCurrentTenantId] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roleAssignments, setRoleAssignments] = useState<RoleAssignment[]>([]);
  const [isAdminMaster, setIsAdminMaster] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const loadAuthData = useCallback(async (authUserId: string) => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        return;
      }

      const { data: personData, error: personError } = await supabase
        .from('people')
        .select('*')
        .eq('auth_user_id', authUserId)
        .maybeSingle();

      if (personError) throw personError;
      if (!personData) {
        setPerson(null);
        setTenantMemberships([]);
        setCurrentTenantId(null);
        setRoles([]);
        setPermissions([]);
        setRoleAssignments([]);
        setIsAdminMaster(false);
        return;
      }

      const { data: membershipData } = await supabase
        .from('tenant_memberships')
        .select('*')
        .eq('person_id', personData.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      const tenantIds = (membershipData || [])
        .map((m: TenantMembership) => m.tenant_id)
        .filter((id): id is string => Boolean(id));

      const primaryTenantId = tenantIds[0] || null;

      const { data: roleAssignmentData } = await supabase
        .from('role_assignments')
        .select('*')
        .eq('person_id', personData.id)
        .or('expires_at.is.null,expires_at.gt.now()');

      const roleIds = Array.from(
        new Set(
          (roleAssignmentData || [])
            .map((ra: RoleAssignment) => ra.role_id)
            .filter(Boolean),
        ),
      );

      const { data: rolesData } = await supabase
        .from('roles')
        .select('*')
        .in('id', roleIds);

      const adminMaster = (rolesData || []).some(
        (r: Role) => r.scope === 'system' && r.name === 'admin_master',
      );
      setIsAdminMaster(adminMaster);

      let permissionsData: Permission[] = [];
      if (roleIds.length > 0) {
        const { data: rolePerms } = await supabase
          .from('role_permissions')
          .select('permission_id')
          .in('role_id', roleIds);

        const permissionIds = Array.from(
          new Set(
            (rolePerms || [])
              .map((rp: { permission_id: string }) => rp.permission_id)
              .filter(Boolean),
          ),
        );

        if (permissionIds.length > 0) {
          const { data: perms } = await supabase
            .from('permissions')
            .select('*')
            .in('id', permissionIds);
          permissionsData = perms || [];
        }
      }

      setPerson(personData as Person);
      setTenantMemberships((membershipData || []) as TenantMembership[]);
      setCurrentTenantId(primaryTenantId);
      setRoles((rolesData || []) as Role[]);
      setPermissions(permissionsData);
      setRoleAssignments((roleAssignmentData || []) as RoleAssignment[]);
    } catch (error) {
      console.error('Erro ao carregar dados de auth:', error);
      setPerson(null);
      setTenantMemberships([]);
      setCurrentTenantId(null);
      setRoles([]);
      setPermissions([]);
      setRoleAssignments([]);
      setIsAdminMaster(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const supabase = getSupabaseClient();

        if (!supabase) {
          if (isMounted) {
            setAuthError(
              normalizeError(
                new Error(
                  'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.',
                ),
              ).userMessage,
            );
            setIsLoading(false);
          }
          return;
        }

        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        const currentSession = initialSession;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await loadAuthData(currentSession.user.id);
        }
      } catch (error) {
        console.error('Erro ao inicializar auth:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    const supabase = getSupabaseClient();
    if (!supabase) {
      return () => {
        isMounted = false;
      };
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;

      setSession(newSession);
      setUser(newSession?.user ?? null);
      setAuthError(null);

      const authEvent = event as string;

      if (authEvent === 'SIGNED_IN' && newSession?.user) {
        await loadAuthData(newSession.user.id);
      } else if (
        authEvent === 'SIGNED_OUT' ||
        authEvent === 'SESSION_EXPIRED' ||
        authEvent === 'TOKEN_REFRESH_FAILED'
      ) {
        setPerson(null);
        setTenantMemberships([]);
        setCurrentTenantId(null);
        setRoles([]);
        setPermissions([]);
        setRoleAssignments([]);
        setIsAdminMaster(false);
        setSession(null);
        setUser(null);
        if (
          authEvent === 'SESSION_EXPIRED' ||
          authEvent === 'TOKEN_REFRESH_FAILED'
        ) {
          setAuthError('Sessão expirada. Faça login novamente.');
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadAuthData]);

  const login = async (
    email: string,
    password: string,
  ): Promise<{ error?: string }> => {
    setAuthError(null);
    setIsLoading(true);

    const supabase = getSupabaseClient();
    if (!supabase) {
      setIsLoading(false);
      return {
        error: normalizeError(
          new Error(
            'Supabase não configurado. Contate o administrador ou verifique as variáveis de ambiente.',
          ),
        ).userMessage,
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setIsLoading(false);
        return { error: normalizeError(error).userMessage };
      }

      if (data.user) {
        await loadAuthData(data.user.id);
      }

      return {};
    } catch (error) {
      return {
        error: normalizeError(error).userMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
      setUser(null);
      setPerson(null);
      setTenantMemberships([]);
      setCurrentTenantId(null);
      setRoles([]);
      setPermissions([]);
      setRoleAssignments([]);
      setIsAdminMaster(false);
      setSession(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const register = async (
    email: string,
    password: string,
    profileData: {
      full_name: string;
      email: string;
      phone?: string;
      tenantId?: string;
      roleId?: string;
    },
  ): Promise<{ error?: string }> => {
    setAuthError(null);

    const supabase = getSupabaseClient();
    if (!supabase) {
      return {
        error: normalizeError(
          new Error(
            'Supabase não configurado. Contate o administrador ou verifique as variáveis de ambiente.',
          ),
        ).userMessage,
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: profileData.full_name,
            phone: profileData.phone ?? '',
          },
        },
      });

      if (error) {
        return { error: normalizeError(error).userMessage };
      }

      if (!data.user) {
        return { error: 'Erro ao criar conta. Tente novamente.' };
      }

      if (!data.user.email_confirmed_at) {
        return { error: 'Verifique seu e-mail para confirmar a conta.' };
      }

      const { data: personData, error: personError } = await supabase
        .from('people')
        .insert({
          auth_user_id: data.user.id,
          full_name: profileData.full_name,
          email: profileData.email,
          phone: profileData.phone ?? null,
          status: 'active',
        })
        .select('*')
        .single();

      if (personError || !personData) {
        return {
          error: normalizeError(
            personError || new Error('Erro ao criar perfil.'),
          ).userMessage,
        };
      }

      if (profileData.tenantId) {
        const { error: membershipError } = await supabase
          .from('tenant_memberships')
          .insert({
            person_id: personData.id,
            tenant_id: profileData.tenantId,
            role_id: profileData.roleId || null,
            status: 'active',
            joined_at: new Date().toISOString(),
          });

        if (membershipError) {
          return { error: normalizeError(membershipError).userMessage };
        }
      }

      if (profileData.roleId) {
        const { error: assignmentError } = await supabase
          .from('role_assignments')
          .insert({
            role_id: profileData.roleId,
            person_id: personData.id,
            tenant_id: profileData.tenantId || null,
          });

        if (assignmentError) {
          return { error: normalizeError(assignmentError).userMessage };
        }
      }

      await loadAuthData(data.user.id);

      return {};
    } catch (error) {
      return {
        error: normalizeError(error).userMessage,
      };
    }
  };

  const resetPassword = async (email: string): Promise<{ error?: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return {
        error: normalizeError(
          new Error(
            'Supabase não configurado. Contate o administrador ou verifique as variáveis de ambiente.',
          ),
        ).userMessage,
      };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login?reset=true`,
      });

      if (error) {
        return { error: normalizeError(error).userMessage };
      }

      return {};
    } catch (error) {
      return {
        error: normalizeError(error).userMessage,
      };
    }
  };

  const updateProfile = async (
    data: Partial<Person>,
  ): Promise<{ error?: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return {
        error: normalizeError(
          new Error(
            'Supabase não configurado. Contate o administrador ou verifique as variáveis de ambiente.',
          ),
        ).userMessage,
      };
    }

    try {
      if (!user) {
        return { error: 'Usuário não autenticado' };
      }

      const updatePayload: Record<string, unknown> = {};
      if (data.full_name !== undefined)
        updatePayload.full_name = data.full_name;
      if (data.phone !== undefined) updatePayload.phone = data.phone;
      if (data.email !== undefined) updatePayload.email = data.email;

      const { error: updateError } = await supabase
        .from('people')
        .update(updatePayload)
        .eq('auth_user_id', user.id);

      if (updateError) {
        return { error: normalizeError(updateError).userMessage };
      }

      if (person) {
        setPerson({ ...person, ...data } as Person);
      }

      return {};
    } catch (error) {
      return {
        error: normalizeError(error).userMessage,
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        person,
        tenantMemberships,
        currentTenantId,
        tenantIds: tenantMemberships
          .map((m) => m.tenant_id)
          .filter((id): id is string => Boolean(id)),
        roles,
        permissions,
        roleAssignments,
        isAdminMaster,
        isAuthenticated: !!user && !!session,
        isLoading,
        login,
        logout,
        register,
        resetPassword,
        updateProfile,
        authError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
