/* eslint-disable no-console */
/**
 * Seed inicial de usuarios via Supabase Admin API.
 * Roda com: npm run seed:users
 *
 * Pre-requisito: voce ja rodou as migrations 0001..0005 e o seed.sql
 *                e as variaveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
 *                estao em .env.local
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!url || !serviceKey) {
  console.error("Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no .env.local");
  process.exit(1);
}
const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

const COMPANIES = {
  alpha: "11111111-1111-1111-1111-111111111111",
  beta:  "22222222-2222-2222-2222-222222222222",
  youniq:"33333333-3333-3333-3333-333333333333",
};

type SeedUser = {
  email: string;
  password: string;
  name: string;
  role: "admin" | "recruiter" | "client";
  company_id?: string;
  assigned_projects?: string[];
  assigned_jobs?: string[];
};

const USERS: SeedUser[] = [
  { email: "admin@youniq.com.br",        password: "admin",       name: "Admin Youniq",        role: "admin",     company_id: COMPANIES.youniq },
  { email: "recrutadora@youniq.com.br",  password: "recrutar123", name: "Ana Souza",           role: "recruiter", company_id: COMPANIES.youniq,
    assigned_projects: ["a0000001-0000-0000-0000-000000000001", "a0000001-0000-0000-0000-000000000004"],
    assigned_jobs:     ["b0000001-0000-0000-0000-000000000001", "b0000001-0000-0000-0000-000000000002"] },
  { email: "cliente1@youniq.com.br",     password: "123",         name: "Cliente Alpha",       role: "client",    company_id: COMPANIES.alpha },
  { email: "cliente2@empresa.com.br",    password: "abc",         name: "Cliente Beta",        role: "client",    company_id: COMPANIES.beta },
];

async function ensureUser(u: SeedUser) {
  const { data: existing } = await admin.auth.admin.listUsers();
  const found = existing.users.find((x) => x.email?.toLowerCase() === u.email.toLowerCase());

  let userId: string;
  if (found) {
    userId = found.id;
    console.log(`= ${u.email} (existente)`);
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { name: u.name, role: u.role, company_id: u.company_id ?? null },
    });
    if (error) throw error;
    userId = data.user!.id;
    console.log(`+ ${u.email} criado`);
  }

  // Garante profile sincronizado (em caso de seed em DB pre-existente)
  const { error: upErr } = await admin.from("profiles").upsert({
    id: userId,
    name: u.name,
    email: u.email,
    role: u.role,
    company_id: u.company_id ?? null,
    assigned_projects: u.assigned_projects ?? [],
    assigned_jobs: u.assigned_jobs ?? [],
    active: true,
  });
  if (upErr) throw upErr;

  // Se for recrutadora, vincula jobs (recruiter_id) e projetos (assigned_recruiter_id)
  if (u.role === "recruiter") {
    if (u.assigned_jobs?.length) {
      await admin.from("jobs").update({ recruiter_id: userId }).in("id", u.assigned_jobs);
    }
    if (u.assigned_projects?.length) {
      await admin.from("projects").update({ assigned_recruiter_id: userId }).in("id", u.assigned_projects);
    }
  }
}

async function main() {
  for (const u of USERS) {
    try { await ensureUser(u); }
    catch (e) { console.error("Falhou:", u.email, e); process.exitCode = 1; }
  }
  console.log("\nSeed de usuarios concluido.");
}
main();
