import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
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

type ServiceRequestFormProps = {
  serviceSlug?: string;
  serviceName?: string;
};

const serviceOptions = [
  { value: '', label: 'Selecione um serviço' },
  { value: 'assessoria-rh', label: 'Assessoria em RH' },
  { value: 'recrutamento-selecao', label: 'Recrutamento e Seleção' },
  { value: 'mao-de-obra-temporaria', label: 'Mão de Obra Temporária' },
  { value: 'mao-de-obra-efetiva', label: 'Mão de Obra Efetiva' },
  { value: 'facilities', label: 'Facilities' },
  { value: 'limpeza-de-fachada', label: 'Limpeza de Fachada' },
  { value: 'limpeza-de-vidros', label: 'Limpeza de Vidros' },
  { value: 'limpeza-pre-mudanca', label: 'Limpeza Pré-Mudança' },
  { value: 'limpeza-pos-mudanca', label: 'Limpeza Pós-Mudança' },
  { value: 'limpeza-pos-obra', label: 'Limpeza Pós-Obra' },
  { value: 'jardinagem', label: 'Jardinagem' },
  { value: 'terceirizacao', label: 'Terceirização' },
  { value: 'outro', label: 'Outro' },
];

const environmentOptions = [
  { value: '', label: 'Selecione o tipo de ambiente' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'residencial', label: 'Residencial' },
  { value: 'condominio', label: 'Condomínio' },
  { value: 'outro', label: 'Outro' },
];

const serviceRequestSchema = z.object({
  name: z
    .string()
    .min(2, 'Informe seu nome completo')
    .max(120, 'Nome muito longo'),
  company: z.string().max(120, 'Nome da empresa muito longo').optional(),
  email: z.string().min(1, 'Informe seu e-mail').email('E-mail inválido'),
  phone: z
    .string()
    .min(10, 'Informe um telefone válido')
    .max(20, 'Telefone inválido'),
  city: z.string().min(2, 'Informe sua cidade').max(80, 'Cidade muito longa'),
  service: z.string().min(1, 'Selecione um serviço'),
  environment: z.string().optional(),
  message: z.string().max(2000, 'Mensagem muito longa').optional(),
  bestTime: z.string().max(120, 'Horário muito longo').optional(),
});

type ServiceRequestFormData = z.infer<typeof serviceRequestSchema>;

export function ServiceRequestForm({
  serviceSlug,
  serviceName,
}: ServiceRequestFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ServiceRequestFormData>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      name: '',
      company: '',
      email: '',
      phone: '',
      city: '',
      service: serviceSlug ?? '',
      environment: '',
      message: '',
      bestTime: '',
    },
  });

  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (serviceSlug) {
      reset({ service: serviceSlug });
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
        className="bg-card border-border rounded-2xl border p-8 text-center"
      >
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
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-card border-border rounded-2xl border p-6 sm:p-8"
    >
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
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
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
    </form>
  );
}
