# Catálogos de referência — CID-10, CBO e SIGTAP

## Origem e versão

| Catálogo | Fonte | Competência / versão | Registros |
|---|---|---|---|
| CID-10 | DATASUS / OMS | CID-10 (fonte oficial) | 14.246 |
| CBO | Ministério do Trabalho e Emprego | CBO 2002 | 2.719 |
| SIGTAP | DATASUS / SIGTAP | 202610 | 5.039 |

## Arquivos de dados (fonte para reimportação)

| Arquivo | Tamanho | SHA-256 |
|---|---|---|
| `docs/tb_cid.txt` | 1.609.798 | `611805b5e14c3495c0e28780b13d86c68cdd047c0668c614ef770160212a508d` |
| `docs/tb_ocupacao.txt` | 429.602 | `4ee768369e03557342b62fd5578f5f7e79d886fcce13fbc21dad3fb05fc7a559` |
| `docs/tb_procedimento.txt` | 1.703.182 | `54e9d3e008fa16979f9cda3ba294cc4907b1df7cb9943f4048c6ff3ed39f9291` |
| `docs/tb_cid_layout.txt` | 198 | `7010d3b5926daa352c84be7ecbbe4c30bed413dc5820126ceb2e253a55977301` |
| `docs/tb_ocupacao_layout.txt` | 88 | `9579199b2b7329d8e220a09251d485017b98e50f437e36dd462df4d600ab220e` |
| `docs/tb_procedimento_layout.txt` | 551 | `b1d967812f0895f6a4f0206d902e16d59213aa64cfa08b00dffb878aea179c5b` |

## Tabelas Supabase de destino

- `cid10` — 14.246 registros
- `cbo_ocupacoes` — 2.731 registros
- `sigtap_procedimentos` — 5.039 registros (competência 202610)

## Recuperação

Os arquivos TXT são a fonte para reimportação. Os PDFs e ZIPs originais estão preservados localmente. Para reimportar, use `scripts/load_catalogs.py` ou os seeds em `supabase/seeds/`.
PYEOF