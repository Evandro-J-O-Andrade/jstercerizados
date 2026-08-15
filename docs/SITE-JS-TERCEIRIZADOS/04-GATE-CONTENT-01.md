# GATE-CONTENT-01 — Especificação Técnica e Protocolo de Execução

**Projeto:** J&S Terceirizados  
**Baseline:** `b931c3b`  
**Data:** 2026-08-15  
**Status:** PRÓXIMO GATE  
**Documento pai:** `docs/SITE-JS-TERCEIRIZADOS/03-MAPA-MESTRE-PROJETO.md`

---

## 1. GATE-ARCH-01 — Auditoria de Duplicatas e Dependências

### 1.1 Objetivo

Mapear todos os **63 arquivos `.js`** duplicados em relação aos seus equivalentes `.ts`/`.tsx` e determinar exatamente:

- Qual é a fonte de verdade efetiva
- Quais são realmente órfãos
- Quais possuem divergência funcional
- Quais estão conectados indiretamente por imports, rotas, scripts ou configurações

### 1.2 Restrições absolutas

O agente de desenvolvimento (Kilo) **ESTÁ PROIBIDO** de:

| Ação                               | Status      |
| ---------------------------------- | ----------- |
| Alterar conteúdo de `.js` ou `.ts` | ❌ PROIBIDO |
| Mover arquivos                     | ❌ PROIBIDO |
| Renomear arquivos                  | ❌ PROIBIDO |
| Deletar arquivos                   | ❌ PROIBIDO |
| Fazer `git rm`                     | ❌ PROIBIDO |
| Fazer `git mv`                     | ❌ PROIBIDO |
| Executar `git clean`               | ❌ PROIBIDO |
| Executar `git reset --hard`        | ❌ PROIBIDO |
| Executar `git rebase`              | ❌ PROIBIDO |
| Substituir componentes funcionais  | ❌ PROIBIDO |
| Reconstruir páginas existentes     | ❌ PROIBIDO |

**Permissões:**

- ✅ Leitura de arquivos
- ✅ Análise de imports e referências
- ✅ Geração de relatório
- ✅ Consulta a `git grep`, `rg`, `findstr`
- ✅ Análise de `vite.config.ts`, `tsconfig.json`, `package.json`
- ✅ Análise de testes e scripts

### 1.3 Metodologia de auditoria

#### Passo 1: Enumeração

```bash
# Contar arquivos .js duplicados
find src -name "*.js" | wc -l

# Listar todos os .js com seus equivalentes .ts
for f in $(find src -name "*.js"); do
  ts="${f%.js}.ts"
  tsx="${f%.js}.tsx"
  if [ -f "$ts" ]; then
    echo "JS: $f | TS: $ts"
  elif [ -f "$tsx" ]; then
    echo "JS: $f | TSX: $tsx"
  else
    echo "JS: $f | TS: NÃO EXISTE"
  fi
done
```

#### Passo 2: Verificação de imports

```bash
# Verificar se algum arquivo .tsx importa .js
grep -r "from '.*\.js'" src/ --include="*.tsx" --include="*.ts"

# Verificar imports sem extensão que possam resolver para .js
grep -r "from '@/.*" src/ --include="*.tsx" --include="*.ts" | grep -v "\.ts['\"]"
```

#### Passo 3: Verificação de referências indiretas

```bash
# Verificar se .js é referenciado em configurações
grep -r "\.js" vite.config.ts tsconfig.json package.json scripts/

# Verificar se há testes que dependem de .js
find . -name "*.test.*" -o -name "*.spec.*" | xargs grep -l "\.js" 2>/dev/null

# Verificar se há documentação referenciando .js
grep -r "\.js" docs/ --include="*.md" | grep -v "node_modules"
```

#### Passo 4: Comparação de conteúdo

Para cada par `.js`/`.ts`:

- Verificar se são idênticos (hash ou diff)
- Identificar divergências funcionais
- Documentar qual versão está mais atualizada

#### Passo 5: Classificação

Classificar cada `.js` em uma das categorias:

| Categoria     | Ícone | Critério                                                               |
| ------------- | ----- | ---------------------------------------------------------------------- |
| **ACTIVE**    | 🟢    | Importado diretamente por código TypeScript em produção                |
| **FUTURE**    | 🔵    | Referenciado em configurações, scripts ou documentação para uso futuro |
| **LEGACY**    | 🟡    | Não importado, mas contém lógica que pode ser necessária após migração |
| **ORPHAN**    | 🔴    | Não importado, não referenciado, duplicata exata do `.ts`              |
| **DIVERGENT** | ⚠️    | `.js` e `.ts` têm conteúdo diferente                                   |

### 1.4 Saída esperada

Arquivo: `docs/SITE-JS-TERCEIRIZADOS/04-AUDITORIA-DUPLICATAS-JS.md`

Formato:

```markdown
# Auditoria de Duplicatas .js

## Resumo

| Métrica                | Valor |
| ---------------------- | ----- |
| Total de .js auditados | 63    |
| 🟢 ACTIVE              | X     |
| 🔵 FUTURE              | X     |
| 🟡 LEGACY              | X     |
| 🔴 ORPHAN              | X     |
| ⚠️ DIVERGENT           | X     |

## Por categoria

### animations

| Arquivo .js | Equivalente .ts | Classificação | Observações |
| ----------- | --------------- | ------------- | ----------- |

### components

| Arquivo .js | Equivalente .ts | Classificação | Observações |
| ----------- | --------------- | ------------- | ----------- |

### config

| Arquivo .js | Equivalente .ts | Classificação | Observações |
| ----------- | --------------- | ------------- | ----------- |

### ...

## Recomendações

### Remoção imediata (ORPHAN)

- [ ] Lista de arquivos

### Análise manual (LEGACY)

- [ ] Lista de arquivos

### Correção urgente (DIVERGENT)

- [ ] Lista de arquivos

### Manutenção (FUTURE)

- [ ] Lista de arquivos
```

### 1.5 Critérios de conclusão do GATE-ARCH-01

- [ ] Todos os 63 arquivos `.js` foram auditados
- [ ] Nenhum arquivo foi alterado, movido ou deletado
- [ ] Relatório `04-AUDITORIA-DUPLICATAS-JS.md` gerado
- [ ] Comite-se APENAS o relatório de auditoria
- [ ] Nenhuma ação de limpeza executada antes de aprovação explícita

---

## 2. GATE-CONTENT-01 — Conteúdo e Arquitetura Comercial

### 2.1 Objetivo

Congelar a **hierarquia comercial**, o **posicionamento de conteúdo** e a **arquitetura de serviços** do site J&S Terceirizados.

**NÃO é objetivo:** alterar CSS, componentes visuais ou implementar funcionalidades novas.

### 2.2 Hierarquia Comercial

A J&S Terceirizados opera em **três eixos estratégicos**:

```
J&S TERCEIRIZADOS
│
├── EIXO 1 — CONSULTORIA EM RH (Carro-chefe)
│   ├── Recrutamento e Seleção
│   ├── Mão de Obra Temporária
│   ├── Mão de Obra Efetiva
│   ├── Banco de Talentos
│   ├── Assessoria em RH
│   ├── Processo de RH
│   └── Hunting de Executivos
│
├── EIXO 2 — FACILITIES / TERCEIRIZAÇÃO (Linha complementar)
│   ├── Limpeza Profissional
│   ├── Limpeza de Manutenção
│   ├── Limpeza de Vidros
│   ├── Limpeza de Fachadas
│   ├── Limpeza Pré-Mudança
│   ├── Limpeza Pós-Mudança
│   ├── Limpeza Higienização
│   ├── Faxina / Faxina Diarista
│   ├── Jardinagem e Paisagismo
│   ├── Zeladoria e Manutenção
│   ├── Segurança Patrimonial
│   └── Terceirização de Serviços
│
└── EIXO 3 — PLATAFORMA SaaS (Modelo de negócio)
    ├── Vagas (Portal de vagas)
    ├── Candidatos (Banco de talentos)
    ├── Empresas (Área empresarial)
    ├── Parceiros (Rede de parceiros)
    ├── Fornecedores (Cadastro de fornecedores)
    └── Solicitações de Serviço
```

### 2.3 Regras de posicionamento

| Regra                         | Descrição                                                              |
| ----------------------------- | ---------------------------------------------------------------------- |
| **RH é carro-chefe**          | Todo conteúdo, SEO e CTAs devem priorizar RH como identidade principal |
| **Facilities é complementar** | Nunca apresentar Facilities como negócio principal                     |
| **Plataforma é o meio**       | O modelo SaaS é a forma de entrega, não o produto final                |
| **Identidade unificada**      | Nunca fragmentar a marca em "JRH" + "J Facilities"                     |
| **Nomenclatura consistente**  | Usar apenas termos da tabela acima                                     |

### 2.4 Arquitetura de Serviços — Padrão "Mini-card to Detail"

```
Página /servicos
├── Mini-card: Limpeza de Fachada
│   ├── Imagem curta
│   ├── Título
│   ├── Descrição (1-2 linhas)
│   └── CTA: "Saiba mais" → /servicos/limpeza-de-fachada
│
└── Página /servicos/limpeza-de-fachada
    ├── Hero do serviço
    ├── Descrição completa
    ├── Benefícios
    ├── Como funciona
    ├── Aplicações
    ├── Galeria
    └── CTA: "Solicitar orçamento" → ServiceRequestForm
```

#### Regras do padrão

| Item                | Regra                                                     |
| ------------------- | --------------------------------------------------------- |
| Slug                | `kebab-case` em português: `/servicos/limpeza-de-fachada` |
| Imagem              | Uma imagem principal por serviço                          |
| Descrição mini-card | Máximo 100 caracteres                                     |
| Página de detalhe   | Estrutura padronizada                                     |
| CTA                 | Sempre "Solicitar orçamento" ou "Saiba mais"              |
| Formulário          | `ServiceRequestForm` com contexto do serviço              |

### 2.5 Motor de Formulários — Estratégia

#### Princípio

Um formulário reutilizável por tipo de intenção, não por página.

#### Arquitetura

```
components/forms/
├── ServiceRequestForm.tsx       # Solicitação de serviço (facilities)
├── CompanyLeadForm.tsx          # Lead empresarial (RH/consultoria)
├── JobApplicationForm.tsx       # Candidatura a vaga
├── CandidateForm.tsx            # Cadastro de candidato
├── SupportForm.tsx              # Suporte técnico
└── ContactForm.tsx              # Contato geral
```

#### Campos obrigatórios LGPD

Todos os formulários devem incluir:

| Campo                  | Tipo     | Obrigatório | Validação                |
| ---------------------- | -------- | ----------- | ------------------------ |
| Nome completo          | text     | Sim         | Min 3 chars              |
| E-mail                 | email    | Sim         | Formato válido           |
| Telefone               | tel      | Sim         | Min 10 chars             |
| Aceite LGPD            | checkbox | Sim         | true                     |
| Preferência de contato | select   | Não         | WhatsApp/E-mail/Telefone |
| Origem do lead         | hidden   | Sim         | serviceSlug/pageSlug     |

#### Regras de validação

- **Frontend:** Zod + React Hook Form
- **Sanitização:** `utils/sanitize.ts` — preservar emojis e quebras de linha, remover caracteres de controle
- **Feedback:** Mensagens amigáveis, nunca erros técnicos brutos
- **Loading:** Botão desabilitado + spinner
- **Success:** Mensagem de confirmação + redirecionamento
- **Error:** Fallback genérico + log interno

### 2.6 Estratégia Editorial — Blog → J&S Insights

#### Rebranding

| Elemento       | Antes               | Depois                      |
| -------------- | ------------------- | --------------------------- |
| Nome           | Blog                | J&S Insights                |
| Posicionamento | Blog genérico de RH | Hub de conteúdo estratégico |
| Foco           | Dicas de carreira   | Conhecimento aplicado       |

#### Categorias

| Categoria              | Slug                     | Conteúdo                                             |
| ---------------------- | ------------------------ | ---------------------------------------------------- |
| Carreira               | `/insights/carreira`     | Desenvolvimento profissional, entrevistas, currículo |
| RH para Empresas       | `/insights/rh-empresas`  | Gestão de pessoas, legislação, benefícios            |
| Mão de Obra Temporária | `/insights/mao-de-obra`  | Temporário, efetivo, sazonal                         |
| Mão de Obra Efetiva    | `/insights/efetivo`      | CLT, benefícios, retenção                            |
| Facilities             | `/insights/facilities`   | Limpeza, manutenção, jardinagem                      |
| Recrutamento           | `/insights/recrutamento` | Seleção, hunting, banco de talentos                  |
| Segurança              | `/insights/seguranca`    | Segurança patrimonial, portaria                      |
| Mercado de Trabalho    | `/insights/mercado`      | Tendências, salários, profissões                     |

### 2.7 Protocolo de Privacidade e Termos

#### Princípio

Nunca inventar texto jurídico. Preparar estrutura que identifique pontos de coleta para validação jurídica.

#### Mapa de coleta de dados

| Ponto de coleta        | Dados                             | Finalidade           | Base legal    |
| ---------------------- | --------------------------------- | -------------------- | ------------- |
| Cadastro de candidato  | Nome, e-mail, telefone, currículo | Candidatura          | Consentimento |
| Cadastro de empresa    | CNPJ, e-mail, telefone, endereço  | Cadastro empresarial | Contrato      |
| Solicitação de serviço | Nome, e-mail, telefone, serviço   | Orçamento            | Consentimento |
| Candidatura a vaga     | Nome, e-mail, telefone, currículo | Recrutamento         | Consentimento |
| Contato                | Nome, e-mail, telefone, mensagem  | Atendimento          | Consentimento |
| Divulgar vaga          | Nome, e-mail, telefone, vaga      | Publicação de vaga   | Contrato      |
| Chat IA                | Nome, mensagem, contexto          | Atendimento          | Consentimento |
| WhatsApp               | Nome, telefone, mensagem          | Atendimento          | Consentimento |

#### Ação

- Gerar estrutura HTML com placeholders `[VALIDAR COM JURÍDICO]`
- Não criar texto definitivo sem aprovação
- Documentar pontos de coleta para advogado

---

## 3. Regras de Desenvolvimento e Workflow

### 3.1 Regra "Sem Reconstrução"

> **O projeto está em fase de refinamento e conexão, não de reconstrução.**
>
> Nenhum componente funcional pode ser substituído ou removido sem:
>
> 1. Justificativa técnica documentada
> 2. Registro no Mapa Mestre (`03-MAPA-MESTRE-PROJETO.md`)
> 3. Aprovação explícita do usuário
>
> Se existe um componente funcionando, **REFINAR**.

### 3.2 Regra "Premium CSS Proibido"

> **Premium CSS/UI enhancement é estritamente proibido até o fechamento do GATE-CONTENT-01.**
>
> A interface deve seguir o conteúdo, não o inverso.
>
> Proibido:
>
> - Alterar tokens de design
> - Modificar `src/styles/index.css`
> - Criar novos componentes visuais
> - Alterar Navbar, Footer, Hero, CinematicIntro
>
> Permitido:
>
> - Refinar textos
> - Ajustar posicionamento de conteúdo
> - Corrigir nomenclatura
> - Corrigir assets

### 3.3 Sequência de Gates

```
BASELINE (b931c3b)
    ↓
GATE 0 — Reconciliação e Mapa Mestre ✅
    ↓
GATE-ARCH-01 — Auditoria de Duplicatas .js ⏳ PRÓXIMO
    ↓
GATE-CONTENT-01 — Conteúdo e Arquitetura Comercial ⏳
    ↓
PREMIUM UI — Design System + CSS ⏳
    ↓
GATE-DATA-01 — Formulários + Fluxos ⏳
    ↓
GATE-SECURITY-01 — Segurança + RLS ⏳
    ↓
GATE-INTEGRATION-01 — Supabase + n8n + WhatsApp ⏳
    ↓
QA/PRODUCTION — Smoke test + deploy ⏳
```

### 3.4 Workflow obrigatório por gate

```
1. DIAGNÓSTICO (somente leitura)
   ├── git status
   ├── git log
   ├── git diff
   └── Auditoria de código

2. PLANEJAMENTO
   ├── Documento de especificação
   ├── Checklist de arquivos afetados
   ├── Critérios de aceite
   └── Aprovação do usuário

3. IMPLEMENTAÇÃO
   ├── Alterações isoladas
   ├── Um arquivo por vez
   ├── Validação após cada alteração

4. VALIDAÇÃO
   ├── npx tsc --noEmit
   ├── npm run build
   ├── git diff --check
   └── Smoke test funcional

5. COMMIT
   ├── Mensagem estruturada
   ├── Apenas arquivos relevantes
   └── Nada de screenshots/artefatos

6. RELATÓRIO
   ├── Arquivos alterados
   ├── Arquivos preservados
   ├── Problemas encontrados
   └── Próximos passos
```

### 3.5 Critérios de bloqueio

| Critério                                        | Bloqueia gate?      |
| ----------------------------------------------- | ------------------- |
| Erro TypeScript                                 | SIM                 |
| Erro de build                                   | SIM                 |
| Conflito Git não resolvido                      | SIM                 |
| Arquivo staged sem código                       | SIM                 |
| Componente funcional removido sem justificativa | SIM                 |
| Conteúdo de portal quebrado                     | SIM                 |
| Erro de console em produção                     | NÃO (documentar)    |
| Screenshot em commit                            | NÃO (remover antes) |

### 3.6 Nomenclatura e identidade

| Item            | Regra                                        |
| --------------- | -------------------------------------------- |
| Nome da empresa | J&S Empregos LTDA                            |
| Nome comercial  | J&S Terceirizados                            |
| Posicionamento  | Consultoria de RH + Mão de Obra + Facilities |
| Idioma          | Português Brasileiro (pt-BR)                 |
| Formatação      | `snake_case` para arquivos JS/TS             |
| Rotas           | `kebab-case` em português                    |

---

## 4. Ação Imediata

### 4.1 Antes de GATE-ARCH-01

```bash
# 1. Limpar screenshots staged
git reset HEAD smoke-home-mobile.png smoke-home.png
rm smoke-home-mobile.png smoke-home.png

# 2. Confirmar estado limpo
git status

# 3. Iniciar auditoria
# (somente leitura, sem alterações)
```

### 4.2 Durante GATE-ARCH-01

- Executar auditoria de duplicatas `.js`
- Gerar `04-AUDITORIA-DUPLICATAS-JS.md`
- Commitar APENAS o relatório
- Aguardar aprovação para próxima fase

### 4.3 Após GATE-ARCH-01

- Iniciar `GATE-CONTENT-01`
- Aplicar regras de posicionamento e nomenclatura
- Corrigir assets órfãos referenciados
- Atualizar conteúdo de páginas

---

## 5. Documentos de Referência

| Documento                | Caminho                                                    | Status        |
| ------------------------ | ---------------------------------------------------------- | ------------- |
| Mapa Mestre do Projeto   | `docs/SITE-JS-TERCEIRIZADOS/03-MAPA-MESTRE-PROJETO.md`     | ✅ CONCLUÍDO  |
| Auditoria de Duplicatas  | `docs/SITE-JS-TERCEIRIZADOS/04-AUDITORIA-DUPLICATAS-JS.md` | ⏳ PENDENTE   |
| GATE-CONTENT-01          | `docs/SITE-JS-TERCEIRIZADOS/04-GATE-CONTENT-01.md`         | ⏳ PENDENTE   |
| Relatório GATE-UX-SEC-01 | `docs/...`                                                 | ✅ CONCLUÍDO  |
| Design System            | `DESIGN_SYSTEM.md`                                         | 📚 REFERÊNCIA |
| Image Audit              | `IMAGE_AUDIT_REPORT.md`                                    | 📚 REFERÊNCIA |

---

## 6. Glossário

| Termo                      | Definição                                            |
| -------------------------- | ---------------------------------------------------- |
| **Baseline**               | Estado estável do projeto (`b931c3b`)                |
| **Gate**                   | Ponto de verificação obrigatório antes de avançar    |
| **Refatoração destrutiva** | Alteração que remove funcionalidade sem preservação  |
| **Refinamento**            | Alteração que melhora sem remover                    |
| **Órfão**                  | Arquivo/asset não referenciado por código ativo      |
| **Fonte de verdade**       | Versão canônica de um arquivo/conteúdo               |
| **Mini-card**              | Card resumido em página de listagem                  |
| **ServiceRequestForm**     | Formulário reutilizável para solicitações de serviço |

---

**Aprovado por:** [aguardando aprovação]  
**Próxima revisão:** Após GATE-ARCH-01
