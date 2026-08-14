import { jsx as _jsx } from "react/jsx-runtime";
import {} from 'react';
import { twMerge } from 'tailwind-merge';
export function Label({ className, children, ...props }) {
    return (_jsx("label", { className: twMerge('text-muted-foreground block text-sm font-medium', className), ...props, children: children }));
}
