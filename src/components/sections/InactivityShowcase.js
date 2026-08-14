import { jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect, useCallback, useRef } from 'react';
import { CinematicShowcase } from './CinematicShowcase';
const IDLE_THRESHOLD = 3 * 60 * 1000;
const IDLE_EVENTS = [
    'pointermove',
    'pointerdown',
    'keydown',
    'scroll',
    'touchstart',
];
export function InactivityShowcase() {
    const [triggered, setTriggered] = useState(false);
    const idleTimer = useRef(null);
    const hasTriggered = useRef(false);
    const handleFinish = useCallback(() => {
        setTriggered(false);
    }, []);
    useEffect(() => {
        const resetTimer = () => {
            if (idleTimer.current)
                clearTimeout(idleTimer.current);
            if (triggered || hasTriggered.current)
                return;
            idleTimer.current = setTimeout(() => {
                hasTriggered.current = true;
                setTriggered(true);
            }, IDLE_THRESHOLD);
        };
        const handleActivity = () => {
            if (triggered)
                return;
            resetTimer();
        };
        IDLE_EVENTS.forEach((event) => window.addEventListener(event, handleActivity, { passive: true }));
        resetTimer();
        return () => {
            if (idleTimer.current)
                clearTimeout(idleTimer.current);
            IDLE_EVENTS.forEach((event) => window.removeEventListener(event, handleActivity));
        };
    }, [triggered]);
    if (!triggered)
        return null;
    return _jsx(CinematicShowcase, { onFinish: handleFinish });
}
