import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import {} from 'react';
import { cn } from '@/utils';
import { Link } from 'react-router-dom';
export function Button({ className, variant = 'primary', size = 'md', loading = false, leftIcon, rightIcon, asChild, to, children, disabled, ...props }) {
    const baseClasses = cn('inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50', {
        'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary shadow-sm hover:shadow-md': variant === 'primary',
        'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:ring-secondary shadow-sm hover:shadow-md': variant === 'secondary',
        'border-border text-foreground hover:bg-muted focus-visible:ring-ring border bg-transparent': variant === 'outline',
        'text-muted-foreground hover:bg-muted focus-visible:ring-ring': variant === 'ghost',
        'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive shadow-sm': variant === 'danger',
    }, {
        'h-9 px-3 text-sm': size === 'sm',
        'h-11 px-5 text-base': size === 'md',
        'h-13 px-7 text-lg': size === 'lg',
        'h-14 px-8 text-base': size === 'xl',
        'h-10 w-10 p-0': size === 'icon',
    }, className);
    const content = (_jsxs(_Fragment, { children: [loading && (_jsxs("svg", { className: "mr-2 h-4 w-4 animate-spin", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] })), leftIcon && !loading && (_jsx("span", { className: "mr-2 inline-flex", children: leftIcon })), children, rightIcon && _jsx("span", { className: "ml-2 inline-flex", children: rightIcon })] }));
    if (to) {
        return (_jsx(Link, { to: to, className: baseClasses, children: content }));
    }
    return (_jsx("button", { className: baseClasses, disabled: disabled || loading, ...props, children: content }));
}
