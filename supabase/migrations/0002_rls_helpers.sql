-- =====================================================================
-- Funcoes SECURITY DEFINER usadas nas policies.
-- Sao isoladas em schema 'private' e nao podem chamar tabelas que estao
-- sob RLS sem 'bypass' explicito - por isso usamos SECURITY DEFINER.
-- =====================================================================

create schema if not exists private;

-- Retorna a role do usuario atual (ou null).
create or replace function private.current_user_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() limit 1;
$$;

-- Retorna a company_id do usuario atual (ou null).
create or replace function private.current_user_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select company_id from public.profiles where id = auth.uid() limit 1;
$$;

-- Retorna lista de jobs atribuidos a recrutadora atual (ids).
create or replace function private.current_recruiter_job_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.jobs where recruiter_id = auth.uid();
$$;

-- Retorna lista de projects atribuidos a recrutadora atual (ids).
create or replace function private.current_recruiter_project_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.projects where assigned_recruiter_id = auth.uid();
$$;

-- True se o usuario atual eh admin.
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

-- Garante que somente o postgres role / service_role veem o schema private.
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;
grant execute on all functions in schema private to authenticated, service_role;
