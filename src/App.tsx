import React, { Suspense, lazy, useCallback, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useIntro } from '@/contexts/IntroContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { FirstAccessRoute } from '@/components/auth/FirstAccessRoute';
import { AuthRoute } from '@/components/auth/AuthRoute';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ToastProvider } from '@/components/feedback';
import { CinematicShowcase } from '@/components/sections/CinematicShowcase';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AppShell } from '@/components/layout/AppShell';
import { AccessibilityWidget } from '@/components/ui/AccessibilityWidget';
import { ChatWidget } from '@/components/ui/ChatWidget';
import { HumanChatWidget } from '@/components/ui/HumanChatWidget';
import NotFound from '@/pages/NotFound';
import DashboardHome from '@/pages/dashboard/DashboardHome';
import TenantsPage from '@/pages/dashboard/TenantsPage';
import ClientesPage from '@/pages/dashboard/ClientesPage';
import OnboardingPage from '@/pages/dashboard/OnboardingPage';
import AssinaturasPage from '@/pages/dashboard/AssinaturasPage';
import GestaoSaaSPage from '@/pages/dashboard/GestaoSaaSPage';
import CatalogoPage from '@/pages/dashboard/CatalogoPage';
import DocumentosPage from '@/pages/dashboard/DocumentosPage';
import ContratosPage from '@/pages/dashboard/ContratosPage';
import TermosPage from '@/pages/dashboard/TermosPage';
import LgpdPage from '@/pages/dashboard/LgpdPage';
import SegurancaPage from '@/pages/dashboard/SegurancaPage';
import MonitoramentoPage from '@/pages/dashboard/MonitoramentoPage';
import IntegracoesPage from '@/pages/dashboard/IntegracoesPage';
import FiscalPage from '@/pages/dashboard/FiscalPage';
import ContabilidadePage from '@/pages/dashboard/ContabilidadePage';
import AuditoriaPage from '@/pages/dashboard/AuditoriaPage';
import IaPage from '@/pages/dashboard/IaPage';
import GestaoPage from '@/pages/dashboard/GestaoPage';
import {
  MODULE_PAGE_MAP,
  MODULE_PERMISSION_MAP,
  PORTAL_MODULES,
} from '@/components/portal/ModuleRegistry';
import AuthTerms from '@/pages/auth/Termos';
import AuthWelcome from '@/pages/auth/BoasVindas';

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
const PrimeiroAcessoTermos = lazy(
  () => import('@/pages/primeiro-acesso/Termos'),
);
const PrimeiroAcessoSenha = lazy(() => import('@/pages/primeiro-acesso/Senha'));
import { DashboardRouteNotFound } from '@/components/dashboard/DashboardRouter';
import VisaoGeralPage from '@/pages/dashboard/VisaoGeral';
import VagasPage from '@/pages/dashboard/Vagas';
import CandidaturasPage from '@/pages/dashboard/Candidaturas';
import CandidatosPage from '@/pages/dashboard/Candidatos';
import CandidatoDetalhe from '@/pages/dashboard/CandidatoDetalhe';
import CandidatoHabilidades from '@/pages/dashboard/CandidatoHabilidades';
import CandidatoFormacao from '@/pages/dashboard/CandidatoFormacao';
import CandidatoExperiencias from '@/pages/dashboard/CandidatoExperiencias';
import CandidatoIdiomas from '@/pages/dashboard/CandidatoIdiomas';
import CandidatoDocumentos from '@/pages/dashboard/CandidatoDocumentos';
import CandidatoPreferencias from '@/pages/dashboard/CandidatoPreferencias';
import CandidatoVisualizacoes from '@/pages/dashboard/CandidatoVisualizacoes';
import JobMatches from '@/pages/dashboard/JobMatches';
import EmpresasPage from '@/pages/dashboard/Empresas';
import ParceirosPage from '@/pages/dashboard/Parceiros';
import FornecedoresPage from '@/pages/dashboard/Fornecedores';
import UsuariosPage from '@/pages/dashboard/Usuarios';
import ProcessosSeletivosPage from '@/pages/dashboard/ProcessosSeletivos';
import EtapasPage from '@/pages/dashboard/Etapas';
import FuncionariosPage from '@/pages/dashboard/Funcionarios';
import FuncionarioDetalhe from '@/pages/dashboard/FuncionarioDetalhe';
import ExperienciasPage from '@/pages/dashboard/Experiencias';
import FormacaoPage from '@/pages/dashboard/Formacao';
import CursosPage from '@/pages/dashboard/Cursos';
import IdiomasPage from '@/pages/dashboard/Idiomas';
import HabilidadesPage from '@/pages/dashboard/Habilidades';
import DocumentosRhPage from '@/pages/dashboard/DocumentosRh';
import BancoDeTalentosPage from '@/pages/dashboard/BancoDeTalentos';
import DashboardRhPage from '@/pages/dashboard/DashboardRh';
import ServicosPage from '@/pages/dashboard/Servicos';
import FinanceiroPage from '@/pages/dashboard/FinanceiroPage';
import EstoquePage from '@/pages/dashboard/Estoque';
import SuportePage from '@/pages/dashboard/Suporte';
import RelatoriosPage from '@/pages/dashboard/Relatorios';
import ConfiguracoesPage from '@/pages/dashboard/Configuracoes';
import RbacAuditPage from '@/pages/dashboard/RbacAuditPage';
import RolesPermissoesPage from '@/pages/dashboard/RolesPermissoesPage';
import CompanyRelationshipsPage from '@/pages/dashboard/CompanyRelationshipsPage';
import SkillsPage from '@/pages/dashboard/SkillsPage';
import NotificationsPage from '@/pages/dashboard/NotificationsPage';
import ApplicationDetailPage from '@/pages/dashboard/ApplicationDetailPage';
import SessoesPage from '@/pages/dashboard/SessoesPage';
import FluxoDeCaixaPage from '@/pages/dashboard/FluxoDeCaixaPage';
import ContasReceberPage from '@/pages/dashboard/ContasReceberPage';

const PAGE_COMPONENTS: Record<string, React.ComponentType> = {
  DashboardHome,
  TenantsPage,
  ClientesPage,
  OnboardingPage,
  AssinaturasPage,
  GestaoSaaSPage,
  CatalogoPage,
  DocumentosPage,
  ContratosPage,
  TermosPage,
  LgpdPage,
  SegurancaPage,
  MonitoramentoPage,
  IntegracoesPage,
  FiscalPage,
  ContabilidadePage,
  AuditoriaPage,
  IaPage,
  GestaoPage,
  RbacAuditPage,
  RolesPermissoesPage,
  VisaoGeralPage,
  VagasPage,
  CandidaturasPage,
  CandidatosPage,
  CandidatoDetalhe,
  CandidatoHabilidades,
  CandidatoFormacao,
  CandidatoExperiencias,
  CandidatoIdiomas,
  CandidatoDocumentos,
  CandidatoPreferencias,
  CandidatoVisualizacoes,
  JobMatches,
  EmpresasPage,
  ParceirosPage,
  FornecedoresPage,
  UsuariosPage,
  ProcessosSeletivosPage,
  EtapasPage,
  FuncionariosPage,
  ExperienciasPage,
  FormacaoPage,
  CursosPage,
  IdiomasPage,
  HabilidadesPage,
  DocumentosRhPage,
  BancoDeTalentosPage,
  DashboardRhPage,
  ServicosPage,
  FinanceiroPage,
  EstoquePage,
  SuportePage,
  RelatoriosPage,
  ConfiguracoesPage,
  CompanyRelationshipsPage,
  SkillsPage,
  NotificationsPage,
  ApplicationDetailPage,
  SessoesPage,
};

function App() {
  const { introComplete, setIntroComplete } = useIntro();
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [isHumanChatOpen, setIsHumanChatOpen] = useState(false);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);

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

  const platformModules = PORTAL_MODULES.filter(
    (module) => module.scope === 'platform',
  );
  const tenantModules = PORTAL_MODULES.filter(
    (module) => module.scope === 'tenant',
  );

  const dashboardRoutes = [
    { path: '', element: <DashboardHome />, exact: true },
    ...(platformModules.length ? platformModules : [])
      .filter(
        (module) =>
          MODULE_PAGE_MAP[module.id] &&
          (MODULE_PERMISSION_MAP[module.id] ||
            !module.requiredPermissions?.length),
      )
      .map((module) => ({
        path:
          module.route === '/dashboard'
            ? ''
            : module.route.replace('/dashboard/', ''),
        element: (
          <PermissionGuard permission={MODULE_PERMISSION_MAP[module.id]}>
            {PAGE_COMPONENTS[MODULE_PAGE_MAP[module.id]] ? (
              React.createElement(PAGE_COMPONENTS[MODULE_PAGE_MAP[module.id]])
            ) : (
              <DashboardRouteNotFound />
            )}
          </PermissionGuard>
        ),
      })),
    ...(tenantModules.length ? tenantModules : [])
      .filter(
        (module) =>
          MODULE_PAGE_MAP[module.id] &&
          (MODULE_PERMISSION_MAP[module.id] ||
            !module.requiredPermissions?.length),
      )
      .map((module) => ({
        path:
          module.route === '/dashboard'
            ? ''
            : module.route.replace('/dashboard/', ''),
        element: (
          <PermissionGuard permission={MODULE_PERMISSION_MAP[module.id]}>
            {PAGE_COMPONENTS[MODULE_PAGE_MAP[module.id]] ? (
              React.createElement(PAGE_COMPONENTS[MODULE_PAGE_MAP[module.id]])
            ) : (
              <DashboardRouteNotFound />
            )}
          </PermissionGuard>
        ),
      })),
  ];

  return (
    <ErrorBoundary>
      <ToastProvider>
        <Routes>
          <Route
            path="/dashboard/*"
            element={
              <AuthRoute>
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
              </AuthRoute>
            }
          >
            {dashboardRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
            <Route
              path="rbac-auditoria"
              element={
                <PermissionGuard permission="audit.read">
                  <RbacAuditPage />
                </PermissionGuard>
              }
            />
            <Route
              path="relacionamentos"
              element={
                <PermissionGuard permission="companies.read">
                  <CompanyRelationshipsPage />
                </PermissionGuard>
              }
            />
            <Route
              path="notificacoes"
              element={
                <PermissionGuard permission="notifications.read">
                  <NotificationsPage />
                </PermissionGuard>
              }
            />
            <Route
              path="configuracoes/seguranca/sessoes"
              element={
                <PermissionGuard permission="sessions.read">
                  <SessoesPage />
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
              path="etapas"
              element={
                <PermissionGuard permission="recruitment.stage.manage">
                  <EtapasPage />
                </PermissionGuard>
              }
            />
            <Route
              path="funcionarios"
              element={
                <PermissionGuard permission="employees.read">
                  <FuncionariosPage />
                </PermissionGuard>
              }
            />
            <Route
              path="funcionarios/:id"
              element={
                <PermissionGuard permission="employees.read">
                  <FuncionarioDetalhe />
                </PermissionGuard>
              }
            />
            <Route
              path="experiencias"
              element={
                <PermissionGuard permission="employees.read">
                  <ExperienciasPage />
                </PermissionGuard>
              }
            />
            <Route
              path="formacao"
              element={
                <PermissionGuard permission="employees.read">
                  <FormacaoPage />
                </PermissionGuard>
              }
            />
            <Route
              path="cursos"
              element={
                <PermissionGuard permission="employees.read">
                  <CursosPage />
                </PermissionGuard>
              }
            />
            <Route
              path="idiomas"
              element={
                <PermissionGuard permission="employees.read">
                  <IdiomasPage />
                </PermissionGuard>
              }
            />
            <Route
              path="habilidades"
              element={
                <PermissionGuard permission="employees.read">
                  <HabilidadesPage />
                </PermissionGuard>
              }
            />
            <Route
              path="documentos-rh"
              element={
                <PermissionGuard permission="employees.read">
                  <DocumentosRhPage />
                </PermissionGuard>
              }
            />
            <Route
              path="banco-de-talentos"
              element={
                <PermissionGuard permission="candidates.read">
                  <BancoDeTalentosPage />
                </PermissionGuard>
              }
            />
            <Route
              path="processos-seletivos/:id"
              element={
                <PermissionGuard permission="applications.read">
                  <ApplicationDetailPage />
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
              path="candidatos/:id"
              element={
                <PermissionGuard permission="candidates.read">
                  <CandidatoDetalhe />
                </PermissionGuard>
              }
            />
            <Route
              path="candidatos/habilidades"
              element={
                <PermissionGuard permission="candidates.read">
                  <CandidatoHabilidades />
                </PermissionGuard>
              }
            />
            <Route
              path="candidatos/formacao"
              element={
                <PermissionGuard permission="candidates.read">
                  <CandidatoFormacao />
                </PermissionGuard>
              }
            />
            <Route
              path="candidatos/experiencias"
              element={
                <PermissionGuard permission="candidates.read">
                  <CandidatoExperiencias />
                </PermissionGuard>
              }
            />
            <Route
              path="candidatos/idiomas"
              element={
                <PermissionGuard permission="candidates.read">
                  <CandidatoIdiomas />
                </PermissionGuard>
              }
            />
            <Route
              path="candidatos/documentos"
              element={
                <PermissionGuard permission="candidates.read">
                  <CandidatoDocumentos />
                </PermissionGuard>
              }
            />
            <Route
              path="candidatos/preferencias"
              element={
                <PermissionGuard permission="candidates.read">
                  <CandidatoPreferencias />
                </PermissionGuard>
              }
            />
            <Route
              path="candidatos/visualizacoes"
              element={
                <PermissionGuard permission="candidates.read">
                  <CandidatoVisualizacoes />
                </PermissionGuard>
              }
            />
            <Route
              path="matches"
              element={
                <PermissionGuard permission="jobs.read">
                  <JobMatches />
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
              path="candidaturas"
              element={
                <PermissionGuard permission="applications.read">
                  <CandidaturasPage />
                </PermissionGuard>
              }
            />
            <Route
              path="financeiro/contas-pagar"
              element={
                <PermissionGuard permission="finance.accounts_payable.read">
                  <FinanceiroPage />
                </PermissionGuard>
              }
            />
            <Route
              path="financeiro/contas-receber"
              element={
                <PermissionGuard permission="finance.accounts_receivable.read">
                  <ContasReceberPage />
                </PermissionGuard>
              }
            />
            <Route
              path="financeiro/fluxo-caixa"
              element={
                <PermissionGuard permission="finance.cashflow.read">
                  <FluxoDeCaixaPage />
                </PermissionGuard>
              }
            />
            <Route path="*" element={<DashboardRouteNotFound />} />
          </Route>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/auth/terms" element={<AuthTerms />} />
          <Route path="/auth/welcome" element={<AuthWelcome />} />
          <Route
            path="/primeiro-acesso/termos"
            element={
              <FirstAccessRoute>
                <PrimeiroAcessoTermos />
              </FirstAccessRoute>
            }
          />
          <Route
            path="/primeiro-acesso/senha"
            element={
              <FirstAccessRoute>
                <PrimeiroAcessoSenha />
              </FirstAccessRoute>
            }
          />
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
