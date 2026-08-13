import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle2, Send, Phone, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { mockSubmitBudget } from '@/services/mock/clientes';
import { COMPANY, WHATSAPP_MESSAGES, getWhatsAppUrl } from '@/config';
import {
  sanitizeText,
  sanitizeName,
  sanitizeEmail,
  sanitizePhone,
  sanitizeTextarea,
} from '@/utils/sanitize';

const budgetSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  company: z.string().min(2, 'Nome da empresa é obrigatório'),
  cnpj: z.string().min(14, 'CNPJ deve ter pelo menos 14 caracteres'),
  city: z.string().min(2, 'Cidade é obrigatória'),
  state: z.string().min(2, 'Estado é obrigatório'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 caracteres'),
  whatsapp: z.string().min(10, 'WhatsApp deve ter pelo menos 10 caracteres'),
  service: z.string().min(1, 'Selecione um serviço'),
  posts: z.coerce.number().min(1, 'Deve ser pelo menos 1 posto'),
  message: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres'),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

export default function Clientes() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      posts: 1,
    },
  });

  const onSubmit = async (data: BudgetFormData): Promise<void> => {
    mockSubmitBudget({
      name: sanitizeName(data.name),
      company: sanitizeText(data.company),
      cnpj: sanitizeText(data.cnpj),
      city: sanitizeText(data.city),
      state: sanitizeText(data.state).toUpperCase(),
      email: sanitizeEmail(data.email),
      phone: sanitizePhone(data.phone),
      whatsapp: sanitizePhone(data.whatsapp),
      service: data.service,
      posts: data.posts,
      message: sanitizeTextarea(data.message),
      status: 'new',
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
            <CheckCircle2 className="text-success h-10 w-10" />
          </div>
          <h2 className="text-foreground mb-4 text-2xl font-bold">
            Solicitação Enviada!
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
        title={`Clientes — ${COMPANY.name}`}
        description="Solicite orçamento de serviços de RH, recrutamento, terceirização e facilities. Atendimento personalizado para sua empresa."
        keywords={[
          'clientes',
          'orçamento',
          'serviços',
          COMPANY.name,
          'RH',
          'recrutamento',
          'terceirização',
          'facilities',
          'limpeza',
          'jardinagem',
        ]}
        type="Organization"
      />
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
                  <Shield className="h-4 w-4" />
                  Solicitar Profissionais
                </div>
                <h1 className="text-foreground text-3xl font-bold sm:text-4xl">
                  Solicite Profissionais para sua Empresa
                </h1>
                <p className="text-muted-foreground mt-4">
                  Preencha o formulário com seus dados e necessidades. Nossa
                  equipe analisará sua solicitação e elaborará uma proposta
                  personalizada.
                </p>

                <div className="mt-8 space-y-4">
                  {[
                    'Resposta em até 24 horas',
                    'Proposta personalizada',
                    'Sem compromisso',
                    'Atendimento especializado',
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
                  <div className="md:col-span-2">
                    <Input
                      label="Empresa *"
                      placeholder="ABC Segurança Ltda"
                      error={errors.company?.message}
                      {...register('company')}
                    />
                  </div>
                  <div>
                    <Input
                      label="CNPJ *"
                      placeholder="00.000.000/0001-00"
                      error={errors.cnpj?.message}
                      {...register('cnpj')}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Cidade *"
                      placeholder="São Paulo"
                      error={errors.city?.message}
                      {...register('city')}
                    />
                    <Input
                      label="Estado *"
                      placeholder="SP"
                      error={errors.state?.message}
                      {...register('state')}
                    />
                  </div>
                  <div>
                    <Input
                      label="E-mail *"
                      type="email"
                      placeholder="contato@empresa.com.br"
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
                  <div>
                    <Input
                      label="WhatsApp *"
                      placeholder="(11) 99999-9999"
                      error={errors.whatsapp?.message}
                      {...register('whatsapp')}
                    />
                  </div>
                  <div>
                    <Select
                      label="Serviço Desejado *"
                      error={errors.service?.message}
                      {...register('service')}
                    >
                      <option value="">Selecione um serviço</option>
                      <option value="seguranca">Segurança Patrimonial</option>
                      <option value="controle-acesso">
                        Controle de Acesso
                      </option>
                      <option value="portaria">Portaria</option>
                      <option value="recepcao">Recepção</option>
                      <option value="limpeza">Limpeza</option>
                      <option value="zeladoria">Zeladoria</option>
                      <option value="facilities">Facilities</option>
                      <option value="monitoramento">Monitoramento</option>
                      <option value="recrutamento">
                        Recrutamento e Seleção
                      </option>
                      <option value="terceirizacao">Terceirização</option>
                      <option value="hunting">Hunting de Executivos</option>
                    </Select>
                  </div>
                  <div>
                    <Input
                      label="Quantidade de Vagas *"
                      type="number"
                      min={1}
                      placeholder="1"
                      error={errors.posts?.message}
                      {...register('posts')}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Textarea
                      label="Mensagem *"
                      placeholder="Descreva suas necessidades..."
                      rows={4}
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
                    disabled={isSubmitting}
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
