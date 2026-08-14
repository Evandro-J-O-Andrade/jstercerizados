import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import {} from 'react';
import { cn } from '@/utils';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
const VARIANT_STYLES = {
    error: 'border-destructive/30 bg-destructive/5 text-destructive',
    success: 'border-success/30 bg-success/5 text-success',
    info: 'border-primary/30 bg-primary/5 text-primary',
};
const VARIANT_ICONS = {
    error: AlertCircle,
    success: CheckCircle2,
    info: Info,
};
export function FormAlert({ variant = 'info', title, description, action, className, }) {
    const Icon = VARIANT_ICONS[variant];
    return (_jsxs("div", { role: "alert", "aria-live": "polite", className: cn('flex gap-3 rounded-xl border p-4', VARIANT_STYLES[variant], className), children: [_jsx(Icon, { className: "mt-0.5 h-5 w-5 shrink-0" }), _jsxs("div", { className: "flex-1", children: [title && _jsx("p", { className: "text-sm font-semibold", children: title }), description && _jsx("p", { className: "text-sm opacity-90", children: description }), action && _jsx("div", { className: "mt-3", children: action })] })] }));
}
