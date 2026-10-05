# Regra — Tamanhos e Layout

Data: 2026-10-04

## Decisão

Não alterar tamanhos, alturas, larguras, espaçamentos ou proporções de componentes/páginas sem ordem explícita do usuário.

## Escopo

Aplica-se a qualquer ajuste visual ou estrutural envolvendo:

- `min-height`, `height`, `max-height`
- `min-width`, `max-width`
- `padding`, `margin`, `gap`
- `aspect-ratio`, `object-fit`
- grids, colunas, linhas, `items-stretch`, `items-center`
- tipografia (`text-*`, `leading-*`)
- cards, containers, seções e blocos visuais

## Exceção

Só é permitido mexer nesses elementos quando houver uma instrução clara e específica do usuário apontando:

- componente alvo;
- página/rota alvo;
- problema observado;
- solução desejada.

## Estado atual

Qualquer alteração anterior nesses itens foi feita sob solicitação direta e não cria precedente para ajustes futuros semelhantes.

## Registro

Essa regra tem prioridade sobre iniciativas de padronização visual espontânea.
