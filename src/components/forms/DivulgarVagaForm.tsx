import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormField } from '@/components/ui/FormField';
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
  { value: 'PJ', label: 'PJ' },
  { value: 'ESTAGIO', label: 'Estágio' },
];

const jobCreateSchema = z.object({
  companyName: z.string().min(2, 'Nome da empresa é obrigatório'),
  cnpj: z.string().optional(),
  contactName: z.string().min(2, 'Nome do responsável é obrigatório'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  whatsapp: z.string().optional(),
  title: z.string().min(2, 'Cargo é obrigatório'),
  quantity: z.coerce.number().min(1, 'Quantidade mínima de 1'),
  city: z.string().min(2, 'Cidade é obrigatória'),
  state: z.string().min(2, 'Estado é obrigatório'),
  contractType: z.string().min(1, 'Selecione o tipo de contratação'),
  salary: z.string().optional(),
  benefits: z.string().optional(),
  schedule: z.string().optional(),
  description: z
    .string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  requirements: z.string().optional(),
  education: z.string().optional(),
  consentLgpd: z
    .boolean()
    .refine((val) => val === true, 'Você precisa aceitar os termos'),
});

type JobCreateFormData = z.infer<typeof jobCreateSchema>;

export function DivulgarVagaForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<JobCreateFormData>({
    resolver: zodResolver(jobCreateSchema),
    defaultValues: {
      quantity: 1,
      consentLgpd: false,
    },
  });

  const onSubmit = async (data: JobCreateFormData): Promise<void> => {
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
          state: sanitizeText(data.state).toUpperCase(),
          contractType: data.contractType,
          salary: data.salary ? sanitizeText(data.salary) : undefined,
          benefits: data.benefits ? sanitizeText(data.benefits) : undefined,
          schedule: data.schedule ? sanitizeText(data.schedule) : undefined,
          description: sanitizeTextarea(data.description),
          requirements: data.requirements
            ? sanitizeTextarea(data.requirements)
            : undefined,
          education: data.education ? sanitizeText(data.education) : undefined,
        },
        source: 'website',
        consentLgpd: data.consentLgpd,
      };

      await new Promise((resolve) => setTimeout(resolve, 1200));
      console.log('JobCreatePayload', payload);
      setSubmitted(true);
      reset();
    } catch (err) {
      const normalized = normalizeError(err);
      setSubmitError(normalized.userMessage);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md text-center"
        >
          <div className="bg-success/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
            <CheckCircle2 className="text-success h-10 w-10" />
          </div>
          <h2 className="text-foreground mb-4 text-2xl font-bold">
            Solicitação enviada!
          </h2>
          <p className="text-muted-foreground mb-8">
            Nossa equipe entrará em contato em até 24 horas. Enquanto isso, você
            pode nos chamar no WhatsApp para uma resposta mais rápida.
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
                <Send className="mr-2 h-5 w-5" />
                Continuar no WhatsApp
              </Button>
            </a>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setSubmitted(false)}
            >
              Nova solicitação
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <Section>
      <Container>
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-primary/10 text-primary mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
                <Send className="h-4 w-4" />
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
              className="bg-card border-border shadow-premium rounded-2xl border p-6 sm:p-8"
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
                    <Input placeholder="Poá" {...register('city')} />
                  </FormField>
                  <FormField label="Estado *" error={errors.state?.message}>
                    <Input placeholder="SP" {...register('state')} />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <FormField
                    label="Faixa salarial"
                    error={errors.salary?.message}
                    helperText="Opcional"
                  >
                    <Input placeholder="R$ 2.500,00" {...register('salary')} />
                  </FormField>
                  <FormField
                    label="Horário"
                    error={errors.schedule?.message}
                    helperText="Opcional"
                  >
                    <Input
                      placeholder="Seg a Sex, 08h às 17h"
                      {...register('schedule')}
                    />
                  </FormField>
                </div>

                <FormField
                  label="Descrição da vaga *"
                  error={errors.description?.message}
                >
                  <Textarea
                    rows={4}
                    placeholder="Descreva as atividades e responsabilidades..."
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
                    placeholder="Experiência, competências técnicas, certificações..."
                    {...register('requirements')}
                  />
                </FormField>

                <FormField
                  label="Benefícios"
                  error={errors.benefits?.message}
                  helperText="Opcional"
                >
                  <Textarea
                    rows={2}
                    placeholder="Vale transporte, vale refeição, plano de saúde..."
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
                      tratamento dos dados pessoais para fins de recrutamento e
                      seleção.
                    </span>
                  </label>
                  {errors.consentLgpd && (
                    <p className="text-destructive mt-1.5 text-sm" role="alert">
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
            </motion.form>
          </div>
        </div>
      </Container>
    </Section>
  );
}
