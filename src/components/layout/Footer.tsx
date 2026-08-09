import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Heart,
  Globe,
  ChevronDown,
} from 'lucide-react';
import { COMPANY, SOCIAL_LINKS } from '@/config';
import { IMAGES } from '@/config/images';

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

const footerLinks = {
  empresa: [
    { label: 'Sobre Nós', href: '/sobre' },
    { label: 'Clientes', href: '/clientes' },
    { label: 'Parceiros', href: '/parceiros' },
    { label: 'Blog', href: '/blog' },
  ],
  servicos: [
    { label: 'Todos os Serviços', href: '/servicos' },
    { label: 'Assessoria em RH', href: '/servicos/assessoria-rh' },
    { label: 'Recrutamento e Seleção', href: '/servicos/recrutamento-selecao' },
    {
      label: 'Mão de Obra Temporária',
      href: '/servicos/mao-de-obra-temporaria',
    },
    { label: 'Mão de Obra Efetiva', href: '/servicos/mao-de-obra-efetiva' },
    { label: 'Facilities', href: '/servicos/facilities' },
    { label: 'Limpeza', href: '/servicos/limpeza' },
    { label: 'Jardinagem', href: '/servicos/jardinagem' },
    { label: 'Terceirização', href: '/servicos/terceirizacao' },
  ],
  atendimento: [
    { label: 'Suporte', href: '/suporte' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contato', href: '/contato' },
    { label: 'Login', href: '/login' },
  ],
  institucional: [
    { label: 'Política de Privacidade', href: '/privacidade' },
    { label: 'Termos de Uso', href: '/termos' },
  ],
};

const socialLinks = [
  {
    label: 'WhatsApp',
    href: SOCIAL_LINKS.whatsapp,
    icon: Phone,
    bg: 'bg-[#25d366]/10 border-[#25d366]/30',
    iconColor: 'text-[#25d366]',
    glow: 'bg-[#25d366]',
  },
  {
    label: 'Instagram',
    href: SOCIAL_LINKS.instagram,
    icon: Instagram,
    bg: 'bg-[#e4405f]/10 border-[#e4405f]/30',
    iconColor: 'text-[#e4405f]',
    glow: 'bg-[#e4405f]',
  },
  {
    label: 'Facebook',
    href: SOCIAL_LINKS.facebook,
    icon: Facebook,
    bg: 'bg-[#1877f2]/10 border-[#1877f2]/30',
    iconColor: 'text-[#1877f2]',
    glow: 'bg-[#1877f2]',
  },
  {
    label: 'TikTok',
    href: SOCIAL_LINKS.tiktok,
    icon: TikTokIcon,
    bg: 'bg-[#fe2c55]/10 border-[#fe2c55]/30',
    iconColor: 'text-[#fe2c55]',
    glow: 'bg-[#fe2c55]',
  },
  {
    label: 'LinkedIn',
    href: SOCIAL_LINKS.linkedin,
    icon: Linkedin,
    bg: 'bg-[#0a66c2]/10 border-[#0a66c2]/30',
    iconColor: 'text-[#0a66c2]',
    glow: 'bg-[#0a66c2]',
  },
  {
    label: 'YouTube',
    href: SOCIAL_LINKS.youtube,
    icon: Youtube,
    bg: 'bg-[#ff0000]/10 border-[#ff0000]/30',
    iconColor: 'text-[#ff0000]',
    glow: 'bg-[#ff0000]',
  },
];

const contactItems = [
  {
    type: 'phone',
    label: 'Telefone',
    value: COMPANY.phone,
    href: `tel:${COMPANY.phone.replace(/\D/g, '')}`,
    icon: Phone,
  },
  {
    type: 'email',
    label: 'E-mail',
    value: COMPANY.email,
    href: `mailto:${COMPANY.email}`,
    icon: Mail,
  },
  {
    type: 'address',
    label: 'Endereço',
    value: `${COMPANY.address.street}, ${COMPANY.address.number}`,
    subvalue: `${COMPANY.address.neighborhood}, ${COMPANY.address.city} - ${COMPANY.address.state}`,
    icon: MapPin,
  },
  {
    type: 'map',
    label: 'Ver localização',
    value: `${COMPANY.address.city} - SP`,
    href: `https://maps.google.com/?q=${encodeURIComponent(`${COMPANY.address.street}, ${COMPANY.address.number}, ${COMPANY.address.city}, ${COMPANY.address.state}`)}`,
    icon: Globe,
  },
];

function MobileAccordion({
  title,
  links,
  defaultOpen = false,
}: {
  title: string;
  links: Array<{
    label: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
  }>;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-border/50 border-b">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between py-4 text-left"
        aria-expanded={open}
        aria-controls={`footer-${title.toLowerCase()}-panel`}
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
      <motion.div
        id={`footer-${title.toLowerCase()}-panel`}
        initial={false}
        animate={{
          height: open ? 'auto' : 0,
          opacity: open ? 1 : 0,
        }}
        transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
        className="overflow-hidden"
      >
        <div className="space-y-3 pb-4">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                to={link.href}
                className="text-muted-foreground hover:text-primary flex items-center gap-2 text-sm transition-colors duration-200"
              >
                {Icon && <Icon className="text-primary/70 h-4 w-4" />}
                <span className="text-primary/50 h-1 w-1 rounded-full bg-current" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="border-border/50 bg-surface relative z-40 border-t">
      <div className="via-primary/40 absolute -top-px right-0 left-0 h-px bg-gradient-to-r from-transparent to-transparent" />

      <div className="mx-auto max-w-[1600px] px-6 py-20 pb-80 sm:px-8 lg:px-12 lg:pb-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* ─── Identidade J&S ──────────────────── */}
          <div className="space-y-8 lg:col-span-4">
            <Link to="/" className="flex items-center gap-4">
              <div className="border-border/50 shadow-glow bg-primary/10 relative rounded-2xl border p-2">
                <img
                  src={IMAGES.logo.dark}
                  alt={COMPANY.name}
                  className="drop-shadow-glow h-14 w-auto"
                />
              </div>
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight">
                  <span className="text-primary drop-shadow-glow">J&amp;S</span>{' '}
                  <span className="text-foreground">Terceirizados</span>
                </h2>
                <p className="text-muted-foreground mt-1.5 text-xs">
                  {COMPANY.tagline}
                </p>
              </div>
            </Link>
            <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
              {COMPANY.description}
            </p>

            {/* Social */}
            <div className="pt-1">
              <h4 className="text-foreground mb-4 text-sm font-bold">
                Siga a J&amp;S Terceirizados
              </h4>
              <div className="flex flex-wrap gap-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="group relative flex h-12 w-12 items-center justify-center rounded-full"
                      aria-label={social.label}
                    >
                      <span
                        className={`absolute inset-0 rounded-full opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100 ${social.glow}`}
                        aria-hidden="true"
                      />
                      <span
                        className={`relative flex h-12 w-12 items-center justify-center rounded-full border transition-colors duration-300 ${social.bg}`}
                      >
                        <Icon
                          className={`h-5 w-5 transition-colors duration-300 ${social.iconColor}`}
                          aria-hidden="true"
                        />
                      </span>
                      <span className="sr-only">{social.label}</span>
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ─── Empresa ──────────────────── */}
          <div className="hidden lg:col-span-2 lg:block">
            <h4 className="text-primary mb-6 text-xs font-bold tracking-wider uppercase">
              Empresa
            </h4>
            <div className="space-y-4">
              {footerLinks.empresa.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-muted-foreground hover:text-primary flex items-center gap-2.5 text-sm transition-colors duration-200"
                >
                  <span className="text-primary/50 h-1.5 w-1.5 rounded-full bg-current" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* ─── Serviços ──────────────────── */}
          <div className="hidden lg:col-span-2 lg:block">
            <h4 className="text-primary mb-6 text-xs font-bold tracking-wider uppercase">
              Serviços
            </h4>
            <div className="space-y-4">
              {footerLinks.servicos.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-muted-foreground hover:text-primary flex items-center gap-2.5 text-sm transition-colors duration-200"
                >
                  <span className="text-primary/50 h-1.5 w-1.5 rounded-full bg-current" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* ─── Atendimento ──────────────────── */}
          <div className="hidden lg:col-span-2 lg:block">
            <h4 className="text-primary mb-6 text-xs font-bold tracking-wider uppercase">
              Atendimento
            </h4>
            <div className="space-y-4">
              {footerLinks.atendimento.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-muted-foreground hover:text-primary flex items-center gap-2.5 text-sm transition-colors duration-200"
                >
                  <span className="text-primary/50 h-1.5 w-1.5 rounded-full bg-current" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* ─── Fale Conosco ──────────────────── */}
          <div className="hidden lg:col-span-2 lg:block">
            <h4 className="text-primary mb-6 text-xs font-bold tracking-wider uppercase">
              Fale Conosco
            </h4>
            <div className="space-y-4">
              {contactItems.map((item) => (
                <a
                  key={item.type}
                  href={item.href}
                  target={item.type === 'map' ? '_blank' : undefined}
                  rel={item.type === 'map' ? 'noopener noreferrer' : undefined}
                  className="border-border/50 hover:border-primary/30 group bg-primary/5 flex items-center gap-3 rounded-xl border p-3 transition-all duration-300"
                >
                  <div className="text-primary bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground text-sm font-semibold">
                      {item.label}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {item.value}
                    </p>
                    {item.subvalue && (
                      <p className="text-muted-foreground text-xs">
                        {item.subvalue}
                      </p>
                    )}
                  </div>
                  {item.type === 'map' && (
                    <Globe className="text-primary h-4 w-4 transition-transform group-hover:translate-x-1" />
                  )}
                </a>
              ))}
            </div>

            <div className="border-border/50 bg-primary/5 mt-5 rounded-xl border p-4">
              <h5 className="text-foreground mb-3 text-sm font-bold">
                Horário de Atendimento
              </h5>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-sm">
                  <Clock className="text-primary h-4 w-4" />
                  <span className="text-muted-foreground">
                    Seg a Sex, 08h às 18h
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Clock className="text-primary h-4 w-4" />
                  <span className="text-muted-foreground">Sáb, 08h às 12h</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Clock className="text-muted-foreground h-4 w-4" />
                  <span className="text-muted-foreground">
                    Domingo — Fechado
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Mobile accordions ─ */}
        <div className="lg:hidden">
          <MobileAccordion
            title="Empresa"
            links={footerLinks.empresa}
            defaultOpen
          />
          <MobileAccordion title="Serviços" links={footerLinks.servicos} />
          <MobileAccordion
            title="Atendimento"
            links={footerLinks.atendimento}
          />
          <MobileAccordion
            title="Institucional"
            links={footerLinks.institucional}
          />

          <div className="border-border/50 border-b py-5">
            <h4 className="text-primary mb-4 text-xs font-bold tracking-wider uppercase">
              Fale Conosco
            </h4>
            <div className="space-y-3">
              {contactItems.map((item) => (
                <a
                  key={item.type}
                  href={item.href}
                  target={item.type === 'map' ? '_blank' : undefined}
                  rel={item.type === 'map' ? 'noopener noreferrer' : undefined}
                  className="border-border/50 hover:border-primary/30 group bg-primary/5 flex items-center gap-3 rounded-xl border p-3 transition-all duration-300"
                >
                  <div className="text-primary bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground text-sm font-semibold">
                      {item.label}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {item.value}
                    </p>
                    {item.subvalue && (
                      <p className="text-muted-foreground text-xs">
                        {item.subvalue}
                      </p>
                    )}
                  </div>
                  {item.type === 'map' && (
                    <Globe className="text-primary h-4 w-4 transition-transform group-hover:translate-x-1" />
                  )}
                </a>
              ))}
            </div>

            <div className="border-border/50 bg-primary/5 mt-5 rounded-xl border p-4">
              <h5 className="text-foreground mb-3 text-sm font-bold">
                Horário de Atendimento
              </h5>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-sm">
                  <Clock className="text-primary h-4 w-4" />
                  <span className="text-muted-foreground">
                    Seg a Sex, 08h às 18h
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Clock className="text-primary h-4 w-4" />
                  <span className="text-muted-foreground">Sáb, 08h às 12h</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Clock className="text-muted-foreground h-4 w-4" />
                  <span className="text-muted-foreground">
                    Domingo — Fechado
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6" />
          </div>
        </div>
      </div>
      {/* ─── Bottom Bar ──────────────────────── */}
      <div className="border-border mt-20 flex flex-col items-center justify-between gap-6 border-t pt-10 pb-8 sm:flex-row">
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <Heart className="text-primary h-3.5 w-3.5" />
          <span>
            © {currentYear} {COMPANY.tradingName}. Todos os direitos reservados.
          </span>
        </div>
        <p className="text-muted-foreground text-xs">
          Desenvolvido por{' '}
          <span className="text-foreground font-medium">
            New Wave Sistemas Digital Solutions
          </span>
        </p>
      </div>
    </footer>
  );
}
