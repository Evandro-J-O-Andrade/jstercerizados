import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { COMPANY } from '@/config';
export default function Blog() {
    return (_jsxs("div", { className: "min-h-screen", children: [_jsx(SEO, { title: `Blog — ${COMPANY.name}`, description: "Dicas de carreira, tend\u00EAncias de recrutamento, gest\u00E3o de pessoas e muito mais.", keywords: [
                    'blog',
                    'RH',
                    'recrutamento',
                    'seleção',
                    'carreira',
                    'currículo',
                    'entrevista',
                    'gestão de pessoas',
                ], type: "Article" }), _jsx(Section, { className: "pt-24 md:pt-32", children: _jsxs(Container, { children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, className: "text-center", children: [_jsx("h1", { className: "text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl", children: "Blog de RH" }), _jsx("p", { className: "text-muted-foreground mx-auto mt-4 max-w-2xl text-lg", children: "Dicas de carreira, tend\u00EAncias de recrutamento, gest\u00E3o de pessoas e muito mais." })] }), _jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.2, duration: 0.6 }, className: "bg-card border-border mt-12 rounded-3xl border border-dashed p-12 text-center", children: _jsx("p", { className: "text-muted-foreground text-sm", children: "\u00C1rea do blog em desenvolvimento \u2014 Em breve artigos sobre recrutamento, sele\u00E7\u00E3o e carreira." }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3, duration: 0.6 }, className: "mt-8 flex justify-center", children: _jsx(Link, { to: "/contato", children: _jsx(Button, { variant: "primary", children: "Sugest\u00E3o de tema" }) }) })] }) })] }));
}
