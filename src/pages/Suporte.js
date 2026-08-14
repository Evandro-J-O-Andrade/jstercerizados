import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Clock, MessageSquare, Wrench, Handshake, Truck, Users, BookOpen, Send, ChevronDown, CheckCircle2, Shield, Zap, Globe, Mail, MapPin, ArrowRight, Sparkles, } from 'lucide-react';
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
import { sanitizeText, sanitizeName, sanitizeEmail, sanitizePhone, sanitizeTextarea, } from '@/utils/sanitize';
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
        observacoes: '',
    });
    const [submitted, setSubmitted] = useState(false);
    const [protocol, setProtocol] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting)
            return;
        setIsSubmitting(true);
        const now = new Date();
        const proto = `SUP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
        setProtocol(proto);
        const payload = {
            protocol: proto,
            nome: sanitizeName(formData.nome),
            empresa: sanitizeText(formData.empresa),
            telefone: sanitizePhone(formData.telefone),
            email: sanitizeEmail(formData.email),
            cliente: formData.cliente,
            contrato: sanitizeText(formData.contrato),
            categoria: formData.categoria,
            prioridade: formData.prioridade,
            assunto: sanitizeText(formData.assunto),
            descricao: sanitizeTextarea(formData.descricao),
            observacoes: sanitizeTextarea(formData.observacoes),
            submittedAt: now.toISOString(),
        };
        try {
            await sendToN8n(payload);
            setSubmitted(true);
        }
        catch {
            setError('Erro ao enviar solicitação. Tente novamente.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsxs("div", { children: [_jsx(SEO, { title: `Suporte — ${COMPANY.name}`, description: `Central de atendimento da ${COMPANY.name}: WhatsApp, chat online, FAQ e suporte ao cliente.`, keywords: [
                    'suporte',
                    'atendimento',
                    'FAQ',
                    'WhatsApp',
                    'chat',
                    COMPANY.name,
                    'RH',
                    'terceirização',
                    'facilities',
                ], type: "WebSite" }), _jsx(Section, { className: "bg-surface-alt", children: _jsxs(Container, { children: [_jsxs(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: '-100px' }, variants: staggerReveal(0.15), className: "text-center", children: [_jsx(motion.h2, { variants: revealUp, className: "text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl", children: "Central de Atendimento" }), _jsx(motion.p, { variants: revealUp, className: "text-muted-foreground mx-auto mt-4 max-w-2xl text-lg", children: "Estamos prontos para ajudar voc\u00EA. Preencha o formul\u00E1rio e nossa equipe entrar\u00E1 em contato rapidamente." })] }), _jsx(motion.div, { variants: revealUp, className: "mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4", children: [
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
                            ].map((stat) => (_jsxs(motion.div, { variants: staggerItem('up'), className: "text-center", children: [_jsx(stat.icon, { className: "text-primary mx-auto h-8 w-8" }), _jsx("p", { className: "text-foreground mt-2 text-2xl font-bold", children: stat.value }), _jsx("p", { className: "text-muted-foreground mt-1 text-sm", children: stat.label })] }, stat.label))) })] }) }), _jsx(Section, { children: _jsx(Container, { children: _jsxs("div", { className: "grid grid-cols-1 gap-12 lg:grid-cols-5", children: [_jsx("div", { className: "lg:col-span-3", children: _jsx(motion.div, { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 }, children: _jsxs("div", { className: "bg-card/80 border-border/50 shadow-elevated relative overflow-hidden rounded-2xl border backdrop-blur-sm", children: [_jsx("div", { className: "bg-primary/5 absolute -top-20 -right-20 h-60 w-60 rounded-full blur-3xl" }), _jsx("div", { className: "bg-primary/5 absolute -bottom-20 -left-20 h-60 w-60 rounded-full blur-3xl" }), _jsxs("div", { className: "relative p-8 sm:p-10", children: [_jsx("h3", { className: "text-foreground text-2xl font-bold sm:text-3xl", children: "Solicitar Atendimento" }), _jsx("p", { className: "text-muted-foreground mt-2 text-sm", children: "Nosso sistema de IA organiza sua solicita\u00E7\u00E3o e a direciona para a equipe correta." }), submitted ? (_jsxs(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, className: "mt-8 text-center", children: [_jsx(CheckCircle2, { className: "text-primary mx-auto h-16 w-16" }), _jsx("h4", { className: "text-foreground mt-4 text-xl font-bold", children: "Solicita\u00E7\u00E3o recebida!" }), _jsxs("p", { className: "text-muted-foreground mt-2 text-sm", children: ["Protocolo:", ' ', _jsx("span", { className: "text-foreground font-mono font-semibold", children: protocol })] }), _jsx("p", { className: "text-muted-foreground mt-2 text-sm", children: "Nossa equipe analisar\u00E1 sua solicita\u00E7\u00E3o e entrar\u00E1 em contato em at\u00E9 24 horas \u00FAteis." }), _jsx("a", { href: getWhatsAppUrl(COMPANY.whatsapp, WHATSAPP_MESSAGES.contactForm), target: "_blank", rel: "noopener noreferrer", className: "mt-6 inline-flex", children: _jsxs(Button, { variant: "secondary", size: "lg", children: [_jsx(Phone, { className: "mr-2 h-5 w-5" }), "Abrir WhatsApp"] }) })] })) : (_jsxs("form", { onSubmit: handleSubmit, className: "mt-6 space-y-5", children: [error && (_jsx("div", { className: "bg-destructive/10 text-destructive rounded-xl p-4 text-sm", children: error })), _jsxs("div", { className: "grid grid-cols-1 gap-5 sm:grid-cols-2", children: [_jsxs("div", { children: [_jsxs("label", { className: "text-foreground mb-2 block text-sm font-medium", children: ["Nome ", _jsx("span", { className: "text-destructive", children: "*" })] }), _jsx(Input, { type: "text", name: "nome", value: formData.nome, onChange: handleChange, required: true, placeholder: "Seu nome completo" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-foreground mb-2 block text-sm font-medium", children: "Empresa" }), _jsx(Input, { type: "text", name: "empresa", value: formData.empresa, onChange: handleChange, placeholder: "Nome da empresa" })] })] }), _jsxs("div", { className: "grid grid-cols-1 gap-5 sm:grid-cols-2", children: [_jsxs("div", { children: [_jsxs("label", { className: "text-foreground mb-2 block text-sm font-medium", children: ["Telefone", ' ', _jsx("span", { className: "text-destructive", children: "*" })] }), _jsx(Input, { type: "tel", name: "telefone", value: formData.telefone, onChange: handleChange, required: true, placeholder: "(11) 91234-5678" })] }), _jsxs("div", { children: [_jsxs("label", { className: "text-foreground mb-2 block text-sm font-medium", children: ["E-mail ", _jsx("span", { className: "text-destructive", children: "*" })] }), _jsx(Input, { type: "email", name: "email", value: formData.email, onChange: handleChange, required: true, placeholder: "seu@email.com" })] })] }), _jsxs("div", { className: "grid grid-cols-1 gap-5 sm:grid-cols-2", children: [_jsxs("div", { children: [_jsx("label", { className: "text-foreground mb-2 block text-sm font-medium", children: "J\u00E1 \u00E9 cliente?" }), _jsxs(Select, { name: "cliente", value: formData.cliente, onChange: handleChange, children: [_jsx("option", { value: "", children: "Selecione" }), _jsx("option", { value: "sim", children: "Sim" }), _jsx("option", { value: "nao", children: "N\u00E3o" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-foreground mb-2 block text-sm font-medium", children: "N\u00BA do contrato (opcional)" }), _jsx(Input, { type: "text", name: "contrato", value: formData.contrato, onChange: handleChange, placeholder: "N\u00FAmero do contrato" })] })] }), _jsxs("div", { className: "grid grid-cols-1 gap-5 sm:grid-cols-2", children: [_jsxs("div", { children: [_jsxs("label", { className: "text-foreground mb-2 block text-sm font-medium", children: ["Categoria", ' ', _jsx("span", { className: "text-destructive", children: "*" })] }), _jsx(Select, { name: "categoria", value: formData.categoria, onChange: handleChange, required: true, children: CATEGORY_OPTIONS.map((opt) => (_jsx("option", { value: opt.value, children: opt.label }, opt.value))) })] }), _jsxs("div", { children: [_jsxs("label", { className: "text-foreground mb-2 block text-sm font-medium", children: ["Prioridade", ' ', _jsx("span", { className: "text-destructive", children: "*" })] }), _jsx(Select, { name: "prioridade", value: formData.prioridade, onChange: handleChange, required: true, children: PRIORITY_OPTIONS.map((opt) => (_jsx("option", { value: opt.value, children: opt.label }, opt.value))) })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "text-foreground mb-2 block text-sm font-medium", children: ["Assunto ", _jsx("span", { className: "text-destructive", children: "*" })] }), _jsx(Input, { type: "text", name: "assunto", value: formData.assunto, onChange: handleChange, required: true, placeholder: "Assunto da sua solicita\u00E7\u00E3o" })] }), _jsxs("div", { children: [_jsxs("label", { className: "text-foreground mb-2 block text-sm font-medium", children: ["Descri\u00E7\u00E3o", ' ', _jsx("span", { className: "text-destructive", children: "*" })] }), _jsx(Textarea, { name: "descricao", value: formData.descricao, onChange: handleChange, required: true, placeholder: "Descreva sua necessidade em detalhes...", rows: 4 })] }), _jsxs("div", { children: [_jsx("label", { className: "text-foreground mb-2 block text-sm font-medium", children: "Existe alguma necessidade espec\u00EDfica que n\u00E3o foi listada acima?" }), _jsx(Textarea, { name: "observacoes", value: formData.observacoes, onChange: handleChange, placeholder: "Conte um pouco sobre sua necessidade...", rows: 3 })] }), _jsxs("div", { className: "flex flex-col gap-3 sm:flex-row", children: [_jsxs(Button, { type: "submit", variant: "primary", size: "lg", className: "flex-1", loading: isSubmitting, disabled: isSubmitting, children: [_jsx(Send, { className: "mr-2 h-5 w-5" }), isSubmitting
                                                                                ? 'Enviando...'
                                                                                : 'Enviar Solicitação'] }), _jsx("a", { href: getWhatsAppUrl(COMPANY.whatsapp, WHATSAPP_MESSAGES.contactForm), target: "_blank", rel: "noopener noreferrer", className: "flex-1", children: _jsxs(Button, { variant: "secondary", size: "lg", className: "w-full", children: [_jsx(Phone, { className: "mr-2 h-5 w-5" }), "Falar no WhatsApp"] }) })] })] }))] })] }) }) }), _jsxs("div", { className: "space-y-6 lg:col-span-2", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6, delay: 0.1 }, children: [_jsx("h3", { className: "text-foreground text-xl font-bold", children: "Como funciona nosso atendimento?" }), _jsx("div", { className: "mt-4 space-y-4", children: STEPS.map((step, index) => (_jsxs(motion.div, { initial: { opacity: 0, x: 20 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true }, transition: { duration: 0.4, delay: index * 0.1 }, className: "flex gap-4", children: [_jsxs("div", { className: "flex flex-col items-center", children: [_jsx("div", { className: "bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full", children: _jsx(step.icon, { className: "h-5 w-5" }) }), index < STEPS.length - 1 && (_jsx("div", { className: "bg-border mt-2 h-full w-0.5" }))] }), _jsxs("div", { className: "pb-4", children: [_jsxs("p", { className: "text-foreground text-sm font-semibold", children: [step.number, ". ", step.title] }), _jsx("p", { className: "text-muted-foreground mt-1 text-sm", children: step.description })] })] }, step.title))) })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6, delay: 0.2 }, className: "bg-card border-border rounded-2xl border p-6", children: [_jsx("h4", { className: "text-foreground text-lg font-bold", children: "Como deseja continuar?" }), _jsx("p", { className: "text-muted-foreground mt-2 text-sm", children: "Escolha entre atendimento r\u00E1pido com IA ou fale diretamente com nossa equipe humana." }), _jsxs("div", { className: "mt-4 space-y-3", children: [_jsxs("button", { type: "button", onClick: () => alert('Em breve: Assistente J&S disponível aqui.'), className: "bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-3 rounded-xl p-4 transition-colors", children: [_jsx(Sparkles, { className: "h-5 w-5" }), _jsxs("div", { className: "text-left", children: [_jsx("span", { className: "text-sm font-semibold", children: "Assistente J&S" }), _jsx("p", { className: "text-muted-foreground text-xs", children: "IA para d\u00FAvidas r\u00E1pidas e suporte inicial" })] }), _jsx(ArrowRight, { className: "ml-auto h-4 w-4" })] }), _jsxs("a", { href: getWhatsAppUrl(COMPANY.whatsapp, WHATSAPP_MESSAGES.contactForm), target: "_blank", rel: "noopener noreferrer", className: "bg-muted text-foreground hover:bg-muted/80 flex items-center gap-3 rounded-xl p-4 transition-colors", children: [_jsx(Phone, { className: "h-5 w-5" }), _jsxs("div", { className: "text-left", children: [_jsx("span", { className: "text-sm font-semibold", children: "Falar com atendente" }), _jsx("p", { className: "text-muted-foreground text-xs", children: "Atendimento humano em tempo real" })] }), _jsx(ArrowRight, { className: "ml-auto h-4 w-4" })] }), _jsxs("a", { href: `mailto:${COMPANY.email}`, className: "bg-muted text-foreground hover:bg-muted/80 flex items-center gap-3 rounded-xl p-4 transition-colors", children: [_jsx(Mail, { className: "h-5 w-5" }), _jsxs("div", { className: "text-left", children: [_jsx("span", { className: "text-sm font-semibold", children: "E-mail" }), _jsx("p", { className: "text-muted-foreground text-xs", children: "Atendimento por e-mail" })] }), _jsx(ArrowRight, { className: "ml-auto h-4 w-4" })] })] })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6, delay: 0.3 }, className: "bg-card border-border rounded-2xl border p-6", children: [_jsx("h4", { className: "text-foreground text-lg font-bold", children: "Contato Direto" }), _jsxs("div", { className: "mt-4 space-y-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Phone, { className: "text-primary h-5 w-5" }), _jsx("span", { className: "text-foreground text-sm", children: COMPANY.phone })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Mail, { className: "text-primary h-5 w-5" }), _jsx("span", { className: "text-foreground text-sm", children: COMPANY.email })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(MapPin, { className: "text-primary h-5 w-5" }), _jsxs("span", { className: "text-muted-foreground text-sm", children: [COMPANY.address.street, ", ", COMPANY.address.number, " \u2014", ' ', COMPANY.address.neighborhood, ", ", COMPANY.address.city, "/SP", COMPANY.address.complement &&
                                                                        `, ${COMPANY.address.complement}`] })] })] })] })] })] }) }) }), _jsx(Section, { className: "bg-surface-alt", children: _jsxs(Container, { children: [_jsxs(motion.div, { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 }, className: "text-center", children: [_jsx("h2", { className: "text-foreground text-3xl font-bold sm:text-4xl", children: "Como podemos ajudar?" }), _jsx("p", { className: "text-muted-foreground mx-auto mt-4 max-w-2xl text-lg", children: "Escolha a op\u00E7\u00E3o que melhor atende sua necessidade." })] }), _jsx(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true }, variants: staggerReveal(0.1), className: "mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3", children: SUPPORT_CARDS.map((card) => (_jsxs(motion.div, { variants: staggerItem('up'), className: "bg-card border-border hover:border-primary/30 group relative overflow-hidden rounded-2xl border p-8 transition-all duration-300", children: [_jsx("div", { className: "bg-primary/5 animate-float-slow absolute -top-10 -right-10 h-32 w-32 rounded-full blur-2xl" }), _jsx("div", { className: "bg-primary/5 animate-float-medium absolute -bottom-10 -left-10 h-32 w-32 rounded-full blur-2xl" }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "bg-primary/10 text-primary mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl", children: _jsx(card.icon, { className: "h-6 w-6" }) }), _jsx("span", { className: "bg-primary/10 text-primary mb-2 inline-block rounded-full px-3 py-1 text-xs font-semibold", children: card.response }), _jsx("h3", { className: "text-foreground mt-3 text-xl font-bold", children: card.title }), _jsx("p", { className: "text-muted-foreground mt-2 text-sm leading-relaxed", children: card.description }), _jsxs("a", { href: getWhatsAppUrl(COMPANY.whatsapp, card.message), target: "_blank", rel: "noopener noreferrer", className: "text-primary mt-6 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:gap-3", children: [_jsx(Phone, { className: "h-4 w-4" }), "Falar agora", _jsx(ChevronDown, { className: "h-4 w-4 transition-transform group-hover:translate-x-1" })] })] })] }, card.title))) })] }) }), _jsx(Section, { children: _jsxs(Container, { children: [_jsxs(motion.div, { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 }, className: "text-center", children: [_jsx("h2", { className: "text-foreground text-3xl font-bold sm:text-4xl", children: "Antes de abrir um chamado" }), _jsx("p", { className: "text-muted-foreground mx-auto mt-4 max-w-2xl text-lg", children: "Sua d\u00FAvida pode ser resolvida rapidamente. Confira nossas categorias de ajuda." })] }), _jsx(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true }, variants: staggerReveal(0.1), className: "mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3", children: [
                                {
                                    icon: '🔐',
                                    title: 'Acesso e Entrada',
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
                            ].map((item) => (_jsxs(motion.div, { variants: staggerItem('up'), className: "bg-card border-border hover:border-primary/30 group rounded-2xl border p-6 transition-all duration-300", children: [_jsx("span", { className: "text-2xl", children: item.icon }), _jsx("h4", { className: "text-foreground mt-3 text-lg font-bold", children: item.title }), _jsx("p", { className: "text-muted-foreground mt-2 text-sm", children: item.description }), _jsxs("a", { href: item.link, className: "text-primary mt-4 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:gap-3", children: [item.linkLabel, _jsx(ArrowRight, { className: "h-4 w-4 transition-transform group-hover:translate-x-1" })] })] }, item.title))) })] }) }), _jsx(Section, { className: "bg-surface-alt", children: _jsx(Container, { children: _jsxs(motion.div, { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 }, className: "bg-card border-border rounded-2xl p-8 sm:p-12", children: [_jsx("h3", { className: "text-foreground text-2xl font-bold sm:text-3xl", children: "Ainda precisa de ajuda?" }), _jsx("p", { className: "text-muted-foreground mt-4 max-w-xl text-lg", children: "Nossa equipe est\u00E1 pronta para atender voc\u00EA pelos canais abaixo." }), _jsxs("div", { className: "mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [_jsxs("a", { href: getWhatsAppUrl(COMPANY.whatsapp, WHATSAPP_MESSAGES.whatsappButton), target: "_blank", rel: "noopener noreferrer", className: "bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-3 rounded-xl p-4 transition-colors", children: [_jsx(Phone, { className: "h-6 w-6" }), _jsxs("div", { children: [_jsx("p", { className: "text-foreground text-sm font-semibold", children: "WhatsApp" }), _jsx("p", { className: "text-muted-foreground text-xs", children: COMPANY.phone })] })] }), _jsxs("a", { href: `tel:${COMPANY.phone.replace(/\D/g, '')}`, className: "bg-muted text-foreground hover:bg-muted/80 flex items-center gap-3 rounded-xl p-4 transition-colors", children: [_jsx(Phone, { className: "h-6 w-6" }), _jsxs("div", { children: [_jsx("p", { className: "text-foreground text-sm font-semibold", children: "Telefone" }), _jsx("p", { className: "text-muted-foreground text-xs", children: COMPANY.phone })] })] }), _jsxs("a", { href: `mailto:${COMPANY.email}`, className: "bg-muted text-foreground hover:bg-muted/80 flex items-center gap-3 rounded-xl p-4 transition-colors", children: [_jsx(Mail, { className: "h-6 w-6" }), _jsxs("div", { children: [_jsx("p", { className: "text-foreground text-sm font-semibold", children: "E-mail" }), _jsx("p", { className: "text-muted-foreground text-xs", children: COMPANY.email })] })] }), _jsxs("div", { className: "bg-muted flex items-center gap-3 rounded-xl p-4", children: [_jsx(MapPin, { className: "text-primary h-6 w-6" }), _jsxs("div", { children: [_jsx("p", { className: "text-foreground text-sm font-semibold", children: "Endere\u00E7o" }), _jsx("p", { className: "text-muted-foreground text-xs", children: COMPANY.address.city })] })] })] })] }) }) })] }));
}
