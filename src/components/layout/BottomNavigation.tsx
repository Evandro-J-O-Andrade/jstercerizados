import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Home,
  Shield,
  Briefcase,
  Users,
  LayoutDashboard,
  FileText,
  Settings,
  Building2,
  LogIn,
} from 'lucide-react';
import { cn } from '@/utils';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  auth?: boolean;
}

const publicNavItems: NavItem[] = [
  { label: 'Início', href: '/', icon: Home },
  { label: 'Vagas', href: '/vagas', icon: Briefcase },
  { label: 'Serviços', href: '/servicos', icon: Shield },
  { label: 'Empresas', href: '/empresas', icon: Building2 },
  { label: 'Candidatos', href: '/candidatos', icon: Users },
  { label: 'Login', href: '/login', icon: LogIn },
];

const partnerNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Documentos', href: '#', icon: FileText },
  { label: 'Oportunidades', href: '#', icon: Briefcase },
  { label: 'Perfil', href: '#', icon: Settings },
];

const adminNavItems: NavItem[] = [
  { label: 'Painel', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Leads', href: '#', icon: FileText },
  { label: 'Parceiros', href: '#', icon: Users },
  { label: 'Configurações', href: '#', icon: Settings },
];

export function BottomNavigation() {
  const { pathname } = useLocation();
  const { isAuthenticated, user } = useAuth();

  const navItems = isAuthenticated
    ? user?.role === 'admin'
      ? adminNavItems
      : partnerNavItems
    : publicNavItems;

  return (
    <nav className="bg-card/95 border-border fixed right-0 bottom-0 left-0 z-50 border-t backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'relative flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="bg-primary/10 absolute -top-1 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
