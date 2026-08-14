import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { KeyRound, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SafeImage } from '@/components/ui/SafeImage';
import { SEO } from '@/components/ui/SEO';
import { useAuth } from '@/contexts/AuthContext';
import { COMPANY } from '@/config';
import { IMAGES } from '@/config/images';
export default function RecuperarSenha() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { resetPassword } = useAuth();
    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setIsSubmitting(true);
        try {
            const result = await resetPassword(email);
            if (result.error) {
                setError(result.error);
            }
            else {
                setSuccess(true);
            }
        }
        catch {
            setError('Erro ao enviar e-mail de recuperação.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsxs("div", { className: "relative flex min-h-screen items-center justify-center overflow-hidden", children: [_jsx(SEO, { title: `Recuperar senha — ${COMPANY.name}`, description: "Recupere o acesso \u00E0 sua conta.", noindex: true }), _jsx(SafeImage, { src: IMAGES.hero.login.src, fallbackSrc: IMAGES.hero.login.fallback, className: "absolute inset-0 h-full w-full" }), _jsx("div", { className: "bg-background/85 absolute inset-0 backdrop-blur-sm" }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, className: "relative z-10 w-full max-w-md", children: _jsxs("div", { className: "border-border/40 bg-card shadow-glass rounded-3xl border p-8", children: [_jsxs("div", { className: "mb-6 text-center", children: [_jsx("div", { className: "bg-primary/10 text-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl", children: _jsx(KeyRound, { className: "h-8 w-8" }) }), _jsx("h1", { className: "text-foreground text-3xl font-bold", children: "Recuperar senha" }), _jsx("p", { className: "text-muted-foreground mt-2 text-sm", children: "Enviamos um link de recupera\u00E7\u00E3o para seu e-mail." })] }), success ? (_jsx("div", { className: "bg-success/10 text-success rounded-xl p-4 text-center text-sm", children: "Verifique sua caixa de entrada e spam. O link expira em 1 hora." })) : (_jsxs("form", { onSubmit: onSubmit, className: "space-y-5", children: [error && (_jsx("div", { className: "bg-destructive/10 text-destructive rounded-xl p-4 text-sm", children: error })), _jsx(Input, { label: "E-mail", type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "seu@email.com", required: true }), _jsx(Button, { type: "submit", variant: "primary", size: "xl", className: "w-full", loading: isSubmitting, leftIcon: _jsx(KeyRound, { className: "h-5 w-5" }), children: "Enviar link" })] })), _jsx("div", { className: "mt-6 text-center", children: _jsxs(Link, { to: "/login", className: "text-primary hover:text-primary/80 inline-flex items-center gap-1 text-sm font-medium transition-colors", children: [_jsx(ArrowLeft, { className: "h-4 w-4" }), "Voltar para o login"] }) })] }) })] }));
}
