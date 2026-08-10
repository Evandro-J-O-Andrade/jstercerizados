import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle2, Send, Phone, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { mockSubmitSupplier } from '@/services/mock/fornecedores';
import { COMPANY, WHATSAPP_MESSAGES, getWhatsAppUrl } from '@/config';

const supplierSchema = z.object({
  company: z.string().min(2, 'Nome da empresa é obrigatório'),
  cnpj: z.string().min(14, 'CNPJ deve ter pelo menos 14 caracteres'),
  products: z.string().min(2, 'Produtos são obrigatórios'),
  representative: z.string().min(2, 'Nome do representante é obrigatório'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 caracteres'),
  email: z.string().email('E-mail inválido'),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

export default function Fornecedores() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
  });

  const onSubmit = async (data: SupplierFormData): Promise<void> => {
    mockSubmitSupplier({
      ...data,
      status: 'active',
      catalog: '',
      documents: '',
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
            Cadastro Enviado!
          </h2>
          <p className="text-muted-foreground mb-8">
            Nossa equipe de Compras analisará seu cadastro e entrará em contato
            em breve.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href={getWhatsAppUrl(
                COMPANY.whatsapp,
                WHATSAPP_MESSAGES.suppliers,
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
        title={`Fornecedores — ${COMPANY.name}`}
        description={`Cadastro de fornecedores da ${COMPANY.name}. Torne-se um parceiro fornecedor de serviços de RH, facilities e terceirização.`}
        keywords={[
          'fornecedores',
          COMPANY.name,
          'cadastro',
          'parceria',
          'fornecimento',
          'RH',
          'terceirização',
          'facilities',
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
                  Cadastro de Fornecedores
                </div>
                <h1 className="text-foreground text-3xl font-bold sm:text-4xl">
                  Seja um Fornecedor
                </h1>
                <p className="text-muted-foreground mt-4">
                  Cadastre sua empresa para participar do nosso processo de
                  seleção de fornecedores.
                </p>
              </motion.div>
            </div>

            <div className="lg:col-span-3">
              <motion.form
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                onSubmit={handleSubmit(onSubmit)}
                className="bg-card border-border shadow-premium rounded-2xl border p-8"
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
                      label="Produtos / Serviços *"
                      placeholder="Ex: Equipamentos de segurança, produtos de limpeza..."
                      error={errors.products?.message}
                      {...register('products')}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      label="Representante *"
                      placeholder="Nome do representante comercial"
                      error={errors.representative?.message}
                      {...register('representative')}
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
                      placeholder="contato@fornecedor.com.br"
                      error={errors.email?.message}
                      {...register('email')}
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
