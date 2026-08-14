import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronDown, Phone, Mail, Send, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { COMPANY, WHATSAPP_MESSAGES, getWhatsAppUrl } from '@/config';
import { staggerReveal, revealUp } from '@/animations/scroll';
import { staggerItem } from '@/animations/fade';
const FAQ_CATEGORIES = [
    {
        label: 'Conta e Acesso',
        icon: '🔐',
        items: [
            {
                question: 'Como criar uma conta?',
                answer: 'Acesse o portal do cliente pelo menu superior, clique em Entrar e preencha seus dados. Caso não tenha uma conta, utilize a opção de cadastro.',
            },
            {
                question: 'Esqueci minha senha',
                answer: 'Clique em "Esqueci minha senha" na página de entrar e siga as instruções enviadas para seu e-mail cadastrado.',
            },
            {
                question: 'Como alterar meus dados?',
                answer: 'Após entrar, acesse Configurações > Perfil para atualizar suas informações pessoais.',
            },
        ],
    },
    {
        label: 'Serviços e Contratos',
        icon: '⚙️',
        items: [
            {
                question: 'Quais serviços vocês oferecem?',
                answer: 'Somos uma empresa de assessoria em RH especializada em recrutamento e seleção, mão de obra temporária, terceirização e facilities. Como solução complementar, oferecemos também limpeza, segurança, portaria, jardinagem e zeladoria.',
            },
            {
                question: 'Como solicitar um orçamento?',
                answer: 'Você pode solicitar um orçamento pelo site através do formulário de contato, pela página de cada serviço ou diretamente pelo WhatsApp.',
            },
            {
                question: 'Qual o prazo para início do serviço?',
                answer: 'Após a aprovação da proposta, iniciamos a operação em até 7 dias úteis, com profissionais treinados e equipados.',
            },
            {
                question: 'Vocês oferecem garantia de qualidade?',
                answer: 'Sim. Trabalhamos com SLA, KPIs e compliance total das normas do setor, com gestão de performance em tempo real.',
            },
        ],
    },
    {
        label: 'Plataforma e Tecnologia',
        icon: '💻',
        items: [
            {
                question: 'Como funciona a supervisão dos serviços?',
                answer: 'Utilizamos uma plataforma integrada de monitoramento e gestão em tempo real. Cada operação conta com supervisores dedicados, relatórios periódicos de desempenho e KPIs alinhados às necessidades do cliente.',
            },
            {
                question: 'O sistema funciona em mobile?',
                answer: 'Sim. Nossa plataforma é responsiva e funciona em qualquer dispositivo com acesso à internet.',
            },
            {
                question: 'Os dados são seguros?',
                answer: 'Sim. Utilizamos criptografia, controle de acesso e backups regulares para garantir a segurança dos seus dados.',
            },
        ],
    },
    {
        label: 'Empresa',
        icon: '🏢',
        items: [
            {
                question: `Quem é a ${COMPANY.name}?`,
                answer: `Somos uma empresa de assessoria em Recursos Humanos com experiência em recrutamento, seleção, mão de obra, terceirização e facilities.`,
            },
            {
                question: 'Quantos profissionais vocês possuem?',
                answer: 'Contamos com uma equipe qualificada e em constante crescimento, pronta para atender demandas em diversos segmentos.',
            },
            {
                question: 'Como enviar currículo?',
                answer: 'Acesse a página "Trabalhe Conosco", preencha o formulário com seus dados e anexe seu currículo em PDF ou DOC.',
            },
        ],
    },
];
export default function FAQ() {
    const [openFaq, setOpenFaq] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const filteredCategories = FAQ_CATEGORIES.map((cat) => ({
        ...cat,
        items: cat.items.filter((item) => item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase())),
    })).filter((cat) => cat.items.length > 0);
    return (_jsxs("div", { children: [_jsx(SEO, { title: `FAQ — ${COMPANY.name}`, description: `Perguntas frequentes sobre serviços de RH, recrutamento, terceirização, facilities e processos da ${COMPANY.name}.`, keywords: [
                    'FAQ',
                    'perguntas frequentes',
                    'suporte',
                    COMPANY.name,
                    'RH',
                    'recrutamento',
                    'terceirização',
                    'facilities',
                ], type: "FAQPage" }), _jsx(Section, { className: "bg-surface-alt", children: _jsxs(Container, { children: [_jsxs(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: '-100px' }, variants: staggerReveal(0.15), className: "text-center", children: [_jsx(motion.h2, { variants: revealUp, className: "text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl", children: "Central de Ajuda" }), _jsx(motion.p, { variants: revealUp, className: "text-muted-foreground mx-auto mt-4 max-w-2xl text-lg", children: "Encontre respostas para as d\u00FAvidas mais comuns sobre nossos servi\u00E7os, plataforma e processos." })] }), _jsx(motion.div, { variants: revealUp, className: "mx-auto mt-8 max-w-xl", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" }), _jsx(Input, { type: "text", placeholder: "Pesquisar nas perguntas frequentes...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "pl-12" })] }) })] }) }), _jsx(Section, { children: _jsx(Container, { children: _jsxs(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true }, variants: staggerReveal(0.1), className: "space-y-12", children: [filteredCategories.map((category, catIndex) => (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.4, delay: catIndex * 0.05 }, children: [_jsxs("h3", { className: "text-foreground text-2xl font-bold", children: [category.icon, " ", category.label] }), _jsx("div", { className: "mt-6 space-y-4", children: category.items.map((faq, index) => (_jsxs(motion.div, { variants: staggerItem('up'), className: "bg-card shadow-premium border-border overflow-hidden rounded-2xl border", children: [_jsxs("button", { className: "flex w-full items-center justify-between p-6 text-left", onClick: () => {
                                                        const globalIndex = catIndex * 100 + index;
                                                        setOpenFaq(openFaq === globalIndex ? null : globalIndex);
                                                    }, "aria-expanded": openFaq === catIndex * 100 + index, children: [_jsx("span", { className: "text-foreground text-sm font-semibold", children: faq.question }), _jsx(ChevronDown, { className: `text-primary h-5 w-5 flex-shrink-0 transition-transform duration-300 ${openFaq === catIndex * 100 + index
                                                                ? 'rotate-180'
                                                                : ''}` })] }), _jsx(motion.div, { initial: false, animate: {
                                                        height: openFaq === catIndex * 100 + index ? 'auto' : 0,
                                                        opacity: openFaq === catIndex * 100 + index ? 1 : 0,
                                                    }, transition: {
                                                        duration: 0.3,
                                                        ease: [0.25, 0.4, 0.25, 1],
                                                    }, className: "overflow-hidden", children: _jsx("p", { className: "text-muted-foreground px-6 pb-6 text-sm leading-relaxed", children: faq.answer }) })] }, faq.question))) })] }, category.label))), searchQuery && filteredCategories.length === 0 && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "py-12 text-center", children: [_jsxs("p", { className: "text-muted-foreground text-lg", children: ["Nenhuma pergunta encontrada para \"", searchQuery, "\""] }), _jsx("p", { className: "text-muted-foreground mt-2 text-sm", children: "Tente usar termos diferentes ou entre em contato com nossa equipe." })] }))] }) }) }), _jsx(Section, { className: "bg-surface-alt", children: _jsx(Container, { children: _jsxs(motion.div, { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 }, className: "mx-auto max-w-2xl text-center", children: [_jsx("h2", { className: "text-foreground text-3xl font-bold sm:text-4xl", children: "Fique por dentro" }), _jsx("p", { className: "text-muted-foreground mx-auto mt-4 max-w-xl text-lg", children: "Receba novidades, dicas e conte\u00FAdos exclusivos sobre recrutamento, RH e oportunidades de emprego e gest\u00E3o de servi\u00E7os diretamente no seu e-mail." }), _jsxs("form", { className: "mt-8 flex flex-col gap-3 sm:flex-row", onSubmit: (e) => {
                                    e.preventDefault();
                                    const form = e.currentTarget;
                                    const email = form.elements.namedItem('newsletter-email').value;
                                    if (email) {
                                        form.reset();
                                    }
                                }, children: [_jsx(Input, { type: "email", name: "newsletter-email", placeholder: "Seu melhor e-mail", required: true, className: "flex-1" }), _jsxs(Button, { type: "submit", variant: "primary", size: "lg", children: [_jsx(Send, { className: "mr-2 h-5 w-5" }), "Inscrever-se"] })] }), _jsx("p", { className: "text-muted-foreground mt-4 text-xs", children: "Sem spam. Cancele quando quiser." })] }) }) }), _jsx(Section, { children: _jsx(Container, { children: _jsxs(motion.div, { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 }, className: "relative overflow-hidden rounded-3xl p-8 text-center sm:p-12", children: [_jsx("div", { className: "bg-primary/5 animate-float-slow absolute -top-20 -right-20 h-60 w-60 rounded-full blur-3xl" }), _jsx("div", { className: "bg-primary/5 animate-float-medium absolute -bottom-20 -left-20 h-60 w-60 rounded-full blur-3xl" }), _jsxs(motion.div, { className: "relative", children: [_jsx("h2", { className: "text-foreground text-3xl font-bold sm:text-4xl", children: "Ainda tem d\u00FAvidas?" }), _jsx("p", { className: "text-muted-foreground mx-auto mt-4 max-w-xl text-lg", children: "Nossa equipe est\u00E1 pronta para atender voc\u00EA. Entre em contato pelo WhatsApp ou preencha o formul\u00E1rio." }), _jsxs("div", { className: "mt-8 flex flex-wrap justify-center gap-4", children: [_jsx(motion.a, { href: getWhatsAppUrl(COMPANY.whatsapp, WHATSAPP_MESSAGES.faq), target: "_blank", rel: "noopener noreferrer", whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, children: _jsxs(Button, { variant: "secondary", size: "lg", children: [_jsx(Phone, { className: "mr-2 h-5 w-5" }), "Falar no WhatsApp"] }) }), _jsx(Link, { to: "/contato", children: _jsxs(Button, { variant: "outline", size: "lg", children: [_jsx(Mail, { className: "mr-2 h-5 w-5" }), "Enviar E-mail"] }) })] })] })] }) }) })] }));
}
