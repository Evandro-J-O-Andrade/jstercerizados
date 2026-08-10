# Documentação do Projeto J&S Empregos

Esta pasta contém a documentação mestra do projeto.

## Estrutura

```
docs/
└── SITE-JS-Empregos/
    ├── 00-VISAO-GERAL.md          # Documento mestre de arquitetura e regras
    ├── pages/                      # Documentos por página
    │   ├── HOME.md
    │   ├── EMPRESAS.md
    │   ├── CANDIDATOS.md
    │   ├── VAGAS.md
    │   ├── VAGA-DETALHE.md
    │   ├── SERVICOS.md
    │   ├── SERVICO-DETALHE.md
    │   ├── SOBRE.md
    │   ├── BLOG.md
    │   ├── CONTATO.md
    │   ├── SUPORTE.md
    │   ├── PARCEIROS.md
    │   ├── FORNECEDORES.md
    │   ├── CLIENTES.md
    │   ├── LOGIN.md
    │   ├── DASHBOARD.md
    │   └── TRABALHE-CONOSCO.md
    ├── architecture/              # Documentos de arquitetura técnica
    │   ├── COMPONENTS.md
    │   ├── FORMS.md
    │   ├── ACCESSIBILITY.md
    │   ├── CHAT.md
    │   ├── SUPABASE.md
    │   └── SEO.md
    └── content/                   # Documentos de conteúdo
        ├── COMPANY.md
        ├── SERVICES.md
        ├── HOME.md
        └── ABOUT.md
```

## Regra de Uso

1. **Sempre ler `00-VISAO-GERAL.md` antes de implementar qualquer página.**
2. **Não remover funcionalidades existentes sem autorização.**
3. **Trabalhar uma página por vez.**
4. **Documentar divergências antes de implementar.**
5. **Executar typecheck e build após cada alteração.**
