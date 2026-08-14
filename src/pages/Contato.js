import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Send, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { SafeImage } from '@/components/ui/SafeImage';
import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { mockSubmitContact } from '@/services/mock/contatos';
import { COMPANY, CONTACTS, WHATSAPP_MESSAGES, getWhatsAppUrl, IMAGES, } from '@/config';
import { sanitizeText, sanitizeName, sanitizeEmail, sanitizePhone, sanitizeTextarea, } from '@/utils/sanitize';
const contactSchema = z.object({
    name: z.string().min(2, 'Nome é obrigatório'),
    company: z.string().min(2, 'Empresa é obrigatória'),
    email: z.string().email('E-mail inválido'),
    phone: z.string().min(10, 'Telefone deve ter pelo menos 10 caracteres'),
    subject: z.string().min(2, 'Assunto é obrigatório'),
    message: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres'),
});
export default function Contato() {
    const [submitted, setSubmitted] = useState(false);
    const { register, handleSubmit, reset, formState: { errors, isSubmitting }, } = useForm({
        resolver: zodResolver(contactSchema),
    });
    const onSubmit = async (data) => {
        mockSubmitContact({
            name: sanitizeName(data.name),
            company: sanitizeText(data.company),
            email: sanitizeEmail(data.email),
            phone: sanitizePhone(data.phone),
            subject: sanitizeText(data.subject),
            message: sanitizeTextarea(data.message),
            city: COMPANY.address.city,
            state: COMPANY.address.state,
        });
        setSubmitted(true);
        reset();
    };
    if (submitted) {
        return (_jsx("div", { className: "flex min-h-[70vh] items-center justify-center", children: _jsxs(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.5 }, className: "max-w-md text-center", children: [_jsx("div", { className: "bg-success/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full", children: _jsx(Send, { className: "text-success h-10 w-10" }) }), _jsx("h2", { className: "text-foreground mb-4 text-2xl font-bold", children: "Mensagem Enviada!" }), _jsx("p", { className: "text-muted-foreground mb-8", children: "Entraremos em contato em breve. Enquanto isso, voc\u00EA pode nos chamar diretamente pelo WhatsApp." }), _jsxs("div", { className: "flex flex-col justify-center gap-4 sm:flex-row", children: [_jsx("a", { href: getWhatsAppUrl(COMPANY.whatsapp, WHATSAPP_MESSAGES.contactForm), target: "_blank", rel: "noopener noreferrer", children: _jsxs(Button, { variant: "secondary", size: "lg", children: [_jsx(Phone, { className: "mr-2 h-5 w-5" }), "WhatsApp"] }) }), _jsx(Link, { to: "/", children: _jsx(Button, { variant: "outline", size: "lg", children: "Voltar ao In\u00EDcio" }) })] })] }) }));
    }
    return (_jsxs("div", { children: [_jsx(SEO, { title: `Contato — ${COMPANY.name}`, description: `Entre em contato com a ${COMPANY.name}. Telefone, WhatsApp, e-mail e endereço.`, keywords: [
                    'contato',
                    'telefone',
                    'whatsapp',
                    'e-mail',
                    'endereço',
                    COMPANY.name,
                    'RH',
                    'terceirização',
                    'facilities',
                ], type: "WebSite" }), _jsx(Section, { children: _jsxs(Container, { children: [_jsxs("div", { className: "mb-12 text-center", children: [_jsx("h1", { className: "text-foreground text-3xl font-bold sm:text-4xl", children: "Contato" }), _jsx("p", { className: "text-muted-foreground mx-auto mt-4 max-w-2xl text-lg", children: "Entre em contato conosco. Estamos prontos para atend\u00EA-lo." })] }), _jsxs("div", { className: "grid grid-cols-1 items-start gap-12 lg:grid-cols-5", children: [_jsxs("div", { className: "space-y-6 lg:col-span-2", children: [_jsxs(motion.div, { initial: { opacity: 0, x: -20 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true }, className: "relative overflow-hidden rounded-2xl", children: [_jsx(SafeImage, { src: IMAGES.hero.contato.src, fallbackSrc: IMAGES.hero.contato.fallback, alt: `Contato ${COMPANY.tradingName}`, className: "h-full w-full object-cover opacity-70" }), _jsx("div", { className: "from-background/80 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" })] }), _jsxs(motion.div, { initial: { opacity: 0, x: -20 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true }, className: "bg-card border-border shadow-premium rounded-2xl border p-6", children: [_jsx("h3", { className: "text-foreground mb-4 text-lg font-semibold", children: "Informa\u00E7\u00F5es de Contato" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx(MapPin, { className: "text-primary mt-1 h-5 w-5 flex-shrink-0" }), _jsxs("div", { children: [_jsx("p", { className: "text-foreground text-sm font-medium", children: "Endere\u00E7o" }), _jsxs("p", { className: "text-muted-foreground text-sm", children: [COMPANY.address.city, ", ", COMPANY.address.state, " \u2014 Brasil"] })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Phone, { className: "text-primary h-5 w-5 flex-shrink-0" }), _jsx("a", { href: `tel:${COMPANY.phone}`, className: "text-muted-foreground hover:text-primary text-sm transition-colors", children: COMPANY.phone })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Mail, { className: "text-primary h-5 w-5 flex-shrink-0" }), _jsx("a", { href: `mailto:${COMPANY.email}`, className: "text-muted-foreground hover:text-primary text-sm transition-colors", children: COMPANY.email })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Clock, { className: "text-primary h-5 w-5 flex-shrink-0" }), _jsx("p", { className: "text-muted-foreground text-sm", children: CONTACTS.businessHours.weekday })] })] })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay: 0.1 }, className: "bg-muted shadow-premium rounded-2xl p-6", children: [_jsx("h3", { className: "text-foreground mb-4 text-lg font-semibold", children: "Hor\u00E1rio de Atendimento" }), _jsxs("div", { className: "text-muted-foreground space-y-2 text-sm", children: [_jsx("p", { children: "Segunda a Sexta: 08h \u00E0s 18h" }), _jsx("p", { children: "S\u00E1bado: 08h \u00E0s 12h" }), _jsx("p", { children: "Domingo: Fechado" })] })] })] }), _jsx("div", { className: "lg:col-span-3", children: _jsxs(motion.form, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, onSubmit: handleSubmit(onSubmit), className: "bg-card border-border shadow-premium rounded-2xl border p-8", children: [_jsxs("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-2", children: [_jsx("div", { className: "md:col-span-2", children: _jsx(Input, { label: "Seu Nome *", placeholder: "Jo\u00E3o Silva", error: errors.name?.message, ...register('name') }) }), _jsx("div", { children: _jsx(Input, { label: "Empresa *", placeholder: "ABC Empresas Ltda", error: errors.company?.message, ...register('company') }) }), _jsx("div", { children: _jsx(Input, { label: "E-mail *", type: "email", placeholder: "seu@email.com", error: errors.email?.message, ...register('email') }) }), _jsx("div", { children: _jsx(Input, { label: "Telefone *", placeholder: "(11) 99999-9999", error: errors.phone?.message, ...register('phone') }) }), _jsx("div", { className: "md:col-span-2", children: _jsx(Input, { label: "Assunto *", placeholder: "Assunto da mensagem", error: errors.subject?.message, ...register('subject') }) }), _jsx("div", { className: "md:col-span-2", children: _jsx(Textarea, { label: "Mensagem *", placeholder: "Como podemos ajud\u00E1-lo?", rows: 5, error: errors.message?.message, ...register('message') }) })] }), _jsx("div", { className: "mt-8", children: _jsx(Button, { type: "submit", variant: "secondary", size: "lg", className: "w-full", loading: isSubmitting, disabled: isSubmitting, leftIcon: _jsx(Phone, { className: "h-5 w-5" }), children: "Enviar e Abrir WhatsApp" }) })] }) })] })] }) })] }));
}
