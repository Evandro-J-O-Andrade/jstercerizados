import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { JobApplicationForm } from '@/components/forms/JobApplicationForm';
import { mockGetVagaBySlug } from '@/services/mock/vagas';
import { COMPANY } from '@/config';
import { ArrowLeft, MapPin, Clock, DollarSign, Briefcase } from 'lucide-react';
const CONTRATO_LABELS = {
    CLT: 'CLT',
    ESTAGIO: 'Estágio',
    TEMPORARIO: 'Temporário',
    FREELA: 'Freelance',
    TERCEIRIZADO: 'Terceirizado',
    CD: 'C/D',
};
const MODALIDADE_LABELS = {
    PRESENCIAL: 'Presencial',
    HIBRIDO: 'Híbrido',
    REMOTO: 'Remoto',
};
export default function VagaDetalhe() {
    const { slug } = useParams();
    const vaga = slug ? mockGetVagaBySlug(slug) : undefined;
    if (!vaga) {
        return (_jsx("div", { className: "min-h-screen", children: _jsx(Section, { className: "pt-20 md:pt-28", children: _jsx(Container, { children: _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, className: "text-center", children: [_jsx("h1", { className: "text-foreground text-4xl font-bold sm:text-5xl", children: "Vaga n\u00E3o encontrada" }), _jsx("p", { className: "text-muted-foreground mx-auto mt-4 max-w-md text-lg", children: "A vaga que voc\u00EA est\u00E1 procurando n\u00E3o existe ou foi preenchida." }), _jsx(Link, { to: "/vagas", children: _jsx(Button, { variant: "secondary", size: "lg", className: "mt-8", children: "Ver todas as vagas" }) })] }) }) }) }));
    }
    const formatCurrency = (value) => value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
    return (_jsxs("div", { className: "min-h-screen", children: [_jsx(SEO, { title: `${vaga.titulo} — ${COMPANY.name}`, description: vaga.descricao || `Oportunidade de ${vaga.titulo} na ${COMPANY.name}.`, keywords: [
                    vaga.titulo,
                    vaga.area || '',
                    'vaga',
                    'emprego',
                    'trabalho',
                    COMPANY.name,
                    'RH',
                    'recrutamento',
                    'seleção',
                ], type: "WebSite" }), _jsx(Section, { className: "pt-20 md:pt-32", children: _jsx(Container, { children: _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, children: [_jsxs(Link, { to: "/vagas", className: "text-muted-foreground hover:text-primary mb-6 flex items-center gap-2 text-sm font-medium transition-colors", children: [_jsx(ArrowLeft, { className: "h-4 w-4" }), "Voltar para vagas"] }), _jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.1, duration: 0.6 }, className: "mb-8 flex items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl", children: vaga.titulo }), vaga.empresa && (_jsx("p", { className: "text-muted-foreground mt-2 text-lg", children: vaga.empresa }))] }), vaga.tipoContrato && (_jsx("span", { className: `rounded-full px-3 py-1 text-xs font-medium ${vaga.tipoContrato === 'CLT'
                                            ? 'bg-success/10 text-success'
                                            : 'bg-primary/10 text-primary'}`, children: CONTRATO_LABELS[vaga.tipoContrato] }))] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2, duration: 0.6 }, className: "mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4", children: [vaga.area && (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Briefcase, { className: "text-primary h-5 w-5" }), _jsx("span", { className: "text-sm", children: vaga.area })] })), vaga.cidade && vaga.estado && (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(MapPin, { className: "text-primary h-5 w-5" }), _jsxs("span", { className: "text-sm", children: [vaga.cidade, ", ", vaga.estado] })] })), vaga.workSchedule && (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Clock, { className: "text-primary h-5 w-5" }), _jsx("span", { className: "text-sm", children: vaga.workSchedule })] })), vaga.modalidade && (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Briefcase, { className: "text-primary h-5 w-5" }), _jsx("span", { className: "text-sm", children: MODALIDADE_LABELS[vaga.modalidade] })] })), vaga.salarioMin && (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(DollarSign, { className: "text-primary h-5 w-5" }), _jsxs("span", { className: "text-sm", children: [formatCurrency(vaga.salarioMin), vaga.salarioMax
                                                        ? ' – ' + formatCurrency(vaga.salarioMax)
                                                        : ''] })] })), vaga.workload && (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Clock, { className: "text-primary h-5 w-5" }), _jsx("span", { className: "text-sm", children: vaga.workload })] }))] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3, duration: 0.6 }, children: [vaga.descricao && (_jsxs("div", { className: "border-border mb-8 border-t pt-8", children: [_jsx("h2", { className: "text-foreground mb-4 text-xl font-semibold", children: "Sobre a vaga" }), _jsx("p", { className: "text-muted-foreground leading-relaxed", children: vaga.descricao })] })), vaga.responsibilities && (_jsxs("div", { className: "border-border mb-8 border-t pt-8", children: [_jsx("h2", { className: "text-foreground mb-4 text-xl font-semibold", children: "Responsabilidades e atribui\u00E7\u00F5es" }), _jsx("p", { className: "text-muted-foreground leading-relaxed", children: vaga.responsibilities })] })), vaga.requisitos && (_jsxs("div", { className: "border-border mb-8 border-t pt-8", children: [_jsx("h2", { className: "text-foreground mb-4 text-xl font-semibold", children: "Requisitos e qualifica\u00E7\u00F5es" }), _jsx("p", { className: "text-muted-foreground leading-relaxed", children: vaga.requisitos })] })), vaga.beneficios && vaga.beneficios.length > 0 && (_jsxs("div", { className: "border-border mb-8 border-t pt-8", children: [_jsx("h2", { className: "text-foreground mb-4 text-xl font-semibold", children: "Benef\u00EDcios" }), _jsx("div", { className: "flex flex-wrap gap-2", children: vaga.beneficios.map((beneficio) => (_jsx("span", { className: "bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium", children: beneficio }, beneficio))) })] }))] }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.4, duration: 0.6 }, children: _jsx(JobApplicationForm, { jobTitle: vaga.titulo, jobSlug: vaga.slug, vagaId: vaga.id }) })] }) }) })] }));
}
