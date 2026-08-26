# Portal RBAC Matrix

Generated from Supabase RBAC dump.

## Users → Roles

| User                    | Role    | Scope   | Tenant            |
| ----------------------- | ------- | ------- | ----------------- |
| Person A                | Unknown | Unknown | Tenant A          |
| Person B                | Unknown | Unknown | Tenant B          |
| Admin Master            | Unknown | Unknown | J&S Empregos LTDA |
| Admin Tenant            | Unknown | Unknown | J&S Empregos LTDA |
| Gerente Operacional     | Unknown | Unknown | J&S Empregos LTDA |
| Operador                | Unknown | Unknown | J&S Empregos LTDA |
| Evandro Andrade         | Unknown | Unknown | J&S Empregos LTDA |
| Gestor J&S Empregos     | Unknown | Unknown | J&S Empregos LTDA |
| Financeiro J&S Empregos | Unknown | Unknown | J&S Empregos LTDA |

## Roles → Permissions

### admin_master (global)

| Permission                           | Resource             | Action           | Description                                  |
| ------------------------------------ | -------------------- | ---------------- | -------------------------------------------- |
| c49ddf68-ed63-4cf2-b54d-d2251a815272 | tenants              | create           | Criar tenant                                 |
| bf4e553e-898b-4e0b-a31f-a793a6735bde | tenants              | read             | Ler tenant                                   |
| f3427e6f-4a90-4dce-9bdd-41a6198c4aaf | tenants              | update           | Atualizar tenant                             |
| 46c37233-614c-4608-badb-01767d4acff1 | tenants              | delete           | Remover tenant                               |
| ea7fa862-3f34-40b5-b97c-15c73b46151d | people               | create           | Criar pessoa                                 |
| 0d4761e4-1151-4cc5-b501-0b3907e6eeb9 | people               | read             | Ler pessoa                                   |
| 9f3ed31c-4e44-46aa-bb57-f848ec5028b5 | people               | update           | Atualizar pessoa                             |
| ecb60027-34ff-4d1c-b4cd-86251e95d8c1 | people               | delete           | Remover pessoa                               |
| c47a1dd6-4942-429c-8709-6fa9131abee4 | roles                | create           | Criar role                                   |
| 738d6262-c02d-40ae-b2f9-93af299ed743 | roles                | read             | Ler role                                     |
| 57f35f00-777c-4224-b96a-9bdd6f05cb84 | roles                | update           | Atualizar role                               |
| 11aa3eed-48cd-4f29-ad63-efdd4d76c918 | roles                | delete           | Remover role                                 |
| a4eb685e-4786-44da-9424-ba5c717010d2 | companies            | create           | Criar empresa                                |
| 5c9e957d-8a99-4d19-8de1-469a526e85dc | companies            | read             | Ler empresa                                  |
| 73b96008-1e57-4c03-9438-f5d0164df60b | companies            | update           | Atualizar empresa                            |
| 4a0db6f9-a591-47fc-bb0b-4d97fe293129 | companies            | delete           | Remover empresa                              |
| 2e0a6201-20f4-489b-8e3e-fb042cb7ff01 | products             | create           | Criar produto                                |
| 13322f98-970c-41ff-9903-3a8f922d7f71 | products             | read             | Ler produto                                  |
| 8aba243f-a68f-400f-bed1-40fc0a611fad | products             | update           | Atualizar produto                            |
| 02fa198c-5c9f-4c53-9611-f65759e398f9 | products             | delete           | Remover produto                              |
| a6671cf6-95d2-4205-956c-71f83a22d90d | stock_movements      | create           | Criar movimentação                           |
| 880caed1-8255-4bef-86a2-f1828e7f9536 | stock_movements      | read             | Ler movimentação                             |
| bf709be3-1926-4bad-ae68-8429b2f99794 | purchase_orders      | create           | Criar pedido de compra                       |
| afaa01f4-6ee6-407a-a320-ba31dca7d1a7 | purchase_orders      | read             | Ler pedido de compra                         |
| 234900b7-5537-41b5-bbf1-2091df6cfbd6 | purchase_orders      | update           | Atualizar pedido de compra                   |
| 58369814-3cdf-40bc-9f33-7ad065b51f7d | purchase_orders      | confirm          | Confirmar pedido de compra                   |
| 9afe631f-1a1c-41c2-91db-11ce0af5ee21 | purchase_receipts    | create           | Criar recebimento                            |
| ed76790a-c742-4d45-8f9f-38bbe4ed51fe | purchase_receipts    | read             | Ler recebimento                              |
| 96a4d936-2265-4241-aca0-84637b9f541a | purchase_receipts    | confirm          | Confirmar recebimento                        |
| 2712e7f0-c117-464e-b6c5-add090f68d85 | service_orders       | create           | Criar ordem de serviço                       |
| 0eade96f-6d8a-4f9a-a388-ecdf8b7405d7 | service_orders       | read             | Ler ordem de serviço                         |
| b332c3aa-67e7-43c8-8327-9bcf14471d25 | service_orders       | update           | Atualizar ordem de serviço                   |
| 90e063b7-6a15-4caa-99b6-e11a419fbf16 | service_orders       | complete         | Concluir ordem de serviço                    |
| 0e773490-f9c3-4540-95d0-534226a9896a | contracts            | create           | Criar contrato                               |
| cec25721-f1fe-4560-a86a-d36741b43891 | contracts            | read             | Ler contrato                                 |
| be857fdf-c37a-411b-8353-7e0b5c4f54bb | contracts            | update           | Atualizar contrato                           |
| 9723dca7-7a58-4baa-8a2d-09bed345fe1a | contracts            | renew            | Renovar contrato                             |
| 7038a064-aa1d-4e88-a3ae-e81a49e975a3 | tasks                | create           | Criar tarefa                                 |
| 20032d59-4bf6-46f9-aff0-78965e34a68e | tasks                | read             | Ler tarefa                                   |
| a7d0c6ac-c07a-47aa-a2f3-781f0474e3d0 | tasks                | update           | Atualizar tarefa                             |
| 9da75044-a113-4300-b007-96ba51da349d | tasks                | assign           | Atribuir tarefa                              |
| 1c283da0-f29d-4cc4-807b-d5c6c9293e99 | support_tickets      | create           | Criar ticket                                 |
| 9d0faa6a-4ea2-4bab-b2ae-3608d2e20141 | support_tickets      | read             | Ler ticket                                   |
| 34286b88-6a06-4e13-a53d-1b00d601e432 | support_tickets      | update           | Atualizar ticket                             |
| 952e6d7f-442c-4428-a220-a8b88c7f244d | support_tickets      | resolve          | Resolver ticket                              |
| 3d54245f-f459-4439-a126-643dd2f63882 | chat                 | create           | Criar conversa                               |
| ea802c96-8f3c-4a7f-8206-2fa3d652093d | chat                 | read             | Ler conversa                                 |
| 985a91ec-2e21-4bb6-99e6-bba27a17b171 | chat                 | handoff          | Transferir atendimento                       |
| 1b35aab6-fe73-44e0-8ac1-736a2fbdef4e | notifications        | create           | Criar notificação                            |
| be4161c2-1a18-4ef3-b231-e2a59c4626e9 | notifications        | read             | Ler notificação                              |
| 90187ae0-dd67-4a9d-a345-bb84c6b9118d | files                | upload           | Enviar arquivo                               |
| 425055aa-9fea-4203-b869-1d1a77e43016 | files                | read             | Ler arquivo                                  |
| 615e2f97-ac8b-4c8a-b285-83492aac9fba | files                | delete           | Remover arquivo                              |
| 43d5bac1-92d6-4580-bde9-e3b6ee3c6f26 | documents            | create           | Criar documento                              |
| 2f94fb10-9033-472b-9fb1-6d5c47e2b117 | documents            | read             | Ler documento                                |
| 4adefd0e-da26-40b7-b305-f4bdc5ccec5b | documents            | version          | Criar versão de documento                    |
| 3a4a0bcf-197d-4965-84e5-82e1b864a434 | audit_logs           | read             | Ler auditoria                                |
| ec80fcb6-bbd7-4e37-b75f-a408c4ecc802 | security_events      | read             | Ler eventos de segurança                     |
| 50ccc832-f161-4edb-8e78-0cde150441c6 | lgpd                 | read             | Ler dados LGPD                               |
| 4ed2eda1-329e-43da-a3b2-88db41a69ce8 | lgpd                 | manage_consent   | Gerenciar consentimento                      |
| 617354e9-83cb-4a65-9c2d-a435eadec6fa | lgpd                 | manage_retention | Gerenciar retenção                           |
| 1bef5b01-0272-4a14-ad42-fe9d17203a37 | reports              | read             | Ler relatórios                               |
| 81a59683-d8d4-4b39-81cd-8468ca7df587 | dashboard            | read             | Ler dashboard                                |
| 84fac669-a441-4d0b-8376-4e192cb8f7b2 | jobs                 | close            | Encerrar vaga                                |
| 21531326-b06b-4b90-89d8-5f163f7dc746 | candidates           | delete           | Remover candidato                            |
| f5afd88e-7edb-4c67-aefd-120a3c0b4c4a | candidates.documents | read             | Consultar documentos do candidato            |
| 66eb1a5a-9e97-48f1-af9f-e3297923685a | candidates.documents | manage           | Gerenciar documentos do candidato            |
| dafa7382-df7c-4985-95fc-1094959553ad | candidates.profile   | read             | Consultar perfil completo do candidato       |
| 5388fb3d-cb91-406c-bebc-51569da01044 | recruitment          | read             | Visualizar processos seletivos               |
| b440a270-7bb1-41fc-a31e-e1ee023ba8ba | recruitment          | create           | Criar processo seletivo                      |
| ad6a6d06-0a29-485a-8581-1a04cad8e658 | recruitment          | update           | Editar processo seletivo                     |
| 74586ba9-af4f-4189-a758-096e7c660c65 | recruitment          | delete           | Excluir processo seletivo                    |
| 9dc7137c-b045-48ba-86a6-3f2e61e86bfe | recruitment          | advance          | Avançar candidato para próxima etapa         |
| 3bd52aaf-616c-4547-b08c-960a5af2018b | recruitment          | reject           | Reprovar candidato                           |
| cbd63735-6a79-4328-af3b-654a4674748a | recruitment.stage    | manage           | Gerenciar etapas do processo                 |
| 7df7aa78-e72c-445c-9b96-eebb139fd434 | applications         | advance          | Avançar status da candidatura                |
| f3adb101-ad88-4e2a-ad4d-5dbc678d0c31 | applications         | reject           | Rejeitar candidatura                         |
| c39a1771-a08e-4f85-9494-eb596145e020 | applications.history | read             | Consultar histórico de status da candidatura |
| fce8a6c5-36f4-44a4-b50c-4812b019fffe | talent_pool          | read             | Consultar banco de talentos                  |
| 58b8496f-63c2-4789-bb3e-bc5f97515487 | talent_pool          | manage           | Administrar talentos do banco                |
| 8f0c7fff-d462-4299-9425-dcf060486703 | talent_pool          | match            | Executar matching candidato-vaga             |
| 4c0c9c68-7d0d-4798-bc9f-56d9003e4d57 | recruitment_demands  | read             | Consultar demandas de recrutamento           |
| 4bb5498a-4c66-40e2-abb0-6aff68e115a5 | recruitment_demands  | create           | Abrir nova demanda de recrutamento           |
| ca9464d2-b43b-4ce7-bf09-0c0367051e33 | recruitment_demands  | update           | Editar demanda de recrutamento               |
| e63e0561-ac4f-40d9-9063-eebc4374dc32 | recruitment_demands  | delete           | Excluir demanda de recrutamento              |
| bfb3cc55-6af5-402d-a694-05fb36b6ae2f | jobs                 | read             | Visualizar vagas                             |
| 6b059168-da28-4e7d-93b1-2c51f61a54a8 | jobs                 | create           | Criar vaga                                   |
| 9df92cfe-86ec-45ef-81be-c00dd639636b | jobs                 | update           | Editar vaga                                  |
| a25cdc41-d02f-4f70-8186-74bcba4db548 | jobs                 | delete           | Excluir vaga                                 |
| 4966e2b1-c3e9-42b6-b90c-318cb1c90a1d | jobs                 | publish          | Publicar vaga                                |
| a20d723d-a66f-42bf-8d4c-1097ec27ad4a | candidates           | read             | Visualizar candidatos                        |
| 38a9d067-5a6e-44ce-818d-cd93aca25f55 | candidates           | create           | Cadastrar candidato                          |
| a6c461f6-b8eb-4c2d-97a7-538a4cd46c71 | candidates           | update           | Editar candidato                             |
| bf9a780e-9cff-467e-9b73-e47524da9016 | applications         | read             | Visualizar candidaturas                      |
| 0ba9279d-fda3-4bf6-bd43-3e955807fca8 | applications         | create           | Registrar candidatura                        |
| 0e63c84e-9963-4d1a-a27d-a96e71e7d078 | applications         | update           | Atualizar candidatura                        |

### recruiter (tenant)

| Permission                           | Resource             | Action    | Description                                  |
| ------------------------------------ | -------------------- | --------- | -------------------------------------------- |
| f5afd88e-7edb-4c67-aefd-120a3c0b4c4a | candidates.documents | read      | Consultar documentos do candidato            |
| dafa7382-df7c-4985-95fc-1094959553ad | candidates.profile   | read      | Consultar perfil completo do candidato       |
| 5388fb3d-cb91-406c-bebc-51569da01044 | recruitment          | read      | Visualizar processos seletivos               |
| b440a270-7bb1-41fc-a31e-e1ee023ba8ba | recruitment          | create    | Criar processo seletivo                      |
| ad6a6d06-0a29-485a-8581-1a04cad8e658 | recruitment          | update    | Editar processo seletivo                     |
| 9dc7137c-b045-48ba-86a6-3f2e61e86bfe | recruitment          | advance   | Avançar candidato para próxima etapa         |
| 3bd52aaf-616c-4547-b08c-960a5af2018b | recruitment          | reject    | Reprovar candidato                           |
| 7df7aa78-e72c-445c-9b96-eebb139fd434 | applications         | advance   | Avançar status da candidatura                |
| f3adb101-ad88-4e2a-ad4d-5dbc678d0c31 | applications         | reject    | Rejeitar candidatura                         |
| c39a1771-a08e-4f85-9494-eb596145e020 | applications.history | read      | Consultar histórico de status da candidatura |
| fce8a6c5-36f4-44a4-b50c-4812b019fffe | talent_pool          | read      | Consultar banco de talentos                  |
| 8f0c7fff-d462-4299-9425-dcf060486703 | talent_pool          | match     | Executar matching candidato-vaga             |
| 4c0c9c68-7d0d-4798-bc9f-56d9003e4d57 | recruitment_demands  | read      | Consultar demandas de recrutamento           |
| bfb3cc55-6af5-402d-a694-05fb36b6ae2f | jobs                 | read      | Visualizar vagas                             |
| 6b059168-da28-4e7d-93b1-2c51f61a54a8 | jobs                 | create    | Criar vaga                                   |
| 9df92cfe-86ec-45ef-81be-c00dd639636b | jobs                 | update    | Editar vaga                                  |
| 4966e2b1-c3e9-42b6-b90c-318cb1c90a1d | jobs                 | publish   | Publicar vaga                                |
| a20d723d-a66f-42bf-8d4c-1097ec27ad4a | candidates           | read      | Visualizar candidatos                        |
| 38a9d067-5a6e-44ce-818d-cd93aca25f55 | candidates           | create    | Cadastrar candidato                          |
| a6c461f6-b8eb-4c2d-97a7-538a4cd46c71 | candidates           | update    | Editar candidato                             |
| bf9a780e-9cff-467e-9b73-e47524da9016 | applications         | read      | Visualizar candidaturas                      |
| 0ba9279d-fda3-4bf6-bd43-3e955807fca8 | applications         | create    | Registrar candidatura                        |
| 0e63c84e-9963-4d1a-a27d-a96e71e7d078 | applications         | update    | Atualizar candidatura                        |
| 81a59683-d8d4-4b39-81cd-8468ca7df587 | dashboard            | read      | Ler dashboard                                |
| 4b6b2149-1529-49ba-9a08-8f71e56116da | applications         | approve   | Aprovar candidatura                          |
| 2ac90a4c-40b7-424a-b795-e5a48dad1422 | jobs                 | archive   | Arquivar vaga                                |
| b3d471dc-c1f1-43ba-b451-f64bce2eadf6 | applications         | interview | Agendar entrevista                           |
| bdd0a47c-c5a7-487d-8ca2-8093b3bb48c8 | candidates           | export    | Exportar candidatos                          |
| 1bef5b01-0272-4a14-ad42-fe9d17203a37 | reports              | read      | Ler relatórios                               |

### rh_manager (tenant)

| Permission                           | Resource             | Action    | Description                                  |
| ------------------------------------ | -------------------- | --------- | -------------------------------------------- |
| 84fac669-a441-4d0b-8376-4e192cb8f7b2 | jobs                 | close     | Encerrar vaga                                |
| 21531326-b06b-4b90-89d8-5f163f7dc746 | candidates           | delete    | Remover candidato                            |
| f5afd88e-7edb-4c67-aefd-120a3c0b4c4a | candidates.documents | read      | Consultar documentos do candidato            |
| 66eb1a5a-9e97-48f1-af9f-e3297923685a | candidates.documents | manage    | Gerenciar documentos do candidato            |
| dafa7382-df7c-4985-95fc-1094959553ad | candidates.profile   | read      | Consultar perfil completo do candidato       |
| 5388fb3d-cb91-406c-bebc-51569da01044 | recruitment          | read      | Visualizar processos seletivos               |
| b440a270-7bb1-41fc-a31e-e1ee023ba8ba | recruitment          | create    | Criar processo seletivo                      |
| ad6a6d06-0a29-485a-8581-1a04cad8e658 | recruitment          | update    | Editar processo seletivo                     |
| 74586ba9-af4f-4189-a758-096e7c660c65 | recruitment          | delete    | Excluir processo seletivo                    |
| 9dc7137c-b045-48ba-86a6-3f2e61e86bfe | recruitment          | advance   | Avançar candidato para próxima etapa         |
| 3bd52aaf-616c-4547-b08c-960a5af2018b | recruitment          | reject    | Reprovar candidato                           |
| cbd63735-6a79-4328-af3b-654a4674748a | recruitment.stage    | manage    | Gerenciar etapas do processo                 |
| 7df7aa78-e72c-445c-9b96-eebb139fd434 | applications         | advance   | Avançar status da candidatura                |
| f3adb101-ad88-4e2a-ad4d-5dbc678d0c31 | applications         | reject    | Rejeitar candidatura                         |
| c39a1771-a08e-4f85-9494-eb596145e020 | applications.history | read      | Consultar histórico de status da candidatura |
| fce8a6c5-36f4-44a4-b50c-4812b019fffe | talent_pool          | read      | Consultar banco de talentos                  |
| 58b8496f-63c2-4789-bb3e-bc5f97515487 | talent_pool          | manage    | Administrar talentos do banco                |
| 8f0c7fff-d462-4299-9425-dcf060486703 | talent_pool          | match     | Executar matching candidato-vaga             |
| 4c0c9c68-7d0d-4798-bc9f-56d9003e4d57 | recruitment_demands  | read      | Consultar demandas de recrutamento           |
| 4bb5498a-4c66-40e2-abb0-6aff68e115a5 | recruitment_demands  | create    | Abrir nova demanda de recrutamento           |
| ca9464d2-b43b-4ce7-bf09-0c0367051e33 | recruitment_demands  | update    | Editar demanda de recrutamento               |
| e63e0561-ac4f-40d9-9063-eebc4374dc32 | recruitment_demands  | delete    | Excluir demanda de recrutamento              |
| bfb3cc55-6af5-402d-a694-05fb36b6ae2f | jobs                 | read      | Visualizar vagas                             |
| 6b059168-da28-4e7d-93b1-2c51f61a54a8 | jobs                 | create    | Criar vaga                                   |
| 9df92cfe-86ec-45ef-81be-c00dd639636b | jobs                 | update    | Editar vaga                                  |
| a25cdc41-d02f-4f70-8186-74bcba4db548 | jobs                 | delete    | Excluir vaga                                 |
| 4966e2b1-c3e9-42b6-b90c-318cb1c90a1d | jobs                 | publish   | Publicar vaga                                |
| a20d723d-a66f-42bf-8d4c-1097ec27ad4a | candidates           | read      | Visualizar candidatos                        |
| 38a9d067-5a6e-44ce-818d-cd93aca25f55 | candidates           | create    | Cadastrar candidato                          |
| a6c461f6-b8eb-4c2d-97a7-538a4cd46c71 | candidates           | update    | Editar candidato                             |
| bf9a780e-9cff-467e-9b73-e47524da9016 | applications         | read      | Visualizar candidaturas                      |
| 0ba9279d-fda3-4bf6-bd43-3e955807fca8 | applications         | create    | Registrar candidatura                        |
| 0e63c84e-9963-4d1a-a27d-a96e71e7d078 | applications         | update    | Atualizar candidatura                        |
| ea7fa862-3f34-40b5-b97c-15c73b46151d | people               | create    | Criar pessoa                                 |
| 2ac90a4c-40b7-424a-b795-e5a48dad1422 | jobs                 | archive   | Arquivar vaga                                |
| b3d471dc-c1f1-43ba-b451-f64bce2eadf6 | applications         | interview | Agendar entrevista                           |
| 9fbd2f1c-272d-4732-a94f-c9099de90a37 | files                | update    | Atualizar arquivo                            |
| 95f461c2-c031-4da8-a4f4-5adeb964da29 | reports              | generate  | Gerar relatório                              |
| 81a59683-d8d4-4b39-81cd-8468ca7df587 | dashboard            | read      | Ler dashboard                                |
| 9f3ed31c-4e44-46aa-bb57-f848ec5028b5 | people               | update    | Atualizar pessoa                             |
| bdd0a47c-c5a7-487d-8ca2-8093b3bb48c8 | candidates           | export    | Exportar candidatos                          |
| 425055aa-9fea-4203-b869-1d1a77e43016 | files                | read      | Ler arquivo                                  |
| 615e2f97-ac8b-4c8a-b285-83492aac9fba | files                | delete    | Remover arquivo                              |
| 6095bf39-8fd8-45f9-afab-2c4d948b0cff | reports              | export    | Exportar relatório                           |
| 0d4761e4-1151-4cc5-b501-0b3907e6eeb9 | people               | read      | Ler pessoa                                   |
| 243f8087-437f-44e9-b1ba-b46220da6081 | people               | export    | Exportar pessoas/usuários                    |
| 4b6b2149-1529-49ba-9a08-8f71e56116da | applications         | approve   | Aprovar candidatura                          |
| 682747bb-fd89-4459-8b0f-c529ee57cc16 | files                | create    | Upload de arquivo                            |
| 1bef5b01-0272-4a14-ad42-fe9d17203a37 | reports              | read      | Ler relatórios                               |

### tenant_admin (tenant)

| Permission                           | Resource                     | Action           | Description                                  |
| ------------------------------------ | ---------------------------- | ---------------- | -------------------------------------------- |
| 84fac669-a441-4d0b-8376-4e192cb8f7b2 | jobs                         | close            | Encerrar vaga                                |
| 21531326-b06b-4b90-89d8-5f163f7dc746 | candidates                   | delete           | Remover candidato                            |
| f5afd88e-7edb-4c67-aefd-120a3c0b4c4a | candidates.documents         | read             | Consultar documentos do candidato            |
| 66eb1a5a-9e97-48f1-af9f-e3297923685a | candidates.documents         | manage           | Gerenciar documentos do candidato            |
| dafa7382-df7c-4985-95fc-1094959553ad | candidates.profile           | read             | Consultar perfil completo do candidato       |
| 5388fb3d-cb91-406c-bebc-51569da01044 | recruitment                  | read             | Visualizar processos seletivos               |
| b440a270-7bb1-41fc-a31e-e1ee023ba8ba | recruitment                  | create           | Criar processo seletivo                      |
| ad6a6d06-0a29-485a-8581-1a04cad8e658 | recruitment                  | update           | Editar processo seletivo                     |
| 74586ba9-af4f-4189-a758-096e7c660c65 | recruitment                  | delete           | Excluir processo seletivo                    |
| 9dc7137c-b045-48ba-86a6-3f2e61e86bfe | recruitment                  | advance          | Avançar candidato para próxima etapa         |
| 3bd52aaf-616c-4547-b08c-960a5af2018b | recruitment                  | reject           | Reprovar candidato                           |
| cbd63735-6a79-4328-af3b-654a4674748a | recruitment.stage            | manage           | Gerenciar etapas do processo                 |
| 7df7aa78-e72c-445c-9b96-eebb139fd434 | applications                 | advance          | Avançar status da candidatura                |
| f3adb101-ad88-4e2a-ad4d-5dbc678d0c31 | applications                 | reject           | Rejeitar candidatura                         |
| c39a1771-a08e-4f85-9494-eb596145e020 | applications.history         | read             | Consultar histórico de status da candidatura |
| fce8a6c5-36f4-44a4-b50c-4812b019fffe | talent_pool                  | read             | Consultar banco de talentos                  |
| 58b8496f-63c2-4789-bb3e-bc5f97515487 | talent_pool                  | manage           | Administrar talentos do banco                |
| 8f0c7fff-d462-4299-9425-dcf060486703 | talent_pool                  | match            | Executar matching candidato-vaga             |
| 4c0c9c68-7d0d-4798-bc9f-56d9003e4d57 | recruitment_demands          | read             | Consultar demandas de recrutamento           |
| 4bb5498a-4c66-40e2-abb0-6aff68e115a5 | recruitment_demands          | create           | Abrir nova demanda de recrutamento           |
| ca9464d2-b43b-4ce7-bf09-0c0367051e33 | recruitment_demands          | update           | Editar demanda de recrutamento               |
| e63e0561-ac4f-40d9-9063-eebc4374dc32 | recruitment_demands          | delete           | Excluir demanda de recrutamento              |
| ea7fa862-3f34-40b5-b97c-15c73b46151d | people                       | create           | Criar pessoa                                 |
| 0d4761e4-1151-4cc5-b501-0b3907e6eeb9 | people                       | read             | Ler pessoa                                   |
| 9f3ed31c-4e44-46aa-bb57-f848ec5028b5 | people                       | update           | Atualizar pessoa                             |
| ecb60027-34ff-4d1c-b4cd-86251e95d8c1 | people                       | delete           | Remover pessoa                               |
| a4eb685e-4786-44da-9424-ba5c717010d2 | companies                    | create           | Criar empresa                                |
| 5c9e957d-8a99-4d19-8de1-469a526e85dc | companies                    | read             | Ler empresa                                  |
| 73b96008-1e57-4c03-9438-f5d0164df60b | companies                    | update           | Atualizar empresa                            |
| 4a0db6f9-a591-47fc-bb0b-4d97fe293129 | companies                    | delete           | Remover empresa                              |
| 2e0a6201-20f4-489b-8e3e-fb042cb7ff01 | products                     | create           | Criar produto                                |
| 13322f98-970c-41ff-9903-3a8f922d7f71 | products                     | read             | Ler produto                                  |
| 8aba243f-a68f-400f-bed1-40fc0a611fad | products                     | update           | Atualizar produto                            |
| 02fa198c-5c9f-4c53-9611-f65759e398f9 | products                     | delete           | Remover produto                              |
| a6671cf6-95d2-4205-956c-71f83a22d90d | stock_movements              | create           | Criar movimentação                           |
| 880caed1-8255-4bef-86a2-f1828e7f9536 | stock_movements              | read             | Ler movimentação                             |
| bf709be3-1926-4bad-ae68-8429b2f99794 | purchase_orders              | create           | Criar pedido de compra                       |
| afaa01f4-6ee6-407a-a320-ba31dca7d1a7 | purchase_orders              | read             | Ler pedido de compra                         |
| 234900b7-5537-41b5-bbf1-2091df6cfbd6 | purchase_orders              | update           | Atualizar pedido de compra                   |
| 58369814-3cdf-40bc-9f33-7ad065b51f7d | purchase_orders              | confirm          | Confirmar pedido de compra                   |
| 9afe631f-1a1c-41c2-91db-11ce0af5ee21 | purchase_receipts            | create           | Criar recebimento                            |
| ed76790a-c742-4d45-8f9f-38bbe4ed51fe | purchase_receipts            | read             | Ler recebimento                              |
| 96a4d936-2265-4241-aca0-84637b9f541a | purchase_receipts            | confirm          | Confirmar recebimento                        |
| 2712e7f0-c117-464e-b6c5-add090f68d85 | service_orders               | create           | Criar ordem de serviço                       |
| 0eade96f-6d8a-4f9a-a388-ecdf8b7405d7 | service_orders               | read             | Ler ordem de serviço                         |
| b332c3aa-67e7-43c8-8327-9bcf14471d25 | service_orders               | update           | Atualizar ordem de serviço                   |
| 90e063b7-6a15-4caa-99b6-e11a419fbf16 | service_orders               | complete         | Concluir ordem de serviço                    |
| 0e773490-f9c3-4540-95d0-534226a9896a | contracts                    | create           | Criar contrato                               |
| cec25721-f1fe-4560-a86a-d36741b43891 | contracts                    | read             | Ler contrato                                 |
| be857fdf-c37a-411b-8353-7e0b5c4f54bb | contracts                    | update           | Atualizar contrato                           |
| 9723dca7-7a58-4baa-8a2d-09bed345fe1a | contracts                    | renew            | Renovar contrato                             |
| 7038a064-aa1d-4e88-a3ae-e81a49e975a3 | tasks                        | create           | Criar tarefa                                 |
| 20032d59-4bf6-46f9-aff0-78965e34a68e | tasks                        | read             | Ler tarefa                                   |
| a7d0c6ac-c07a-47aa-a2f3-781f0474e3d0 | tasks                        | update           | Atualizar tarefa                             |
| 9da75044-a113-4300-b007-96ba51da349d | tasks                        | assign           | Atribuir tarefa                              |
| 1c283da0-f29d-4cc4-807b-d5c6c9293e99 | support_tickets              | create           | Criar ticket                                 |
| 9d0faa6a-4ea2-4bab-b2ae-3608d2e20141 | support_tickets              | read             | Ler ticket                                   |
| 34286b88-6a06-4e13-a53d-1b00d601e432 | support_tickets              | update           | Atualizar ticket                             |
| 952e6d7f-442c-4428-a220-a8b88c7f244d | support_tickets              | resolve          | Resolver ticket                              |
| 3d54245f-f459-4439-a126-643dd2f63882 | chat                         | create           | Criar conversa                               |
| ea802c96-8f3c-4a7f-8206-2fa3d652093d | chat                         | read             | Ler conversa                                 |
| 985a91ec-2e21-4bb6-99e6-bba27a17b171 | chat                         | handoff          | Transferir atendimento                       |
| 1b35aab6-fe73-44e0-8ac1-736a2fbdef4e | notifications                | create           | Criar notificação                            |
| be4161c2-1a18-4ef3-b231-e2a59c4626e9 | notifications                | read             | Ler notificação                              |
| 90187ae0-dd67-4a9d-a345-bb84c6b9118d | files                        | upload           | Enviar arquivo                               |
| 425055aa-9fea-4203-b869-1d1a77e43016 | files                        | read             | Ler arquivo                                  |
| 615e2f97-ac8b-4c8a-b285-83492aac9fba | files                        | delete           | Remover arquivo                              |
| 43d5bac1-92d6-4580-bde9-e3b6ee3c6f26 | documents                    | create           | Criar documento                              |
| 2f94fb10-9033-472b-9fb1-6d5c47e2b117 | documents                    | read             | Ler documento                                |
| 4adefd0e-da26-40b7-b305-f4bdc5ccec5b | documents                    | version          | Criar versão de documento                    |
| 3a4a0bcf-197d-4965-84e5-82e1b864a434 | audit_logs                   | read             | Ler auditoria                                |
| ec80fcb6-bbd7-4e37-b75f-a408c4ecc802 | security_events              | read             | Ler eventos de segurança                     |
| 50ccc832-f161-4edb-8e78-0cde150441c6 | lgpd                         | read             | Ler dados LGPD                               |
| 4ed2eda1-329e-43da-a3b2-88db41a69ce8 | lgpd                         | manage_consent   | Gerenciar consentimento                      |
| 617354e9-83cb-4a65-9c2d-a435eadec6fa | lgpd                         | manage_retention | Gerenciar retenção                           |
| bfb3cc55-6af5-402d-a694-05fb36b6ae2f | jobs                         | read             | Visualizar vagas                             |
| 6b059168-da28-4e7d-93b1-2c51f61a54a8 | jobs                         | create           | Criar vaga                                   |
| 9df92cfe-86ec-45ef-81be-c00dd639636b | jobs                         | update           | Editar vaga                                  |
| a25cdc41-d02f-4f70-8186-74bcba4db548 | jobs                         | delete           | Excluir vaga                                 |
| 4966e2b1-c3e9-42b6-b90c-318cb1c90a1d | jobs                         | publish          | Publicar vaga                                |
| a20d723d-a66f-42bf-8d4c-1097ec27ad4a | candidates                   | read             | Visualizar candidatos                        |
| 38a9d067-5a6e-44ce-818d-cd93aca25f55 | candidates                   | create           | Cadastrar candidato                          |
| a6c461f6-b8eb-4c2d-97a7-538a4cd46c71 | candidates                   | update           | Editar candidato                             |
| bf9a780e-9cff-467e-9b73-e47524da9016 | applications                 | read             | Visualizar candidaturas                      |
| 0ba9279d-fda3-4bf6-bd43-3e955807fca8 | applications                 | create           | Registrar candidatura                        |
| 0e63c84e-9963-4d1a-a27d-a96e71e7d078 | applications                 | update           | Atualizar candidatura                        |
| 81a59683-d8d4-4b39-81cd-8468ca7df587 | dashboard                    | read             | Ler dashboard                                |
| 738d6262-c02d-40ae-b2f9-93af299ed743 | roles                        | read             | Ler role                                     |
| c47a1dd6-4942-429c-8709-6fa9131abee4 | roles                        | create           | Criar role                                   |
| 57f35f00-777c-4224-b96a-9bdd6f05cb84 | roles                        | update           | Atualizar role                               |
| 53308a34-09d3-4322-8d83-ea899ecded0e | permissions                  | read             | Visualizar permissões                        |
| 5fea2318-0c50-46f4-9b97-0aab31792a13 | audit                        | read             | Visualizar logs de auditoria                 |
| 5b258330-c285-4f33-b95b-98620b203093 | audit                        | export           | Exportar logs de auditoria                   |
| 682747bb-fd89-4459-8b0f-c529ee57cc16 | files                        | create           | Upload de arquivo                            |
| 9fbd2f1c-272d-4732-a94f-c9099de90a37 | files                        | update           | Atualizar arquivo                            |
| 4bd7d615-9d9c-4646-8ec0-0a46a91ff83d | documents                    | update           | Atualizar documento                          |
| 733db0f9-366f-4112-9132-9226367fdddb | documents                    | publish          | Publicar documento                           |
| 2ac90a4c-40b7-424a-b795-e5a48dad1422 | jobs                         | archive          | Arquivar vaga                                |
| 4b6b2149-1529-49ba-9a08-8f71e56116da | applications                 | approve          | Aprovar candidatura                          |
| 3669732e-1b3a-479c-9b02-ca0ceff6a9b9 | finance                      | read             | Visualizar financeiro                        |
| 5edc3c55-f8b1-4aa1-9d23-031d218a49c4 | finance                      | create           | Criar lançamento financeiro                  |
| 6f4fd139-63ee-4268-8999-96fb889bc457 | finance                      | update           | Atualizar lançamento financeiro              |
| f12784ab-1068-481d-b889-bc450fd67126 | finance                      | delete           | Remover lançamento financeiro                |
| 01df682c-ee1d-49cb-a324-721262e34243 | finance                      | approve          | Aprovar pagamento                            |
| 974c8211-8db6-422f-b197-accd54c5c03a | finance                      | reconcile        | Reconciliar lançamento                       |
| 91b172c2-61ae-47f0-8ac7-82de89f9b369 | finance                      | export           | Exportar financeiro                          |
| ad27ab98-b8a3-4a64-84c7-bfcda8a00af5 | billing                      | read             | Visualizar faturamento                       |
| 8fdc7b37-86b6-4b45-8909-6dc35cb25514 | billing                      | create           | Criar fatura                                 |
| d4091ced-da85-4abe-9c52-c3261469e156 | billing                      | update           | Atualizar fatura                             |
| 06f737b5-b5ed-4eb5-b690-72da57f2f969 | billing                      | cancel           | Cancelar fatura                              |
| 71d53a4a-d77d-4a7a-9bc0-1970f4ba3010 | billing                      | export           | Exportar faturamento                         |
| dd6cbdc4-06c6-4a18-a04f-8bfbb8e3305f | stock_movements              | export           | Exportar movimentações                       |
| 475e33fb-2323-4bc1-a38f-3ceef8362f03 | service_orders               | cancel           | Cancelar ordem de serviço                    |
| 6d3755fe-05a0-4e13-bfcc-73dcd35618a1 | support_tickets              | close            | Fechar chamado                               |
| 1bef5b01-0272-4a14-ad42-fe9d17203a37 | reports                      | read             | Ler relatórios                               |
| 95f461c2-c031-4da8-a4f4-5adeb964da29 | reports                      | generate         | Gerar relatório                              |
| 6095bf39-8fd8-45f9-afab-2c4d948b0cff | reports                      | export           | Exportar relatório                           |
| 7c1f1e1c-1dfa-4180-9c86-fea6a93bad9c | integrations                 | manage           | Gerenciar integrações                        |
| db7a2627-3726-4a54-82ad-51236f694666 | integrations                 | create           | Criar integração                             |
| 7d9d5e96-ea59-4045-b2cb-5a72c6ac4e2f | integrations                 | update           | Atualizar integração                         |
| aae4ef2f-6f16-486a-b341-b5bf50409ae1 | integrations                 | delete           | Remover integração                           |
| b62f2fc7-d725-454d-8cb3-0aa6fe2f0a31 | integrations                 | test             | Testar integração                            |
| d8a5691a-694a-418b-b5b6-8fc04a6b8481 | tenant                       | manage           | Gerenciar tenant                             |
| e47bb006-a15f-4386-bc6c-66095ed6abbb | tenant                       | update           | tenant.update                                |
| 7d3e0caa-bc36-4b4b-b8b3-be5b47e41c3f | finance.dashboard            | read             | finance.dashboard.read                       |
| a8f412a0-5044-4f83-91e2-f308a7bd92bd | finance.accounts_payable     | read             | finance.accounts_payable.read                |
| f1b2919f-933b-4d24-8790-1cd4b81270f3 | finance.accounts_payable     | create           | finance.accounts_payable.create              |
| c79563ac-8700-4d81-9088-64bd1a3f0a16 | finance.accounts_payable     | update           | finance.accounts_payable.update              |
| 16b8ced7-fcee-46d0-8286-7b9a29cb3213 | finance.accounts_payable     | delete           | finance.accounts_payable.delete              |
| 67e2bbac-94dd-4610-8e21-2ab3a414136e | finance.accounts_receivable  | read             | finance.accounts_receivable.read             |
| bc5501b0-b714-4853-9499-ef24c7b13f70 | finance.accounts_receivable  | create           | finance.accounts_receivable.create           |
| f534ae9c-0ca2-46d7-b1fd-13f26a6bd324 | finance.accounts_receivable  | update           | finance.accounts_receivable.update           |
| de528b31-86d2-4fe5-aac2-f89e63122128 | finance.accounts_receivable  | delete           | finance.accounts_receivable.delete           |
| ca20af39-39cb-418f-b53b-de346ae04b59 | finance.cashflow             | read             | finance.cashflow.read                        |
| 07c9a6a8-be80-4dfb-920f-c50eea874c8e | finance.billing              | read             | finance.billing.read                         |
| 0243e291-e6ce-4834-bcdf-b2dca8003735 | finance.billing              | create           | finance.billing.create                       |
| 4051eb26-9af4-450f-b56f-3ad54354325c | finance.billing              | update           | finance.billing.update                       |
| abb964f2-8cc8-4004-a026-70a8386ace57 | finance.billing              | cancel           | finance.billing.cancel                       |
| dbfe8d96-8992-4e09-b5a9-056a8244806c | finance.reports              | read             | finance.reports.read                         |
| f93e4881-24bd-4aa2-880f-4d7d36f20030 | finance.reports              | export           | finance.reports.export                       |
| 61fec18f-89f9-4ae1-9da9-1b16961a878a | finance.suppliers            | read             | finance.suppliers.read                       |
| 6714e02f-74ce-44aa-98a3-24fa3003e8df | fiscal.dashboard             | read             | fiscal.dashboard.read                        |
| ab6871b3-ebe0-4164-8a78-8bb18fdec007 | fiscal.invoices              | read             | Visualizar notas fiscais                     |
| 338ab74e-1cc0-477c-befb-44b512c0a87d | fiscal.invoices              | issue            | fiscal.invoices.issue                        |
| 5f998bde-84b9-45fd-a3b9-dc0ecbdd8557 | fiscal.invoices              | cancel           | Cancelar nota fiscal                         |
| 0ce633a8-1c5e-431e-99f6-99d5746647fe | fiscal.invoices              | void             | fiscal.invoices.void                         |
| bf8c792d-1c8e-46ad-a040-b3960cfd05e1 | fiscal.taxes                 | read             | fiscal.taxes.read                            |
| 08b61e59-e035-4b8c-95eb-5db21846f796 | fiscal.reports               | read             | Visualizar relatórios fiscais                |
| 2a4fa766-b952-4892-914e-2f6ce05f5524 | fiscal.reports               | export           | fiscal.reports.export                        |
| 16b1c2f7-df61-4e32-9e72-bf460ad83e3e | accounting.dashboard         | read             | accounting.dashboard.read                    |
| 7e496485-3fb0-41e1-ad60-94831d2d15d6 | accounting.chart_of_accounts | read             | accounting.chart_of_accounts.read            |
| e37ba460-7323-4838-bbae-4480002af210 | accounting.chart_of_accounts | create           | accounting.chart_of_accounts.create          |
| 11189606-e807-4d7a-9a39-dfcdcffbce2d | accounting.chart_of_accounts | update           | accounting.chart_of_accounts.update          |
| 5eb9d2ea-288a-4822-982a-12d04848a1c1 | accounting.chart_of_accounts | delete           | accounting.chart_of_accounts.delete          |
| 57a96660-db65-45e7-aa58-b13142b1245f | accounting.entries           | read             | Visualizar lançamentos                       |
| eb2fbc36-d86c-43b4-a741-c5a837187f21 | accounting.entries           | create           | Criar lançamento                             |
| 3cc84da5-0a36-4501-881c-dcd2d237bcb2 | accounting.entries           | update           | Atualizar lançamento                         |
| 5f139992-aff7-4508-85b5-a1a4ab54ed94 | accounting.entries           | delete           | Remover lançamento                           |
| 33ff61eb-ba10-4f44-bbad-f9e8896d0f7d | accounting.trial_balance     | read             | accounting.trial_balance.read                |
| 3bdaf17d-44fd-4ccb-8055-a86df89850b6 | accounting.reconciliation    | read             | accounting.reconciliation.read               |
| cbc3b6d4-91ef-4ad8-9273-20adc1957d15 | accounting.reports           | read             | Visualizar relatórios contábeis              |
| 2efa8306-3ca4-4849-add5-be7677832201 | accounting.reports           | export           | accounting.reports.export                    |

### operator (tenant)

| Permission                           | Resource          | Action | Description            |
| ------------------------------------ | ----------------- | ------ | ---------------------- |
| a4eb685e-4786-44da-9424-ba5c717010d2 | companies         | create | Criar empresa          |
| 5c9e957d-8a99-4d19-8de1-469a526e85dc | companies         | read   | Ler empresa            |
| 0e773490-f9c3-4540-95d0-534226a9896a | contracts         | create | Criar contrato         |
| cec25721-f1fe-4560-a86a-d36741b43891 | contracts         | read   | Ler contrato           |
| 43d5bac1-92d6-4580-bde9-e3b6ee3c6f26 | documents         | create | Criar documento        |
| 2f94fb10-9033-472b-9fb1-6d5c47e2b117 | documents         | read   | Ler documento          |
| 425055aa-9fea-4203-b869-1d1a77e43016 | files             | read   | Ler arquivo            |
| 2e0a6201-20f4-489b-8e3e-fb042cb7ff01 | products          | create | Criar produto          |
| 13322f98-970c-41ff-9903-3a8f922d7f71 | products          | read   | Ler produto            |
| bf709be3-1926-4bad-ae68-8429b2f99794 | purchase_orders   | create | Criar pedido de compra |
| afaa01f4-6ee6-407a-a320-ba31dca7d1a7 | purchase_orders   | read   | Ler pedido de compra   |
| 9afe631f-1a1c-41c2-91db-11ce0af5ee21 | purchase_receipts | create | Criar recebimento      |
| ed76790a-c742-4d45-8f9f-38bbe4ed51fe | purchase_receipts | read   | Ler recebimento        |
| 2712e7f0-c117-464e-b6c5-add090f68d85 | service_orders    | create | Criar ordem de serviço |
| 0eade96f-6d8a-4f9a-a388-ecdf8b7405d7 | service_orders    | read   | Ler ordem de serviço   |
| a6671cf6-95d2-4205-956c-71f83a22d90d | stock_movements   | create | Criar movimentação     |
| 880caed1-8255-4bef-86a2-f1828e7f9536 | stock_movements   | read   | Ler movimentação       |
| 1c283da0-f29d-4cc4-807b-d5c6c9293e99 | support_tickets   | create | Criar ticket           |
| 9d0faa6a-4ea2-4bab-b2ae-3608d2e20141 | support_tickets   | read   | Ler ticket             |
| 7038a064-aa1d-4e88-a3ae-e81a49e975a3 | tasks             | create | Criar tarefa           |
| 20032d59-4bf6-46f9-aff0-78965e34a68e | tasks             | read   | Ler tarefa             |

### operations_manager (tenant)

| Permission                           | Resource          | Action   | Description                |
| ------------------------------------ | ----------------- | -------- | -------------------------- |
| a4eb685e-4786-44da-9424-ba5c717010d2 | companies         | create   | Criar empresa              |
| 5c9e957d-8a99-4d19-8de1-469a526e85dc | companies         | read     | Ler empresa                |
| 73b96008-1e57-4c03-9438-f5d0164df60b | companies         | update   | Atualizar empresa          |
| 0e773490-f9c3-4540-95d0-534226a9896a | contracts         | create   | Criar contrato             |
| cec25721-f1fe-4560-a86a-d36741b43891 | contracts         | read     | Ler contrato               |
| be857fdf-c37a-411b-8353-7e0b5c4f54bb | contracts         | update   | Atualizar contrato         |
| 81a59683-d8d4-4b39-81cd-8468ca7df587 | dashboard         | read     | Ler dashboard              |
| 43d5bac1-92d6-4580-bde9-e3b6ee3c6f26 | documents         | create   | Criar documento            |
| 2f94fb10-9033-472b-9fb1-6d5c47e2b117 | documents         | read     | Ler documento              |
| 425055aa-9fea-4203-b869-1d1a77e43016 | files             | read     | Ler arquivo                |
| ea7fa862-3f34-40b5-b97c-15c73b46151d | people            | create   | Criar pessoa               |
| 0d4761e4-1151-4cc5-b501-0b3907e6eeb9 | people            | read     | Ler pessoa                 |
| 9f3ed31c-4e44-46aa-bb57-f848ec5028b5 | people            | update   | Atualizar pessoa           |
| 2e0a6201-20f4-489b-8e3e-fb042cb7ff01 | products          | create   | Criar produto              |
| 13322f98-970c-41ff-9903-3a8f922d7f71 | products          | read     | Ler produto                |
| 8aba243f-a68f-400f-bed1-40fc0a611fad | products          | update   | Atualizar produto          |
| bf709be3-1926-4bad-ae68-8429b2f99794 | purchase_orders   | create   | Criar pedido de compra     |
| afaa01f4-6ee6-407a-a320-ba31dca7d1a7 | purchase_orders   | read     | Ler pedido de compra       |
| 234900b7-5537-41b5-bbf1-2091df6cfbd6 | purchase_orders   | update   | Atualizar pedido de compra |
| 9afe631f-1a1c-41c2-91db-11ce0af5ee21 | purchase_receipts | create   | Criar recebimento          |
| ed76790a-c742-4d45-8f9f-38bbe4ed51fe | purchase_receipts | read     | Ler recebimento            |
| 1bef5b01-0272-4a14-ad42-fe9d17203a37 | reports           | read     | Ler relatórios             |
| 2712e7f0-c117-464e-b6c5-add090f68d85 | service_orders    | create   | Criar ordem de serviço     |
| 0eade96f-6d8a-4f9a-a388-ecdf8b7405d7 | service_orders    | read     | Ler ordem de serviço       |
| b332c3aa-67e7-43c8-8327-9bcf14471d25 | service_orders    | update   | Atualizar ordem de serviço |
| a6671cf6-95d2-4205-956c-71f83a22d90d | stock_movements   | create   | Criar movimentação         |
| 880caed1-8255-4bef-86a2-f1828e7f9536 | stock_movements   | read     | Ler movimentação           |
| 1c283da0-f29d-4cc4-807b-d5c6c9293e99 | support_tickets   | create   | Criar ticket               |
| 9d0faa6a-4ea2-4bab-b2ae-3608d2e20141 | support_tickets   | read     | Ler ticket                 |
| 34286b88-6a06-4e13-a53d-1b00d601e432 | support_tickets   | update   | Atualizar ticket           |
| 7038a064-aa1d-4e88-a3ae-e81a49e975a3 | tasks             | create   | Criar tarefa               |
| 20032d59-4bf6-46f9-aff0-78965e34a68e | tasks             | read     | Ler tarefa                 |
| a7d0c6ac-c07a-47aa-a2f3-781f0474e3d0 | tasks             | update   | Atualizar tarefa           |
| 6095bf39-8fd8-45f9-afab-2c4d948b0cff | reports           | export   | Exportar relatório         |
| 90e063b7-6a15-4caa-99b6-e11a419fbf16 | service_orders    | complete | Concluir ordem de serviço  |
| 95f461c2-c031-4da8-a4f4-5adeb964da29 | reports           | generate | Gerar relatório            |

### finance (tenant)

| Permission                           | Resource                    | Action | Description                        |
| ------------------------------------ | --------------------------- | ------ | ---------------------------------- |
| 0d4761e4-1151-4cc5-b501-0b3907e6eeb9 | people                      | read   | Ler pessoa                         |
| 5c9e957d-8a99-4d19-8de1-469a526e85dc | companies                   | read   | Ler empresa                        |
| 13322f98-970c-41ff-9903-3a8f922d7f71 | products                    | read   | Ler produto                        |
| a6671cf6-95d2-4205-956c-71f83a22d90d | stock_movements             | create | Criar movimentação                 |
| 880caed1-8255-4bef-86a2-f1828e7f9536 | stock_movements             | read   | Ler movimentação                   |
| bf709be3-1926-4bad-ae68-8429b2f99794 | purchase_orders             | create | Criar pedido de compra             |
| afaa01f4-6ee6-407a-a320-ba31dca7d1a7 | purchase_orders             | read   | Ler pedido de compra               |
| 9afe631f-1a1c-41c2-91db-11ce0af5ee21 | purchase_receipts           | create | Criar recebimento                  |
| ed76790a-c742-4d45-8f9f-38bbe4ed51fe | purchase_receipts           | read   | Ler recebimento                    |
| 2712e7f0-c117-464e-b6c5-add090f68d85 | service_orders              | create | Criar ordem de serviço             |
| 0eade96f-6d8a-4f9a-a388-ecdf8b7405d7 | service_orders              | read   | Ler ordem de serviço               |
| cec25721-f1fe-4560-a86a-d36741b43891 | contracts                   | read   | Ler contrato                       |
| 7038a064-aa1d-4e88-a3ae-e81a49e975a3 | tasks                       | create | Criar tarefa                       |
| 20032d59-4bf6-46f9-aff0-78965e34a68e | tasks                       | read   | Ler tarefa                         |
| 1c283da0-f29d-4cc4-807b-d5c6c9293e99 | support_tickets             | create | Criar ticket                       |
| 9d0faa6a-4ea2-4bab-b2ae-3608d2e20141 | support_tickets             | read   | Ler ticket                         |
| 425055aa-9fea-4203-b869-1d1a77e43016 | files                       | read   | Ler arquivo                        |
| 43d5bac1-92d6-4580-bde9-e3b6ee3c6f26 | documents                   | create | Criar documento                    |
| 2f94fb10-9033-472b-9fb1-6d5c47e2b117 | documents                   | read   | Ler documento                      |
| 81a59683-d8d4-4b39-81cd-8468ca7df587 | dashboard                   | read   | Ler dashboard                      |
| 3669732e-1b3a-479c-9b02-ca0ceff6a9b9 | finance                     | read   | Visualizar financeiro              |
| 5edc3c55-f8b1-4aa1-9d23-031d218a49c4 | finance                     | create | Criar lançamento financeiro        |
| 6f4fd139-63ee-4268-8999-96fb889bc457 | finance                     | update | Atualizar lançamento financeiro    |
| 91b172c2-61ae-47f0-8ac7-82de89f9b369 | finance                     | export | Exportar financeiro                |
| ad27ab98-b8a3-4a64-84c7-bfcda8a00af5 | billing                     | read   | Visualizar faturamento             |
| 8fdc7b37-86b6-4b45-8909-6dc35cb25514 | billing                     | create | Criar fatura                       |
| d4091ced-da85-4abe-9c52-c3261469e156 | billing                     | update | Atualizar fatura                   |
| 1bef5b01-0272-4a14-ad42-fe9d17203a37 | reports                     | read   | Ler relatórios                     |
| 7d3e0caa-bc36-4b4b-b8b3-be5b47e41c3f | finance.dashboard           | read   | finance.dashboard.read             |
| a8f412a0-5044-4f83-91e2-f308a7bd92bd | finance.accounts_payable    | read   | finance.accounts_payable.read      |
| f1b2919f-933b-4d24-8790-1cd4b81270f3 | finance.accounts_payable    | create | finance.accounts_payable.create    |
| c79563ac-8700-4d81-9088-64bd1a3f0a16 | finance.accounts_payable    | update | finance.accounts_payable.update    |
| 67e2bbac-94dd-4610-8e21-2ab3a414136e | finance.accounts_receivable | read   | finance.accounts_receivable.read   |
| bc5501b0-b714-4853-9499-ef24c7b13f70 | finance.accounts_receivable | create | finance.accounts_receivable.create |
| f534ae9c-0ca2-46d7-b1fd-13f26a6bd324 | finance.accounts_receivable | update | finance.accounts_receivable.update |
| 07c9a6a8-be80-4dfb-920f-c50eea874c8e | finance.billing             | read   | finance.billing.read               |
| 0243e291-e6ce-4834-bcdf-b2dca8003735 | finance.billing             | create | finance.billing.create             |
| 4051eb26-9af4-450f-b56f-3ad54354325c | finance.billing             | update | finance.billing.update             |
| 6714e02f-74ce-44aa-98a3-24fa3003e8df | fiscal.dashboard            | read   | fiscal.dashboard.read              |
| ab6871b3-ebe0-4164-8a78-8bb18fdec007 | fiscal.invoices             | read   | Visualizar notas fiscais           |

### support (tenant)

| Permission                           | Resource        | Action  | Description      |
| ------------------------------------ | --------------- | ------- | ---------------- |
| 1c283da0-f29d-4cc4-807b-d5c6c9293e99 | support_tickets | create  | Criar ticket     |
| 9d0faa6a-4ea2-4bab-b2ae-3608d2e20141 | support_tickets | read    | Ler ticket       |
| 34286b88-6a06-4e13-a53d-1b00d601e432 | support_tickets | update  | Atualizar ticket |
| 3d54245f-f459-4439-a126-643dd2f63882 | chat            | create  | Criar conversa   |
| ea802c96-8f3c-4a7f-8206-2fa3d652093d | chat            | read    | Ler conversa     |
| 6d3755fe-05a0-4e13-bfcc-73dcd35618a1 | support_tickets | close   | Fechar chamado   |
| 81a59683-d8d4-4b39-81cd-8468ca7df587 | dashboard       | read    | Ler dashboard    |
| 425055aa-9fea-4203-b869-1d1a77e43016 | files           | read    | Ler arquivo      |
| 952e6d7f-442c-4428-a220-a8b88c7f244d | support_tickets | resolve | Resolver ticket  |
| 0d4761e4-1151-4cc5-b501-0b3907e6eeb9 | people          | read    | Ler pessoa       |

### commercial (tenant)

| Permission                           | Resource          | Action | Description                |
| ------------------------------------ | ----------------- | ------ | -------------------------- |
| 0d4761e4-1151-4cc5-b501-0b3907e6eeb9 | people            | read   | Ler pessoa                 |
| 5c9e957d-8a99-4d19-8de1-469a526e85dc | companies         | read   | Ler empresa                |
| 73b96008-1e57-4c03-9438-f5d0164df60b | companies         | update | Atualizar empresa          |
| bf709be3-1926-4bad-ae68-8429b2f99794 | purchase_orders   | create | Criar pedido de compra     |
| afaa01f4-6ee6-407a-a320-ba31dca7d1a7 | purchase_orders   | read   | Ler pedido de compra       |
| 9afe631f-1a1c-41c2-91db-11ce0af5ee21 | purchase_receipts | create | Criar recebimento          |
| ed76790a-c742-4d45-8f9f-38bbe4ed51fe | purchase_receipts | read   | Ler recebimento            |
| 2712e7f0-c117-464e-b6c5-add090f68d85 | service_orders    | create | Criar ordem de serviço     |
| 0eade96f-6d8a-4f9a-a388-ecdf8b7405d7 | service_orders    | read   | Ler ordem de serviço       |
| 0e773490-f9c3-4540-95d0-534226a9896a | contracts         | create | Criar contrato             |
| cec25721-f1fe-4560-a86a-d36741b43891 | contracts         | read   | Ler contrato               |
| 7038a064-aa1d-4e88-a3ae-e81a49e975a3 | tasks             | create | Criar tarefa               |
| 20032d59-4bf6-46f9-aff0-78965e34a68e | tasks             | read   | Ler tarefa                 |
| 1c283da0-f29d-4cc4-807b-d5c6c9293e99 | support_tickets   | create | Criar ticket               |
| 9d0faa6a-4ea2-4bab-b2ae-3608d2e20141 | support_tickets   | read   | Ler ticket                 |
| 425055aa-9fea-4203-b869-1d1a77e43016 | files             | read   | Ler arquivo                |
| 43d5bac1-92d6-4580-bde9-e3b6ee3c6f26 | documents         | create | Criar documento            |
| 2f94fb10-9033-472b-9fb1-6d5c47e2b117 | documents         | read   | Ler documento              |
| 81a59683-d8d4-4b39-81cd-8468ca7df587 | dashboard         | read   | Ler dashboard              |
| 9723dca7-7a58-4baa-8a2d-09bed345fe1a | contracts         | renew  | Renovar contrato           |
| a4eb685e-4786-44da-9424-ba5c717010d2 | companies         | create | Criar empresa              |
| b332c3aa-67e7-43c8-8327-9bcf14471d25 | service_orders    | update | Atualizar ordem de serviço |
| be857fdf-c37a-411b-8353-7e0b5c4f54bb | contracts         | update | Atualizar contrato         |
| 1bef5b01-0272-4a14-ad42-fe9d17203a37 | reports           | read   | Ler relatórios             |

### stock_manager (tenant)

| Permission                           | Resource          | Action | Description            |
| ------------------------------------ | ----------------- | ------ | ---------------------- |
| 13322f98-970c-41ff-9903-3a8f922d7f71 | products          | read   | Ler produto            |
| 8aba243f-a68f-400f-bed1-40fc0a611fad | products          | update | Atualizar produto      |
| a6671cf6-95d2-4205-956c-71f83a22d90d | stock_movements   | create | Criar movimentação     |
| 880caed1-8255-4bef-86a2-f1828e7f9536 | stock_movements   | read   | Ler movimentação       |
| bf709be3-1926-4bad-ae68-8429b2f99794 | purchase_orders   | create | Criar pedido de compra |
| afaa01f4-6ee6-407a-a320-ba31dca7d1a7 | purchase_orders   | read   | Ler pedido de compra   |
| 9afe631f-1a1c-41c2-91db-11ce0af5ee21 | purchase_receipts | create | Criar recebimento      |
| ed76790a-c742-4d45-8f9f-38bbe4ed51fe | purchase_receipts | read   | Ler recebimento        |
| 81a59683-d8d4-4b39-81cd-8468ca7df587 | dashboard         | read   | Ler dashboard          |
| 1bef5b01-0272-4a14-ad42-fe9d17203a37 | reports           | read   | Ler relatórios         |

### security_manager (tenant)

| Permission                           | Resource        | Action | Description              |
| ------------------------------------ | --------------- | ------ | ------------------------ |
| 0d4761e4-1151-4cc5-b501-0b3907e6eeb9 | people          | read   | Ler pessoa               |
| 9f3ed31c-4e44-46aa-bb57-f848ec5028b5 | people          | update | Atualizar pessoa         |
| 43d5bac1-92d6-4580-bde9-e3b6ee3c6f26 | documents       | create | Criar documento          |
| 2f94fb10-9033-472b-9fb1-6d5c47e2b117 | documents       | read   | Ler documento            |
| ec80fcb6-bbd7-4e37-b75f-a408c4ecc802 | security_events | read   | Ler eventos de segurança |
| 81a59683-d8d4-4b39-81cd-8468ca7df587 | dashboard       | read   | Ler dashboard            |
| 425055aa-9fea-4203-b869-1d1a77e43016 | files           | read   | Ler arquivo              |

### facilities_manager (tenant)

| Permission                           | Resource       | Action   | Description                |
| ------------------------------------ | -------------- | -------- | -------------------------- |
| 2712e7f0-c117-464e-b6c5-add090f68d85 | service_orders | create   | Criar ordem de serviço     |
| 0eade96f-6d8a-4f9a-a388-ecdf8b7405d7 | service_orders | read     | Ler ordem de serviço       |
| b332c3aa-67e7-43c8-8327-9bcf14471d25 | service_orders | update   | Atualizar ordem de serviço |
| 90e063b7-6a15-4caa-99b6-e11a419fbf16 | service_orders | complete | Concluir ordem de serviço  |
| 7038a064-aa1d-4e88-a3ae-e81a49e975a3 | tasks          | create   | Criar tarefa               |
| 20032d59-4bf6-46f9-aff0-78965e34a68e | tasks          | read     | Ler tarefa                 |
| a7d0c6ac-c07a-47aa-a2f3-781f0474e3d0 | tasks          | update   | Atualizar tarefa           |
| 9da75044-a113-4300-b007-96ba51da349d | tasks          | assign   | Atribuir tarefa            |
| 425055aa-9fea-4203-b869-1d1a77e43016 | files          | read     | Ler arquivo                |
| 43d5bac1-92d6-4580-bde9-e3b6ee3c6f26 | documents      | create   | Criar documento            |
| 2f94fb10-9033-472b-9fb1-6d5c47e2b117 | documents      | read     | Ler documento              |
| 81a59683-d8d4-4b39-81cd-8468ca7df587 | dashboard      | read     | Ler dashboard              |

### lawyer (tenant)

| Permission                           | Resource  | Action  | Description               |
| ------------------------------------ | --------- | ------- | ------------------------- |
| 0d4761e4-1151-4cc5-b501-0b3907e6eeb9 | people    | read    | Ler pessoa                |
| 0e773490-f9c3-4540-95d0-534226a9896a | contracts | create  | Criar contrato            |
| cec25721-f1fe-4560-a86a-d36741b43891 | contracts | read    | Ler contrato              |
| be857fdf-c37a-411b-8353-7e0b5c4f54bb | contracts | update  | Atualizar contrato        |
| 425055aa-9fea-4203-b869-1d1a77e43016 | files     | read    | Ler arquivo               |
| 43d5bac1-92d6-4580-bde9-e3b6ee3c6f26 | documents | create  | Criar documento           |
| 2f94fb10-9033-472b-9fb1-6d5c47e2b117 | documents | read    | Ler documento             |
| 4adefd0e-da26-40b7-b305-f4bdc5ccec5b | documents | version | Criar versão de documento |
| 81a59683-d8d4-4b39-81cd-8468ca7df587 | dashboard | read    | Ler dashboard             |
| 4bd7d615-9d9c-4646-8ec0-0a46a91ff83d | documents | update  | Atualizar documento       |

### it_admin (tenant)

| Permission                           | Resource  | Action | Description       |
| ------------------------------------ | --------- | ------ | ----------------- |
| ea7fa862-3f34-40b5-b97c-15c73b46151d | people    | create | Criar pessoa      |
| 0d4761e4-1151-4cc5-b501-0b3907e6eeb9 | people    | read   | Ler pessoa        |
| 9f3ed31c-4e44-46aa-bb57-f848ec5028b5 | people    | update | Atualizar pessoa  |
| c47a1dd6-4942-429c-8709-6fa9131abee4 | roles     | create | Criar role        |
| 738d6262-c02d-40ae-b2f9-93af299ed743 | roles     | read   | Ler role          |
| 57f35f00-777c-4224-b96a-9bdd6f05cb84 | roles     | update | Atualizar role    |
| 90187ae0-dd67-4a9d-a345-bb84c6b9118d | files     | upload | Enviar arquivo    |
| 425055aa-9fea-4203-b869-1d1a77e43016 | files     | read   | Ler arquivo       |
| 43d5bac1-92d6-4580-bde9-e3b6ee3c6f26 | documents | create | Criar documento   |
| 2f94fb10-9033-472b-9fb1-6d5c47e2b117 | documents | read   | Ler documento     |
| 81a59683-d8d4-4b39-81cd-8468ca7df587 | dashboard | read   | Ler dashboard     |
| 682747bb-fd89-4459-8b0f-c529ee57cc16 | files     | create | Upload de arquivo |
| 9fbd2f1c-272d-4732-a94f-c9099de90a37 | files     | update | Atualizar arquivo |

### viewer (tenant)

| Permission                           | Resource          | Action | Description          |
| ------------------------------------ | ----------------- | ------ | -------------------- |
| 0d4761e4-1151-4cc5-b501-0b3907e6eeb9 | people            | read   | Ler pessoa           |
| 5c9e957d-8a99-4d19-8de1-469a526e85dc | companies         | read   | Ler empresa          |
| 13322f98-970c-41ff-9903-3a8f922d7f71 | products          | read   | Ler produto          |
| 880caed1-8255-4bef-86a2-f1828e7f9536 | stock_movements   | read   | Ler movimentação     |
| afaa01f4-6ee6-407a-a320-ba31dca7d1a7 | purchase_orders   | read   | Ler pedido de compra |
| ed76790a-c742-4d45-8f9f-38bbe4ed51fe | purchase_receipts | read   | Ler recebimento      |
| 0eade96f-6d8a-4f9a-a388-ecdf8b7405d7 | service_orders    | read   | Ler ordem de serviço |
| cec25721-f1fe-4560-a86a-d36741b43891 | contracts         | read   | Ler contrato         |
| 20032d59-4bf6-46f9-aff0-78965e34a68e | tasks             | read   | Ler tarefa           |
| 9d0faa6a-4ea2-4bab-b2ae-3608d2e20141 | support_tickets   | read   | Ler ticket           |
| 425055aa-9fea-4203-b869-1d1a77e43016 | files             | read   | Ler arquivo          |
| 2f94fb10-9033-472b-9fb1-6d5c47e2b117 | documents         | read   | Ler documento        |
| 1bef5b01-0272-4a14-ad42-fe9d17203a37 | reports           | read   | Ler relatórios       |
| 81a59683-d8d4-4b39-81cd-8468ca7df587 | dashboard         | read   | Ler dashboard        |

### finance_manager (tenant)

| Permission                           | Resource                    | Action    | Description                        |
| ------------------------------------ | --------------------------- | --------- | ---------------------------------- |
| 81a59683-d8d4-4b39-81cd-8468ca7df587 | dashboard                   | read      | Ler dashboard                      |
| 3669732e-1b3a-479c-9b02-ca0ceff6a9b9 | finance                     | read      | Visualizar financeiro              |
| 5edc3c55-f8b1-4aa1-9d23-031d218a49c4 | finance                     | create    | Criar lançamento financeiro        |
| 6f4fd139-63ee-4268-8999-96fb889bc457 | finance                     | update    | Atualizar lançamento financeiro    |
| f12784ab-1068-481d-b889-bc450fd67126 | finance                     | delete    | Remover lançamento financeiro      |
| 01df682c-ee1d-49cb-a324-721262e34243 | finance                     | approve   | Aprovar pagamento                  |
| 974c8211-8db6-422f-b197-accd54c5c03a | finance                     | reconcile | Reconciliar lançamento             |
| 91b172c2-61ae-47f0-8ac7-82de89f9b369 | finance                     | export    | Exportar financeiro                |
| 88f9b040-2cb6-49ef-b38e-20e5e0c0a628 | finance                     | forecast  | Projetar fluxo de caixa            |
| ad27ab98-b8a3-4a64-84c7-bfcda8a00af5 | billing                     | read      | Visualizar faturamento             |
| 8fdc7b37-86b6-4b45-8909-6dc35cb25514 | billing                     | create    | Criar fatura                       |
| d4091ced-da85-4abe-9c52-c3261469e156 | billing                     | update    | Atualizar fatura                   |
| 06f737b5-b5ed-4eb5-b690-72da57f2f969 | billing                     | cancel    | Cancelar fatura                    |
| 71d53a4a-d77d-4a7a-9bc0-1970f4ba3010 | billing                     | export    | Exportar faturamento               |
| 1bef5b01-0272-4a14-ad42-fe9d17203a37 | reports                     | read      | Ler relatórios                     |
| 95f461c2-c031-4da8-a4f4-5adeb964da29 | reports                     | generate  | Gerar relatório                    |
| 6095bf39-8fd8-45f9-afab-2c4d948b0cff | reports                     | export    | Exportar relatório                 |
| 5c9e957d-8a99-4d19-8de1-469a526e85dc | companies                   | read      | Ler empresa                        |
| 0d4761e4-1151-4cc5-b501-0b3907e6eeb9 | people                      | read      | Ler pessoa                         |
| 425055aa-9fea-4203-b869-1d1a77e43016 | files                       | read      | Ler arquivo                        |
| 7d3e0caa-bc36-4b4b-b8b3-be5b47e41c3f | finance.dashboard           | read      | finance.dashboard.read             |
| a8f412a0-5044-4f83-91e2-f308a7bd92bd | finance.accounts_payable    | read      | finance.accounts_payable.read      |
| f1b2919f-933b-4d24-8790-1cd4b81270f3 | finance.accounts_payable    | create    | finance.accounts_payable.create    |
| c79563ac-8700-4d81-9088-64bd1a3f0a16 | finance.accounts_payable    | update    | finance.accounts_payable.update    |
| 16b8ced7-fcee-46d0-8286-7b9a29cb3213 | finance.accounts_payable    | delete    | finance.accounts_payable.delete    |
| 67e2bbac-94dd-4610-8e21-2ab3a414136e | finance.accounts_receivable | read      | finance.accounts_receivable.read   |
| bc5501b0-b714-4853-9499-ef24c7b13f70 | finance.accounts_receivable | create    | finance.accounts_receivable.create |
| f534ae9c-0ca2-46d7-b1fd-13f26a6bd324 | finance.accounts_receivable | update    | finance.accounts_receivable.update |
| de528b31-86d2-4fe5-aac2-f89e63122128 | finance.accounts_receivable | delete    | finance.accounts_receivable.delete |
| ca20af39-39cb-418f-b53b-de346ae04b59 | finance.cashflow            | read      | finance.cashflow.read              |
| 07c9a6a8-be80-4dfb-920f-c50eea874c8e | finance.billing             | read      | finance.billing.read               |
| 0243e291-e6ce-4834-bcdf-b2dca8003735 | finance.billing             | create    | finance.billing.create             |
| 4051eb26-9af4-450f-b56f-3ad54354325c | finance.billing             | update    | finance.billing.update             |
| abb964f2-8cc8-4004-a026-70a8386ace57 | finance.billing             | cancel    | finance.billing.cancel             |
| dbfe8d96-8992-4e09-b5a9-056a8244806c | finance.reports             | read      | finance.reports.read               |
| f93e4881-24bd-4aa2-880f-4d7d36f20030 | finance.reports             | export    | finance.reports.export             |
| 61fec18f-89f9-4ae1-9da9-1b16961a878a | finance.suppliers           | read      | finance.suppliers.read             |
| 6714e02f-74ce-44aa-98a3-24fa3003e8df | fiscal.dashboard            | read      | fiscal.dashboard.read              |
| ab6871b3-ebe0-4164-8a78-8bb18fdec007 | fiscal.invoices             | read      | Visualizar notas fiscais           |
| 338ab74e-1cc0-477c-befb-44b512c0a87d | fiscal.invoices             | issue     | fiscal.invoices.issue              |
| 16b1c2f7-df61-4e32-9e72-bf460ad83e3e | accounting.dashboard        | read      | accounting.dashboard.read          |

### fiscal_manager (tenant)

| Permission                           | Resource             | Action   | Description                   |
| ------------------------------------ | -------------------- | -------- | ----------------------------- |
| 81a59683-d8d4-4b39-81cd-8468ca7df587 | dashboard            | read     | Ler dashboard                 |
| 3669732e-1b3a-479c-9b02-ca0ceff6a9b9 | finance              | read     | Visualizar financeiro         |
| 1bef5b01-0272-4a14-ad42-fe9d17203a37 | reports              | read     | Ler relatórios                |
| 95f461c2-c031-4da8-a4f4-5adeb964da29 | reports              | generate | Gerar relatório               |
| 6095bf39-8fd8-45f9-afab-2c4d948b0cff | reports              | export   | Exportar relatório            |
| 5c9e957d-8a99-4d19-8de1-469a526e85dc | companies            | read     | Ler empresa                   |
| 0d4761e4-1151-4cc5-b501-0b3907e6eeb9 | people               | read     | Ler pessoa                    |
| 425055aa-9fea-4203-b869-1d1a77e43016 | files                | read     | Ler arquivo                   |
| 6714e02f-74ce-44aa-98a3-24fa3003e8df | fiscal.dashboard     | read     | fiscal.dashboard.read         |
| ab6871b3-ebe0-4164-8a78-8bb18fdec007 | fiscal.invoices      | read     | Visualizar notas fiscais      |
| 338ab74e-1cc0-477c-befb-44b512c0a87d | fiscal.invoices      | issue    | fiscal.invoices.issue         |
| 5f998bde-84b9-45fd-a3b9-dc0ecbdd8557 | fiscal.invoices      | cancel   | Cancelar nota fiscal          |
| 0ce633a8-1c5e-431e-99f6-99d5746647fe | fiscal.invoices      | void     | fiscal.invoices.void          |
| bf8c792d-1c8e-46ad-a040-b3960cfd05e1 | fiscal.taxes         | read     | fiscal.taxes.read             |
| 08b61e59-e035-4b8c-95eb-5db21846f796 | fiscal.reports       | read     | Visualizar relatórios fiscais |
| 7d3e0caa-bc36-4b4b-b8b3-be5b47e41c3f | finance.dashboard    | read     | finance.dashboard.read        |
| 2a4fa766-b952-4892-914e-2f6ce05f5524 | fiscal.reports       | export   | fiscal.reports.export         |
| 16b1c2f7-df61-4e32-9e72-bf460ad83e3e | accounting.dashboard | read     | accounting.dashboard.read     |

### accountant (tenant)

| Permission                           | Resource                     | Action   | Description                         |
| ------------------------------------ | ---------------------------- | -------- | ----------------------------------- |
| 81a59683-d8d4-4b39-81cd-8468ca7df587 | dashboard                    | read     | Ler dashboard                       |
| 3669732e-1b3a-479c-9b02-ca0ceff6a9b9 | finance                      | read     | Visualizar financeiro               |
| 91b172c2-61ae-47f0-8ac7-82de89f9b369 | finance                      | export   | Exportar financeiro                 |
| 1bef5b01-0272-4a14-ad42-fe9d17203a37 | reports                      | read     | Ler relatórios                      |
| 95f461c2-c031-4da8-a4f4-5adeb964da29 | reports                      | generate | Gerar relatório                     |
| 6095bf39-8fd8-45f9-afab-2c4d948b0cff | reports                      | export   | Exportar relatório                  |
| 5c9e957d-8a99-4d19-8de1-469a526e85dc | companies                    | read     | Ler empresa                         |
| 425055aa-9fea-4203-b869-1d1a77e43016 | files                        | read     | Ler arquivo                         |
| 7e496485-3fb0-41e1-ad60-94831d2d15d6 | accounting.chart_of_accounts | read     | accounting.chart_of_accounts.read   |
| 5eb9d2ea-288a-4822-982a-12d04848a1c1 | accounting.chart_of_accounts | delete   | accounting.chart_of_accounts.delete |
| 3cc84da5-0a36-4501-881c-dcd2d237bcb2 | accounting.entries           | update   | Atualizar lançamento                |
| 3bdaf17d-44fd-4ccb-8055-a86df89850b6 | accounting.reconciliation    | read     | accounting.reconciliation.read      |
| 6714e02f-74ce-44aa-98a3-24fa3003e8df | fiscal.dashboard             | read     | fiscal.dashboard.read               |
| f93e4881-24bd-4aa2-880f-4d7d36f20030 | finance.reports              | export   | finance.reports.export              |
| e37ba460-7323-4838-bbae-4480002af210 | accounting.chart_of_accounts | create   | accounting.chart_of_accounts.create |
| 57a96660-db65-45e7-aa58-b13142b1245f | accounting.entries           | read     | Visualizar lançamentos              |
| 5f139992-aff7-4508-85b5-a1a4ab54ed94 | accounting.entries           | delete   | Remover lançamento                  |
| cbc3b6d4-91ef-4ad8-9273-20adc1957d15 | accounting.reports           | read     | Visualizar relatórios contábeis     |
| 2a4fa766-b952-4892-914e-2f6ce05f5524 | fiscal.reports               | export   | fiscal.reports.export               |
| 16b1c2f7-df61-4e32-9e72-bf460ad83e3e | accounting.dashboard         | read     | accounting.dashboard.read           |
| 11189606-e807-4d7a-9a39-dfcdcffbce2d | accounting.chart_of_accounts | update   | accounting.chart_of_accounts.update |
| eb2fbc36-d86c-43b4-a741-c5a837187f21 | accounting.entries           | create   | Criar lançamento                    |
| 33ff61eb-ba10-4f44-bbad-f9e8896d0f7d | accounting.trial_balance     | read     | accounting.trial_balance.read       |
| 2efa8306-3ca4-4849-add5-be7677832201 | accounting.reports           | export   | accounting.reports.export           |
| 7d3e0caa-bc36-4b4b-b8b3-be5b47e41c3f | finance.dashboard            | read     | finance.dashboard.read              |

### accounting_manager (tenant)

| Permission                           | Resource                     | Action   | Description                         |
| ------------------------------------ | ---------------------------- | -------- | ----------------------------------- |
| 81a59683-d8d4-4b39-81cd-8468ca7df587 | dashboard                    | read     | Ler dashboard                       |
| 3669732e-1b3a-479c-9b02-ca0ceff6a9b9 | finance                      | read     | Visualizar financeiro               |
| 1bef5b01-0272-4a14-ad42-fe9d17203a37 | reports                      | read     | Ler relatórios                      |
| 95f461c2-c031-4da8-a4f4-5adeb964da29 | reports                      | generate | Gerar relatório                     |
| 6095bf39-8fd8-45f9-afab-2c4d948b0cff | reports                      | export   | Exportar relatório                  |
| 5c9e957d-8a99-4d19-8de1-469a526e85dc | companies                    | read     | Ler empresa                         |
| 0d4761e4-1151-4cc5-b501-0b3907e6eeb9 | people                       | read     | Ler pessoa                          |
| 425055aa-9fea-4203-b869-1d1a77e43016 | files                        | read     | Ler arquivo                         |
| 7e496485-3fb0-41e1-ad60-94831d2d15d6 | accounting.chart_of_accounts | read     | accounting.chart_of_accounts.read   |
| 5eb9d2ea-288a-4822-982a-12d04848a1c1 | accounting.chart_of_accounts | delete   | accounting.chart_of_accounts.delete |
| 3cc84da5-0a36-4501-881c-dcd2d237bcb2 | accounting.entries           | update   | Atualizar lançamento                |
| 3bdaf17d-44fd-4ccb-8055-a86df89850b6 | accounting.reconciliation    | read     | accounting.reconciliation.read      |
| 6714e02f-74ce-44aa-98a3-24fa3003e8df | fiscal.dashboard             | read     | fiscal.dashboard.read               |
| e37ba460-7323-4838-bbae-4480002af210 | accounting.chart_of_accounts | create   | accounting.chart_of_accounts.create |
| 57a96660-db65-45e7-aa58-b13142b1245f | accounting.entries           | read     | Visualizar lançamentos              |
| 5f139992-aff7-4508-85b5-a1a4ab54ed94 | accounting.entries           | delete   | Remover lançamento                  |
| cbc3b6d4-91ef-4ad8-9273-20adc1957d15 | accounting.reports           | read     | Visualizar relatórios contábeis     |
| 7d3e0caa-bc36-4b4b-b8b3-be5b47e41c3f | finance.dashboard            | read     | finance.dashboard.read              |
| 16b1c2f7-df61-4e32-9e72-bf460ad83e3e | accounting.dashboard         | read     | accounting.dashboard.read           |
| 11189606-e807-4d7a-9a39-dfcdcffbce2d | accounting.chart_of_accounts | update   | accounting.chart_of_accounts.update |
| eb2fbc36-d86c-43b4-a741-c5a837187f21 | accounting.entries           | create   | Criar lançamento                    |
| 33ff61eb-ba10-4f44-bbad-f9e8896d0f7d | accounting.trial_balance     | read     | accounting.trial_balance.read       |
| 2efa8306-3ca4-4849-add5-be7677832201 | accounting.reports           | export   | accounting.reports.export           |

### billing_manager (tenant)

| Permission                           | Resource                 | Action   | Description                     |
| ------------------------------------ | ------------------------ | -------- | ------------------------------- |
| 81a59683-d8d4-4b39-81cd-8468ca7df587 | dashboard                | read     | Ler dashboard                   |
| ad27ab98-b8a3-4a64-84c7-bfcda8a00af5 | billing                  | read     | Visualizar faturamento          |
| 8fdc7b37-86b6-4b45-8909-6dc35cb25514 | billing                  | create   | Criar fatura                    |
| 71d53a4a-d77d-4a7a-9bc0-1970f4ba3010 | billing                  | export   | Exportar faturamento            |
| 6f4fd139-63ee-4268-8999-96fb889bc457 | finance                  | update   | Atualizar lançamento financeiro |
| 1bef5b01-0272-4a14-ad42-fe9d17203a37 | reports                  | read     | Ler relatórios                  |
| 5c9e957d-8a99-4d19-8de1-469a526e85dc | companies                | read     | Ler empresa                     |
| d4091ced-da85-4abe-9c52-c3261469e156 | billing                  | update   | Atualizar fatura                |
| 3669732e-1b3a-479c-9b02-ca0ceff6a9b9 | finance                  | read     | Visualizar financeiro           |
| 01df682c-ee1d-49cb-a324-721262e34243 | finance                  | approve  | Aprovar pagamento               |
| 95f461c2-c031-4da8-a4f4-5adeb964da29 | reports                  | generate | Gerar relatório                 |
| 0d4761e4-1151-4cc5-b501-0b3907e6eeb9 | people                   | read     | Ler pessoa                      |
| 06f737b5-b5ed-4eb5-b690-72da57f2f969 | billing                  | cancel   | Cancelar fatura                 |
| 5edc3c55-f8b1-4aa1-9d23-031d218a49c4 | finance                  | create   | Criar lançamento financeiro     |
| 91b172c2-61ae-47f0-8ac7-82de89f9b369 | finance                  | export   | Exportar financeiro             |
| 6095bf39-8fd8-45f9-afab-2c4d948b0cff | reports                  | export   | Exportar relatório              |
| 425055aa-9fea-4203-b869-1d1a77e43016 | files                    | read     | Ler arquivo                     |
| 07c9a6a8-be80-4dfb-920f-c50eea874c8e | finance.billing          | read     | finance.billing.read            |
| abb964f2-8cc8-4004-a026-70a8386ace57 | finance.billing          | cancel   | finance.billing.cancel          |
| f1b2919f-933b-4d24-8790-1cd4b81270f3 | finance.accounts_payable | create   | finance.accounts_payable.create |
| ab6871b3-ebe0-4164-8a78-8bb18fdec007 | fiscal.invoices          | read     | Visualizar notas fiscais        |
| 0243e291-e6ce-4834-bcdf-b2dca8003735 | finance.billing          | create   | finance.billing.create          |
| 7d3e0caa-bc36-4b4b-b8b3-be5b47e41c3f | finance.dashboard        | read     | finance.dashboard.read          |
| c79563ac-8700-4d81-9088-64bd1a3f0a16 | finance.accounts_payable | update   | finance.accounts_payable.update |
| 338ab74e-1cc0-477c-befb-44b512c0a87d | fiscal.invoices          | issue    | fiscal.invoices.issue           |
| 4051eb26-9af4-450f-b56f-3ad54354325c | finance.billing          | update   | finance.billing.update          |
| a8f412a0-5044-4f83-91e2-f308a7bd92bd | finance.accounts_payable | read     | finance.accounts_payable.read   |
| 6714e02f-74ce-44aa-98a3-24fa3003e8df | fiscal.dashboard         | read     | fiscal.dashboard.read           |
