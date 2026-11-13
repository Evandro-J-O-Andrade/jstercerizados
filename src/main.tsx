import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { AccountProvider } from '@/contexts/AccountContext';
import { PlatformContextProvider } from '@/platform/platform-context';
import { IntroProvider } from '@/contexts/IntroContext';
import App from '@/App';
import '@/styles/index.css';

const container = document.getElementById('root')!;
// Limpa conteúdo pré-renderizado (SEO/no-JS) antes da montagem para evitar reconciliação incompatível com createRoot.
if (container.firstElementChild) {
  container.innerHTML = '';
}

createRoot(container).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <AccountProvider>
              <PlatformContextProvider>
                <IntroProvider>
                  <App />
                </IntroProvider>
              </PlatformContextProvider>
            </AccountProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
);
