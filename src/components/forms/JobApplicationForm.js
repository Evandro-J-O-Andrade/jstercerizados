import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { COMPANY, getWhatsAppUrl } from '@/config';
import { Mail, MapPin, Clock, CheckCircle2, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { sanitizeText, sanitizeName, sanitizeEmail, sanitizePhone, sanitizeTextarea, } from '@/utils/sanitize';
const contractOptions = [
    { value: '', label: 'Selecione' },
    { value: 'CLT', label: 'CLT' },
    { value: 'ESTAGIO', label: 'Estágio' },
    { value: 'TEMPORARIO', label: 'Temporário' },
    { value: 'FREELA', label: 'Freelance' },
    { value: 'TERCEIRIZADO', label: 'Terceirizado' },
    { value: 'CD', label: 'C/D' },
];
const jobApplicationSchema = z.object({
    name: z
        .string()
        .min(2, 'Informe seu nome completo')
        .max(120, 'Nome muito longo'),
    email: z.string().min(1, 'Informe seu e-mail').email('E-mail inválido'),
    phone: z
        .string()
        .min(10, 'Informe um telefone válido')
        .max(20, 'Telefone inválido'),
    city: z.string().min(2, 'Informe sua cidade').max(80, 'Cidade muito longa'),
    contract: z.string().optional(),
    experience: z.string().max(2000, 'Experiência muito longa').optional(),
    message: z.string().max(2000, 'Mensagem muito longa').optional(),
    lgpd: z
        .string()
        .min(1, 'Você precisa autorizar o tratamento de dados para continuar'),
});
export function JobApplicationForm({ jobTitle, jobSlug, vagaId, }) {
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset, } = useForm({
        resolver: zodResolver(jobApplicationSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            city: '',
            contract: '',
            experience: '',
            message: '',
            lgpd: '',
        },
    });
    const [success, setSuccess] = useState(false);
    const onSubmit = async (data) => {
        const message = encodeURIComponent(`*Nova candidatura*\n\n` +
            `*Vaga:* ${jobTitle || 'Não informada'}\n` +
            `*ID da vaga:* ${vagaId || '-'}\n` +
            `*Slug:* ${jobSlug || '-'}\n` +
            `*Nome:* ${sanitizeName(data.name)}\n` +
            `*E-mail:* ${sanitizeEmail(data.email)}\n` +
            `*Telefone:* ${sanitizePhone(data.phone)}\n` +
            `*Cidade:* ${sanitizeText(data.city)}\n` +
            `*Tipo de contrato:* ${sanitizeText(data.contract || '') || '-'}\n` +
            `*Experiência:* ${sanitizeTextarea(data.experience || '') || '-'}\n` +
            `*Mensagem:* ${sanitizeTextarea(data.message || '') || '-'}`);
        window.open(getWhatsAppUrl(COMPANY.whatsapp, message), '_blank');
        setSuccess(true);
        reset();
    };
    if (success) {
        return (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "bg-card border-border rounded-2xl border p-8 text-center", children: [_jsx("div", { className: "bg-primary/10 text-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full", children: _jsx(CheckCircle2, { className: "h-8 w-8" }) }), _jsx("h3", { className: "text-foreground mb-2 text-2xl font-bold", children: "Candidatura enviada!" }), _jsx("p", { className: "text-muted-foreground mb-6", children: "Recebemos sua candidatura. Nossa equipe entrar\u00E1 em contato em breve." }), _jsx(Button, { variant: "secondary", onClick: () => setSuccess(false), children: "Nova candidatura" })] }));
    }
    return (_jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "bg-card border-border rounded-2xl border p-6 sm:p-8", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "text-foreground mb-2 text-xl font-bold", children: "Candidatar-se \u00E0 vaga" }), _jsx("p", { className: "text-muted-foreground text-sm", children: "Preencha o formul\u00E1rio e nossa equipe entrar\u00E1 em contato." })] }), _jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2", children: [_jsx(Input, { label: "Nome completo", error: errors.name?.message, ...register('name') }), _jsx(Input, { label: "E-mail", type: "email", error: errors.email?.message, ...register('email') }), _jsx(Input, { label: "Telefone/WhatsApp", error: errors.phone?.message, ...register('phone') }), _jsx(Input, { label: "Cidade", error: errors.city?.message, ...register('city') }), _jsx(Select, { label: "Tipo de contrato desejado", error: errors.contract?.message, ...register('contract'), children: contractOptions.map((opt) => (_jsx("option", { value: opt.value, children: opt.label }, opt.value))) }), _jsx(Input, { label: "Experi\u00EAncia profissional", error: errors.experience?.message, ...register('experience'), placeholder: "Ex.: 2 anos em atendimento" })] }), _jsx("div", { className: "mt-4", children: _jsx(Textarea, { label: "Mensagem", error: errors.message?.message, ...register('message'), rows: 4, placeholder: "Conte um pouco sobre voc\u00EA..." }) }), _jsxs("div", { className: "mt-4", children: [_jsxs("label", { className: "text-muted-foreground mb-1 flex items-center gap-2 text-sm font-medium", children: [_jsx("input", { type: "checkbox", className: "text-primary focus:ring-primary h-4 w-4 rounded", ...register('lgpd') }), "Autorizo o tratamento dos meus dados pessoais para esta candidatura."] }), errors.lgpd && (_jsx("p", { className: "text-destructive mt-1 text-sm", children: errors.lgpd.message }))] }), _jsxs("div", { className: "mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [_jsxs(Button, { type: "submit", variant: "primary", size: "lg", loading: isSubmitting, disabled: isSubmitting, children: [_jsx(Upload, { className: "mr-2 h-4 w-4" }), "Enviar candidatura"] }), _jsxs("div", { className: "text-muted-foreground flex flex-col gap-1 text-xs", children: [_jsxs("span", { className: "flex items-center gap-2", children: [_jsx(Mail, { className: "h-3.5 w-3.5" }), COMPANY.email] }), _jsxs("span", { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "h-3.5 w-3.5" }), "Seg a Sex, 08h \u00E0s 18h"] }), _jsxs("span", { className: "flex items-center gap-2", children: [_jsx(MapPin, { className: "h-3.5 w-3.5" }), COMPANY.address.city, " - SP"] })] })] })] }));
}
