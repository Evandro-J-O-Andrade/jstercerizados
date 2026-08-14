import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, Shield, Briefcase, Users, LayoutDashboard, FileText, Settings, Building2, LogIn, } from 'lucide-react';
import { cn } from '@/utils';
import { useAuth } from '@/contexts/AuthContext';
const publicNavItems = [
    { label: 'Início', href: '/', icon: Home },
    { label: 'Vagas', href: '/vagas', icon: Briefcase },
    { label: 'Serviços', href: '/servicos', icon: Shield },
    { label: 'Empresas', href: '/empresas', icon: Building2 },
    { label: 'Candidatos', href: '/candidatos', icon: Users },
    { label: 'Entrar', href: '/login', icon: LogIn },
];
const candidateNavItems = [
    { label: 'Início', href: '/', icon: Home },
    { label: 'Vagas', href: '/vagas', icon: Briefcase },
    { label: 'Currículo', href: '/dashboard/candidato', icon: FileText },
];
const companyNavItems = [
    { label: 'Início', href: '/', icon: Home },
    { label: 'Vagas', href: '/vagas', icon: Briefcase },
    { label: 'Candidatos', href: '/candidatos', icon: Users },
];
const adminNavItems = [
    { label: 'Painel', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Leads', href: '#', icon: FileText },
    { label: 'Parceiros', href: '#', icon: Users },
    { label: 'Configurações', href: '#', icon: Settings },
];
export function BottomNavigation() {
    const { pathname } = useLocation();
    const { isAuthenticated, profile } = useAuth();
    const navItems = isAuthenticated
        ? profile?.role === 'admin'
            ? adminNavItems
            : profile?.role === 'empresa'
                ? companyNavItems
                : candidateNavItems
        : publicNavItems;
    return (_jsx("nav", { className: "bg-card border-border fixed right-0 bottom-0 left-0 z-30 border-t backdrop-blur-xl backdrop-saturate-150 lg:hidden", children: _jsx("div", { className: "mx-auto flex max-w-lg items-center justify-around px-2 py-2 pt-[calc(0.375rem+env(safe-area-inset-top,0px))] pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]", children: navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (_jsxs(Link, { to: item.href, onClick: item.href === '/'
                        ? () => window.scrollTo({ top: 0, behavior: 'smooth' })
                        : undefined, className: cn('text-muted-foreground hover:bg-muted/50 hover:text-foreground relative flex flex-col items-center gap-1.5 rounded-xl px-3 py-2 transition-all duration-200', isActive && 'text-primary'), children: [isActive && (_jsx(motion.div, { layoutId: "bottomNavIndicator", className: "bg-primary/20 absolute -top-1 left-1/2 h-0.5 w-10 -translate-x-1/2 rounded-full", transition: { type: 'spring', stiffness: 500, damping: 30 } })), _jsx(Icon, { className: "h-6 w-6" }), _jsx("span", { className: "text-[10px] font-medium tracking-tight", children: item.label })] }, item.href));
            }) }) }));
}
