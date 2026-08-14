import { jsx as _jsx } from "react/jsx-runtime";
import {} from 'react';
import { twMerge } from 'tailwind-merge';
export function Section({ children, className, id }) {
    return (_jsx("section", { id: id, className: twMerge('py-[80px] sm:py-[100px] lg:py-[120px]', className), children: children }));
}
