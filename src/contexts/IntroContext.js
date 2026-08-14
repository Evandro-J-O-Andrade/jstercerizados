import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState } from 'react';
const IntroContext = createContext(null);
const INTRO_KEY = 'jse_intro_complete';
function getInitialState() {
    if (typeof sessionStorage === 'undefined') {
        return false;
    }
    const stored = sessionStorage.getItem(INTRO_KEY);
    return stored === 'true';
}
export function IntroProvider({ children }) {
    const [introComplete, setIntroComplete] = useState(getInitialState);
    const setIntroCompletePersistent = useCallback((value) => {
        setIntroComplete(value);
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(INTRO_KEY, String(value));
        }
    }, []);
    return (_jsx(IntroContext.Provider, { value: { introComplete, setIntroComplete: setIntroCompletePersistent }, children: children }));
}
export function useIntro() {
    const context = useContext(IntroContext);
    if (!context) {
        throw new Error('useIntro must be used within IntroProvider');
    }
    return context;
}
