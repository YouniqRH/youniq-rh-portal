-- =====================================================================
-- Youniq RH - Schema inicial
-- Tabelas, indices, triggers de updated_at
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------- ENUMs ----------
create type user_role as enum ('admin', 'recruiter', 'client');
create type company_status as enum ('active', 'inactive');
create type project_status as enum (
  'planejado', 'em_andamento', 'atrasado', 'pausado', 'concluido', 'cancelado'
);
create type job_status as enum (
  'aberto', 'em_andamento', 'pausado', 'concluido', 'cancelado'
);
create type candidate_stage as enum (
  'triagem', 'entrevista_rh', 'entrevista_gestor', 'teste_tecnico',
  'proposta', 'contratado', 'reprovado'
);
create type candidate_status as enum (
  'em_andamento', 'aprovado', 'reprovado', 'standby'
);

-- ---------- companies ----------
create table public.companies (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  status      company_status not null default 'active',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------- profiles (espelha auth.users 1:1) ----------
-- password_hash NAO e armazenado aqui: Supabase Auth gere isso em auth.users.
-- Mantemos a coluna apenas como referencia documental e nunca a populamos.
create table public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  name                text not null,
  email               text not null unique,
  role                user_role not null default 'client',
  company_id          uuid references public.companies(id) on delete set null,
  assigned_projects   uuid[] not null default '{}',
  assigned_jobs       uuid[] not null default '{}',
  assigned_services   text[] not null default '{}',
  active              boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index profiles_role_idx on public.profiles(role);
create index profiles_company_id_idx on public.profiles(company_id);

-- ---------- projects ----------
create table public.projects (
  id                       uuid primary key default gen_random_uuid(),
  company_id               uuid not null references public.companies(id) on delete cascade,
  nome                     text not null,
  tipo_servico             text not null,
  status                   project_status not null default 'em_andamento',
  progresso                int not null default 0 check (progresso between 0 and 100),
  prazo_data               date,
  last_update              timestamptz not null default now(),
  assigned_recruiter_id    uuid references public.profiles(id) on delete set null,
  visible_to_client        boolean not null default true,
  tem_recrutamento         boolean not null default false,
  descricao                text default '',
  anexos                   jsonb not null default '[]'::jsonb,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);
create index projects_company_id_idx on public.projects(company_id);
create index projects_recruiter_idx on public.projects(assigned_recruiter_id);

-- ---------- jobs (vagas dentro de projetos de recrutamento) ----------
create table public.jobs (
  id                  uuid primary key default gen_random_uuid(),
  project_id          uuid not null references public.projects(id) on delete cascade,
  recruiter_id        uuid references public.profiles(id) on delete set null,
  title               text not null,
  status              job_status not null default 'aberto',
  visible_to_client   boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index jobs_project_id_idx on public.jobs(project_id);
create index jobs_recruiter_id_idx on public.jobs(recruiter_id);

-- ---------- candidates ----------
create table public.candidates (
  id          uuid primary key default gen_random_uuid(),
  job_id      uuid not null references public.jobs(id) on delete cascade,
  name        text not null,
  stage       candidate_stage not null default 'triagem',
  score       int not null default 0 check (score between 0 and 100),
  notes       text default '',
  status      candidate_status not null default 'em_andamento',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index candidates_job_id_idx on public.candidates(job_id);

-- ---------- services_contracted ----------
create table public.services_contracted (
  id                uuid primary key default gen_random_uuid(),
  company_id        uuid not null references public.companies(id) on delete cascade,
  service_name      text not null,
  active            boolean not null default true,
  visible_modules   text[] not null default '{}',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (company_id, service_name)
);
create index services_company_idx on public.services_contracted(company_id);

-- ---------- audit_logs ----------
create table public.audit_logs (
  id           bigserial primary key,
  user_id      uuid references public.profiles(id) on delete set null,
  action       text not null,
  entity_type  text not null,
  entity_id    text,
  metadata     jsonb default '{}'::jsonb,
  created_at   timestamptz not null default now()
);
create index audit_logs_user_idx on public.audit_logs(user_id);
create index audit_logs_entity_idx on public.audit_logs(entity_type, entity_id);
create index audit_logs_created_idx on public.audit_logs(created_at desc);

-- ---------- updated_at trigger ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger trg_companies_touch  before update on public.companies  for each row execute function public.touch_updated_at();
create trigger trg_profiles_touch   before update on public.profiles   for each row execute function public.touch_updated_at();
create trigger trg_projects_touch   before update on public.projects   for each row execute function public.touch_updated_at();
create trigger trg_jobs_touch       before update on public.jobs       for each row execute function public.touch_updated_at();
create trigger trg_candidates_touch before update on public.candidates for each row execute function public.touch_updated_at();
create trigger trg_services_touch   before update on public.services_contracted for each row execute function public.touch_updated_at();
