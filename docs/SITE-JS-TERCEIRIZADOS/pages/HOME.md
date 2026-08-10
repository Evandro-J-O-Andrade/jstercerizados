# HOME

**Rota:** `/`
**Status:** Em evolução
**Referência:** `docs/SITE-JS-Empregos/00-VISAO-GERAL.md`

## Objetivo

Página comercial principal. Posicionar a J&S como assessoria em RH e agência de empregos, gerando leads para empresas e cadastros para candidatos.

## Público

- Empresas que precisam contratar
- Candidatos buscando oportunidades

## Seções

1. Hero split (texto esquerda + imagem direita)
2. Nossa atuação / serviços em destaque
3. Assessoria em RH
4. Facilities / Terceirização
5. Para Candidatos
6. Vagas em Destaque
7. Como Funciona
8. Diferenciais
9. Empresas que confiam
10. Números da empresa (PENDING CLIENT VERIFICATION)
11. Para Empresas
12. Blog
13. CTA Final
14. Footer

## Componentes

- `HeroSplit`
- `HeroImageFallback`
- `ServiceCard`
- `NumberCounter`
- `Section`
- `Container`

## Dados

- `src/services/mock/vagas.ts` — vagas em destaque
- `src/services/mock/services.ts` — serviços em destaque
- `src/mock/partners.ts` — logos de parceiros
- `src/config/company.ts` — números e identidade

## Checklist

- [ ] Hero com frase principal do cliente
- [ ] CTAs corretos
- [ ] Serviços organizados por prioridade
- [ ] Vagas em destaque com link para `/vagas/:slug`
- [ ] Diferenciais sem "Banco de Talentos" como destaque
- [ ] Responsivo mobile/desktop
- [ ] Dark/light testado
- [ ] Acessibilidade testada
