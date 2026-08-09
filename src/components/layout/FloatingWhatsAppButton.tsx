import { useMemo } from 'react';
import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { COMPANY, getWhatsAppUrl } from '@/config';

export function FloatingWhatsAppButton() {
  const message = useMemo(
    () =>
      `Olá! Visitei o site da ${COMPANY.tradingName} e gostaria de mais informações sobre os serviços.`,
    [],
  );

  return (
    <a
      href={getWhatsAppUrl(COMPANY.whatsapp, message)}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-40 sm:right-6 sm:bottom-[calc(5.5rem+env(safe-area-inset-bottom))] md:bottom-24"
    >
      <Button
        variant="primary"
        size="icon"
        className="shadow-glow-lg h-12 w-12 rounded-full sm:h-14 sm:w-14"
        aria-label="WhatsApp"
      >
        <Phone className="h-5 w-5 sm:h-6 sm:w-6" />
      </Button>
    </a>
  );
}
