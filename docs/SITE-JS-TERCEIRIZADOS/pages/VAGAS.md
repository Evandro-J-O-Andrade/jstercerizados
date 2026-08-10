# VAGAS — Arquitetura e Implementação

## Rotas

| Rota           | Descrição                        |
| -------------- | -------------------------------- |
| `/vagas`       | Lista todas as vagas com filtros |
| `/vagas/:slug` | Página individual da vaga        |

## Lista de vagas (`/vagas`)

### Filtros

```text
[Buscar por palavra-chave ]
[Área      ▼]
[Cidade    ▼]
[Estado    ▼]
[Tipo de contrato ▼]
[Modalidade ▼]
[Salário mínimo ▼]
```

### Lista (cards)

Cada card mostra:

- titulo
- empresa
- cidade, estado
- tipoContrato
- modalidade
- salarioMin / salarioMax
- beneficios (ícones)
- dataPublicacao

Botão: "Ver vaga" → `/vagas/:slug`

### Dados

Atualmente mockados (`src/services/mock/vagas.ts`).
Futuro: `supabase.from('vagas').select('*')`

## Detalhe da vaga (`/vagas/:slug`)

### Estrutura

```text
Breadcrumb: Home > Vagas > {titulo}
```

#### Hero

```text
{titulo}
{tipoContrato} · {cidade}, {estado}
[Modalidade: PRESENCIAL/HÍBRIDO/REMOTO]
```

#### Informações

- **Descrição completa** (markdown)
- **Requisitos** (lista)
- **Benefícios** (lista)
- **Salário** (faixa)
- **Vagas disponíveis** (número)
- **Data de publicação**

#### Ação

```text
[Candidatar-se] → JobApplicationForm
```

### JobApplicationForm

`src/components/forms/JobApplicationForm.tsx`

Campos:

- nome
- email
- telefone
- currículo (upload)
- mensagem

Fluxo:

```text
Formulário
  ↓
POST → n8n / Supabase (candidaturas table)
  ↓
Confirmação: "Candidatura recebida!"
```

## Vaga type (schema)

```ts
interface Vaga {
  id: string;
  slug: string;
  titulo: string;
  empresa: string;
  cidade: string;
  estado: string;
  tipoContrato:
    'CLT' | 'ESTAGIO' | 'TEMPORARIO' | 'FREELA' | 'TERCEIRIZADO' | 'CD';
  nivel: 'ESTAGIO' | 'JUNIOR' | 'PLENO' | 'SENIOR' | 'MASTER' | 'LIDERANCA';
  salarioMin?: number;
  salarioMax?: number;
  modalidade: 'PRESENCIAL' | 'HIBRIDO' | 'REMOTO';
  beneficios: string[];
  requisitos: string;
  descricao: string;
  vagas: number;
  status: 'BORRAR' | 'ATIVA' | 'ARQUIVADA' | 'CONTRATADA';
  dataPublicacao: string;
}
```
