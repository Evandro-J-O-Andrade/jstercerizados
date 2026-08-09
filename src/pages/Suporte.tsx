import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Phone,
  Clock,
  MessageSquare,
  Wrench,
  Handshake,
  Truck,
  Users,
  BookOpen,
  Send,
  ChevronDown,
  CheckCircle2,
  Shield,
  Zap,
  Globe,
  Mail,
  MapPin,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { COMPANY, WHATSAPP_MESSAGES, getWhatsAppUrl } from '@/config';
import { staggerReveal, revealUp } from '@/animations/scroll';
import { staggerItem } from '@/animations/fade';
import { sendToN8n } from '@/lib/n8n';

const SUPPORT_CARDS = [
  {
    icon: MessageSquare,
    title: 'Comercial',
    description: 'Solicitar orçamento ou conhecer nossos serviços.',
    response: 'Até 15 minutos',
    color: 'gold',
    message: WHATSAPP_MESSAGES.comercial,
  },
  {
    icon: Wrench,
    title: 'Suporte ao Cliente',
    description: 'Para quem já é cliente. Abra um atendimento.',
    response: 'Até 15 minutos',
    color: 'navy',
    message: WHATSAPP_MESSAGES.suporte,
  },
  {
    icon: Handshake,
    title: 'Parceiros',
    description: 'Empresas interessadas em parceria comercial.',
    response: 'Até 24 horas',
    color: 'gold',
    message: WHATSAPP_MESSAGES.partners,
  },
  {
    icon: Truck,
    title: 'Fornecedores',
    description: 'Cadastro e contato comercial para fornecedores.',
    response: 'Até 24 horas',
    color: 'navy',
    message: WHATSAPP_MESSAGES.suppliers,
  },
  {
    icon: Users,
    title: 'Trabalhe Conosco',
    description: 'Envie seu currículo e conheça nossas oportunidades.',
    response: 'Até 5 dias úteis',
    color: 'gold',
    message: WHATSAPP_MESSAGES.careers,
  },
  {
    icon: BookOpen,
    title: 'Documentação',
    description: 'LGPD, políticas e termos de uso.',
    response: 'Até 24 horas',
    color: 'navy',
    message: WHATSAPP_MESSAGES.contact,
  },
];

const CATEGORY_OPTIONS = [
  { value: '', label: 'Selecione uma categoria' },
  { value: 'comercial', label: 'Atendimento Comercial' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'rh', label: 'RH' },
  { value: 'operacional', label: 'Operacional' },
  { value: 'supervisao', label: 'Supervisão' },
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'contratos', label: 'Contratos' },
  { value: 'outros', label: 'Outros' },
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'Selecione a prioridade' },
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
];

const STEPS = [
  {
    number: '01',
    title: 'Preencha o formulário',
    description: 'Informe seus dados e descreva sua necessidade.',
    icon: Send,
  },
  {
    number: '02',
    title: 'Nossa IA organiza',
    description: 'Seu pedido é classificado e direcionado automaticamente.',
    icon: Sparkles,
  },
  {
    number: '03',
    title: 'Equipe recebe',
    description: 'O departamento correto recebe sua solicitação.',
    icon: Shield,
  },
  {
    number: '04',
    title: 'Contato imediato',
    description: 'Entramos em contato em até 15 minutos.',
    icon: Phone,
  },
];

export default function Suporte() {
  const [formData, setFormData] = useState({
    nome: '',
    empresa: '',
    telefone: '',
    email: '',
    cliente: '',
    contrato: '',
    categoria: '',
    prioridade: '',
    assunto: '',
    descricao: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [protocol, setProtocol] = useState('');

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const proto = `SUP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    setProtocol(proto);

    const payload = {
      protocol: proto,
      ...formData,
      submittedAt: now.toISOString(),
    };

    await sendToN8n(payload);
    setSubmitted(true);
  };

  return (
    <div>
      <SEO
        title={`Suporte — ${COMPANY.name}`}
        description={`Central de atendimento da ${COMPANY.name}: WhatsApp, chat online, FAQ e suporte ao cliente.`}
        keywords={[
          'suporte',
          'atendimento',
          'FAQ',
          'WhatsApp',
          'chat',
          COMPANY.name,
          'RH',
          'terceirização',
          'facilities',
        ]}
        type="WebSite"
      />
      {/* Hero */}
      <Section className="bg-surface-alt">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerReveal(0.15)}
            className="text-center"
          >
            <motion.h2
              variants={revealUp}
              className="text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl"
            >
              Central de Atendimento
            </motion.h2>
            <motion.p
              variants={revealUp}
              className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
            >
              Estamos prontos para ajudar você. Preencha o formulário e nossa
              equipe entrará em contato rapidamente.
            </motion.p>
          </motion.div>

          {/* Trust Bar */}
          <motion.div
            variants={revealUp}
            className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4"
          >
            {[
              {
                icon: Globe,
                value: 'Nacional',
                label: 'Atendimento em múltiplas cidades',
              },
              {
                icon: Clock,
                value: '15 min',
                label: 'Tempo médio de resposta',
              },
              {
                icon: Shield,
                value: '24h',
                label: 'Cobertura de atendimento',
              },
              {
                icon: Zap,
                value: 'Especializado',
                label: 'Atendimento humanizado',
              },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                variants={staggerItem('up')}
                className="text-center"
              >
                <stat.icon className="text-primary mx-auto h-8 w-8" />
                <p className="text-foreground mt-2 text-2xl font-bold">
                  {stat.value}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </Section>

      {/* Form + Info Side by Side */}
      <Section>
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
            {/* Form */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="bg-card/80 border-border/50 shadow-elevated relative overflow-hidden rounded-2xl border backdrop-blur-sm">
                  {/* Gradient accent */}
                  <div className="bg-primary/5 absolute -top-20 -right-20 h-60 w-60 rounded-full blur-3xl" />
                  <div className="bg-primary/5 absolute -bottom-20 -left-20 h-60 w-60 rounded-full blur-3xl" />

                  <div className="relative p-8 sm:p-10">
                    <h3 className="text-foreground text-2xl font-bold sm:text-3xl">
                      Solicitar Atendimento
                    </h3>
                    <p className="text-muted-foreground mt-2 text-sm">
                      Nosso sistema de IA organiza sua solicitação e a direciona
                      para a equipe correta.
                    </p>

                    {submitted ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-8 text-center"
                      >
                        <CheckCircle2 className="text-primary mx-auto h-16 w-16" />
                        <h4 className="text-foreground mt-4 text-xl font-bold">
                          Solicitação recebida!
                        </h4>
                        <p className="text-muted-foreground mt-2 text-sm">
                          Protocolo:{' '}
                          <span className="text-foreground font-mono font-semibold">
                            {protocol}
                          </span>
                        </p>
                        <p className="text-muted-foreground mt-2 text-sm">
                          Nossa equipe analisará sua solicitação e entrará em
                          contato em até 24 horas úteis.
                        </p>
                        <a
                          href={getWhatsAppUrl(
                            COMPANY.whatsapp,
                            WHATSAPP_MESSAGES.contactForm,
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-6 inline-flex"
                        >
                          <Button variant="secondary" size="lg">
                            <Phone className="mr-2 h-5 w-5" />
                            Abrir WhatsApp
                          </Button>
                        </a>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                          <div>
                            <label className="text-foreground mb-2 block text-sm font-medium">
                              Nome <span className="text-destructive">*</span>
                            </label>
                            <Input
                              type="text"
                              name="nome"
                              value={formData.nome}
                              onChange={handleChange}
                              required
                              placeholder="Seu nome completo"
                            />
                          </div>
                          <div>
                            <label className="text-foreground mb-2 block text-sm font-medium">
                              Empresa
                            </label>
                            <Input
                              type="text"
                              name="empresa"
                              value={formData.empresa}
                              onChange={handleChange}
                              placeholder="Nome da empresa"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                          <div>
                            <label className="text-foreground mb-2 block text-sm font-medium">
                              Telefone{' '}
                              <span className="text-destructive">*</span>
                            </label>
                            <Input
                              type="tel"
                              name="telefone"
                              value={formData.telefone}
                              onChange={handleChange}
                              required
                              placeholder="(11) 91234-5678"
                            />
                          </div>
                          <div>
                            <label className="text-foreground mb-2 block text-sm font-medium">
                              E-mail <span className="text-destructive">*</span>
                            </label>
                            <Input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              placeholder="seu@email.com"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                          <div>
                            <label className="text-foreground mb-2 block text-sm font-medium">
                              Já é cliente?
                            </label>
                            <Select
                              name="cliente"
                              value={formData.cliente}
                              onChange={handleChange}
                            >
                              <option value="">Selecione</option>
                              <option value="sim">Sim</option>
                              <option value="nao">Não</option>
                            </Select>
                          </div>
                          <div>
                            <label className="text-foreground mb-2 block text-sm font-medium">
                              Nº do contrato (opcional)
                            </label>
                            <Input
                              type="text"
                              name="contrato"
                              value={formData.contrato}
                              onChange={handleChange}
                              placeholder="Número do contrato"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                          <div>
                            <label className="text-foreground mb-2 block text-sm font-medium">
                              Categoria{' '}
                              <span className="text-destructive">*</span>
                            </label>
                            <Select
                              name="categoria"
                              value={formData.categoria}
                              onChange={handleChange}
                              required
                            >
                              {CATEGORY_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </Select>
                          </div>
                          <div>
                            <label className="text-foreground mb-2 block text-sm font-medium">
                              Prioridade{' '}
                              <span className="text-destructive">*</span>
                            </label>
                            <Select
                              name="prioridade"
                              value={formData.prioridade}
                              onChange={handleChange}
                              required
                            >
                              {PRIORITY_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </Select>
                          </div>
                        </div>

                        <div>
                          <label className="text-foreground mb-2 block text-sm font-medium">
                            Assunto <span className="text-destructive">*</span>
                          </label>
                          <Input
                            type="text"
                            name="assunto"
                            value={formData.assunto}
                            onChange={handleChange}
                            required
                            placeholder="Assunto da sua solicitação"
                          />
                        </div>

                        <div>
                          <label className="text-foreground mb-2 block text-sm font-medium">
                            Descrição{' '}
                            <span className="text-destructive">*</span>
                          </label>
                          <Textarea
                            name="descricao"
                            value={formData.descricao}
                            onChange={handleChange}
                            required
                            placeholder="Descreva sua necessidade em detalhes..."
                            rows={4}
                          />
                        </div>

                        <div>
                          <label className="text-foreground mb-2 block text-sm font-medium">
                            Existe alguma necessidade específica que não foi
                            listada acima?
                          </label>
                          <Textarea
                            name="observacoes"
                            value={formData.descricao}
                            onChange={handleChange}
                            placeholder="Conte um pouco sobre sua necessidade..."
                            rows={3}
                          />
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                          <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="flex-1"
                          >
                            <Send className="mr-2 h-5 w-5" />
                            Enviar Solicitação
                          </Button>
                          <a
                            href={getWhatsAppUrl(
                              COMPANY.whatsapp,
                              WHATSAPP_MESSAGES.contactForm,
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1"
                          >
                            <Button
                              variant="secondary"
                              size="lg"
                              className="w-full"
                            >
                              <Phone className="mr-2 h-5 w-5" />
                              Falar no WhatsApp
                            </Button>
                          </a>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Side Info */}
            <div className="space-y-6 lg:col-span-2">
              {/* How It Works */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h3 className="text-foreground text-xl font-bold">
                  Como funciona nosso atendimento?
                </h3>
                <div className="mt-4 space-y-4">
                  {STEPS.map((step, index) => (
                    <motion.div
                      key={step.title}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex gap-4"
                    >
                      <div className="flex flex-col items-center">
                        <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                          <step.icon className="h-5 w-5" />
                        </div>
                        {index < STEPS.length - 1 && (
                          <div className="bg-border mt-2 h-full w-0.5" />
                        )}
                      </div>
                      <div className="pb-4">
                        <p className="text-foreground text-sm font-semibold">
                          {step.number}. {step.title}
                        </p>
                        <p className="text-muted-foreground mt-1 text-sm">
                          {step.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Channel Choice */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-card border-border rounded-2xl border p-6"
              >
                <h4 className="text-foreground text-lg font-bold">
                  Como deseja continuar?
                </h4>
                <p className="text-muted-foreground mt-2 text-sm">
                  Escolha entre atendimento rápido com IA ou fale diretamente
                  com nossa equipe humana.
                </p>
                <div className="mt-4 space-y-3">
                  <button
                    type="button"
                    onClick={() =>
                      alert('Em breve: Assistente J&S disponível aqui.')
                    }
                    className="bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-3 rounded-xl p-4 transition-colors"
                  >
                    <Sparkles className="h-5 w-5" />
                    <div className="text-left">
                      <span className="text-sm font-semibold">
                        Assistente J&S
                      </span>
                      <p className="text-muted-foreground text-xs">
                        IA para dúvidas rápidas e suporte inicial
                      </p>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </button>
                  <a
                    href={getWhatsAppUrl(
                      COMPANY.whatsapp,
                      WHATSAPP_MESSAGES.contactForm,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-muted text-foreground hover:bg-muted/80 flex items-center gap-3 rounded-xl p-4 transition-colors"
                  >
                    <Phone className="h-5 w-5" />
                    <div className="text-left">
                      <span className="text-sm font-semibold">
                        Falar com atendente
                      </span>
                      <p className="text-muted-foreground text-xs">
                        Atendimento humano em tempo real
                      </p>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </a>
                  <a
                    href={`mailto:${COMPANY.email}`}
                    className="bg-muted text-foreground hover:bg-muted/80 flex items-center gap-3 rounded-xl p-4 transition-colors"
                  >
                    <Mail className="h-5 w-5" />
                    <div className="text-left">
                      <span className="text-sm font-semibold">E-mail</span>
                      <p className="text-muted-foreground text-xs">
                        Atendimento por e-mail
                      </p>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </a>
                </div>
              </motion.div>

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-card border-border rounded-2xl border p-6"
              >
                <h4 className="text-foreground text-lg font-bold">
                  Contato Direto
                </h4>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="text-primary h-5 w-5" />
                    <span className="text-foreground text-sm">
                      {COMPANY.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="text-primary h-5 w-5" />
                    <span className="text-foreground text-sm">
                      {COMPANY.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="text-primary h-5 w-5" />
                    <span className="text-muted-foreground text-sm">
                      {COMPANY.address.street}, {COMPANY.address.number} —{' '}
                      {COMPANY.address.neighborhood}, {COMPANY.address.city}
                      /SP
                      {COMPANY.address.complement &&
                        `, ${COMPANY.address.complement}`}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Service Cards */}
      <Section className="bg-surface-alt">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-foreground text-3xl font-bold sm:text-4xl">
              Como podemos ajudar?
            </h2>
            <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
              Escolha a opção que melhor atende sua necessidade.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerReveal(0.1)}
            className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {SUPPORT_CARDS.map((card) => (
              <motion.div
                key={card.title}
                variants={staggerItem('up')}
                className="bg-card border-border hover:border-primary/30 group relative overflow-hidden rounded-2xl border p-8 transition-all duration-300"
              >
                <div className="bg-primary/5 animate-float-slow absolute -top-10 -right-10 h-32 w-32 rounded-full blur-2xl" />
                <div className="bg-primary/5 animate-float-medium absolute -bottom-10 -left-10 h-32 w-32 rounded-full blur-2xl" />

                <div className="relative">
                  <div className="bg-primary/10 text-primary mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl">
                    <card.icon className="h-6 w-6" />
                  </div>
                  <span className="bg-primary/10 text-primary mb-2 inline-block rounded-full px-3 py-1 text-xs font-semibold">
                    {card.response}
                  </span>
                  <h3 className="text-foreground mt-3 text-xl font-bold">
                    {card.title}
                  </h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    {card.description}
                  </p>
                  <a
                    href={getWhatsAppUrl(COMPANY.whatsapp, card.message)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary mt-6 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:gap-3"
                  >
                    <Phone className="h-4 w-4" />
                    Falar agora
                    <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </Section>

      {/* Before Opening a Ticket */}
      <Section>
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-foreground text-3xl font-bold sm:text-4xl">
              Antes de abrir um chamado
            </h2>
            <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
              Sua dúvida pode ser resolvida rapidamente. Confira nossas
              categorias de ajuda.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerReveal(0.1)}
            className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {[
              {
                icon: '🔐',
                title: 'Acesso e Login',
                description: 'Esqueceu sua senha? Problemas para entrar?',
                link: '/faq',
                linkLabel: 'Ver perguntas',
              },
              {
                icon: '⚙️',
                title: 'Configurações',
                description: 'Como ajustar preferências e dados da conta.',
                link: '/faq',
                linkLabel: 'Ver perguntas',
              },
              {
                icon: '💳',
                title: 'Serviços e Contratos',
                description: 'Informações sobre planos e faturamento.',
                link: '/faq',
                linkLabel: 'Ver perguntas',
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                variants={staggerItem('up')}
                className="bg-card border-border hover:border-primary/30 group rounded-2xl border p-6 transition-all duration-300"
              >
                <span className="text-2xl">{item.icon}</span>
                <h4 className="text-foreground mt-3 text-lg font-bold">
                  {item.title}
                </h4>
                <p className="text-muted-foreground mt-2 text-sm">
                  {item.description}
                </p>
                <a
                  href={item.link}
                  className="text-primary mt-4 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:gap-3"
                >
                  {item.linkLabel}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </Section>

      {/* Footer CTA */}
      <Section className="bg-surface-alt">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-card border-border rounded-2xl p-8 sm:p-12"
          >
            <h3 className="text-foreground text-2xl font-bold sm:text-3xl">
              Ainda precisa de ajuda?
            </h3>
            <p className="text-muted-foreground mt-4 max-w-xl text-lg">
              Nossa equipe está pronta para atender você pelos canais abaixo.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <a
                href={getWhatsAppUrl(
                  COMPANY.whatsapp,
                  WHATSAPP_MESSAGES.whatsappButton,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-3 rounded-xl p-4 transition-colors"
              >
                <Phone className="h-6 w-6" />
                <div>
                  <p className="text-foreground text-sm font-semibold">
                    WhatsApp
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {COMPANY.phone}
                  </p>
                </div>
              </a>
              <a
                href={`tel:${COMPANY.phone.replace(/\D/g, '')}`}
                className="bg-muted text-foreground hover:bg-muted/80 flex items-center gap-3 rounded-xl p-4 transition-colors"
              >
                <Phone className="h-6 w-6" />
                <div>
                  <p className="text-foreground text-sm font-semibold">
                    Telefone
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {COMPANY.phone}
                  </p>
                </div>
              </a>
              <a
                href={`mailto:${COMPANY.email}`}
                className="bg-muted text-foreground hover:bg-muted/80 flex items-center gap-3 rounded-xl p-4 transition-colors"
              >
                <Mail className="h-6 w-6" />
                <div>
                  <p className="text-foreground text-sm font-semibold">
                    E-mail
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {COMPANY.email}
                  </p>
                </div>
              </a>
              <div className="bg-muted flex items-center gap-3 rounded-xl p-4">
                <MapPin className="text-primary h-6 w-6" />
                <div>
                  <p className="text-foreground text-sm font-semibold">
                    Endereço
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {COMPANY.address.city}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </Container>
      </Section>
    </div>
  );
}
