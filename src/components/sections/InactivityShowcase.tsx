import { useState, useEffect, useCallback, useRef } from 'react';
import { CinematicShowcase } from './CinematicShowcase';

const IDLE_THRESHOLD = 5 * 60 * 1000;

const IDLE_EVENTS = [
  'pointermove',
  'pointerdown',
  'keydown',
  'scroll',
  'touchstart',
] as const;

export function InactivityShowcase() {
  const [triggered, setTriggered] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasTriggered = useRef(false);

  const handleFinish = useCallback(() => {
    setTriggered(false);
  }, []);

  useEffect(() => {
    const resetTimer = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (triggered || hasTriggered.current) return;
      idleTimer.current = setTimeout(() => {
        hasTriggered.current = true;
        setTriggered(true);
      }, IDLE_THRESHOLD);
    };

    const handleActivity = () => {
      if (triggered) return;
      resetTimer();
    };

    IDLE_EVENTS.forEach((event) =>
      window.addEventListener(event, handleActivity, { passive: true }),
    );
    resetTimer();

    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      IDLE_EVENTS.forEach((event) =>
        window.removeEventListener(event, handleActivity),
      );
    };
  }, [triggered]);

  if (!triggered) return null;

  return <CinematicShowcase onFinish={handleFinish} />;
}
