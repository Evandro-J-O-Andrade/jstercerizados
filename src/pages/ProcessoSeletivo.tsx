import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  ArrowRight,
  FileText,
  Shield,
  Send,
  Mail,
  Phone,
} from 'lucide-react';
import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { Button } from '@/components/ui/Button';
import { COMPANY, WHATSAPP_MESSAGES, getWhatsAppUrl } from '@/config';

const steps = [
  {
    step: '01',
    title: 'Cadastro',
    description:
      'Preencha o formulário com seus dados e anexe seu currículo no Banco de Talentos.',
    icon: FileText,
  },
  {
    step: '02',
    title: 'Candidatura',
    description:
      'Candidate-se às vagas que combinam com seu perfil e receba confirmação via WhatsApp.',
    icon: Send,
  },
  {
    step: '03',
    title: 'Processo Seletivo',
    description:
      'Nossa equipe de RH analisa seu perfil, realiza avaliações e agendará sua entrevista.',
    icon: Shield,
  },
  {
    step: '04',
    title: 'Contratação',
    description:
      'Receba a proposta e inicie sua nova oportunidade profissional com a ${COMPANY.tradingName}.',
    icon: CheckCircle2,
  },
];

export default function ProcessoSeletivo() {
  return (
    <div>
      <SEO
        title={`Processo Seletivo — ${COMPANY.name}`}
        description="Conheça as etapas do nosso processo seletivo: cadastro, candidatura, entrevista e contratação."
        keywords={[
          'processo seletivo',
          'seleção',
          'entrevista',
          'candidatura',
          COMPANY.name,
          'RH',
          'emprego',
          'trabalho',
        ]}
        type="WebSite"
      />
      <Section>
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h1 className="text-foreground text-4xl font-bold sm:text-5xl">
              Processo Seletivo
            </h1>
            <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
              Conheça as etapas do nosso processo seletivo e acompanhe sua
              candidatura.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="relative text-center"
              >
                {index < steps.length - 1 && (
                  <div className="bg-border absolute top-8 right-[-2rem] left-[calc(50%+2rem)] hidden h-0.5 md:block" />
                )}
                <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                  <step.icon className="h-8 w-8" />
                </div>
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 + 0.1 }}
                  className="text-foreground mb-2 text-lg font-semibold"
                >
                  {step.step} — {step.title}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 + 0.15 }}
                  className="text-muted-foreground text-sm leading-relaxed"
                >
                  {step.description}
                </motion.p>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-surface-alt">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.15, delayChildren: 0.1 },
              },
            }}
            className="mb-12 text-center"
          >
            <motion.h2
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
              }}
              className="text-foreground text-3xl font-bold sm:text-4xl"
            >
              Vagas em Destaque
            </motion.h2>
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6, delay: 0.1 },
                },
              }}
              className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
            >
              Confira as oportunidades disponíveis e candidate-se agora.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.1 },
              },
            }}
            className="mb-8 flex justify-center"
          >
            <Link to="/vagas">
              <Button variant="primary" size="lg">
                Ver todas as vagas
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.1 },
              },
            }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {[
              {
                title: 'Analista Administrativo',
                desc: 'CLT · São Paulo, SP · Híbrido',
              },
              {
                title: 'Operador de Empilhadeira',
                desc: 'CLT · Arujá, SP · Presencial',
              },
              {
                title: 'Auxiliar de Produção',
                desc: 'CLT · São Paulo, SP · 24h',
              },
              {
                title: 'Auxiliar de Limpeza',
                desc: 'Terç. · São Paulo, SP · Noturno',
              },
            ].map((job) => (
              <motion.div
                key={job.title}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-card shadow-premium group relative overflow-hidden rounded-2xl p-6 transition-all duration-300"
              >
                <div className="bg-primary/5 group-hover:bg-primary/10 absolute -top-10 -right-10 h-20 w-20 rounded-full transition-colors" />
                <h3 className="text-foreground group-hover:text-primary mb-2 text-lg font-semibold transition-colors">
                  {job.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {job.desc}
                </p>
                <Link
                  to="/trabalhe-conosco"
                  className="text-primary mt-4 inline-flex items-center gap-2 text-sm font-medium transition-colors"
                >
                  Se candidatar
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </Section>

      <Section>
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card shadow-premium rounded-3xl p-8 text-center sm:p-12"
          >
            <h2 className="text-foreground text-3xl font-bold sm:text-4xl">
              Ainda tem dúvidas?
            </h2>
            <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg">
              Entre em contato pelo WhatsApp e fale com um de nossos
              especialistas.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                href={getWhatsAppUrl(
                  COMPANY.whatsapp,
                  WHATSAPP_MESSAGES.process,
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow-lg inline-flex h-14 items-center gap-2 rounded-[18px] px-8 py-4 text-base font-medium transition-all">
                  <Phone className="h-5 w-5" />
                  Falar no WhatsApp
                </button>
              </a>
              <Link to="/contato">
                <button className="border-border text-foreground hover:bg-muted border-border/30 inline-flex h-14 items-center gap-2 rounded-[18px] border px-8 py-4 text-base font-medium backdrop-blur transition-all">
                  <Mail className="mr-2 h-5 w-5" />
                  Enviar E-mail
                </button>
              </Link>
            </div>
          </motion.div>
        </Container>
      </Section>
    </div>
  );
}
