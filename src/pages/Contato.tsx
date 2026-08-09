import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Send, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { SafeImage } from '@/components/ui/SafeImage';
import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { mockSubmitContact } from '@/services/mock/contatos';
import {
  COMPANY,
  CONTACTS,
  WHATSAPP_MESSAGES,
  getWhatsAppUrl,
  IMAGES,
} from '@/config';

const contactSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 caracteres'),
  subject: z.string().min(2, 'Assunto é obrigatório'),
  message: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function Contato() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData): Promise<void> => {
    mockSubmitContact({
      name: data.name,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      message: data.message,
      company: data.name,
      city: COMPANY.address.city,
      state: COMPANY.address.state,
    });
    setSubmitted(true);
    reset();
  };

  if (submitted) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md text-center"
        >
          <div className="bg-success/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
            <Send className="text-success h-10 w-10" />
          </div>
          <h2 className="text-foreground mb-4 text-2xl font-bold">
            Mensagem Enviada!
          </h2>
          <p className="text-muted-foreground mb-8">
            Entraremos em contato em breve. Enquanto isso, você pode nos chamar
            diretamente pelo WhatsApp.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href={getWhatsAppUrl(
                COMPANY.whatsapp,
                WHATSAPP_MESSAGES.contactForm,
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary" size="lg">
                <Phone className="mr-2 h-5 w-5" />
                WhatsApp
              </Button>
            </a>
            <Link to="/">
              <Button variant="outline" size="lg">
                Voltar ao Início
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      <SEO
        title={`Contato — ${COMPANY.name}`}
        description={`Entre em contato com a ${COMPANY.name}. Telefone, WhatsApp, e-mail e endereço.`}
        keywords={[
          'contato',
          'telefone',
          'whatsapp',
          'e-mail',
          'endereço',
          COMPANY.name,
          'RH',
          'terceirização',
          'facilities',
        ]}
        type="WebSite"
      />
      <Section>
        <Container>
          <div className="mb-12 text-center">
            <h1 className="text-foreground text-3xl font-bold sm:text-4xl">
              Contato
            </h1>
            <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
              Entre em contato conosco. Estamos prontos para atendê-lo.
            </p>
          </div>

          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-5">
            <div className="space-y-6 lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-2xl"
              >
                <SafeImage
                  src={IMAGES.hero.contato.src}
                  fallbackSrc={IMAGES.hero.contato.fallback}
                  alt={`Contato ${COMPANY.tradingName}`}
                  className="h-full w-full object-cover opacity-70"
                />
                <div className="from-background/80 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-card shadow-premium rounded-2xl p-6"
              >
                <h3 className="text-foreground mb-4 text-lg font-semibold">
                  Informações de Contato
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-primary mt-1 h-5 w-5 flex-shrink-0" />
                    <div>
                      <p className="text-foreground text-sm font-medium">
                        Endereço
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {COMPANY.address.city}, {COMPANY.address.state} — Brasil
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="text-primary h-5 w-5 flex-shrink-0" />
                    <a
                      href={`tel:${COMPANY.phone}`}
                      className="text-muted-foreground hover:text-primary text-sm transition-colors"
                    >
                      {COMPANY.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="text-primary h-5 w-5 flex-shrink-0" />
                    <a
                      href={`mailto:${COMPANY.email}`}
                      className="text-muted-foreground hover:text-primary text-sm transition-colors"
                    >
                      {COMPANY.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="text-primary h-5 w-5 flex-shrink-0" />
                    <p className="text-muted-foreground text-sm">
                      {CONTACTS.businessHours.weekday}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-muted shadow-premium rounded-2xl p-6"
              >
                <h3 className="text-foreground mb-4 text-lg font-semibold">
                  Horário de Atendimento
                </h3>
                <div className="text-muted-foreground space-y-2 text-sm">
                  <p>Segunda a Sexta: 08h às 18h</p>
                  <p>Sábado: 08h às 12h</p>
                  <p>Domingo: Fechado</p>
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-3">
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                onSubmit={handleSubmit(onSubmit)}
                className="bg-card shadow-premium rounded-2xl p-8"
              >
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Input
                      label="Seu Nome *"
                      placeholder="João Silva"
                      error={errors.name?.message}
                      {...register('name')}
                    />
                  </div>
                  <div>
                    <Input
                      label="E-mail *"
                      type="email"
                      placeholder="seu@email.com"
                      error={errors.email?.message}
                      {...register('email')}
                    />
                  </div>
                  <div>
                    <Input
                      label="Telefone *"
                      placeholder="(11) 99999-9999"
                      error={errors.phone?.message}
                      {...register('phone')}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      label="Assunto *"
                      placeholder="Assunto da mensagem"
                      error={errors.subject?.message}
                      {...register('subject')}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Textarea
                      label="Mensagem *"
                      placeholder="Como podemos ajudá-lo?"
                      rows={5}
                      error={errors.message?.message}
                      {...register('message')}
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <Button
                    type="submit"
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    loading={isSubmitting}
                    leftIcon={<Phone className="h-5 w-5" />}
                  >
                    Enviar e Abrir WhatsApp
                  </Button>
                </div>
              </motion.form>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
