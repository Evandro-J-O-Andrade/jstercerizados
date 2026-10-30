# Remoção Alpha — Matriz Mestre do Produto

## Escopo
Inventário documental do produto Remoção Alpha (SaaS de remoção médica). Fase exclusiva de análise/planejamento; sem alteração de banco remoto.

## Perfis
Gestão, Motorista, Enfermagem, Técnico de Enfermagem, Médico, Fisioterapeuta, Nutricionista, Administração, Suporte.

## Entidades centrais
- `people` (identidade comum)
- `tenants`, `remocao_unidade`, `remocao_setor`
- `remocao_paciente` (contexto clínico por viagem; cadastro mestre `pacientes` pendente)
- `remocao` (solicitação/remoção)
- `remocao_equipe`, `remocao_equipe_membro`
- `remocao_motorista`, `remocao_veiculo`
- `remocao_gps_posicao`, `remocao_rota`
- `remocao_destinos_externos` (migration no Git; não confirmada no remoto)
- `remocao_summary` (view no Git; não expõe tenant_id)

## Estados dos fluxos
solicitada → regulada → aceita/recusada → atribuída → em deslocamento → embarque → entrega → encerrada. Cancelamento, não realização, vaga zero, evasão e intercorrências registrados.

## Lacunas críticas
1. Cadastro mestre de paciente separado da solicitação (hoje dados duplicados em `remocao` e `remocao_paciente`).
2. `remocao_destinos_externos` e `remocao_summary` não confirmados no remoto (404/400).
3. Especialidades/registros profissionais não modelados relacionalmente.
4. Endereços/CEP/logradouros não normalizados.
5. Agenda/Google Calendar não implementado (apenas campos de data/hora previstos).
6. Equipamentos não normalizados (campos textuais).
7. `.env` com credenciais sensíveis versionado (rotação necessária).
