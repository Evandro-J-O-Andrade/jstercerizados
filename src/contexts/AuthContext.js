import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect, useCallback, } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [session, setSession] = useState(null);
    const [authError, setAuthError] = useState(null);
    const loadProfile = useCallback(async (userId) => {
        try {
            const supabase = getSupabaseClient();
            if (!supabase) {
                return;
            }
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();
            if (error)
                throw error;
            setProfile(data);
        }
        catch (error) {
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
                        setAuthError('Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
                        setIsLoading(false);
                    }
                    return;
                }
                const { data: { session: initialSession }, } = await supabase.auth.getSession();
                if (!isMounted)
                    return;
                const currentSession = initialSession;
                setSession(currentSession);
                setUser(currentSession?.user ?? null);
                if (currentSession?.user) {
                    await loadProfile(currentSession.user.id);
                }
            }
            catch (error) {
                console.error('Erro ao inicializar auth:', error);
            }
            finally {
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
        const { data: { subscription }, } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            if (!isMounted)
                return;
            setSession(newSession);
            setUser(newSession?.user ?? null);
            setAuthError(null);
            const authEvent = event;
            if (authEvent === 'SIGNED_IN' && newSession?.user) {
                await loadProfile(newSession.user.id);
            }
            else if (authEvent === 'SIGNED_OUT' ||
                authEvent === 'SESSION_EXPIRED' ||
                authEvent === 'TOKEN_REFRESH_FAILED') {
                setProfile(null);
                setSession(null);
                setUser(null);
                if (authEvent === 'SESSION_EXPIRED' ||
                    authEvent === 'TOKEN_REFRESH_FAILED') {
                    setAuthError('Sessão expirada. Faça login novamente.');
                }
            }
        });
        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [loadProfile]);
    const login = async (email, password) => {
        setAuthError(null);
        const supabase = getSupabaseClient();
        if (!supabase) {
            return {
                error: 'Supabase não configurado. Contate o administrador ou verifique as variáveis de ambiente.',
            };
        }
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) {
                return { error: error.message };
            }
            if (data.user) {
                await loadProfile(data.user.id);
            }
            return {};
        }
        catch (error) {
            return {
                error: error instanceof Error ? error.message : 'Erro ao fazer login',
            };
        }
    };
    const logout = async () => {
        try {
            const supabase = getSupabaseClient();
            if (supabase) {
                await supabase.auth.signOut();
            }
            setUser(null);
            setProfile(null);
            setSession(null);
        }
        catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };
    const register = async (email, password, profileData) => {
        setAuthError(null);
        const supabase = getSupabaseClient();
        if (!supabase) {
            return {
                error: 'Supabase não configurado. Contate o administrador ou verifique as variáveis de ambiente.',
            };
        }
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });
            if (error) {
                return { error: error.message };
            }
            if (data.user) {
                const { data: profileRow, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', data.user.id)
                    .maybeSingle();
                if (profileError) {
                    console.error('Erro ao buscar perfil:', profileError);
                    setProfile(null);
                }
                else {
                    setProfile(profileRow);
                }
                if (profileRow && !profileError) {
                    if (profileData.role === 'candidato') {
                        await supabase.from('candidates').insert({
                            tenant_id: profileRow.tenant_id,
                            profile_id: data.user.id,
                            name: profileData.full_name,
                            phone: profileData.phone ?? '',
                            email: profileData.email,
                            status: 'new',
                        });
                    }
                    else if (profileData.role === 'empresa') {
                        await supabase.from('companies').insert({
                            tenant_id: profileRow.tenant_id,
                            name: profileData.company_name ?? profileData.full_name,
                            trading_name: profileData.company_name ?? profileData.full_name,
                            phone: profileData.phone ?? '',
                            email: profileData.email,
                            type: 'client',
                            status: 'active',
                        });
                    }
                }
            }
            return {};
        }
        catch (error) {
            return {
                error: error instanceof Error ? error.message : 'Erro ao criar conta',
            };
        }
    };
    const resetPassword = async (email) => {
        const supabase = getSupabaseClient();
        if (!supabase) {
            return {
                error: 'Supabase não configurado. Contate o administrador ou verifique as variáveis de ambiente.',
            };
        }
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/login?reset=true`,
            });
            if (error) {
                return { error: error.message };
            }
            return {};
        }
        catch (error) {
            return {
                error: error instanceof Error
                    ? error.message
                    : 'Erro ao solicitar recuperação de senha',
            };
        }
    };
    const updateProfile = async (data) => {
        const supabase = getSupabaseClient();
        if (!supabase) {
            return {
                error: 'Supabase não configurado. Contate o administrador ou verifique as variáveis de ambiente.',
            };
        }
        try {
            if (!user) {
                return { error: 'Usuário não autenticado' };
            }
            const { error } = await supabase
                .from('profiles')
                .update(data)
                .eq('id', user.id);
            if (error) {
                return { error: error.message };
            }
            setProfile((prev) => (prev ? { ...prev, ...data } : null));
            return {};
        }
        catch (error) {
            return {
                error: error instanceof Error ? error.message : 'Erro ao atualizar perfil',
            };
        }
    };
    return (_jsx(AuthContext.Provider, { value: {
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
        }, children: children }));
}
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return ctx;
}
