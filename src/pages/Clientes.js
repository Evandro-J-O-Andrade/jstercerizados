import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import { sanitizeText, sanitizeName, sanitizeEmail, sanitizePhone, sanitizeTextarea, } from '@/utils/sanitize';
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
export default function Clientes() {
    const [submitted, setSubmitted] = useState(false);
    const { register, handleSubmit, reset, formState: { errors, isSubmitting }, } = useForm({
        resolver: zodResolver(budgetSchema),
        defaultValues: {
            posts: 1,
        },
    });
    const onSubmit = async (data) => {
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
        return (_jsx("div", { className: "flex min-h-[70vh] items-center justify-center", children: _jsxs(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.5 }, className: "max-w-md text-center", children: [_jsx("div", { className: "bg-success/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full", children: _jsx(CheckCircle2, { className: "text-success h-10 w-10" }) }), _jsx("h2", { className: "text-foreground mb-4 text-2xl font-bold", children: "Solicita\u00E7\u00E3o Enviada!" }), _jsx("p", { className: "text-muted-foreground mb-8", children: "Nossa equipe entrar\u00E1 em contato em at\u00E9 24 horas. Enquanto isso, voc\u00EA pode nos chamar no WhatsApp para uma resposta mais r\u00E1pida." }), _jsxs("div", { className: "flex flex-col justify-center gap-4 sm:flex-row", children: [_jsx("a", { href: getWhatsAppUrl(COMPANY.whatsapp, WHATSAPP_MESSAGES.contactForm), target: "_blank", rel: "noopener noreferrer", children: _jsxs(Button, { variant: "secondary", size: "lg", children: [_jsx(Send, { className: "mr-2 h-5 w-5" }), "Continuar no WhatsApp"] }) }), _jsx(Link, { to: "/", children: _jsx(Button, { variant: "outline", size: "lg", children: "Voltar ao In\u00EDcio" }) })] })] }) }));
    }
    return (_jsxs("div", { children: [_jsx(SEO, { title: `Clientes — ${COMPANY.name}`, description: "Solicite or\u00E7amento de servi\u00E7os de RH, recrutamento, terceiriza\u00E7\u00E3o e facilities. Atendimento personalizado para sua empresa.", keywords: [
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
                ], type: "Organization" }), _jsx(Section, { children: _jsx(Container, { children: _jsxs("div", { className: "grid grid-cols-1 items-start gap-12 lg:grid-cols-5", children: [_jsx("div", { className: "lg:col-span-2", children: _jsxs(motion.div, { initial: { opacity: 0, x: -20 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true }, children: [_jsxs("div", { className: "bg-primary/10 text-primary mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium", children: [_jsx(Shield, { className: "h-4 w-4" }), "Solicitar Profissionais"] }), _jsx("h1", { className: "text-foreground text-3xl font-bold sm:text-4xl", children: "Solicite Profissionais para sua Empresa" }), _jsx("p", { className: "text-muted-foreground mt-4", children: "Preencha o formul\u00E1rio com seus dados e necessidades. Nossa equipe analisar\u00E1 sua solicita\u00E7\u00E3o e elaborar\u00E1 uma proposta personalizada." }), _jsx("div", { className: "mt-8 space-y-4", children: [
                                                'Resposta em até 24 horas',
                                                'Proposta personalizada',
                                                'Sem compromisso',
                                                'Atendimento especializado',
                                            ].map((item) => (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(CheckCircle2, { className: "text-primary h-5 w-5 flex-shrink-0" }), _jsx("span", { className: "text-muted-foreground", children: item })] }, item))) })] }) }), _jsx("div", { className: "lg:col-span-3", children: _jsxs(motion.form, { initial: { opacity: 0, x: 20 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true }, onSubmit: handleSubmit(onSubmit), className: "bg-card shadow-premium rounded-2xl p-8", children: [_jsxs("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-2", children: [_jsx("div", { className: "md:col-span-2", children: _jsx(Input, { label: "Seu Nome *", placeholder: "Jo\u00E3o Silva", error: errors.name?.message, ...register('name') }) }), _jsx("div", { className: "md:col-span-2", children: _jsx(Input, { label: "Empresa *", placeholder: "ABC Seguran\u00E7a Ltda", error: errors.company?.message, ...register('company') }) }), _jsx("div", { children: _jsx(Input, { label: "CNPJ *", placeholder: "00.000.000/0001-00", error: errors.cnpj?.message, ...register('cnpj') }) }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(Input, { label: "Cidade *", placeholder: "S\u00E3o Paulo", error: errors.city?.message, ...register('city') }), _jsx(Input, { label: "Estado *", placeholder: "SP", error: errors.state?.message, ...register('state') })] }), _jsx("div", { children: _jsx(Input, { label: "E-mail *", type: "email", placeholder: "contato@empresa.com.br", error: errors.email?.message, ...register('email') }) }), _jsx("div", { children: _jsx(Input, { label: "Telefone *", placeholder: "(11) 99999-9999", error: errors.phone?.message, ...register('phone') }) }), _jsx("div", { children: _jsx(Input, { label: "WhatsApp *", placeholder: "(11) 99999-9999", error: errors.whatsapp?.message, ...register('whatsapp') }) }), _jsx("div", { children: _jsxs(Select, { label: "Servi\u00E7o Desejado *", error: errors.service?.message, ...register('service'), children: [_jsx("option", { value: "", children: "Selecione um servi\u00E7o" }), _jsx("option", { value: "seguranca", children: "Seguran\u00E7a Patrimonial" }), _jsx("option", { value: "controle-acesso", children: "Controle de Acesso" }), _jsx("option", { value: "portaria", children: "Portaria" }), _jsx("option", { value: "recepcao", children: "Recep\u00E7\u00E3o" }), _jsx("option", { value: "limpeza", children: "Limpeza" }), _jsx("option", { value: "zeladoria", children: "Zeladoria" }), _jsx("option", { value: "facilities", children: "Facilities" }), _jsx("option", { value: "monitoramento", children: "Monitoramento" }), _jsx("option", { value: "recrutamento", children: "Recrutamento e Sele\u00E7\u00E3o" }), _jsx("option", { value: "terceirizacao", children: "Terceiriza\u00E7\u00E3o" }), _jsx("option", { value: "hunting", children: "Hunting de Executivos" })] }) }), _jsx("div", { children: _jsx(Input, { label: "Quantidade de Vagas *", type: "number", min: 1, placeholder: "1", error: errors.posts?.message, ...register('posts') }) }), _jsx("div", { className: "md:col-span-2", children: _jsx(Textarea, { label: "Mensagem *", placeholder: "Descreva suas necessidades...", rows: 4, error: errors.message?.message, ...register('message') }) })] }), _jsx("div", { className: "mt-8", children: _jsx(Button, { type: "submit", variant: "secondary", size: "lg", className: "w-full", loading: isSubmitting, disabled: isSubmitting, leftIcon: _jsx(Phone, { className: "h-5 w-5" }), children: "Enviar e Abrir WhatsApp" }) })] }) })] }) }) })] }));
}
