import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { staggerReveal, revealUp } from '@/animations/scroll';
import { staggerItem } from '@/animations/fade';
import { mockGetVagas } from '@/services/mock/vagas';
import { COMPANY } from '@/config';
const CONTRATO_LABELS = {
    CLT: 'CLT',
    ESTAGIO: 'Estágio',
    TEMPORARIO: 'Temporário',
    FREELA: 'Freela',
    TERCEIRIZADO: 'Terceirizado',
    CD: 'C/D',
};
export default function Vagas() {
    const [searchTerm, setSearchTerm] = useState('');
    const [cidadeFilter, setCidadeFilter] = useState('');
    const [estadoFilter, setEstadoFilter] = useState('');
    const [areaFilter, setAreaFilter] = useState('');
    const [tipoFilter, setTipoFilter] = useState('');
    const [salarioMin, setSalarioMin] = useState('');
    const [dataDias, setDataDias] = useState('');
    const [showMoreFilters, setShowMoreFilters] = useState(false);
    const vagas = useMemo(() => {
        return mockGetVagas({
            search: searchTerm || undefined,
            cidade: cidadeFilter || undefined,
            estado: estadoFilter || undefined,
            tipoContrato: tipoFilter || undefined,
            salarioMin: salarioMin ? Number(salarioMin) : undefined,
            dataDias: dataDias ? Number(dataDias) : undefined,
        });
    }, [
        searchTerm,
        cidadeFilter,
        estadoFilter,
        tipoFilter,
        salarioMin,
        dataDias,
    ]);
    const clearFilters = () => {
        setSearchTerm('');
        setCidadeFilter('');
        setEstadoFilter('');
        setAreaFilter('');
        setTipoFilter('');
        setSalarioMin('');
        setDataDias('');
    };
    return (_jsxs("div", { className: "min-h-screen", children: [_jsx(SEO, { title: `Vagas — ${COMPANY.name}`, description: `Oportunidades de trabalho e vagas disponíveis na ${COMPANY.name}. Encontre sua próxima oportunidade profissional.`, keywords: [
                    'vagas',
                    'emprego',
                    'trabalho',
                    'oportunidades',
                    'recrutamento',
                    'seleção',
                    'RH',
                    'currículo',
                ], type: "WebSite" }), _jsx(Section, { className: "pt-20 md:pt-28", children: _jsxs(Container, { children: [_jsxs(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: '-100px' }, variants: staggerReveal(0.15), className: "mb-12 text-center", children: [_jsx(motion.h1, { variants: revealUp, className: "text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl", children: "Vagas Dispon\u00EDveis" }), _jsx(motion.p, { variants: revealUp, className: "text-muted-foreground mx-auto mt-4 max-w-2xl text-lg", children: "Encontre a oportunidade ideal para o seu perfil profissional." })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay: 0.2 }, className: "mb-4 grid grid-cols-1 gap-4 md:grid-cols-5", children: [_jsxs("div", { className: "relative md:col-span-2", children: [_jsx(Search, { className: "text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" }), _jsx("input", { type: "text", placeholder: "Busque por cargo, empresa...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "border-input bg-surface text-foreground focus:border-primary focus:ring-primary/20 w-full rounded-xl border px-4 py-3 pl-10 text-sm transition-colors outline-none focus:ring-2" })] }), _jsxs("div", { className: "relative", children: [_jsx(MapPin, { className: "text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" }), _jsx("input", { type: "text", placeholder: "Cidade", value: cidadeFilter, onChange: (e) => setCidadeFilter(e.target.value), className: "border-input bg-surface text-foreground focus:border-primary focus:ring-primary/20 w-full rounded-xl border px-4 py-3 pl-10 text-sm transition-colors outline-none focus:ring-2" })] }), _jsxs("select", { value: tipoFilter, onChange: (e) => setTipoFilter(e.target.value), className: "border-input bg-surface text-foreground focus:border-primary focus:ring-primary/20 w-full cursor-pointer rounded-xl border px-4 py-3 text-sm transition-colors outline-none focus:ring-2", children: [_jsx("option", { value: "", children: "Todos os contratos" }), _jsx("option", { value: "CLT", children: "CLT" }), _jsx("option", { value: "ESTAGIO", children: "Est\u00E1gio" }), _jsx("option", { value: "TEMPORARIO", children: "Tempor\u00E1rio" }), _jsx("option", { value: "TERCEIRIZADO", children: "Terceirizado" })] }), _jsxs(Button, { variant: "ghost", size: "sm", className: "w-full", onClick: () => setShowMoreFilters(!showMoreFilters), children: [_jsx(Filter, { className: "mr-2 h-4 w-4" }), showMoreFilters ? 'Menos filtros' : 'Mais filtros'] })] }), showMoreFilters && (_jsxs(motion.div, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: 'auto' }, exit: { opacity: 0, height: 0 }, transition: { duration: 0.3 }, className: "mb-6 grid grid-cols-1 gap-4 md:grid-cols-4", children: [_jsxs("select", { value: estadoFilter, onChange: (e) => setEstadoFilter(e.target.value), className: "border-input bg-surface text-foreground focus:border-primary focus:ring-primary/20 w-full cursor-pointer rounded-xl border px-4 py-3 text-sm transition-colors outline-none focus:ring-2", children: [_jsx("option", { value: "", children: "Todos os estados" }), _jsx("option", { value: "SP", children: "SP" }), _jsx("option", { value: "RJ", children: "RJ" }), _jsx("option", { value: "MG", children: "MG" })] }), _jsxs("select", { value: areaFilter, onChange: (e) => setAreaFilter(e.target.value), className: "border-input bg-surface text-foreground focus:border-primary focus:ring-primary/20 w-full cursor-pointer rounded-xl border px-4 py-3 text-sm transition-colors outline-none focus:ring-2", children: [_jsx("option", { value: "", children: "Todas as \u00E1reas" }), _jsx("option", { value: "producao", children: "Produ\u00E7\u00E3o" }), _jsx("option", { value: "logistica", children: "Log\u00EDstica" }), _jsx("option", { value: "administrativo", children: "Administrativo" }), _jsx("option", { value: "seguranca", children: "Seguran\u00E7a" }), _jsx("option", { value: "limpeza", children: "Limpeza" })] }), _jsxs("select", { value: salarioMin, onChange: (e) => setSalarioMin(e.target.value), className: "border-input bg-surface text-foreground focus:border-primary focus:ring-primary/20 w-full cursor-pointer rounded-xl border px-4 py-3 text-sm transition-colors outline-none focus:ring-2", children: [_jsx("option", { value: "", children: "Sal\u00E1rio m\u00EDnimo" }), _jsx("option", { value: "1500", children: "R$ 1.500+" }), _jsx("option", { value: "2000", children: "R$ 2.000+" }), _jsx("option", { value: "3000", children: "R$ 3.000+" }), _jsx("option", { value: "5000", children: "R$ 5.000+" })] }), _jsxs("select", { value: dataDias, onChange: (e) => setDataDias(e.target.value), className: "border-input bg-surface text-foreground focus:border-primary focus:ring-primary/20 w-full cursor-pointer rounded-xl border px-4 py-3 text-sm transition-colors outline-none focus:ring-2", children: [_jsx("option", { value: "", children: "Todas as datas" }), _jsx("option", { value: "7", children: "\u00DAltimos 7 dias" }), _jsx("option", { value: "30", children: "\u00DAltimos 30 dias" }), _jsx("option", { value: "90", children: "\u00DAltimos 90 dias" })] })] })), _jsxs(motion.div, { initial: { opacity: 0 }, whileInView: { opacity: 1 }, viewport: { once: true }, className: "mb-6 flex items-center justify-between", children: [_jsxs("p", { className: "text-muted-foreground text-sm", children: [_jsx("span", { className: "text-foreground font-medium", children: vagas.length }), ' ', "vaga", vagas.length !== 1 ? 's' : '', " encontrada", vagas.length !== 1 ? 's' : ''] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Link, { to: "/trabalhe-conosco", children: _jsx(Button, { variant: "secondary", size: "sm", children: "Cadastrar Curr\u00EDculo" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: clearFilters, disabled: !searchTerm &&
                                                !cidadeFilter &&
                                                !estadoFilter &&
                                                !areaFilter &&
                                                !tipoFilter &&
                                                !salarioMin &&
                                                !dataDias, children: "Limpar filtros" })] })] }), _jsx(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true }, variants: staggerReveal(0.1), className: "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3", children: vagas.length === 0 ? (_jsx(motion.div, { variants: staggerItem('up'), className: "bg-card shadow-premium col-span-full rounded-2xl p-12 text-center", children: _jsx("p", { className: "text-muted-foreground", children: "Nenhuma vaga encontrada com os filtros aplicados." }) })) : (vagas.map((vaga) => (_jsxs(motion.div, { variants: staggerItem('up'), whileHover: { y: -4 }, className: "bg-card border-border shadow-premium group relative flex flex-col rounded-2xl border p-6 transition-all duration-300", children: [_jsxs("div", { className: "mb-4 flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-foreground group-hover:text-primary mb-1 text-xl font-bold transition-colors", children: vaga.titulo }), vaga.empresa && (_jsx("p", { className: "text-muted-foreground text-sm", children: vaga.empresa }))] }), vaga.tipoContrato && (_jsx("span", { className: `rounded-full px-2.5 py-1 text-xs font-medium ${vaga.tipoContrato === 'CLT'
                                                    ? 'bg-success/10 text-success'
                                                    : 'bg-primary/10 text-primary'}`, children: CONTRATO_LABELS[vaga.tipoContrato] ||
                                                    vaga.tipoContrato }))] }), _jsxs("div", { className: "mb-4 space-y-2", children: [vaga.cidade && vaga.estado && (_jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx(MapPin, { className: "text-muted-foreground h-4 w-4" }), _jsxs("span", { className: "text-muted-foreground", children: [vaga.cidade, ", ", vaga.estado] })] })), vaga.salarioMin && (_jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx("span", { className: "text-muted-foreground", children: "R$" }), _jsxs("span", { className: "text-muted-foreground", children: [vaga.salarioMin.toLocaleString('pt-BR'), ' – ', vaga.salarioMax
                                                                ? vaga.salarioMax.toLocaleString('pt-BR')
                                                                : 'a combinar'] })] })), vaga.modalidade && (_jsx("span", { className: "text-muted-foreground inline-block text-xs", children: vaga.modalidade === 'PRESENCIAL'
                                                    ? 'Presencial'
                                                    : vaga.modalidade === 'HIBRIDO'
                                                        ? 'Híbrido'
                                                        : 'Remoto' })), vaga.area && (_jsx("span", { className: "text-muted-foreground/70 inline-block text-xs", children: vaga.area }))] }), vaga.beneficios && vaga.beneficios.length > 0 && (_jsxs("div", { className: "mb-4", children: [_jsx("p", { className: "text-muted-foreground mb-2 text-xs font-medium", children: "Benef\u00EDcios" }), _jsx("div", { className: "flex flex-wrap gap-1", children: vaga.beneficios.slice(0, 3).map((beneficio) => (_jsx("span", { className: "bg-muted rounded-full px-2 py-0.5 text-xs", children: beneficio }, beneficio))) })] })), _jsxs("div", { className: "mt-auto flex gap-2", children: [_jsx(Link, { to: `/vagas/${vaga.slug}`, className: "flex-1", children: _jsx(Button, { variant: "primary", size: "sm", className: "w-full", children: "Ver vaga" }) }), _jsx(Link, { to: `/vagas/${vaga.slug}`, className: "flex-1", children: _jsx(Button, { variant: "outline", size: "sm", className: "w-full", children: "Candidatar-se" }) })] })] }, vaga.id)))) }), vagas.length > 0 && vagas.length < 100 && (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay: 0.3 }, className: "mt-12 text-center", children: _jsxs("p", { className: "text-muted-foreground text-sm", children: ["Mostrando ", vagas.length, " vaga", vagas.length !== 1 ? 's' : '', " de ", vagas.length, " dispon\u00EDvel", vagas.length !== 1 ? 's' : ''] }) }))] }) })] }));
}
