-- =====================================================================
-- Provisionamento automatico de profiles quando auth.users recebe insert.
-- O nome e role vem de auth.users.raw_user_meta_data, definido no
-- create_user via service_role (admin panel) ou no signup com metadata.
-- =====================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  _role user_role;
  _name text;
  _company uuid;
begin
  _role    := coalesce((new.raw_user_meta_data->>'role')::user_role, 'client');
  _name    := coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
  _company := nullif(new.raw_user_meta_data->>'company_id', '')::uuid;

  insert into public.profiles (id, name, email, role, company_id)
  values (new.id, _name, new.email, _role, _company)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
