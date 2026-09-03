import { motion } from 'framer-motion';
import { Building2, ExternalLink, Linkedin, Instagram } from 'lucide-react';
import { SafeImage } from '@/components/ui/SafeImage';

interface PartnerSupplierCardProps {
  id: string;
  name: string;
  logo: string | null;
  image: string | null;
  website: string | null;
  description: string | null;
  industry: string | null;
  socials?: {
    linkedin?: string;
    instagram?: string;
    [k: string]: string | undefined;
  } | null;
  index: number;
}

const PLACEHOLDER_LOGO_BG = 'bg-primary/10';
const PLACEHOLDER_LOGO_COLOR = 'text-primary';

/**
 * Card used by /parceiros and /fornecedores vitrines.
 * Mirrors the visual language of the client `ClientCase` but kept as a simple
 * grid item (logo + name + description + optional website). Shows a graceful
 * placeholder when logo and image are both missing.
 */
export function PartnerSupplierCard({
  name,
  logo,
  image,
  website,
  description,
  industry,
  socials,
  index,
}: PartnerSupplierCardProps) {
  const heroMedia = image || logo;
  const socialsList = socials
    ? (['linkedin', 'instagram'] as const)
        .map((key) =>
          socials[key] ? { key, url: socials[key] as string } : null,
        )
        .filter(
          (entry): entry is { key: 'linkedin' | 'instagram'; url: string } =>
            entry !== null,
        )
    : [];

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        duration: 0.5,
        delay: (index % 6) * 0.05,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      whileHover={{ y: -4 }}
      className="bg-card shadow-premium border-border hover:shadow-glow flex h-full flex-col overflow-hidden rounded-3xl border transition-all duration-300"
    >
      <div className="bg-surface-alt relative flex h-44 items-center justify-center overflow-hidden">
        {heroMedia ? (
          <SafeImage
            src={heroMedia}
            alt={name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center ${PLACEHOLDER_LOGO_BG}`}
          >
            <Building2 className={`h-12 w-12 ${PLACEHOLDER_LOGO_COLOR}`} />
          </div>
        )}
        {logo && image && logo !== image && (
          <div className="bg-card/90 absolute right-3 bottom-3 flex h-10 w-auto items-center justify-center rounded-lg px-2 py-1 shadow-md backdrop-blur">
            <SafeImage
              src={logo}
              alt={`${name} logo`}
              className="h-full w-auto max-w-[80px] object-contain"
              loading="lazy"
            />
          </div>
        )}
        {industry && (
          <span className="bg-primary/90 text-primary-foreground absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-medium">
            {industry}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-foreground mb-2 line-clamp-2 text-lg font-semibold">
          {name}
        </h3>
        {description && (
          <p className="text-muted-foreground mb-4 line-clamp-3 flex-1 text-sm">
            {description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-3">
          {website ? (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
            >
              Conhecer
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <span />
          )}
          {socialsList.length > 0 && (
            <div className="text-muted-foreground flex items-center gap-1.5">
              {socialsList.map(({ key, url }) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={key === 'linkedin' ? 'LinkedIn' : 'Instagram'}
                  className="hover:text-primary transition-colors"
                >
                  {key === 'linkedin' ? (
                    <Linkedin className="h-4 w-4" />
                  ) : (
                    <Instagram className="h-4 w-4" />
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
