import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle2, Send, Briefcase, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { mockSubmitCandidate } from '@/services/mock/curriculos';
import { COMPANY, WHATSAPP_MESSAGES, getWhatsAppUrl } from '@/config';
import { cn } from '@/utils';
import { sanitizeText, sanitizeName, sanitizeEmail, sanitizePhone, sanitizeTextarea, sanitizeFileName, } from '@/utils/sanitize';
const positionOptions = [
    { value: 'auxiliar-de-embalagens', label: 'Auxiliar de embalagens' },
    { value: 'auxiliar-logistico', label: 'Auxiliar logístico' },
    { value: 'auxiliar-de-rh', label: 'Auxiliar de RH' },
    { value: 'assistente-administrativo', label: 'Assistente administrativo' },
    { value: 'assistente-rh', label: 'Assistente RH' },
    { value: 'assistente-dp', label: 'Assistente DP' },
    { value: 'analista-dp', label: 'Analista DP' },
    { value: 'conferente', label: 'Conferente' },
    { value: 'auxiliar-de-tapeçaria', label: 'Auxiliar de tapeçaria' },
    { value: 'assistente-de-expedicao', label: 'Assistente de expedição' },
    { value: 'assistente-de-pcp', label: 'Assistente de PCP' },
    { value: 'auxiliar-de-almoxarifado', label: 'Auxiliar de almoxarifado' },
];
const candidateSchema = z.object({
    name: z.string().min(2, 'Nome é obrigatório'),
    cpf: z.string().optional(),
    rg: z.string().optional(),
    phone: z.string().min(10, 'Telefone deve ter pelo menos 10 caracteres'),
    email: z.string().email('E-mail inválido'),
    city: z.string().min(2, 'Cidade é obrigatória'),
    positions: z
        .array(z.string())
        .min(1, 'Selecione pelo menos uma área de interesse'),
    experience: z.string().min(2, 'Experiência é obrigatória'),
    courses: z.string().optional(),
    availability: z.string().optional(),
    schedule: z.string().optional(),
    resume: z.string().min(2, 'Currículo é obrigatório'),
    resumeFile: z
        .instanceof(FileList)
        .optional()
        .refine((files) => {
        if (!files || files.length === 0)
            return true;
        const file = files[0];
        const validTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        return validTypes.includes(file.type);
    }, { message: 'Apenas PDF, DOC ou DOCX são aceitos' })
        .refine((files) => {
        if (!files || files.length === 0)
            return true;
        const file = files[0];
        return file.size <= 10 * 1024 * 1024;
    }, { message: 'O arquivo deve ter no máximo 10 MB' }),
});
export default function TrabalheConosco() {
    const [submitted, setSubmitted] = useState(false);
    const [selectedPositions, setSelectedPositions] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const { register, handleSubmit, reset, formState: { errors, isSubmitting }, } = useForm({
        resolver: zodResolver(candidateSchema),
        defaultValues: {
            positions: [],
        },
    });
    const onSubmit = async (data) => {
        const resumeFile = data.resumeFile?.[0] ?? null;
        mockSubmitCandidate({
            name: sanitizeName(data.name),
            cpf: data.cpf ? sanitizeText(data.cpf) : '',
            rg: data.rg ? sanitizeText(data.rg) : '',
            phone: sanitizePhone(data.phone),
            email: sanitizeEmail(data.email),
            city: sanitizeText(data.city),
            experience: sanitizeTextarea(data.experience),
            position: data.positions.join(', '),
            resume: sanitizeTextarea(data.resume),
            availability: data.availability ? sanitizeText(data.availability) : '',
            courses: data.courses ? sanitizeText(data.courses) : '',
            status: 'received',
            resumeFileName: resumeFile ? sanitizeFileName(resumeFile.name) : '',
        });
        setSubmitted(true);
        reset();
        setSelectedPositions([]);
        setSelectedFile(null);
    };
    if (submitted) {
        return (_jsx("div", { className: "flex min-h-[70vh] items-center justify-center", children: _jsxs(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.5 }, className: "max-w-md text-center", children: [_jsx("div", { className: "bg-success/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full", children: _jsx(CheckCircle2, { className: "text-success h-10 w-10" }) }), _jsx("h2", { className: "text-foreground mb-4 text-2xl font-bold", children: "Curr\u00EDculo Enviado!" }), _jsx("p", { className: "text-muted-foreground mb-8", children: "Seu curr\u00EDculo foi recebido. A equipe de RH analisar\u00E1 seu perfil e entrar\u00E1 em contato caso haja interesse." }), _jsxs("div", { className: "flex flex-col justify-center gap-4 sm:flex-row", children: [_jsx("a", { href: getWhatsAppUrl(COMPANY.whatsapp, WHATSAPP_MESSAGES.careers), target: "_blank", rel: "noopener noreferrer", children: _jsxs(Button, { variant: "secondary", size: "lg", children: [_jsx(Send, { className: "mr-2 h-5 w-5" }), "Continuar no WhatsApp"] }) }), _jsx(Link, { to: "/", children: _jsx(Button, { variant: "outline", size: "lg", children: "Voltar ao In\u00EDcio" }) })] })] }) }));
    }
    return (_jsxs("div", { children: [_jsx(SEO, { title: `Trabalhe Conosco — ${COMPANY.name}`, description: `Cadastre seu currículo na ${COMPANY.name} e candidate-se às nossas oportunidades de trabalho.`, keywords: [
                    'trabalhe conosco',
                    'currículo',
                    'candidatura',
                    'emprego',
                    'trabalho',
                    COMPANY.name,
                    'RH',
                    'recrutamento',
                ], type: "WebSite" }), _jsx(Section, { children: _jsxs(Container, { children: [_jsxs("div", { className: "mb-12 text-center", children: [_jsx("h1", { className: "text-foreground text-3xl font-bold sm:text-4xl", children: "Banco de Talentos" }), _jsx("p", { className: "text-muted-foreground mx-auto mt-4 max-w-2xl text-lg", children: "Mesmo que n\u00E3o exista uma vaga aberta no momento, seu perfil pode fazer parte do nosso Banco de Talentos." }), _jsx("p", { className: "text-muted-foreground mx-auto mt-2 max-w-2xl text-base", children: "Selecione as oportunidades que voc\u00EA procura e cadastre seu curr\u00EDculo. A J&S Empregos entrar\u00E1 em contato quando houver compatibilidade." })] }), _jsxs("div", { className: "grid grid-cols-1 items-start gap-12 lg:grid-cols-5", children: [_jsx("div", { className: "lg:col-span-2", children: _jsxs(motion.div, { initial: { opacity: 0, x: -20 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true }, children: [_jsxs("div", { className: "bg-primary/10 text-primary mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium", children: [_jsx(Briefcase, { className: "h-4 w-4" }), "Qual oportunidade voc\u00EA procura?"] }), _jsx("p", { className: "text-muted-foreground", children: "Selecione uma ou mais \u00E1reas de interesse e preencha o formul\u00E1rio com seus dados." }), _jsx("div", { className: "mt-6 max-h-[520px] space-y-3 overflow-y-auto pr-1", children: positionOptions.map((opt) => (_jsxs("label", { className: cn('flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors', selectedPositions.includes(opt.value)
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border hover:border-primary'), children: [_jsx("input", { type: "checkbox", value: opt.value, checked: selectedPositions.includes(opt.value), onChange: (e) => {
                                                                setSelectedPositions((prev) => e.target.checked
                                                                    ? [...prev, opt.value]
                                                                    : prev.filter((v) => v !== opt.value));
                                                            }, className: "text-primary focus:ring-primary h-4 w-4 rounded" }), _jsx("span", { className: "text-muted-foreground text-sm font-medium", children: opt.label })] }, opt.value))) })] }) }), _jsxs("div", { className: "lg:col-span-3", children: [selectedPositions.length > 0 && (_jsxs(motion.form, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 }, onSubmit: handleSubmit(onSubmit), className: "bg-card shadow-premium rounded-2xl p-8", children: [_jsx("div", { className: "mb-4", children: _jsxs("p", { className: "text-muted-foreground text-sm", children: ["\u00C1reas selecionadas:", ' ', _jsx("span", { className: "text-foreground font-medium", children: selectedPositions
                                                                    .map((val) => positionOptions.find((o) => o.value === val)
                                                                    ?.label)
                                                                    .join(', ') })] }) }), _jsxs("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-2", children: [_jsx("div", { className: "md:col-span-2", children: _jsx(Input, { label: "Nome Completo *", placeholder: "Seu nome completo", error: errors.name?.message, ...register('name') }) }), _jsx("div", { className: "md:col-span-2", children: _jsx(Input, { label: "CPF", placeholder: "000.000.000-00", error: errors.cpf?.message, ...register('cpf') }) }), _jsx("div", { className: "md:col-span-2", children: _jsx(Input, { label: "RG", placeholder: "00.000.000-0", error: errors.rg?.message, ...register('rg') }) }), _jsx("div", { className: "md:col-span-2", children: _jsx(Input, { label: "Cursos", placeholder: "Ex: Administra\u00E7\u00E3o, Inform\u00E1tica...", error: errors.courses?.message, ...register('courses') }) }), _jsx("div", { children: _jsx(Input, { label: "Disponibilidade", placeholder: "Ex: Integral, Manh\u00E3, Tarde...", error: errors.availability?.message, ...register('availability') }) }), _jsx("div", { children: _jsx(Input, { label: "Escala Preferida", placeholder: "Ex: 2\u00BA turno, Noturno...", error: errors.schedule?.message, ...register('schedule') }) }), _jsx("div", { children: _jsx(Input, { label: "Telefone *", placeholder: "(11) 99999-9999", error: errors.phone?.message, ...register('phone') }) }), _jsx("div", { children: _jsx(Input, { label: "E-mail *", type: "email", placeholder: "seu@email.com", error: errors.email?.message, ...register('email') }) }), _jsx("div", { children: _jsx(Input, { label: "Cidade *", placeholder: "S\u00E3o Paulo", error: errors.city?.message, ...register('city') }) }), _jsx("div", { children: _jsx(Input, { label: "Experi\u00EAncia *", placeholder: "Ex: 2 anos na \u00E1rea...", error: errors.experience?.message, ...register('experience') }) }), _jsx("div", { className: "md:col-span-2", children: _jsx(Textarea, { label: "Curr\u00EDculo *", placeholder: "Descreva sua experi\u00EAncia profissional...", rows: 4, error: errors.resume?.message, ...register('resume') }) }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "text-muted-foreground mb-1 block text-sm font-medium", children: "Anexar Curr\u00EDculo (PDF, DOC, DOCX \u2014 m\u00E1x. 10 MB)" }), _jsxs("div", { className: cn('border-input bg-surface text-foreground focus:border-primary focus:ring-primary/20 relative flex min-h-[120px] items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 transition-colors focus:ring-2 focus:outline-none', errors.resumeFile?.message &&
                                                                        'border-destructive focus:border-destructive focus:ring-destructive/20'), children: [_jsx("input", { type: "file", accept: ".pdf,.doc,.docx", onChange: (e) => {
                                                                                const file = e.target.files?.[0] ?? null;
                                                                                if (file) {
                                                                                    const sanitizedName = sanitizeFileName(file.name);
                                                                                    const sanitizedFile = new File([file], sanitizedName, {
                                                                                        type: file.type,
                                                                                    });
                                                                                    setSelectedFile(sanitizedFile);
                                                                                }
                                                                                else {
                                                                                    setSelectedFile(null);
                                                                                }
                                                                            }, className: "absolute inset-0 h-full w-full cursor-pointer opacity-0", "aria-label": "Selecionar arquivo de curr\u00EDculo" }), _jsxs("div", { className: "pointer-events-none text-center", children: [_jsx(Upload, { className: "text-muted-foreground mx-auto mb-2 h-8 w-8" }), _jsx("p", { className: "text-muted-foreground text-sm", children: selectedFile
                                                                                        ? selectedFile.name
                                                                                        : 'Arraste o arquivo ou clique para selecionar' }), _jsx("p", { className: "text-muted-foreground/60 mt-1 text-xs", children: "PDF, DOC ou DOCX \u2014 at\u00E9 10 MB" })] })] }), errors.resumeFile && (_jsx("p", { className: "text-destructive mt-1 text-sm", children: errors.resumeFile.message }))] })] }), _jsx("input", { type: "hidden", ...register('positions') }), _jsx("div", { className: "mt-8", children: _jsx(Button, { type: "submit", variant: "secondary", size: "lg", className: "w-full", loading: isSubmitting, disabled: isSubmitting, leftIcon: _jsx(Send, { className: "h-5 w-5" }), children: "Enviar Curr\u00EDculo para o Banco de Talentos" }) })] }, selectedPositions.join(','))), selectedPositions.length === 0 && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "bg-card shadow-premium rounded-2xl p-8 text-center", children: [_jsx(Briefcase, { className: "text-muted-foreground mx-auto mb-4 h-12 w-12" }), _jsx("p", { className: "text-muted-foreground", children: "Selecione uma ou mais oportunidades acima para enviar seu curr\u00EDculo." })] }))] })] })] }) })] }));
}
