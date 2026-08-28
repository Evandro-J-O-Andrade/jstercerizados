import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { staggerReveal, revealUp } from '@/animations/scroll';
import { staggerItem } from '@/animations/fade';
import { COMPANY, WHATSAPP_MESSAGES, getWhatsAppUrl } from '@/config';
import {
  Phone,
  Building2,
  Users,
  MapPin,
  CheckCircle2,
  Shield,
  Briefcase,
  Handshake,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getSupabaseClient } from '@/lib/supabase';
import type { Company } from '@/types/domain';

function useCompanies() {
  return useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const supabase = getSupabaseClient();
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('companies')
        .select('id, legal_name, trading_name, cnpj, status')
        .order('created_at', { ascending: true })
        .limit(50);
      if (error) throw error;
      return (data || []) as Company[];
    },
  });
}

export default function Empresas() {
  const { data: companies = [], isLoading } = useCompanies();
  return (
    <div className="min-h-screen">
      <SEO
        title={`Para Empresas — ${COMPANY.name}`}
        description="Soluções em recrutamento, seleção, mão de obra temporária e efetiva, terceirização e facilities para empresas."
        keywords={[
          'empresas',
          'recrutamento',
          'seleção',
          'mão de obra temporária',
          'terceirização',
          'facilities',
          'RH',
          'vagas',
        ]}
        type="WebSite"
      />
      <Section className="pt-20 md:pt-28">
        <Container>
          {/* Hero */}
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
              <Building2 className="h-4 w-4" />
              <span>Para Empresas</span>
            </motion.div>

            <h1 className="text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl">
              Encontre profissionais qualificados para sua equipe
            </h1>
            <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
              Nossa assessoria em RH e soluções de terceirização conectam
              empresas aos melhores profissionais do mercado.
            </p>
          </motion.div>

          {/* CTA principal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex justify-center gap-4"
          >
            <Link to="/empresas/divulgar-vaga">
              <Button variant="primary" size="lg">
                <Users className="mr-2 h-5 w-5" />
                Divulgar Vaga
              </Button>
            </Link>
            <motion.a
              href={getWhatsAppUrl(
                COMPANY.whatsapp,
                WHATSAPP_MESSAGES.comercial,
              )}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button variant="outline" size="lg">
                <Phone className="mr-2 h-5 w-5" />
                Falar com um consultor
              </Button>
            </motion.a>
          </motion.div>

          {/* Benefícios */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerReveal(0.15)}
            className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4"
          >
            {[
              {
                title: 'Recrutamento Ágil',
                desc: 'Encontramos os profissionais certos em até 7 dias.',
                icon: MapPin,
              },
              {
                title: 'Atendimento WhatsApp',
                desc: 'Comunicação direta e acompanhamento em tempo real.',
                icon: Phone,
              },
              {
                title: 'Garantia de Qualidade',
                desc: 'Satisfação garantida ou substituímos o profissional.',
                icon: CheckCircle2,
              },
              {
                title: 'Preços transparentes',
                desc: 'Orçamento sem custo e sem compromisso.',
                icon: Shield,
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                variants={staggerItem('up')}
                className="text-center"
              >
                <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-foreground mb-2 text-lg font-semibold">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Clientes que confiam na J&S */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerReveal(0.15)}
            className="mt-24"
          >
            <motion.h2
              variants={revealUp}
              className="text-foreground text-center text-3xl font-bold sm:text-4xl"
            >
              Clientes que confiam na J&S
            </motion.h2>
            <motion.p
              variants={revealUp}
              className="text-muted-foreground mx-auto mt-4 max-w-2xl text-center text-lg"
            >
              Empresas que escolheram nossas soluções para apoiar seus processos
              de Recursos Humanos, mão de obra e serviços especializados.
            </motion.p>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerReveal(0.1)}
              className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4"
            >
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                      key={i}
                      variants={staggerItem('up')}
                      className="bg-muted/50 border-border/50 rounded-2xl border p-6"
                    >
                      <div className="bg-muted mx-auto h-12 w-12 animate-pulse rounded-xl" />
                      <div className="bg-muted mx-auto mt-4 h-4 w-24 animate-pulse rounded" />
                    </motion.div>
                  ))
                : companies
                    .filter((company) => company.status === 'active')
                    .map((company) => (
                      <motion.div
                        key={company.id}
                        variants={staggerItem('up')}
                        className="bg-card border-border hover:border-primary/30 flex flex-col items-center justify-center rounded-2xl border p-6 transition-all duration-300"
                      >
                        <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold">
                          {(company.trading_name || company.legal_name)
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <span className="text-foreground mt-3 text-center text-sm font-medium">
                          {company.trading_name || company.legal_name}
                        </span>
                      </motion.div>
                    ))}
            </motion.div>
          </motion.div>

          {/* Fornecedores */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerReveal(0.15)}
            className="mt-24"
          >
            <motion.h2
              variants={revealUp}
              className="text-foreground text-center text-3xl font-bold sm:text-4xl"
            >
              Seja um fornecedor J&S
            </motion.h2>
            <motion.p
              variants={revealUp}
              className="text-muted-foreground mx-auto mt-4 max-w-2xl text-center text-lg"
            >
              Fazemos parte de uma cadeia de valor ampla e qualificada. Se sua
              empresa fornece produtos ou serviços compatíveis com nossas
              operações, queremos conhecer você.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-10 flex justify-center"
            >
              <Link to="/fornecedores">
                <Button variant="secondary" size="lg">
                  <Briefcase className="mr-2 h-5 w-5" />
                  Quero ser fornecedor
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Sua empresa */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerReveal(0.15)}
            className="mt-24"
          >
            <motion.div
              variants={revealUp}
              className="bg-card border-border shadow-premium rounded-3xl border p-8 sm:p-12"
            >
              <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                <motion.div variants={staggerItem('up')}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-primary/10 text-primary mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
                  >
                    <Handshake className="h-4 w-4" />
                    <span>Soluções para empresas</span>
                  </motion.div>
                  <h2 className="text-foreground text-3xl font-bold sm:text-4xl">
                    Sua empresa precisa contratar?
                  </h2>
                  <p className="text-muted-foreground mt-4 text-lg">
                    Encontre uma solução adequada para a necessidade da sua
                    empresa. Recrutamento, seleção, mão de obra e facilities com
                    agilidade e qualidade.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <Link to="/empresas/divulgar-vaga">
                      <Button variant="primary" size="lg">
                        <Users className="mr-2 h-5 w-5" />
                        Divulgar vaga
                      </Button>
                    </Link>
                    <motion.a
                      href={getWhatsAppUrl(
                        COMPANY.whatsapp,
                        WHATSAPP_MESSAGES.comercial,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button variant="outline" size="lg">
                        <Phone className="mr-2 h-5 w-5" />
                        Falar com nosso comercial
                      </Button>
                    </motion.a>
                  </div>
                </motion.div>

                <motion.div
                  variants={staggerItem('up')}
                  className="bg-muted/50 border-border/50 rounded-2xl border p-6"
                >
                  <h3 className="text-foreground mb-4 text-lg font-semibold">
                    Nossas soluções
                  </h3>
                  <div className="space-y-3">
                    {[
                      'Recrutamento e Seleção',
                      'Mão de Obra Temporária',
                      'Mão de Obra Efetiva',
                      'Assessoria em RH',
                      'Terceirização e Facilities',
                      'Limpeza e Conservação',
                      'Jardinagem e Paisagismo',
                      'Portaria e Zeladoria',
                    ].map((solution) => (
                      <div key={solution} className="flex items-center gap-3">
                        <CheckCircle2 className="text-primary h-5 w-5 flex-shrink-0" />
                        <span className="text-muted-foreground text-sm">
                          {solution}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </Section>
    </div>
  );
}
