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

interface Profile {
  id?: string;
  auth_user_id?: string;
  full_name: string;
  email: string;
  phone?: string;
  role?: string;
  tenant_id?: string;
  is_admin_master?: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  register: (
    email: string,
    password: string,
    profile: Omit<Profile, 'id'>,
  ) => Promise<{ error?: string }>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error?: string }>;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const loadProfile = useCallback(async (authUserId: string) => {
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
        setProfile(null);
        return;
      }

      const { data: membershipData } = await supabase
        .from('tenant_memberships')
        .select('tenant_id')
        .eq('person_id', personData.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: roleAssignments } = await supabase
        .from('role_assignments')
        .select('role_id, expires_at')
        .eq('person_id', personData.id)
        .or('expires_at.is.null,expires_at.gt.now()');

      const roleIds = Array.from(
        new Set(
          (roleAssignments || []).map((ra: any) => ra.role_id).filter(Boolean),
        ),
      );

      const { data: roles } = await supabase
        .from('roles')
        .select('id, name, is_global')
        .in('id', roleIds);

      // Prioridade: admin_master global primeiro
      const isAdminMaster = (roles || []).some(
        (r: { name: string; is_global: boolean }) =>
          r.name === 'admin_master' && r.is_global === true,
      );

      const primaryRole = isAdminMaster
        ? 'admin_master'
        : (roles || []).find((r: { is_global: boolean }) => !r.is_global)
            ?.name || 'member';

      setProfile({
        id: personData.id,
        auth_user_id: personData.auth_user_id,
        full_name: personData.full_name || '',
        email: personData.email || '',
        phone: personData.phone,
        role: primaryRole,
        tenant_id: membershipData?.tenant_id,
        is_admin_master: isAdminMaster,
      });
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      setProfile(null);
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
          await loadProfile(currentSession.user.id);
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
        await loadProfile(newSession.user.id);
      } else if (
        authEvent === 'SIGNED_OUT' ||
        authEvent === 'SESSION_EXPIRED' ||
        authEvent === 'TOKEN_REFRESH_FAILED'
      ) {
        setProfile(null);
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
  }, [loadProfile]);

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
        await loadProfile(data.user.id);
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
      setProfile(null);
      setSession(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const register = async (
    email: string,
    password: string,
    profileData: Omit<Profile, 'id'>,
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

      // Person creation is handled via DB trigger (002_identity_people_auth)
      // Just wait for auth user to be confirmed
      if (data.user && !data.user.email_confirmed_at) {
        return { error: 'Verifique seu e-mail para confirmar a conta.' };
      }

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
    data: Partial<Profile>,
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

      const { error: updateError } = await supabase
        .from('people')
        .update({
          full_name: data.full_name,
          phone: data.phone,
          email: data.email,
        })
        .eq('auth_user_id', user.id);

      if (updateError) {
        return { error: normalizeError(updateError).userMessage };
      }

      setProfile((prev) => (prev ? { ...prev, ...data } : null));
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
        profile,
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
