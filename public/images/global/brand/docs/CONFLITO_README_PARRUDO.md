# Conflito documental: README-PARRUDO.md × estado real do repositório

## DOCUMENTO
`README-PARRUDO.md` (arquivo em `C:\NewWaveProjetos\RemocaoAlpha\README-PARRUDO.md`)

## VERSÃO/CONTEXTO
Schema "Parrudo Enterprise" descrito como substituto do schema básico.

## DECISÃO
Não aplicar o schema parrudo. Ele descreve estruturas que não existem no repositório e não foram verificadas no Supabase remoto.

## CONFLITO
| Item no README | Estado real no repositório | Estado no Supabase remoto |
|---|---|---|
| `supabase/schema-parrudo-enterprise.sql` | **NÃO EXISTE** | — |
| `supabase/tabelas/01-sigtap.sql` | **NÃO EXISTE** | — |
| `supabase/tabelas/02-cid10.sql` | **NÃO EXISTE** | — |
| `supabase/tabelas/03-cbo.sql` | **NÃO EXISTE** | — |
| `profissionais` | Não há migrations | Acesso bloqueado |
| `remocoes` | Tabela real é `remocao` | Acesso bloqueado |
| `gps_tracking` | Tabela real é `remocao_gps_posicao` | Acesso bloqueado |
| `vw_remocao_completa` | Não existe no Git | Acesso bloqueado |
| `remocao_status_history` | Não existe como view | Acesso bloqueado |
| `checklists` duplos (MOTORISTA/ENFERMAGEM) | Não encontrados | Acesso bloqueado |
| `evoluções` (MEDICA/ENFERMAGEM/etc) | Não encontradas | Acesso bloqueado |
| Buckets `avatares` / `remocao-anexos` | Não configurados | Acesso bloqueado |
| Pasta `public/AVATAR/` | Não existe | — |

## ESTADO ATUAL DO CÓDIGO
- Migrations reais: `20261020000000_fix_unidade_tenant_fk.sql` a `20261024000000_remocao_destinos_externos.sql`.
- Tabelas confirmadas no código: `remocao`, `remocao_paciente`, `remocao_unidade`, `remocao_setor`, `remocao_equipe`, `remocao_equipe_membro`, `remocao_motorista`, `remocao_veiculo`, `remocao_gps_posicao`, `remocao_rota`, `remocao_destinos_externos` (migration no Git, não confirmada no remoto).
- View `remocao_summary` no Git, não expõe `tenant_id`.
- Acesso Supabase bloqueado nesta sessão.

## REGRA DE OURO
Nunca aplicar um schema descrito em um `.md` sem confirmar: (1) existência dos arquivos SQL no repositório, (2) compatibilidade com o esquema real do Supabase, (3) autorização explícita.