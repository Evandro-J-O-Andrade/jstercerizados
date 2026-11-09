# Instalação do kit de contexto para Codex no VS Code

## O que este kit faz

É uma **passagem explícita de contexto**. O Codex poderá ler o handoff e os arquivos do repositório aberto no VS Code; ele **não recebe automaticamente** as conversas pessoais deste ChatGPT, memória nem os conectores autenticados aqui.

## Instalação manual (sem alterar código do projeto)

1. Salve/baixe `CODEX_HANDOFF_JS_EMPREGOS_2026-11-07.md`.
2. Abra no VS Code a raiz **correta** do projeto J&S; confirme que existe `AGENTS.md` e `src/core/dispatcher/DispatcherMaster.ts`.
3. Coloque o handoff em `docs/check-bouler-24h/CODEX_HANDOFF_JS_EMPREGOS_2026-11-07.md`. Essa cópia é uma **alteração documental local**; não execute commit/push sem autorização.
4. **Não substitua** o `AGENTS.md` que já existe. Ele contém regras críticas.
5. Abra o painel Codex e cole o conteúdo de `PROMPT_INICIAL_CODEX_JS_EMPREGOS.txt`. Caso o Codex não encontre o arquivo por nome, indique o caminho completo no workspace.
6. Peça exclusivamente auditoria inicial de leitura. Só depois da resposta verificada, aprove uma tarefa por vez.

## Acesso real ao Supabase, se/quando aprovado

No Codex (instalação/conexão separada), use o MCP oficial Supabase com **scope de projeto e read-only**:

`https://mcp.supabase.com/mcp?project_ref=okxqfyoqbhcmflpurfrw&read_only=true`

A conexão requer consentimento/autenticação do titular. Não cole service-role key, PAT, senhas de SMTP ou arquivos `.env` no chat.

## Sincronização contínua

Ao término de uma atividade Codex, peça um resumo com: branch/HEAD, status, arquivos alterados, testes e exit codes, falhas, decisões, pendências, mudanças de schema (se houver autorização), autorizações utilizadas. Cole esse resumo no ChatGPT para sincronizar os dois ambientes.

**Atenção:** este kit não faz nenhuma alteração remota, não concede permissões extras e não substitui as normas do repositório.
