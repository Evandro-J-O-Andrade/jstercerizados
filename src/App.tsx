import { Suspense, lazy, useState, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { AccessibilityWidget } from '@/components/ui/AccessibilityWidget';
import { ChatWidget } from '@/components/ui/ChatWidget';
import { HumanChatWidget } from '@/components/ui/HumanChatWidget';
import { PageLoader } from '@/components/ui/PageLoader';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { useIntro } from '@/contexts/IntroContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ToastProvider } from '@/components/feedback';
import { CinematicShowcase } from '@/components/sections/CinematicShowcase';
import NotFound from '@/pages/NotFound';

const Home = lazy(() => import('@/pages/Home'));
const Sobre = lazy(() => import('@/pages/Sobre'));
const Servicos = lazy(() => import('@/pages/Servicos'));
const ServicoDetalhe = lazy(() => import('@/pages/ServicoDetalhe'));
const Vagas = lazy(() => import('@/pages/Vagas'));
const VagaDetalhe = lazy(() => import('@/pages/VagaDetalhe'));
const Empresas = lazy(() => import('@/pages/Empresas'));
const DivulgarVaga = lazy(() => import('@/pages/DivulgarVaga'));
const Candidatos = lazy(() => import('@/pages/Candidatos'));
const Blog = lazy(() => import('@/pages/Blog'));
const Parceiros = lazy(() => import('@/pages/Parceiros'));
const Fornecedores = lazy(() => import('@/pages/Fornecedores'));
const Clientes = lazy(() => import('@/pages/Clientes'));
const ProcessoSeletivo = lazy(() => import('@/pages/ProcessoSeletivo'));
const TrabalheConosco = lazy(() => import('@/pages/TrabalheConosco'));
const Suporte = lazy(() => import('@/pages/Suporte'));
const FAQ = lazy(() => import('@/pages/FAQ'));
const Contato = lazy(() => import('@/pages/Contato'));
const Privacidade = lazy(() => import('@/pages/Privacidade'));
const Termos = lazy(() => import('@/pages/Termos'));
const Cadastro = lazy(() => import('@/pages/Cadastro'));
const Login = lazy(() => import('@/pages/Login'));
const CadastroCandidato = lazy(() => import('@/pages/CadastroCandidato'));
const CadastroEmpresa = lazy(() => import('@/pages/CadastroEmpresa'));
const RecuperarSenha = lazy(() => import('@/pages/RecuperarSenha'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));

function App() {
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [isHumanChatOpen, setIsHumanChatOpen] = useState(false);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const { introComplete, setIntroComplete } = useIntro();

  const handleIntroFinish = useCallback(() => {
    setIntroComplete(true);
  }, [setIntroComplete]);

  if (!introComplete) {
    return (
      <AnimatePresence mode="wait">
        <CinematicShowcase key="intro" onFinish={handleIntroFinish} />
      </AnimatePresence>
    );
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="flex min-h-screen flex-col overflow-x-hidden">
          <ScrollToTop />
          <Navbar />
          <main className="flex-1 pt-16 pb-24 lg:pt-20 lg:pb-0">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/vagas" element={<Vagas />} />
                <Route path="/vagas/:slug" element={<VagaDetalhe />} />
                <Route path="/empresas" element={<Empresas />} />
                <Route
                  path="/empresas/divulgar-vaga"
                  element={<DivulgarVaga />}
                />
                <Route path="/candidatos" element={<Candidatos />} />
                <Route path="/servicos" element={<Servicos />} />
                <Route path="/servicos/:slug" element={<ServicoDetalhe />} />
                <Route path="/clientes" element={<Clientes />} />
                <Route path="/parceiros" element={<Parceiros />} />
                <Route path="/fornecedores" element={<Fornecedores />} />
                <Route path="/trabalhe-conosco" element={<TrabalheConosco />} />
                <Route
                  path="/processo-seletivo"
                  element={<ProcessoSeletivo />}
                />
                <Route path="/sobre" element={<Sobre />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<Blog />} />
                <Route path="/suporte" element={<Suporte />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/contato" element={<Contato />} />
                <Route path="/privacidade" element={<Privacidade />} />
                <Route path="/termos" element={<Termos />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cadastro" element={<Cadastro />} />
                <Route path="/recuperar-senha" element={<RecuperarSenha />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/candidato"
                  element={
                    <ProtectedRoute allowedRoles={['candidato', 'admin']}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/empresa"
                  element={
                    <ProtectedRoute allowedRoles={['empresa', 'admin']}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cadastro/candidato"
                  element={<CadastroCandidato />}
                />
                <Route path="/cadastro/empresa" element={<CadastroEmpresa />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          <div className="pb-56 lg:pb-0">
            <Footer
              onOpenAccessibility={() => setIsAccessibilityOpen(true)}
              onOpenChat={() => {
                setIsAccessibilityOpen(false);
                setIsAiChatOpen(true);
              }}
            />
          </div>
          <BottomNavigation />
          <AccessibilityWidget
            open={isAccessibilityOpen}
            onOpenChange={setIsAccessibilityOpen}
            onOpenChat={() => {
              setIsAccessibilityOpen(false);
              setIsAiChatOpen(true);
            }}
          />
          <ChatWidget
            isOpen={isAiChatOpen}
            onOpenChange={setIsAiChatOpen}
            onRequestHuman={() => {
              setIsAiChatOpen(false);
              setIsHumanChatOpen(true);
            }}
          />
          <HumanChatWidget
            isOpen={isHumanChatOpen}
            onOpenChange={setIsHumanChatOpen}
          />
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
