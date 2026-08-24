import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
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
  hasPermission: (permissionKey: string) => boolean;
  hasAnyPermission: (permissionKeys: string[]) => boolean;
  hasAllPermissions: (permissionKeys: string[]) => boolean;
  resolvePostLoginDestination: () => string;
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
  const initialSessionProcessedRef = useRef(false);
  const isMountedRef = useRef(true);
  const authLoadInFlightRef = useRef(false);

  const loadAuthData = useCallback(async (authUserId: string) => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase || !isMountedRef.current) {
        return;
      }

      console.log('[AUTH:IDENTITY] loadAuthData start', authUserId);

      const { data: personData, error: personError } = await supabase
        .from('people')
        .select('*')
        .eq('auth_user_id', authUserId)
        .maybeSingle();

      console.log('[AUTH:IDENTITY] people loaded', {
        hasPerson: !!personData,
        error: personError?.message ?? null,
      });

      if (personError) throw personError;
      if (!personData) {
        if (isMountedRef.current) {
          setPerson(null);
          setTenantMemberships([]);
          setCurrentTenantId(null);
          setRoles([]);
          setPermissions([]);
          setRoleAssignments([]);
          setIsAdminMaster(false);
        }
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
        .eq('person_id', personData.id);

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
      if (isMountedRef.current) {
        setIsAdminMaster(adminMaster);
      }

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

      console.log('[AUTH:IDENTITY] data loaded', {
        hasPerson: !!personData,
        memberships: membershipData?.length ?? 0,
        roles: rolesData?.length ?? 0,
        permissions: permissionsData.length,
      });

      if (isMountedRef.current) {
        setPerson(personData as Person);
        setTenantMemberships((membershipData || []) as TenantMembership[]);
        setCurrentTenantId(primaryTenantId);
        setRoles((rolesData || []) as Role[]);
        setPermissions(permissionsData);
        setRoleAssignments((roleAssignmentData || []) as RoleAssignment[]);
      }

      console.log('[AUTH:HANDOFF] loadAuthData complete', {
        authenticated: true,
        hasPerson: !!personData,
        hasMembership: (membershipData?.length ?? 0) > 0,
        roleCount: rolesData?.length ?? 0,
        permissionCount: permissionsData.length,
        isAdminMaster: adminMaster,
      });
    } catch (error) {
      console.error('[AUTH:IDENTITY] loadAuthData failed', error);
      if (isMountedRef.current) {
        setPerson(null);
        setTenantMemberships([]);
        setCurrentTenantId(null);
        setRoles([]);
        setPermissions([]);
        setRoleAssignments([]);
        setIsAdminMaster(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    const initAuth = async () => {
      try {
        const supabase = getSupabaseClient();

        if (!supabase) {
          if (isMountedRef.current) {
            setAuthError(
              normalizeError(
                new Error(
                  'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.',
                ),
              ).userMessage,
            );
            setIsLoading(false);
          }
          return;
        }

        console.log('[AUTH] initAuth getSession');
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        console.log('[AUTH] initAuth session:', {
          hasSession: !!initialSession,
          userId: initialSession?.user?.id ?? null,
        });

        if (!isMountedRef.current) return;

        const currentSession = initialSession;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          console.log('[AUTH] initAuth loading identity');
          await loadAuthData(currentSession.user.id);
          initialSessionProcessedRef.current = true;
        }
      } catch (error) {
        console.error('Erro ao inicializar auth:', error);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    const supabase = getSupabaseClient();
    if (!supabase) {
      return () => {
        isMountedRef.current = false;
      };
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMountedRef.current) return;

      setSession(newSession);
      setUser(newSession?.user ?? null);
      setAuthError(null);

      const authEvent = event as string;

      if (
        authEvent === 'SIGNED_IN' &&
        newSession?.user &&
        !initialSessionProcessedRef.current &&
        !authLoadInFlightRef.current
      ) {
        authLoadInFlightRef.current = true;
        await loadAuthData(newSession.user.id);
        initialSessionProcessedRef.current = true;
        authLoadInFlightRef.current = false;
      } else if (
        authEvent === 'SIGNED_OUT' ||
        authEvent === 'SESSION_EXPIRED' ||
        authEvent === 'TOKEN_REFRESH_FAILED'
      ) {
        console.log('[AUTH] onAuthStateChange clear state:', authEvent);
        initialSessionProcessedRef.current = false;
        authLoadInFlightRef.current = false;
        if (isMountedRef.current) {
          setPerson(null);
          setTenantMemberships([]);
          setCurrentTenantId(null);
          setRoles([]);
          setPermissions([]);
          setRoleAssignments([]);
          setIsAdminMaster(false);
          setSession(null);
          setUser(null);
        }
        if (
          authEvent === 'SESSION_EXPIRED' ||
          authEvent === 'TOKEN_REFRESH_FAILED'
        ) {
          setAuthError('Sessão expirada. Faça login novamente.');
        }
      }
    });

    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [loadAuthData]);

  const login = async (
    email: string,
    password: string,
  ): Promise<{ error?: string }> => {
    setAuthError(null);
    setIsLoading(true);
    initialSessionProcessedRef.current = false;
    authLoadInFlightRef.current = false;

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
      console.log('[AUTH:LOGIN] start', { email });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('[AUTH:LOGIN] signIn result', {
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        error: error?.message ?? null,
      });

      if (error) {
        setIsLoading(false);
        return { error: normalizeError(error).userMessage };
      }

      if (data.user) {
        console.log('[AUTH:LOGIN] success — loading identity');
        authLoadInFlightRef.current = true;
        setSession(data.session);
        setUser(data.user);
        await loadAuthData(data.user.id);
        initialSessionProcessedRef.current = true;
        authLoadInFlightRef.current = false;
        console.log('[AUTH:LOGIN] identity loaded');
      }

      return {};
    } catch (error) {
      console.error('[AUTH:LOGIN] exception', error);
      authLoadInFlightRef.current = false;
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
        console.log('[AUTH] logout start');
        await supabase.auth.signOut();
        console.log('[AUTH] logout success');
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

  const hasPermission = useCallback(
    (permissionKey: string): boolean => {
      if (isAdminMaster) return true;
      return permissions.some(
        (p) => `${p.resource}.${p.action}` === permissionKey,
      );
    },
    [permissions, isAdminMaster],
  );

  const hasAnyPermission = useCallback(
    (permissionKeys: string[]): boolean => {
      if (isAdminMaster) return true;
      return permissionKeys.some((key) => hasPermission(key));
    },
    [hasPermission, isAdminMaster],
  );

  const hasAllPermissions = useCallback(
    (permissionKeys: string[]): boolean => {
      if (isAdminMaster) return true;
      return permissionKeys.every((key) => hasPermission(key));
    },
    [hasPermission, isAdminMaster],
  );

  const resolvePostLoginDestination = useCallback((): string => {
    const target = (() => {
      if (isAdminMaster) {
        return '/dashboard';
      }

      if (tenantMemberships.length === 0) {
        return '/onboarding';
      }

      if (
        hasAnyPermission(['jobs.read', 'candidates.read', 'recruitment.read'])
      ) {
        return '/dashboard';
      }

      if (hasAnyPermission(['companies.read'])) {
        return '/dashboard/empresas';
      }

      if (hasAnyPermission(['people.read'])) {
        return '/dashboard/usuarios';
      }

      if (hasAnyPermission(['service_orders.read'])) {
        return '/dashboard/servicos';
      }

      if (hasAnyPermission(['stock_movements.read'])) {
        return '/dashboard/estoque';
      }

      if (hasAnyPermission(['support_tickets.read'])) {
        return '/dashboard/suporte';
      }

      if (hasAnyPermission(['reports.read'])) {
        return '/dashboard/relatorios';
      }

      return '/dashboard';
    })();

    console.log('[AUTH:HANDOFF] resolvePostLoginDestination', {
      isAdminMaster,
      membershipCount: tenantMemberships.length,
      permissionCount: permissions.length,
      destination: target,
    });

    return target;
  }, [isAdminMaster, tenantMemberships, hasAnyPermission, permissions]);

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
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        resolvePostLoginDestination,
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
