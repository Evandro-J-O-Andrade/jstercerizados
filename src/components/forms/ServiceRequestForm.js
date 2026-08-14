import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { COMPANY, getWhatsAppUrl } from '@/config';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { sanitizeText, sanitizeName, sanitizeEmail, sanitizePhone, sanitizeTextarea, } from '@/utils/sanitize';
const serviceOptions = [
    { value: '', label: 'Selecione um serviço' },
    { value: 'assessoria-rh', label: 'Assessoria em RH' },
    { value: 'recrutamento-selecao', label: 'Recrutamento e Seleção' },
    { value: 'mao-de-obra-temporaria', label: 'Mão de Obra Temporária' },
    { value: 'mao-de-obra-efetiva', label: 'Mão de Obra Efetiva' },
    { value: 'facilities', label: 'Facilities' },
    { value: 'limpeza-conservacao', label: 'Limpeza e Conservação' },
    { value: 'limpeza-de-fachada', label: 'Limpeza de Fachada' },
    { value: 'limpeza-de-vidros', label: 'Limpeza de Vidros' },
    { value: 'limpeza-pre-mudanca', label: 'Limpeza Pré-Mudança' },
    { value: 'limpeza-pos-mudanca', label: 'Limpeza Pós-Mudança' },
    { value: 'limpeza-pos-obra', label: 'Limpeza Pós-Obra' },
    { value: 'jardinagem', label: 'Jardinagem' },
    { value: 'terceirizacao', label: 'Terceirização' },
    { value: 'outro', label: 'Outro' },
];
const environmentOptions = [
    { value: '', label: 'Selecione o tipo de ambiente' },
    { value: 'comercial', label: 'Comercial' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'residencial', label: 'Residencial' },
    { value: 'condominio', label: 'Condomínio' },
    { value: 'outro', label: 'Outro' },
];
const serviceRequestSchema = z.object({
    name: z
        .string()
        .min(2, 'Informe seu nome completo')
        .max(120, 'Nome muito longo'),
    company: z.string().max(120, 'Nome da empresa muito longo').optional(),
    email: z.string().min(1, 'Informe seu e-mail').email('E-mail inválido'),
    phone: z
        .string()
        .min(10, 'Informe um telefone válido')
        .max(20, 'Telefone inválido'),
    city: z.string().min(2, 'Informe sua cidade').max(80, 'Cidade muito longa'),
    service: z.string().min(1, 'Selecione um serviço'),
    environment: z.string().optional(),
    message: z.string().max(2000, 'Mensagem muito longa').optional(),
    bestTime: z.string().max(120, 'Horário muito longo').optional(),
});
export function ServiceRequestForm({ serviceSlug, serviceName, }) {
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset, } = useForm({
        resolver: zodResolver(serviceRequestSchema),
        defaultValues: {
            name: '',
            company: '',
            email: '',
            phone: '',
            city: '',
            service: serviceSlug ?? '',
            environment: '',
            message: '',
            bestTime: '',
        },
    });
    const [success, setSuccess] = useState(false);
    useEffect(() => {
        if (serviceSlug) {
            reset({ service: serviceSlug });
        }
    }, [serviceSlug, reset]);
    const onSubmit = async (data) => {
        const message = encodeURIComponent(`*Nova solicitação de serviço*\n\n` +
            `*Serviço:* ${serviceName || sanitizeText(data.service) || 'Não informado'}\n` +
            `*Nome:* ${sanitizeName(data.name)}\n` +
            `*Empresa:* ${sanitizeText(data.company || '') || '-'}\n` +
            `*E-mail:* ${sanitizeEmail(data.email)}\n` +
            `*Telefone:* ${sanitizePhone(data.phone)}\n` +
            `*Cidade:* ${sanitizeText(data.city)}\n` +
            `*Ambiente:* ${sanitizeText(data.environment || '') || '-'}\n` +
            `*Melhor horário:* ${sanitizeText(data.bestTime || '') || '-'}\n` +
            `*Mensagem:* ${sanitizeTextarea(data.message || '') || '-'}`);
        window.open(getWhatsAppUrl(COMPANY.whatsapp, message), '_blank');
        setSuccess(true);
        reset();
    };
    if (success) {
        return (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "bg-card border-border rounded-2xl border p-8 text-center", children: [_jsx("div", { className: "bg-primary/10 text-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full", children: _jsx(CheckCircle2, { className: "h-8 w-8" }) }), _jsx("h3", { className: "text-foreground mb-2 text-2xl font-bold", children: "Solicita\u00E7\u00E3o enviada!" }), _jsx("p", { className: "text-muted-foreground mb-6", children: "Recebemos sua solicita\u00E7\u00E3o. Nossa equipe entrar\u00E1 em contato em breve." }), _jsx(Button, { variant: "secondary", onClick: () => setSuccess(false), children: "Nova solicita\u00E7\u00E3o" })] }));
    }
    return (_jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "bg-card border-border rounded-2xl border p-6 sm:p-8", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "text-foreground mb-2 text-xl font-bold", children: "Solicitar or\u00E7amento" }), _jsx("p", { className: "text-muted-foreground text-sm", children: "Preencha o formul\u00E1rio e nossa equipe entrar\u00E1 em contato." })] }), _jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2", children: [_jsx(Input, { label: "Nome completo", error: errors.name?.message, ...register('name') }), _jsx(Input, { label: "Empresa", error: errors.company?.message, ...register('company') }), _jsx(Input, { label: "E-mail", type: "email", error: errors.email?.message, ...register('email') }), _jsx(Input, { label: "Telefone/WhatsApp", error: errors.phone?.message, ...register('phone') }), _jsx(Input, { label: "Cidade", error: errors.city?.message, ...register('city') }), _jsx(Select, { label: "Servi\u00E7o", error: errors.service?.message, ...register('service'), children: serviceOptions.map((opt) => (_jsx("option", { value: opt.value, children: opt.label }, opt.value))) }), _jsx(Select, { label: "Tipo de ambiente", error: errors.environment?.message, ...register('environment'), children: environmentOptions.map((opt) => (_jsx("option", { value: opt.value, children: opt.label }, opt.value))) }), _jsx(Input, { label: "Melhor hor\u00E1rio para contato", error: errors.bestTime?.message, ...register('bestTime'), placeholder: "Ex.: 14h \u00E0s 17h" })] }), _jsx("div", { className: "mt-4", children: _jsx(Textarea, { label: "Mensagem", error: errors.message?.message, ...register('message'), rows: 4, placeholder: "Descreva sua necessidade..." }) }), _jsxs("div", { className: "mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [_jsxs(Button, { type: "submit", variant: "primary", size: "lg", loading: isSubmitting, disabled: isSubmitting, children: [_jsx(Phone, { className: "mr-2 h-4 w-4" }), "Solicitar or\u00E7amento"] }), _jsxs("div", { className: "text-muted-foreground flex flex-col gap-1 text-xs", children: [_jsxs("span", { className: "flex items-center gap-2", children: [_jsx(Mail, { className: "h-3.5 w-3.5" }), COMPANY.email] }), _jsxs("span", { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "h-3.5 w-3.5" }), "Seg a Sex, 08h \u00E0s 18h"] }), _jsxs("span", { className: "flex items-center gap-2", children: [_jsx(MapPin, { className: "h-3.5 w-3.5" }), COMPANY.address.city, " - SP"] })] })] })] }));
}
