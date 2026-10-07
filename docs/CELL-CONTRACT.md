# CELL CONTRACT — J&S EMPREGOS LTDA

Data: 2026-10-06  
Branch: main @ 1f75702  
Escopo: contrato arquitetural obrigatório para todas as células/módulos do SaaS.  
Modo: somente leitura. Nenhum arquivo alterado.

---

## 1. PROPÓSITO

Definir o que significa uma célula estar **completa, isolada e pronta para produção**.

Este contrato se aplica a toda célula/módulo do SaaS, seja ela:
- já existente (`candidato`, `recrutamento`, `suporte`);
- wrapper a ser reconstruído (`empresas`, `servicos`, `financeiro`, `fiscal`, `estoque`, `operacoes`, `pos`, `rh`);
- nova célula a ser criada no futuro.

---

## 2. ESTRUTURA ALVO DE PASTA

```text
src/modules/<modulo>/
├── dashboard/
├── pages/
├── components/
├── forms/
├── hooks/
├── repositories/
├── services/
├── types/
├── validation/
├── permissions/
├── routes/
├── navigation/
├── media/
└── tests/
```

### Regras
- Pasta ausente = `N/A` para esse artefato.
- Nenhuma célula cria pasta “só porque o contrato existe”.
- O contrato registra a estrutura real e a esperada.

---

## 3. CONTRATO FUNCIONAL

| Contrato | Obrigatório | Observação |
|---|---:|:---|
| Dashboard próprio | ✅ | Cada célula expõe sua visão operacional |
| Rotas próprias | ✅ | Declaradas em `routes/index.ts` |
| Sidebar/navigation própria | ✅ | Exceto quando a célula usar `ModuleSidebar` padrão |
| Listagem | quando aplicável | Nem toda célula tem listagem |
| CRUD real | quando aplicável | Se a entidade existe, CRUD deve existir |
| Formulários | quando aplicável | Criação/edição com validação |
| Validação | ✅ | Zod/Yup/schemas; erros por campo |
| Repository/Service | ✅ | Sem acesso direto ao Supabase na UI |
| Permission Check | ✅ | `PermissionGuard` ou equivalente por ação |
| RLS | ✅ | Reforço no banco; frontend não é fonte da verdade |
| Loading | ✅ | Dentro do `ContentBoundary` da célula |
| Empty state | ✅ | Componente próprio ou `EmptyState` |
| Error state | ✅ | Com retry/back |
| Feedback de operação | ✅ | Sucesso/erro após mutations |
| Fallback | ✅ | Dados, imagens, componentes |
| Responsividade | ✅ | Mobile/tablet/desktop |
| Testes | ✅ | Unidade e/ou integração |
| Mídia | quando aplicável | Se há logo/hero/galeria |
| Auditabilidade | ✅ | Logs, rastreabilidade |

---

## 4. REGRA DE ISOLAMENTO

### 4.1 Proibido
Uma célula **não pode** importar:
- componentes internos de outra célula;
- repositories de outra célula;
- services de outra célula;
- types de domínio de outra célula;
- regras de negócio espalhadas em `shared/`.

### 4.2 Permitido
Uma célula pode depender exclusivamente de:
- **Core contracts**: Auth, Identity, Tenant, RBAC, Permissions, Notifications, Upload infrastructure, Form primitives, CRUD primitives, Layout primitives, Error boundaries;
- **Supabase**: via repository próprio;
- **Tipos globais**: `MediaAsset`, `PageTemplate`, `NavigationItem` (somente os que são realmente transversais).

### 4.3 Comunicação entre células
Se duas células precisam trocar dados, isso deve acontecer por:
- **contrato explícito** em `shared/contracts/` ou `core/contracts/`;
- **evento/mensagem** (futuro);
- **query direta ao banco via repository próprio** (cada célula consulta o que precisa, sem compartilhar repository).

**Nunca** por importação acidental de pasta interna.

---

## 5. CORE ≠ MÓDULO

### 5.1 Core pode fornecer
- Auth/session
- Identity
- Tenant/context
- RBAC/permissions
- Notifications
- Upload infrastructure
- Form primitives
- CRUD primitives
- Layout primitives
- Error boundaries
- Navegação global
- Media resolver/fallback resolver

### 5.2 Core NÃO deve fornecer
- Regra de Empresas
- Regra de Vagas
- Regra de Candidatos
- Regra de Parceiros
- Regra de Fornecedores
- Regra de Serviços
- Regra de Recrutamento
- Regra de RH
- Regra de Financeiro
- Regra de Estoque
- Regra de Fiscal
- Regra de Operações
- Regra de POS

Essas regras pertencem às respectivas células.

---

## 6. PERMISSION CONTRACT

Toda operação protegida segue:

```text
UI
 ↓
Permission Check
 ↓
Repository / Service
 ↓
Supabase
 ↓
RLS
```

Proibido:
```text
UI
 ↓
Supabase direto
```

Regras:
- `role` ≠ `módulo`
- `role` ≠ `combinação de permissões`
- Uma pessoa pode ter múltiplos contextos/perfis
- Permissões são granulares e por ação
- Frontend controla UX, banco controla segurança

---

## 7. ESTADOS OBRIGATÓRIOS

Cada tela operacional deve declarar:

| Estado | Obrigatório | Observação |
|---|---:|:---|
| Initial | ✅ | Estado inicial da página |
| Loading | ✅ | Com spinner/skeleton |
| Success | ✅ | Dados carregados |
| Empty | ✅ | Nenhum registro encontrado |
| Error | ✅ | Com mensagem + retry/back |
| Unauthorized | ✅ | Sem permissão |
| Forbidden | ✅ | Permissão insuficiente |
| Not Found | ✅ | Entidade não encontrada |
| Submitting | ✅ | Form em envio |
| Success Feedback | ✅ | Toast/inline após mutation |
| Failure Feedback | ✅ | Toast/inline após erro |
| Fallback | ✅ | Dados/imagens/componentes |

Proibido:
- botão que chama função e nada acontece;
- erro genérico sem retry;
- loading grudado no shell/header/sidebar.

---

## 8. MEDIA CONTRACT

### 8.1 Tipos de mídia
| Tipo | Destino | Versionamento |
|---|---|---|
| Assets estáticos do produto | Git/public | Sim |
| Logo/branding oficial | Git/public | Sim |
| Imagens públicas estáveis | Git/public | Sim |
| Mídia administrável | Supabase Storage + `media_assets` | Não |
- Upload de usuário | Supabase Storage + `media_assets` | Não |
| Conteúdo editorial gerenciável | Supabase Storage + `media_assets` | Não |

### 8.2 Contrato por célula
Cada célula que usa mídia deve declarar:
- `media source`: Git/public ou Supabase;
- `logical key`: `logo`, `hero`, `gallery`, `card`, `banner`, etc.;
- `upload permission`: quem pode enviar;
- `storage location`: path no Storage;
- `fallback`: imagem padrão quando não há asset;
- `validation`: tipo/tamanho/extensão;
- `size/type constraints`: limites;
- `deletion behavior`: hard delete, soft delete, archive.

### 8.3 Resolvedor
A célula **não** deve conhecer:
- extensão do arquivo (`.jpg`, `.png`, `.webp`);
- path físico no Storage;
- URL pública.

Ela pergunta por `purpose` e recebe a URL pronta.

---

## 9. NÚCLEO / CABEÇA

O Core é mínimo e estável:

```text
CORE
├── auth/
├── identity/
├── tenant/
├── permissions/
├── notifications/
├── upload/
├── audit/
├── navigation/
└── layout/
```

Qualquer regra de negócio específica de módulo **não** entra no Core.

---

## 10. TESTES

Cada célula deve ter:
- testes de repository (integração com Supabase, read-only);
- testes de hook (comportamento assíncrono, loading, erro);
- testes de formulário (validação, submit, cancelamento);
- testes de permissão (render vs não render);
- testes de estado (loading, empty, error, success).

Testes não obrigatórios:
- snapshot de UI toda (fragilidade excessiva);
- testes E2E na fase de construção da célula.

---

## 11. ROLLBACK / RESILIÊNCIA

- Mutations devem ter estado anterior preservado ou explícito de otimistic update;
- Em caso de erro, estado anterior é restaurado;
- Não deixar estado “zombie” após falha;
- Loading não bloqueia shell inteiro.

---

## 12. CRITÉRIO DE CONFORMIDADE

| Status | Significado |
|---|---|
| 🟢 Conforme | Implementado e validado |
| 🟡 Parcial | Implementado com gaps |
| 🔴 Ausente/quebrado | Não existe ou não funciona |
| ⚪ N/A | Não aplicável a essa célula |
| 🔵 Bloqueado por dependência | Aguarda Core/outra célula |

---

## 13. REGRA FINAL

Nenhuma célula é considerada pronta para produção enquanto **qualquer item obrigatório** deste contrato estiver `🔴` ou `🔵`.

Alterações neste contrato devem ser documentadas em `docs/CELL-CONTRACT.md` e comunicadas a todas as células.
