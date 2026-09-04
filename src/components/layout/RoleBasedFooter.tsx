import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';
import { ChevronDown, Heart } from 'lucide-react';
import { COMPANY } from '@/config';
import { useFooterConfig } from '@/hooks/useFooterConfig';
import {
  filterActiveLinks,
  type FooterGroup,
  type FooterLink,
} from '@/types/footer';
import { cn } from '@/utils';

function MobileAccordion({
  title,
  links,
  defaultOpen = false,
}: {
  title: string;
  links: FooterLink[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-border/50 border-b">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between py-4 text-left"
        aria-expanded={open}
      >
        <span className="text-foreground text-sm font-bold tracking-wider uppercase">
          {title}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-muted-foreground"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pb-4">
              {links.map((link) => (
                <Link
                  key={`${link.label}-${link.href}`}
                  to={link.href}
                  className="text-muted-foreground hover:text-primary flex items-center gap-2 text-sm transition-colors"
                >
                  <span className="bg-primary/50 h-1 w-1 rounded-full" />
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FooterGroups({ groups }: { groups: FooterGroup[] }) {
  return (
    <>
      <div className="hidden gap-8 sm:grid sm:grid-cols-2 lg:grid-cols-4">
        {groups.map((g) => (
          <div key={g.group}>
            <h4 className="text-primary mb-5 text-xs font-bold tracking-wider uppercase">
              {g.group}
            </h4>
            <div className="space-y-3">
              {g.links.map((link) => (
                <Link
                  key={`${link.label}-${link.href}`}
                  to={link.href}
                  className="text-muted-foreground hover:text-primary flex items-center gap-2 text-sm transition-colors"
                >
                  <span className="bg-primary/50 h-1 w-1 rounded-full" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="lg:hidden">
        {groups.map((g, i) => (
          <MobileAccordion
            key={g.group}
            title={g.group}
            links={g.links}
            defaultOpen={i === 0}
          />
        ))}
      </div>
    </>
  );
}

function BottomBar({ scope }: { scope: string }) {
  const currentYear = new Date().getFullYear();
  return (
    <div className="border-border mt-16 flex flex-col items-center justify-between gap-6 border-t pt-10 sm:flex-row">
      <div className="text-muted-foreground flex items-center gap-2 text-xs">
        <Heart className="text-primary h-3.5 w-3.5" />
        <span>
          © {currentYear} {COMPANY.tradingName}. Todos os direitos reservados.
        </span>
      </div>
      <p className="text-muted-foreground text-xs" data-scope={scope}>
        Desenvolvido por{' '}
        <span className="text-foreground font-medium">
          New Wave Sistemas Digital Solutions
        </span>
      </p>
    </div>
  );
}

export function RoleBasedFooter({ className }: { className?: string }) {
  const { config, loading } = useFooterConfig();

  const visible = useCallback(() => {
    if (loading) return false;
    if (!config) return false;
    if (!config.is_active) return false;
    return filterActiveLinks(config.links).length > 0;
  }, [config, loading]);

  if (!visible()) {
    return null;
  }

  const groups = filterActiveLinks(config!.links);
  const effectiveScope = config!.scope;

  return (
    <footer
      data-scope={effectiveScope}
      className={cn(
        'border-border/50 bg-surface relative z-10 border-t',
        className,
      )}
    >
      <div className="via-primary/40 absolute -top-px right-0 left-0 h-px bg-gradient-to-r from-transparent to-transparent" />
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="mb-6 flex items-center gap-3">
          <Link to="/" className="text-foreground text-sm font-semibold">
            {COMPANY.name}
          </Link>
          <span className="text-muted-foreground text-xs">•</span>
          <span className="text-muted-foreground text-xs tracking-wider uppercase">
            {effectiveScope === 'global_public'
              ? 'Site público'
              : `Área restrita — ${effectiveScope}`}
          </span>
        </div>
        <FooterGroups groups={groups} />
        <BottomBar scope={effectiveScope} />
      </div>
    </footer>
  );
}
