# Como entregar o levantamento mestre ao Codex (VS Code)

1. Abra no VS Code somente o workspace do projeto **J&S Empregos LTDA** (`C:\NewWaveProjetos\jrtercerisados`, confirmado no último relatório local).
2. Salve o arquivo `LEVANTAMENTO_MESTRE_JS_EMPREGOS_CODEX_2026-11-07.md` dentro de `docs/check-bouler-24h/`, sem substituir o `AGENTS.md` da raiz e sem sobrescrever um arquivo existente homônimo sem conferir antes.
3. Abra o painel Codex, anexe/referencie esse Markdown pelo caminho e cole o texto de `PROMPT_CODEX_LEVANTAMENTO_MESTRE_2026-11-07.txt`.
4. Peça a primeira leitura sem implementar. Se o Codex quiser acessar Supabase, autorize separadamente conexão restrita ao projeto e modo read-only. Não copie senhas, SMTP password ou service_role no chat.
5. Devolva ao ChatGPT a saída do Codex com SHA, diffs, testes, evidências e pendências para sincronizar o próximo gate.

**O ZIP não foi gravado no seu repositório.** Arquivos aqui são para transferência manual; nenhum commit/push/deploy ou operação no Supabase ocorreu por causa do pacote.
