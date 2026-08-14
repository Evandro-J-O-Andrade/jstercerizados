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

export function IntroProvider({ children }: { children: ReactNode }) {
  const [introComplete, setIntroComplete] = useState<boolean>(false);

  const setIntroCompleteMemo = useCallback((value: boolean) => {
    setIntroComplete(value);
  }, []);

  return (
    <IntroContext.Provider
      value={{ introComplete, setIntroComplete: setIntroCompleteMemo }}
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
