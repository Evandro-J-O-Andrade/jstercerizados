import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useState } from 'react';
const IntroContext = createContext(null);
export function IntroProvider({ children }) {
    const [introComplete, setIntroComplete] = useState(false);
    const setIntroCompleteMemo = useCallback((value) => {
        setIntroComplete(value);
    }, []);
    return (_jsx(IntroContext.Provider, { value: { introComplete, setIntroComplete: setIntroCompleteMemo }, children: children }));
}
export function useIntro() {
    const context = useContext(IntroContext);
    if (!context) {
        throw new Error('useIntro must be used within IntroProvider');
    }
    return context;
}
