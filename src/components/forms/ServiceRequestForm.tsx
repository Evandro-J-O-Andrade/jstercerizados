import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { COMPANY, getWhatsAppUrl } from '@/config';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  sanitizeText,
  sanitizeName,
  sanitizeEmail,
  sanitizePhone,
  sanitizeTextarea,
} from '@/utils/sanitize';
import { buildServiceRequestMessage } from '@/utils/message-builder';

const serviceRequestSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  company: z.string().optional(),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 caracteres'),
  city: z.string().min(2, 'Cidade é obrigatória'),
  service: z.string().min(2, 'Selecione o serviço'),
  environment: z.string().optional(),
  bestTime: z.string().optional(),
  message: z.string().optional(),
});

type ServiceRequestFormData = z.infer<typeof serviceRequestSchema>;

const serviceOptions = [
  { value: 'recrutamento-selecao', label: 'Recrutamento e Seleção' },
  { value: 'mao-de-obra-temporaria', label: 'Mão de Obra Temporária' },
  { value: 'mao-de-obra-efetiva', label: 'Mão de Obra Efetiva' },
  { value: 'assessoria-rh', label: 'Assessoria em RH' },
  { value: 'terceirizacao-facilities', label: 'Terceirização e Facilities' },
  { value: 'limpeza-conservacao', label: 'Limpeza e Conservação' },
  { value: 'jardinagem-paisagismo', label: 'Jardinagem e Paisagismo' },
  { value: 'portaria-zeladoria', label: 'Portaria e Zeladoria' },
];

const environmentOptions = [
  { value: 'condominio-residencial', label: 'Condomínio Residencial' },
  { value: 'condominio-comercial', label: 'Condomínio Comercial' },
  { value: 'empresa', label: 'Empresa' },
  { value: 'hospital', label: 'Hospital/Clínica' },
  { value: 'escola', label: 'Escola/Universidade' },
  { value: 'shopping', label: 'Shopping Center' },
  { value: 'outro', label: 'Outro' },
];

export function ServiceRequestForm({ serviceSlug }: { serviceSlug?: string }) {
  const [success, setSuccess] = useState(false);
  const [serviceName, setServiceName] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceRequestFormData>({
    resolver: zodResolver(serviceRequestSchema),
  });

  useEffect(() => {
    if (serviceSlug) {
      const service = serviceOptions.find((s) => s.value === serviceSlug);
      if (service) {
        setServiceName(service.label);
        reset({ service: serviceSlug });
      }
    }
  }, [serviceSlug, reset]);

  const onSubmit = async (data: ServiceRequestFormData): Promise<void> => {
    const message = buildServiceRequestMessage({
      serviceName,
      serviceSlug: data.service,
      name: sanitizeName(data.name),
      company: sanitizeText(data.company || ''),
      email: sanitizeEmail(data.email),
      phone: sanitizePhone(data.phone),
      city: sanitizeText(data.city),
      environment: sanitizeText(data.environment || ''),
      bestTime: sanitizeText(data.bestTime || ''),
      message: sanitizeTextarea(data.message || ''),
    });

    window.open(getWhatsAppUrl(COMPANY.whatsapp, message), '_blank');

    setSuccess(true);
    reset();
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <Card variant="default" className="rounded-2xl p-8 text-center">
          <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="text-foreground mb-2 text-2xl font-bold">
            Solicitação enviada!
          </h3>
          <p className="text-muted-foreground mb-6">
            Recebemos sua solicitação. Nossa equipe entrará em contato em breve.
          </p>
          <Button variant="secondary" onClick={() => setSuccess(false)}>
            Nova solicitação
          </Button>
        </Card>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card variant="default" className="rounded-2xl p-6 sm:p-8">
        <div className="mb-6">
          <h3 className="text-foreground mb-2 text-xl font-bold">
            Solicitar orçamento
          </h3>
          <p className="text-muted-foreground text-sm">
            Preencha o formulário e nossa equipe entrará em contato.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Nome completo"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Empresa"
            error={errors.company?.message}
            {...register('company')}
          />
          <Input
            label="E-mail"
            type="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Telefone/WhatsApp"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <Input
            label="Cidade"
            error={errors.city?.message}
            {...register('city')}
          />
          <Select
            label="Serviço"
            error={errors.service?.message}
            {...register('service')}
          >
            {serviceOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
          <Select
            label="Tipo de ambiente"
            error={errors.environment?.message}
            {...register('environment')}
          >
            {environmentOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
          <Input
            label="Melhor horário para contato"
            error={errors.bestTime?.message}
            {...register('bestTime')}
            placeholder="Ex.: 14h às 17h"
          />
        </div>

        <div className="mt-4">
          <Textarea
            label="Mensagem"
            error={errors.message?.message}
            {...register('message')}
            rows={4}
            placeholder="Descreva sua necessidade..."
          />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button type="submit" variant="primary" size="lg">
            <Phone className="mr-2 h-4 w-4" />
            Solicitar orçamento
          </Button>

          <div className="text-muted-foreground flex flex-col gap-1 text-xs">
            <span className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" />
              {COMPANY.email}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              Seg a Sex, 08h às 18h
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" />
              {COMPANY.address.city} - SP
            </span>
          </div>
        </div>
      </Card>
    </form>
  );
}
