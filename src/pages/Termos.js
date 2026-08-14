import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Section } from '@/components/sections/Section';
import { Container } from '@/components/common/Container';
import { SEO } from '@/components/ui/SEO';
import { COMPANY } from '@/config';
export default function Termos() {
    return (_jsxs("div", { className: "min-h-screen", children: [_jsx(SEO, { title: `Termos de Uso — ${COMPANY.name}`, description: `Termos de uso do site e serviços da ${COMPANY.name}.`, keywords: ['termos de uso', 'termos', COMPANY.name, 'serviços'], type: "WebSite" }), _jsx(Section, { className: "pt-24 md:pt-32", children: _jsxs(Container, { children: [_jsx("h1", { className: "text-foreground text-3xl font-bold sm:text-4xl", children: "Termos de Uso" }), _jsx("p", { className: "text-muted-foreground mt-4 max-w-3xl text-base leading-relaxed", children: "Conte\u00FAdo pendente de valida\u00E7\u00E3o jur\u00EDdica. Esta p\u00E1gina foi criada para estruturar a rota e o acesso p\u00FAblico, mas ainda n\u00E3o cont\u00E9m termos finais aprovados." })] }) })] }));
}
