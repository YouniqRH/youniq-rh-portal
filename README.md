# Youniq RH - Portal do Cliente (Next.js + Supabase)

Portal multi-tenant da Youniq RH com RBAC completo:

- **Admin**: ve e gerencia tudo (usuarios, projetos, vagas, audit logs).
- **Recrutadora**: ve apenas projetos/vagas/candidatos atribuidos.
- **Cliente**: ve apenas dados da propria empresa + modulos contratados.

## Stack

- Next.js 15 (App Router) + TypeScript + React 19
- Tailwind CSS + componentes shadcn-style inline
- Supabase Auth, Postgres, RLS, Storage privado
- Zod para validacao server-side
- Deploy: Vercel

## Estrutura

```
src/
  app/
    (auth)/                 # login, forgot, reset (+ server actions)
    (app)/                  # area autenticada
      dashboard/, projetos/, shortlist/, candidatos/, crm/, modulo/[key]/
      admin/                # painel admin (CRUD)
    api/
      storage/download/     # signed URL on-demand
  components/ui/            # button, input, card, badge, progress
  components/app/           # sidebar, topbar, confirm-form, session
  lib/
    supabase/{client,server,admin,middleware}.ts
    auth/{guards,session}.ts
    audit.ts
    storage/documents.ts
    utils.ts
  middleware.ts             # auth + RBAC no edge
  types/database.ts
supabase/
  migrations/
    0001_schema.sql         # tables + indices + triggers
    0002_rls_helpers.sql    # private.current_user_role/company_id/is_admin
    0003_rls_policies.sql   # RLS policies por role
    0004_storage.sql        # bucket privado + storage policies
    0005_user_provisioning.sql  # handle_new_user trigger
  seed.sql                  # companies, projects, jobs, candidates
scripts/seed-users.ts       # cria usuarios admin/recrutadora/cliente via Admin API
```

## Modelo de seguranca

1. **RLS no banco** — fonte de verdade. Toda tabela tem `enable row level security` e policies que filtram por `auth.uid()`, `company_id` e atribuicoes.
2. **Guards no codigo** — defesa em profundidade. `requireAuth/Role/CompanyAccess/ProjectAccess/JobAccess` em `lib/auth/guards.ts`.
3. **Middleware** — bloqueia rotas autenticadas e `/admin` para nao-admin antes da pagina renderizar.
4. **service_role** — apenas em modulos com `import "server-only"`. Frontend so usa `anon_key`.
5. **Audit logs** — Server Actions chamam `logAudit()` em cada mutacao. Insert so via `service_role` (RLS bloqueia outras origens).

## Como rodar local

```bash
# 1. Instale dependencias (Node 20+)
npm install

# 2. Crie projeto em supabase.com
#    SQL Editor -> rode em ordem:
#      supabase/migrations/0001_schema.sql
#      supabase/migrations/0002_rls_helpers.sql
#      supabase/migrations/0003_rls_policies.sql
#      supabase/migrations/0004_storage.sql
#      supabase/migrations/0005_user_provisioning.sql
#      supabase/seed.sql

# 3. Copie .env.example -> .env.local e preencha (URL, anon, service_role)

# 4. Crie usuarios demo
npm run seed:users

# 5. Suba o servidor
npm run dev
# http://localhost:3000
```

## Usuarios demo (apos seed:users)

| Email                      | Senha       | Role        |
|----------------------------|-------------|-------------|
| admin@youniq.com.br        | admin       | admin       |
| recrutadora@youniq.com.br  | recrutar123 | recruiter   |
| cliente1@youniq.com.br     | 123         | client (Alpha) |
| cliente2@empresa.com.br    | abc         | client (Beta - so administrativo) |

## Deploy

Veja `DEPLOY.md` para o passo-a-passo completo (GitHub -> Supabase -> Vercel).
