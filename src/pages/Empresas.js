import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { staggerReveal, revealUp } from '@/animations/scroll';
import { staggerItem } from '@/animations/fade';
import { PARTNERS_LOGOS } from '@/mock/partners';
import { SafeImage } from '@/components/ui/SafeImage';
import { COMPANY, WHATSAPP_MESSAGES, getWhatsAppUrl } from '@/config';
import { Phone, Building2, Users, MapPin, CheckCircle2, Shield, } from 'lucide-react';
export default function Empresas() {
    return (_jsxs("div", { className: "min-h-screen", children: [_jsx(SEO, { title: `Para Empresas — ${COMPANY.name}`, description: "Solu\u00E7\u00F5es em recrutamento, sele\u00E7\u00E3o, m\u00E3o de obra tempor\u00E1ria e efetiva, terceiriza\u00E7\u00E3o e facilities para empresas.", keywords: [
                    'empresas',
                    'recrutamento',
                    'seleção',
                    'mão de obra temporária',
                    'terceirização',
                    'facilities',
                    'RH',
                    'vagas',
                ], type: "WebSite" }), _jsx(Section, { className: "pt-20 md:pt-28", children: _jsxs(Container, { children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, className: "text-center", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.2 }, className: "bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium", children: [_jsx(Building2, { className: "h-4 w-4" }), _jsx("span", { children: "Para Empresas Parceiras" })] }), _jsx("h1", { className: "text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl", children: "Encontre profissionais qualificados para sua equipe" }), _jsx("p", { className: "text-muted-foreground mx-auto mt-4 max-w-2xl text-lg", children: "Nossa assessoria em RH e solu\u00E7\u00F5es de terceiriza\u00E7\u00E3o conectam empresas aos melhores profissionais do mercado." })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.3 }, className: "mt-8 flex justify-center gap-4", children: [_jsx(Link, { to: "/empresas/divulgar-vaga", children: _jsxs(Button, { variant: "primary", size: "lg", children: [_jsx(Users, { className: "mr-2 h-5 w-5" }), "Divulgar Vaga"] }) }), _jsx(motion.a, { href: getWhatsAppUrl(COMPANY.whatsapp, WHATSAPP_MESSAGES.comercial), target: "_blank", rel: "noopener noreferrer", whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, children: _jsxs(Button, { variant: "outline", size: "lg", children: [_jsx(Phone, { className: "mr-2 h-5 w-5" }), "Falar com um consultor"] }) })] }), _jsx(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: '-100px' }, variants: staggerReveal(0.15), className: "mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4", children: [
                                {
                                    title: 'Recrutamento Ágil',
                                    desc: 'Encontramos os profissionais certos em até 7 dias.',
                                    icon: MapPin,
                                },
                                {
                                    title: 'WhatsApp em Primeiro Lugar',
                                    desc: 'Atendimento e acompanhamento via WhatsApp.',
                                    icon: Phone,
                                },
                                {
                                    title: 'Garantia de Qualidade',
                                    desc: 'Satisfação garantida ou substituímos o profissional.',
                                    icon: CheckCircle2,
                                },
                                {
                                    title: 'Preços transparentes',
                                    desc: 'Orçamento sem custo e sem compromisso.',
                                    icon: Shield,
                                },
                            ].map((item) => (_jsxs(motion.div, { variants: staggerItem('up'), className: "text-center", children: [_jsx("div", { className: "bg-primary/10 text-primary mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl", children: _jsx(item.icon, { className: "h-6 w-6" }) }), _jsx("h3", { className: "text-foreground mb-2 text-lg font-semibold", children: item.title }), _jsx("p", { className: "text-muted-foreground text-sm", children: item.desc })] }, item.title))) }), _jsxs(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: '-100px' }, variants: staggerReveal(0.15), className: "mt-16", children: [_jsx(motion.h2, { variants: revealUp, className: "text-foreground text-center text-3xl font-bold sm:text-4xl", children: "Empresas Parceiras" }), _jsx(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true }, variants: staggerReveal(0.1), className: "mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-6", children: PARTNERS_LOGOS.map((partner) => (_jsxs(motion.div, { variants: staggerItem('up'), whileHover: { scale: 1.05 }, className: "group bg-muted/50 border-border/50 relative overflow-hidden rounded-2xl border", children: [_jsx("div", { className: "relative aspect-[4/3] w-full overflow-hidden", children: _jsx(SafeImage, { src: partner.photo, fallbackSrc: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%232a2a2a'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='16'%3EEmpresa%3C/text%3E%3C/svg%3E", alt: partner.name, className: "h-full w-full object-cover grayscale-[40%] transition-all duration-300 group-hover:grayscale-0" }) }), _jsx("div", { className: "p-3 text-center", children: _jsx("span", { className: "text-foreground text-xs font-semibold", children: partner.name }) })] }, partner.name))) })] })] }) })] }));
}
