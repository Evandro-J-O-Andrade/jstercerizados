import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Briefcase, Eye, EyeOff } from 'lucide-react';
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
const candidateSchema = z
    .object({
    full_name: z.string().min(2, 'Nome é obrigatório'),
    email: z.string().email('E-mail inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(6, 'Confirmação de senha é obrigatória'),
    phone: z.string().optional(),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
});
export default function CandidateRegister() {
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { register: registerUser, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isSubmitting }, } = useForm({
        resolver: zodResolver(candidateSchema),
    });
    const onSubmit = async (data) => {
        setError('');
        try {
            const result = await registerUser(data.email, data.password, {
                email: data.email,
                full_name: data.full_name,
                role: 'candidato',
                phone: data.phone,
            });
            if (result.error) {
                setError(result.error);
            }
            else {
                navigate('/dashboard/candidato');
            }
        }
        catch (err) {
            setError('Erro ao criar conta. Tente novamente.');
        }
    };
    if (isAuthenticated) {
        return (_jsx("div", { className: "flex min-h-[70vh] items-center justify-center", children: _jsxs(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, className: "max-w-md text-center", children: [_jsx("h2", { className: "text-foreground mb-4 text-2xl font-bold", children: "Voc\u00EA j\u00E1 est\u00E1 logado!" }), _jsx(Link, { to: "/dashboard/candidato", children: _jsx(Button, { variant: "primary", size: "lg", children: "Ir para o Painel" }) })] }) }));
    }
    return (_jsxs("div", { className: "relative flex min-h-screen items-center justify-center overflow-hidden", children: [_jsx(SEO, { title: `Cadastro de Candidato — ${COMPANY.name}`, description: `Cadastre seu currículo na ${COMPANY.name}.`, noindex: true }), _jsx(SafeImage, { src: IMAGES.hero.login.src, fallbackSrc: IMAGES.hero.login.fallback, className: "absolute inset-0 h-full w-full" }), _jsx("div", { className: "bg-background/85 absolute inset-0 backdrop-blur-sm" }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, className: "relative z-10 w-full max-w-md", children: _jsxs("div", { className: "border-border/40 bg-card shadow-glass rounded-3xl border p-8", children: [_jsxs("div", { className: "mb-6 text-center", children: [_jsx("div", { className: "bg-primary/10 text-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl", children: _jsx(Briefcase, { className: "h-8 w-8" }) }), _jsx("h1", { className: "text-foreground text-3xl font-bold", children: "Cadastro de Candidato" }), _jsx("p", { className: "text-muted-foreground mt-2 text-sm", children: "Crie sua conta e cadastre seu curr\u00EDculo." })] }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-5", children: [error && (_jsx("div", { className: "bg-destructive/10 text-destructive rounded-xl p-4 text-sm", children: error })), _jsx(Input, { label: "Nome completo", error: errors.full_name?.message, ...register('full_name') }), _jsx(Input, { label: "E-mail", type: "email", error: errors.email?.message, ...register('email') }), _jsx(Input, { label: "Telefone", error: errors.phone?.message, ...register('phone') }), _jsxs("div", { className: "relative", children: [_jsx(Input, { label: "Senha", type: showPassword ? 'text' : 'password', error: errors.password?.message, ...register('password') }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "text-muted-foreground hover:text-foreground absolute top-9 right-3", "aria-label": showPassword ? 'Ocultar senha' : 'Mostrar senha', children: showPassword ? (_jsx(EyeOff, { className: "h-5 w-5" })) : (_jsx(Eye, { className: "h-5 w-5" })) })] }), _jsx(Input, { label: "Confirmar senha", type: showPassword ? 'text' : 'password', error: errors.confirmPassword?.message, ...register('confirmPassword') }), _jsx(Button, { type: "submit", variant: "primary", size: "xl", className: "w-full", loading: isSubmitting, leftIcon: _jsx(UserPlus, { className: "h-5 w-5" }), children: "Criar conta" })] }), _jsx("div", { className: "mt-6 text-center", children: _jsxs("p", { className: "text-muted-foreground text-sm", children: ["J\u00E1 tem conta?", ' ', _jsx(Link, { to: "/login", className: "text-primary hover:text-primary/80 font-medium", children: "Entrar" })] }) })] }) })] }));
}
