import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { staggerReveal, revealUp } from '@/animations/scroll';
import { Section } from '@/components/sections/Section';
import { ServiceCard } from '@/components/sections/ServiceCard';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { mockServices } from '@/services/mock/services';
import { COMPANY } from '@/config';
export default function Servicos() {
    const rhServices = mockServices.filter((s) => s.category === 'rh');
    const facilitiesServices = mockServices.filter((s) => s.category === 'facilities' || s.category === 'terceirizacao');
    return (_jsxs(_Fragment, { children: [_jsx(SEO, { title: `Serviços — ${COMPANY.name}`, description: "Assessoria em RH, recrutamento, m\u00E3o de obra tempor\u00E1ria e efetiva, terceiriza\u00E7\u00E3o, facilities, limpeza, jardinagem e portaria.", keywords: [
                    'serviços',
                    'assessoria em RH',
                    'recrutamento',
                    'mão de obra temporária',
                    'terceirização',
                    'facilities',
                    'limpeza',
                    'jardinagem',
                    'portaria',
                ], type: "WebSite" }), _jsx(Section, { className: "pt-20 md:pt-28", children: _jsxs(Container, { children: [_jsxs(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: '-100px' }, variants: staggerReveal(0.15), className: "mb-12 text-center", children: [_jsx(motion.h1, { variants: revealUp, className: "text-foreground text-4xl font-bold sm:text-5xl", children: "Nossos Servi\u00E7os" }), _jsx(motion.p, { variants: revealUp, className: "text-muted-foreground mx-auto mt-4 max-w-2xl text-lg", children: "Solu\u00E7\u00F5es completas em Recursos Humanos e Facilities para apoiar o crescimento da sua empresa." })] }), _jsxs(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: '-100px' }, variants: staggerReveal(0.15), children: [_jsx(motion.h2, { variants: revealUp, className: "text-foreground text-2xl font-bold", children: "Solu\u00E7\u00F5es em RH" }), _jsx(motion.p, { variants: revealUp, className: "text-muted-foreground mt-2 mb-6 max-w-2xl text-sm", children: "Solu\u00E7\u00F5es em recrutamento, sele\u00E7\u00E3o e gest\u00E3o de pessoas para encontrar o profissional certo para sua equipe." }), _jsx(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true }, variants: staggerReveal(0.1), className: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4", children: rhServices.map((service, index) => (_jsx(ServiceCard, { service: service, index: index }, service.id))) })] }), _jsxs(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: '-100px' }, variants: staggerReveal(0.15), className: "mt-16", children: [_jsx(motion.h2, { variants: revealUp, className: "text-foreground text-2xl font-bold", children: "Solu\u00E7\u00F5es Operacionais (Facilities)" }), _jsx(motion.p, { variants: revealUp, className: "text-muted-foreground mt-2 mb-6 max-w-2xl text-sm", children: "Como solu\u00E7\u00E3o complementar, oferecemos terceiriza\u00E7\u00E3o de servi\u00E7os operacionais: limpeza, seguran\u00E7a, portaria e zeladoria." }), _jsx(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true }, variants: staggerReveal(0.1), className: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4", children: facilitiesServices.map((service, index) => (_jsx(ServiceCard, { service: service, index: index }, service.id))) })] })] }) })] }));
}
