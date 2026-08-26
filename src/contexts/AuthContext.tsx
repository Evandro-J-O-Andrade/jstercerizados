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
import { normalizePermissions } from '@/utils/rbac-normalize';
import type {
  Person,
  TenantMembership,
  Role,
  Permission,
  RoleAssignment,
  FirstLoginState,
  LegalAcceptance,
} from '@/types/auth';

interface AuthContextType {
  user: User | null;
  person: Person | null;
  tenantMemberships: TenantMembership[];
  currentTenantId: string | null;
  tenantIds: string[];
  tenants: { id: string; name: string }[];
  roles: Role[];
  permissions: Permission[];
  roleAssignments: RoleAssignment[];
  firstLoginState: FirstLoginState | null;
  legalAcceptances: LegalAcceptance[];
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
  ) => Promise<{ error?: string; status?: 'success' | 'email_pending' }>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updateProfile: (data: Partial<Person>) => Promise<{ error?: string }>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<{ error?: string; destination?: string }>;
  acceptTerms: (
    documentType: string,
    documentVersion: string,
    metadata?: Record<string, unknown>,
  ) => Promise<{ error?: string }>;
  updateFirstLoginState: (
    updates: Partial<FirstLoginState>,
  ) => Promise<{ error?: string }>;
  hasPermission: (permissionKey: string) => boolean;
  hasAnyPermission: (permissionKeys: string[]) => boolean;
  hasAllPermissions: (permissionKeys: string[]) => boolean;
  switchTenant: (tenantId: string | null) => Promise<void>;
  resolvePostLoginDestination: () => string;
  authError: string | null;
}

const SESSION_PERSIST_KEY = 'jst_session_persist';

function clearSessionPersistence() {
  try {
    sessionStorage.removeItem(SESSION_PERSIST_KEY);
  } catch {
    // ignore
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [person, setPerson] = useState<Person | null>(null);
  const [tenantMemberships, setTenantMemberships] = useState<
    TenantMembership[]
  >([]);
  const [currentTenantId, setCurrentTenantId] = useState<string | null>(null);
  const [tenants, setTenants] = useState<{ id: string; name: string }[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roleAssignments, setRoleAssignments] = useState<RoleAssignment[]>([]);
  const [firstLoginState, setFirstLoginState] =
    useState<FirstLoginState | null>(null);
  const [legalAcceptances, setLegalAcceptances] = useState<LegalAcceptance[]>(
    [],
  );
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
        throw new Error(
          'Identidade não encontrada. Verifique se seu cadastro está completo ou solicite acesso ao administrador.',
        );
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

      let tenantsData: { id: string; name: string }[] = [];
      if (tenantIds.length > 0) {
        const { data: tenantsResult } = await supabase
          .from('tenants')
          .select('id, name')
          .in('id', tenantIds);
        tenantsData = (tenantsResult || []) as { id: string; name: string }[];
      }

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
        (r: Role) => r.scope === 'global' && r.name === 'admin_master',
      );

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

          const normalizedPermissions = normalizePermissions(perms || []);

          permissionsData = normalizedPermissions;
        }
      }

      const { data: firstLoginData } = await supabase
        .from('first_login_state')
        .select('*')
        .eq('person_id', personData.id)
        .maybeSingle();

      const { data: legalAcceptancesData } = await supabase
        .from('legal_acceptances')
        .select('*')
        .eq('person_id', personData.id)
        .order('accepted_at', { ascending: false });

      if (isMountedRef.current) {
        setPerson(personData as Person);
        setTenantMemberships((membershipData || []) as TenantMembership[]);
        setCurrentTenantId(primaryTenantId);
        setTenants(tenantsData);
        setRoles((rolesData || []) as Role[]);
        setPermissions(permissionsData);
        setRoleAssignments((roleAssignmentData || []) as RoleAssignment[]);
        setFirstLoginState((firstLoginData as FirstLoginState) || null);
        setLegalAcceptances((legalAcceptancesData || []) as LegalAcceptance[]);
        setIsAdminMaster(adminMaster);
      }
    } catch (error) {
      console.error('[AUTH:IDENTITY] loadAuthData failed', error);
      if (isMountedRef.current) {
        setPerson(null);
        setTenantMemberships([]);
        setCurrentTenantId(null);
        setRoles([]);
        setPermissions([]);
        setRoleAssignments([]);
        setFirstLoginState(null);
        setLegalAcceptances([]);
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
          setFirstLoginState(null);
          setLegalAcceptances([]);
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

    console.log('[AUTH:DIAGNOSTIC]', {
      hasSupabaseClient: !!supabase,
      hasUrl: !!import.meta.env?.VITE_SUPABASE_URL,
      hasKey: !!import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY,
    });

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
      clearSessionPersistence();
      setUser(null);
      setPerson(null);
      setTenantMemberships([]);
      setCurrentTenantId(null);
      setRoles([]);
      setPermissions([]);
      setRoleAssignments([]);
      setFirstLoginState(null);
      setLegalAcceptances([]);
      setIsAdminMaster(false);
      setSession(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const changePassword = async (
    _currentPassword: string,
    newPassword: string,
  ): Promise<{ error?: string; destination?: string }> => {
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

    if (!user) {
      return { error: 'Usuário não autenticado' };
    }

    try {
      console.log('[AUTH:CHANGE_PASSWORD] iniciando troca de senha', {
        hasSession: !!user,
        userId: user.id,
        newPasswordLength: newPassword.length,
      });

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        const updateMessage =
          updateError?.message || 'Erro ao atualizar senha. Tente novamente.';

        console.error('[AUTH:CHANGE_PASSWORD] atualização de senha falhou', {
          code: updateError?.code || null,
          message: updateMessage,
          status: updateError?.status || null,
          name: updateError?.name || null,
        });

        return {
          error: updateMessage,
        };
      }

      console.log('[AUTH:CHANGE_PASSWORD] updateUser:success');

      if (person) {
        const { error: stateError } = await supabase
          .from('first_login_state')
          .update({
            must_change_password: false,
            updated_at: new Date().toISOString(),
          })
          .eq('person_id', person.id);

        if (stateError) {
          console.error(
            '[AUTH:CHANGE_PASSWORD] first_login_state:update:failed',
            {
              code: stateError.code,
              message: stateError.message,
            },
          );
        } else {
          console.log('[AUTH:CHANGE_PASSWORD] first_login_state:updated');
        }
      }

      if (user) {
        await loadAuthData(user.id);
      }

      console.log('[AUTH:CHANGE_PASSWORD] identity:reloaded');

      const freshPersonId = person?.id || user.id;
      const [{ data: freshFirstLogin }, { data: freshLegalAcceptances }] =
        await Promise.all([
          supabase
            .from('first_login_state')
            .select('*')
            .eq('person_id', freshPersonId)
            .maybeSingle(),
          supabase
            .from('legal_acceptances')
            .select('document_type, document_version, accepted_at')
            .eq('person_id', freshPersonId)
            .order('accepted_at', { ascending: false }),
        ]);

      const mustChangePassword = freshFirstLogin?.must_change_password ?? false;
      const hasAcceptedTerms =
        (freshLegalAcceptances || []).some(
          (a: any) => a.document_type === 'terms',
        ) || freshFirstLogin?.terms_version != null;

      let destination = '/dashboard';
      if (mustChangePassword) {
        destination = '/primeiro-acesso/senha';
      } else if (!hasAcceptedTerms) {
        destination = '/auth/terms';
      } else {
        destination = '/auth/welcome';
      }

      console.log('[AUTH:CHANGE_PASSWORD] destination', {
        mustChangePassword,
        hasAcceptedTerms,
        destination,
      });

      return { destination };
    } catch (error) {
      console.error('[AUTH:CHANGE_PASSWORD] exception', error);
      return {
        error: normalizeError(error).userMessage,
      };
    }
  };

  const acceptTerms = async (
    documentType: string,
    documentVersion: string,
    metadata?: Record<string, unknown>,
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

    if (!user || !person) {
      return { error: 'Usuário não autenticado' };
    }

    try {
      const acceptancePayload: Record<string, unknown> = {
        person_id: person.id,
        tenant_id: currentTenantId,
        document_type: documentType,
        document_version: documentVersion,
        ip: null,
        user_agent:
          typeof navigator !== 'undefined' ? navigator.userAgent : null,
        metadata: metadata || {},
      };

      const { data: acceptanceData, error: acceptanceError } = await supabase
        .from('legal_acceptances')
        .insert(acceptancePayload)
        .select('*')
        .single();

      if (acceptanceError) {
        return { error: normalizeError(acceptanceError).userMessage };
      }

      if (firstLoginState) {
        const updatePayload: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        };

        if (documentType === 'terms') {
          updatePayload.terms_version = documentVersion;
        } else if (documentType === 'privacy') {
          updatePayload.privacy_version = documentVersion;
        } else if (documentType === 'lgpd') {
          updatePayload.lgpd_consent_version = documentVersion;
        }

        const { error: stateError } = await supabase
          .from('first_login_state')
          .update(updatePayload)
          .eq('person_id', person.id);

        if (stateError) {
          console.error('[AUTH] Failed to update first_login_state:', {
            code: stateError.code,
            message: stateError.message,
            details: stateError.details,
            hint: stateError.hint,
          });
        } else {
          setFirstLoginState({
            ...firstLoginState,
            ...updatePayload,
          });
        }
      }

      if (acceptanceData) {
        setLegalAcceptances((prev) => [
          acceptanceData as LegalAcceptance,
          ...prev,
        ]);
      }

      return {};
    } catch (error) {
      return {
        error: normalizeError(error).userMessage,
      };
    }
  };

  const updateFirstLoginState = async (
    updates: Partial<FirstLoginState>,
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

    if (!user || !person) {
      return { error: 'Usuário não autenticado' };
    }

    try {
      const payload: Record<string, unknown> = {
        ...updates,
        person_id: person.id,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from('first_login_state')
        .upsert(payload, { onConflict: 'person_id' });

      if (updateError) {
        console.error('[FIRST_LOGIN_STATE] erro', {
          code: updateError.code,
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
        });
        return { error: normalizeError(updateError).userMessage };
      }

      setFirstLoginState((prev) =>
        prev
          ? { ...prev, ...updates, updated_at: new Date().toISOString() }
          : null,
      );

      return {};
    } catch (error) {
      return {
        error: normalizeError(error).userMessage,
      };
    }
  };

  const hasPermission = useCallback(
    (permissionKey: string): boolean => {
      return permissions.some(
        (p) => `${p.resource}.${p.action}` === permissionKey,
      );
    },
    [permissions],
  );

  const hasAnyPermission = useCallback(
    (permissionKeys: string[]): boolean => {
      return permissionKeys.some((key) => hasPermission(key));
    },
    [hasPermission],
  );

  const hasAllPermissions = useCallback(
    (permissionKeys: string[]): boolean => {
      return permissionKeys.every((key) => hasPermission(key));
    },
    [hasPermission],
  );

  const switchTenant = useCallback(
    async (tenantId: string | null) => {
      if (!user) return;
      setCurrentTenantId(tenantId);
      await loadAuthData(user.id);
    },
    [user, loadAuthData],
  );

  const resolvePostLoginDestination = useCallback((): string => {
    console.log('[AUTH:FLOW] resolvePostLoginDestination', {
      isAdminMaster,
      membershipCount: tenantMemberships.length,
      mustChangePassword: firstLoginState?.must_change_password ?? null,
      firstLoginCompleted: firstLoginState?.first_login_completed ?? null,
      termsVersion: firstLoginState?.terms_version ?? null,
      permissionCount: permissions.length,
    });

    if (tenantMemberships.length === 0) {
      console.log('[AUTH:FLOW] redirect → /onboarding (sem membership)');
      return '/onboarding';
    }

    if (firstLoginState?.must_change_password) {
      console.log(
        '[AUTH:FLOW] redirect → /primeiro-acesso/senha (must_change_password)',
      );
      return '/primeiro-acesso/senha';
    }

    const hasAcceptedTerms =
      legalAcceptances.some((a) => a.document_type === 'terms') ||
      firstLoginState?.terms_version != null;

    if (!hasAcceptedTerms) {
      console.log('[AUTH:FLOW] redirect → /auth/terms (termos pendentes)');
      return '/auth/terms';
    }

    console.log(
      '[AUTH:FLOW] redirect → /auth/welcome (etapa obrigatória pós-login)',
    );
    return '/auth/welcome';
  }, [
    isAdminMaster,
    tenantMemberships,
    firstLoginState,
    legalAcceptances,
    hasAnyPermission,
    permissions,
  ]);

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
  ): Promise<{ error?: string; status?: 'success' | 'email_pending' }> => {
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

      const { error: bootstrapError } = await supabase.rpc(
        'bootstrap_candidate_identity',
        {
          p_auth_user_id: data.user.id,
          p_full_name: profileData.full_name,
          p_email: profileData.email,
          p_phone: profileData.phone ?? null,
          p_tenant_id: profileData.tenantId ?? null,
          p_role_id: profileData.roleId ?? null,
        },
      );

      if (bootstrapError) {
        console.error('[AUTH:REGISTER] bootstrap failed', bootstrapError);
        return {
          error: normalizeError(bootstrapError).userMessage,
        };
      }

      await loadAuthData(data.user.id);

      if (data.user.email_confirmed_at) {
        return { status: 'success' };
      }

      return { status: 'email_pending' };
    } catch (error) {
      console.error('[AUTH:REGISTER] exception', error);
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
        tenants,
        roles,
        permissions,
        roleAssignments,
        firstLoginState,
        legalAcceptances,
        isAdminMaster,
        isAuthenticated: !!user && !!session,
        isLoading,
        login,
        logout,
        register,
        resetPassword,
        updateProfile,
        changePassword,
        acceptTerms,
        updateFirstLoginState,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        switchTenant,
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
