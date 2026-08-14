import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function PageLoader() {
    return (_jsx("div", { className: "flex min-h-[60vh] items-center justify-center", children: _jsxs("div", { className: "flex flex-col items-center gap-4", children: [_jsx("div", { className: "border-border border-t-primary h-10 w-10 animate-spin rounded-full border-4" }), _jsx("p", { className: "text-muted-foreground text-sm", children: "Carregando..." })] }) }));
}
