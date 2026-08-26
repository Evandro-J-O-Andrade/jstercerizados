# C1.5 — Dashboard Data Matrix

## Objetivo

Documentar de onde a dashboard deve puxar dados reais, sem mock.

## Dashboards administrativas

### DashboardHome (`src/pages/dashboard/DashboardHome.tsx`)

- dados: reais via Supabase
- tabelas: people, jobs, candidates, applications, company_relationships, domain_events
- escopo: tenant ou platform conforme role
- status: ok

### Dashboard antiga (`src/pages/Dashboard.tsx`)

- dados: **mock removido**
- tabelas: orçamentos, parceiros, fornecedores, currículos
- status: estrutura mantida, sem dados falsos
- próximos passos: conectar a repositories reais ou manter vazio até haver backend

## Regra

- nenhum KPI pode ser exibido sem query real
- números devem vir de count/aggregation do banco
- datas/horas devem ser dinâmicas
- identidade do usuário deve vir do AuthContext

## Entregas futuras

- widgets reais por módulo
- gráficos somente quando houver série real suficiente
- empty states quando não houver dado
