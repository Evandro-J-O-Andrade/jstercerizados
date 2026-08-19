-- 00_extensions.sql
-- Extensões base do PostgreSQL/Supabase

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "btree_gist";
