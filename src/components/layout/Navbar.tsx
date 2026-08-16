import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import {
  Menu,
  X,
  Sun,
  Moon,
  Phone,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Building2,
  Users,
  Home,
  BriefcaseBusiness,
  Wrench,
  Info,
  Newspaper,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  LogIn,
} from 'lucide-react';
import { cn } from '@/utils';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { IMAGES } from '@/config/images';
import {
  COMPANY,
  SOCIAL_LINKS,
  WHATSAPP_MESSAGES,
  getWhatsAppUrl,
} from '@/config';

const companiesSubmenu = [
  { label: 'Soluções para Empresas', href: '/empresas' },
  { label: 'Divulgar Vaga', href: '/empresas/divulgar-vaga' },
  { label: 'Clientes', href: '/clientes' },
  { label: 'Fornecedores', href: '/fornecedores' },
];

const candidatesSubmenu = [
  { label: 'Candidatos', href: '/candidatos' },
  { label: 'Trabalhe Conosco', href: '/trabalhe-conosco' },
  { label: 'Processo Seletivo', href: '/processo-seletivo' },
];

const contactSubmenu = [
  { label: 'Fale Conosco', href: '/contato' },
  { label: 'Suporte', href: '/suporte' },
  { label: 'FAQ', href: '/faq' },
];

const loginSubmenu = [
  { label: 'Admin', href: '/login?role=admin' },
  { label: 'Candidato', href: '/login?role=candidato' },
  { label: 'Empresa', href: '/login?role=empresa' },
];

const topNavLinks = [
  { label: 'Início', href: '/', icon: Home },
  { label: 'Vagas', href: '/vagas', icon: BriefcaseBusiness },
  { label: 'Serviços', href: '/servicos', icon: Wrench },
  { label: 'Sobre Nós', href: '/sobre', icon: Info },
  { label: 'Blog', href: '/blog', icon: Newspaper },
];

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
};

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width="1em"
    height="1em"
    {...props}
  >
    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLButtonElement | null>(null);
  const drawerFocusRef = useFocusTrap(isOpen);
  const { resolvedTheme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLButtonElement;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      previousFocusRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        document.getElementById('mobile-drawer-close')?.focus();
      }, 0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleDrawerKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>): void => {
      if (e.key !== 'Tab' || !drawerRef.current) return;
      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [],
  );

  useEffect(() => {
    const handleScroll = (): void => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const drawerVariants = {
    hidden: { opacity: 0, x: '100%', transition: { duration: 0.3 } },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, staggerChildren: 0.06 },
    },
    exit: { opacity: 0, x: '100%', transition: { duration: 0.3 } },
  };

  function Dropdown({
    label,
    icon: Icon,
    items,
  }: {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    items: Array<{ label: string; href: string }>;
  }) {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setOpen(false);
      } else if (e.key === 'ArrowDown' && open) {
        e.preventDefault();
        const firstLink = document.querySelector(
          '[aria-labelledby="dropdown-' + label + '"] a',
        );
        if (firstLink instanceof HTMLElement) {
          firstLink.focus();
        }
      }
    };

    return (
      <div
        className="relative"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          onKeyDown={handleKeyDown}
          className={cn(
            'text-sm font-medium transition-colors duration-200',
            items.some((item) => location.pathname === item.href)
              ? 'text-primary'
              : 'text-muted-foreground hover:text-primary',
          )}
          aria-expanded={open}
          aria-haspopup="true"
          aria-controls={'dropdown-' + label}
        >
          <span className="flex items-center gap-1">
            <Icon className="h-3.5 w-3.5" />
            {label}
            <ChevronDown className="h-3 w-3" />
          </span>
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              id={'dropdown-' + label}
              role="menu"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="border-border bg-background/95 absolute top-full left-0 z-50 mt-2 min-w-[180px] rounded-xl border p-1 shadow-xl backdrop-blur-xl"
            >
              {items.map((item) => (
                <Link
                  key={`${item.label}-${item.href}`}
                  to={item.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors duration-200',
                    location.pathname === item.href
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <span className="bg-primary/40 h-1 w-1 rounded-full" />
                  {item.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
      className={cn(
        'fixed top-0 right-0 left-0 z-50 transition-all duration-300',
        scrolled ? 'bg-card/85 shadow-lg backdrop-blur-xl' : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-3 sm:px-8 lg:px-12">
        <Link to="/" className="flex items-center gap-4 pl-2">
          <motion.img
            src={IMAGES.logo.dark}
            alt={COMPANY.name}
            className="drop-shadow-glow h-12 w-auto"
            whileHover={{ scale: 1.05 }}
            loading="eager"
          />
          <h1 className="text-3xl font-extrabold tracking-tight">
            {COMPANY.brand}
          </h1>
        </Link>

        <nav className="hidden items-center gap-4 lg:flex xl:gap-5">
          <div className="flex items-center gap-4 xl:gap-5">
            {topNavLinks.map(({ label, href }) => (
              <Link
                key={href}
                to={href}
                onClick={
                  href === '/'
                    ? () => window.scrollTo({ top: 0, behavior: 'smooth' })
                    : undefined
                }
                className={cn(
                  'text-sm font-medium transition-colors duration-200',
                  location.pathname === href
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-primary',
                )}
              >
                {label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3 xl:gap-4">
            <Dropdown
              label="Empresas"
              icon={Building2}
              items={companiesSubmenu}
            />
            <Dropdown
              label="Candidatos"
              icon={Users}
              items={candidatesSubmenu}
            />
            <Dropdown
              label="Contato"
              icon={MessageCircle}
              items={contactSubmenu}
            />
            <Dropdown label="Entrar" icon={LogIn} items={loginSubmenu} />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Alternar tema"
              className="h-9 w-9"
            >
              {resolvedTheme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>
            <Button
              to="/trabalhe-conosco"
              variant="outline"
              size="sm"
              className="h-9 px-3 text-xs font-medium"
            >
              Cadastrar Currículo
            </Button>
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button
                  variant="primary"
                  size="sm"
                  className="h-9 px-3 text-xs font-medium"
                >
                  Painel
                </Button>
              </Link>
            ) : (
              <Link to="/empresas/divulgar-vaga">
                <Button
                  variant="primary"
                  size="sm"
                  className="h-9 px-3 text-xs font-medium"
                >
                  Divulgar Vaga
                </Button>
              </Link>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Alternar tema"
          >
            {resolvedTheme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'inline-flex items-center justify-center rounded-md p-2 transition-colors',
              isOpen
                ? 'text-foreground hover:bg-muted'
                : 'text-muted-foreground hover:bg-muted',
            )}
            aria-expanded={isOpen}
            aria-label="Abrir menu"
            whileTap={{ scale: 0.95 }}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overlay-backdrop fixed inset-0 z-40 lg:hidden"
              onClick={() => {
                setIsOpen(false);
                setOpenAccordion(null);
              }}
            />
            <motion.div
              key="mobile-drawer"
              ref={(el) => {
                drawerRef.current = el;
                drawerFocusRef.current = el;
              }}
              onKeyDown={handleDrawerKeyDown}
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="overlay-panel fixed top-0 right-0 z-50 h-full w-[85%] max-w-md lg:hidden"
              style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              <div className="flex items-center justify-between p-4">
                <span className="text-foreground text-lg font-semibold">
                  Menu
                </span>
                <Button
                  id="mobile-drawer-close"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsOpen(false);
                    setOpenAccordion(null);
                  }}
                  aria-label="Fechar menu"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <nav className="flex flex-col gap-2 px-3 py-1">
                <div className="space-y-1">
                  <p className="text-primary mb-2 text-xs font-bold tracking-wider uppercase">
                    Navegação
                  </p>
                  {topNavLinks.map(({ label, href, icon: Icon }) => (
                    <motion.div key={href} variants={itemVariants}>
                      <Link
                        to={href}
                        onClick={() => {
                          if (href === '/') {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                          setIsOpen(false);
                        }}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200',
                          location.pathname === href
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {label}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <MobileAccordion
                  title="Empresas"
                  icon={Building2}
                  links={companiesSubmenu}
                  isOpen={openAccordion === 'empresas'}
                  onToggle={() =>
                    setOpenAccordion(
                      openAccordion === 'empresas' ? null : 'empresas',
                    )
                  }
                  onClose={() => setIsOpen(false)}
                />

                <MobileAccordion
                  title="Candidatos"
                  icon={Users}
                  links={candidatesSubmenu}
                  isOpen={openAccordion === 'candidatos'}
                  onToggle={() =>
                    setOpenAccordion(
                      openAccordion === 'candidatos' ? null : 'candidatos',
                    )
                  }
                  onClose={() => setIsOpen(false)}
                />

                <MobileAccordion
                  title="Contato"
                  icon={MessageCircle}
                  links={contactSubmenu}
                  isOpen={openAccordion === 'contato'}
                  onToggle={() =>
                    setOpenAccordion(
                      openAccordion === 'contato' ? null : 'contato',
                    )
                  }
                  onClose={() => setIsOpen(false)}
                />

                <div className="space-y-1">
                  <p className="text-primary mb-2 text-xs font-bold tracking-wider uppercase">
                    Ações
                  </p>
                  <motion.div variants={itemVariants}>
                    <Link
                      to="/trabalhe-conosco"
                      onClick={() => setIsOpen(false)}
                      className="bg-primary text-primary-foreground block rounded-lg px-3 py-2 text-center text-sm font-medium"
                    >
                      Cadastrar Currículo
                    </Link>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <Link
                      to={
                        isAuthenticated
                          ? '/dashboard'
                          : '/empresas/divulgar-vaga'
                      }
                      onClick={() => setIsOpen(false)}
                      className="text-muted-foreground hover:bg-muted hover:text-foreground block rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                    >
                      {isAuthenticated ? 'Painel' : 'Divulgar Vaga'}
                    </Link>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="border-border hover:bg-muted block rounded-lg border px-3 py-2 text-center text-sm font-medium transition-colors"
                    >
                      Entrar
                    </Link>
                  </motion.div>
                </div>
              </nav>

              <div className="border-border mt-3.5 -translate-y-0.5 border-t px-4 py-6">
                <p className="text-muted-foreground mb-4 text-xs font-semibold tracking-wider uppercase">
                  Redes Sociais
                </p>
                <div className="flex flex-wrap gap-3">
                  <motion.a
                    href={getWhatsAppUrl(
                      COMPANY.whatsapp,
                      WHATSAPP_MESSAGES.whatsappButton,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full transition-colors"
                    aria-label="WhatsApp"
                  >
                    <Phone className="h-5 w-5" />
                    <span className="sr-only">WhatsApp</span>
                  </motion.a>
                  <motion.a
                    href={SOCIAL_LINKS.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    className="bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                    <span className="sr-only">Instagram</span>
                  </motion.a>
                  <motion.a
                    href={SOCIAL_LINKS.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    className="bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                    <span className="sr-only">Facebook</span>
                  </motion.a>
                  <motion.a
                    href={SOCIAL_LINKS.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    className="bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                    <span className="sr-only">LinkedIn</span>
                  </motion.a>
                  <motion.a
                    href={SOCIAL_LINKS.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    className="bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full transition-colors"
                    aria-label="YouTube"
                  >
                    <Youtube className="h-5 w-5" />
                    <span className="sr-only">YouTube</span>
                  </motion.a>
                  <motion.a
                    href={SOCIAL_LINKS.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    className="bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full transition-colors"
                    aria-label="TikTok"
                  >
                    <TikTokIcon className="h-5 w-5" />
                    <span className="sr-only">TikTok</span>
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function MobileAccordion({
  title,
  icon: Icon,
  links,
  isOpen,
  onToggle,
  onClose,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  links: Array<{ label: string; href: string }>;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="border-border/50 rounded-xl border p-1"
    >
      <button
        type="button"
        onClick={onToggle}
        className="text-foreground hover:text-primary flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors duration-200"
        aria-expanded={isOpen}
        aria-controls={`accordion-${title}`}
      >
        <span className="flex items-center gap-2">
          <Icon className="text-primary h-4 w-4" />
          <span className="text-primary text-xs font-bold tracking-wider uppercase">
            {title}
          </span>
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {isOpen ? (
            <X className="text-muted-foreground h-4 w-4" />
          ) : (
            <ChevronRight className="text-muted-foreground h-4 w-4" />
          )}
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`accordion-${title}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-0.5 px-2 pt-1 pb-1.5">
              {links.map((link) => (
                <Link
                  key={`${link.label}-${link.href}`}
                  to={link.href}
                  onClick={onClose}
                  className={cn(
                    'rounded-md px-3 py-2 text-sm transition-colors duration-200',
                    location.pathname === link.href
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
