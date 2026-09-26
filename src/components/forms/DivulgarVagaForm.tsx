import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormField } from '@/components/ui/FormField';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { FormAlert } from '@/components/ui/FormAlert';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/sections/Section';
import { Container } from '@/components/common/Container';
import { COMPANY, getWhatsAppUrl, WHATSAPP_MESSAGES } from '@/config';
import type { JobCreatePayload } from '@/types/common';
import { normalizeError } from '@/lib/error-normalizer';
import {
  sanitizeText,
  sanitizeName,
  sanitizeEmail,
  sanitizePhone,
  sanitizeTextarea,
} from '@/utils/sanitize';

const contractTypeOptions = [
  { value: '', label: 'Selecione o tipo de contratação' },
  { value: 'CLT', label: 'CLT' },
  { value: 'TEMPORARIO', label: 'Temporário' },
  { value: 'EFETIVO', label: 'Efetivo' },
  { value: 'FREELANCE', label: 'Freelance' },
  { value: 'ESTAGIO', label: 'Estágio' },
  { value: 'AUTONOMO', label: 'Autônomo' },
];

const workModeOptions = [
  { value: '', label: 'Selecione a modalidade' },
  { value: 'PRESENCIAL', label: 'Presencial' },
  { value: 'HIBRIDO', label: 'Híbrido' },
  { value: 'REMOTO', label: 'Remoto' },
];

const salaryTypeOptions = [
  { value: '', label: 'Selecione o tipo de salário' },
  { value: 'MENSAL', label: 'Mensal' },
  { value: 'HORA', label: 'Por hora' },
  { value: 'DIARIA', label: 'Diária' },
  { value: 'NEGOCIAVEL', label: 'A combinar' },
];

const jobSchema = z.object({
  companyName: z.string().min(2, 'Nome da empresa é obrigatório'),
  cnpj: z.string().optional(),
  contactName: z.string().min(2, 'Nome do responsável é obrigatório'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 caracteres'),
  whatsapp: z.string().optional(),
  title: z.string().min(2, 'Cargo é obrigatório'),
  quantity: z.coerce.number().min(1, 'Quantidade deve ser maior que zero'),
  contractType: z.string().min(1, 'Tipo de contratação é obrigatório'),
  city: z.string().min(2, 'Cidade é obrigatória'),
  state: z.string().length(2, 'Estado deve ter 2 caracteres (ex: SP)'),
  workMode: z.string().min(1, 'Modalidade de trabalho é obrigatória'),
  salaryMin: z.coerce.number().optional(),
  salaryMax: z.coerce.number().optional(),
  salaryType: z.string().min(1, 'Tipo de salário é obrigatório'),
  description: z
    .string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  education: z.string().optional(),
  consentLgpd: z.boolean().refine((val) => val === true, {
    message: 'Você precisa aceitar a Política de Privacidade',
  }),
});

type JobFormData = z.infer<typeof jobSchema>;

export default function DivulgarVagaForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
  });

  const onSubmit = async (data: JobFormData): Promise<void> => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload: JobCreatePayload = {
        company: {
          name: sanitizeText(data.companyName),
          cnpj: data.cnpj ? sanitizeText(data.cnpj) : undefined,
          contactName: sanitizeName(data.contactName),
          email: sanitizeEmail(data.email),
          phone: sanitizePhone(data.phone),
          whatsapp: data.whatsapp ? sanitizePhone(data.whatsapp) : undefined,
        },
        job: {
          title: sanitizeText(data.title),
          quantity: data.quantity,
          city: sanitizeText(data.city),
          state: data.state.toUpperCase(),
          contractType: data.contractType,
          salary: data.salaryMin
            ? `R$ ${data.salaryMin.toLocaleString('pt-BR')}`
            : 'A combinar',
          benefits: data.benefits ? sanitizeTextarea(data.benefits) : undefined,
          schedule: data.workMode,
          description: sanitizeTextarea(data.description),
          requirements: data.requirements
            ? sanitizeTextarea(data.requirements)
            : undefined,
          education: data.education ? sanitizeText(data.education) : undefined,
        },
        source: 'website',
        consentLgpd: data.consentLgpd,
      };

      const message = `${WHATSAPP_MESSAGES.comercial}

📋 *Vaga:* ${payload.job.title}
🏢 *Empresa:* ${payload.company.name}
📍 *Local:* ${payload.job.city}/${payload.job.state}
💼 *Tipo:* ${payload.job.contractType}
🏠 *Modalidade:* ${payload.job.schedule}
💰 *Salário:* ${payload.job.salary}
👥 *Vagas:* ${payload.job.quantity}

📝 *Descrição:* ${payload.job.description}`;

      window.open(getWhatsAppUrl(COMPANY.whatsapp, message), '_blank');

      setSubmitSuccess(true);
      reset();
    } catch (err) {
      setSubmitError(normalizeError(err).userMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <Section className="pt-20 md:pt-28">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl text-center"
          >
            <Card variant="default" className="rounded-2xl p-8 text-center">
              <div className="bg-success/10 text-success mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-foreground mb-2 text-2xl font-bold">
                Vaga enviada para publicação!
              </h2>
              <p className="text-muted-foreground mb-6">
                Recebemos os dados da sua vaga. Nossa equipe revisará e
                publicará em até 24 horas úteis.
              </p>
              <Button
                variant="secondary"
                onClick={() => setSubmitSuccess(false)}
              >
                Publicar outra vaga
              </Button>
            </Card>
          </motion.div>
        </Container>
      </Section>
    );
  }

  return (
    <Section className="pt-20 md:pt-28">
      <Container>
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-primary/10 text-primary mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4" />
                Divulgar Vaga
              </div>
              <h1 className="text-foreground text-3xl font-bold sm:text-4xl">
                Publique sua vaga
              </h1>
              <p className="text-muted-foreground mt-4">
                Preencha os dados da empresa e da vaga. Nossa equipe revisa e
                publica em até 24 horas.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  'Publicação em até 24 horas',
                  'Divulgação em nosso banco de talentos',
                  'Suporte na seleção',
                  'Sem custo para a primeira publicação',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="text-primary h-5 w-5 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-3">
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              onSubmit={handleSubmit(onSubmit)}
            >
              <Card
                variant="default"
                className="shadow-premium rounded-2xl p-6 sm:p-8"
              >
                {submitError && (
                  <div className="mb-6">
                    <FormAlert variant="error" description={submitError} />
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="text-foreground text-lg font-semibold">
                    Dados da empresa
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Informações de contato e identificação da empresa.
                  </p>
                </div>

                <div className="space-y-5">
                  <FormField
                    label="Nome da empresa *"
                    error={errors.companyName?.message}
                  >
                    <Input
                      placeholder="J&T Logística Ltda"
                      {...register('companyName')}
                    />
                  </FormField>

                  <FormField
                    label="CNPJ"
                    error={errors.cnpj?.message}
                    helperText="Opcional"
                  >
                    <Input
                      placeholder="00.000.000/0001-00"
                      {...register('cnpj')}
                    />
                  </FormField>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <FormField
                      label="Responsável *"
                      error={errors.contactName?.message}
                    >
                      <Input
                        placeholder="João Silva"
                        {...register('contactName')}
                      />
                    </FormField>
                    <FormField label="E-mail *" error={errors.email?.message}>
                      <Input
                        type="email"
                        placeholder="contato@empresa.com.br"
                        {...register('email')}
                      />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <FormField label="Telefone *" error={errors.phone?.message}>
                      <Input
                        placeholder="(11) 99999-9999"
                        {...register('phone')}
                      />
                    </FormField>
                    <FormField
                      label="WhatsApp"
                      error={errors.whatsapp?.message}
                      helperText="Opcional"
                    >
                      <Input
                        placeholder="(11) 99999-9999"
                        {...register('whatsapp')}
                      />
                    </FormField>
                  </div>
                </div>

                <div className="mt-8 mb-6">
                  <h2 className="text-foreground text-lg font-semibold">
                    Dados da vaga
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Descreva a posição e os requisitos.
                  </p>
                </div>

                <div className="space-y-5">
                  <FormField label="Cargo *" error={errors.title?.message}>
                    <Input
                      placeholder="Auxiliar de Limpeza"
                      {...register('title')}
                    />
                  </FormField>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <FormField
                      label="Quantidade *"
                      error={errors.quantity?.message}
                    >
                      <Input type="number" min={1} {...register('quantity')} />
                    </FormField>
                    <FormField
                      label="Tipo de contratação *"
                      error={errors.contractType?.message}
                    >
                      <Select {...register('contractType')}>
                        {contractTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <FormField label="Cidade *" error={errors.city?.message}>
                      <Input placeholder="São Paulo" {...register('city')} />
                    </FormField>
                    <FormField
                      label="Estado (sigla) *"
                      error={errors.state?.message}
                    >
                      <Input
                        placeholder="SP"
                        maxLength={2}
                        {...register('state', { valueAsNumber: false })}
                      />
                    </FormField>
                  </div>

                  <FormField
                    label="Modalidade de trabalho *"
                    error={errors.workMode?.message}
                  >
                    <Select {...register('workMode')}>
                      {workModeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </FormField>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <FormField
                      label="Salário mínimo"
                      error={errors.salaryMin?.message}
                      helperText="Opcional"
                    >
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="2000"
                        {...register('salaryMin', { valueAsNumber: true })}
                      />
                    </FormField>
                    <FormField
                      label="Salário máximo"
                      error={errors.salaryMax?.message}
                      helperText="Opcional"
                    >
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="3000"
                        {...register('salaryMax', { valueAsNumber: true })}
                      />
                    </FormField>
                  </div>

                  <FormField
                    label="Tipo de salário *"
                    error={errors.salaryType?.message}
                  >
                    <Select {...register('salaryType')}>
                      {salaryTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </FormField>

                  <FormField
                    label="Descrição da vaga *"
                    error={errors.description?.message}
                  >
                    <Textarea
                      rows={4}
                      placeholder="Descreva as atividades, responsabilidades e o dia a dia da função..."
                      {...register('description')}
                    />
                  </FormField>

                  <FormField
                    label="Requisitos"
                    error={errors.requirements?.message}
                    helperText="Opcional"
                  >
                    <Textarea
                      rows={3}
                      placeholder="Ex.: Experiência prévia, certificações, conhecimentos específicos..."
                      {...register('requirements')}
                    />
                  </FormField>

                  <FormField
                    label="Benefícios"
                    error={errors.benefits?.message}
                    helperText="Opcional"
                  >
                    <Textarea
                      rows={3}
                      placeholder="Ex.: Vale-transporte, vale-refeição, plano de saúde..."
                      {...register('benefits')}
                    />
                  </FormField>

                  <FormField
                    label="Escolaridade"
                    error={errors.education?.message}
                    helperText="Opcional"
                  >
                    <Input
                      placeholder="Ensino Médio completo"
                      {...register('education')}
                    />
                  </FormField>

                  <div className="border-border bg-surface-alt rounded-xl border p-4">
                    <label className="text-foreground flex items-start gap-3 text-sm font-medium">
                      <input
                        type="checkbox"
                        className="border-input text-primary focus:ring-primary mt-0.5 h-4 w-4 rounded"
                        {...register('consentLgpd')}
                      />
                      <span>
                        Li e aceito a Política de Privacidade e autorizo o
                        tratamento dos dados pessoais para fins de recrutamento
                        e seleção.
                      </span>
                    </label>
                    {errors.consentLgpd && (
                      <p
                        className="text-destructive mt-1.5 text-sm"
                        role="alert"
                      >
                        {errors.consentLgpd.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    loading={isSubmitting}
                    leftIcon={<Send className="h-5 w-5" />}
                  >
                    Publicar vaga
                  </Button>
                </div>
              </Card>
            </motion.form>
          </div>
        </div>
      </Container>
    </Section>
  );
}
