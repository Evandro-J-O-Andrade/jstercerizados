import { Suspense, lazy, useState, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AccessibilityWidget } from '@/components/ui/AccessibilityWidget';
import { ChatWidget } from '@/components/ui/ChatWidget';
import { HumanChatWidget } from '@/components/ui/HumanChatWidget';
import { useIntro } from '@/contexts/IntroContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ToastProvider } from '@/components/feedback';
import { CinematicShowcase } from '@/components/sections/CinematicShowcase';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AppShell } from '@/components/layout/AppShell';
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
const Onboarding = lazy(() => import('@/pages/Onboarding'));
import { DashboardRouteNotFound } from '@/components/dashboard/DashboardRouter';
import VisaoGeralPage from '@/pages/dashboard/VisaoGeral';
import VagasPage from '@/pages/dashboard/Vagas';
import CandidatosPage from '@/pages/dashboard/Candidatos';
import EmpresasPage from '@/pages/dashboard/Empresas';
import ClientesPage from '@/pages/dashboard/Clientes';
import ParceirosPage from '@/pages/dashboard/Parceiros';
import FornecedoresPage from '@/pages/dashboard/Fornecedores';
import UsuariosPage from '@/pages/dashboard/Usuarios';
import ProcessosSeletivosPage from '@/pages/dashboard/ProcessosSeletivos';
import ServicosPage from '@/pages/dashboard/Servicos';
import FinanceiroPage from '@/pages/dashboard/Financeiro';
import EstoquePage from '@/pages/dashboard/Estoque';
import SuportePage from '@/pages/dashboard/Suporte';
import RelatoriosPage from '@/pages/dashboard/Relatorios';
import ConfiguracoesPage from '@/pages/dashboard/Configuracoes';

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
        <Routes>
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute
                allowedRoles={[
                  'admin_master',
                  'tenant_admin',
                  'operations_manager',
                  'operator',
                  'commercial',
                  'finance',
                  'finance_manager',
                  'recruiter',
                  'rh_manager',
                  'stock_manager',
                  'security_manager',
                  'facilities_manager',
                  'lawyer',
                  'it_admin',
                  'support',
                  'viewer',
                ]}
              >
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route
              path="visao-geral"
              element={
                <PermissionGuard permission="dashboard.read">
                  <VisaoGeralPage />
                </PermissionGuard>
              }
            />
            <Route
              path="vagas"
              element={
                <PermissionGuard permission="jobs.read">
                  <VagasPage />
                </PermissionGuard>
              }
            />
            <Route
              path="candidatos"
              element={
                <PermissionGuard permission="candidates.read">
                  <CandidatosPage />
                </PermissionGuard>
              }
            />
            <Route
              path="empresas"
              element={
                <PermissionGuard permission="companies.read">
                  <EmpresasPage />
                </PermissionGuard>
              }
            />
            <Route
              path="clientes"
              element={
                <PermissionGuard permission="companies.read">
                  <ClientesPage />
                </PermissionGuard>
              }
            />
            <Route
              path="parceiros"
              element={
                <PermissionGuard permission="companies.read">
                  <ParceirosPage />
                </PermissionGuard>
              }
            />
            <Route
              path="fornecedores"
              element={
                <PermissionGuard permission="companies.read">
                  <FornecedoresPage />
                </PermissionGuard>
              }
            />
            <Route
              path="usuarios"
              element={
                <PermissionGuard permission="people.read">
                  <UsuariosPage />
                </PermissionGuard>
              }
            />
            <Route
              path="processos-seletivos"
              element={
                <PermissionGuard permission="recruitment.read">
                  <ProcessosSeletivosPage />
                </PermissionGuard>
              }
            />
            <Route
              path="servicos"
              element={
                <PermissionGuard permission="service_orders.read">
                  <ServicosPage />
                </PermissionGuard>
              }
            />
            <Route
              path="financeiro"
              element={
                <PermissionGuard permission="purchase_orders.read">
                  <FinanceiroPage />
                </PermissionGuard>
              }
            />
            <Route
              path="estoque"
              element={
                <PermissionGuard permission="stock_movements.read">
                  <EstoquePage />
                </PermissionGuard>
              }
            />
            <Route
              path="suporte"
              element={
                <PermissionGuard permission="support_tickets.read">
                  <SuportePage />
                </PermissionGuard>
              }
            />
            <Route
              path="relatorios"
              element={
                <PermissionGuard permission="reports.read">
                  <RelatoriosPage />
                </PermissionGuard>
              }
            />
            <Route
              path="configuracoes"
              element={
                <PermissionGuard
                  permissions={['tenants.read', 'roles.read']}
                  mode="any"
                >
                  <ConfiguracoesPage />
                </PermissionGuard>
              }
            />
            <Route index element={<VisaoGeralPage />} />
            <Route path="*" element={<DashboardRouteNotFound />} />
          </Route>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route
            path="*"
            element={
              <PublicLayout>
                <Suspense fallback={null}>
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
                    <Route
                      path="/servicos/:slug"
                      element={<ServicoDetalhe />}
                    />
                    <Route path="/clientes" element={<Clientes />} />
                    <Route path="/parceiros" element={<Parceiros />} />
                    <Route path="/fornecedores" element={<Fornecedores />} />
                    <Route
                      path="/trabalhe-conosco"
                      element={<TrabalheConosco />}
                    />
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
                    <Route
                      path="/recuperar-senha"
                      element={<RecuperarSenha />}
                    />
                    <Route
                      path="/cadastro/candidato"
                      element={<CadastroCandidato />}
                    />
                    <Route
                      path="/cadastro/empresa"
                      element={<CadastroEmpresa />}
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </PublicLayout>
            }
          />
        </Routes>
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
            setIsAccessibilityOpen(false);
            setIsHumanChatOpen(true);
          }}
        />
        <HumanChatWidget
          isOpen={isHumanChatOpen}
          onOpenChange={setIsHumanChatOpen}
        />
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
