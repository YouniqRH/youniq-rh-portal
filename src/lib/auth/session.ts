/**
 * Helpers de leitura de contexto da sessao no servidor.
 * Resolve profile + company + visible_modules em uma chamada.
 */
import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export type SessionContext = {
  profile: Profile;
  companyName: string | null;
  visibleModules: Set<string>;
};

export async function getSessionContext(): Promise<SessionContext | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) return null;

  let companyName: string | null = null;
  if (profile.company_id) {
    const { data: c } = await supabase.from("companies").select("nome").eq("id", profile.company_id).single();
    companyName = c?.nome ?? null;
  }

  const visibleModules = new Set<string>();
  if (profile.role === "admin" || profile.role === "recruiter") {
    // Admin/Recrutadora veem todos os modulos pertinentes (controle por roles ja existe na sidebar)
    for (const m of [
      "recrutamento","shortlist","candidatos","etapas",
      "admissao","folha_ponto","treinamentos","assessments","documentos","solicitacoes",
      "crm","empresas","contatos","interacoes","tarefas","calendario",
      "suporte","historico",
    ]) visibleModules.add(m);
  } else if (profile.company_id) {
    const { data: services } = await supabase
      .from("services_contracted")
      .select("visible_modules, active")
      .eq("company_id", profile.company_id)
      .eq("active", true);
    for (const s of services ?? []) for (const m of s.visible_modules ?? []) visibleModules.add(m);
  }

  return { profile: profile as Profile, companyName, visibleModules };
}
