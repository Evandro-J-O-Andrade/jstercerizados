import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Suspense, lazy, useState, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
import { CinematicShowcase } from '@/components/sections/CinematicShowcase';
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
        return (_jsx(AnimatePresence, { mode: "wait", children: _jsx(CinematicShowcase, { onFinish: handleIntroFinish }, "intro") }));
    }
    return (_jsxs("div", { className: "flex min-h-screen flex-col overflow-x-hidden", children: [_jsx(ScrollToTop, {}), _jsx(Navbar, {}), _jsx("main", { className: "flex-1 pt-16 pb-24 lg:pt-20 lg:pb-0", children: _jsx(Suspense, { fallback: _jsx(PageLoader, {}), children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Home, {}) }), _jsx(Route, { path: "/vagas", element: _jsx(Vagas, {}) }), _jsx(Route, { path: "/vagas/:slug", element: _jsx(VagaDetalhe, {}) }), _jsx(Route, { path: "/empresas", element: _jsx(Empresas, {}) }), _jsx(Route, { path: "/empresas/divulgar-vaga", element: _jsx(DivulgarVaga, {}) }), _jsx(Route, { path: "/candidatos", element: _jsx(Candidatos, {}) }), _jsx(Route, { path: "/servicos", element: _jsx(Servicos, {}) }), _jsx(Route, { path: "/servicos/:slug", element: _jsx(ServicoDetalhe, {}) }), _jsx(Route, { path: "/clientes", element: _jsx(Clientes, {}) }), _jsx(Route, { path: "/parceiros", element: _jsx(Parceiros, {}) }), _jsx(Route, { path: "/fornecedores", element: _jsx(Fornecedores, {}) }), _jsx(Route, { path: "/trabalhe-conosco", element: _jsx(TrabalheConosco, {}) }), _jsx(Route, { path: "/processo-seletivo", element: _jsx(ProcessoSeletivo, {}) }), _jsx(Route, { path: "/sobre", element: _jsx(Sobre, {}) }), _jsx(Route, { path: "/blog", element: _jsx(Blog, {}) }), _jsx(Route, { path: "/blog/:slug", element: _jsx(Blog, {}) }), _jsx(Route, { path: "/suporte", element: _jsx(Suporte, {}) }), _jsx(Route, { path: "/faq", element: _jsx(FAQ, {}) }), _jsx(Route, { path: "/contato", element: _jsx(Contato, {}) }), _jsx(Route, { path: "/privacidade", element: _jsx(Privacidade, {}) }), _jsx(Route, { path: "/termos", element: _jsx(Termos, {}) }), _jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/cadastro", element: _jsx(Cadastro, {}) }), _jsx(Route, { path: "/recuperar-senha", element: _jsx(RecuperarSenha, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(ProtectedRoute, { allowedRoles: ['admin'], children: _jsx(Dashboard, {}) }) }), _jsx(Route, { path: "/dashboard/candidato", element: _jsx(ProtectedRoute, { allowedRoles: ['candidato', 'admin'], children: _jsx(Dashboard, {}) }) }), _jsx(Route, { path: "/dashboard/empresa", element: _jsx(ProtectedRoute, { allowedRoles: ['empresa', 'admin'], children: _jsx(Dashboard, {}) }) }), _jsx(Route, { path: "/cadastro/candidato", element: _jsx(CadastroCandidato, {}) }), _jsx(Route, { path: "/cadastro/empresa", element: _jsx(CadastroEmpresa, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) }) }), _jsx("div", { className: "lg:pb-0", children: _jsx(Footer, { onOpenAccessibility: () => setIsAccessibilityOpen(true), onOpenChat: () => {
                        setIsAccessibilityOpen(false);
                        setIsAiChatOpen(true);
                    } }) }), _jsx(BottomNavigation, {}), _jsx(AccessibilityWidget, { open: isAccessibilityOpen, onOpenChange: setIsAccessibilityOpen, onOpenChat: () => {
                    setIsAccessibilityOpen(false);
                    setIsAiChatOpen(true);
                } }), _jsx(ChatWidget, { isOpen: isAiChatOpen, onOpenChange: setIsAiChatOpen, onRequestHuman: () => {
                    setIsAiChatOpen(false);
                    setIsHumanChatOpen(true);
                } }), _jsx(HumanChatWidget, { isOpen: isHumanChatOpen, onOpenChange: setIsHumanChatOpen })] }));
}
export default App;
