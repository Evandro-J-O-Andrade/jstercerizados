import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { COMPANY } from '@/config';
export default function Candidatos() {
    return (_jsxs("div", { className: "min-h-screen", children: [_jsx(SEO, { title: `Área do Candidato — ${COMPANY.name}`, description: `Cadastre seu currículo, candidate-se às vagas e acompanhe seus processos seletivos na ${COMPANY.name}.`, keywords: [
                    'candidato',
                    'currículo',
                    'vagas',
                    'emprego',
                    'trabalho',
                    'processo seletivo',
                    'RH',
                    'recrutamento',
                ], type: "WebSite" }), _jsx(Section, { className: "pt-24 md:pt-32", children: _jsxs(Container, { children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, className: "text-center", children: [_jsx("h1", { className: "text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl", children: "\u00C1rea do Candidato" }), _jsx("p", { className: "text-muted-foreground mx-auto mt-4 max-w-2xl text-lg", children: "Cadastre seu curr\u00EDculo, candidate-se \u00E0s vagas e acompanhe seus processos seletivos em um s\u00F3 lugar." })] }), _jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.2, duration: 0.6 }, className: "mt-12 grid grid-cols-1 gap-8 md:grid-cols-3", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, className: "border-border bg-card rounded-2xl border p-6 text-center", children: [_jsx("h3", { className: "text-foreground mb-2 text-xl font-bold", children: "Curr\u00EDculo" }), _jsx("p", { className: "text-muted-foreground mb-4 text-sm", children: "Crie e mantenha seu curr\u00EDculo atualizado com experi\u00EAncias, forma\u00E7\u00E3o e habilidades." }), _jsx(Link, { to: "/trabalhe-conosco", children: _jsx(Button, { variant: "outline", size: "sm", children: "Acessar" }) })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3 }, className: "border-border bg-card rounded-2xl border p-6 text-center", children: [_jsx("h3", { className: "text-foreground mb-2 text-xl font-bold", children: "Buscar Vagas" }), _jsx("p", { className: "text-muted-foreground mb-4 text-sm", children: "Encontre oportunidades alinhadas ao seu perfil profissional." }), _jsx(Link, { to: "/vagas", children: _jsx(Button, { variant: "outline", size: "sm", children: "Acessar" }) })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.4 }, className: "border-border bg-card rounded-2xl border p-6 text-center", children: [_jsx("h3", { className: "text-foreground mb-2 text-xl font-bold", children: "Processo Seletivo" }), _jsx("p", { className: "text-muted-foreground mb-4 text-sm", children: "Conhe\u00E7a as etapas do nosso processo e prepare-se para a sua pr\u00F3xima oportunidade." }), _jsx(Link, { to: "/processo-seletivo", children: _jsx(Button, { variant: "outline", size: "sm", children: "Acessar" }) })] })] }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.5, duration: 0.6 }, className: "mt-8 flex justify-center", children: _jsx(Link, { to: "/login", children: _jsx(Button, { variant: "primary", children: "Entrar na sua conta" }) }) })] }) })] }));
}
