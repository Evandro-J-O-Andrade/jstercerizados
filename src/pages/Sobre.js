import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Shield, Award, Users, Target } from 'lucide-react';
import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { SafeImage } from '@/components/ui/SafeImage';
import { COMPANY_TIMELINE } from '@/mock/company';
import { COMPANY } from '@/config';
import { IMAGES } from '@/config';
import { HERO_ASSETS } from '@/content/assets';
import { staggerReveal, revealUp } from '@/animations/scroll';
import { staggerItem } from '@/animations/fade';
import { useRef } from 'react';
const valores = [
    {
        title: 'Excelência em Recrutamento',
        description: 'Processos rigorosos de triagem e seleção para encontrar o profissional certo para cada vaga.',
        icon: Award,
    },
    {
        title: 'Inovação em RH',
        description: 'Investimento constante em tecnologia e metodologias para otimizar o recrutamento.',
        icon: Shield,
    },
    {
        title: 'Foco no Resultado',
        description: 'Alinhamento total com os objetivos da empresa: encontrar talentos e elevar padrões.',
        icon: Target,
    },
    {
        title: 'Equipe Qualificada',
        description: 'Especialistas em recrutamento, seleção e gestão de pessoas com certificações reconhecidas.',
        icon: Users,
    },
];
function TimelineItemComponent({ item, index, }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });
    const shouldReduceMotion = useReducedMotion();
    const isEven = index % 2 === 0;
    const hidden = shouldReduceMotion
        ? { opacity: 1, x: 0, scale: 1 }
        : {
            opacity: 0,
            x: isEven ? -60 : 60,
            scale: 0.96,
        };
    return (_jsxs(motion.div, { ref: ref, initial: hidden, animate: isInView ? { opacity: 1, x: 0, scale: 1 } : hidden, transition: shouldReduceMotion
            ? { duration: 0 }
            : { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }, className: `relative flex flex-col gap-4 sm:flex-row sm:items-center ${isEven ? 'sm:flex-row' : 'sm:flex-row-reverse'}`, children: [_jsx("div", { className: `flex-1 ${isEven ? 'sm:text-right' : 'sm:text-left'}`, children: _jsxs("div", { className: "bg-card border-border rounded-2xl border p-5 shadow-sm", children: [_jsx("span", { className: "text-primary text-sm font-semibold", children: item.year }), _jsx("h3", { className: "text-foreground mt-1 text-lg font-semibold", children: item.event }), _jsx("p", { className: "text-muted-foreground mt-1 text-sm leading-relaxed", children: item.description }), item.image ? (_jsx("div", { className: "mt-4 overflow-hidden rounded-xl", children: _jsx(SafeImage, { src: item.image, alt: item.event, className: "h-48 w-full object-cover" }) })) : null] }) }), _jsx("div", { className: "bg-primary text-primary-foreground absolute left-4 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shadow-md sm:left-1/2 sm:-translate-x-1/2", children: item.year.slice(-2) }), _jsx("div", { className: "hidden flex-1 sm:block" })] }));
}
export default function Sobre() {
    return (_jsxs("div", { className: "pt-20", children: [_jsx(SEO, { title: `Sobre — ${COMPANY.name}`, description: `Conheça a ${COMPANY.name}: assessoria em RH, recrutamento, mão de obra e facilities com excelência.`, keywords: [
                    'sobre',
                    COMPANY.name,
                    'RH',
                    'recrutamento',
                    'seleção',
                    'terceirização',
                    'facilities',
                    'limpeza',
                    'jardinagem',
                    'portaria',
                ], type: "Organization" }), _jsx(Section, { children: _jsxs(Container, { children: [_jsxs(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: '-100px' }, variants: staggerReveal(0.2), className: "mb-16 text-center", children: [_jsxs(motion.h1, { variants: revealUp, className: "text-foreground text-4xl font-bold sm:text-5xl", children: ["Sobre a ", COMPANY.tradingName] }), _jsx(motion.p, { variants: revealUp, className: "text-muted-foreground mx-auto mt-4 max-w-3xl text-lg", children: "Somos uma empresa de assessoria em RH, recrutamento, m\u00E3o de obra, terceiriza\u00E7\u00E3o e facilities que transforma talentos em oportunidades." })] }), _jsxs(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: '-100px' }, variants: staggerReveal(0.15), className: "grid grid-cols-1 items-center gap-12 lg:grid-cols-2", children: [_jsx(motion.div, { variants: staggerItem('left'), children: _jsxs("div", { className: "bg-card shadow-glass border-border/40 relative overflow-hidden rounded-3xl border", children: [_jsx(SafeImage, { src: HERO_ASSETS.bannerjs, fallbackSrc: IMAGES.hero.sobre.fallback, alt: `Equipe ${COMPANY.tradingName}`, className: "h-full w-full object-cover opacity-80" }), _jsx("div", { className: "from-background/80 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" })] }) }), _jsxs(motion.div, { variants: staggerItem('right'), children: [_jsx("h2", { className: "text-foreground mb-4 text-2xl font-bold", children: "Nossa Miss\u00E3o" }), _jsx("p", { className: "text-muted-foreground leading-relaxed", children: "Conectar empresas aos profissionais certos e ajudar candidatos a conquistarem novas oportunidades, por meio de recrutamento, sele\u00E7\u00E3o, m\u00E3o de obra tempor\u00E1ria e efetiva e assessoria completa em RH." }), _jsx("h3", { className: "text-foreground mt-8 mb-4 text-2xl font-bold", children: "Nossa Vis\u00E3o" }), _jsx("p", { className: "text-muted-foreground leading-relaxed", children: "Ser refer\u00EAncia em assessoria em RH, recrutamento, m\u00E3o de obra, terceiriza\u00E7\u00E3o e facilities, reconhecida pela excel\u00EAncia no recrutamento e pela conex\u00E3o humanizada entre empresas e talentos." })] })] }), _jsxs(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: '-100px' }, variants: staggerReveal(0.2), className: "mt-16", children: [_jsx(motion.h2, { variants: revealUp, className: "text-foreground mb-8 text-center text-3xl font-bold", children: "Nossos Valores" }), _jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", children: valores.map((valor) => (_jsxs(motion.div, { variants: staggerItem('up'), whileHover: { scale: 1.03, y: -4 }, className: "bg-card border-border shadow-premium rounded-2xl border p-6 text-center transition-all", children: [_jsx("div", { className: "bg-primary/10 text-primary mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full", children: _jsx(valor.icon, { className: "h-6 w-6" }) }), _jsx("h3", { className: "text-foreground mb-2 text-lg font-semibold", children: valor.title }), _jsx("p", { className: "text-muted-foreground text-sm leading-relaxed", children: valor.description })] }, valor.title))) })] }), _jsxs(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: '-100px' }, variants: staggerReveal(0.2), className: "mt-16", children: [_jsx(motion.h2, { variants: revealUp, className: "text-foreground mb-12 text-center text-3xl font-bold", children: "Nossa Trajet\u00F3ria" }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "bg-border absolute top-0 left-4 h-full w-0.5 sm:left-1/2" }), _jsx("div", { className: "space-y-12", children: COMPANY_TIMELINE.map((item, index) => (_jsx(TimelineItemComponent, { item: item, index: index }, item.year))) })] })] }), _jsxs(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: '-100px' }, variants: staggerReveal(0.15), className: "grid grid-cols-1 items-center gap-12 lg:grid-cols-2", children: [_jsx(motion.div, { variants: staggerItem('left'), children: _jsxs("div", { className: "bg-card shadow-glass border-border/40 relative overflow-hidden rounded-3xl border", children: [_jsx(SafeImage, { src: HERO_ASSETS.bannerjs, fallbackSrc: IMAGES.hero.sobre.fallback, alt: `Missão ${COMPANY.tradingName}`, className: "h-full w-full object-cover opacity-80" }), _jsx("div", { className: "from-background/80 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" })] }) }), _jsxs(motion.div, { variants: staggerItem('right'), children: [_jsx("h2", { className: "text-foreground mb-6 text-3xl font-bold", children: "Cobertura Regional" }), _jsx("p", { className: "text-muted-foreground mb-4 leading-relaxed", children: "Atendemos empresas e candidatos em m\u00FAltiplas cidades, com cobertura completa para garantir agilidade e presen\u00E7a onde voc\u00EA precisa." }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Shield, { className: "text-primary h-5 w-5" }), _jsx("span", { className: "text-foreground font-medium", children: "Cobertura nacional" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Award, { className: "text-primary h-5 w-5" }), _jsx("span", { className: "text-foreground font-medium", children: "Equipe 24/7" })] })] })] })] })] }) })] }));
}
