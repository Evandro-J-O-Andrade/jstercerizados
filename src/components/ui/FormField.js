import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import {} from 'react';
import { cn } from '@/utils';
import { Label } from '@/components/ui/Label';
export function FormField({ label, error, helperText, required, className, children, }) {
    const fieldId = children?.props?.id ?? children?.props?.name;
    return (_jsxs("div", { className: cn('w-full', className), children: [label && (_jsxs(Label, { htmlFor: fieldId, children: [label, required && _jsx("span", { className: "text-destructive ml-1", children: "*" })] })), children, error && (_jsx("p", { id: typeof fieldId === 'string' ? `${fieldId}-error` : undefined, className: "text-destructive mt-1.5 text-sm", role: "alert", children: error })), helperText && !error && (_jsx("p", { className: "text-muted-foreground mt-1.5 text-sm", children: helperText }))] }));
}
