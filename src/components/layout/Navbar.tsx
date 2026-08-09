import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
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
} from 'lucide-react';
import { cn } from '@/utils';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { NAVIGATION_LINKS } from '@/config/navigation';
import { IMAGES } from '@/config/images';
import {
  COMPANY,
  SOCIAL_LINKS,
  WHATSAPP_MESSAGES,
  getWhatsAppUrl,
} from '@/config';

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
  const [scrolled, setScrolled] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLButtonElement | null>(null);
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

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
  };

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
            <span className="text-primary drop-shadow-glow">J&amp;S</span>{' '}
            <span className="text-foreground">Terceirizados</span>
          </h1>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAVIGATION_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
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
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              key="mobile-drawer"
              ref={drawerRef}
              onKeyDown={handleDrawerKeyDown}
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-card fixed top-0 right-0 z-50 h-full w-[85%] max-w-md shadow-2xl lg:hidden"
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
                  onClick={() => setIsOpen(false)}
                  aria-label="Fechar menu"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <nav className="flex flex-col gap-1 px-4 py-2">
                {NAVIGATION_LINKS.map((link) => (
                  <motion.div key={link.href} variants={itemVariants}>
                    <Link
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'block rounded-lg px-4 py-3 text-base font-medium transition-colors duration-200',
                        location.pathname === link.href
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                <motion.div variants={itemVariants}>
                  <Link
                    to="/trabalhe-conosco"
                    onClick={() => setIsOpen(false)}
                    className="bg-primary text-primary-foreground rounded-lg px-4 py-3 text-center text-base font-medium"
                  >
                    Cadastrar Currículo
                  </Link>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Link
                    to={isAuthenticated ? '/dashboard' : '/clientes'}
                    onClick={() => setIsOpen(false)}
                    className="text-muted-foreground hover:bg-muted hover:text-foreground block rounded-lg px-4 py-3 text-base font-medium transition-colors"
                  >
                    {isAuthenticated ? 'Painel' : 'Divulgar Vaga'}
                  </Link>
                </motion.div>
              </nav>

              <div className="border-border mt-4 border-t px-4 py-6">
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
