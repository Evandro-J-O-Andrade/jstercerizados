import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect, } from 'react';
const ThemeContext = createContext(undefined);
function getSystemTheme() {
    if (typeof window === 'undefined')
        return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
}
export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(() => {
        if (typeof window === 'undefined')
            return 'dark';
        const stored = localStorage.getItem('jst-theme');
        return stored ?? 'dark';
    });
    const resolvedTheme = theme === 'system' ? getSystemTheme() : theme;
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(resolvedTheme);
    }, [resolvedTheme]);
    useEffect(() => {
        const handler = () => {
            if (theme === 'system') {
                root.classList.remove('light', 'dark');
                root.classList.add(getSystemTheme());
            }
        };
        const root = document.documentElement;
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, [theme]);
    const setTheme = (t) => {
        localStorage.setItem('jst-theme', t);
        setThemeState(t);
    };
    const toggleTheme = () => {
        const next = resolvedTheme === 'light' ? 'dark' : 'light';
        setTheme(next);
    };
    return (_jsx(ThemeContext.Provider, { value: { theme, resolvedTheme, setTheme, toggleTheme }, children: children }));
}
// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return ctx;
};
