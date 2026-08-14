import { jsx as _jsx } from "react/jsx-runtime";
import {} from 'react';
export function Container({ children, className }) {
    return (_jsx("div", { className: `mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 ${className ?? ''}`, children: children }));
}
