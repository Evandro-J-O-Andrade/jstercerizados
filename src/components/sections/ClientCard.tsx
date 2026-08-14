import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { SafeImage } from '@/components/ui/SafeImage';

interface Client {
  id: string;
  name: string;
  logo: string;
  website?: string | null;
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
        <SafeImage
          src={client.logo}
          fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%232a2a2a'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='16'%3EEmpresa%3C/text%3E%3C/svg%3E"
          alt={client.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      <div className="p-5">
        <h3 className="text-foreground text-lg font-semibold">{client.name}</h3>

        {client.website && (
          <div className="mt-3">
            <a
              href={client.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Conhecer empresa
            </a>
          </div>
        )}
      </div>
    </motion.div>
  );
}
