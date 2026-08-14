import { motion } from 'framer-motion';
import { ExternalLink, Linkedin, Instagram } from 'lucide-react';
import { SafeImage } from '@/components/ui/SafeImage';

interface Client {
  id: string;
  name: string;
  logo: string | null;
  image?: string | null;
  website?: string | null;
  description?: string | null;
  socials?: { linkedin?: string; instagram?: string } | null;
}

interface ClientCardProps {
  client: Client;
  index?: number;
}

export function ClientCard({ client, index = 0 }: ClientCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="group bg-card border-border shadow-premium relative overflow-hidden rounded-2xl border transition-all duration-300"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {client.logo ? (
          <SafeImage
            src={client.logo}
            alt={client.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="bg-muted/50 flex h-full w-full items-center justify-center">
            <span className="text-muted-foreground text-sm font-medium">
              {client.name}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      <div className="p-5">
        <h3 className="text-foreground text-lg font-semibold">{client.name}</h3>
        {client.description && (
          <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
            {client.description}
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {client.website && (
            <a
              href={client.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Conhecer empresa
            </a>
          )}
          {client.socials?.linkedin && (
            <a
              href={client.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          )}
          {client.socials?.instagram && (
            <a
              href={client.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Instagram className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
