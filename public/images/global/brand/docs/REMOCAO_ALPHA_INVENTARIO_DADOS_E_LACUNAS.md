# Remoção Alpha — Inventário de Dados e Lacunas

## Confirmado no código/migrations
- `people`, `tenants`, `remocao_unidade`, `remocao_setor`
- `remocao`, `remocao_paciente`, `remocao_equipe`, `remocao_equipe_membro`
- `remocao_motorista`, `remocao_veiculo`, `remocao_gps_posicao`, `remocao_rota`
- `remocao_destinos_externos` (migration 20261024), FK migration 20261025
- `remocao_summary` (view; não expõe tenant_id)

## Não confirmado no remoto
- Aplicação das migrations de destinos externos.
- Presença da view `remocao_summary` com schema compatível.
- Inventário real de tabelas/RLS via Supabase (acesso bloqueado nesta sessão).

## Lacunas
- Cadastro mestre `pacientes` separado.
- Especialidades/registros profissionais relacionais.
- Endereços/municípios normalizados.
- `estabelecimentos_saude` dinâmico (hospital/UPA/UBS).
- Agenda e sincronização Google Calendar.
- Equipamentos normalizados.
