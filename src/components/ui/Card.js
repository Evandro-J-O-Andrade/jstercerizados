import { jsx as _jsx } from "react/jsx-runtime";
import {} from 'react';
import { cn } from '@/utils';
export function Card({ className, variant = 'default', children, ...props }) {
    return (_jsx("div", { className: cn('bg-card overflow-hidden rounded-xl', {
            'shadow-premium': variant === 'default',
            'shadow-elevated': variant === 'elevated',
            'border-border border': variant === 'outline',
        }, className), ...props, children: children }));
}
