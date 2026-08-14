import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Briefcase, FileText, TrendingUp, Search, Filter, Download, Eye, Edit, Trash2, LogOut, } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { mockGetBudgets, mockDeleteBudget, mockGetPartners, mockDeletePartner, mockGetSuppliers, mockDeleteSupplier, mockGetCandidates, mockDeleteCandidate, } from '@/services/mock';
import { STATUS_COLORS } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils';
const tabMap = [
    { key: 'dashboard', label: 'Visão Geral', icon: TrendingUp },
    { key: 'clientes', label: 'Clientes', icon: FileText },
    { key: 'parceiros', label: 'Parceiros', icon: Users },
    { key: 'fornecedores', label: 'Fornecedores', icon: Briefcase },
    { key: 'curriculos', label: 'Currículos', icon: FileText },
    { key: 'vagas', label: 'Vagas', icon: Briefcase },
    { key: 'usuarios', label: 'Usuários', icon: Users },
    { key: 'relatorios', label: 'Relatórios', icon: TrendingUp },
];
const STATUS_VARIANTS = {
    new: 'primary',
    contacted: 'warning',
    proposal: 'accent',
    won: 'success',
    lost: 'danger',
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    active: 'success',
    inactive: 'warning',
    received: 'primary',
    review: 'warning',
    interview: 'accent',
};
export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchQuery, setSearchQuery] = useState('');
    const { profile, logout, authError } = useAuth();
    const navigate = useNavigate();
    const role = profile?.role ?? 'admin';
    const budgets = mockGetBudgets();
    const partners = mockGetPartners();
    const suppliers = mockGetSuppliers();
    const candidates = mockGetCandidates();
    const stats = [
        {
            label: 'Orçamentos',
            value: budgets.length,
            icon: FileText,
            color: 'primary',
        },
        {
            label: 'Parceiros',
            value: partners.length,
            icon: Users,
            color: 'success',
        },
        {
            label: 'Fornecedores',
            value: suppliers.length,
            icon: Briefcase,
            color: 'accent',
        },
        {
            label: 'Currículos',
            value: candidates.length,
            icon: FileText,
            color: 'warning',
        },
    ];
    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };
    function renderTable() {
        switch (activeTab) {
            case 'clientes':
                return (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-sm", children: [_jsx("thead", { className: "bg-muted text-muted-foreground text-xs uppercase", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3", children: "Nome" }), _jsx("th", { className: "px-6 py-3", children: "Empresa" }), _jsx("th", { className: "px-6 py-3", children: "Servi\u00E7o" }), _jsx("th", { className: "px-6 py-3", children: "Status" }), _jsx("th", { className: "px-6 py-3", children: "Data" }), _jsx("th", { className: "px-6 py-3", children: "A\u00E7\u00F5es" })] }) }), _jsx("tbody", { children: budgets.map((b) => (_jsxs("tr", { className: "border-border border-b", children: [_jsx("td", { className: "text-foreground px-6 py-4 font-medium", children: b.name }), _jsx("td", { className: "text-muted-foreground px-6 py-4", children: b.company }), _jsx("td", { className: "text-muted-foreground px-6 py-4", children: b.service }), _jsx("td", { className: "px-6 py-4", children: _jsx("span", { className: cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', STATUS_COLORS[STATUS_VARIANTS[b.status]]), children: b.status }) }), _jsx("td", { className: "text-muted-foreground px-6 py-4", children: new Date(b.createdAt).toLocaleDateString('pt-BR') }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", "aria-label": "Ver", children: _jsx(Eye, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", "aria-label": "Editar", children: _jsx(Edit, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => mockDeleteBudget(b.id), "aria-label": "Excluir", className: "text-destructive hover:text-destructive/80", children: _jsx(Trash2, { className: "h-4 w-4" }) })] }) })] }, b.id))) })] }) }));
            case 'parceiros':
                return (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-sm", children: [_jsx("thead", { className: "bg-muted text-muted-foreground text-xs uppercase", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3", children: "Empresa" }), _jsx("th", { className: "px-6 py-3", children: "CNPJ" }), _jsx("th", { className: "px-6 py-3", children: "Respons\u00E1vel" }), _jsx("th", { className: "px-6 py-3", children: "Status" }), _jsx("th", { className: "px-6 py-3", children: "A\u00E7\u00F5es" })] }) }), _jsx("tbody", { children: partners.map((p) => (_jsxs("tr", { className: "border-border border-b", children: [_jsx("td", { className: "text-foreground px-6 py-4 font-medium", children: p.company }), _jsx("td", { className: "text-muted-foreground px-6 py-4", children: p.cnpj }), _jsx("td", { className: "text-muted-foreground px-6 py-4", children: p.responsible }), _jsx("td", { className: "px-6 py-4", children: _jsx("span", { className: cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', STATUS_COLORS[STATUS_VARIANTS[p.status]]), children: p.status }) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", "aria-label": "Ver", children: _jsx(Eye, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", "aria-label": "Editar", children: _jsx(Edit, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => mockDeletePartner(p.id), "aria-label": "Excluir", className: "text-destructive hover:text-destructive/80", children: _jsx(Trash2, { className: "h-4 w-4" }) })] }) })] }, p.id))) })] }) }));
            case 'fornecedores':
                return (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-sm", children: [_jsx("thead", { className: "bg-muted text-muted-foreground text-xs uppercase", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3", children: "Empresa" }), _jsx("th", { className: "px-6 py-3", children: "Produtos" }), _jsx("th", { className: "px-6 py-3", children: "Representante" }), _jsx("th", { className: "px-6 py-3", children: "Status" }), _jsx("th", { className: "px-6 py-3", children: "A\u00E7\u00F5es" })] }) }), _jsx("tbody", { children: suppliers.map((s) => (_jsxs("tr", { className: "border-border border-b", children: [_jsx("td", { className: "text-foreground px-6 py-4 font-medium", children: s.company }), _jsx("td", { className: "text-muted-foreground px-6 py-4", children: s.products }), _jsx("td", { className: "text-muted-foreground px-6 py-4", children: s.representative }), _jsx("td", { className: "px-6 py-4", children: _jsx("span", { className: cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', STATUS_COLORS[STATUS_VARIANTS[s.status]]), children: s.status }) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", "aria-label": "Ver", children: _jsx(Eye, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", "aria-label": "Editar", children: _jsx(Edit, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => mockDeleteSupplier(s.id), "aria-label": "Excluir", className: "text-destructive hover:text-destructive/80", children: _jsx(Trash2, { className: "h-4 w-4" }) })] }) })] }, s.id))) })] }) }));
            case 'curriculos':
                return (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-sm", children: [_jsx("thead", { className: "bg-muted text-muted-foreground text-xs uppercase", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3", children: "Nome" }), _jsx("th", { className: "px-6 py-3", children: "Vaga" }), _jsx("th", { className: "px-6 py-3", children: "Cidade" }), _jsx("th", { className: "px-6 py-3", children: "Status" }), _jsx("th", { className: "px-6 py-3", children: "Data" }), _jsx("th", { className: "px-6 py-3", children: "A\u00E7\u00F5es" })] }) }), _jsx("tbody", { children: candidates.map((c) => (_jsxs("tr", { className: "border-border border-b", children: [_jsx("td", { className: "text-foreground px-6 py-4 font-medium", children: c.name }), _jsx("td", { className: "text-muted-foreground px-6 py-4", children: c.position }), _jsx("td", { className: "text-muted-foreground px-6 py-4", children: c.city }), _jsx("td", { className: "px-6 py-4", children: _jsx("span", { className: cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', STATUS_COLORS[STATUS_VARIANTS[c.status]]), children: c.status }) }), _jsx("td", { className: "text-muted-foreground px-6 py-4", children: new Date(c.createdAt).toLocaleDateString('pt-BR') }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", "aria-label": "Ver", children: _jsx(Eye, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", "aria-label": "Editar", children: _jsx(Edit, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => mockDeleteCandidate(c.id), "aria-label": "Excluir", className: "text-destructive hover:text-destructive/80", children: _jsx(Trash2, { className: "h-4 w-4" }) })] }) })] }, c.id))) })] }) }));
            default:
                return null;
        }
    }
    const isCandidate = role === 'candidato';
    const isCompany = role === 'empresa';
    return (_jsxs("div", { className: "min-h-screen", children: [authError && (_jsx("div", { className: "bg-warning/10 text-warning mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8", children: _jsx("div", { className: "rounded-xl p-4 text-sm", children: authError }) })), _jsx("section", { className: "bg-muted py-8", children: _jsx("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "mb-2 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Shield, { className: "text-primary h-8 w-8" }), _jsxs("div", { children: [_jsx("h1", { className: "text-foreground text-3xl font-bold", children: isCandidate
                                                    ? 'Área do Candidato'
                                                    : isCompany
                                                        ? 'Área da Empresa'
                                                        : 'Painel Administrativo' }), _jsx("p", { className: "text-muted-foreground", children: isCandidate
                                                    ? 'Gerencie seu currículo e candidaturas.'
                                                    : isCompany
                                                        ? 'Publique vagas e acompanhe candidaturas.'
                                                        : 'Gerencie clientes, parceiros, fornecedores e currículos.' })] })] }), _jsx(Button, { variant: "outline", size: "sm", leftIcon: _jsx(LogOut, { className: "h-4 w-4" }), onClick: handleLogout, children: "Sair" })] }) }) }), _jsx("section", { className: "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8", children: _jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", children: stats.map((stat, index) => (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.1 }, className: "bg-card shadow-premium rounded-xl p-6", children: [_jsx("div", { className: cn('mb-4 inline-flex items-center justify-center rounded-lg p-3', stat.color === 'primary' && 'bg-primary/10 text-primary', stat.color === 'success' && 'bg-success/10 text-success', stat.color === 'accent' && 'bg-accent/10 text-accent', stat.color === 'warning' && 'bg-warning/10 text-warning'), children: _jsx(stat.icon, { className: "h-6 w-6" }) }), _jsx("p", { className: "text-foreground text-2xl font-bold", children: stat.value }), _jsx("p", { className: "text-muted-foreground text-sm", children: stat.label })] }, stat.label))) }) }), role === 'admin' && (_jsxs("section", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", children: [_jsx("div", { className: "border-border mb-6 border-b", children: _jsx("nav", { className: "flex gap-6 overflow-x-auto", "aria-label": "Tabs", children: tabMap.map((tab) => (_jsxs("button", { onClick: () => setActiveTab(tab.key), className: cn('flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-colors', activeTab === tab.key
                                    ? 'border-primary text-primary'
                                    : 'text-muted-foreground hover:text-foreground border-transparent'), children: [_jsx(tab.icon, { className: "h-4 w-4" }), tab.label] }, tab.key))) }) }), _jsxs("div", { className: "mb-6 flex flex-col gap-4 sm:flex-row", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" }), _jsx(Input, { placeholder: "Pesquisar...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "pl-10" })] }), _jsx(Button, { variant: "outline", leftIcon: _jsx(Filter, { className: "h-4 w-4" }), children: "Filtros" }), _jsx(Button, { variant: "outline", leftIcon: _jsx(Download, { className: "h-4 w-4" }), children: "Exportar CSV" })] }), _jsx("div", { className: "bg-card shadow-premium overflow-hidden rounded-2xl", children: activeTab === 'dashboard' ? (_jsxs("div", { className: "p-8 text-center", children: [_jsx(TrendingUp, { className: "text-muted-foreground mx-auto mb-4 h-12 w-12" }), _jsx("h3", { className: "text-foreground mb-2 text-lg font-semibold", children: "Vis\u00E3o Geral" }), _jsx("p", { className: "text-muted-foreground mb-6", children: "Selecione uma aba para visualizar os dados." }), _jsx("div", { className: "grid grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-4", children: stats.map((stat) => (_jsxs("div", { className: "bg-surface-alt rounded-lg p-4", children: [_jsx("p", { className: "text-foreground text-2xl font-bold", children: stat.value }), _jsx("p", { className: "text-muted-foreground text-sm", children: stat.label })] }, stat.label))) })] })) : (_jsx("div", { className: "p-6", children: budgets.length === 0 &&
                                partners.length === 0 &&
                                suppliers.length === 0 &&
                                candidates.length === 0 ? (_jsxs("div", { className: "py-12 text-center", children: [_jsx(FileText, { className: "text-muted-foreground mx-auto mb-4 h-12 w-12" }), _jsx("p", { className: "text-muted-foreground", children: "Nenhum registro encontrado." })] })) : (renderTable()) })) })] })), (isCandidate || isCompany) && (_jsx("section", { className: "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8", children: _jsxs("div", { className: "bg-card shadow-premium rounded-2xl p-8", children: [_jsx("h3", { className: "text-foreground mb-4 text-lg font-semibold", children: isCandidate ? 'Meu Perfil' : 'Minha Empresa' }), _jsx("p", { className: "text-muted-foreground", children: isCandidate
                                ? 'Gerencie seu currículo e acompanhe suas candidaturas.'
                                : 'Gerencie as vagas da sua empresa e acompanhe os candidatos.' })] }) }))] }));
}
