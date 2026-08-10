# 00 — Visão Geral

## Identidade Corporativa Obrigatória

- **Empresa:** J&S Empregos LTDA
- **Trading Name:** J&S Empregos LTDA
- **CNPJ:** 63.251.959/0001-10
- **Tagline:** "Mais eficiência em RH. Mais resultados para sua empresa."

> **REGRA CRÍTICA:** NUNCA alterar "J&S Empregos LTDA" para "J&S Terceirizados" ou qualquer variação.

## Posicionamento

**J&S Empregos LTDA = Assessoria em RH + Mão de Obra (Temporária/Efetiva) + Facilities + Terceirização**, com uma plataforma digital de relacionamento entre empresas, candidatos, parceiros e fornecedores.

- **RH é o carro-chefe comercial** (primeira jornada, prioridade absoluta na Home).
- **Facilities, terceirização, mão de obra** são linhas de negócio complementares — não devem ser esquecidas ou diminuídas.
- **Vagas/candidatos** = jornada de plataforma.
- **Empresas, parceiros, fornecedores** = ecossistema SaaS completo.

## Pilares que não podem ser perdidos

1. Cinematic Intro
2. Hero dinâmico ( storytelling por vertente de negócio )
3. Assessoria em RH como destaque inicial
4. Soluções em Facilities
5. Mão de Obra (temporária + efetiva)
6. Terceirização
7. Vagas em destaque
8. Como funciona (jornada do candidato)
9. Para Empresas (comercial)
10. Para Candidatos (área do candidato)
11. Clientes / Parceiros
12. Sobre + Timeline institucional
13. Blog
14. Chat IA + humano
15. Footer (existente — refinado, nunca reescrito)

## Tecnologias em uso

| Categoria            | Stack                                                        |
| -------------------- | ------------------------------------------------------------ |
| Framework            | React 18 + Vite                                              |
| Roteamento           | react-router-dom v6                                          |
| Animações            | Framer Motion                                                |
| UI                   | Tailwind CSS v4 + componentes custom                         |
| Ícones               | Lucide React                                                 |
| Backend-as-a-Service | Supabase (cliente configurado em `src/lib/supabase.ts`)      |
| Orquestração         | n8n (via webhook/WhatsApp)                                   |
| Imagens              | Componente `SafeImage` com fallback SVG                      |
| Chat Realtime        | `useRealtimeChat` hook + tabela `chat_rooms`                 |
| Formulários          | Componentes custom (`Input`, `Select`, `Textarea`, `Button`) |

## Regras de ouro

> **Nenhuma implementação pode eliminar uma funcionalidade existente apenas para simplificar a interface. Antes de remover, substituir ou esconder qualquer elemento, verificar se ele pertence ao escopo comercial ou funcional definido pelo cliente.**

> **O asset se adapta ao layout; o layout nunca deve ser quebrado para acomodar o asset.**

> **Nenhuma imagem pode: estourar horizontalmente / criar scrollbar / deformar / sair do container / empurrar conteúdo / quebrar o layout.**
