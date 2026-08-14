import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, LogIn, Eye, EyeOff, Briefcase, Building2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SafeImage } from '@/components/ui/SafeImage';
import { SEO } from '@/components/ui/SEO';
import { useAuth } from '@/contexts/AuthContext';
import { COMPANY } from '@/config';
import { IMAGES } from '@/config/images';
import { cn } from '@/utils';
const loginSchema = z.object({
    email: z.string().email('E-mail inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});
export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [profile, setProfile] = useState('admin');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login, isAuthenticated, profile: userProfile, authError } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from
        ?.pathname;
    const { register, handleSubmit, formState: { errors }, } = useForm({
        resolver: zodResolver(loginSchema),
    });
    useEffect(() => {
        if (isAuthenticated) {
            const target = from || getDashboardPath(userProfile?.role);
            navigate(target, { replace: true });
        }
    }, [isAuthenticated, userProfile, navigate, from]);
    const getDashboardPath = (role) => {
        if (role === 'candidato')
            return '/dashboard/candidato';
        if (role === 'empresa')
            return '/dashboard/empresa';
        return '/dashboard';
    };
    const onSubmit = async (data) => {
        setError('');
        setIsSubmitting(true);
        try {
            const result = await login(data.email, data.password);
            if (result.error) {
                setError(result.error);
            }
        }
        finally {
            setIsSubmitting(false);
        }
    };
    useEffect(() => {
        if (authError) {
            setError(authError);
        }
    }, [authError]);
    if (isAuthenticated) {
        return (_jsx("div", { className: "flex min-h-[70vh] items-center justify-center", children: _jsxs(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.5 }, className: "max-w-md text-center", children: [_jsx("div", { className: "bg-success/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full", children: _jsx(Shield, { className: "text-success h-10 w-10" }) }), _jsx("h2", { className: "text-foreground mb-4 text-2xl font-bold", children: "Voc\u00EA j\u00E1 est\u00E1 logado!" }), _jsx("p", { className: "text-muted-foreground mb-8", children: "Redirecionando para o painel..." }), _jsx(Link, { to: getDashboardPath(userProfile?.role), children: _jsx(Button, { variant: "primary", size: "lg", children: "Ir para o Painel" }) })] }) }));
    }
    const profileConfig = {
        admin: {
            title: 'Painel Administrativo',
            subtitle: 'Acesse sua conta para gerenciar cadastros e relatórios.',
            icon: _jsx(Shield, { className: "h-8 w-8" }),
            placeholderEmail: 'admin@exemplo.com',
        },
        candidato: {
            title: 'Área do Candidato',
            subtitle: 'Acesse seu perfil para gerenciar candidaturas e currículos.',
            icon: _jsx(Briefcase, { className: "h-8 w-8" }),
            placeholderEmail: 'candidato@exemplo.com',
        },
        empresa: {
            title: 'Área da Empresa',
            subtitle: 'Publique vagas e acesse sua área de recrutamento.',
            icon: _jsx(Building2, { className: "h-8 w-8" }),
            placeholderEmail: 'empresa@exemplo.com',
        },
    };
    return (_jsxs("div", { className: "relative flex min-h-screen items-center justify-center overflow-hidden", children: [_jsx(SEO, { title: `Entrar — ${COMPANY.name}`, description: `Acesse sua conta na ${COMPANY.name}. Área do candidato, empresa ou administrador.`, keywords: [
                    'login',
                    'acesso',
                    'conta',
                    COMPANY.name,
                    'candidato',
                    'empresa',
                    'administrador',
                ], noindex: true }), _jsx(SafeImage, { src: IMAGES.hero.login.src, fallbackSrc: IMAGES.hero.login.fallback, className: "absolute inset-0 h-full w-full" }), _jsx("div", { className: "bg-background/85 absolute inset-0 backdrop-blur-sm" }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }, className: "relative z-10 w-full max-w-md", children: _jsxs("div", { className: "border-border/40 bg-card shadow-glass rounded-3xl border p-8", children: [_jsx("div", { className: "mb-6 flex justify-center gap-2", children: ['admin', 'candidato', 'empresa'].map((p) => (_jsxs("button", { type: "button", onClick: () => setProfile(p), className: cn('flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200', profile === p
                                    ? 'bg-primary text-primary-foreground shadow-md'
                                    : 'text-muted-foreground hover:bg-muted'), children: [profileConfig[p].icon, p === 'admin'
                                        ? 'Admin'
                                        : p === 'candidato'
                                            ? 'Candidato'
                                            : 'Empresa'] }, p))) }), _jsx(AnimatePresence, { mode: "wait", children: _jsxs(motion.div, { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 10 }, transition: { duration: 0.3 }, children: [_jsxs("div", { className: "mb-8 text-center", children: [_jsx("div", { className: "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl backdrop-blur-sm", children: profile !== 'admin' ? (_jsx("div", { className: "text-primary", children: profileConfig[profile].icon })) : (_jsx("div", { className: "bg-primary/20 text-primary", children: profileConfig[profile].icon })) }), _jsx("h1", { className: "text-foreground text-3xl font-bold", children: profileConfig[profile].title }), _jsx("p", { className: "text-muted-foreground mt-2 text-sm", children: profileConfig[profile].subtitle })] }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-5", children: [error && (_jsx("div", { className: "bg-destructive/10 text-destructive rounded-xl p-4 text-sm", children: error })), _jsx(Input, { label: "E-mail", type: "email", placeholder: profileConfig[profile].placeholderEmail, error: errors.email?.message, ...register('email') }), _jsxs("div", { className: "relative", children: [_jsx(Input, { label: "Senha", type: showPassword ? 'text' : 'password', placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", error: errors.password?.message, ...register('password') }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "text-muted-foreground hover:text-foreground absolute top-9 right-3", "aria-label": showPassword ? 'Ocultar senha' : 'Mostrar senha', children: showPassword ? (_jsx(EyeOff, { className: "h-5 w-5" })) : (_jsx(Eye, { className: "h-5 w-5" })) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", className: "border-input text-primary focus:ring-primary h-4 w-4 rounded" }), _jsx("span", { className: "text-muted-foreground text-sm", children: "Lembrar de mim" })] }), _jsx(Link, { to: "/recuperar-senha", className: "text-primary hover:text-primary/80 text-sm font-medium transition-colors", children: "Esqueceu a senha?" })] }), _jsx(Button, { type: "submit", variant: "primary", size: "xl", className: "w-full", loading: isSubmitting, leftIcon: _jsx(LogIn, { className: "h-5 w-5" }), children: "Entrar" })] }), profile === 'candidato' && (_jsx("div", { className: "mt-4 text-center", children: _jsx(Link, { to: "/cadastro/candidato", className: "text-muted-foreground hover:text-primary text-sm transition-colors", children: "Ainda n\u00E3o tem conta? Cadastre seu curr\u00EDculo" }) })), profile === 'empresa' && (_jsx("div", { className: "mt-4 text-center", children: _jsx(Link, { to: "/cadastro/empresa", className: "text-muted-foreground hover:text-primary text-sm transition-colors", children: "Ainda n\u00E3o tem conta? Publique sua primeira vaga" }) }))] }, profile) }), _jsx("div", { className: "mt-6 text-center", children: _jsx("p", { className: "text-muted-foreground/80 text-xs", children: "\u00C1rea restrita \u2014 Acesso autorizado apenas." }) })] }) })] }));
}
