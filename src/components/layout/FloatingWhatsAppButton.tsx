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
      className="fixed right-6 bottom-6 z-50"
    >
      <Button
        variant="primary"
        size="icon"
        className="shadow-glow-lg h-14 w-14 rounded-full"
        aria-label="WhatsApp"
      >
        <Phone className="h-6 w-6" />
      </Button>
    </a>
  );
}
