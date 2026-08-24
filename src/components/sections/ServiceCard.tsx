import type { ComponentType } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Service } from '@/types/domain/recruitment';
import { SERVICE_ICONS } from '@/constants/icons';
import { SafeImage } from '@/components/ui/SafeImage';

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

export function ServiceCard({ service, index }: ServiceCardProps) {
  const Icon: ComponentType<{ className?: string }> =
    SERVICE_ICONS[service.icon] || SERVICE_ICONS.shield;

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
      className="min-h-[420px]"
    >
      <Link
        to={`/servicos/${service.slug}`}
        className="group bg-card shadow-premium hover:shadow-glow border-border hover:border-primary/30 focus-visible:ring-primary relative flex h-full flex-col overflow-hidden rounded-3xl border transition-all duration-300 focus-visible:ring-2 focus-visible:outline-none"
      >
        <div className="bg-primary/10 absolute inset-x-0 top-0 h-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative h-52 overflow-hidden sm:h-56">
          <SafeImage
            src={service.image}
            alt={service.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute right-4 bottom-4 left-4">
            <span className="bg-primary/90 text-primary-foreground inline-block rounded-full px-3 py-1 text-xs font-medium">
              {CATEGORY_LABELS[service.category]}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-foreground text-lg font-semibold">
              {service.title}
            </h3>
          </div>

          <p className="text-muted-foreground mb-4 line-clamp-3 flex-1 text-sm">
            {service.short_description || service.description}
          </p>

          {service.benefits && service.benefits.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {service.benefits.slice(0, 3).map((benefit) => (
                  <span
                    key={benefit}
                    className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="text-primary mt-auto flex items-center text-sm font-medium">
            Saiba mais
            <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
