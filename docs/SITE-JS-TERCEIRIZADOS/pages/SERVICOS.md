# SERVICOS — Arquitetura e Implementação

## Rotas

| Rota              | Descrição                    |
| ----------------- | ---------------------------- |
| `/servicos`       | Lista todos os serviços      |
| `/servicos/:slug` | Página individual do serviço |

## Lista de serviços (`/servicos`)

### Organização por categoria

```text
Soluções em RH
  ├── Recrutamento e Seleção      (rh)
  ├── Mão de Obra Temporária      (rh)
  ├── Mão de Obra Efetiva         (rh)
  ├── Assessoria em RH            (rh)
  ├── Avaliação de Perfil         (rh)
  └── Executive Search (Hunting)  (rh)

Soluções Operacionais (Facilities)
  ├── Facilities                  (facilities)
  ├── Jardim e Paisagismo         (facilities)
  ├── Limpeza de Fachada          (facilities)
  ├── Limpeza de Vidros           (facilities)
  ├── Faxina                      (facilities)
  ├── Limpeza Pós-Obra            (facilities)
  ├── Limpeza Pré-Mudança         (facilities)
  ├── Limpeza Pós-Mudança        (facilities)
  ├── Controle de Acesso          (facilities)
  ├── Recepção e Portaria         (facilities)
  └── Zeladoria e Manutenção      (facilities)

 Para Candidatos
  ├── Cadastro de Currículo       (candidato)
  ├── Busca de Vagas              (candidato)
  ├── Alertas de Emprego          (candidato)
  ├── Orientação Profissional     (candidato)
  └── Atualização de Currículo    (candidato)
```

### Componente

```tsx
// ServiceCard
<ServiceCard service={service} index={i} />
```

Cards em grid:

- RH: `sm:grid-cols-2 lg:grid-cols-4`
- Facilities: `sm:grid-cols-2 lg:grid-cols-4`
- Candidato: `sm:grid-cols-2 lg:grid-cols-4`

## Detalhe do serviço (`/servicos/:slug`)

### Estrutura

```text
Breadcrumbs: Home > Serviços > {titulo}
```

#### Premium Hero

```text
{titulo}
{categoria_label}
{description_longa}
[WhatsApp: Solicitar Orçamento] [Fale Conosco]
```

#### Stats

```text
Profissionais   Anos de Experiência   Clientes Atendidos   Cidades
```

#### Sobre o serviço

```text
{titulo} com Excelência
{description}
[benefits list]
[WhatsApp: Solicitar Orçamento]
```

#### Processo (como trabalhamos)

```text
01 Solicitação  02 Análise  03 Proposta  04 Execução
```

#### Diferenciais

```text
3 cards: Profissionais Certificados | Tecnologia Integrada | Suporte 24/7
```

#### Galeria

```text
4 imagens em grid
```

#### FAQ (5 perguntas)

#### CTA Final

```text
Pronto para contratar {titulo}?
[ServiceRequestForm service="{slug}" />
```

## Serviços existentes (`src/services/mock/services.ts`)

```text
ID  Slug                        Title                    Category
1   recrutamento-selecao        Recrutamento e Seleção   rh
9   mao-de-obra-temporaria      Mão de Obra Temporária   rh
11  mao-de-obra-efetiva         Mão de Obra Efetiva      rh
12  assessoria-rh               Assessoria em RH         rh
4   avaliacao-perfil            Avaliação de Perfil      rh
4   hunting                     Executive Search         rh
10  facilities                  Facilities               facilities
6   jardinagem                  Jardinagem               facilities
7   limpeza-de-fachada          Limpeza de Fachada       facilities
8   limpeza-de-vidros           Limpeza de Vidros        facilities
13  faxina                      Faxina                   facilities
14  limpeza-pos-obra            Limpeza Pós-Obra         facilities
28  limpeza-pre-mudanca         Limpeza Pré-Mudança      facilities
29  limpeza-pos-mudanca         Limpeza Pós-Mudança      facilities
3   terceirizacao               Terceirização            terceirizacao
15  controle-acesso             Controle de Acesso       facilities
16  portaria                    Recepção e Portaria      facilities
20  cadastro-curriculo          Cadastro de Currículo    candidato
21  busca-vagas                 Busca de Vagas           candidato
22  alertas-emprego             Alertas de Emprego       candidato
23  orientacao-profissional     Orientação Profissional  candidato
24  atualizacao-curriculo       Atualização de Currículo candidato
```

### Services type

```ts
interface Service {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  benefits: string[];
  image: string;
  icon: string;
  category: 'rh' | 'facilities' | 'terceirizacao' | 'candidato';
}
```
