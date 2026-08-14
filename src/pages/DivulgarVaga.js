import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SEO } from '@/components/ui/SEO';
import { DivulgarVagaForm } from '@/components/forms/DivulgarVagaForm';
import { COMPANY } from '@/config';
export default function DivulgarVaga() {
    return (_jsxs("div", { className: "min-h-screen", children: [_jsx(SEO, { title: `Divulgar Vaga — ${COMPANY.name}`, description: "Publique sua vaga e encontre os profissionais certos para sua empresa. Atendimento em mais de 50 cidades.", keywords: [
                    'divulgar vaga',
                    'publicar vaga',
                    'recrutamento',
                    'seleção',
                    'vagas',
                    COMPANY.name,
                ], type: "WebSite" }), _jsx(DivulgarVagaForm, {})] }));
}
