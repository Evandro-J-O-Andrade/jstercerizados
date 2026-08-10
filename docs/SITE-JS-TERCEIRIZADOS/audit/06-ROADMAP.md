# 06 — Roadmap

## Fase 1 — Fundamentos (2-3 dias)

### Prioridade: Alta

1. **HeroDynamic** (substituir HeroSplit)
   - Criar `src/content/heroStory.ts`
   - Componente `HeroDynamic.tsx`
   - Integrar na Home

2. **ServiceRequestForm → Supabase + n8n**
   - Criar tabela `leads` no Supabase
   - Substituir envio via WhatsApp por Supabase + webhook n8n
   - Manter WhatsApp como fallback

3. **Cards Home — Mão de obra + Terceirização**
   - Criar cards separados para "Mão de Obra Temporária", "Mão de Obra Efetiva", "Terceirização"
   - Integrar na Home

### Prioridade: Média

4. **Cleanup tech debt**
   - Remover `SHOWCASE_SLIDES` (obsoleto)
   - Remover `HERO_ASSETS.homeSlides` (obsoleto)
   - Remover `HERO_ASSETS.servicos`, `suporte`, `trabalheConosco` se não usados

5. **Corrigir typo "Contritar" → "Contratar"**
   - `src/content/homeHero.ts:31`
   - `src/content/homeHero.ts:88`

## Fase 2 — Plataforma (4-5 dias)

### Área do candidato

1. `/candidatos/login` — formulário de login (Supabase Auth)
2. `/candidatos/cadastro` — formulário de cadastro
3. `/candidatos/perfil` — perfil com currículo
4. `/candidatos/candidaturas` — lista de candidaturas
5. `/candidatos/favoritas` — vagas salvas

### Área da empresa

1. `/empresas/login` — login corporativo
2. `/empresas/dashboard` — dashboard com:
   - Publicar vaga
   - Banco de currículos
   - Acompanhar processos
   - Contratações

### Chat IA → n8n

1. Conectar base de conhecimento (FAQ, serviços)
2. Integração LLM (OpenAI via n8n)
3. Webhook de escalonamento → Slack

## Fase 3 — Polimento (3-4 dias)

### Timeline cinematográfica

1. Migrar timeline do Sobre para cinematográfica
2. Adicionar imagens por marco
3. Animações progressivas

### Hero storytelling

1. Implementar transições de imagem (cross-fade)
2. Animação de entrada do texto
3. Auto-play com pausa no hover

### Acessibilidade

1. Implementar layer separado (Backdrop + Panel)
2. Skip link
3. Landmarks ARIA
4. ESC para fechar modais

## Fase 4 — Integrações (2-3 dias)

### Supabase

1. Migrar mock de vagas → Supabase
2. Migrar mock de serviços → Supabase (opcional)
3. Realtime chat (já implementado)

### n8n

1. Webhook de leads → WhatsApp + e-mail
2. Webhook de chat escalation → atendente
3. Webhook de nova vaga → broadcast

## Fase 5 — QA + Produção (2 dias)

### Testes

1. Responsividade (360px, 375px, 390px, 414px, 768px, 1024px, 1280px, 1440px)
2. Acessibilidade (axe-core, manual)
3. Performance (Lighthouse)
4. Imagens (QA checklist)

### Checklist de imagem

- [ ] Sem overflow horizontal
- [ ] Sem scrollbar
- [ ] Sem deformação
- [ ] Dentro do container
- [ ] Sem empurrar conteúdo
- [ ] Sem quebra de layout
- [ ] Sem corte inadequado

## Cronograma sugerido

| Semana | Foco                                                |
| ------ | --------------------------------------------------- |
| 1      | Fase 1 (HeroDynamic, Formulário, Cards Home)        |
| 2      | Fase 2 (Área candidato + empresa — mvp)             |
| 3      | Fase 2 (continuação) + Fase 3 (Timeline, polimento) |
| 4      | Fase 4 (Integrações) + Fase 5 (QA)                  |
