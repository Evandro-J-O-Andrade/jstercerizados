# 05 — Funcionalidades Audit

## 05.1 Funcionalidades implementadas

### ✅ Cinematic Showcase

- Animação 6.5s (black → entering → holding → closing)
- sessionStorage para não repetir
- Scroll lock
- Botão "Pular" secundário
- Reduced motion
- object-position responsivo

### ✅ SafeImage

- Fallback por categoria
- Fallback global
- Skeleton loading
- Error handling (onError → fallback → error UI)

### ✅ AccessibilityWidget

- Font size (10 escalas)
- High contrast
- Reduced motion
- Highlight links
- Increased spacing
- Focus mode
- TTS (Web Speech API)

### ✅ Chat IA (ChatWidget)

- Fluxo de opções (candidate/company/job_info/hire/human_support)
- Transição para HumanChatWidget

### ✅ Chat Humano (HumanChatWidget)

- Supabase realtime (chat_rooms, chat_messages)
- visitor_id persistido

### ✅ ServiceRequestForm

- Campos completos
- WhatsApp envio
- Confirmação visual

### ✅ Navbar + Footer + BottomNavigation

- Navegação desktop/mobile
- Footer com todos os links
- BottomNavigation mobile

## 05.2 Funcionalidades pendentes (roadmap)

### Chat IA → n8n

- [ ] Base de conhecimento conectada (FAQ, serviços, vagas)
- [ ] Integração LLM (OpenAI)
- [ ] Escalonamento automático via webhook n8n

### Área do candidato

- [ ] `/candidatos/login`
- [ ] `/candidatos/cadastro`
- [ ] `/candidatos/perfil`
- [ ] `/candidatos/candidaturas`
- [ ] `/candidatos/favoritas`

### Área da empresa

- [ ] `/empresas/login`
- [ ] `/empresas/dashboard`
- [ ] Publicar vaga
- [ ] Banco de currículos
- [ ] Acompanhar processos

### Formulários → Supabase

- [ ] ServiceRequestForm salva no Supabase (tabela `leads`)
- [ ] ServiceRequestForm envia webhook n8n
- [ ] JobApplicationForm salva candidatura

### Hero dinâmico

- [ ] Substituir HeroSplit por HeroDynamic (storytelling)
- [ ] Conteúdo HERO_STORY_SLIDES

### Timeline cinematográfica

- [ ] Revisar Sobre.tsx timeline
- [ ] Adicionar animações cinematográficas
- [ ] Imagens por marco

## 05.3 Priorização

| Feature                                 | Prioridade | Esforço |
| --------------------------------------- | ---------- | ------- |
| HeroDynamic (storytelling)              | Alta       | Médio   |
| ServiceRequestForm → Supabase + n8n     | Alta       | Médio   |
| Área do candidato (login/perfil)        | Alta       | Alto    |
| Chat IA → base de conhecimento          | Média      | Alto    |
| Timeline cinematográfica                | Média      | Médio   |
| Cards Home (mão de obra, terceirização) | Média      | Baixo   |
| Área da empresa (dashboard)             | Baixa      | Alto    |
| Fornecedor/Parceiro login               | Baixa      | Alto    |
