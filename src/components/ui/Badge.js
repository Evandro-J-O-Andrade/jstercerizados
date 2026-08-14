import { jsx as _jsx } from "react/jsx-runtime";
import {} from 'react';
import { cn } from '@/utils';
export function Badge({ className, variant = 'default', children, ...props }) {
    return (_jsx("span", { className: cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', {
            'bg-muted text-muted-foreground': variant === 'default',
            'bg-primary/10 text-primary': variant === 'secondary',
            'bg-success/10 text-success': variant === 'success',
            'bg-warning/10 text-warning': variant === 'warning',
            'bg-destructive/10 text-destructive': variant === 'danger',
            'border-border text-muted-foreground border bg-transparent': variant === 'outline',
        }, className), ...props, children: children }));
}
