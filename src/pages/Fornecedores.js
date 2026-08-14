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
import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { mockSubmitSupplier } from '@/services/mock/fornecedores';
import { COMPANY, WHATSAPP_MESSAGES, getWhatsAppUrl } from '@/config';
import { sanitizeText, sanitizeName, sanitizeEmail, sanitizePhone, } from '@/utils/sanitize';
const supplierSchema = z.object({
    company: z.string().min(2, 'Nome da empresa é obrigatório'),
    cnpj: z.string().min(14, 'CNPJ deve ter pelo menos 14 caracteres'),
    products: z.string().min(2, 'Produtos são obrigatórios'),
    representative: z.string().min(2, 'Nome do representante é obrigatório'),
    phone: z.string().min(10, 'Telefone deve ter pelo menos 10 caracteres'),
    email: z.string().email('E-mail inválido'),
});
export default function Fornecedores() {
    const [submitted, setSubmitted] = useState(false);
    const { register, handleSubmit, reset, formState: { errors, isSubmitting }, } = useForm({
        resolver: zodResolver(supplierSchema),
    });
    const onSubmit = async (data) => {
        mockSubmitSupplier({
            company: sanitizeText(data.company),
            cnpj: sanitizeText(data.cnpj),
            products: sanitizeText(data.products),
            representative: sanitizeName(data.representative),
            phone: sanitizePhone(data.phone),
            email: sanitizeEmail(data.email),
            status: 'active',
            catalog: '',
            documents: '',
        });
        setSubmitted(true);
        reset();
    };
    if (submitted) {
        return (_jsx("div", { className: "flex min-h-[70vh] items-center justify-center", children: _jsxs(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.5 }, className: "max-w-md text-center", children: [_jsx("div", { className: "bg-success/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full", children: _jsx(CheckCircle2, { className: "text-success h-10 w-10" }) }), _jsx("h2", { className: "text-foreground mb-4 text-2xl font-bold", children: "Cadastro Enviado!" }), _jsx("p", { className: "text-muted-foreground mb-8", children: "Nossa equipe de Compras analisar\u00E1 seu cadastro e entrar\u00E1 em contato em breve." }), _jsxs("div", { className: "flex flex-col justify-center gap-4 sm:flex-row", children: [_jsx("a", { href: getWhatsAppUrl(COMPANY.whatsapp, WHATSAPP_MESSAGES.suppliers), target: "_blank", rel: "noopener noreferrer", children: _jsxs(Button, { variant: "secondary", size: "lg", children: [_jsx(Send, { className: "mr-2 h-5 w-5" }), "Continuar no WhatsApp"] }) }), _jsx(Link, { to: "/", children: _jsx(Button, { variant: "outline", size: "lg", children: "Voltar ao In\u00EDcio" }) })] })] }) }));
    }
    return (_jsxs("div", { children: [_jsx(SEO, { title: `Fornecedores — ${COMPANY.name}`, description: `Cadastro de fornecedores da ${COMPANY.name}. Torne-se um parceiro fornecedor de serviços de RH, facilities e terceirização.`, keywords: [
                    'fornecedores',
                    COMPANY.name,
                    'cadastro',
                    'parceria',
                    'fornecimento',
                    'RH',
                    'terceirização',
                    'facilities',
                ], type: "Organization" }), _jsx(Section, { children: _jsx(Container, { children: _jsxs("div", { className: "grid grid-cols-1 items-start gap-12 lg:grid-cols-5", children: [_jsx("div", { className: "lg:col-span-2", children: _jsxs(motion.div, { initial: { opacity: 0, x: -20 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true }, children: [_jsxs("div", { className: "bg-primary/10 text-primary mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium", children: [_jsx(Shield, { className: "h-4 w-4" }), "Cadastro de Fornecedores"] }), _jsx("h1", { className: "text-foreground text-3xl font-bold sm:text-4xl", children: "Seja um Fornecedor" }), _jsx("p", { className: "text-muted-foreground mt-4", children: "Cadastre sua empresa para participar do nosso processo de sele\u00E7\u00E3o de fornecedores." })] }) }), _jsx("div", { className: "lg:col-span-3", children: _jsxs(motion.form, { initial: { opacity: 0, x: 20 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true }, onSubmit: handleSubmit(onSubmit), className: "bg-card shadow-premium rounded-2xl p-8", children: [_jsxs("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-2", children: [_jsx("div", { className: "md:col-span-2", children: _jsx(Input, { label: "Empresa *", placeholder: "Nome da empresa", error: errors.company?.message, ...register('company') }) }), _jsx("div", { children: _jsx(Input, { label: "CNPJ *", placeholder: "00.000.000/0001-00", error: errors.cnpj?.message, ...register('cnpj') }) }), _jsx("div", { className: "md:col-span-2", children: _jsx(Input, { label: "Produtos / Servi\u00E7os *", placeholder: "Ex: Equipamentos de seguran\u00E7a, produtos de limpeza...", error: errors.products?.message, ...register('products') }) }), _jsx("div", { className: "md:col-span-2", children: _jsx(Input, { label: "Representante *", placeholder: "Nome do representante comercial", error: errors.representative?.message, ...register('representative') }) }), _jsx("div", { children: _jsx(Input, { label: "Telefone *", placeholder: "(11) 99999-9999", error: errors.phone?.message, ...register('phone') }) }), _jsx("div", { children: _jsx(Input, { label: "E-mail *", type: "email", placeholder: "contato@fornecedor.com.br", error: errors.email?.message, ...register('email') }) })] }), _jsx("div", { className: "mt-8", children: _jsx(Button, { type: "submit", variant: "secondary", size: "lg", className: "w-full", loading: isSubmitting, disabled: isSubmitting, leftIcon: _jsx(Phone, { className: "h-5 w-5" }), children: "Enviar Cadastro e Abrir WhatsApp" }) })] }) })] }) }) })] }));
}
