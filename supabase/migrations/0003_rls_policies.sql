-- =====================================================================
-- RLS: ativa em todas as tabelas e cria policies por role.
-- Filosofia: BLOQUEAR por padrao. Liberar somente o explicito.
-- Mutations: somente admin direto via RLS. Recrutadora/cliente fazem
-- mutations atraves de Server Actions usando service_role com checks
-- de autorizacao em codigo (defesa em profundidade).
-- =====================================================================

alter table public.companies            enable row level security;
alter table public.profiles             enable row level security;
alter table public.projects             enable row level security;
alter table public.jobs                 enable row level security;
alter table public.candidates           enable row level security;
alter table public.services_contracted  enable row level security;
alter table public.audit_logs           enable row level security;

-- =============== profiles ===============
-- Usuario le seu proprio perfil; admin le todos.
create policy "profiles_self_select"
on public.profiles for select
to authenticated
using (id = auth.uid() or private.is_admin());

-- Recrutadora ve perfis de clientes das empresas dos projetos atribuidos
-- (para popular interface de mensagens/contatos). Opcional - mantemos restritivo.
-- Apenas admin pode escrever em profiles via RLS.
create policy "profiles_admin_write"
on public.profiles for all
to authenticated
using (private.is_admin())
with check (private.is_admin());

-- =============== companies ===============
-- Admin tudo. Cliente le a propria. Recrutadora le companies cujos projetos foram atribuidos a ela.
create policy "companies_admin_all"
on public.companies for all
to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy "companies_client_self_select"
on public.companies for select
to authenticated
using (id = private.current_user_company_id());

create policy "companies_recruiter_assigned_select"
on public.companies for select
to authenticated
using (
  private.current_user_role() = 'recruiter'
  and exists (
    select 1 from public.projects p
    where p.company_id = companies.id and p.assigned_recruiter_id = auth.uid()
  )
);

-- =============== projects ===============
create policy "projects_admin_all"
on public.projects for all
to authenticated
using (private.is_admin())
with check (private.is_admin());

-- Cliente: ve projetos da sua empresa marcados como visiveis.
create policy "projects_client_select"
on public.projects for select
to authenticated
using (
  private.current_user_role() = 'client'
  and company_id = private.current_user_company_id()
  and visible_to_client = true
);

-- Recrutadora: ve apenas os projetos atribuidos a ela.
create policy "projects_recruiter_select"
on public.projects for select
to authenticated
using (
  private.current_user_role() = 'recruiter'
  and assigned_recruiter_id = auth.uid()
);

-- =============== jobs ===============
create policy "jobs_admin_all"
on public.jobs for all
to authenticated
using (private.is_admin())
with check (private.is_admin());

-- Cliente: ve jobs visiveis cujo projeto pertence a sua empresa e esta visivel.
create policy "jobs_client_select"
on public.jobs for select
to authenticated
using (
  private.current_user_role() = 'client'
  and visible_to_client = true
  and exists (
    select 1 from public.projects p
    where p.id = jobs.project_id
      and p.visible_to_client = true
      and p.company_id = private.current_user_company_id()
  )
);

-- Recrutadora: ve jobs atribuidos a ela.
create policy "jobs_recruiter_select"
on public.jobs for select
to authenticated
using (
  private.current_user_role() = 'recruiter'
  and recruiter_id = auth.uid()
);

-- Recrutadora pode atualizar status/visibility dos seus jobs.
create policy "jobs_recruiter_update"
on public.jobs for update
to authenticated
using (
  private.current_user_role() = 'recruiter'
  and recruiter_id = auth.uid()
)
with check (
  private.current_user_role() = 'recruiter'
  and recruiter_id = auth.uid()
);

-- =============== candidates ===============
create policy "candidates_admin_all"
on public.candidates for all
to authenticated
using (private.is_admin())
with check (private.is_admin());

-- Recrutadora: candidatos cujos jobs estao atribuidos a ela.
create policy "candidates_recruiter_select"
on public.candidates for select
to authenticated
using (
  private.current_user_role() = 'recruiter'
  and exists (
    select 1 from public.jobs j
    where j.id = candidates.job_id and j.recruiter_id = auth.uid()
  )
);

create policy "candidates_recruiter_write"
on public.candidates for all
to authenticated
using (
  private.current_user_role() = 'recruiter'
  and exists (
    select 1 from public.jobs j
    where j.id = candidates.job_id and j.recruiter_id = auth.uid()
  )
)
with check (
  private.current_user_role() = 'recruiter'
  and exists (
    select 1 from public.jobs j
    where j.id = candidates.job_id and j.recruiter_id = auth.uid()
  )
);

-- Cliente: ve candidatos somente do shortlist de jobs visiveis da propria empresa.
create policy "candidates_client_select"
on public.candidates for select
to authenticated
using (
  private.current_user_role() = 'client'
  and exists (
    select 1 from public.jobs j
    join public.projects p on p.id = j.project_id
    where j.id = candidates.job_id
      and j.visible_to_client = true
      and p.visible_to_client = true
      and p.company_id = private.current_user_company_id()
  )
);

-- =============== services_contracted ===============
create policy "services_admin_all"
on public.services_contracted for all
to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy "services_client_self_select"
on public.services_contracted for select
to authenticated
using (
  private.current_user_role() = 'client'
  and company_id = private.current_user_company_id()
);

-- =============== audit_logs ===============
-- Somente admin le. Insert e feito server-side via service_role.
create policy "audit_admin_select"
on public.audit_logs for select
to authenticated
using (private.is_admin());

-- Bloqueia explicitamente qualquer insert via clientes autenticados.
-- Inserts so via service_role (que bypassa RLS).
create policy "audit_no_insert_clients"
on public.audit_logs for insert
to authenticated
with check (false);
