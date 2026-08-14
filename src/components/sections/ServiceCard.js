import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SERVICE_ICONS } from '@/constants/icons';
import { SafeImage } from '@/components/ui/SafeImage';
const CATEGORY_LABELS = {
    rh: 'Recursos Humanos',
    facilities: 'Facilities',
    terceirizacao: 'Terceirização',
    candidato: 'Para Candidatos',
};
export function ServiceCard({ service, index }) {
    const Icon = SERVICE_ICONS[service.icon] || SERVICE_ICONS.shield;
    return (_jsx(motion.div, { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: {
            duration: 0.6,
            ease: [0.25, 0.4, 0.25, 1],
            delay: index * 0.08,
        }, whileHover: { y: -6, scale: 1.01 }, children: _jsxs(Link, { to: `/servicos/${service.slug}`, className: "group bg-card shadow-premium hover:shadow-glow border-border hover:border-primary/30 focus-visible:ring-primary relative block h-full overflow-hidden rounded-3xl border transition-all duration-300 focus-visible:ring-2 focus-visible:outline-none", children: [_jsx("div", { className: "bg-primary/10 absolute inset-x-0 top-0 h-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100" }), _jsxs("div", { className: "relative h-52 overflow-hidden sm:h-56", children: [_jsx(SafeImage, { src: service.image, alt: service.title, loading: "lazy", decoding: "async", className: "h-full w-full object-cover opacity-80 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100" }), _jsx("div", { className: "from-card/90 via-card/40 absolute inset-0 bg-gradient-to-t to-transparent" }), _jsx("div", { className: "from-primary/10 absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" }), _jsx("div", { className: "bg-primary text-primary-foreground absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-xl shadow-lg", children: _jsx(Icon, { className: "h-6 w-6" }) })] }), _jsxs("div", { className: "p-5 sm:p-6", children: [_jsx("span", { className: "text-primary text-xs font-semibold tracking-wider uppercase", children: CATEGORY_LABELS[service.category] }), _jsx("h3", { className: "text-foreground group-hover:text-primary mt-2 text-xl font-bold transition-colors duration-300", children: service.title }), _jsx("p", { className: "text-muted-foreground mt-3 text-sm leading-relaxed", children: service.shortDescription }), _jsxs("div", { className: "text-primary mt-6 flex items-center gap-2 text-sm font-medium transition-transform group-hover:translate-x-1", children: [_jsx("span", { children: "Saiba mais" }), _jsx(ArrowRight, { className: "h-4 w-4" })] })] }), _jsx("div", { className: "from-primary/5 absolute inset-0 bg-gradient-to-br via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" })] }) }));
}
