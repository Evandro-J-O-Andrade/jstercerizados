# Backend — JSEmpregos

## Futuro: Supabase

O backend será construído com Supabase, utilizando:

- **PostgreSQL**: banco de dados relacional.
- **Authentication**: sistema de autenticação integrado.
- **Storage**: armazenamento de arquivos (PDFs, imagens).
- **Row Level Security (RLS)**: políticas de acesso por linha.
- **Realtime**: atualizações em tempo real.
- **Edge Functions**: funções serverless quando necessário.

## Tabelas Planejadas

| Tabela          | Descrição                                  |
| --------------- | ------------------------------------------ |
| `usuarios`      | Usuários do sistema (admin, manager, user) |
| `clientes`      | Clientes cadastrados                       |
| `orcamentos`    | Solicitações de orçamento                  |
| `servicos`      | Catálogo de serviços                       |
| `parceiros`     | Empresas parceiras                         |
| `fornecedores`  | Fornecedores cadastrados                   |
| `curriculos`    | Currículos de candidatos                   |
| `vagas`         | Vagas disponíveis                          |
| `contatos`      | Mensagens de contato                       |
| `uploads`       | Arquivos enviados                          |
| `logs`          | Logs de atividade                          |
| `configuracoes` | Configurações do sistema                   |

## Segurança

- RLS habilitado em todas as tabelas.
- Validação server-side com Zod.
- Sanitização de inputs.
- Rate limiting via Supabase.
- Proteção contra CSRF, XSS e SQL Injection.

## API Futura

- RESTful endpoints via Supabase.
- Webhooks para integração com n8n.
- Autenticação JWT via Supabase Auth.
