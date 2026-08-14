import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

interface IntroContextValue {
  introComplete: boolean;
  setIntroComplete: (value: boolean) => void;
}

const IntroContext = createContext<IntroContextValue | null>(null);

const INTRO_KEY = 'jse_intro_complete';

function getInitialState(): boolean {
  if (typeof sessionStorage === 'undefined') {
    return false;
  }
  const stored = sessionStorage.getItem(INTRO_KEY);
  return stored === 'true';
}

export function IntroProvider({ children }: { children: ReactNode }) {
  const [introComplete, setIntroComplete] = useState<boolean>(getInitialState);

  const setIntroCompletePersistent = useCallback((value: boolean) => {
    setIntroComplete(value);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(INTRO_KEY, String(value));
    }
  }, []);

  return (
    <IntroContext.Provider
      value={{ introComplete, setIntroComplete: setIntroCompletePersistent }}
    >
      {children}
    </IntroContext.Provider>
  );
}

export function useIntro() {
  const context = useContext(IntroContext);
  if (!context) {
    throw new Error('useIntro must be used within IntroProvider');
  }
  return context;
}
