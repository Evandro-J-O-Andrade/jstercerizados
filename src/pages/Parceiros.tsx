import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle2, Send, Phone, Shield, Handshake } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { PartnerSupplierCard } from '@/components/sections/PartnerSupplierCard';
import { ErrorState } from '@/components/fallback/ErrorState';
import { mockSubmitPartner } from '@/services/mock/parceiros';
import { usePublicPartnersAsPartnerVisuals } from '@/hooks/usePublicPartners';
import { COMPANY, WHATSAPP_MESSAGES, getWhatsAppUrl } from '@/config';
import {
  sanitizeText,
  sanitizeName,
  sanitizeEmail,
  sanitizePhone,
} from '@/utils/sanitize';

const partnerSchema = z.object({
  company: z.string().min(2, 'Nome da empresa é obrigatório'),
  cnpj: z.string().min(14, 'CNPJ deve ter pelo menos 14 caracteres'),
  responsible: z.string().min(2, 'Nome do responsável é obrigatório'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 caracteres'),
  email: z.string().email('E-mail inválido'),
  area: z.string().min(2, 'Área de atuação é obrigatória'),
  city: z.string().min(2, 'Cidade é obrigatória'),
  state: z.string().min(2, 'Estado é obrigatório'),
  documentation: z.string().min(2, 'Selecione a documentação'),
});

type PartnerFormData = z.infer<typeof partnerSchema>;

export default function Parceiros() {
  const [submitted, setSubmitted] = useState(false);
  const { partners, isLoading, error, source, refetch } =
    usePublicPartnersAsPartnerVisuals();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PartnerFormData>({
    resolver: zodResolver(partnerSchema),
  });

  const onSubmit = async (data: PartnerFormData): Promise<void> => {
    mockSubmitPartner({
      company: sanitizeText(data.company),
      cnpj: sanitizeText(data.cnpj),
      responsible: sanitizeName(data.responsible),
      phone: sanitizePhone(data.phone),
      email: sanitizeEmail(data.email),
      area: sanitizeText(data.area),
      city: sanitizeText(data.city),
      state: sanitizeText(data.state).toUpperCase(),
      documentation: sanitizeText(data.documentation),
      status: 'pending',
    });
    setSubmitted(true);
    reset();
  };

  if (submitted) {
    return (
      <div className="flex min-h-[70dvh] items-center justify-center">
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
            Cadastro Enviado!
          </h2>
          <p className="text-muted-foreground mb-8">
            Nossa equipe de Comercial B2B entrará em contato em até 48 horas
            para dar continuidade ao processo de parceria.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href={getWhatsAppUrl(
                COMPANY.whatsapp,
                WHATSAPP_MESSAGES.partners,
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
        title={`Parceiros — ${COMPANY.name}`}
        description={`Veja as empresas parceiras da ${COMPANY.name} e cadastre-se para fazer parte da nossa rede de alianças estratégicas.`}
        keywords={[
          'parceiros',
          COMPANY.name,
          'parceria',
          'negócios',
          'RH',
          'terceirização',
          'facilities',
        ]}
        type="Organization"
      />
      {/* Vitrine de parceiros (DB-first + MOCK fallback) */}
      <Section className="pt-20 md:pt-28">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
            >
              <Handshake className="h-4 w-4" />
              <span>Parceiros</span>
            </motion.div>
            <h1 className="text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl">
              Empresas que caminham com a gente
            </h1>
            <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
              Conheça as empresas que mantêm relacionamento de parceria com a
              J&S Empregos e fazem parte da nossa rede estratégica.
            </p>
          </motion.div>

          {error && !isLoading ? (
            <div className="mt-10">
              <ErrorState onRetry={refetch} />
            </div>
          ) : (
            <>
              {isLoading && partners.length === 0 ? (
                <div className="text-muted-foreground mt-10 text-center text-sm">
                  Carregando parceiros...
                </div>
              ) : partners.length === 0 ? (
                <div className="text-muted-foreground mt-10 text-center text-sm">
                  Nenhum parceiro público disponível no momento.
                </div>
              ) : (
                <>
                  <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {partners.map((partner, index) => (
                      <PartnerSupplierCard
                        key={partner.id}
                        id={partner.id}
                        name={partner.name}
                        logo={partner.logo}
                        image={partner.image}
                        website={partner.website}
                        description={partner.description}
                        industry={partner.industry}
                        socials={partner.socials}
                        index={index}
                      />
                    ))}
                  </div>
                  {source === 'mock' && (
                    <p className="text-muted-foreground mt-6 text-center text-xs">
                      Exibindo catálogo de demonstração. Os dados reais
                      aparecerão automaticamente quando forem publicados.
                    </p>
                  )}
                </>
              )}
            </>
          )}
        </Container>
      </Section>

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
                  Ser Parceiro
                </div>
                <h2 className="text-foreground text-3xl font-bold sm:text-4xl">
                  Cadastro de Parceiros
                </h2>
                <p className="text-muted-foreground mt-4">
                  Empresas interessadas em recrutamento, seleção e alianças
                  comerciais podem se cadastrar para avaliar oportunidades de
                  parceria.
                </p>
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
                      label="Empresa *"
                      placeholder="Nome da empresa"
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
                  <div className="md:col-span-2">
                    <Input
                      label="Responsável *"
                      placeholder="Nome do responsável"
                      error={errors.responsible?.message}
                      {...register('responsible')}
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
                      label="E-mail *"
                      type="email"
                      placeholder="contato@empresa.com.br"
                      error={errors.email?.message}
                      {...register('email')}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      label="Área de Atuação *"
                      placeholder="Ex: Segurança, Portaria, Limpeza..."
                      error={errors.area?.message}
                      {...register('area')}
                    />
                  </div>
                  <div>
                    <Input
                      label="Cidade *"
                      placeholder="São Paulo"
                      error={errors.city?.message}
                      {...register('city')}
                    />
                  </div>
                  <div>
                    <Input
                      label="Estado *"
                      placeholder="SP"
                      error={errors.state?.message}
                      {...register('state')}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Select
                      label="Documentação *"
                      error={errors.documentation?.message}
                      {...register('documentation')}
                    >
                      <option value="">Selecione</option>
                      <option value="contrato-social">Contrato Social</option>
                      <option value="certidoes">Certidões Negativas</option>
                      <option value="ambas">Contrato Social + Certidões</option>
                    </Select>
                    {errors.documentation && (
                      <p className="text-destructive mt-1 text-sm">
                        {errors.documentation.message}
                      </p>
                    )}
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
                    Enviar Cadastro e Abrir WhatsApp
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
