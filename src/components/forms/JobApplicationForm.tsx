import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { COMPANY, getWhatsAppUrl } from '@/config';
import { Mail, MapPin, Clock, CheckCircle2, Upload } from 'lucide-react';
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
import { buildJobApplicationMessage } from '@/utils/message-builder';

type JobApplicationFormProps = {
  jobTitle?: string;
  jobSlug?: string;
  vagaId?: string;
};

const contractOptions = [
  { value: '', label: 'Selecione' },
  { value: 'CLT', label: 'CLT' },
  { value: 'ESTAGIO', label: 'Estágio' },
  { value: 'TEMPORARIO', label: 'Temporário' },
  { value: 'FREELA', label: 'Freelance' },
  { value: 'TERCEIRIZADO', label: 'Terceirizado' },
  { value: 'CD', label: 'C/D' },
];

const jobApplicationSchema = z.object({
  name: z
    .string()
    .min(2, 'Informe seu nome completo')
    .max(120, 'Nome muito longo'),
  email: z.string().min(1, 'Informe seu e-mail').email('E-mail inválido'),
  phone: z
    .string()
    .min(10, 'Informe um telefone válido')
    .max(20, 'Telefone inválido'),
  city: z.string().min(2, 'Informe sua cidade').max(80, 'Cidade muito longa'),
  contract: z.string().optional(),
  experience: z.string().max(2000, 'Experiência muito longa').optional(),
  message: z.string().max(2000, 'Mensagem muito longa').optional(),
  lgpd: z
    .boolean()
    .refine(
      (val) => val === true,
      'Você precisa autorizar o tratamento de dados para continuar',
    ),
});

type JobApplicationFormData = z.infer<typeof jobApplicationSchema>;

export function JobApplicationForm({
  jobTitle,
  jobSlug,
  vagaId,
}: JobApplicationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<JobApplicationFormData>({
    resolver: zodResolver(jobApplicationSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      city: '',
      contract: '',
      experience: '',
      message: '',
      lgpd: false,
    },
  });

  const [success, setSuccess] = useState(false);

  const onSubmit = async (data: JobApplicationFormData): Promise<void> => {
    const message = buildJobApplicationMessage({
      jobTitle,
      vagaId,
      jobSlug,
      name: sanitizeName(data.name),
      email: sanitizeEmail(data.email),
      phone: sanitizePhone(data.phone),
      city: sanitizeText(data.city),
      contract: sanitizeText(data.contract || ''),
      experience: sanitizeTextarea(data.experience || ''),
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
          Candidatura enviada!
        </h3>
        <p className="text-muted-foreground mb-6">
          Recebemos sua candidatura. Nossa equipe entrará em contato em breve.
        </p>
        <Button variant="secondary" onClick={() => setSuccess(false)}>
          Nova candidatura
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
          Candidatar-se à vaga
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
          label="Tipo de contrato desejado"
          error={errors.contract?.message}
          {...register('contract')}
        >
          {contractOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
        <Input
          label="Experiência profissional"
          error={errors.experience?.message}
          {...register('experience')}
          placeholder="Ex.: 2 anos em atendimento"
        />
      </div>

      <div className="mt-4">
        <Textarea
          label="Mensagem"
          error={errors.message?.message}
          {...register('message')}
          rows={4}
          placeholder="Conte um pouco sobre você..."
        />
      </div>

      <div className="mt-4">
        <label className="text-muted-foreground mb-1 flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            className="text-primary focus:ring-primary h-4 w-4 rounded"
            {...register('lgpd')}
          />
          Autorizo o tratamento dos meus dados pessoais para esta candidatura.
        </label>
        {errors.lgpd && (
          <p className="text-destructive mt-1 text-sm">{errors.lgpd.message}</p>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          <Upload className="mr-2 h-4 w-4" />
          Enviar candidatura
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
