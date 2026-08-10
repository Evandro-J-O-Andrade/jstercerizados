# SERVIÇOS

**Rotas:**

- `/servicos` — catálogo
- `/servicos/:slug` — detalhe do serviço

**Status:** Documentação de referência
**Referência:** `docs/SITE-JS-Empregos/00-VISAO-GERAL.md`

---

## 1. Objetivo

Apresentar o catálogo de serviços da J&S Empregos Ltda. de forma clara, profissional e orientada à conversão.

A página deve comunicar que a J&S atua em:

- Recursos Humanos / Assessoria em RH
- Mão de obra temporária e efetiva
- Terceirização
- Facilities

Sem apagar nenhuma linha de negócio.

---

## 2. Usuário principal

- Empresas que precisam de RH, terceirização ou facilities
- Candidatos que querem entender a atuação da J&S
- Parceiros / fornecedores

---

## 3. Objetivo comercial

- Gerar leads B2B
- Direcionar para solicitação de orçamento
- Direcionar para contato comercial
- Posicionar a J&S como referência em RH + Facilities

---

## 4. Rotas

- `/servicos`
- `/servicos/:slug`

---

## 5. Conteúdo fornecido pelo cliente

Manter como referência:

- Facilities
- Limpeza / Conservação
- Controle de acesso
- Portaria
- Recepção
- Jardinagem
- Mão de obra temporária
- Mão de obra efetiva
- Terceirização
- Recrutamento e seleção
- Assessoria em RH
- Hunting de executivos
- Avaliação de perfil
- Banco de talentos

Não inventar serviços adicionais.

---

## 6. Estrutura visual

Catálogo organizado por categorias:

### Recursos Humanos

- Assessoria em RH
- Recrutamento e Seleção
- Mão de Obra Temporária
- Mão de Obra Efetiva
- Hunting de Executivos
- Avaliação de Perfil
- Banco de Talentos

### Facilities

- Limpeza e Higienização
- Limpeza de Fachadas
- Limpeza de Vidros
- Jardinagem
- Faxina
- Limpeza Pré/Pós-mudança

### Terceirização

- Serviços Empregos
- Controle de Acesso
- Portaria
- Recepção

Cada card deve conter:

- imagem/fallback
- título
- descrição curta
- CTA: "Conhecer serviço" → `/servicos/:slug`

---

## 7. Seções

1. Hero da página
2. Grid por categoria
3. CTA geral: "Solicitar orçamento"
4. Footer

---

## 8. CTAs

- Primário: `Solicitar orçamento`
- Secundário: `Falar com a J&S` → WhatsApp/Contato

---

## 9. Componentes reutilizáveis

- `Section`
- `Container`
- `ServiceCard`
- `ServiceRequestForm`
- `Button`
- `SafeImage`

---

## 10. Dados necessários

```ts
// src/content/services.ts ou src/services/mock/services.ts
export interface Service {
  slug: string;
  title: string;
  category: 'rh' | 'facilities' | 'terceirizacao';
  shortDescription: string;
  description: string;
  image: string;
  fallback: string;
  benefits: string[];
  services?: string[];
  cta: string;
  formType: 'service-request' | 'company-lead';
}
```

---

## 11. Formulários

`ServiceRequestForm`

- Campos: nome, empresa, e-mail, telefone, cidade, serviço de interesse, mensagem
- O `serviço` deve ser pré-selecionado quando o usuário vier de `/servicos/:slug`

---

## 12. Responsividade

- Desktop: grid 3 colunas
- Tablet: grid 2 colunas
- Mobile: grid 1 coluna

---

## 13. Dark / Light

- Cards devem manter contraste em ambos os temas
- Imagens devem ter fallback escuro/claro adequado

---

## 14. Acessibilidade

- headings hierárquicos
- labels nos inputs
- aria-label nos links de serviço
- foco visível
- teclado navegável

---

## 15. SEO

- title: "Serviços — J&S Empregos"
- description: "Assessoria em RH, facilities, terceirização e mão de obra."
- canonical: `/servicos`

---

## 16. Animações

- entrada suave dos cards
- hover discreto
- respeitar `prefers-reduced-motion`

---

## 17. Estados

- loading: placeholder skeleton
- empty: "Nenhum serviço encontrado"
- error: mensagem de erro com retry

---

## 18. Não fazer

- Não inventar serviços
- Não remover categorias existentes
- Não transformar a página em lista infinita sem organização
- Não duplicar JSX por serviço

---

## 19. Critérios de aceite

- [ ] Catálogo completo por categoria
- [ ] Todos os serviços reais listados
- [ ] Navegação funcional para `/servicos/:slug`
- [ ] CTA de solicitação de orçamento funcional
- [ ] Responsivo mobile/tablet/desktop
- [ ] Dark/light testado
- [ ] Acessibilidade testada

---

## 20. Checklist final

- [ ] typecheck
- [ ] build
- [ ] sem erros de console
- [ ] sem regressões em rotas existentes
