import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { FormAlert } from '@/components/ui/FormAlert';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/sections/Section';
import { Container } from '@/components/common/Container';
import { COMPANY, getWhatsAppUrl, WHATSAPP_MESSAGES } from '@/config';
import { sanitizeText, sanitizeName, sanitizeEmail, sanitizePhone, sanitizeTextarea, } from '@/utils/sanitize';
const contractTypeOptions = [
    { value: '', label: 'Selecione o tipo de contratação' },
    { value: 'CLT', label: 'CLT' },
    { value: 'TEMPORARIO', label: 'Temporário' },
    { value: 'EFETIVO', label: 'Efetivo' },
    { value: 'PJ', label: 'PJ' },
    { value: 'ESTAGIO', label: 'Estágio' },
];
const jobCreateSchema = z.object({
    companyName: z.string().min(2, 'Nome da empresa é obrigatório'),
    cnpj: z.string().optional(),
    contactName: z.string().min(2, 'Nome do responsável é obrigatório'),
    email: z.string().email('E-mail inválido'),
    phone: z.string().min(10, 'Telefone inválido'),
    whatsapp: z.string().optional(),
    title: z.string().min(2, 'Cargo é obrigatório'),
    quantity: z.coerce.number().min(1, 'Quantidade mínima de 1'),
    city: z.string().min(2, 'Cidade é obrigatória'),
    state: z.string().min(2, 'Estado é obrigatório'),
    contractType: z.string().min(1, 'Selecione o tipo de contratação'),
    salary: z.string().optional(),
    benefits: z.string().optional(),
    schedule: z.string().optional(),
    description: z
        .string()
        .min(10, 'Descrição deve ter pelo menos 10 caracteres'),
    requirements: z.string().optional(),
    education: z.string().optional(),
    consentLgpd: z
        .boolean()
        .refine((val) => val === true, 'Você precisa aceitar os termos'),
});
export function DivulgarVagaForm() {
    const [submitError, setSubmitError] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const { register, handleSubmit, reset, formState: { errors, isSubmitting }, } = useForm({
        resolver: zodResolver(jobCreateSchema),
        defaultValues: {
            quantity: 1,
            consentLgpd: false,
        },
    });
    const onSubmit = async (data) => {
        setSubmitError(null);
        try {
            const payload = {
                company: {
                    name: sanitizeText(data.companyName),
                    cnpj: data.cnpj ? sanitizeText(data.cnpj) : undefined,
                    contactName: sanitizeName(data.contactName),
                    email: sanitizeEmail(data.email),
                    phone: sanitizePhone(data.phone),
                    whatsapp: data.whatsapp ? sanitizePhone(data.whatsapp) : undefined,
                },
                job: {
                    title: sanitizeText(data.title),
                    quantity: data.quantity,
                    city: sanitizeText(data.city),
                    state: sanitizeText(data.state).toUpperCase(),
                    contractType: data.contractType,
                    salary: data.salary ? sanitizeText(data.salary) : undefined,
                    benefits: data.benefits ? sanitizeText(data.benefits) : undefined,
                    schedule: data.schedule ? sanitizeText(data.schedule) : undefined,
                    description: sanitizeTextarea(data.description),
                    requirements: data.requirements
                        ? sanitizeTextarea(data.requirements)
                        : undefined,
                    education: data.education ? sanitizeText(data.education) : undefined,
                },
                source: 'website',
                consentLgpd: data.consentLgpd,
            };
            await new Promise((resolve) => setTimeout(resolve, 1200));
            console.log('JobCreatePayload', payload);
            setSubmitted(true);
            reset();
        }
        catch {
            setSubmitError('Erro ao enviar solicitação. Tente novamente.');
        }
    };
    if (submitted) {
        return (_jsx("div", { className: "flex min-h-[60vh] items-center justify-center", children: _jsxs(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.5 }, className: "max-w-md text-center", children: [_jsx("div", { className: "bg-success/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full", children: _jsx(CheckCircle2, { className: "text-success h-10 w-10" }) }), _jsx("h2", { className: "text-foreground mb-4 text-2xl font-bold", children: "Solicita\u00E7\u00E3o enviada!" }), _jsx("p", { className: "text-muted-foreground mb-8", children: "Nossa equipe entrar\u00E1 em contato em at\u00E9 24 horas. Enquanto isso, voc\u00EA pode nos chamar no WhatsApp para uma resposta mais r\u00E1pida." }), _jsxs("div", { className: "flex flex-col justify-center gap-4 sm:flex-row", children: [_jsx("a", { href: getWhatsAppUrl(COMPANY.whatsapp, WHATSAPP_MESSAGES.contactForm), target: "_blank", rel: "noopener noreferrer", children: _jsxs(Button, { variant: "secondary", size: "lg", children: [_jsx(Send, { className: "mr-2 h-5 w-5" }), "Continuar no WhatsApp"] }) }), _jsx(Button, { variant: "outline", size: "lg", onClick: () => setSubmitted(false), children: "Nova solicita\u00E7\u00E3o" })] })] }) }));
    }
    return (_jsx(Section, { children: _jsx(Container, { children: _jsxs("div", { className: "grid grid-cols-1 items-start gap-12 lg:grid-cols-5", children: [_jsx("div", { className: "lg:col-span-2", children: _jsxs(motion.div, { initial: { opacity: 0, x: -20 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true }, children: [_jsxs("div", { className: "bg-primary/10 text-primary mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium", children: [_jsx(Send, { className: "h-4 w-4" }), "Divulgar Vaga"] }), _jsx("h1", { className: "text-foreground text-3xl font-bold sm:text-4xl", children: "Publique sua vaga" }), _jsx("p", { className: "text-muted-foreground mt-4", children: "Preencha os dados da empresa e da vaga. Nossa equipe revisa e publica em at\u00E9 24 horas." }), _jsx("div", { className: "mt-8 space-y-4", children: [
                                        'Publicação em até 24 horas',
                                        'Divulgação em nosso banco de talentos',
                                        'Suporte na seleção',
                                        'Sem custo para a primeira publicação',
                                    ].map((item) => (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(CheckCircle2, { className: "text-primary h-5 w-5 flex-shrink-0" }), _jsx("span", { className: "text-muted-foreground", children: item })] }, item))) })] }) }), _jsx("div", { className: "lg:col-span-3", children: _jsxs(motion.form, { initial: { opacity: 0, x: 20 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true }, onSubmit: handleSubmit(onSubmit), className: "bg-card border-border shadow-premium rounded-2xl border p-6 sm:p-8", children: [submitError && (_jsx("div", { className: "mb-6", children: _jsx(FormAlert, { variant: "error", description: submitError }) })), _jsxs("div", { className: "mb-6", children: [_jsx("h2", { className: "text-foreground text-lg font-semibold", children: "Dados da empresa" }), _jsx("p", { className: "text-muted-foreground text-sm", children: "Informa\u00E7\u00F5es de contato e identifica\u00E7\u00E3o da empresa." })] }), _jsxs("div", { className: "space-y-5", children: [_jsx(FormField, { label: "Nome da empresa *", error: errors.companyName?.message, children: _jsx(Input, { placeholder: "J&T Log\u00EDstica Ltda", ...register('companyName') }) }), _jsx(FormField, { label: "CNPJ", error: errors.cnpj?.message, helperText: "Opcional", children: _jsx(Input, { placeholder: "00.000.000/0001-00", ...register('cnpj') }) }), _jsxs("div", { className: "grid grid-cols-1 gap-5 md:grid-cols-2", children: [_jsx(FormField, { label: "Respons\u00E1vel *", error: errors.contactName?.message, children: _jsx(Input, { placeholder: "Jo\u00E3o Silva", ...register('contactName') }) }), _jsx(FormField, { label: "E-mail *", error: errors.email?.message, children: _jsx(Input, { type: "email", placeholder: "contato@empresa.com.br", ...register('email') }) })] }), _jsxs("div", { className: "grid grid-cols-1 gap-5 md:grid-cols-2", children: [_jsx(FormField, { label: "Telefone *", error: errors.phone?.message, children: _jsx(Input, { placeholder: "(11) 99999-9999", ...register('phone') }) }), _jsx(FormField, { label: "WhatsApp", error: errors.whatsapp?.message, helperText: "Opcional", children: _jsx(Input, { placeholder: "(11) 99999-9999", ...register('whatsapp') }) })] })] }), _jsxs("div", { className: "mt-8 mb-6", children: [_jsx("h2", { className: "text-foreground text-lg font-semibold", children: "Dados da vaga" }), _jsx("p", { className: "text-muted-foreground text-sm", children: "Descreva a posi\u00E7\u00E3o e os requisitos." })] }), _jsxs("div", { className: "space-y-5", children: [_jsx(FormField, { label: "Cargo *", error: errors.title?.message, children: _jsx(Input, { placeholder: "Auxiliar de Limpeza", ...register('title') }) }), _jsxs("div", { className: "grid grid-cols-1 gap-5 md:grid-cols-2", children: [_jsx(FormField, { label: "Quantidade *", error: errors.quantity?.message, children: _jsx(Input, { type: "number", min: 1, ...register('quantity') }) }), _jsx(FormField, { label: "Tipo de contrata\u00E7\u00E3o *", error: errors.contractType?.message, children: _jsx(Select, { ...register('contractType'), children: contractTypeOptions.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value))) }) })] }), _jsxs("div", { className: "grid grid-cols-1 gap-5 md:grid-cols-2", children: [_jsx(FormField, { label: "Cidade *", error: errors.city?.message, children: _jsx(Input, { placeholder: "Po\u00E1", ...register('city') }) }), _jsx(FormField, { label: "Estado *", error: errors.state?.message, children: _jsx(Input, { placeholder: "SP", ...register('state') }) })] }), _jsxs("div", { className: "grid grid-cols-1 gap-5 md:grid-cols-2", children: [_jsx(FormField, { label: "Faixa salarial", error: errors.salary?.message, helperText: "Opcional", children: _jsx(Input, { placeholder: "R$ 2.500,00", ...register('salary') }) }), _jsx(FormField, { label: "Hor\u00E1rio", error: errors.schedule?.message, helperText: "Opcional", children: _jsx(Input, { placeholder: "Seg a Sex, 08h \u00E0s 17h", ...register('schedule') }) })] }), _jsx(FormField, { label: "Descri\u00E7\u00E3o da vaga *", error: errors.description?.message, children: _jsx(Textarea, { rows: 4, placeholder: "Descreva as atividades e responsabilidades...", ...register('description') }) }), _jsx(FormField, { label: "Requisitos", error: errors.requirements?.message, helperText: "Opcional", children: _jsx(Textarea, { rows: 3, placeholder: "Experi\u00EAncia, compet\u00EAncias t\u00E9cnicas, certifica\u00E7\u00F5es...", ...register('requirements') }) }), _jsx(FormField, { label: "Benef\u00EDcios", error: errors.benefits?.message, helperText: "Opcional", children: _jsx(Textarea, { rows: 2, placeholder: "Vale transporte, vale refei\u00E7\u00E3o, plano de sa\u00FAde...", ...register('benefits') }) }), _jsx(FormField, { label: "Escolaridade", error: errors.education?.message, helperText: "Opcional", children: _jsx(Input, { placeholder: "Ensino M\u00E9dio completo", ...register('education') }) }), _jsxs("div", { className: "border-border bg-surface-alt rounded-xl border p-4", children: [_jsxs("label", { className: "text-foreground flex items-start gap-3 text-sm font-medium", children: [_jsx("input", { type: "checkbox", className: "border-input text-primary focus:ring-primary mt-0.5 h-4 w-4 rounded", ...register('consentLgpd') }), _jsx("span", { children: "Li e aceito a Pol\u00EDtica de Privacidade e autorizo o tratamento dos dados pessoais para fins de recrutamento e sele\u00E7\u00E3o." })] }), errors.consentLgpd && (_jsx("p", { className: "text-destructive mt-1.5 text-sm", role: "alert", children: errors.consentLgpd.message }))] }), _jsx(Button, { type: "submit", variant: "primary", size: "lg", className: "w-full", loading: isSubmitting, leftIcon: _jsx(Send, { className: "h-5 w-5" }), children: "Publicar vaga" })] })] }) })] }) }) }));
}
