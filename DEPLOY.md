# Deploy passo-a-passo: GitHub -> Supabase -> Vercel

Este guia leva o portal do zero ate producao. Tempo estimado: **40 minutos**.

---

## Pre-requisitos

- Conta no [GitHub](https://github.com)
- Conta no [Supabase](https://supabase.com) (gratuita serve para comecar)
- Conta na [Vercel](https://vercel.com) (gratuita)
- Node.js 20+ e Git instalados localmente

> **Nao tem Node.js instalado?** Baixe a versao LTS em https://nodejs.org/pt-br/download
> e reinicie o terminal apos instalar. Valide com `node --version`.

---

## Etapa 1 - Subir o codigo no GitHub

```bash
cd C:\Users\karen\Documents\youniq-rh-nextjs

# Inicializa repo
git init
git add .
git commit -m "feat: portal Youniq RH com RBAC multi-tenant"

# Crie o repositorio no GitHub (sem README, sem .gitignore)
# https://github.com/new  -> nome: youniq-rh-portal

git branch -M main
git remote add origin https://github.com/SEU_USUARIO/youniq-rh-portal.git
git push -u origin main
```

---

## Etapa 2 - Criar o projeto no Supabase

1. Acesse https://supabase.com/dashboard e clique em **New project**.
2. Nome: `youniq-rh-portal`. Regiao: `South America (Sao Paulo)`. Senha do banco: anote em local seguro.
3. Aguarde ~2 minutos para provisionamento.
4. No projeto: **Settings -> API** -> anote:
   - `Project URL` (vai em `NEXT_PUBLIC_SUPABASE_URL`)
   - `anon` (vai em `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - `service_role` (vai em `SUPABASE_SERVICE_ROLE_KEY` - **SECRETO**)

---

## Etapa 3 - Rodar migrations + seed

No painel do Supabase: **SQL Editor -> New query**. Cole e rode na ordem:

1. `supabase/migrations/0001_schema.sql`
2. `supabase/migrations/0002_rls_helpers.sql`
3. `supabase/migrations/0003_rls_policies.sql`
4. `supabase/migrations/0004_storage.sql`
5. `supabase/migrations/0005_user_provisioning.sql`
6. `supabase/seed.sql` (dados de demonstracao)

Validacao rapida no proprio SQL Editor:
```sql
select role, count(*) from public.profiles group by role;
-- esperado: vazio ainda (so depois do seed-users)
select count(*) from public.projects; -- esperado: 10
select count(*) from public.candidates; -- esperado: 11
```

---

## Etapa 4 - Configurar autenticacao no Supabase

1. **Authentication -> Providers -> Email**:
   - "Enable Email provider": **on**
   - "Confirm email": **off** durante desenvolvimento; em producao recomendo **on** + SMTP customizado.
2. **Authentication -> URL Configuration**:
   - Site URL: `https://SEU_DOMINIO_VERCEL.vercel.app` (preencha apos etapa 6; pode deixar `http://localhost:3000` por agora)
   - Redirect URLs adicionais: adicione `http://localhost:3000/**` e o dominio Vercel + `/**`
3. **Authentication -> Email Templates** (opcional): personalize o email de reset traduzindo para portugues.

---

## Etapa 5 - Configurar .env.local e seed de usuarios

```bash
cp .env.example .env.local
```

Edite `.env.local` com os valores anotados na Etapa 2.

```bash
npm install
npm run seed:users
```

Saida esperada:
```
+ admin@youniq.com.br criado
+ recrutadora@youniq.com.br criado
+ cliente1@youniq.com.br criado
+ cliente2@empresa.com.br criado
Seed de usuarios concluido.
```

Teste local:
```bash
npm run dev
# abra http://localhost:3000
# login: admin@youniq.com.br / admin
```

---

## Etapa 6 - Deploy na Vercel

1. https://vercel.com/new -> **Import Git Repository** -> selecione `youniq-rh-portal`.
2. Framework: **Next.js** (auto-detectado).
3. **Environment Variables** (adicione todas):

   | Nome | Valor | Sensitive? |
   |------|-------|------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | https://xxx.supabase.co | nao |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | eyJ... | nao |
   | `SUPABASE_SERVICE_ROLE_KEY` | eyJ... | **SIM (marque)** |
   | `NEXT_PUBLIC_APP_URL` | https://seu-dominio.vercel.app | nao |
   | `NEXT_PUBLIC_DOCS_BUCKET` | documents | nao |

4. Clique **Deploy**. ~3-5 minutos para o primeiro build.

Quando o deploy concluir, copie a URL `https://xxxx.vercel.app` e:
- Volte ao Supabase **Authentication -> URL Configuration** e atualize **Site URL** + Redirect URLs.
- Atualize `NEXT_PUBLIC_APP_URL` na Vercel para o dominio real (e disparo novo deploy).

---

## Etapa 7 - Validacao em producao

### 7.1 Login dos perfis demo
- `admin@youniq.com.br` / `admin` -> deve cair em `/admin`
- `recrutadora@youniq.com.br` / `recrutar123` -> `/dashboard` (so vagas dela)
- `cliente1@youniq.com.br` / `123` -> `/dashboard` (Alpha)
- `cliente2@empresa.com.br` / `abc` -> `/dashboard` (Beta - SEM modulos de recrutamento)

### 7.2 Isolamento de dados (CRITICO)
Logue como `cliente1` e tente forcar a URL `/projetos/p0000002-0000-0000-0000-000000000001`
(projeto da Beta). Deve dar **403/404**.

Logue como `recrutadora` e abra `/shortlist`. Deve ver apenas a vaga atribuida a ela
(`j0000001-0000-0000-0000-000000000001`). Nao deve ver candidatos de outras vagas.

### 7.3 RLS no Supabase Studio
No painel **Authentication -> Users**: clique em qualquer usuario nao-admin e use
"Impersonate user" no SQL Editor:

```sql
-- ative o jwt do usuario
set local role authenticated;
set local "request.jwt.claims" to '{"sub":"<UUID_DO_USER>","role":"authenticated"}';

-- como cliente1 deve ver SO projetos da Alpha visiveis:
select count(*) from public.projects;
-- esperado: <= 5
```

### 7.4 Storage
Faca upload manual de um arquivo no bucket `documents` no caminho
`11111111-1111-1111-1111-111111111111/teste.pdf` via Studio.

Logue como `cliente1` e abra `/api/storage/download?path=11111111-1111-1111-1111-111111111111/teste.pdf`
-> deve redirecionar para a signed URL. Faca o mesmo logado como `cliente2` -> deve dar **403**.

### 7.5 Audit logs
Logue como admin e visite `/admin/audit-logs`. Verifique que os logins recentes,
criacao de usuarios e qualquer mutacao aparecem.

---

## Etapa 8 - Promover ou criar o admin de producao

O usuario de demo `admin@youniq.com.br` deve ser **DESATIVADO** ou **TROCADO**
antes de virar real. Como admin:

1. `/admin/usuarios` -> **Novo usuario** -> crie seu admin real com email corporativo.
2. Logue no novo admin para confirmar que funciona.
3. Volte como o novo admin e desative o demo (ou exclua) em `/admin/usuarios`.

---

## Pos-deploy: troubleshooting

| Sintoma | Causa provavel | Como resolver |
|---------|---------------|---------------|
| Login retorna "Email ou senha invalidos" mesmo com senha certa | Email nao confirmado | No Studio: **Authentication -> Users** -> abrir usuario -> "Confirm user" |
| Cliente nao ve nenhum projeto | `services_contracted` vazio para a empresa OU `visible_to_client = false` | Como admin, crie linhas em `services_contracted` no SQL Editor ou via /admin |
| Recrutadora nao ve vagas | Vaga sem `recruiter_id` atribuido | Como admin, /admin/jobs -> atribuir |
| 403 em /admin para admin | Profile.active = false ou role != admin | Studio: UPDATE profiles SET active=true, role='admin' WHERE email='...'; |
| "SUPABASE_SERVICE_ROLE_KEY ausente" no log | Variavel nao configurada na Vercel | Settings -> Environment Variables, redeploy |

---

## Checklist final de producao

- [ ] Site URL e Redirect URLs do Supabase apontam para o dominio Vercel
- [ ] `SUPABASE_SERVICE_ROLE_KEY` marcado como **Sensitive** na Vercel
- [ ] Email provider configurado com SMTP customizado (Gmail, SendGrid, etc.)
- [ ] Bucket `documents` privado (public = false) - validado em **Storage**
- [ ] Audit logs sendo gerados (vide /admin/audit-logs apos algumas acoes)
- [ ] Admin demo desativado / substituido por admin real corporativo
- [ ] Confirmar email habilitado em producao
- [ ] Backup automatico do Postgres habilitado (Settings -> Database -> Backups)
- [ ] Rate limit de auth configurado se o portal for publico (Settings -> Auth -> Rate limits)
