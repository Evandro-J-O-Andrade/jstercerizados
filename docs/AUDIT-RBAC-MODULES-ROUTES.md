[
{
"label": "roles",
"rows": [
{
"id": "68c5ae35-219d-41ad-bfef-68c46c91cdc5",
"name": "admin_master",
"description": "Administrador global do sistema",
"scope": "global"
},
{
"id": "10000000-0000-0000-0000-000000000007",
"name": "commercial",
"description": "Comercial",
"scope": "tenant"
},
{
"id": "10000000-0000-0000-0000-000000000011",
"name": "facilities_manager",
"description": "Gerente de Facilities",
"scope": "tenant"
},
{
"id": "10000000-0000-0000-0000-000000000005",
"name": "finance",
"description": "Analista Financeiro",
"scope": "tenant"
},
{
"id": "10000000-0000-0000-0000-000000000004",
"name": "finance_manager",
"description": "Gerente Financeiro",
"scope": "tenant"
},
{
"id": "10000000-0000-0000-0000-000000000013",
"name": "it_admin",
"description": "Administrador de TI",
"scope": "tenant"
},
{
"id": "10000000-0000-0000-0000-000000000012",
"name": "lawyer",
"description": "Jurídico",
"scope": "tenant"
},
{
"id": "10000000-0000-0000-0000-000000000008",
"name": "operations_manager",
"description": "Gerente de Operações",
"scope": "tenant"
},
{
"id": "7002337d-2742-4d5f-9737-f523fd765a2f",
"name": "operator",
"description": "Operador",
"scope": "tenant"
},
{
"id": "10000000-0000-0000-0000-000000000003",
"name": "recruiter",
"description": "Recrutador",
"scope": "tenant"
},
{
"id": "10000000-0000-0000-0000-000000000002",
"name": "rh_manager",
"description": "Gerente de Recursos Humanos",
"scope": "tenant"
},
{
"id": "10000000-0000-0000-0000-000000000010",
"name": "security_manager",
"description": "Gerente de Segurança",
"scope": "tenant"
},
{
"id": "10000000-0000-0000-0000-000000000009",
"name": "stock_manager",
"description": "Gerente de Estoque",
"scope": "tenant"
},
{
"id": "10000000-0000-0000-0000-000000000006",
"name": "support",
"description": "Suporte",
"scope": "tenant"
},
{
"id": "10000000-0000-0000-0000-000000000001",
"name": "tenant_admin",
"description": "Administrador do tenant",
"scope": "tenant"
},
{
"id": "10000000-0000-0000-0000-000000000014",
"name": "viewer",
"description": "Visualizador",
"scope": "tenant"
}
]
},
{
"label": "permissions",
"rows": [
{
"id": "3a4a0bcf-197d-4965-84e5-82e1b864a434",
"resource": "audit_logs",
"action": "read",
"description": "Ler auditoria"
},
{
"id": "3d54245f-f459-4439-a126-643dd2f63882",
"resource": "chat",
"action": "create",
"description": "Criar conversa"
},
{
"id": "985a91ec-2e21-4bb6-99e6-bba27a17b171",
"resource": "chat",
"action": "handoff",
"description": "Transferir atendimento"
},
{
"id": "ea802c96-8f3c-4a7f-8206-2fa3d652093d",
"resource": "chat",
"action": "read",
"description": "Ler conversa"
},
{
"id": "a4eb685e-4786-44da-9424-ba5c717010d2",
"resource": "companies",
"action": "create",
"description": "Criar empresa"
},
{
"id": "4a0db6f9-a591-47fc-bb0b-4d97fe293129",
"resource": "companies",
"action": "delete",
"description": "Remover empresa"
},
{
"id": "5c9e957d-8a99-4d19-8de1-469a526e85dc",
"resource": "companies",
"action": "read",
"description": "Ler empresa"
},
{
"id": "73b96008-1e57-4c03-9438-f5d0164df60b",
"resource": "companies",
"action": "update",
"description": "Atualizar empresa"
},
{
"id": "0e773490-f9c3-4540-95d0-534226a9896a",
"resource": "contracts",
"action": "create",
"description": "Criar contrato"
},
{
"id": "cec25721-f1fe-4560-a86a-d36741b43891",
"resource": "contracts",
"action": "read",
"description": "Ler contrato"
},
{
"id": "9723dca7-7a58-4baa-8a2d-09bed345fe1a",
"resource": "contracts",
"action": "renew",
"description": "Renovar contrato"
},
{
"id": "be857fdf-c37a-411b-8353-7e0b5c4f54bb",
"resource": "contracts",
"action": "update",
"description": "Atualizar contrato"
},
{
"id": "81a59683-d8d4-4b39-81cd-8468ca7df587",
"resource": "dashboard",
"action": "read",
"description": "Ler dashboard"
},
{
"id": "43d5bac1-92d6-4580-bde9-e3b6ee3c6f26",
"resource": "documents",
"action": "create",
"description": "Criar documento"
},
{
"id": "2f94fb10-9033-472b-9fb1-6d5c47e2b117",
"resource": "documents",
"action": "read",
"description": "Ler documento"
},
{
"id": "4adefd0e-da26-40b7-b305-f4bdc5ccec5b",
"resource": "documents",
"action": "version",
"description": "Criar versão de documento"
},
{
"id": "615e2f97-ac8b-4c8a-b285-83492aac9fba",
"resource": "files",
"action": "delete",
"description": "Remover arquivo"
},
{
"id": "425055aa-9fea-4203-b869-1d1a77e43016",
"resource": "files",
"action": "read",
"description": "Ler arquivo"
},
{
"id": "90187ae0-dd67-4a9d-a345-bb84c6b9118d",
"resource": "files",
"action": "upload",
"description": "Enviar arquivo"
},
{
"id": "4ed2eda1-329e-43da-a3b2-88db41a69ce8",
"resource": "lgpd",
"action": "manage_consent",
"description": "Gerenciar consentimento"
},
{
"id": "617354e9-83cb-4a65-9c2d-a435eadec6fa",
"resource": "lgpd",
"action": "manage_retention",
"description": "Gerenciar retenção"
},
{
"id": "50ccc832-f161-4edb-8e78-0cde150441c6",
"resource": "lgpd",
"action": "read",
"description": "Ler dados LGPD"
},
{
"id": "1b35aab6-fe73-44e0-8ac1-736a2fbdef4e",
"resource": "notifications",
"action": "create",
"description": "Criar notificação"
},
{
"id": "be4161c2-1a18-4ef3-b231-e2a59c4626e9",
"resource": "notifications",
"action": "read",
"description": "Ler notificação"
},
{
"id": "ea7fa862-3f34-40b5-b97c-15c73b46151d",
"resource": "people",
"action": "create",
"description": "Criar pessoa"
},
{
"id": "ecb60027-34ff-4d1c-b4cd-86251e95d8c1",
"resource": "people",
"action": "delete",
"description": "Remover pessoa"
},
{
"id": "0d4761e4-1151-4cc5-b501-0b3907e6eeb9",
"resource": "people",
"action": "read",
"description": "Ler pessoa"
},
{
"id": "9f3ed31c-4e44-46aa-bb57-f848ec5028b5",
"resource": "people",
"action": "update",
"description": "Atualizar pessoa"
},
{
"id": "2e0a6201-20f4-489b-8e3e-fb042cb7ff01",
"resource": "products",
"action": "create",
"description": "Criar produto"
},
{
"id": "02fa198c-5c9f-4c53-9611-f65759e398f9",
"resource": "products",
"action": "delete",
"description": "Remover produto"
},
{
"id": "13322f98-970c-41ff-9903-3a8f922d7f71",
"resource": "products",
"action": "read",
"description": "Ler produto"
},
{
"id": "8aba243f-a68f-400f-bed1-40fc0a611fad",
"resource": "products",
"action": "update",
"description": "Atualizar produto"
},
{
"id": "58369814-3cdf-40bc-9f33-7ad065b51f7d",
"resource": "purchase_orders",
"action": "confirm",
"description": "Confirmar pedido de compra"
},
{
"id": "bf709be3-1926-4bad-ae68-8429b2f99794",
"resource": "purchase_orders",
"action": "create",
"description": "Criar pedido de compra"
},
{
"id": "afaa01f4-6ee6-407a-a320-ba31dca7d1a7",
"resource": "purchase_orders",
"action": "read",
"description": "Ler pedido de compra"
},
{
"id": "234900b7-5537-41b5-bbf1-2091df6cfbd6",
"resource": "purchase_orders",
"action": "update",
"description": "Atualizar pedido de compra"
},
{
"id": "96a4d936-2265-4241-aca0-84637b9f541a",
"resource": "purchase_receipts",
"action": "confirm",
"description": "Confirmar recebimento"
},
{
"id": "9afe631f-1a1c-41c2-91db-11ce0af5ee21",
"resource": "purchase_receipts",
"action": "create",
"description": "Criar recebimento"
},
{
"id": "ed76790a-c742-4d45-8f9f-38bbe4ed51fe",
"resource": "purchase_receipts",
"action": "read",
"description": "Ler recebimento"
},
{
"id": "1bef5b01-0272-4a14-ad42-fe9d17203a37",
"resource": "reports",
"action": "read",
"description": "Ler relatórios"
},
{
"id": "c47a1dd6-4942-429c-8709-6fa9131abee4",
"resource": "roles",
"action": "create",
"description": "Criar role"
},
{
"id": "11aa3eed-48cd-4f29-ad63-efdd4d76c918",
"resource": "roles",
"action": "delete",
"description": "Remover role"
},
{
"id": "738d6262-c02d-40ae-b2f9-93af299ed743",
"resource": "roles",
"action": "read",
"description": "Ler role"
},
{
"id": "57f35f00-777c-4224-b96a-9bdd6f05cb84",
"resource": "roles",
"action": "update",
"description": "Atualizar role"
},
{
"id": "ec80fcb6-bbd7-4e37-b75f-a408c4ecc802",
"resource": "security_events",
"action": "read",
"description": "Ler eventos de segurança"
},
{
"id": "90e063b7-6a15-4caa-99b6-e11a419fbf16",
"resource": "service_orders",
"action": "complete",
"description": "Concluir ordem de serviço"
},
{
"id": "2712e7f0-c117-464e-b6c5-add090f68d85",
"resource": "service_orders",
"action": "create",
"description": "Criar ordem de serviço"
},
{
"id": "0eade96f-6d8a-4f9a-a388-ecdf8b7405d7",
"resource": "service_orders",
"action": "read",
"description": "Ler ordem de serviço"
},
{
"id": "b332c3aa-67e7-43c8-8327-9bcf14471d25",
"resource": "service_orders",
"action": "update",
"description": "Atualizar ordem de serviço"
},
{
"id": "a6671cf6-95d2-4205-956c-71f83a22d90d",
"resource": "stock_movements",
"action": "create",
"description": "Criar movimentação"
},
{
"id": "880caed1-8255-4bef-86a2-f1828e7f9536",
"resource": "stock_movements",
"action": "read",
"description": "Ler movimentação"
},
{
"id": "1c283da0-f29d-4cc4-807b-d5c6c9293e99",
"resource": "support_tickets",
"action": "create",
"description": "Criar ticket"
},
{
"id": "9d0faa6a-4ea2-4bab-b2ae-3608d2e20141",
"resource": "support_tickets",
"action": "read",
"description": "Ler ticket"
},
{
"id": "952e6d7f-442c-4428-a220-a8b88c7f244d",
"resource": "support_tickets",
"action": "resolve",
"description": "Resolver ticket"
},
{
"id": "34286b88-6a06-4e13-a53d-1b00d601e432",
"resource": "support_tickets",
"action": "update",
"description": "Atualizar ticket"
},
{
"id": "9da75044-a113-4300-b007-96ba51da349d",
"resource": "tasks",
"action": "assign",
"description": "Atribuir tarefa"
},
{
"id": "7038a064-aa1d-4e88-a3ae-e81a49e975a3",
"resource": "tasks",
"action": "create",
"description": "Criar tarefa"
},
{
"id": "20032d59-4bf6-46f9-aff0-78965e34a68e",
"resource": "tasks",
"action": "read",
"description": "Ler tarefa"
},
{
"id": "a7d0c6ac-c07a-47aa-a2f3-781f0474e3d0",
"resource": "tasks",
"action": "update",
"description": "Atualizar tarefa"
},
{
"id": "c49ddf68-ed63-4cf2-b54d-d2251a815272",
"resource": "tenants",
"action": "create",
"description": "Criar tenant"
},
{
"id": "46c37233-614c-4608-badb-01767d4acff1",
"resource": "tenants",
"action": "delete",
"description": "Remover tenant"
},
{
"id": "bf4e553e-898b-4e0b-a31f-a793a6735bde",
"resource": "tenants",
"action": "read",
"description": "Ler tenant"
},
{
"id": "f3427e6f-4a90-4dce-9bdd-41a6198c4aaf",
"resource": "tenants",
"action": "update",
"description": "Atualizar tenant"
}
]
},
{
"label": "role_permissions",
"rows": [
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "audit_logs",
"action": "read"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "chat",
"action": "create"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "chat",
"action": "handoff"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "chat",
"action": "read"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "companies",
"action": "create"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "companies",
"action": "delete"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "companies",
"action": "read"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "companies",
"action": "update"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "contracts",
"action": "create"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "contracts",
"action": "read"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "contracts",
"action": "renew"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "contracts",
"action": "update"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "dashboard",
"action": "read"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "documents",
"action": "create"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "documents",
"action": "read"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "documents",
"action": "version"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "files",
"action": "delete"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "files",
"action": "read"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "files",
"action": "upload"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "lgpd",
"action": "manage_consent"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "lgpd",
"action": "manage_retention"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "lgpd",
"action": "read"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "notifications",
"action": "create"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "notifications",
"action": "read"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "people",
"action": "create"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "people",
"action": "delete"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "people",
"action": "read"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "people",
"action": "update"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "products",
"action": "create"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "products",
"action": "delete"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "products",
"action": "read"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "products",
"action": "update"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "purchase_orders",
"action": "confirm"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "purchase_orders",
"action": "create"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "purchase_orders",
"action": "read"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "purchase_orders",
"action": "update"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "purchase_receipts",
"action": "confirm"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "purchase_receipts",
"action": "create"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "purchase_receipts",
"action": "read"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "reports",
"action": "read"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "roles",
"action": "create"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "roles",
"action": "delete"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "roles",
"action": "read"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "roles",
"action": "update"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "security_events",
"action": "read"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "service_orders",
"action": "complete"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "service_orders",
"action": "create"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "service_orders",
"action": "read"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "service_orders",
"action": "update"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "stock_movements",
"action": "create"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "stock_movements",
"action": "read"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "support_tickets",
"action": "create"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "support_tickets",
"action": "read"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "support_tickets",
"action": "resolve"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "support_tickets",
"action": "update"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "tasks",
"action": "assign"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "tasks",
"action": "create"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "tasks",
"action": "read"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "tasks",
"action": "update"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "tenants",
"action": "create"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "tenants",
"action": "delete"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "tenants",
"action": "read"
},
{
"role_name": "admin_master",
"role_scope": "global",
"resource": "tenants",
"action": "update"
},
{
"role_name": "commercial",
"role_scope": "tenant",
"resource": "companies",
"action": "read"
},
{
"role_name": "commercial",
"role_scope": "tenant",
"resource": "companies",
"action": "update"
},
{
"role_name": "commercial",
"role_scope": "tenant",
"resource": "contracts",
"action": "create"
},
{
"role_name": "commercial",
"role_scope": "tenant",
"resource": "contracts",
"action": "read"
},
{
"role_name": "commercial",
"role_scope": "tenant",
"resource": "dashboard",
"action": "read"
},
{
"role_name": "commercial",
"role_scope": "tenant",
"resource": "documents",
"action": "create"
},
{
"role_name": "commercial",
"role_scope": "tenant",
"resource": "documents",
"action": "read"
},
{
"role_name": "commercial",
"role_scope": "tenant",
"resource": "files",
"action": "read"
},
{
"role_name": "commercial",
"role_scope": "tenant",
"resource": "people",
"action": "read"
},
{
"role_name": "commercial",
"role_scope": "tenant",
"resource": "purchase_orders",
"action": "create"
},
{
"role_name": "commercial",
"role_scope": "tenant",
"resource": "purchase_orders",
"action": "read"
},
{
"role_name": "commercial",
"role_scope": "tenant",
"resource": "purchase_receipts",
"action": "create"
},
{
"role_name": "commercial",
"role_scope": "tenant",
"resource": "purchase_receipts",
"action": "read"
},
{
"role_name": "commercial",
"role_scope": "tenant",
"resource": "service_orders",
"action": "create"
},
{
"role_name": "commercial",
"role_scope": "tenant",
"resource": "service_orders",
"action": "read"
},
{
"role_name": "commercial",
"role_scope": "tenant",
"resource": "support_tickets",
"action": "create"
},
{
"role_name": "commercial",
"role_scope": "tenant",
"resource": "support_tickets",
"action": "read"
},
{
"role_name": "commercial",
"role_scope": "tenant",
"resource": "tasks",
"action": "create"
},
{
"role_name": "commercial",
"role_scope": "tenant",
"resource": "tasks",
"action": "read"
},
{
"role_name": "facilities_manager",
"role_scope": "tenant",
"resource": "documents",
"action": "create"
},
{
"role_name": "facilities_manager",
"role_scope": "tenant",
"resource": "documents",
"action": "read"
},
{
"role_name": "facilities_manager",
"role_scope": "tenant",
"resource": "files",
"action": "read"
},
{
"role_name": "facilities_manager",
"role_scope": "tenant",
"resource": "service_orders",
"action": "complete"
},
{
"role_name": "facilities_manager",
"role_scope": "tenant",
"resource": "service_orders",
"action": "create"
},
{
"role_name": "facilities_manager",
"role_scope": "tenant",
"resource": "service_orders",
"action": "read"
},
{
"role_name": "facilities_manager",
"role_scope": "tenant",
"resource": "service_orders",
"action": "update"
},
{
"role_name": "facilities_manager",
"role_scope": "tenant",
"resource": "tasks",
"action": "assign"
},
{
"role_name": "facilities_manager",
"role_scope": "tenant",
"resource": "tasks",
"action": "create"
},
{
"role_name": "facilities_manager",
"role_scope": "tenant",
"resource": "tasks",
"action": "read"
},
{
"role_name": "facilities_manager",
"role_scope": "tenant",
"resource": "tasks",
"action": "update"
},
{
"role_name": "finance",
"role_scope": "tenant",
"resource": "companies",
"action": "read"
},
{
"role_name": "finance",
"role_scope": "tenant",
"resource": "contracts",
"action": "read"
},
{
"role_name": "finance",
"role_scope": "tenant",
"resource": "documents",
"action": "create"
},
{
"role_name": "finance",
"role_scope": "tenant",
"resource": "documents",
"action": "read"
},
{
"role_name": "finance",
"role_scope": "tenant",
"resource": "files",
"action": "read"
},
{
"role_name": "finance",
"role_scope": "tenant",
"resource": "people",
"action": "read"
},
{
"role_name": "finance",
"role_scope": "tenant",
"resource": "products",
"action": "read"
},
{
"role_name": "finance",
"role_scope": "tenant",
"resource": "purchase_orders",
"action": "create"
},
{
"role_name": "finance",
"role_scope": "tenant",
"resource": "purchase_orders",
"action": "read"
},
{
"role_name": "finance",
"role_scope": "tenant",
"resource": "purchase_receipts",
"action": "create"
},
{
"role_name": "finance",
"role_scope": "tenant",
"resource": "purchase_receipts",
"action": "read"
},
{
"role_name": "finance",
"role_scope": "tenant",
"resource": "service_orders",
"action": "create"
},
{
"role_name": "finance",
"role_scope": "tenant",
"resource": "service_orders",
"action": "read"
},
{
"role_name": "finance",
"role_scope": "tenant",
"resource": "stock_movements",
"action": "create"
},
{
"role_name": "finance",
"role_scope": "tenant",
"resource": "stock_movements",
"action": "read"
},
{
"role_name": "finance",
"role_scope": "tenant",
"resource": "support_tickets",
"action": "create"
},
{
"role_name": "finance",
"role_scope": "tenant",
"resource": "support_tickets",
"action": "read"
},
{
"role_name": "finance",
"role_scope": "tenant",
"resource": "tasks",
"action": "create"
},
{
"role_name": "finance",
"role_scope": "tenant",
"resource": "tasks",
"action": "read"
},
{
"role_name": "it_admin",
"role_scope": "tenant",
"resource": "documents",
"action": "create"
},
{
"role_name": "it_admin",
"role_scope": "tenant",
"resource": "documents",
"action": "read"
},
{
"role_name": "it_admin",
"role_scope": "tenant",
"resource": "files",
"action": "read"
},
{
"role_name": "it_admin",
"role_scope": "tenant",
"resource": "files",
"action": "upload"
},
{
"role_name": "it_admin",
"role_scope": "tenant",
"resource": "people",
"action": "create"
},
{
"role_name": "it_admin",
"role_scope": "tenant",
"resource": "people",
"action": "read"
},
{
"role_name": "it_admin",
"role_scope": "tenant",
"resource": "people",
"action": "update"
},
{
"role_name": "it_admin",
"role_scope": "tenant",
"resource": "roles",
"action": "create"
},
{
"role_name": "it_admin",
"role_scope": "tenant",
"resource": "roles",
"action": "read"
},
{
"role_name": "it_admin",
"role_scope": "tenant",
"resource": "roles",
"action": "update"
},
{
"role_name": "lawyer",
"role_scope": "tenant",
"resource": "contracts",
"action": "create"
},
{
"role_name": "lawyer",
"role_scope": "tenant",
"resource": "contracts",
"action": "read"
},
{
"role_name": "lawyer",
"role_scope": "tenant",
"resource": "contracts",
"action": "update"
},
{
"role_name": "lawyer",
"role_scope": "tenant",
"resource": "documents",
"action": "create"
},
{
"role_name": "lawyer",
"role_scope": "tenant",
"resource": "documents",
"action": "read"
},
{
"role_name": "lawyer",
"role_scope": "tenant",
"resource": "documents",
"action": "version"
},
{
"role_name": "lawyer",
"role_scope": "tenant",
"resource": "files",
"action": "read"
},
{
"role_name": "lawyer",
"role_scope": "tenant",
"resource": "people",
"action": "read"
},
{
"role_name": "operations_manager",
"role_scope": "tenant",
"resource": "companies",
"action": "create"
},
{
"role_name": "operations_manager",
"role_scope": "tenant",
"resource": "companies",
"action": "read"
},
{
"role_name": "operations_manager",
"role_scope": "tenant",
"resource": "companies",
"action": "update"
},
{
"role_name": "operations_manager",
"role_scope": "tenant",
"resource": "contracts",
"action": "create"
},
{
"role_name": "operations_manager",
"role_scope": "tenant",
"resource": "contracts",
"action": "read"
},
{
"role_name": "operations_manager",
"role_scope": "tenant",
"resource": "contracts",
"action": "update"
},
{
"role_name": "operations_manager",
"role_scope": "tenant",
"resource": "dashboard",
"action": "read"
},
{
"role_name": "operations_manager",
"role_scope": "tenant",
"resource": "documents",
"action": "create"
},
{
"role_name": "operations_manager",
"role_scope": "tenant",
"resource": "documents",
"action": "read"
},
{
"role_name": "operations_manager",
"role_scope": "tenant",
"resource": "files",
"action": "read"
},
{
"role_name": "operations_manager",
"role_scope": "tenant",
"resource": "people",
"action": "create"
},
{
"role_name": "operations_manager",
"role_scope": "tenant",
"resource": "people",
"action": "read"
},
{
"role_name": "operations_manager",
"role_scope": "tenant",
"resource": "people",
"action": "update"
},
{
"role_name": "operations_manager",
"role_scope": "tenant",
"resource": "products",
"action": "create"
},
{
"role_name": "operations_manager",
"role_scope": "tenant",
"resource": "products",
"action": "read"
},
{
"role_name": "operations_manager",
"role_scope": "tenant",
"resource": "products",
"action": "update"
},
{
"role_name": "operations_manager",
"role_scope": "tenant",
"resource": "purchase_orders",
"action": "create"
},
{
"role_name": "operations_manager",
"role_scope": "tenant",
"resource": "purchase_orders",
"action": "read"
},
{
"role_name": "operations_manager",
"role_scope": "tenant",
"resource": "purchase_orders",
"action": "update"
},
{
"role_name": "operations_manager",
"role_scope": "tenant",
"resource": "purchase_receipts",
"action": "create"
},
{
"role_name": "operations_manager",
"role_scope": "tenant",
"resource": "purchase_receipts",
"action": "read"
},
{
"role_name": "operations_manager",
"role_scope": "tenant",
"resource": "reports",
"action": "read"
},
{
"role_name": "operations_manager",
"role_scope": "tenant",
"resource": "service_orders",
"action": "create"
},
{
"role_name": "operations_manager",
"role_scope": "tenant",
"resource": "service_orders",
"action": "read"
},
{
"role_name": "operations_manager",
"role_scope": "tenant",
"resource": "service_orders",
"action": "update"
},
{
"role_name": "operations_manager",
"role_scope": "tenant",
"resource": "stock_movements",
"action": "create"
},
{
"role_name": "operations_manager",
"role_scope": "tenant",
"resource": "stock_movements",
"action": "read"
},
{
"role_name": "operations_manager",
"role_scope": "tenant",
"resource": "support_tickets",
"action": "create"
},
{
"role_name": "operations_manager",
"role_scope": "tenant",
"resource": "support_tickets",
"action": "read"
},
{
"role_name": "operations_manager",
"role_scope": "tenant",
"resource": "support_tickets",
"action": "update"
},
{
"role_name": "operations_manager",
"role_scope": "tenant",
"resource": "tasks",
"action": "create"
},
{
"role_name": "operations_manager",
"role_scope": "tenant",
"resource": "tasks",
"action": "read"
},
{
"role_name": "operations_manager",
"role_scope": "tenant",
"resource": "tasks",
"action": "update"
},
{
"role_name": "operator",
"role_scope": "tenant",
"resource": "companies",
"action": "create"
},
{
"role_name": "operator",
"role_scope": "tenant",
"resource": "companies",
"action": "read"
},
{
"role_name": "operator",
"role_scope": "tenant",
"resource": "contracts",
"action": "create"
},
{
"role_name": "operator",
"role_scope": "tenant",
"resource": "contracts",
"action": "read"
},
{
"role_name": "operator",
"role_scope": "tenant",
"resource": "documents",
"action": "create"
},
{
"role_name": "operator",
"role_scope": "tenant",
"resource": "documents",
"action": "read"
},
{
"role_name": "operator",
"role_scope": "tenant",
"resource": "files",
"action": "read"
},
{
"role_name": "operator",
"role_scope": "tenant",
"resource": "products",
"action": "create"
},
{
"role_name": "operator",
"role_scope": "tenant",
"resource": "products",
"action": "read"
},
{
"role_name": "operator",
"role_scope": "tenant",
"resource": "purchase_orders",
"action": "create"
},
{
"role_name": "operator",
"role_scope": "tenant",
"resource": "purchase_orders",
"action": "read"
},
{
"role_name": "operator",
"role_scope": "tenant",
"resource": "purchase_receipts",
"action": "create"
},
{
"role_name": "operator",
"role_scope": "tenant",
"resource": "purchase_receipts",
"action": "read"
},
{
"role_name": "operator",
"role_scope": "tenant",
"resource": "service_orders",
"action": "create"
},
{
"role_name": "operator",
"role_scope": "tenant",
"resource": "service_orders",
"action": "read"
},
{
"role_name": "operator",
"role_scope": "tenant",
"resource": "stock_movements",
"action": "create"
},
{
"role_name": "operator",
"role_scope": "tenant",
"resource": "stock_movements",
"action": "read"
},
{
"role_name": "operator",
"role_scope": "tenant",
"resource": "support_tickets",
"action": "create"
},
{
"role_name": "operator",
"role_scope": "tenant",
"resource": "support_tickets",
"action": "read"
},
{
"role_name": "operator",
"role_scope": "tenant",
"resource": "tasks",
"action": "create"
},
{
"role_name": "operator",
"role_scope": "tenant",
"resource": "tasks",
"action": "read"
},
{
"role_name": "security_manager",
"role_scope": "tenant",
"resource": "documents",
"action": "create"
},
{
"role_name": "security_manager",
"role_scope": "tenant",
"resource": "documents",
"action": "read"
},
{
"role_name": "security_manager",
"role_scope": "tenant",
"resource": "people",
"action": "read"
},
{
"role_name": "security_manager",
"role_scope": "tenant",
"resource": "people",
"action": "update"
},
{
"role_name": "security_manager",
"role_scope": "tenant",
"resource": "security_events",
"action": "read"
},
{
"role_name": "stock_manager",
"role_scope": "tenant",
"resource": "dashboard",
"action": "read"
},
{
"role_name": "stock_manager",
"role_scope": "tenant",
"resource": "products",
"action": "read"
},
{
"role_name": "stock_manager",
"role_scope": "tenant",
"resource": "products",
"action": "update"
},
{
"role_name": "stock_manager",
"role_scope": "tenant",
"resource": "purchase_orders",
"action": "create"
},
{
"role_name": "stock_manager",
"role_scope": "tenant",
"resource": "purchase_orders",
"action": "read"
},
{
"role_name": "stock_manager",
"role_scope": "tenant",
"resource": "purchase_receipts",
"action": "create"
},
{
"role_name": "stock_manager",
"role_scope": "tenant",
"resource": "purchase_receipts",
"action": "read"
},
{
"role_name": "stock_manager",
"role_scope": "tenant",
"resource": "stock_movements",
"action": "create"
},
{
"role_name": "stock_manager",
"role_scope": "tenant",
"resource": "stock_movements",
"action": "read"
},
{
"role_name": "support",
"role_scope": "tenant",
"resource": "chat",
"action": "create"
},
{
"role_name": "support",
"role_scope": "tenant",
"resource": "chat",
"action": "read"
},
{
"role_name": "support",
"role_scope": "tenant",
"resource": "support_tickets",
"action": "create"
},
{
"role_name": "support",
"role_scope": "tenant",
"resource": "support_tickets",
"action": "read"
},
{
"role_name": "support",
"role_scope": "tenant",
"resource": "support_tickets",
"action": "update"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "audit_logs",
"action": "read"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "chat",
"action": "create"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "chat",
"action": "handoff"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "chat",
"action": "read"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "companies",
"action": "create"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "companies",
"action": "delete"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "companies",
"action": "read"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "companies",
"action": "update"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "contracts",
"action": "create"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "contracts",
"action": "read"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "contracts",
"action": "renew"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "contracts",
"action": "update"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "documents",
"action": "create"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "documents",
"action": "read"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "documents",
"action": "version"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "files",
"action": "delete"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "files",
"action": "read"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "files",
"action": "upload"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "lgpd",
"action": "manage_consent"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "lgpd",
"action": "manage_retention"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "lgpd",
"action": "read"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "notifications",
"action": "create"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "notifications",
"action": "read"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "people",
"action": "create"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "people",
"action": "delete"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "people",
"action": "read"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "people",
"action": "update"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "products",
"action": "create"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "products",
"action": "delete"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "products",
"action": "read"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "products",
"action": "update"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "purchase_orders",
"action": "confirm"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "purchase_orders",
"action": "create"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "purchase_orders",
"action": "read"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "purchase_orders",
"action": "update"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "purchase_receipts",
"action": "confirm"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "purchase_receipts",
"action": "create"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "purchase_receipts",
"action": "read"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "security_events",
"action": "read"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "service_orders",
"action": "complete"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "service_orders",
"action": "create"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "service_orders",
"action": "read"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "service_orders",
"action": "update"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "stock_movements",
"action": "create"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "stock_movements",
"action": "read"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "support_tickets",
"action": "create"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "support_tickets",
"action": "read"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "support_tickets",
"action": "resolve"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "support_tickets",
"action": "update"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "tasks",
"action": "assign"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "tasks",
"action": "create"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "tasks",
"action": "read"
},
{
"role_name": "tenant_admin",
"role_scope": "tenant",
"resource": "tasks",
"action": "update"
},
{
"role_name": "viewer",
"role_scope": "tenant",
"resource": "companies",
"action": "read"
},
{
"role_name": "viewer",
"role_scope": "tenant",
"resource": "contracts",
"action": "read"
},
{
"role_name": "viewer",
"role_scope": "tenant",
"resource": "dashboard",
"action": "read"
},
{
"role_name": "viewer",
"role_scope": "tenant",
"resource": "documents",
"action": "read"
},
{
"role_name": "viewer",
"role_scope": "tenant",
"resource": "files",
"action": "read"
},
{
"role_name": "viewer",
"role_scope": "tenant",
"resource": "people",
"action": "read"
},
{
"role_name": "viewer",
"role_scope": "tenant",
"resource": "products",
"action": "read"
},
{
"role_name": "viewer",
"role_scope": "tenant",
"resource": "purchase_orders",
"action": "read"
},
{
"role_name": "viewer",
"role_scope": "tenant",
"resource": "purchase_receipts",
"action": "read"
},
{
"role_name": "viewer",
"role_scope": "tenant",
"resource": "reports",
"action": "read"
},
{
"role_name": "viewer",
"role_scope": "tenant",
"resource": "service_orders",
"action": "read"
},
{
"role_name": "viewer",
"role_scope": "tenant",
"resource": "stock_movements",
"action": "read"
},
{
"role_name": "viewer",
"role_scope": "tenant",
"resource": "support_tickets",
"action": "read"
},
{
"role_name": "viewer",
"role_scope": "tenant",
"resource": "tasks",
"action": "read"
}
]
}
]
