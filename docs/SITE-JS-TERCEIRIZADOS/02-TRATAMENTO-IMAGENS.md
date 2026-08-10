# Regras de Tratamento de Imagens

**Projeto:** J&S Empregos Ltda.  
**Vigência:** obrigatória para todo o projeto.  
**Escopo:** qualquer componente que exiba imagem.

---

## Regra geral

NENHUMA imagem pode estourar o viewport ou deformar o layout.

Isso vale para:

- Cinematic Intro
- Hero
- Hero dinâmico
- Cards de serviços
- Cards de vagas
- Timeline
- Sobre Nós
- Parceiros
- Blog
- Footer, quando houver imagens
- Mobile
- Desktop

A imagem deve sempre respeitar o container onde está sendo exibida.

### Regras

1. Nunca permitir overflow horizontal.
2. Nunca distorcer a proporção original da imagem.
3. Nunca permitir que a imagem ultrapasse o container.
4. O container deve controlar a proporção.
5. Utilizar `object-fit` de acordo com o contexto.

- Para imagens fotográficas em cards: `object-fit: cover`
- Para imagens institucionais onde todo o conteúdo precisa aparecer: `object-fit: contain`
- Para a Cinematic Intro: preencher a área disponível sem ultrapassar o viewport, usando `width: 100%`, `height: 100%`, `object-fit: cover` e `object-position` adequado.

---

## Cinematic Intro

A imagem `cardheros` deve ser adaptada ao viewport.

- Desktop: preencher a área cinematográfica; sem overflow; sem deformação; sem barras inesperadas.
- Tablet: recalcular proporção; manter enquadramento.
- Mobile: adaptar o enquadramento; reduzir escala se necessário; garantir que nenhum elemento seja cortado de maneira prejudicial.

Se a proporção da imagem não for adequada para determinado viewport, não esticar a imagem. Utilizar crop controlado com `object-fit: cover` ou uma versão específica do asset.

### object-position por viewport

A imagem cinematográfica é especial. A composição da foto pode exigir posicionamento específico:

- Desktop: `object-position: center 35%`
- Tablet: `object-position: center 40%`
- Mobile: `object-position: 60% center`

Isso deve ser aplicado sem alterar o asset original.

---

## Fallback

Se a imagem não carregar, mostrar fallback visual corporativo. O fallback também deve respeitar o container, não gerar overflow, funcionar em light/dark, manter proporção e não possuir texto duplicado.

---

## QA

Testar imagens em:

- 360px
- 375px
- 390px
- 414px
- 768px
- 1024px
- 1280px
- 1440px

Nenhuma imagem pode:

- [ ] estourar horizontalmente
- [ ] criar scrollbar
- [ ] deformar
- [ ] sair do container
- [ ] empurrar conteúdo
- [ ] quebrar o layout
- [ ] ficar cortada de maneira inadequada
