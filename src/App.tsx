import { Suspense, lazy, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useIntro } from '@/contexts/IntroContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { FirstAccessRoute } from '@/components/auth/FirstAccessRoute';
import { AuthRoute } from '@/components/auth/AuthRoute';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ToastProvider } from '@/components/feedback';
import { RouteLoadingFallback } from '@/components/ui/RouteLoadingFallback';
import { CinematicShowcase } from '@/components/sections/CinematicShowcase';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AppShell } from '@/components/layout/AppShell';
import { ModuleProvider } from '@/contexts/ModuleContext';
import { FloatingHelpWidgets } from '@/components/layout/FloatingHelpWidgets';
import NotFound from '@/pages/NotFound';
import DashboardHome from '@/pages/dashboard/DashboardHome';
import TenantsPage from '@/pages/dashboard/TenantsPage';
import OnboardingPage from '@/pages/dashboard/OnboardingPage';
import AssinaturasPage from '@/pages/dashboard/AssinaturasPage';
import GestaoSaaSPage from '@/pages/dashboard/GestaoSaaSPage';
import RolesPermissoesPage from '@/pages/dashboard/RolesPermissoesPage';
import AuditoriaPage from '@/pages/dashboard/AuditoriaPage';

import IaPage from '@/pages/dashboard/IaPage';
import IntegracoesPage from '@/pages/dashboard/IntegracoesPage';
import SegurancaPage from '@/pages/dashboard/SegurancaPage';
import { ModuleRouter } from '@/platform/router';
import { moduleRouteRegistries } from '@/platform/router/module-routes';
import { MODULE_PERMISSION_MAP } from '@/components/portal/ModuleRegistry';
import FiscalPage from '@/pages/dashboard/FiscalPage';
import Estoque from '@/pages/dashboard/Estoque';
import Almoxarifado from '@/pages/dashboard/Almoxarifado';
import GlobalDashboardPage from '@/pages/dashboard/GlobalDashboardPage';
import VisaoGeral from '@/pages/dashboard/VisaoGeral';
import AuthTerms from '@/pages/auth/Termos';
import AuthWelcome from '@/pages/auth/BoasVindas';
import AuthCallback from '@/pages/auth/AuthCallback';

const Home = lazy(() => import('@/pages/Home'));
const Sobre = lazy(() => import('@/pages/Sobre'));
const PublicServicos = lazy(() => import('@/pages/Servicos'));
const ServicoDetalhe = lazy(() => import('@/pages/ServicoDetalhe'));
const Vagas = lazy(() => import('@/pages/Vagas'));
const VagaDetalhe = lazy(() => import('@/pages/VagaDetalhe'));
const Empresas = lazy(() => import('@/pages/Empresas'));
const DivulgarVaga = lazy(() => import('@/pages/DivulgarVaga'));
const Candidatos = lazy(() => import('@/pages/Candidatos'));
const Clientes = lazy(() => import('@/pages/Clientes'));
const Blog = lazy(() => import('@/pages/Blog'));
const Parceiros = lazy(() => import('@/pages/Parceiros'));
const Fornecedores = lazy(() => import('@/pages/Fornecedores'));
const ProcessoSeletivo = lazy(() => import('@/pages/ProcessoSeletivo'));
const TrabalheConosco = lazy(() => import('@/pages/TrabalheConosco'));
const PublicSuporte = lazy(() => import('@/pages/Suporte'));
const FAQ = lazy(() => import('@/pages/FAQ'));
const Contato = lazy(() => import('@/pages/Contato'));
const Privacidade = lazy(() => import('@/pages/Privacidade'));
const Termos = lazy(() => import('@/pages/Termos'));
const Cadastro = lazy(() => import('@/pages/Cadastro'));
const Login = lazy(() => import('@/pages/Login'));
const EntrarHub = lazy(() => import('@/pages/auth/Entrar'));
const EntrarAdmin = lazy(() =>
  import('@/pages/auth/EntrarContexto').then((m) => ({
    default: m.EntrarAdmin,
  })),
);
const EntrarCandidato = lazy(() =>
  import('@/pages/auth/EntrarContexto').then((m) => ({
    default: m.EntrarCandidato,
  })),
);
const EntrarEmpresa = lazy(() =>
  import('@/pages/auth/EntrarContexto').then((m) => ({
    default: m.EntrarEmpresa,
  })),
);
const CadastroCandidato = lazy(() => import('@/pages/CadastroCandidato'));
const CadastroEmpresa = lazy(() => import('@/pages/CadastroEmpresa'));
const SuporteDashboardPage = lazy(() => import('@/modules/suporte/dashboard'));
const RecuperarSenha = lazy(() => import('@/pages/RecuperarSenha'));
const RedefinirSenha = lazy(() => import('@/pages/RedefinirSenha'));
const AlterarSenha = lazy(() => import('@/pages/AlterarSenha'));
const Onboarding = lazy(() => import('@/pages/Onboarding'));
const PrimeiroAcessoTermos = lazy(
  () => import('@/pages/primeiro-acesso/Termos'),
);
const PrimeiroAcessoSenha = lazy(() => import('@/pages/primeiro-acesso/Senha'));
import { CandidatoContainer } from '@/modules/candidato/CandidatoContainer';
import { CandidatoProvider } from '@/modules/candidato/CandidatoContext';
import ProcessosSeletivosPage from '@/pages/dashboard/ProcessosSeletivos';
import EtapasPage from '@/pages/dashboard/Etapas';
import FuncionariosPage from '@/pages/dashboard/Funcionarios';
import FuncionarioDetalhe from '@/pages/dashboard/FuncionarioDetalhe';
import DocumentosRhPage from '@/pages/dashboard/DocumentosRh';
import RelatoriosPage from '@/pages/dashboard/Relatorios';
import RbacAuditPage from '@/pages/dashboard/RbacAuditPage';
import CompanyRelationshipsPage from '@/pages/dashboard/CompanyRelationshipsPage';
import NotificationsPage from '@/pages/dashboard/NotificationsPage';
import ApplicationDetailPage from '@/pages/dashboard/ApplicationDetailPage';
import SessoesPage from '@/pages/dashboard/SessoesPage';
import RelatorioFinanceiroPage from '@/pages/dashboard/relatorios/RelatorioFinanceiroPage';
import RelatorioRhPage from '@/pages/dashboard/relatorios/RelatorioRhPage';
import RelatorioRecrutamentoPage from '@/pages/dashboard/relatorios/RelatorioRecrutamentoPage';
import RelatorioCrmPage from '@/pages/dashboard/relatorios/RelatorioCrmPage';
import RelatorioFaturamentoPage from '@/pages/dashboard/relatorios/RelatorioFaturamentoPage';
import RelatorioFiscalPage from '@/pages/dashboard/relatorios/RelatorioFiscalPage';
import RelatorioContabilidadePage from '@/pages/dashboard/relatorios/RelatorioContabilidadePage';
import RelatorioEstoquePage from '@/pages/dashboard/relatorios/RelatorioEstoquePage';
import RelatorioAlmoxarifadoPage from '@/pages/dashboard/relatorios/RelatorioAlmoxarifadoPage';
import RelatorioServicosPage from '@/pages/dashboard/relatorios/RelatorioServicosPage';
import RelatorioSuportePage from '@/pages/dashboard/relatorios/RelatorioSuportePage';
import { RHDashboardPage } from '@/modules/rh/dashboard';
import { RecrutamentoProvider } from '@/modules/recrutamento/RecrutamentoContext';
import { AvaProvider } from '@/modules/ava/context/AvaContext';
import { AvaDashboardPage } from '@/modules/ava/dashboard/AvaDashboardPage';
import { AvaTutorialPage } from '@/modules/ava/pages/AvaTutorialPage';

function App() {
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

  return <RoutesAndLayout />;
}

function RoutesAndLayout() {
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
                    'operations_operator',
                    'commercial',
                    'finance',
                    'finance_manager',
                    'recruiter',
                    'rh_manager',
                    'stock_manager',
                    'security_manager',
                    'facilities_manager',
                    'lawyer',
                    'it_operator',
                    'support_agent',
                    'viewer',
                    'company_representative',
                  ]}
                >
                  <AppShell />
                </ProtectedRoute>
              </AuthRoute>
            }
          >
            <Route path="" element={<DashboardHome />} />
            <Route
              path="analitico"
              element={
                <PermissionGuard permission="domain_events.read">
                  <VisaoGeral />
                </PermissionGuard>
              }
            />
            <Route
              path="global"
              element={
                <PermissionGuard permission="domain_events.read">
                  <GlobalDashboardPage />
                </PermissionGuard>
              }
            />

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
                <PermissionGuard permission={MODULE_PERMISSION_MAP.empresas}>
                  <CompanyRelationshipsPage />
                </PermissionGuard>
              }
            />
            <Route
              path="rh"
              element={
                <PermissionGuard permission={MODULE_PERMISSION_MAP.rh}>
                  <RHDashboardPage />
                </PermissionGuard>
              }
            />
            <Route
              path="notificacoes"
              element={
                <PermissionGuard
                  permission={MODULE_PERMISSION_MAP.notificacoes}
                >
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
              path="documentos-rh"
              element={
                <PermissionGuard permission="employees.read">
                  <DocumentosRhPage />
                </PermissionGuard>
              }
            />
            <Route
              path="processos-seletivos/:id"
              element={
                <PermissionGuard
                  permission={MODULE_PERMISSION_MAP.recrutamento}
                >
                  <ApplicationDetailPage />
                </PermissionGuard>
              }
            />
            <Route
              path="relatorios"
              element={
                <PermissionGuard permission={MODULE_PERMISSION_MAP.relatorios}>
                  <RelatoriosPage />
                </PermissionGuard>
              }
            />
            <Route
              path="relatorios/financeiro"
              element={
                <PermissionGuard permission={MODULE_PERMISSION_MAP.relatorios}>
                  <RelatorioFinanceiroPage />
                </PermissionGuard>
              }
            />
            <Route
              path="relatorios/rh"
              element={
                <PermissionGuard permission={MODULE_PERMISSION_MAP.relatorios}>
                  <RelatorioRhPage />
                </PermissionGuard>
              }
            />
            <Route
              path="relatorios/recrutamento"
              element={
                <PermissionGuard permission={MODULE_PERMISSION_MAP.relatorios}>
                  <RelatorioRecrutamentoPage />
                </PermissionGuard>
              }
            />
            <Route
              path="relatorios/crm"
              element={
                <PermissionGuard permission={MODULE_PERMISSION_MAP.relatorios}>
                  <RelatorioCrmPage />
                </PermissionGuard>
              }
            />
            <Route
              path="relatorios/faturamento"
              element={
                <PermissionGuard permission={MODULE_PERMISSION_MAP.relatorios}>
                  <RelatorioFaturamentoPage />
                </PermissionGuard>
              }
            />
            <Route
              path="relatorios/fiscal"
              element={
                <PermissionGuard permission={MODULE_PERMISSION_MAP.relatorios}>
                  <RelatorioFiscalPage />
                </PermissionGuard>
              }
            />
            <Route
              path="relatorios/contabilidade"
              element={
                <PermissionGuard permission={MODULE_PERMISSION_MAP.relatorios}>
                  <RelatorioContabilidadePage />
                </PermissionGuard>
              }
            />
            <Route
              path="relatorios/estoque"
              element={
                <PermissionGuard permission={MODULE_PERMISSION_MAP.relatorios}>
                  <RelatorioEstoquePage />
                </PermissionGuard>
              }
            />
            <Route
              path="relatorios/almoxarifado"
              element={
                <PermissionGuard permission={MODULE_PERMISSION_MAP.relatorios}>
                  <RelatorioAlmoxarifadoPage />
                </PermissionGuard>
              }
            />
            <Route
              path="relatorios/servicos"
              element={
                <PermissionGuard permission={MODULE_PERMISSION_MAP.relatorios}>
                  <RelatorioServicosPage />
                </PermissionGuard>
              }
            />
            <Route
              path="relatorios/suporte"
              element={
                <PermissionGuard permission={MODULE_PERMISSION_MAP.relatorios}>
                  <RelatorioSuportePage />
                </PermissionGuard>
              }
            />
            <Route
              path="fiscal"
              element={
                <PermissionGuard permission={MODULE_PERMISSION_MAP.fiscal}>
                  <FiscalPage />
                </PermissionGuard>
              }
            />
            <Route
              path="estoque"
              element={
                <PermissionGuard permission={MODULE_PERMISSION_MAP.estoque}>
                  <Estoque />
                </PermissionGuard>
              }
            />
            <Route
              path="almoxarifado"
              element={
                <PermissionGuard
                  permission={MODULE_PERMISSION_MAP.almoxarifado}
                >
                  <Almoxarifado />
                </PermissionGuard>
              }
            />
            <Route
              path="suporte"
              element={
                <PermissionGuard permission={MODULE_PERMISSION_MAP.suporte}>
                  <SuporteDashboardPage />
                </PermissionGuard>
              }
            />
            <Route
              path="ava"
              element={
                <AvaProvider>
                  <PermissionGuard permission={MODULE_PERMISSION_MAP.ava}>
                    <AvaDashboardPage />
                  </PermissionGuard>
                </AvaProvider>
              }
            />
            <Route
              path="ava/:slug"
              element={
                <AvaProvider>
                  <PermissionGuard permission={MODULE_PERMISSION_MAP.ava}>
                    <AvaTutorialPage />
                  </PermissionGuard>
                </AvaProvider>
              }
            />
            <Route
              path="tenants"
              element={
                <PermissionGuard permission={MODULE_PERMISSION_MAP.tenants}>
                  <TenantsPage />
                </PermissionGuard>
              }
            />
            <Route
              path="onboarding"
              element={
                <PermissionGuard permission={MODULE_PERMISSION_MAP.onboarding}>
                  <OnboardingPage />
                </PermissionGuard>
              }
            />
            <Route
              path="assinaturas"
              element={
                <PermissionGuard permission={MODULE_PERMISSION_MAP.assinaturas}>
                  <AssinaturasPage />
                </PermissionGuard>
              }
            />
            <Route
              path="gestao-saas"
              element={
                <PermissionGuard
                  permission={MODULE_PERMISSION_MAP['gestao-saas']}
                >
                  <GestaoSaaSPage />
                </PermissionGuard>
              }
            />
            <Route
              path="roles-permissoes"
              element={
                <PermissionGuard
                  permission={MODULE_PERMISSION_MAP['roles-permissoes']}
                >
                  <RolesPermissoesPage />
                </PermissionGuard>
              }
            />
            <Route
              path="auditoria"
              element={
                <PermissionGuard permission={MODULE_PERMISSION_MAP.auditoria}>
                  <AuditoriaPage />
                </PermissionGuard>
              }
            />
            <Route
              path="ia"
              element={
                <PermissionGuard permission={MODULE_PERMISSION_MAP.ia}>
                  <IaPage />
                </PermissionGuard>
              }
            />
            <Route
              path="integracoes"
              element={
                <PermissionGuard permission={MODULE_PERMISSION_MAP.integracoes}>
                  <IntegracoesPage />
                </PermissionGuard>
              }
            />
            <Route
              path="configuracoes/seguranca"
              element={
                <PermissionGuard
                  permission={MODULE_PERMISSION_MAP['seguranca-conta']}
                >
                  <SegurancaPage />
                </PermissionGuard>
              }
            />
            <Route
              path="recrutamento/*"
              element={
                <RecrutamentoProvider>
                  <ModuleRouter
                    moduleRegistries={moduleRouteRegistries}
                    moduleIds={['recrutamento']}
                    moduleRouteBase="/dashboard/recrutamento"
                  />
                </RecrutamentoProvider>
              }
            />
            <Route
              path="*"
              element={
                <ModuleRouter moduleRegistries={moduleRouteRegistries} />
              }
            />
          </Route>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/auth/terms" element={<AuthTerms />} />
          <Route path="/auth/welcome" element={<AuthWelcome />} />
          <Route
            path="/alterar-senha"
            element={
              <ProtectedRoute>
                <AlterarSenha />
              </ProtectedRoute>
            }
          />
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
            path="/candidato/*"
            element={
              <AuthRoute>
                <ProtectedRoute
                  allowedRoles={['candidato']}
                  allowedPermissions={['candidates.self.read']}
                >
                  <CandidatoProvider>
                    <ModuleProvider>
                      <CandidatoContainer />
                    </ModuleProvider>
                  </CandidatoProvider>
                </ProtectedRoute>
              </AuthRoute>
            }
          >
            <Route
              path="*"
              element={
                <ModuleRouter
                  moduleRegistries={moduleRouteRegistries}
                  moduleIds={['candidato']}
                  moduleRouteBase="/candidato"
                  skipLayout
                />
              }
            />
          </Route>
          <Route
            path="*"
            element={
              <PublicLayout>
                <Suspense fallback={<RouteLoadingFallback />}>
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
                    <Route path="/clientes" element={<Clientes />} />
                    <Route path="/parceiros" element={<Parceiros />} />
                    <Route path="/fornecedores" element={<Fornecedores />} />
                    <Route path="/servicos" element={<PublicServicos />} />
                    <Route
                      path="/servicos/:slug"
                      element={<ServicoDetalhe />}
                    />
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
                    <Route path="/suporte" element={<PublicSuporte />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/contato" element={<Contato />} />
                    <Route path="/privacidade" element={<Privacidade />} />
                    <Route path="/termos" element={<Termos />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/entrar" element={<EntrarHub />} />
                    <Route path="/entrar/admin" element={<EntrarAdmin />} />
                    <Route
                      path="/entrar/candidato"
                      element={<EntrarCandidato />}
                    />
                    <Route path="/entrar/empresa" element={<EntrarEmpresa />} />
                    <Route path="/cadastro" element={<Cadastro />} />
                    <Route
                      path="/recuperar-senha"
                      element={<RecuperarSenha />}
                    />
                    <Route
                      path="/redefinir-senha"
                      element={<RedefinirSenha />}
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
        <FloatingHelpWidgets />
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
