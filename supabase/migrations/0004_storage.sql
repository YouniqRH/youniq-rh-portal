-- =====================================================================
-- Storage: bucket 'documents' privado + policies por path
-- Convencao de path: {company_id}/{nome-do-arquivo}
-- Apenas signed URLs sao usadas no frontend - publico nunca le.
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- ---------- SELECT: admin tudo; cliente seu prefix; recrutadora prefix das empresas atribuidas ----------
create policy "documents_admin_select"
on storage.objects for select
to authenticated
using (bucket_id = 'documents' and private.is_admin());

create policy "documents_client_select"
on storage.objects for select
to authenticated
using (
  bucket_id = 'documents'
  and private.current_user_role() = 'client'
  and (storage.foldername(name))[1] = private.current_user_company_id()::text
);

create policy "documents_recruiter_select"
on storage.objects for select
to authenticated
using (
  bucket_id = 'documents'
  and private.current_user_role() = 'recruiter'
  and exists (
    select 1 from public.projects p
    where p.assigned_recruiter_id = auth.uid()
      and p.company_id::text = (storage.foldername(name))[1]
  )
);

-- ---------- INSERT: somente admin (uploads via Server Action) ----------
create policy "documents_admin_insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'documents' and private.is_admin());

-- ---------- UPDATE / DELETE: somente admin ----------
create policy "documents_admin_update"
on storage.objects for update
to authenticated
using (bucket_id = 'documents' and private.is_admin())
with check (bucket_id = 'documents' and private.is_admin());

create policy "documents_admin_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'documents' and private.is_admin());
