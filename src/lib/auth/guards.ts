/**
 * Guards de autorizacao para uso em Server Components, Server Actions e
 * Route Handlers. Os guards complementam a RLS no banco - defesa em
 * profundidade. Lancam Error que e capturado por `notFound()` / `forbidden`
 * helper no app shell.
 */
import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types/database";

export class ForbiddenError extends Error {
  status = 403;
  constructor(msg = "Acesso negado") { super(msg); this.name = "ForbiddenError"; }
}

/** Garante que ha sessao. Devolve o profile completo do usuario. */
export async function requireAuth(): Promise<Profile> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    // Sessao valida mas sem profile = situacao inconsistente
    await supabase.auth.signOut();
    redirect("/login?error=no-profile");
  }
  if (!profile.active) {
    await supabase.auth.signOut();
    redirect("/login?error=inactive");
  }
  return profile as Profile;
}

/** Garante que o usuario tem uma das roles informadas. */
export async function requireRole(...roles: UserRole[]): Promise<Profile> {
  const p = await requireAuth();
  if (!roles.includes(p.role)) throw new ForbiddenError(`Esta area requer perfil: ${roles.join(", ")}`);
  return p;
}

export async function requireAdmin(): Promise<Profile> {
  return requireRole("admin");
}

/** Garante que o usuario pode acessar dados da empresa informada. */
export async function requireCompanyAccess(companyId: string): Promise<Profile> {
  const p = await requireAuth();
  if (p.role === "admin") return p;
  if (p.role === "client" && p.company_id === companyId) return p;
  // Recrutadora: precisa ter projeto vinculado a esta empresa.
  if (p.role === "recruiter") {
    const supabase = await createClient();
    const { count } = await supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId)
      .eq("assigned_recruiter_id", p.id);
    if ((count ?? 0) > 0) return p;
  }
  throw new ForbiddenError("Voce nao tem acesso a esta empresa.");
}

/** Garante que o usuario pode acessar o projeto. */
export async function requireProjectAccess(projectId: string): Promise<Profile> {
  const p = await requireAuth();
  if (p.role === "admin") return p;
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("id, company_id, assigned_recruiter_id, visible_to_client")
    .eq("id", projectId)
    .single();
  if (!project) throw new ForbiddenError("Projeto nao encontrado ou sem acesso.");
  if (p.role === "recruiter" && project.assigned_recruiter_id === p.id) return p;
  if (p.role === "client" && project.company_id === p.company_id && project.visible_to_client) return p;
  throw new ForbiddenError("Voce nao tem acesso a este projeto.");
}

/** Garante que o usuario pode acessar a vaga. */
export async function requireJobAccess(jobId: string): Promise<Profile> {
  const p = await requireAuth();
  if (p.role === "admin") return p;
  const supabase = await createClient();
  const { data: job } = await supabase
    .from("jobs")
    .select("id, recruiter_id, visible_to_client, project_id, projects(company_id, visible_to_client)")
    .eq("id", jobId)
    .single();
  if (!job) throw new ForbiddenError("Vaga nao encontrada ou sem acesso.");
  if (p.role === "recruiter" && job.recruiter_id === p.id) return p;
  if (p.role === "client") {
    // job.projects vem como objeto (single) na tipagem default do supabase-js
    const project = Array.isArray(job.projects) ? job.projects[0] : (job.projects as { company_id: string; visible_to_client: boolean } | null);
    if (
      job.visible_to_client &&
      project &&
      project.visible_to_client &&
      project.company_id === p.company_id
    ) return p;
  }
  throw new ForbiddenError("Voce nao tem acesso a esta vaga.");
}

/** Helper para Server Actions: garante role e retorna profile. */
export async function actionRequireRole(...roles: UserRole[]) {
  return requireRole(...roles);
}
