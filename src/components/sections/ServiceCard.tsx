import { type ComponentType } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Service } from '@/types/common';
import { SERVICE_ICONS } from '@/constants/icons';
import { SafeImage } from '@/components/ui/SafeImage';
import { SERVICE_IMAGES } from '@/content/assets';

interface ServiceCardProps {
  service: Service;
  index: number;
}

const CATEGORY_LABELS: Record<Service['category'], string> = {
  rh: 'Recursos Humanos',
  facilities: 'Facilities',
  terceirizacao: 'Terceirização',
  candidato: 'Para Candidatos',
};

const SERVICE_IMAGE_FALLBACK: Record<string, string> = {
  'recrutamento-selecao': SERVICE_IMAGES.recrutamento,
  'mao-de-obra-temporaria': SERVICE_IMAGES.maoDeObraTemporaria,
  'mao-de-obra-efetiva': SERVICE_IMAGES.maoDeObraEfetiva,
  'banco-de-talentos': SERVICE_IMAGES.assessoriaRh,
  'assessoria-rh': SERVICE_IMAGES.assessoriaRh,
  'avaliacao-perfil': SERVICE_IMAGES.assessoriaRh,
  hunting: SERVICE_IMAGES.assessoriaRh,
  facilities: SERVICE_IMAGES.facilities,
  'seguranca-patrimonial': SERVICE_IMAGES.terceirizacao,
  'limpeza-conservacao': SERVICE_IMAGES.limpeza,
  'zeladoria-manutencao': SERVICE_IMAGES.facilities,
  jardinagem: SERVICE_IMAGES.jardinagem,
  'limpeza-de-fachada': SERVICE_IMAGES.limpezaFachadaReal,
  'limpeza-de-vidros': SERVICE_IMAGES.limpezaVidrosReal,
  faxina: SERVICE_IMAGES.faxinaReal,
  'limpeza-pos-obra': SERVICE_IMAGES.limpezaPosObraReal,
  terceirizacao: SERVICE_IMAGES.terceirizacaoReal,
};

export function ServiceCard({ service, index }: ServiceCardProps) {
  const Icon: ComponentType<{ className?: string }> =
    SERVICE_ICONS[service.icon] || SERVICE_ICONS.shield;

  const fallbackImage =
    SERVICE_IMAGE_FALLBACK[service.slug] || SERVICE_IMAGES.facilitiesFallback;

  const resolvedImage =
    service.image &&
    !service.image.includes('fallbacks') &&
    !service.image.includes('svg')
      ? service.image
      : fallbackImage;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.6,
        ease: [0.25, 0.4, 0.25, 1],
        delay: index * 0.08,
      }}
      whileHover={{ y: -6, scale: 1.01 }}
    >
      <Link
        to={`/servicos/${service.slug}`}
        className="group bg-card shadow-premium hover:shadow-glow border-border hover:border-primary/30 focus-visible:ring-primary relative block h-full overflow-hidden rounded-3xl border transition-all duration-300 focus-visible:ring-2 focus-visible:outline-none"
      >
        {/* Top gradient accent */}
        <div className="bg-primary/10 absolute inset-x-0 top-0 h-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Image area */}
        <div className="relative h-52 overflow-hidden sm:h-56">
          <SafeImage
            src={resolvedImage}
            alt={service.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover opacity-80 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
            fallbackSrc={fallbackImage}
          />
          <div className="from-card/90 via-card/40 absolute inset-0 bg-gradient-to-t to-transparent" />
          <div className="from-primary/10 absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Icon overlay */}
          <div className="bg-primary text-primary-foreground absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-xl shadow-lg">
            <Icon className="h-6 w-6" />
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6">
          <span className="text-primary text-xs font-semibold tracking-wider uppercase">
            {CATEGORY_LABELS[service.category]}
          </span>
          <h3 className="text-foreground group-hover:text-primary mt-2 text-xl font-bold transition-colors duration-300">
            {service.title}
          </h3>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
            {service.shortDescription}
          </p>

          {/* CTA */}
          <div className="text-primary mt-6 flex items-center gap-2 text-sm font-medium transition-transform group-hover:translate-x-1">
            <span>Saiba mais</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>

        {/* Hover glow */}
        <div className="from-primary/5 absolute inset-0 bg-gradient-to-br via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </Link>
    </motion.div>
  );
}
