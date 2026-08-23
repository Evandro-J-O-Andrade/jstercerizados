{
"permissionsColumns": [
{
"column_name": "id",
"data_type": "uuid",
"is_nullable": "NO"
},
{
"column_name": "resource",
"data_type": "text",
"is_nullable": "NO"
},
{
"column_name": "action",
"data_type": "text",
"is_nullable": "NO"
},
{
"column_name": "description",
"data_type": "text",
"is_nullable": "YES"
},
{
"column_name": "created_at",
"data_type": "timestamp with time zone",
"is_nullable": "NO"
}
],
"roles": [
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
],
"rolePermissions": [
{
"role_name": "admin_master",
"permission_id": "3a4a0bcf-197d-4965-84e5-82e1b864a434",
"resource": "audit_logs",
"action": "read"
},
{
"role_name": "admin_master",
"permission_id": "3d54245f-f459-4439-a126-643dd2f63882",
"resource": "chat",
"action": "create"
},
{
"role_name": "admin_master",
"permission_id": "985a91ec-2e21-4bb6-99e6-bba27a17b171",
"resource": "chat",
"action": "handoff"
},
{
"role_name": "admin_master",
"permission_id": "ea802c96-8f3c-4a7f-8206-2fa3d652093d",
"resource": "chat",
"action": "read"
},
{
"role_name": "admin_master",
"permission_id": "a4eb685e-4786-44da-9424-ba5c717010d2",
"resource": "companies",
"action": "create"
},
{
"role_name": "admin_master",
"permission_id": "4a0db6f9-a591-47fc-bb0b-4d97fe293129",
"resource": "companies",
"action": "delete"
},
{
"role_name": "admin_master",
"permission_id": "5c9e957d-8a99-4d19-8de1-469a526e85dc",
"resource": "companies",
"action": "read"
},
{
"role_name": "admin_master",
"permission_id": "73b96008-1e57-4c03-9438-f5d0164df60b",
"resource": "companies",
"action": "update"
},
{
"role_name": "admin_master",
"permission_id": "0e773490-f9c3-4540-95d0-534226a9896a",
"resource": "contracts",
"action": "create"
},
{
"role_name": "admin_master",
"permission_id": "cec25721-f1fe-4560-a86a-d36741b43891",
"resource": "contracts",
"action": "read"
},
{
"role_name": "admin_master",
"permission_id": "9723dca7-7a58-4baa-8a2d-09bed345fe1a",
"resource": "contracts",
"action": "renew"
},
{
"role_name": "admin_master",
"permission_id": "be857fdf-c37a-411b-8353-7e0b5c4f54bb",
"resource": "contracts",
"action": "update"
},
{
"role_name": "admin_master",
"permission_id": "81a59683-d8d4-4b39-81cd-8468ca7df587",
"resource": "dashboard",
"action": "read"
},
{
"role_name": "admin_master",
"permission_id": "43d5bac1-92d6-4580-bde9-e3b6ee3c6f26",
"resource": "documents",
"action": "create"
},
{
"role_name": "admin_master",
"permission_id": "2f94fb10-9033-472b-9fb1-6d5c47e2b117",
"resource": "documents",
"action": "read"
},
{
"role_name": "admin_master",
"permission_id": "4adefd0e-da26-40b7-b305-f4bdc5ccec5b",
"resource": "documents",
"action": "version"
},
{
"role_name": "admin_master",
"permission_id": "615e2f97-ac8b-4c8a-b285-83492aac9fba",
"resource": "files",
"action": "delete"
},
{
"role_name": "admin_master",
"permission_id": "425055aa-9fea-4203-b869-1d1a77e43016",
"resource": "files",
"action": "read"
},
{
"role_name": "admin_master",
"permission_id": "90187ae0-dd67-4a9d-a345-bb84c6b9118d",
"resource": "files",
"action": "upload"
},
{
"role_name": "admin_master",
"permission_id": "4ed2eda1-329e-43da-a3b2-88db41a69ce8",
"resource": "lgpd",
"action": "manage_consent"
},
{
"role_name": "admin_master",
"permission_id": "617354e9-83cb-4a65-9c2d-a435eadec6fa",
"resource": "lgpd",
"action": "manage_retention"
},
{
"role_name": "admin_master",
"permission_id": "50ccc832-f161-4edb-8e78-0cde150441c6",
"resource": "lgpd",
"action": "read"
},
{
"role_name": "admin_master",
"permission_id": "1b35aab6-fe73-44e0-8ac1-736a2fbdef4e",
"resource": "notifications",
"action": "create"
},
{
"role_name": "admin_master",
"permission_id": "be4161c2-1a18-4ef3-b231-e2a59c4626e9",
"resource": "notifications",
"action": "read"
},
{
"role_name": "admin_master",
"permission_id": "ea7fa862-3f34-40b5-b97c-15c73b46151d",
"resource": "people",
"action": "create"
},
{
"role_name": "admin_master",
"permission_id": "ecb60027-34ff-4d1c-b4cd-86251e95d8c1",
"resource": "people",
"action": "delete"
},
{
"role_name": "admin_master",
"permission_id": "0d4761e4-1151-4cc5-b501-0b3907e6eeb9",
"resource": "people",
"action": "read"
},
{
"role_name": "admin_master",
"permission_id": "9f3ed31c-4e44-46aa-bb57-f848ec5028b5",
"resource": "people",
"action": "update"
},
{
"role_name": "admin_master",
"permission_id": "2e0a6201-20f4-489b-8e3e-fb042cb7ff01",
"resource": "products",
"action": "create"
},
{
"role_name": "admin_master",
"permission_id": "02fa198c-5c9f-4c53-9611-f65759e398f9",
"resource": "products",
"action": "delete"
},
{
"role_name": "admin_master",
"permission_id": "13322f98-970c-41ff-9903-3a8f922d7f71",
"resource": "products",
"action": "read"
},
{
"role_name": "admin_master",
"permission_id": "8aba243f-a68f-400f-bed1-40fc0a611fad",
"resource": "products",
"action": "update"
},
{
"role_name": "admin_master",
"permission_id": "58369814-3cdf-40bc-9f33-7ad065b51f7d",
"resource": "purchase_orders",
"action": "confirm"
},
{
"role_name": "admin_master",
"permission_id": "bf709be3-1926-4bad-ae68-8429b2f99794",
"resource": "purchase_orders",
"action": "create"
},
{
"role_name": "admin_master",
"permission_id": "afaa01f4-6ee6-407a-a320-ba31dca7d1a7",
"resource": "purchase_orders",
"action": "read"
},
{
"role_name": "admin_master",
"permission_id": "234900b7-5537-41b5-bbf1-2091df6cfbd6",
"resource": "purchase_orders",
"action": "update"
},
{
"role_name": "admin_master",
"permission_id": "96a4d936-2265-4241-aca0-84637b9f541a",
"resource": "purchase_receipts",
"action": "confirm"
},
{
"role_name": "admin_master",
"permission_id": "9afe631f-1a1c-41c2-91db-11ce0af5ee21",
"resource": "purchase_receipts",
"action": "create"
},
{
"role_name": "admin_master",
"permission_id": "ed76790a-c742-4d45-8f9f-38bbe4ed51fe",
"resource": "purchase_receipts",
"action": "read"
},
{
"role_name": "admin_master",
"permission_id": "1bef5b01-0272-4a14-ad42-fe9d17203a37",
"resource": "reports",
"action": "read"
},
{
"role_name": "admin_master",
"permission_id": "c47a1dd6-4942-429c-8709-6fa9131abee4",
"resource": "roles",
"action": "create"
},
{
"role_name": "admin_master",
"permission_id": "11aa3eed-48cd-4f29-ad63-efdd4d76c918",
"resource": "roles",
"action": "delete"
},
{
"role_name": "admin_master",
"permission_id": "738d6262-c02d-40ae-b2f9-93af299ed743",
"resource": "roles",
"action": "read"
},
{
"role_name": "admin_master",
"permission_id": "57f35f00-777c-4224-b96a-9bdd6f05cb84",
"resource": "roles",
"action": "update"
},
{
"role_name": "admin_master",
"permission_id": "ec80fcb6-bbd7-4e37-b75f-a408c4ecc802",
"resource": "security_events",
"action": "read"
},
{
"role_name": "admin_master",
"permission_id": "90e063b7-6a15-4caa-99b6-e11a419fbf16",
"resource": "service_orders",
"action": "complete"
},
{
"role_name": "admin_master",
"permission_id": "2712e7f0-c117-464e-b6c5-add090f68d85",
"resource": "service_orders",
"action": "create"
},
{
"role_name": "admin_master",
"permission_id": "0eade96f-6d8a-4f9a-a388-ecdf8b7405d7",
"resource": "service_orders",
"action": "read"
},
{
"role_name": "admin_master",
"permission_id": "b332c3aa-67e7-43c8-8327-9bcf14471d25",
"resource": "service_orders",
"action": "update"
},
{
"role_name": "admin_master",
"permission_id": "a6671cf6-95d2-4205-956c-71f83a22d90d",
"resource": "stock_movements",
"action": "create"
},
{
"role_name": "admin_master",
"permission_id": "880caed1-8255-4bef-86a2-f1828e7f9536",
"resource": "stock_movements",
"action": "read"
},
{
"role_name": "admin_master",
"permission_id": "1c283da0-f29d-4cc4-807b-d5c6c9293e99",
"resource": "support_tickets",
"action": "create"
},
{
"role_name": "admin_master",
"permission_id": "9d0faa6a-4ea2-4bab-b2ae-3608d2e20141",
"resource": "support_tickets",
"action": "read"
},
{
"role_name": "admin_master",
"permission_id": "952e6d7f-442c-4428-a220-a8b88c7f244d",
"resource": "support_tickets",
"action": "resolve"
},
{
"role_name": "admin_master",
"permission_id": "34286b88-6a06-4e13-a53d-1b00d601e432",
"resource": "support_tickets",
"action": "update"
},
{
"role_name": "admin_master",
"permission_id": "9da75044-a113-4300-b007-96ba51da349d",
"resource": "tasks",
"action": "assign"
},
{
"role_name": "admin_master",
"permission_id": "7038a064-aa1d-4e88-a3ae-e81a49e975a3",
"resource": "tasks",
"action": "create"
},
{
"role_name": "admin_master",
"permission_id": "20032d59-4bf6-46f9-aff0-78965e34a68e",
"resource": "tasks",
"action": "read"
},
{
"role_name": "admin_master",
"permission_id": "a7d0c6ac-c07a-47aa-a2f3-781f0474e3d0",
"resource": "tasks",
"action": "update"
},
{
"role_name": "admin_master",
"permission_id": "c49ddf68-ed63-4cf2-b54d-d2251a815272",
"resource": "tenants",
"action": "create"
},
{
"role_name": "admin_master",
"permission_id": "46c37233-614c-4608-badb-01767d4acff1",
"resource": "tenants",
"action": "delete"
},
{
"role_name": "admin_master",
"permission_id": "bf4e553e-898b-4e0b-a31f-a793a6735bde",
"resource": "tenants",
"action": "read"
},
{
"role_name": "admin_master",
"permission_id": "f3427e6f-4a90-4dce-9bdd-41a6198c4aaf",
"resource": "tenants",
"action": "update"
},
{
"role_name": "commercial",
"permission_id": "5c9e957d-8a99-4d19-8de1-469a526e85dc",
"resource": "companies",
"action": "read"
},
{
"role_name": "commercial",
"permission_id": "73b96008-1e57-4c03-9438-f5d0164df60b",
"resource": "companies",
"action": "update"
},
{
"role_name": "commercial",
"permission_id": "0e773490-f9c3-4540-95d0-534226a9896a",
"resource": "contracts",
"action": "create"
},
{
"role_name": "commercial",
"permission_id": "cec25721-f1fe-4560-a86a-d36741b43891",
"resource": "contracts",
"action": "read"
},
{
"role_name": "commercial",
"permission_id": "81a59683-d8d4-4b39-81cd-8468ca7df587",
"resource": "dashboard",
"action": "read"
},
{
"role_name": "commercial",
"permission_id": "43d5bac1-92d6-4580-bde9-e3b6ee3c6f26",
"resource": "documents",
"action": "create"
},
{
"role_name": "commercial",
"permission_id": "2f94fb10-9033-472b-9fb1-6d5c47e2b117",
"resource": "documents",
"action": "read"
},
{
"role_name": "commercial",
"permission_id": "425055aa-9fea-4203-b869-1d1a77e43016",
"resource": "files",
"action": "read"
},
{
"role_name": "commercial",
"permission_id": "0d4761e4-1151-4cc5-b501-0b3907e6eeb9",
"resource": "people",
"action": "read"
},
{
"role_name": "commercial",
"permission_id": "bf709be3-1926-4bad-ae68-8429b2f99794",
"resource": "purchase_orders",
"action": "create"
},
{
"role_name": "commercial",
"permission_id": "afaa01f4-6ee6-407a-a320-ba31dca7d1a7",
"resource": "purchase_orders",
"action": "read"
},
{
"role_name": "commercial",
"permission_id": "9afe631f-1a1c-41c2-91db-11ce0af5ee21",
"resource": "purchase_receipts",
"action": "create"
},
{
"role_name": "commercial",
"permission_id": "ed76790a-c742-4d45-8f9f-38bbe4ed51fe",
"resource": "purchase_receipts",
"action": "read"
},
{
"role_name": "commercial",
"permission_id": "2712e7f0-c117-464e-b6c5-add090f68d85",
"resource": "service_orders",
"action": "create"
},
{
"role_name": "commercial",
"permission_id": "0eade96f-6d8a-4f9a-a388-ecdf8b7405d7",
"resource": "service_orders",
"action": "read"
},
{
"role_name": "commercial",
"permission_id": "1c283da0-f29d-4cc4-807b-d5c6c9293e99",
"resource": "support_tickets",
"action": "create"
},
{
"role_name": "commercial",
"permission_id": "9d0faa6a-4ea2-4bab-b2ae-3608d2e20141",
"resource": "support_tickets",
"action": "read"
},
{
"role_name": "commercial",
"permission_id": "7038a064-aa1d-4e88-a3ae-e81a49e975a3",
"resource": "tasks",
"action": "create"
},
{
"role_name": "commercial",
"permission_id": "20032d59-4bf6-46f9-aff0-78965e34a68e",
"resource": "tasks",
"action": "read"
},
{
"role_name": "facilities_manager",
"permission_id": "43d5bac1-92d6-4580-bde9-e3b6ee3c6f26",
"resource": "documents",
"action": "create"
},
{
"role_name": "facilities_manager",
"permission_id": "2f94fb10-9033-472b-9fb1-6d5c47e2b117",
"resource": "documents",
"action": "read"
},
{
"role_name": "facilities_manager",
"permission_id": "425055aa-9fea-4203-b869-1d1a77e43016",
"resource": "files",
"action": "read"
},
{
"role_name": "facilities_manager",
"permission_id": "90e063b7-6a15-4caa-99b6-e11a419fbf16",
"resource": "service_orders",
"action": "complete"
},
{
"role_name": "facilities_manager",
"permission_id": "2712e7f0-c117-464e-b6c5-add090f68d85",
"resource": "service_orders",
"action": "create"
},
{
"role_name": "facilities_manager",
"permission_id": "0eade96f-6d8a-4f9a-a388-ecdf8b7405d7",
"resource": "service_orders",
"action": "read"
},
{
"role_name": "facilities_manager",
"permission_id": "b332c3aa-67e7-43c8-8327-9bcf14471d25",
"resource": "service_orders",
"action": "update"
},
{
"role_name": "facilities_manager",
"permission_id": "9da75044-a113-4300-b007-96ba51da349d",
"resource": "tasks",
"action": "assign"
},
{
"role_name": "facilities_manager",
"permission_id": "7038a064-aa1d-4e88-a3ae-e81a49e975a3",
"resource": "tasks",
"action": "create"
},
{
"role_name": "facilities_manager",
"permission_id": "20032d59-4bf6-46f9-aff0-78965e34a68e",
"resource": "tasks",
"action": "read"
},
{
"role_name": "facilities_manager",
"permission_id": "a7d0c6ac-c07a-47aa-a2f3-781f0474e3d0",
"resource": "tasks",
"action": "update"
},
{
"role_name": "finance",
"permission_id": "5c9e957d-8a99-4d19-8de1-469a526e85dc",
"resource": "companies",
"action": "read"
},
{
"role_name": "finance",
"permission_id": "cec25721-f1fe-4560-a86a-d36741b43891",
"resource": "contracts",
"action": "read"
},
{
"role_name": "finance",
"permission_id": "43d5bac1-92d6-4580-bde9-e3b6ee3c6f26",
"resource": "documents",
"action": "create"
},
{
"role_name": "finance",
"permission_id": "2f94fb10-9033-472b-9fb1-6d5c47e2b117",
"resource": "documents",
"action": "read"
},
{
"role_name": "finance",
"permission_id": "425055aa-9fea-4203-b869-1d1a77e43016",
"resource": "files",
"action": "read"
},
{
"role_name": "finance",
"permission_id": "0d4761e4-1151-4cc5-b501-0b3907e6eeb9",
"resource": "people",
"action": "read"
},
{
"role_name": "finance",
"permission_id": "13322f98-970c-41ff-9903-3a8f922d7f71",
"resource": "products",
"action": "read"
},
{
"role_name": "finance",
"permission_id": "bf709be3-1926-4bad-ae68-8429b2f99794",
"resource": "purchase_orders",
"action": "create"
},
{
"role_name": "finance",
"permission_id": "afaa01f4-6ee6-407a-a320-ba31dca7d1a7",
"resource": "purchase_orders",
"action": "read"
},
{
"role_name": "finance",
"permission_id": "9afe631f-1a1c-41c2-91db-11ce0af5ee21",
"resource": "purchase_receipts",
"action": "create"
},
{
"role_name": "finance",
"permission_id": "ed76790a-c742-4d45-8f9f-38bbe4ed51fe",
"resource": "purchase_receipts",
"action": "read"
},
{
"role_name": "finance",
"permission_id": "2712e7f0-c117-464e-b6c5-add090f68d85",
"resource": "service_orders",
"action": "create"
},
{
"role_name": "finance",
"permission_id": "0eade96f-6d8a-4f9a-a388-ecdf8b7405d7",
"resource": "service_orders",
"action": "read"
},
{
"role_name": "finance",
"permission_id": "a6671cf6-95d2-4205-956c-71f83a22d90d",
"resource": "stock_movements",
"action": "create"
},
{
"role_name": "finance",
"permission_id": "880caed1-8255-4bef-86a2-f1828e7f9536",
"resource": "stock_movements",
"action": "read"
},
{
"role_name": "finance",
"permission_id": "1c283da0-f29d-4cc4-807b-d5c6c9293e99",
"resource": "support_tickets",
"action": "create"
},
{
"role_name": "finance",
"permission_id": "9d0faa6a-4ea2-4bab-b2ae-3608d2e20141",
"resource": "support_tickets",
"action": "read"
},
{
"role_name": "finance",
"permission_id": "7038a064-aa1d-4e88-a3ae-e81a49e975a3",
"resource": "tasks",
"action": "create"
},
{
"role_name": "finance",
"permission_id": "20032d59-4bf6-46f9-aff0-78965e34a68e",
"resource": "tasks",
"action": "read"
},
{
"role_name": "it_admin",
"permission_id": "43d5bac1-92d6-4580-bde9-e3b6ee3c6f26",
"resource": "documents",
"action": "create"
},
{
"role_name": "it_admin",
"permission_id": "2f94fb10-9033-472b-9fb1-6d5c47e2b117",
"resource": "documents",
"action": "read"
},
{
"role_name": "it_admin",
"permission_id": "425055aa-9fea-4203-b869-1d1a77e43016",
"resource": "files",
"action": "read"
},
{
"role_name": "it_admin",
"permission_id": "90187ae0-dd67-4a9d-a345-bb84c6b9118d",
"resource": "files",
"action": "upload"
},
{
"role_name": "it_admin",
"permission_id": "ea7fa862-3f34-40b5-b97c-15c73b46151d",
"resource": "people",
"action": "create"
},
{
"role_name": "it_admin",
"permission_id": "0d4761e4-1151-4cc5-b501-0b3907e6eeb9",
"resource": "people",
"action": "read"
},
{
"role_name": "it_admin",
"permission_id": "9f3ed31c-4e44-46aa-bb57-f848ec5028b5",
"resource": "people",
"action": "update"
},
{
"role_name": "it_admin",
"permission_id": "c47a1dd6-4942-429c-8709-6fa9131abee4",
"resource": "roles",
"action": "create"
},
{
"role_name": "it_admin",
"permission_id": "738d6262-c02d-40ae-b2f9-93af299ed743",
"resource": "roles",
"action": "read"
},
{
"role_name": "it_admin",
"permission_id": "57f35f00-777c-4224-b96a-9bdd6f05cb84",
"resource": "roles",
"action": "update"
},
{
"role_name": "lawyer",
"permission_id": "0e773490-f9c3-4540-95d0-534226a9896a",
"resource": "contracts",
"action": "create"
},
{
"role_name": "lawyer",
"permission_id": "cec25721-f1fe-4560-a86a-d36741b43891",
"resource": "contracts",
"action": "read"
},
{
"role_name": "lawyer",
"permission_id": "be857fdf-c37a-411b-8353-7e0b5c4f54bb",
"resource": "contracts",
"action": "update"
},
{
"role_name": "lawyer",
"permission_id": "43d5bac1-92d6-4580-bde9-e3b6ee3c6f26",
"resource": "documents",
"action": "create"
},
{
"role_name": "lawyer",
"permission_id": "2f94fb10-9033-472b-9fb1-6d5c47e2b117",
"resource": "documents",
"action": "read"
},
{
"role_name": "lawyer",
"permission_id": "4adefd0e-da26-40b7-b305-f4bdc5ccec5b",
"resource": "documents",
"action": "version"
},
{
"role_name": "lawyer",
"permission_id": "425055aa-9fea-4203-b869-1d1a77e43016",
"resource": "files",
"action": "read"
},
{
"role_name": "lawyer",
"permission_id": "0d4761e4-1151-4cc5-b501-0b3907e6eeb9",
"resource": "people",
"action": "read"
},
{
"role_name": "operations_manager",
"permission_id": "a4eb685e-4786-44da-9424-ba5c717010d2",
"resource": "companies",
"action": "create"
},
{
"role_name": "operations_manager",
"permission_id": "5c9e957d-8a99-4d19-8de1-469a526e85dc",
"resource": "companies",
"action": "read"
},
{
"role_name": "operations_manager",
"permission_id": "73b96008-1e57-4c03-9438-f5d0164df60b",
"resource": "companies",
"action": "update"
},
{
"role_name": "operations_manager",
"permission_id": "0e773490-f9c3-4540-95d0-534226a9896a",
"resource": "contracts",
"action": "create"
},
{
"role_name": "operations_manager",
"permission_id": "cec25721-f1fe-4560-a86a-d36741b43891",
"resource": "contracts",
"action": "read"
},
{
"role_name": "operations_manager",
"permission_id": "be857fdf-c37a-411b-8353-7e0b5c4f54bb",
"resource": "contracts",
"action": "update"
},
{
"role_name": "operations_manager",
"permission_id": "81a59683-d8d4-4b39-81cd-8468ca7df587",
"resource": "dashboard",
"action": "read"
},
{
"role_name": "operations_manager",
"permission_id": "43d5bac1-92d6-4580-bde9-e3b6ee3c6f26",
"resource": "documents",
"action": "create"
},
{
"role_name": "operations_manager",
"permission_id": "2f94fb10-9033-472b-9fb1-6d5c47e2b117",
"resource": "documents",
"action": "read"
},
{
"role_name": "operations_manager",
"permission_id": "425055aa-9fea-4203-b869-1d1a77e43016",
"resource": "files",
"action": "read"
},
{
"role_name": "operations_manager",
"permission_id": "ea7fa862-3f34-40b5-b97c-15c73b46151d",
"resource": "people",
"action": "create"
},
{
"role_name": "operations_manager",
"permission_id": "0d4761e4-1151-4cc5-b501-0b3907e6eeb9",
"resource": "people",
"action": "read"
},
{
"role_name": "operations_manager",
"permission_id": "9f3ed31c-4e44-46aa-bb57-f848ec5028b5",
"resource": "people",
"action": "update"
},
{
"role_name": "operations_manager",
"permission_id": "2e0a6201-20f4-489b-8e3e-fb042cb7ff01",
"resource": "products",
"action": "create"
},
{
"role_name": "operations_manager",
"permission_id": "13322f98-970c-41ff-9903-3a8f922d7f71",
"resource": "products",
"action": "read"
},
{
"role_name": "operations_manager",
"permission_id": "8aba243f-a68f-400f-bed1-40fc0a611fad",
"resource": "products",
"action": "update"
},
{
"role_name": "operations_manager",
"permission_id": "bf709be3-1926-4bad-ae68-8429b2f99794",
"resource": "purchase_orders",
"action": "create"
},
{
"role_name": "operations_manager",
"permission_id": "afaa01f4-6ee6-407a-a320-ba31dca7d1a7",
"resource": "purchase_orders",
"action": "read"
},
{
"role_name": "operations_manager",
"permission_id": "234900b7-5537-41b5-bbf1-2091df6cfbd6",
"resource": "purchase_orders",
"action": "update"
},
{
"role_name": "operations_manager",
"permission_id": "9afe631f-1a1c-41c2-91db-11ce0af5ee21",
"resource": "purchase_receipts",
"action": "create"
},
{
"role_name": "operations_manager",
"permission_id": "ed76790a-c742-4d45-8f9f-38bbe4ed51fe",
"resource": "purchase_receipts",
"action": "read"
},
{
"role_name": "operations_manager",
"permission_id": "1bef5b01-0272-4a14-ad42-fe9d17203a37",
"resource": "reports",
"action": "read"
},
{
"role_name": "operations_manager",
"permission_id": "2712e7f0-c117-464e-b6c5-add090f68d85",
"resource": "service_orders",
"action": "create"
},
{
"role_name": "operations_manager",
"permission_id": "0eade96f-6d8a-4f9a-a388-ecdf8b7405d7",
"resource": "service_orders",
"action": "read"
},
{
"role_name": "operations_manager",
"permission_id": "b332c3aa-67e7-43c8-8327-9bcf14471d25",
"resource": "service_orders",
"action": "update"
},
{
"role_name": "operations_manager",
"permission_id": "a6671cf6-95d2-4205-956c-71f83a22d90d",
"resource": "stock_movements",
"action": "create"
},
{
"role_name": "operations_manager",
"permission_id": "880caed1-8255-4bef-86a2-f1828e7f9536",
"resource": "stock_movements",
"action": "read"
},
{
"role_name": "operations_manager",
"permission_id": "1c283da0-f29d-4cc4-807b-d5c6c9293e99",
"resource": "support_tickets",
"action": "create"
},
{
"role_name": "operations_manager",
"permission_id": "9d0faa6a-4ea2-4bab-b2ae-3608d2e20141",
"resource": "support_tickets",
"action": "read"
},
{
"role_name": "operations_manager",
"permission_id": "34286b88-6a06-4e13-a53d-1b00d601e432",
"resource": "support_tickets",
"action": "update"
},
{
"role_name": "operations_manager",
"permission_id": "7038a064-aa1d-4e88-a3ae-e81a49e975a3",
"resource": "tasks",
"action": "create"
},
{
"role_name": "operations_manager",
"permission_id": "20032d59-4bf6-46f9-aff0-78965e34a68e",
"resource": "tasks",
"action": "read"
},
{
"role_name": "operations_manager",
"permission_id": "a7d0c6ac-c07a-47aa-a2f3-781f0474e3d0",
"resource": "tasks",
"action": "update"
},
{
"role_name": "operator",
"permission_id": "a4eb685e-4786-44da-9424-ba5c717010d2",
"resource": "companies",
"action": "create"
},
{
"role_name": "operator",
"permission_id": "5c9e957d-8a99-4d19-8de1-469a526e85dc",
"resource": "companies",
"action": "read"
},
{
"role_name": "operator",
"permission_id": "0e773490-f9c3-4540-95d0-534226a9896a",
"resource": "contracts",
"action": "create"
},
{
"role_name": "operator",
"permission_id": "cec25721-f1fe-4560-a86a-d36741b43891",
"resource": "contracts",
"action": "read"
},
{
"role_name": "operator",
"permission_id": "43d5bac1-92d6-4580-bde9-e3b6ee3c6f26",
"resource": "documents",
"action": "create"
},
{
"role_name": "operator",
"permission_id": "2f94fb10-9033-472b-9fb1-6d5c47e2b117",
"resource": "documents",
"action": "read"
},
{
"role_name": "operator",
"permission_id": "425055aa-9fea-4203-b869-1d1a77e43016",
"resource": "files",
"action": "read"
},
{
"role_name": "operator",
"permission_id": "2e0a6201-20f4-489b-8e3e-fb042cb7ff01",
"resource": "products",
"action": "create"
},
{
"role_name": "operator",
"permission_id": "13322f98-970c-41ff-9903-3a8f922d7f71",
"resource": "products",
"action": "read"
},
{
"role_name": "operator",
"permission_id": "bf709be3-1926-4bad-ae68-8429b2f99794",
"resource": "purchase_orders",
"action": "create"
},
{
"role_name": "operator",
"permission_id": "afaa01f4-6ee6-407a-a320-ba31dca7d1a7",
"resource": "purchase_orders",
"action": "read"
},
{
"role_name": "operator",
"permission_id": "9afe631f-1a1c-41c2-91db-11ce0af5ee21",
"resource": "purchase_receipts",
"action": "create"
},
{
"role_name": "operator",
"permission_id": "ed76790a-c742-4d45-8f9f-38bbe4ed51fe",
"resource": "purchase_receipts",
"action": "read"
},
{
"role_name": "operator",
"permission_id": "2712e7f0-c117-464e-b6c5-add090f68d85",
"resource": "service_orders",
"action": "create"
},
{
"role_name": "operator",
"permission_id": "0eade96f-6d8a-4f9a-a388-ecdf8b7405d7",
"resource": "service_orders",
"action": "read"
},
{
"role_name": "operator",
"permission_id": "a6671cf6-95d2-4205-956c-71f83a22d90d",
"resource": "stock_movements",
"action": "create"
},
{
"role_name": "operator",
"permission_id": "880caed1-8255-4bef-86a2-f1828e7f9536",
"resource": "stock_movements",
"action": "read"
},
{
"role_name": "operator",
"permission_id": "1c283da0-f29d-4cc4-807b-d5c6c9293e99",
"resource": "support_tickets",
"action": "create"
},
{
"role_name": "operator",
"permission_id": "9d0faa6a-4ea2-4bab-b2ae-3608d2e20141",
"resource": "support_tickets",
"action": "read"
},
{
"role_name": "operator",
"permission_id": "7038a064-aa1d-4e88-a3ae-e81a49e975a3",
"resource": "tasks",
"action": "create"
},
{
"role_name": "operator",
"permission_id": "20032d59-4bf6-46f9-aff0-78965e34a68e",
"resource": "tasks",
"action": "read"
},
{
"role_name": "security_manager",
"permission_id": "43d5bac1-92d6-4580-bde9-e3b6ee3c6f26",
"resource": "documents",
"action": "create"
},
{
"role_name": "security_manager",
"permission_id": "2f94fb10-9033-472b-9fb1-6d5c47e2b117",
"resource": "documents",
"action": "read"
},
{
"role_name": "security_manager",
"permission_id": "0d4761e4-1151-4cc5-b501-0b3907e6eeb9",
"resource": "people",
"action": "read"
},
{
"role_name": "security_manager",
"permission_id": "9f3ed31c-4e44-46aa-bb57-f848ec5028b5",
"resource": "people",
"action": "update"
},
{
"role_name": "security_manager",
"permission_id": "ec80fcb6-bbd7-4e37-b75f-a408c4ecc802",
"resource": "security_events",
"action": "read"
},
{
"role_name": "stock_manager",
"permission_id": "81a59683-d8d4-4b39-81cd-8468ca7df587",
"resource": "dashboard",
"action": "read"
},
{
"role_name": "stock_manager",
"permission_id": "13322f98-970c-41ff-9903-3a8f922d7f71",
"resource": "products",
"action": "read"
},
{
"role_name": "stock_manager",
"permission_id": "8aba243f-a68f-400f-bed1-40fc0a611fad",
"resource": "products",
"action": "update"
},
{
"role_name": "stock_manager",
"permission_id": "bf709be3-1926-4bad-ae68-8429b2f99794",
"resource": "purchase_orders",
"action": "create"
},
{
"role_name": "stock_manager",
"permission_id": "afaa01f4-6ee6-407a-a320-ba31dca7d1a7",
"resource": "purchase_orders",
"action": "read"
},
{
"role_name": "stock_manager",
"permission_id": "9afe631f-1a1c-41c2-91db-11ce0af5ee21",
"resource": "purchase_receipts",
"action": "create"
},
{
"role_name": "stock_manager",
"permission_id": "ed76790a-c742-4d45-8f9f-38bbe4ed51fe",
"resource": "purchase_receipts",
"action": "read"
},
{
"role_name": "stock_manager",
"permission_id": "a6671cf6-95d2-4205-956c-71f83a22d90d",
"resource": "stock_movements",
"action": "create"
},
{
"role_name": "stock_manager",
"permission_id": "880caed1-8255-4bef-86a2-f1828e7f9536",
"resource": "stock_movements",
"action": "read"
},
{
"role_name": "support",
"permission_id": "3d54245f-f459-4439-a126-643dd2f63882",
"resource": "chat",
"action": "create"
},
{
"role_name": "support",
"permission_id": "ea802c96-8f3c-4a7f-8206-2fa3d652093d",
"resource": "chat",
"action": "read"
},
{
"role_name": "support",
"permission_id": "1c283da0-f29d-4cc4-807b-d5c6c9293e99",
"resource": "support_tickets",
"action": "create"
},
{
"role_name": "support",
"permission_id": "9d0faa6a-4ea2-4bab-b2ae-3608d2e20141",
"resource": "support_tickets",
"action": "read"
},
{
"role_name": "support",
"permission_id": "34286b88-6a06-4e13-a53d-1b00d601e432",
"resource": "support_tickets",
"action": "update"
},
{
"role_name": "tenant_admin",
"permission_id": "3a4a0bcf-197d-4965-84e5-82e1b864a434",
"resource": "audit_logs",
"action": "read"
},
{
"role_name": "tenant_admin",
"permission_id": "3d54245f-f459-4439-a126-643dd2f63882",
"resource": "chat",
"action": "create"
},
{
"role_name": "tenant_admin",
"permission_id": "985a91ec-2e21-4bb6-99e6-bba27a17b171",
"resource": "chat",
"action": "handoff"
},
{
"role_name": "tenant_admin",
"permission_id": "ea802c96-8f3c-4a7f-8206-2fa3d652093d",
"resource": "chat",
"action": "read"
},
{
"role_name": "tenant_admin",
"permission_id": "a4eb685e-4786-44da-9424-ba5c717010d2",
"resource": "companies",
"action": "create"
},
{
"role_name": "tenant_admin",
"permission_id": "4a0db6f9-a591-47fc-bb0b-4d97fe293129",
"resource": "companies",
"action": "delete"
},
{
"role_name": "tenant_admin",
"permission_id": "5c9e957d-8a99-4d19-8de1-469a526e85dc",
"resource": "companies",
"action": "read"
},
{
"role_name": "tenant_admin",
"permission_id": "73b96008-1e57-4c03-9438-f5d0164df60b",
"resource": "companies",
"action": "update"
},
{
"role_name": "tenant_admin",
"permission_id": "0e773490-f9c3-4540-95d0-534226a9896a",
"resource": "contracts",
"action": "create"
},
{
"role_name": "tenant_admin",
"permission_id": "cec25721-f1fe-4560-a86a-d36741b43891",
"resource": "contracts",
"action": "read"
},
{
"role_name": "tenant_admin",
"permission_id": "9723dca7-7a58-4baa-8a2d-09bed345fe1a",
"resource": "contracts",
"action": "renew"
},
{
"role_name": "tenant_admin",
"permission_id": "be857fdf-c37a-411b-8353-7e0b5c4f54bb",
"resource": "contracts",
"action": "update"
},
{
"role_name": "tenant_admin",
"permission_id": "43d5bac1-92d6-4580-bde9-e3b6ee3c6f26",
"resource": "documents",
"action": "create"
},
{
"role_name": "tenant_admin",
"permission_id": "2f94fb10-9033-472b-9fb1-6d5c47e2b117",
"resource": "documents",
"action": "read"
},
{
"role_name": "tenant_admin",
"permission_id": "4adefd0e-da26-40b7-b305-f4bdc5ccec5b",
"resource": "documents",
"action": "version"
},
{
"role_name": "tenant_admin",
"permission_id": "615e2f97-ac8b-4c8a-b285-83492aac9fba",
"resource": "files",
"action": "delete"
},
{
"role_name": "tenant_admin",
"permission_id": "425055aa-9fea-4203-b869-1d1a77e43016",
"resource": "files",
"action": "read"
},
{
"role_name": "tenant_admin",
"permission_id": "90187ae0-dd67-4a9d-a345-bb84c6b9118d",
"resource": "files",
"action": "upload"
},
{
"role_name": "tenant_admin",
"permission_id": "4ed2eda1-329e-43da-a3b2-88db41a69ce8",
"resource": "lgpd",
"action": "manage_consent"
},
{
"role_name": "tenant_admin",
"permission_id": "617354e9-83cb-4a65-9c2d-a435eadec6fa",
"resource": "lgpd",
"action": "manage_retention"
},
{
"role_name": "tenant_admin",
"permission_id": "50ccc832-f161-4edb-8e78-0cde150441c6",
"resource": "lgpd",
"action": "read"
},
{
"role_name": "tenant_admin",
"permission_id": "1b35aab6-fe73-44e0-8ac1-736a2fbdef4e",
"resource": "notifications",
"action": "create"
},
{
"role_name": "tenant_admin",
"permission_id": "be4161c2-1a18-4ef3-b231-e2a59c4626e9",
"resource": "notifications",
"action": "read"
},
{
"role_name": "tenant_admin",
"permission_id": "ea7fa862-3f34-40b5-b97c-15c73b46151d",
"resource": "people",
"action": "create"
},
{
"role_name": "tenant_admin",
"permission_id": "ecb60027-34ff-4d1c-b4cd-86251e95d8c1",
"resource": "people",
"action": "delete"
},
{
"role_name": "tenant_admin",
"permission_id": "0d4761e4-1151-4cc5-b501-0b3907e6eeb9",
"resource": "people",
"action": "read"
},
{
"role_name": "tenant_admin",
"permission_id": "9f3ed31c-4e44-46aa-bb57-f848ec5028b5",
"resource": "people",
"action": "update"
},
{
"role_name": "tenant_admin",
"permission_id": "2e0a6201-20f4-489b-8e3e-fb042cb7ff01",
"resource": "products",
"action": "create"
},
{
"role_name": "tenant_admin",
"permission_id": "02fa198c-5c9f-4c53-9611-f65759e398f9",
"resource": "products",
"action": "delete"
},
{
"role_name": "tenant_admin",
"permission_id": "13322f98-970c-41ff-9903-3a8f922d7f71",
"resource": "products",
"action": "read"
},
{
"role_name": "tenant_admin",
"permission_id": "8aba243f-a68f-400f-bed1-40fc0a611fad",
"resource": "products",
"action": "update"
},
{
"role_name": "tenant_admin",
"permission_id": "58369814-3cdf-40bc-9f33-7ad065b51f7d",
"resource": "purchase_orders",
"action": "confirm"
},
{
"role_name": "tenant_admin",
"permission_id": "bf709be3-1926-4bad-ae68-8429b2f99794",
"resource": "purchase_orders",
"action": "create"
},
{
"role_name": "tenant_admin",
"permission_id": "afaa01f4-6ee6-407a-a320-ba31dca7d1a7",
"resource": "purchase_orders",
"action": "read"
},
{
"role_name": "tenant_admin",
"permission_id": "234900b7-5537-41b5-bbf1-2091df6cfbd6",
"resource": "purchase_orders",
"action": "update"
},
{
"role_name": "tenant_admin",
"permission_id": "96a4d936-2265-4241-aca0-84637b9f541a",
"resource": "purchase_receipts",
"action": "confirm"
},
{
"role_name": "tenant_admin",
"permission_id": "9afe631f-1a1c-41c2-91db-11ce0af5ee21",
"resource": "purchase_receipts",
"action": "create"
},
{
"role_name": "tenant_admin",
"permission_id": "ed76790a-c742-4d45-8f9f-38bbe4ed51fe",
"resource": "purchase_receipts",
"action": "read"
},
{
"role_name": "tenant_admin",
"permission_id": "ec80fcb6-bbd7-4e37-b75f-a408c4ecc802",
"resource": "security_events",
"action": "read"
},
{
"role_name": "tenant_admin",
"permission_id": "90e063b7-6a15-4caa-99b6-e11a419fbf16",
"resource": "service_orders",
"action": "complete"
},
{
"role_name": "tenant_admin",
"permission_id": "2712e7f0-c117-464e-b6c5-add090f68d85",
"resource": "service_orders",
"action": "create"
},
{
"role_name": "tenant_admin",
"permission_id": "0eade96f-6d8a-4f9a-a388-ecdf8b7405d7",
"resource": "service_orders",
"action": "read"
},
{
"role_name": "tenant_admin",
"permission_id": "b332c3aa-67e7-43c8-8327-9bcf14471d25",
"resource": "service_orders",
"action": "update"
},
{
"role_name": "tenant_admin",
"permission_id": "a6671cf6-95d2-4205-956c-71f83a22d90d",
"resource": "stock_movements",
"action": "create"
},
{
"role_name": "tenant_admin",
"permission_id": "880caed1-8255-4bef-86a2-f1828e7f9536",
"resource": "stock_movements",
"action": "read"
},
{
"role_name": "tenant_admin",
"permission_id": "1c283da0-f29d-4cc4-807b-d5c6c9293e99",
"resource": "support_tickets",
"action": "create"
},
{
"role_name": "tenant_admin",
"permission_id": "9d0faa6a-4ea2-4bab-b2ae-3608d2e20141",
"resource": "support_tickets",
"action": "read"
},
{
"role_name": "tenant_admin",
"permission_id": "952e6d7f-442c-4428-a220-a8b88c7f244d",
"resource": "support_tickets",
"action": "resolve"
},
{
"role_name": "tenant_admin",
"permission_id": "34286b88-6a06-4e13-a53d-1b00d601e432",
"resource": "support_tickets",
"action": "update"
},
{
"role_name": "tenant_admin",
"permission_id": "9da75044-a113-4300-b007-96ba51da349d",
"resource": "tasks",
"action": "assign"
},
{
"role_name": "tenant_admin",
"permission_id": "7038a064-aa1d-4e88-a3ae-e81a49e975a3",
"resource": "tasks",
"action": "create"
},
{
"role_name": "tenant_admin",
"permission_id": "20032d59-4bf6-46f9-aff0-78965e34a68e",
"resource": "tasks",
"action": "read"
},
{
"role_name": "tenant_admin",
"permission_id": "a7d0c6ac-c07a-47aa-a2f3-781f0474e3d0",
"resource": "tasks",
"action": "update"
},
{
"role_name": "viewer",
"permission_id": "5c9e957d-8a99-4d19-8de1-469a526e85dc",
"resource": "companies",
"action": "read"
},
{
"role_name": "viewer",
"permission_id": "cec25721-f1fe-4560-a86a-d36741b43891",
"resource": "contracts",
"action": "read"
},
{
"role_name": "viewer",
"permission_id": "81a59683-d8d4-4b39-81cd-8468ca7df587",
"resource": "dashboard",
"action": "read"
},
{
"role_name": "viewer",
"permission_id": "2f94fb10-9033-472b-9fb1-6d5c47e2b117",
"resource": "documents",
"action": "read"
},
{
"role_name": "viewer",
"permission_id": "425055aa-9fea-4203-b869-1d1a77e43016",
"resource": "files",
"action": "read"
},
{
"role_name": "viewer",
"permission_id": "0d4761e4-1151-4cc5-b501-0b3907e6eeb9",
"resource": "people",
"action": "read"
},
{
"role_name": "viewer",
"permission_id": "13322f98-970c-41ff-9903-3a8f922d7f71",
"resource": "products",
"action": "read"
},
{
"role_name": "viewer",
"permission_id": "afaa01f4-6ee6-407a-a320-ba31dca7d1a7",
"resource": "purchase_orders",
"action": "read"
},
{
"role_name": "viewer",
"permission_id": "ed76790a-c742-4d45-8f9f-38bbe4ed51fe",
"resource": "purchase_receipts",
"action": "read"
},
{
"role_name": "viewer",
"permission_id": "1bef5b01-0272-4a14-ad42-fe9d17203a37",
"resource": "reports",
"action": "read"
},
{
"role_name": "viewer",
"permission_id": "0eade96f-6d8a-4f9a-a388-ecdf8b7405d7",
"resource": "service_orders",
"action": "read"
},
{
"role_name": "viewer",
"permission_id": "880caed1-8255-4bef-86a2-f1828e7f9536",
"resource": "stock_movements",
"action": "read"
},
{
"role_name": "viewer",
"permission_id": "9d0faa6a-4ea2-4bab-b2ae-3608d2e20141",
"resource": "support_tickets",
"action": "read"
},
{
"role_name": "viewer",
"permission_id": "20032d59-4bf6-46f9-aff0-78965e34a68e",
"resource": "tasks",
"action": "read"
}
],
"roleAssignments": [
{
"role_name": "admin_master",
"assignments": "2"
},
{
"role_name": "tenant_admin",
"assignments": "1"
},
{
"role_name": "operations_manager",
"assignments": "1"
},
{
"role_name": "operator",
"assignments": "1"
}
],
"definerFunctions": [
{
"schema": "public",
"name": "audit_log_insert",
"args": "",
"return_type": "trigger",
"is_security_definer": true,
"security": "SECURITY DEFINER",
"description": null,
"owner_id": 16388
},
{
"schema": "public",
"name": "domain_event_emit",
"args": "p_tenant_id uuid, p_event_type text, p_aggregate_type text, p_aggregate_id uuid, p_payload jsonb, p_idempotency_key text",
"return_type": "uuid",
"is_security_definer": true,
"security": "SECURITY DEFINER",
"description": null,
"owner_id": 16388
},
{
"schema": "public",
"name": "event_outbox_enqueue",
"args": "p_event_id uuid",
"return_type": "void",
"is_security_definer": true,
"security": "SECURITY DEFINER",
"description": null,
"owner_id": 16388
},
{
"schema": "public",
"name": "event_outbox_process_next",
"args": "p_destination text",
"return_type": "void",
"is_security_definer": true,
"security": "SECURITY DEFINER",
"description": null,
"owner_id": 16388
},
{
"schema": "public",
"name": "financial_reversal",
"args": "p_transaction_id uuid",
"return_type": "void",
"is_security_definer": true,
"security": "SECURITY DEFINER",
"description": null,
"owner_id": 16388
},
{
"schema": "public",
"name": "fiscal_cancel_invoice",
"args": "p_invoice_id uuid",
"return_type": "void",
"is_security_definer": true,
"security": "SECURITY DEFINER",
"description": null,
"owner_id": 16388
},
{
"schema": "public",
"name": "fiscal_emit_invoice",
"args": "p_invoice_id uuid",
"return_type": "void",
"is_security_definer": true,
"security": "SECURITY DEFINER",
"description": null,
"owner_id": 16388
},
{
"schema": "public",
"name": "is_admin_master",
"args": "",
"return_type": "boolean",
"is_security_definer": true,
"security": "SECURITY DEFINER",
"description": null,
"owner_id": 16388
},
{
"schema": "public",
"name": "is_tenant_member",
"args": "p_tenant_id uuid",
"return_type": "boolean",
"is_security_definer": true,
"security": "SECURITY DEFINER",
"description": null,
"owner_id": 16388
},
{
"schema": "public",
"name": "lgpd_consent_register",
"args": "",
"return_type": "trigger",
"is_security_definer": true,
"security": "SECURITY DEFINER",
"description": null,
"owner_id": 16388
},
{
"schema": "public",
"name": "lgpd_legal_hold_check",
"args": "",
"return_type": "trigger",
"is_security_definer": true,
"security": "SECURITY DEFINER",
"description": null,
"owner_id": 16388
},
{
"schema": "public",
"name": "match_candidates_to_demand",
"args": "p_demand_id uuid",
"return_type": "record",
"is_security_definer": true,
"security": "SECURITY DEFINER",
"description": null,
"owner_id": 16388
},
{
"schema": "public",
"name": "purchase_receipt_confirm",
"args": "",
"return_type": "trigger",
"is_security_definer": true,
"security": "SECURITY DEFINER",
"description": null,
"owner_id": 16388
},
{
"schema": "public",
"name": "stock_movement_insert",
"args": "",
"return_type": "trigger",
"is_security_definer": true,
"security": "SECURITY DEFINER",
"description": null,
"owner_id": 16388
},
{
"schema": "public",
"name": "trg_domain_event_to_outbox",
"args": "",
"return_type": "trigger",
"is_security_definer": true,
"security": "SECURITY DEFINER",
"description": null,
"owner_id": 16388
},
{
"schema": "public",
"name": "user_has_permission",
"args": "p_auth_user_id uuid, p_resource text, p_action text, p_tenant_id uuid",
"return_type": "boolean",
"is_security_definer": true,
"security": "SECURITY DEFINER",
"description": null,
"owner_id": 16388
},
{
"schema": "public",
"name": "user_permissions",
"args": "p_auth_user_id uuid, p_tenant_id uuid",
"return_type": "record",
"is_security_definer": true,
"security": "SECURITY DEFINER",
"description": null,
"owner_id": 16388
},
{
"schema": "public",
"name": "user_tenant_ids",
"args": "",
"return_type": "uuid",
"is_security_definer": true,
"security": "SECURITY DEFINER",
"description": null,
"owner_id": 16388
},
{
"schema": "public",
"name": "validation_assert",
"args": "p_condition boolean, p_gate text, p_suite text, p_test_name text, p_pass_message text, p_fail_message text, p_tenant_id uuid",
"return_type": "void",
"is_security_definer": true,
"security": "SECURITY DEFINER",
"description": null,
"owner_id": 16388
},
{
"schema": "public",
"name": "validation_upsert",
"args": "p_gate text, p_suite text, p_test_name text, p_status text, p_message text, p_details jsonb, p_tenant_id uuid",
"return_type": "void",
"is_security_definer": true,
"security": "SECURITY DEFINER",
"description": null,
"owner_id": 16388
}
],
"definerSearchPath": [
{
"schema": "public",
"name": "audit_log_insert",
"args": "",
"definition": "CREATE OR REPLACE FUNCTION public.audit_log_insert()\n RETURNS trigger\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\r\ndeclare\r\n v_actor uuid := coalesce(\r\n current_setting('app.current_person_id', true)::uuid,\r\n auth.uid()\r\n );\r\n v_correlation uuid := coalesce(\r\n current_setting('app.correlation_id', true)::uuid,\r\n gen_random_uuid()\r\n );\r\n v_causation uuid := coalesce(\r\n current_setting('app.causation_id', true)::uuid,\r\n null\r\n );\r\n v_tenant uuid;\r\nbegin\r\n -- tenant_id may not exist on all audited tables (e.g. people, tenants)\r\n -- For tenant-root entities like tenants, use the entity id itself as tenant_id\r\n -- For other entities without tenant_id, leave as null (global scope)\r\n begin\r\n v_tenant := coalesce(new.tenant_id, old.tenant_id);\r\n exception when others then\r\n if tg_table_name = 'tenants' then\r\n v_tenant := coalesce(new.id, old.id);\r\n else\r\n v_tenant := null;\r\n end if;\r\n end;\r\n insert into public.audit_logs (\r\n actor_person_id,\r\n tenant_id,\r\n scope,\r\n action,\r\n entity_type,\r\n entity_id,\r\n before_data,\r\n after_data,\r\n correlation_id,\r\n causation_id\r\n ) values (\r\n v_actor,\r\n v_tenant,\r\n tg_op,\r\n tg_op,\r\n tg_table_name,\r\n coalesce(new.id, old.id),\r\n case when tg_op = 'DELETE' then row_to_json(old) else null end,\r\n case when tg_op = 'INSERT' or tg_op = 'UPDATE' then row_to_json(new) else null end,\r\n v_correlation,\r\n v_causation\r\n );\r\n return coalesce(new, old);\r\nend;\r\n$function$\n"
},
{
"schema": "public",
"name": "domain_event_emit",
"args": "p_tenant_id uuid, p_event_type text, p_aggregate_type text, p_aggregate_id uuid, p_payload jsonb, p_idempotency_key text",
"definition": "CREATE OR REPLACE FUNCTION public.domain_event_emit(p_tenant_id uuid, p_event_type text, p_aggregate_type text, p_aggregate_id uuid, p_payload jsonb DEFAULT '{}'::jsonb, p_idempotency_key text DEFAULT NULL::text)\n RETURNS uuid\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\r\ndeclare\r\n v_event_id uuid;\r\n v_actor uuid := coalesce(\r\n current_setting('app.current_person_id', true)::uuid,\r\n auth.uid()\r\n );\r\n v_correlation uuid := coalesce(\r\n current_setting('app.correlation_id', true)::uuid,\r\n gen_random_uuid()\r\n );\r\n v_causation uuid := coalesce(\r\n current_setting('app.causation_id', true)::uuid,\r\n null\r\n );\r\n v_idempotency_key text := coalesce(\r\n p_idempotency_key,\r\n p_event_type || ':' || p_aggregate_type || ':' || p_aggregate_id::text || ':' || to_char(now(), 'YYYYMMDDHH24MISSUS')\r\n );\r\nbegin\r\n insert into public.domain_events (\r\n tenant_id,\r\n event_type,\r\n aggregate_type,\r\n aggregate_id,\r\n actor_person_id,\r\n payload,\r\n correlation_id,\r\n causation_id,\r\n idempotency_key\r\n ) values (\r\n p_tenant_id,\r\n p_event_type,\r\n p_aggregate_type,\r\n p_aggregate_id,\r\n v_actor,\r\n p_payload,\r\n v_correlation,\r\n v_causation,\r\n v_idempotency_key\r\n )\r\n on conflict (idempotency_key) do nothing\r\n returning id into v_event_id;\r\n\r\n if v_event_id is null then\r\n select id into v_event_id from public.domain_events where idempotency_key = v_idempotency_key;\r\n end if;\r\n\r\n return v_event_id;\r\nend;\r\n$function$\n"
},
{
"schema": "public",
"name": "event_outbox_enqueue",
"args": "p_event_id uuid",
"definition": "CREATE OR REPLACE FUNCTION public.event_outbox_enqueue(p_event_id uuid)\n RETURNS void\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\r\ndeclare\r\n v_correlation uuid;\r\nbegin\r\n select correlation_id into v_correlation from public.domain_events where id = p_event_id;\r\n\r\n insert into public.event_outbox (\r\n tenant_id,\r\n event_id,\r\n correlation_id,\r\n available_at,\r\n status\r\n )\r\n select\r\n de.tenant_id,\r\n de.id,\r\n de.correlation_id,\r\n now(),\r\n 'pending'\r\n from public.domain_events de\r\n where de.id = p_event_id\r\n on conflict (event_id) do nothing;\r\nend;\r\n$function$\n"
},
{
"schema": "public",
"name": "event_outbox_process_next",
"args": "p_destination text",
"definition": "CREATE OR REPLACE FUNCTION public.event_outbox_process_next(p_destination text)\n RETURNS void\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\r\ndeclare\r\n v_outbox record;\r\nbegin\r\n select * into v_outbox\r\n from public.event_outbox\r\n where status = 'pending'\r\n and available_at <= now()\r\n and attempts < 5\r\n order by available_at\r\n for update skip locked\r\n limit 1;\r\n\r\n if not found then\r\n return;\r\n end if;\r\n\r\n update public.event_outbox\r\n set status = 'processing',\r\n attempts = attempts + 1,\r\n updated_at = now()\r\n where id = v_outbox.id;\r\n\r\n begin\r\n insert into public.event_deliveries (\r\n tenant_id,\r\n outbox_id,\r\n destination,\r\n status,\r\n correlation_id,\r\n request_payload\r\n )\r\n select\r\n eo.tenant_id,\r\n eo.id,\r\n p_destination,\r\n 'sent',\r\n eo.correlation_id,\r\n jsonb_build_object(\r\n 'event_id', eo.event_id,\r\n 'aggregate_type', de.aggregate_type,\r\n 'aggregate_id', de.aggregate_id,\r\n 'event_type', de.event_type,\r\n 'payload', de.payload\r\n )\r\n from public.event_outbox eo\r\n join public.domain_events de on de.id = eo.event_id\r\n where eo.id = v_outbox.id\r\n on conflict (idempotency_key) do nothing;\r\n\r\n update public.event_outbox\r\n set status = 'processed',\r\n processed_at = now(),\r\n updated_at = now()\r\n where id = v_outbox.id;\r\n exception when others then\r\n update public.event_outbox\r\n set status = 'failed',\r\n last_error = sqlerrm,\r\n available_at = case when attempts + 1 >= 5 then null else now() + interval '1 minute' * power(2, attempts) end,\r\n updated_at = now()\r\n where id = v_outbox.id;\r\n end;\r\nend;\r\n$function$\n"
},
{
"schema": "public",
"name": "financial_reversal",
"args": "p_transaction_id uuid",
"definition": "CREATE OR REPLACE FUNCTION public.financial_reversal(p_transaction_id uuid)\n RETURNS void\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\r\ndeclare\r\n v_transaction public.financial_transactions%rowtype;\r\n v_actor uuid;\r\nbegin\r\n select auth.uid() into v_actor;\r\n\r\n if not public.is_tenant_member((select tenant_id from public.financial_transactions where id = p_transaction_id)) then\r\n raise exception 'not allowed';\r\n end if;\r\n\r\n if not public.user_has_permission(v_actor, 'financial_transactions.update') then\r\n raise exception 'not allowed';\r\n end if;\r\n\r\n select * into v_transaction from public.financial_transactions where id = p_transaction_id;\r\n if not found then\r\n raise exception 'transaction not found';\r\n end if;\r\n\r\n insert into public.financial_transactions (\r\n tenant_id, cost_center_id, category_id, type, amount, competence_date, payment_date,\r\n bank_account, description, reference, origin_document_type, origin_document_id,\r\n actor_person_id, correlation_id\r\n )\r\n values (\r\n v_transaction.tenant_id, v_transaction.cost_center_id, v_transaction.category_id,\r\n case when v_transaction.type = 'debit' then 'credit' else 'debit' end,\r\n v_transaction.amount, v_transaction.competence_date, v_transaction.payment_date,\r\n v_transaction.bank_account, v_transaction.description || ' (reversal)',\r\n v_transaction.reference, v_transaction.origin_document_type, v_transaction.origin_document_id,\r\n v_actor, gen_random_uuid()\r\n );\r\nend;\r\n$function$\n"
},
{
"schema": "public",
"name": "fiscal_cancel_invoice",
"args": "p_invoice_id uuid",
"definition": "CREATE OR REPLACE FUNCTION public.fiscal_cancel_invoice(p_invoice_id uuid)\n RETURNS void\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\r\ndeclare\r\n v_invoice public.invoices%rowtype;\r\n v_tenant_id uuid;\r\nbegin\r\n select * into v_invoice from public.invoices where id = p_invoice_id;\r\n if not found then\r\n raise exception 'invoice not found';\r\n end if;\r\n\r\n v_tenant_id := v_invoice.tenant_id;\r\n\r\n if not public.is_tenant_member(v_tenant_id) then\r\n raise exception 'not a member of the invoice tenant';\r\n end if;\r\n\r\n if not public.user_has_permission(auth.uid(), 'invoices', 'update', v_tenant_id) then\r\n raise exception 'permission denied: invoices.update required';\r\n end if;\r\n\r\n update public.invoices\r\n set status = 'cancelled'\r\n where id = p_invoice_id;\r\nend;\r\n$function$\n"
},
{
"schema": "public",
"name": "fiscal_emit_invoice",
"args": "p_invoice_id uuid",
"definition": "CREATE OR REPLACE FUNCTION public.fiscal_emit_invoice(p_invoice_id uuid)\n RETURNS void\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\r\ndeclare\r\n v_invoice public.invoices%rowtype;\r\n v_tenant_id uuid;\r\nbegin\r\n select * into v_invoice from public.invoices where id = p_invoice_id;\r\n if not found then\r\n raise exception 'invoice not found';\r\n end if;\r\n\r\n v_tenant_id := v_invoice.tenant_id;\r\n\r\n if not public.is_tenant_member(v_tenant_id) then\r\n raise exception 'not a member of the invoice tenant';\r\n end if;\r\n\r\n if not public.user_has_permission(auth.uid(), 'invoices', 'update', v_tenant_id) then\r\n raise exception 'permission denied: invoices.update required';\r\n end if;\r\n\r\n update public.invoices\r\n set status = 'emitted'\r\n where id = p_invoice_id;\r\nend;\r\n$function$\n"
},
{
"schema": "public",
"name": "is_admin_master",
"args": "",
"definition": "CREATE OR REPLACE FUNCTION public.is_admin_master()\n RETURNS boolean\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public', 'pg_temp'\nAS $function$\nBEGIN\n RETURN EXISTS (\n SELECT 1\n FROM public.people p\n JOIN public.role_assignments ra ON ra.person_id = p.id\n JOIN public.roles r ON r.id = ra.role_id\n WHERE p.auth_user_id = auth.uid()\n AND r.scope = 'global'\n AND r.name = 'admin_master'\n );\nEND;\n$function$\n"
},
{
"schema": "public",
"name": "is_tenant_member",
"args": "p_tenant_id uuid",
"definition": "CREATE OR REPLACE FUNCTION public.is_tenant_member(p_tenant_id uuid)\n RETURNS boolean\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public', 'pg_temp'\nAS $function$\nBEGIN\n RETURN EXISTS (\n SELECT 1\n FROM public.people p\n JOIN public.tenant_memberships tm ON tm.person_id = p.id\n WHERE p.auth_user_id = auth.uid()\n AND tm.tenant_id = p_tenant_id\n AND tm.status = 'active'\n );\nEND;\n$function$\n"
},
{
"schema": "public",
"name": "lgpd_consent_register",
"args": "",
"definition": "CREATE OR REPLACE FUNCTION public.lgpd_consent_register()\n RETURNS trigger\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\r\ndeclare\r\n v_actor uuid := coalesce(\r\n current_setting('app.current_person_id', true)::uuid,\r\n auth.uid()\r\n );\r\n v_correlation uuid := coalesce(\r\n current_setting('app.correlation_id', true)::uuid,\r\n gen_random_uuid()\r\n );\r\nbegin\r\n if new.granted = true and old.granted = false then\r\n new.actor_person_id = v_actor;\r\n new.correlation_id = v_correlation;\r\n end if;\r\n return new;\r\nend;\r\n$function$\n"
},
{
"schema": "public",
"name": "lgpd_legal_hold_check",
"args": "",
"definition": "CREATE OR REPLACE FUNCTION public.lgpd_legal_hold_check()\n RETURNS trigger\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\r\nbegin\r\n if exists (\r\n select 1 from public.data_deletion_requests\r\n where person_id = old.person_id\r\n and status in ('pending', 'approved')\r\n and legal_hold = true\r\n ) then\r\n raise exception 'legal hold active for person %, deletion blocked', old.person_id;\r\n end if;\r\n return old;\r\nend;\r\n$function$\n"
},
{
"schema": "public",
"name": "match_candidates_to_demand",
"args": "p_demand_id uuid",
"definition": "CREATE OR REPLACE FUNCTION public.match_candidates_to_demand(p_demand_id uuid)\n RETURNS TABLE(candidate_id uuid, score numeric)\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\r\ndeclare\r\n v_actor uuid;\r\n v_demand public.recruitment_demands%rowtype;\r\nbegin\r\n select auth.uid() into v_actor;\r\n\r\n if not public.is_tenant_member((select tenant_id from public.recruitment_demands where id = p_demand_id)) then\r\n raise exception 'not allowed';\r\n end if;\r\n\r\n if not public.user_has_permission(v_actor, 'recruitment.read') then\r\n raise exception 'not allowed';\r\n end if;\r\n\r\n select * into v_demand from public.recruitment_demands where id = p_demand_id;\r\n\r\n return query\r\n select\r\n tp.person_id as candidate_id,\r\n 0 as score\r\n from public.talent_pool_memberships tp\r\n where tp.tenant_id = v_demand.tenant_id\r\n and tp.status = 'active'\r\n order by tp.created_at desc;\r\nend;\r\n$function$\n"
},
{
"schema": "public",
"name": "purchase_receipt_confirm",
"args": "",
"definition": "CREATE OR REPLACE FUNCTION public.purchase_receipt_confirm()\n RETURNS trigger\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\r\ndeclare\r\n v_tenant_id uuid;\r\n v_actor uuid := coalesce(\r\n current_setting('app.current_person_id', true)::uuid,\r\n auth.uid()\r\n );\r\n v_correlation uuid := coalesce(\r\n current_setting('app.correlation_id', true)::uuid,\r\n gen_random_uuid()\r\n );\r\n v_causation uuid := coalesce(\r\n current_setting('app.causation_id', true)::uuid,\r\n null\r\n );\r\n v_event_id uuid;\r\nbegin\r\n if new.status = 'confirmed' and (old.status is null or old.status <> 'confirmed') then\r\n v_tenant_id = new.tenant_id;\r\n\r\n insert into public.stock_entries (\r\n tenant_id,\r\n product_id,\r\n quantity,\r\n unit_cost,\r\n movement_type,\r\n reference_id,\r\n reference_type,\r\n notes,\r\n actor_person_id,\r\n created_at\r\n )\r\n select\r\n pri.tenant_id,\r\n pri.product_id,\r\n pri.quantity,\r\n pri.unit_cost,\r\n 'entry',\r\n new.id,\r\n 'purchase_receipt',\r\n pri.notes,\r\n v_actor,\r\n now()\r\n from public.purchase_receipt_items pri\r\n where pri.receipt_id = new.id;\r\n\r\n insert into public.stock_balances (\r\n tenant_id,\r\n product_id,\r\n quantity,\r\n reserved_quantity,\r\n available_quantity\r\n )\r\n select\r\n pri.tenant_id,\r\n pri.product_id,\r\n pri.quantity,\r\n 0,\r\n pri.quantity\r\n from public.purchase_receipt_items pri\r\n where pri.receipt_id = new.id\r\n on conflict (tenant_id, product_id) do update\r\n set quantity = stock_balances.quantity + excluded.quantity,\r\n available_quantity = stock_balances.available_quantity + excluded.quantity,\r\n last_movement_at = now(),\r\n updated_at = now();\r\n\r\n update public.purchase_order_items poi\r\n set received_quantity = poi.received_quantity + pri.quantity\r\n from public.purchase_receipt_items pri\r\n where pri.receipt_id = new.id\r\n and poi.id = pri.purchase_order_item_id;\r\n\r\n v_event_id = public.domain_event_emit(\r\n v_tenant_id,\r\n 'purchase.receipt_confirmed',\r\n 'purchase_receipt',\r\n new.id,\r\n jsonb_build_object(\r\n 'purchase_order_id', new.purchase_order_id,\r\n 'supplier_id', new.supplier_id,\r\n 'received_at', new.received_at\r\n )\r\n );\r\n\r\n if v_event_id is not null then\r\n perform public.event_outbox_enqueue(v_event_id);\r\n end if;\r\n end if;\r\n\r\n return new;\r\nend;\r\n$function$\n"
},
{
"schema": "public",
"name": "stock_movement_insert",
"args": "",
"definition": "CREATE OR REPLACE FUNCTION public.stock_movement_insert()\n RETURNS trigger\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\r\ndeclare\r\n v_tenant_id uuid;\r\n v_product_id uuid;\r\n v_quantity numeric;\r\n v_movement_type text;\r\n v_actor uuid := coalesce(\r\n current_setting('app.current_person_id', true)::uuid,\r\n auth.uid()\r\n );\r\n v_correlation uuid := coalesce(\r\n current_setting('app.correlation_id', true)::uuid,\r\n gen_random_uuid()\r\n );\r\n v_causation uuid := coalesce(\r\n current_setting('app.causation_id', true)::uuid,\r\n null\r\n );\r\n v_event_id uuid;\r\nbegin\r\n v_tenant_id = new.tenant_id;\r\n v_product_id = new.product_id;\r\n v_quantity = new.quantity;\r\n v_movement_type = new.movement_type;\r\n\r\n if v_movement_type not in ('entry', 'exit', 'transfer', 'adjustment', 'inventory', 'return') then\r\n raise exception 'invalid movement_type: %', v_movement_type;\r\n end if;\r\n\r\n if v_movement_type = 'exit' or v_movement_type = 'transfer' or v_movement_type = 'adjustment' then\r\n if v_quantity > 0 then\r\n v_quantity = -abs(v_quantity);\r\n end if;\r\n elsif v_movement_type = 'entry' or v_movement_type = 'return' or v_movement_type = 'inventory' then\r\n if v_quantity < 0 then\r\n v_quantity = abs(v_quantity);\r\n end if;\r\n end if;\r\n\r\n insert into public.stock_entries (\r\n tenant_id,\r\n product_id,\r\n quantity,\r\n unit_cost,\r\n movement_type,\r\n reference_id,\r\n reference_type,\r\n notes,\r\n actor_person_id,\r\n created_at\r\n ) values (\r\n v_tenant_id,\r\n v_product_id,\r\n v_quantity,\r\n null,\r\n v_movement_type,\r\n new.reference_id,\r\n 'stock_movement',\r\n new.notes,\r\n v_actor,\r\n now()\r\n );\r\n\r\n insert into public.stock_balances (\r\n tenant_id,\r\n product_id,\r\n quantity,\r\n reserved_quantity,\r\n available_quantity\r\n ) values (\r\n v_tenant_id,\r\n v_product_id,\r\n v_quantity,\r\n 0,\r\n v_quantity\r\n )\r\n on conflict (tenant_id, product_id) do update\r\n set quantity = stock_balances.quantity + v_quantity,\r\n available_quantity = stock_balances.available_quantity + v_quantity,\r\n last_movement_at = now(),\r\n updated_at = now()\r\n where (stock_balances.quantity + v_quantity) >= 0;\r\n\r\n if not found then\r\n raise exception 'negative stock balance not allowed for tenant % product %', v_tenant_id, v_product_id;\r\n end if;\r\n\r\n v_event_id = public.domain_event_emit(\r\n v_tenant_id,\r\n 'stock.movement_created',\r\n 'stock',\r\n new.id,\r\n jsonb_build_object(\r\n 'product_id', v_product_id,\r\n 'movement_type', v_movement_type,\r\n 'quantity', v_quantity,\r\n 'movement_id', new.id\r\n )\r\n );\r\n\r\n if v_event_id is not null then\r\n perform public.event_outbox_enqueue(v_event_id);\r\n end if;\r\n\r\n return new;\r\nend;\r\n$function$\n"
},
{
"schema": "public",
"name": "trg_domain_event_to_outbox",
"args": "",
"definition": "CREATE OR REPLACE FUNCTION public.trg_domain_event_to_outbox()\n RETURNS trigger\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\r\nbegin\r\n perform public.event_outbox_enqueue(new.id);\r\n return new;\r\nend;\r\n$function$\n"
},
{
"schema": "public",
"name": "user_has_permission",
"args": "p_auth_user_id uuid, p_resource text, p_action text, p_tenant_id uuid",
"definition": "CREATE OR REPLACE FUNCTION public.user_has_permission(p_auth_user_id uuid, p_resource text, p_action text, p_tenant_id uuid)\n RETURNS boolean\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\r\nbegin\r\n return exists (\r\n select 1\r\n from public.people pe\r\n join public.role_assignments ra on ra.person_id = pe.id and ra.tenant_id = p_tenant_id\r\n join public.role_permissions rp on rp.role_id = ra.role_id\r\n join public.permissions perm on perm.id = rp.permission_id\r\n where pe.auth_user_id = p_auth_user_id\r\n and perm.resource = p_resource\r\n and perm.action = p_action\r\n );\r\nend;\r\n$function$\n"
},
{
"schema": "public",
"name": "user_permissions",
"args": "p_auth_user_id uuid, p_tenant_id uuid",
"definition": "CREATE OR REPLACE FUNCTION public.user_permissions(p_auth_user_id uuid, p_tenant_id uuid)\n RETURNS TABLE(resource text, action text, description text)\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\r\nbegin\r\n return query\r\n select distinct perm.resource, perm.action, perm.description\r\n from public.people pe\r\n join public.role_assignments ra on ra.person_id = pe.id and ra.tenant_id = p_tenant_id\r\n join public.role_permissions rp on rp.role_id = ra.role_id\r\n join public.permissions perm on perm.id = rp.permission_id\r\n where pe.auth_user_id = p_auth_user_id;\r\nend;\r\n$function$\n"
},
{
"schema": "public",
"name": "user_tenant_ids",
"args": "",
"definition": "CREATE OR REPLACE FUNCTION public.user_tenant_ids()\n RETURNS SETOF uuid\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public', 'pg_temp'\nAS $function$\nBEGIN\n RETURN QUERY\n SELECT tm.tenant_id\n FROM public.people p\n JOIN public.tenant_memberships tm ON tm.person_id = p.id\n WHERE p.auth_user_id = auth.uid()\n AND tm.status = 'active';\nEND;\n$function$\n"
},
{
"schema": "public",
"name": "validation_assert",
"args": "p_condition boolean, p_gate text, p_suite text, p_test_name text, p_pass_message text, p_fail_message text, p_tenant_id uuid",
"definition": "CREATE OR REPLACE FUNCTION public.validation_assert(p_condition boolean, p_gate text, p_suite text, p_test_name text, p_pass_message text DEFAULT 'OK'::text, p_fail_message text DEFAULT 'FAIL'::text, p_tenant_id uuid DEFAULT NULL::uuid)\n RETURNS void\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\r\nbegin\r\n if p_condition then\r\n perform public.validation_upsert(p_gate, p_suite, p_test_name, 'PASS', p_pass_message, null, p_tenant_id);\r\n else\r\n perform public.validation_upsert(p_gate, p_suite, p_test_name, 'FAIL', p_fail_message, null, p_tenant_id);\r\n end if;\r\nend;\r\n$function$\n"
},
{
"schema": "public",
"name": "validation_upsert",
"args": "p_gate text, p_suite text, p_test_name text, p_status text, p_message text, p_details jsonb, p_tenant_id uuid",
"definition": "CREATE OR REPLACE FUNCTION public.validation_upsert(p_gate text, p_suite text, p_test_name text, p_status text, p_message text DEFAULT NULL::text, p_details jsonb DEFAULT NULL::jsonb, p_tenant_id uuid DEFAULT NULL::uuid)\n RETURNS void\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\r\nbegin\r\n insert into public.validation_results (tenant_id, gate, suite, test_name, status, message, details)\r\n values (\r\n coalesce(p_tenant_id, (select id from public.tenants limit 1)),\r\n p_gate, p_suite, p_test_name, p_status, p_message, p_details\r\n )\r\n on conflict do nothing;\r\nend;\r\n$function$\n"
}
],
"definerDependencies": [
{
"schema": "public",
"func_name": "audit_log_insert",
"func_args": "",
"dependent_object": "235455"
},
{
"schema": "public",
"func_name": "is_admin_master",
"func_args": "",
"dependent_object": "235515"
},
{
"schema": "public",
"func_name": "is_tenant_member",
"func_args": "p_tenant_id uuid",
"dependent_object": "235514"
},
{
"schema": "public",
"func_name": "lgpd_consent_register",
"func_args": "",
"dependent_object": "235462"
},
{
"schema": "public",
"func_name": "lgpd_legal_hold_check",
"func_args": "",
"dependent_object": "235461"
},
{
"schema": "public",
"func_name": "purchase_receipt_confirm",
"func_args": "",
"dependent_object": "235460"
},
{
"schema": "public",
"func_name": "stock_movement_insert",
"func_args": "",
"dependent_object": "235459"
},
{
"schema": "public",
"func_name": "trg_domain_event_to_outbox",
"func_args": "",
"dependent_object": "235509"
},
{
"schema": "public",
"func_name": "user_tenant_ids",
"func_args": "",
"dependent_object": "235516"
}
],
"definerOwners": [
{
"schema": "public",
"name": "audit_log_insert",
"args": "",
"owner": "postgres"
},
{
"schema": "public",
"name": "domain_event_emit",
"args": "p_tenant_id uuid, p_event_type text, p_aggregate_type text, p_aggregate_id uuid, p_payload jsonb, p_idempotency_key text",
"owner": "postgres"
},
{
"schema": "public",
"name": "event_outbox_enqueue",
"args": "p_event_id uuid",
"owner": "postgres"
},
{
"schema": "public",
"name": "event_outbox_process_next",
"args": "p_destination text",
"owner": "postgres"
},
{
"schema": "public",
"name": "financial_reversal",
"args": "p_transaction_id uuid",
"owner": "postgres"
},
{
"schema": "public",
"name": "fiscal_cancel_invoice",
"args": "p_invoice_id uuid",
"owner": "postgres"
},
{
"schema": "public",
"name": "fiscal_emit_invoice",
"args": "p_invoice_id uuid",
"owner": "postgres"
},
{
"schema": "public",
"name": "is_admin_master",
"args": "",
"owner": "postgres"
},
{
"schema": "public",
"name": "is_tenant_member",
"args": "p_tenant_id uuid",
"owner": "postgres"
},
{
"schema": "public",
"name": "lgpd_consent_register",
"args": "",
"owner": "postgres"
},
{
"schema": "public",
"name": "lgpd_legal_hold_check",
"args": "",
"owner": "postgres"
},
{
"schema": "public",
"name": "match_candidates_to_demand",
"args": "p_demand_id uuid",
"owner": "postgres"
},
{
"schema": "public",
"name": "purchase_receipt_confirm",
"args": "",
"owner": "postgres"
},
{
"schema": "public",
"name": "stock_movement_insert",
"args": "",
"owner": "postgres"
},
{
"schema": "public",
"name": "trg_domain_event_to_outbox",
"args": "",
"owner": "postgres"
},
{
"schema": "public",
"name": "user_has_permission",
"args": "p_auth_user_id uuid, p_resource text, p_action text, p_tenant_id uuid",
"owner": "postgres"
},
{
"schema": "public",
"name": "user_permissions",
"args": "p_auth_user_id uuid, p_tenant_id uuid",
"owner": "postgres"
},
{
"schema": "public",
"name": "user_tenant_ids",
"args": "",
"owner": "postgres"
},
{
"schema": "public",
"name": "validation_assert",
"args": "p_condition boolean, p_gate text, p_suite text, p_test_name text, p_pass_message text, p_fail_message text, p_tenant_id uuid",
"owner": "postgres"
},
{
"schema": "public",
"name": "validation_upsert",
"args": "p_gate text, p_suite text, p_test_name text, p_status text, p_message text, p_details jsonb, p_tenant_id uuid",
"owner": "postgres"
}
]
}
