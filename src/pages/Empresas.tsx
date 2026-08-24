import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { staggerReveal, revealUp } from '@/animations/scroll';
import { staggerItem } from '@/animations/fade';
import { useCompanies } from '@/hooks/useCompanies';
import { useAuth } from '@/contexts/AuthContext';
import { SafeImage } from '@/components/ui/SafeImage';
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
  Inbox,
} from 'lucide-react';

export default function Empresas() {
  const { currentTenantId } = useAuth();
  const { companies, isLoading, error } = useCompanies(currentTenantId, {
    status: 'active',
  });

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

          {error && (
            <div className="border-destructive/50 bg-destructive/5 mt-8 rounded-xl border p-4 text-center text-sm text-red-600">
              {error}
            </div>
          )}

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

            {isLoading && companies.length === 0 ? (
              <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-muted/50 border-border/50 rounded-2xl border p-4"
                  >
                    <div className="bg-muted mb-3 h-16 w-full animate-pulse rounded" />
                    <div className="bg-muted h-4 w-2/3 animate-pulse rounded" />
                  </div>
                ))}
              </div>
            ) : companies.length > 0 ? (
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerReveal(0.1)}
                className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4"
              >
                {companies.map((company) => (
                  <motion.div
                    key={company.id}
                    variants={staggerItem('up')}
                    className="bg-muted/50 border-border/50 group relative overflow-hidden rounded-2xl border"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden">
                      {company.logo_url ? (
                        <SafeImage
                          src={company.logo_url}
                          alt={company.trading_name || company.legal_name}
                          className="h-full w-full object-cover grayscale-[40%] transition-all duration-300 group-hover:grayscale-0"
                        />
                      ) : (
                        <div className="bg-muted flex h-full w-full items-center justify-center">
                          <Building2 className="text-muted-foreground h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div className="p-3 text-center">
                      <span className="text-foreground text-xs font-semibold">
                        {company.trading_name || company.legal_name}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="border-border mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center"
              >
                <Inbox className="text-muted-foreground mb-4 h-12 w-12" />
                <h3 className="text-foreground text-lg font-semibold">
                  Nenhuma empresa cadastrada
                </h3>
                <p className="text-muted-foreground mt-2 max-w-md text-sm">
                  As empresas parceiras aparecerão aqui automaticamente após o
                  cadastro.
                </p>
              </motion.div>
            )}
          </motion.div>

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
