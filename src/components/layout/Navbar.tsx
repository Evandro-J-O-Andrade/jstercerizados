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
  ChevronDown,
  ChevronRight,
  MessageCircle,
  Headphones,
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
  { label: 'Divulgar Vaga', href: '/clientes' },
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
  { label: 'WhatsApp', href: '/contato' },
  { label: 'Suporte', href: '/suporte' },
  { label: 'FAQ', href: '/faq' },
];

const topNavLinks = [
  { label: 'Início', href: '/' },
  { label: 'Vagas', href: '/vagas' },
  { label: 'Serviços', href: '/servicos' },
  { label: 'Sobre Nós', href: '/sobre' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contato', href: '/contato' },
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
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.11v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.16z" />
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
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
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
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [],
  );

  useEffect(() => {
    const handleScroll = (): void => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const drawerVariants = {
    hidden: {
      opacity: 0,
      x: '100%',
      transition: { duration: 0.3 },
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.06,
      },
    },
    exit: {
      opacity: 0,
      x: '100%',
      transition: { duration: 0.3 },
    },
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
    return (
      <div
        className="relative"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={cn(
            'text-sm font-medium transition-colors duration-200',
            items.some((item) => location.pathname === item.href)
              ? 'text-primary'
              : 'text-muted-foreground hover:text-primary',
          )}
          aria-expanded={open}
          aria-haspopup="true"
        >
          <span className="flex items-center gap-1">
            {Icon && <Icon className="h-4 w-4" />}
            {label}
            <ChevronDown className="h-3.5 w-3.5" />
          </span>
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="border-border bg-background/95 absolute top-full left-0 z-50 mt-2 min-w-[220px] rounded-xl border p-1 shadow-xl backdrop-blur-xl"
            >
              {items.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors duration-200',
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

        <nav className="hidden items-center gap-8 lg:flex">
          {topNavLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={
                link.href === '/'
                  ? () => window.scrollTo({ top: 0, behavior: 'smooth' })
                  : undefined
              }
              className={cn(
                'text-sm font-medium transition-colors duration-200',
                location.pathname === link.href
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary',
              )}
            >
              {link.label}
            </Link>
          ))}

          <Dropdown
            label="Empresas"
            icon={Building2}
            items={companiesSubmenu}
          />
          <Dropdown label="Candidatos" icon={Users} items={candidatesSubmenu} />
          <Dropdown
            label="Contato"
            icon={MessageCircle}
            items={contactSubmenu}
          />

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
          <Button
            to="/trabalhe-conosco"
            variant="outline"
            size="sm"
            className="text-xs font-medium"
          >
            Cadastrar Currículo
          </Button>
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button variant="primary" size="sm">
                Painel
              </Button>
            </Link>
          ) : (
            <Link to="/clientes">
              <Button variant="primary" size="sm">
                Divulgar Vaga
              </Button>
            </Link>
          )}
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
                  {topNavLinks.map((link) => (
                    <motion.div key={link.href} variants={itemVariants}>
                      <Link
                        to={link.href}
                        onClick={() => {
                          if (link.href === '/') {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                          setIsOpen(false);
                        }}
                        className={cn(
                          'block rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200',
                          location.pathname === link.href
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <MobileAccordion
                  title="Empresas"
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
                      to={isAuthenticated ? '/dashboard' : '/clientes'}
                      onClick={() => setIsOpen(false)}
                      className="text-muted-foreground hover:bg-muted hover:text-foreground block rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                    >
                      {isAuthenticated ? 'Painel' : 'Divulgar Vaga'}
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
  links,
  isOpen,
  onToggle,
  onClose,
}: {
  title: string;
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
        <span className="text-primary text-xs font-bold tracking-wider uppercase">
          {title}
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
                  key={link.href}
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
