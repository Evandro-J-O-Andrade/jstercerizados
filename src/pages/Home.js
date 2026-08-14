import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Search, Users, Building2, FileText, Briefcase, Zap, CheckCircle2, Heart, ArrowRight, MapPin, Phone, Quote, Wrench, } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/sections/Section';
import { HeroSplit } from '@/components/sections/HeroSplit';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { staggerReveal, revealUp } from '@/animations/scroll';
import { staggerItem } from '@/animations/fade';
import { mockGetVagas } from '@/services/mock/vagas';
import { PARTNERS_LOGOS } from '@/mock/partners';
import { CLIENT_TESTIMONIALS } from '@/mock/clients';
import { COMPANY, WHATSAPP_MESSAGES, getWhatsAppUrl } from '@/config';
import { HERO_SLIDES } from '@/content/homeHero';
const heroSlides = HERO_SLIDES.map((slide) => ({
    id: slide.id,
    image: slide.image,
    alt: slide.imageAlt,
    eyebrow: (_jsxs("span", { className: "flex items-center gap-2", children: [_jsx(slide.eyebrowIcon, { className: "h-4 w-4" }), slide.eyebrow] })),
    title: slide.title,
    description: slide.description,
    cta: (_jsxs(_Fragment, { children: [_jsx(Link, { to: slide.primaryCta.href, children: _jsxs(Button, { variant: "secondary", size: "xl", className: "shadow-glow-lg h-14 rounded-[18px] px-8 py-4 text-base motion-safe:duration-300", children: [slide.primaryCta.label, _jsx(ArrowRight, { className: "ml-2 h-5 w-5" })] }) }), _jsx(Link, { to: slide.secondaryCta.href, children: _jsxs(Button, { variant: "outline", size: "xl", className: "border-border/30 text-foreground hover:bg-muted h-14 rounded-[18px] px-8 py-4 text-base backdrop-blur motion-safe:duration-300", children: [slide.secondaryCta.label, _jsx(ArrowRight, { className: "ml-2 h-5 w-5" })] }) }), _jsxs("div", { className: "text-muted-foreground mt-6 flex flex-col gap-3 text-sm", children: [_jsx("span", { children: "Est\u00E1 procurando uma oportunidade?" }), _jsx(Link, { to: slide.candidateCta.href, children: _jsxs(Button, { variant: "ghost", size: "sm", children: [slide.candidateCta.label, _jsx(ArrowRight, { className: "ml-1 h-4 w-4" })] }) })] })] })),
}));
const steps = [
    {
        step: '01',
        title: 'Cadastre seu currículo',
        description: 'Preencha seus dados em poucos minutos.',
    },
    {
        step: '02',
        title: 'Candidate-se',
        description: 'Escolha as vagas que combinam com seu perfil.',
    },
    {
        step: '03',
        title: 'Processo Seletivo',
        description: 'Nossa equipe entra em contato quando houver compatibilidade.',
    },
    {
        step: '04',
        title: 'Contratação',
        description: 'Você inicia sua nova oportunidade.',
    },
];
const blogPosts = [
    {
        title: 'Como fazer um currículo vencedor',
        href: '/blog',
        category: 'Carreira',
        date: '2026-07-15',
    },
    {
        title: 'Como se preparar para entrevistas',
        href: '/blog',
        category: 'Entrevista',
        date: '2026-07-10',
    },
    {
        title: 'Tendências do mercado de trabalho',
        href: '/blog',
        category: 'Mercado',
        date: '2026-07-05',
    },
    {
        title: 'Dicas para conquistar seu primeiro emprego',
        href: '/blog',
        category: 'Carreira',
        date: '2026-06-28',
    },
];
const differentials = [
    {
        title: 'Atendimento rápido',
        description: 'Respostas ágeis para candidatos e empresas, sem burocracia.',
        icon: Zap,
    },
    {
        title: 'Empresas parceiras',
        description: 'Rede de empresas confiantes que contratam pela J&S.',
        icon: Building2,
    },
    {
        title: 'Equipe especializada em RH',
        description: 'Profissionais com experiência em recrutamento e seleção.',
        icon: Users,
    },
    {
        title: 'Processos seletivos eficientes',
        description: 'Metodologia rápida e humanizada para reduzir o tempo de contratação.',
        icon: CheckCircle2,
    },
    {
        title: 'Atendimento humanizado',
        description: 'Acompanhamento próximo para candidatos e empresas.',
        icon: Heart,
    },
    {
        title: 'Experiência em terceirização e facilities',
        description: 'Soluções operacionais integradas com conformidade total.',
        icon: Briefcase,
    },
];
const empresaSolutions = [
    {
        title: 'Mão de Obra Temporária',
        description: 'Profissionais qualificados para demandas sazonais ou projetos específicos.',
        href: '/servicos/mao-de-obra-temporaria',
        icon: Users,
        highlight: true,
    },
    {
        title: 'Mão de Obra Efetiva',
        description: 'Contratação de profissionais permanentes com seleção completa e acompanhamento.',
        href: '/servicos/mao-de-obra-efetiva',
        icon: Users,
        highlight: true,
    },
    {
        title: 'Assessoria em RH',
        description: 'Profissional de RH dedicado para recrutamento, gestão e consultoria estratégica.',
        href: '/servicos/assessoria-rh',
        icon: Shield,
    },
    {
        title: 'Recrutamento e Seleção',
        description: 'Encontramos o profissional certo para sua empresa com agilidade e assertividade.',
        href: '/servicos/recrutamento-selecao',
        icon: Search,
    },
    {
        title: 'Processo de RH',
        description: 'Estruturamos todo o processo de recrutamento e seleção da sua empresa.',
        href: '/servicos/processo-de-rh',
        icon: Shield,
    },
    {
        title: 'Banco de Talentos',
        description: 'Cadastre seu currículo e seja encontrado por empresas parceiras.',
        href: '/trabalhe-conosco',
        icon: Users,
    },
];
const facilitiesSolutions = [
    {
        title: 'Limpeza',
        description: 'Limpeza profissional com produtos ecológicos e equipe treinada para sua empresa.',
        href: '/servicos/limpeza',
        icon: FileText,
    },
    {
        title: 'Faxina diarista',
        description: 'Serviço de faxina residencial e comercial com limpeza profunda e organização.',
        href: '/servicos/faxina-diarista',
        icon: FileText,
    },
    {
        title: 'Controlador de acesso',
        description: 'Portaria 24h, recepção e controle de fluxo de pessoas para sua empresa ou condomínio.',
        href: '/servicos/controle-acesso',
        icon: Shield,
    },
    {
        title: 'Portaria',
        description: 'Equipe qualificada para recepção, portaria e segurança do seu local.',
        href: '/servicos/portaria',
        icon: Users,
    },
    {
        title: 'Zeladoria',
        description: 'Manutenção preventiva e conservação de instalações para condomínios e empresas.',
        href: '/servicos/zeladoria-manutencao',
        icon: Wrench,
    },
    {
        title: 'Jardinagem',
        description: 'Manutenção e conservação de áreas verdes com qualidade e profissionalismo.',
        href: '/servicos/jardinagem',
        icon: Heart,
    },
    {
        title: 'Recepção',
        description: 'Equipe qualificada para recepção, atendimento e segurança do seu local.',
        href: '/servicos/portaria',
        icon: Users,
    },
];
export default function Home() {
    const destaques = mockGetVagas().slice(0, 4);
    return (_jsxs("div", { children: [_jsx(SEO, { title: `${COMPANY.name} — Assessoria em RH, Recrutamento, Seleção e Banco de Talentos`, description: COMPANY.tagline +
                    ' Assessoria em RH, recrutamento, mão de obra temporária e efetiva, seleção, banco de talentos e facilities.', keywords: [
                    'assessoria em RH',
                    'recrutamento',
                    'seleção de pessoas',
                    'mão de obra temporária',
                    'mão de obra efetiva',
                    'banco de talentos',
                    'processo de RH',
                    'terceirização',
                    'facilities',
                    'limpeza',
                    'jardinagem',
                    'portaria',
                    'vagas de emprego',
                    COMPANY.name,
                ], type: "WebSite" }), _jsx(HeroSplit, { slides: heroSlides, interval: 6000 }), _jsx(Section, { className: "bg-surface-alt", children: _jsxs(Container, { children: [_jsxs(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: '-100px' }, variants: staggerReveal(0.2), className: "mb-12 text-center", children: [_jsx(motion.h2, { variants: revealUp, className: "text-foreground text-3xl font-bold sm:text-4xl", children: "Solu\u00E7\u00F5es para sua empresa" }), _jsx(motion.p, { variants: revealUp, className: "text-muted-foreground mx-auto mt-4 max-w-2xl text-lg", children: "Assessoria em RH, recrutamento, m\u00E3o de obra tempor\u00E1ria, terceiriza\u00E7\u00E3o e facilities para sua empresa." })] }), _jsx(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true }, variants: staggerReveal(0.1), className: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3", children: empresaSolutions.map((solution) => (_jsxs(motion.div, { variants: staggerItem('up'), className: "bg-card border-border hover:border-primary/30 rounded-2xl border p-6 transition-all duration-300", children: [_jsx("div", { className: "bg-primary/10 text-primary mb-4 flex h-12 w-12 items-center justify-center rounded-full", children: _jsx(solution.icon, { className: "h-6 w-6" }) }), _jsx("h3", { className: "text-foreground mb-2 text-lg font-semibold", children: solution.title }), _jsx("p", { className: "text-muted-foreground mb-4 text-sm leading-relaxed", children: solution.description }), _jsx(Link, { to: solution.href, children: _jsxs(Button, { variant: "outline", size: "sm", className: "w-full", children: ["Saiba mais", _jsx(ArrowRight, { className: "ml-2 h-4 w-4" })] }) })] }, solution.title))) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, className: "mt-10 text-center", children: _jsx(Link, { to: "/empresas", children: _jsxs(Button, { variant: "secondary", size: "lg", children: ["Solicitar Or\u00E7amento", _jsx(ArrowRight, { className: "ml-2 h-5 w-5" })] }) }) })] }) }), _jsx(Section, { children: _jsxs(Container, { children: [_jsxs(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: '-100px' }, variants: staggerReveal(0.2), className: "mb-12 text-center", children: [_jsx(motion.h2, { variants: revealUp, className: "text-foreground text-3xl font-bold sm:text-4xl", children: "Solu\u00E7\u00F5es em Facilities" }), _jsx(motion.p, { variants: revealUp, className: "text-muted-foreground mx-auto mt-4 max-w-2xl text-lg", children: "Limpeza, controle de acesso, jardinagem e recep\u00E7\u00E3o. Servi\u00E7os operacionais integrados para sua empresa." })] }), _jsx(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true }, variants: staggerReveal(0.1), className: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4", children: facilitiesSolutions.map((solution) => (_jsxs(motion.div, { variants: staggerItem('up'), className: "bg-card border-border hover:border-primary/30 rounded-2xl border p-6 text-center transition-all duration-300", children: [_jsx("div", { className: "bg-primary/10 text-primary mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full", children: _jsx(solution.icon, { className: "h-6 w-6" }) }), _jsx("h3", { className: "text-foreground mb-2 text-lg font-semibold", children: solution.title }), _jsx("p", { className: "text-muted-foreground mb-4 text-sm leading-relaxed", children: solution.description }), _jsx(Link, { to: solution.href, children: _jsxs(Button, { variant: "outline", size: "sm", className: "w-full", children: ["Saiba mais", _jsx(ArrowRight, { className: "ml-2 h-4 w-4" })] }) })] }, solution.title))) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, className: "mt-10 text-center", children: _jsx(Link, { to: "/servicos", children: _jsxs(Button, { variant: "secondary", size: "lg", children: ["Conhe\u00E7a nossas solu\u00E7\u00F5es", _jsx(ArrowRight, { className: "ml-2 h-5 w-5" })] }) }) })] }) }), _jsx(Section, { className: "bg-surface-alt", children: _jsxs(Container, { children: [_jsxs(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: '-100px' }, variants: staggerReveal(0.2), className: "mb-12 text-center", children: [_jsx(motion.h2, { variants: revealUp, className: "text-foreground text-3xl font-bold sm:text-4xl", children: "Para Candidatos" }), _jsx(motion.p, { variants: revealUp, className: "text-muted-foreground mx-auto mt-4 max-w-2xl text-lg", children: "Encontre oportunidades, acompanhe suas candidaturas e mantenha seu curr\u00EDculo atualizado." })] }), _jsxs(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true }, variants: staggerReveal(0.1), className: "grid grid-cols-1 gap-6 md:grid-cols-2", children: [_jsxs(motion.div, { variants: staggerItem('up'), className: "bg-card border-border hover:border-primary/30 rounded-2xl border p-8 transition-all duration-300", children: [_jsx("h3", { className: "text-foreground mb-2 text-xl font-semibold", children: "J\u00E1 \u00E9 candidato?" }), _jsx("p", { className: "text-muted-foreground mb-6 text-sm leading-relaxed", children: "Fa\u00E7a seu login e acompanhe suas oportunidades. Receba novas vagas, acompanhe candidaturas e mantenha seu curr\u00EDculo sempre atualizado." }), _jsx(Link, { to: "/login", children: _jsx(Button, { variant: "primary", size: "lg", className: "w-full", children: "Fazer login" }) })] }), _jsxs(motion.div, { variants: staggerItem('up'), className: "bg-card border-border hover:border-primary/30 rounded-2xl border p-8 transition-all duration-300", children: [_jsx("h3", { className: "text-foreground mb-2 text-xl font-semibold", children: "Ainda n\u00E3o tem cadastro?" }), _jsx("p", { className: "text-muted-foreground mb-6 text-sm leading-relaxed", children: "Cadastre seu curr\u00EDculo gratuitamente e seja visto pelas melhores empresas. \u00C9 r\u00E1pido, gratuito e voc\u00EA s\u00F3 precisa preencher uma vez." }), _jsx(Link, { to: "/trabalhe-conosco", children: _jsx(Button, { variant: "secondary", size: "lg", className: "w-full", children: "Cadastrar curr\u00EDculo" }) })] })] })] }) }), _jsx(Section, { className: "bg-surface-alt", children: _jsxs(Container, { children: [_jsxs(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: '-100px' }, variants: staggerReveal(0.15), className: "mb-12 flex items-end justify-between", children: [_jsxs(motion.div, { variants: revealUp, children: [_jsx(motion.h2, { variants: revealUp, className: "text-foreground text-3xl font-bold sm:text-4xl", children: "Vagas em Destaque" }), _jsx(motion.p, { variants: revealUp, className: "text-muted-foreground mt-4 max-w-2xl text-lg", children: "Confira as oportunidades dispon\u00EDveis no momento." })] }), _jsx(Link, { to: "/vagas", children: _jsxs(Button, { variant: "outline", size: "sm", children: ["Ver todas as vagas", _jsx(ArrowRight, { className: "ml-2 h-4 w-4" })] }) })] }), _jsx(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true }, variants: staggerReveal(0.1), className: "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4", children: destaques.map((vaga) => (_jsxs(motion.div, { variants: staggerItem('up'), className: "bg-card shadow-premium group relative flex flex-col rounded-2xl p-6 transition-all duration-300", children: [_jsxs("div", { className: "mb-4 flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-foreground group-hover:text-primary mb-1 text-xl font-bold transition-colors", children: vaga.titulo }), _jsx("p", { className: "text-muted-foreground text-sm", children: vaga.empresa })] }), _jsx("span", { className: "bg-primary/10 text-primary rounded-full px-2.5 py-1 text-xs font-medium", children: vaga.tipoContrato })] }), _jsxs("div", { className: "text-muted-foreground mb-4 space-y-1 text-sm", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(MapPin, { className: "h-4 w-4" }), _jsxs("span", { children: [vaga.cidade, ", ", vaga.estado] })] }), _jsx("span", { className: "inline-block text-xs", children: vaga.modalidade === 'PRESENCIAL'
                                                    ? 'Presencial'
                                                    : vaga.modalidade === 'HIBRIDO'
                                                        ? 'Híbrido'
                                                        : 'Remoto' })] }), _jsx("div", { className: "mt-auto flex gap-2", children: _jsx(Link, { to: `/vagas/${vaga.slug}`, className: "flex-1", children: _jsx(Button, { variant: "primary", size: "sm", className: "w-full", children: "Ver vaga" }) }) })] }, vaga.id))) })] }) }), _jsx(Section, { children: _jsxs(Container, { children: [_jsxs(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: '-100px' }, variants: staggerReveal(0.2), className: "mb-12 text-center", children: [_jsx(motion.h2, { variants: revealUp, className: "text-foreground text-3xl font-bold sm:text-4xl", children: "Como Funciona" }), _jsx(motion.p, { variants: revealUp, className: "text-muted-foreground mx-auto mt-4 max-w-2xl text-lg", children: "Cadastre seu curr\u00EDculo, candidate-se \u00E0s vagas e conquiste sua nova oportunidade." })] }), _jsx("div", { className: "grid grid-cols-1 gap-8 md:grid-cols-4", children: steps.map((step, index) => (_jsxs(motion.div, { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay: index * 0.15, duration: 0.6 }, className: "relative text-center", children: [index < steps.length - 1 && (_jsx("div", { className: "bg-border absolute top-8 right-[-3rem] left-[calc(50%+3rem)] hidden h-0.5 md:block" })), _jsx("div", { className: "bg-muted text-foreground mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold", children: _jsx(motion.span, { initial: { scale: 0 }, whileInView: { scale: 1 }, viewport: { once: true }, transition: {
                                                type: 'spring',
                                                stiffness: 200,
                                                damping: 15,
                                            }, children: step.step }) }), _jsx(motion.h3, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay: index * 0.15 + 0.1 }, className: "text-foreground mb-2 text-lg font-semibold", children: step.title }), _jsx(motion.p, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay: index * 0.15 + 0.15 }, className: "text-muted-foreground text-sm", children: step.description })] }, step.step))) })] }) }), _jsx(Section, { className: "bg-surface-alt", children: _jsxs(Container, { children: [_jsxs(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: '-100px' }, variants: staggerReveal(0.15), className: "mb-12 text-center", children: [_jsx(motion.h2, { variants: revealUp, className: "text-foreground text-3xl font-bold sm:text-4xl", children: "Por que escolher a J&S" }), _jsx(motion.p, { variants: revealUp, className: "text-muted-foreground mx-auto mt-4 max-w-2xl text-lg", children: "Atendimento especializado em RH com foco em resultados para empresas e candidatos." })] }), _jsx(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true }, variants: staggerReveal(0.1), className: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3", children: differentials.map((item) => (_jsxs(motion.div, { variants: staggerItem('up'), className: "bg-card border-border hover:border-primary/30 rounded-2xl border p-6 transition-all duration-300", children: [_jsx("div", { className: "bg-primary/10 text-primary mb-4 flex h-12 w-12 items-center justify-center rounded-full", children: _jsx(item.icon, { className: "h-6 w-6" }) }), _jsx("h3", { className: "text-foreground mb-2 text-lg font-semibold", children: item.title }), _jsx("p", { className: "text-muted-foreground text-sm leading-relaxed", children: item.description })] }, item.title))) })] }) }), _jsx(Section, { className: "bg-surface-alt", children: _jsxs(Container, { children: [_jsxs(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: '-100px' }, variants: staggerReveal(0.2), className: "mb-12 text-center", children: [_jsx(motion.h2, { variants: revealUp, className: "text-foreground text-3xl font-bold sm:text-4xl", children: "Clientes e Parceiros" }), _jsx(motion.p, { variants: revealUp, className: "text-muted-foreground mx-auto mt-4 max-w-2xl text-lg", children: "Empresas que confiam nosso trabalho." })] }), _jsx(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true }, variants: staggerReveal(0.08), className: "grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6", children: PARTNERS_LOGOS.map((partner) => (_jsx(motion.div, { variants: staggerItem('up'), className: "bg-card border-border flex h-24 items-center justify-center rounded-xl border p-4 opacity-70 grayscale grayscale-[0.8] transition-all duration-300 hover:opacity-100 hover:grayscale-0", children: _jsx("img", { src: partner.logo, alt: partner.name, className: "max-h-12 max-w-full object-contain", loading: "lazy" }) }, partner.name))) })] }) }), _jsx(Section, { children: _jsxs(Container, { children: [_jsxs(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: '-100px' }, variants: staggerReveal(0.2), className: "mb-12 text-center", children: [_jsx(motion.h2, { variants: revealUp, className: "text-foreground text-3xl font-bold sm:text-4xl", children: "O que dizem nossos clientes" }), _jsx(motion.p, { variants: revealUp, className: "text-muted-foreground mx-auto mt-4 max-w-2xl text-lg", children: "Depoimentos de empresas e candidatos que fizeram parte da J&S." })] }), _jsx(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true }, variants: staggerReveal(0.1), className: "grid grid-cols-1 gap-8 lg:grid-cols-2", children: CLIENT_TESTIMONIALS.map((testimonial) => (_jsxs(motion.div, { variants: staggerItem('up'), className: "bg-card border-border shadow-premium rounded-2xl border p-8", children: [_jsx(Quote, { className: "text-primary/20 h-10 w-10" }), _jsxs("p", { className: "text-muted-foreground mt-4 text-sm leading-relaxed", children: ["\"", testimonial.quote, "\""] }), _jsxs("div", { className: "mt-6 flex items-center gap-4", children: [_jsx("div", { className: "bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full", children: _jsx("span", { className: "text-primary text-xl font-bold", children: testimonial.name.charAt(0) }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-foreground font-semibold", children: testimonial.name }), _jsxs("p", { className: "text-muted-foreground text-sm", children: [testimonial.role, " \u2014 ", testimonial.company] })] })] })] }, testimonial.id))) })] }) }), _jsx(Section, { className: "bg-surface-alt", children: _jsxs(Container, { children: [_jsxs(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: '-100px' }, variants: staggerReveal(0.2), className: "mb-12 text-center", children: [_jsx(motion.h2, { variants: revealUp, className: "text-foreground text-3xl font-bold sm:text-4xl", children: "Resultados que comprovam nossa experi\u00EAncia" }), _jsx(motion.p, { variants: revealUp, className: "text-muted-foreground mx-auto mt-4 max-w-2xl text-lg", children: "Mais de uma d\u00E9cada conectando empresas e profissionais." })] }), _jsxs(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true }, variants: staggerReveal(0.1), className: "grid grid-cols-2 gap-6 sm:grid-cols-4", children: [_jsxs(motion.div, { variants: staggerItem('up'), className: "bg-card border-border flex flex-col items-center rounded-2xl border p-6 text-center", children: [_jsx("div", { className: "bg-primary/10 text-primary mb-4 flex h-14 w-14 items-center justify-center rounded-full", children: _jsx("span", { className: "text-2xl font-bold", children: "15+" }) }), _jsx("p", { className: "text-foreground font-semibold", children: "Anos de experi\u00EAncia" })] }), _jsxs(motion.div, { variants: staggerItem('up'), className: "bg-card border-border flex flex-col items-center rounded-2xl border p-6 text-center", children: [_jsx("div", { className: "bg-primary/10 text-primary mb-4 flex h-14 w-14 items-center justify-center rounded-full", children: _jsxs("span", { className: "text-2xl font-bold", children: [COMPANY.clientsServed, "+"] }) }), _jsx("p", { className: "text-foreground font-semibold", children: "Clientes atendidos" })] }), _jsxs(motion.div, { variants: staggerItem('up'), className: "bg-card border-border flex flex-col items-center rounded-2xl border p-6 text-center", children: [_jsx("div", { className: "bg-primary/10 text-primary mb-4 flex h-14 w-14 items-center justify-center rounded-full", children: _jsxs("span", { className: "text-2xl font-bold", children: [COMPANY.professionals, "+"] }) }), _jsx("p", { className: "text-foreground font-semibold", children: "Profissionais colocados" })] }), _jsxs(motion.div, { variants: staggerItem('up'), className: "bg-card border-border flex flex-col items-center rounded-2xl border p-6 text-center", children: [_jsx("div", { className: "bg-primary/10 text-primary mb-4 flex h-14 w-14 items-center justify-center rounded-full", children: _jsxs("span", { className: "text-2xl font-bold", children: [COMPANY.citiesCovered, "+"] }) }), _jsx("p", { className: "text-foreground font-semibold", children: "Cidades atendidas" })] })] })] }) }), _jsx(Section, { children: _jsxs(Container, { children: [_jsxs(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: '-100px' }, variants: staggerReveal(0.2), className: "mb-12 text-center", children: [_jsx(motion.h2, { variants: revealUp, className: "text-foreground text-3xl font-bold sm:text-4xl", children: "Precisa contratar?" }), _jsx(motion.p, { variants: revealUp, className: "text-muted-foreground mx-auto mt-4 max-w-2xl text-lg", children: "Encontramos profissionais qualificados para sua necessidade." })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 }, className: "relative overflow-hidden rounded-3xl p-8 text-center sm:p-12", children: [_jsx("div", { className: "bg-primary/5 animate-float-slow absolute -top-20 -right-20 h-60 w-60 rounded-full blur-3xl" }), _jsx("div", { className: "bg-primary/5 animate-float-medium absolute -bottom-20 -left-20 h-60 w-60 rounded-full blur-3xl" }), _jsxs("div", { className: "relative", children: [_jsx("h3", { className: "text-foreground text-2xl font-bold sm:text-3xl", children: "Solicite um or\u00E7amento sem compromisso" }), _jsx("p", { className: "text-muted-foreground mx-auto mt-4 max-w-xl text-lg", children: "Nossa equipe comercial entende sua necessidade e envia uma proposta personalizada em at\u00E9 24 horas." }), _jsxs("div", { className: "mt-8 flex flex-wrap justify-center gap-4", children: [_jsx(Link, { to: "/clientes", children: _jsxs(Button, { variant: "secondary", size: "lg", children: ["Solicitar Or\u00E7amento", _jsx(ArrowRight, { className: "ml-2 h-5 w-5" })] }) }), _jsx("a", { href: getWhatsAppUrl(COMPANY.whatsapp, WHATSAPP_MESSAGES.comercial), target: "_blank", rel: "noopener noreferrer", children: _jsxs(Button, { variant: "outline", size: "lg", children: [_jsx(Phone, { className: "mr-2 h-5 w-5" }), "Falar no WhatsApp"] }) })] })] })] })] }) }), _jsx(Section, { className: "bg-surface-alt", children: _jsxs(Container, { children: [_jsxs(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: '-100px' }, variants: staggerReveal(0.15), className: "mb-12 text-center", children: [_jsx(motion.h2, { variants: revealUp, className: "text-foreground text-3xl font-bold sm:text-4xl", children: "Blog" }), _jsx(motion.p, { variants: revealUp, className: "text-muted-foreground mx-auto mt-4 max-w-2xl text-lg", children: "\u00DAltimos artigos sobre curr\u00EDculo, entrevistas, mercado de trabalho e carreira." })] }), _jsx(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true }, variants: staggerReveal(0.1), className: "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3", children: blogPosts.map((post) => (_jsxs(motion.div, { variants: staggerItem('up'), className: "bg-card shadow-premium rounded-2xl p-6 transition-all duration-300", children: [_jsxs("div", { className: "text-primary mb-4 flex items-center justify-between text-xs font-medium", children: [_jsx("span", { children: post.category }), _jsx("span", { children: post.date })] }), _jsx("h3", { className: "text-foreground mb-2 text-base font-semibold", children: post.title }), _jsxs(Link, { to: post.href, className: "text-primary text-sm font-medium", children: ["Ler artigo ", _jsx(ArrowRight, { className: "ml-1 inline h-4 w-4" })] })] }, post.title))) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, className: "mt-10 text-center", children: _jsx(Link, { to: "/blog", children: _jsxs(Button, { variant: "outline", size: "lg", children: ["Ver todos os artigos", _jsx(ArrowRight, { className: "ml-2 h-5 w-5" })] }) }) })] }) }), _jsx(Section, { children: _jsx(Container, { children: _jsxs(motion.div, { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }, className: "relative overflow-hidden rounded-3xl p-8 text-center sm:p-12", children: [_jsx("div", { className: "animate-pulse-glow absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsla(var(--primary),0.15),transparent_60%)]" }), _jsx("div", { className: "bg-primary/5 animate-float-slow absolute -top-20 -right-20 h-60 w-60 rounded-full blur-3xl" }), _jsx("div", { className: "bg-primary/5 animate-float-medium absolute -bottom-20 -left-20 h-60 w-60 rounded-full blur-3xl" }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay: 0.1 }, className: "relative", children: [_jsx("h2", { className: "text-foreground text-3xl font-bold sm:text-4xl", children: "Pronto para dar o pr\u00F3ximo passo?" }), _jsx("p", { className: "text-muted-foreground mx-auto mt-4 max-w-xl text-lg", children: "Encontre sua pr\u00F3xima oportunidade ou encontre os profissionais certos para sua empresa." }), _jsxs("div", { className: "mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2", children: [_jsx(Link, { to: "/vagas", children: _jsxs(Button, { variant: "secondary", size: "lg", className: "w-full", children: ["Est\u00E1 procurando uma nova oportunidade?", _jsx(ArrowRight, { className: "ml-2 h-5 w-5" })] }) }), _jsx(Link, { to: "/empresas", children: _jsxs(Button, { variant: "outline", size: "lg", className: "border-border/30 text-foreground hover:bg-muted w-full", children: ["Precisa de profissionais para sua empresa?", _jsx(ArrowRight, { className: "ml-2 h-5 w-5" })] }) })] })] })] }) }) })] }));
}
