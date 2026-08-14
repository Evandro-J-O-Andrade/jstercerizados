import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/ui/PageLoader';
import { Button } from '@/components/ui/Button';
import { Shield } from 'lucide-react';
import { motion } from 'framer-motion';
export function ProtectedRoute({ children, allowedRoles, }) {
    const { isAuthenticated, isLoading, profile, authError } = useAuth();
    const location = useLocation();
    if (isLoading) {
        return _jsx(PageLoader, {});
    }
    if (authError) {
        return (_jsx("div", { className: "flex min-h-[60vh] items-center justify-center", children: _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "max-w-md text-center", children: [_jsx("div", { className: "bg-warning/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full", children: _jsx(Shield, { className: "text-warning h-10 w-10" }) }), _jsx("h2", { className: "text-foreground mb-4 text-2xl font-bold", children: "Autentica\u00E7\u00E3o indispon\u00EDvel" }), _jsx("p", { className: "text-muted-foreground mb-6", children: authError }), _jsx(Button, { variant: "primary", size: "lg", onClick: () => {
                            window.location.reload();
                        }, children: "Tentar novamente" })] }) }));
    }
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: "/login", state: { from: location }, replace: true });
    }
    if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
        const fallback = profile.role === 'admin' ? '/dashboard' : '/dashboard';
        return _jsx(Navigate, { to: fallback, replace: true });
    }
    if (allowedRoles && !profile) {
        return _jsx(Navigate, { to: "/login", state: { from: location }, replace: true });
    }
    return _jsx(_Fragment, { children: children });
}
