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
  Accessibility,
  MessageCircle,
} from 'lucide-react';
import { COMPANY, SOCIAL_LINKS } from '@/config';
import { IMAGES } from '@/config/images';
import { Button } from '@/components/ui/Button';

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
    { label: 'Fornecedores', href: '/fornecedores' },
    { label: 'Blog', href: '/blog' },
    { label: 'Política de Privacidade', href: '/privacidade' },
    { label: 'Termos de Uso', href: '/termos' },
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
  candidatos: [
    { label: 'Vagas', href: '/vagas' },
    { label: 'Cadastrar Currículo', href: '/trabalhe-conosco' },
    { label: 'Processo Seletivo', href: '/processo-seletivo' },
  ],
  empresas: [
    { label: 'Empresas', href: '/empresas' },
    { label: 'Divulgar Vaga', href: '/clientes' },
  ],
  contato: [
    { label: 'Fale Conosco', href: '/contato' },
    { label: 'WhatsApp', href: '/contato' },
    { label: 'Suporte', href: '/suporte' },
    { label: 'FAQ', href: '/faq' },
  ],
};

const socialLinks = [
  {
    label: 'WhatsApp',
    href: SOCIAL_LINKS.whatsapp,
    icon: Phone,
    color: '#25D366',
    hoverColor: '#128C7E',
  },
  {
    label: 'Instagram',
    href: SOCIAL_LINKS.instagram,
    icon: Instagram,
    color: '#E4405F',
    hoverColor: '#C13584',
  },
  {
    label: 'Facebook',
    href: SOCIAL_LINKS.facebook,
    icon: Facebook,
    color: '#1877F2',
    hoverColor: '#0D65D9',
  },
  {
    label: 'TikTok',
    href: SOCIAL_LINKS.tiktok,
    icon: TikTokIcon,
    color: '#FE2C55',
    hoverColor: '#E60023',
  },
  {
    label: 'LinkedIn',
    href: SOCIAL_LINKS.linkedin,
    icon: Linkedin,
    color: '#0A66C2',
    hoverColor: '#004182',
  },
  {
    label: 'YouTube',
    href: SOCIAL_LINKS.youtube,
    icon: Youtube,
    color: '#FF0000',
    hoverColor: '#CC0000',
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

export function Footer({
  onOpenAccessibility,
  onOpenChat,
}: {
  onOpenAccessibility?: () => void;
  onOpenChat?: () => void;
}) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-border/50 bg-surface relative z-10 border-t">
      <div className="via-primary/40 absolute -top-px right-0 left-0 h-px bg-gradient-to-r from-transparent to-transparent" />

      <div className="w-full">
        <div className="mx-auto max-w-[1600px] px-4 py-16 pb-28 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            {/* ─── Identidade J&S ──────────────────── */}
            <div className="space-y-6 lg:col-span-3">
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
                    <span className="text-primary drop-shadow-glow">
                      J&amp;S
                    </span>{' '}
                    <span className="text-foreground">Empregos</span>
                  </h2>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {COMPANY.tagline}
                  </p>
                </div>
              </Link>
              <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
                {COMPANY.description}
              </p>

              {/* Social */}
              <div className="pt-2">
                <h4 className="text-foreground mb-3 text-sm font-bold">
                  Siga a J&amp;S Empregos
                </h4>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <motion.a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        whileHover={{
                          scale: 1.15,
                          y: -4,
                          transition: {
                            type: 'spring',
                            stiffness: 400,
                            damping: 10,
                          },
                        }}
                        whileTap={{ scale: 0.9 }}
                        className="border-border/60 focus-visible:ring-primary relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:outline-none"
                        aria-label={social.label}
                        style={{
                          backgroundColor: `${social.color}18`,
                          borderColor: `${social.color}66`,
                        }}
                      >
                        <motion.div
                          whileHover={{
                            rotate: [0, -10, 10, -10, 0],
                            transition: { duration: 0.4 },
                          }}
                          className="flex items-center justify-center"
                        >
                          <Icon
                            className="h-5 w-5 transition-colors duration-300"
                            style={{ color: social.color }}
                            aria-hidden="true"
                          />
                        </motion.div>
                      </motion.a>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ─── Grupos desktop / accordions mobile ─ */}
            <div className="lg:col-span-9">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
                {/* Empresa */}
                <div className="hidden lg:block">
                  <h4 className="text-primary mb-5 text-xs font-bold tracking-wider uppercase">
                    Empresa
                  </h4>
                  <div className="space-y-3">
                    {footerLinks.empresa.map((link) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        className="text-muted-foreground hover:text-primary flex items-center gap-2 text-sm transition-colors duration-200"
                      >
                        <span className="text-primary/50 h-1 w-1 rounded-full bg-current" />
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Serviços */}
                <div className="hidden lg:block">
                  <h4 className="text-primary mb-5 text-xs font-bold tracking-wider uppercase">
                    Serviços
                  </h4>
                  <div className="space-y-3">
                    {footerLinks.servicos.map((link) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        className="text-muted-foreground hover:text-primary flex items-center gap-2 text-sm transition-colors duration-200"
                      >
                        <span className="text-primary/50 h-1 w-1 rounded-full bg-current" />
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Candidatos */}
                <div className="hidden lg:block">
                  <h4 className="text-primary mb-5 text-xs font-bold tracking-wider uppercase">
                    Para Candidatos
                  </h4>
                  <div className="space-y-3">
                    {footerLinks.candidatos.map((link) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        className="text-muted-foreground hover:text-primary flex items-center gap-2 text-sm transition-colors duration-200"
                      >
                        <span className="text-primary/50 h-1 w-1 rounded-full bg-current" />
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Empresas */}
                <div className="hidden lg:block">
                  <h4 className="text-primary mb-5 text-xs font-bold tracking-wider uppercase">
                    Para Empresas
                  </h4>
                  <div className="space-y-3">
                    {footerLinks.empresas.map((link) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        className="text-muted-foreground hover:text-primary flex items-center gap-2 text-sm transition-colors duration-200"
                      >
                        <span className="text-primary/50 h-1 w-1 rounded-full bg-current" />
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Atendimento */}
                <div className="hidden lg:block">
                  <h4 className="text-primary mb-5 text-xs font-bold tracking-wider uppercase">
                    Contato
                  </h4>
                  <div className="space-y-3">
                    {footerLinks.contato.map((link) => {
                      return (
                        <Link
                          key={link.href}
                          to={link.href}
                          className="text-muted-foreground hover:text-primary flex items-center gap-2 text-sm transition-colors duration-200"
                        >
                          <span className="text-primary/50 h-1 w-1 rounded-full bg-current" />
                          {link.label}
                        </Link>
                      );
                    })}
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
                title="Candidatos"
                links={footerLinks.candidatos}
              />
              <MobileAccordion title="Empresas" links={footerLinks.empresas} />
              <MobileAccordion title="Contato" links={footerLinks.contato} />
            </div>
          </div>
        </div>

        {/* Fale Conosco */}
        <div className="mt-8 w-full">
          <h4 className="text-primary mb-4 text-center text-xs font-bold tracking-wider uppercase">
            Fale Conosco
          </h4>
          <div className="border-border/50 bg-primary/5 rounded-xl border p-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {contactItems.map((item) => (
                <a
                  key={item.type}
                  href={item.href}
                  target={item.type === 'map' ? '_blank' : undefined}
                  rel={item.type === 'map' ? 'noopener noreferrer' : undefined}
                  className="border-border/50 hover:border-primary/30 group flex items-center gap-3 rounded-xl border p-6 transition-all duration-300"
                >
                  <div className="text-primary bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground text-base font-semibold">
                      {item.label}
                    </p>
                    <p className="text-muted-foreground truncate text-sm">
                      {item.value}
                    </p>
                    {item.subvalue && (
                      <p className="text-muted-foreground text-sm">
                        {item.subvalue}
                      </p>
                    )}
                  </div>
                  {item.type === 'map' && (
                    <Globe className="text-primary h-5 w-5 transition-transform group-hover:translate-x-1" />
                  )}
                </a>
              ))}
            </div>

            <div className="border-border/50 bg-primary/5 mt-4 rounded-xl border p-4">
              <h5 className="text-foreground mb-3 text-sm font-bold">
                Horário de Atendimento
              </h5>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="text-primary h-4 w-4" />
                  <span className="text-muted-foreground">
                    Seg a Sex, 08h às 18h
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="text-primary h-4 w-4" />
                  <span className="text-muted-foreground">Sáb, 08h às 12h</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="text-muted-foreground h-4 w-4" />
                  <span className="text-muted-foreground">
                    Domingo — Fechado
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={onOpenAccessibility}
                leftIcon={<Accessibility className="h-4 w-4" />}
              >
                Acessibilidade
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={onOpenChat}
                leftIcon={<MessageCircle className="h-4 w-4" />}
              >
                Precisa de ajuda?
              </Button>
            </div>
          </div>
        </div>

        {/* ─── Bottom Bar ──────────────────────── */}
        <div className="border-border mt-16 flex flex-col items-center justify-between gap-6 border-t pt-10 sm:flex-row">
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <Heart className="text-primary h-3.5 w-3.5" />
            <span>
              © {currentYear} {COMPANY.tradingName}. Todos os direitos
              reservados.
            </span>
          </div>
          <p className="text-muted-foreground text-xs">
            Desenvolvido por{' '}
            <span className="text-foreground font-medium">
              New Wave Sistemas Digital Solutions
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
