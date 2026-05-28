"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit";

// Gera senha temporaria forte (12 chars, sem caracteres ambiguos como 0/O/1/l/I)
function generateTempPassword(length = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(length);
  let s = "";
  for (let i = 0; i < length; i++) s += chars[bytes[i] % chars.length];
  return s;
}

// =================== USERS ===================

const UserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8).optional().or(z.literal("").transform(() => undefined)),
  role: z.enum(["admin", "recruiter", "client"]),
  company_id: z.string().uuid().nullable().optional(),
  active: z.boolean().optional(),
});

export async function createUser(formData: FormData) {
  const me = await requireAdmin();
  const parsed = UserSchema.parse({
    email: formData.get("email"),
    name: formData.get("name"),
    password: (formData.get("password") as string) || "youniq" + Math.random().toString(36).slice(2, 10),
    role: formData.get("role"),
    company_id: (formData.get("company_id") as string) || null,
  });

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: parsed.email.toLowerCase(),
    password: parsed.password!,
    email_confirm: true,
    user_metadata: { name: parsed.name, role: parsed.role, company_id: parsed.company_id },
  });
  if (error) throw new Error(error.message);

  // upsert profile (trigger handle_new_user ja criou - aqui sincroniza)
  await admin.from("profiles").upsert({
    id: data.user!.id,
    name: parsed.name,
    email: parsed.email.toLowerCase(),
    role: parsed.role,
    company_id: parsed.company_id ?? null,
    active: true,
  });

  await logAudit({
    user_id: me.id, action: "user.create", entity_type: "profile", entity_id: data.user!.id,
    metadata: { email: parsed.email, role: parsed.role },
  });
  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios");
}

export async function updateUser(id: string, formData: FormData) {
  const me = await requireAdmin();
  const parsed = UserSchema.parse({
    email: formData.get("email"),
    name: formData.get("name"),
    password: (formData.get("password") as string) || undefined,
    role: formData.get("role"),
    company_id: (formData.get("company_id") as string) || null,
  });

  const admin = createAdminClient();
  if (parsed.password) {
    await admin.auth.admin.updateUserById(id, { password: parsed.password });
  }
  await admin.from("profiles").update({
    name: parsed.name,
    email: parsed.email.toLowerCase(),
    role: parsed.role,
    company_id: parsed.company_id ?? null,
  }).eq("id", id);

  await logAudit({
    user_id: me.id, action: "user.update", entity_type: "profile", entity_id: id,
    metadata: { changes: { ...parsed, password: parsed.password ? "***" : undefined } },
  });
  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios");
}

export async function toggleUserActive(id: string, active: boolean) {
  const me = await requireAdmin();
  const admin = createAdminClient();
  await admin.from("profiles").update({ active }).eq("id", id);
  await logAudit({
    user_id: me.id, action: active ? "user.activate" : "user.deactivate",
    entity_type: "profile", entity_id: id,
  });
  revalidatePath("/admin/usuarios");
}

export async function deleteUser(id: string) {
  const me = await requireAdmin();
  if (id === me.id) throw new Error("Voce nao pode excluir sua propria conta.");
  const admin = createAdminClient();
  await admin.auth.admin.deleteUser(id);
  await logAudit({ user_id: me.id, action: "user.delete", entity_type: "profile", entity_id: id });
  revalidatePath("/admin/usuarios");
}

/**
 * Gera uma senha temporaria forte e a aplica imediatamente ao usuario.
 * Retorna a senha em texto puro para o admin entregar via canal seguro
 * (Whatsapp, presencialmente). Admin deve orientar o usuario a trocar
 * a senha no proximo login.
 */
export async function resetUserPassword(id: string): Promise<{ tempPassword: string; userEmail: string }> {
  const me = await requireAdmin();
  if (id === me.id) {
    throw new Error("Para sua propria senha, use 'Esqueci minha senha' na tela de login.");
  }
  const admin = createAdminClient();
  const { data: target, error: fetchErr } = await admin.from("profiles").select("email").eq("id", id).single();
  if (fetchErr || !target) throw new Error("Usuario nao encontrado.");

  const tempPassword = generateTempPassword(12);
  const { error } = await admin.auth.admin.updateUserById(id, { password: tempPassword });
  if (error) throw new Error("Falha ao atualizar senha: " + error.message);

  await logAudit({
    user_id: me.id,
    action: "auth.password_reset",
    entity_type: "profile",
    entity_id: id,
    metadata: { reset_by_admin: true, target_email: target.email },
  });

  return { tempPassword, userEmail: target.email as string };
}

/**
 * Alternativa: dispara email de reset (Supabase resetPasswordForEmail).
 * Usuario recebe link e cria a propria senha. Requer SMTP configurado.
 */
export async function sendPasswordResetEmail(id: string): Promise<{ email: string }> {
  const me = await requireAdmin();
  const admin = createAdminClient();
  const { data: target } = await admin.from("profiles").select("email").eq("id", id).single();
  if (!target) throw new Error("Usuario nao encontrado.");

  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password`;
  const { error } = await admin.auth.resetPasswordForEmail(target.email as string, { redirectTo });
  if (error) throw new Error("Falha ao enviar email: " + error.message);

  await logAudit({
    user_id: me.id,
    action: "auth.password_reset_request",
    entity_type: "profile",
    entity_id: id,
    metadata: { requested_by_admin: true, target_email: target.email },
  });

  return { email: target.email as string };
}

// =================== PROJECTS ===================

const ProjectSchema = z.object({
  company_id: z.string().uuid(),
  nome: z.string().min(2),
  tipo_servico: z.string().min(2),
  status: z.enum(["planejado", "em_andamento", "atrasado", "pausado", "concluido", "cancelado"]),
  progresso: z.coerce.number().int().min(0).max(100),
  prazo_data: z.string().optional().transform((v) => (v ? v : null)),
  visible_to_client: z.coerce.boolean(),
  tem_recrutamento: z.coerce.boolean(),
  descricao: z.string().optional().default(""),
});

export async function upsertProject(id: string | null, formData: FormData) {
  const me = await requireAdmin();
  const parsed = ProjectSchema.parse({
    company_id: formData.get("company_id"),
    nome: formData.get("nome"),
    tipo_servico: formData.get("tipo_servico"),
    status: formData.get("status"),
    progresso: formData.get("progresso"),
    prazo_data: formData.get("prazo_data") || undefined,
    visible_to_client: formData.get("visible_to_client") === "on",
    tem_recrutamento: formData.get("tem_recrutamento") === "on",
    descricao: (formData.get("descricao") as string) ?? "",
  });
  const admin = createAdminClient();
  if (id) {
    await admin.from("projects").update(parsed).eq("id", id);
    await logAudit({ user_id: me.id, action: "project.update", entity_type: "project", entity_id: id, metadata: { changes: parsed } });
  } else {
    const { data } = await admin.from("projects").insert(parsed).select("id").single();
    await logAudit({ user_id: me.id, action: "project.create", entity_type: "project", entity_id: data?.id ?? null, metadata: parsed });
  }
  revalidatePath("/admin/projetos");
  redirect("/admin/projetos");
}

export async function deleteProject(id: string) {
  const me = await requireAdmin();
  const admin = createAdminClient();
  await admin.from("projects").delete().eq("id", id);
  await logAudit({ user_id: me.id, action: "project.delete", entity_type: "project", entity_id: id });
  revalidatePath("/admin/projetos");
}

// =================== JOBS (atribuir recrutadora) ===================

export async function assignRecruiter(jobId: string, recruiterId: string | null) {
  const me = await requireAdmin();
  const admin = createAdminClient();
  await admin.from("jobs").update({ recruiter_id: recruiterId || null }).eq("id", jobId);
  await logAudit({
    user_id: me.id, action: "job.assign_recruiter", entity_type: "job", entity_id: jobId,
    metadata: { recruiter_id: recruiterId },
  });
  revalidatePath("/admin/jobs");
}

export async function updateJobVisibility(jobId: string, visible: boolean) {
  const me = await requireAdmin();
  const admin = createAdminClient();
  await admin.from("jobs").update({ visible_to_client: visible }).eq("id", jobId);
  await logAudit({
    user_id: me.id, action: "job.update", entity_type: "job", entity_id: jobId,
    metadata: { visible_to_client: visible },
  });
  revalidatePath("/admin/jobs");
}

// =================== COMPANIES ===================

const onlyDigits = (s: string) => s.replace(/\D/g, "");
const optionalText = z.string().trim().min(1).nullable().optional().or(z.literal("").transform(() => null));

const CompanySchema = z.object({
  nome:                 z.string().trim().min(2, "Razao social muito curta"),
  nome_fantasia:        optionalText,
  cnpj:                 optionalText.transform((v) => (v ? onlyDigits(v) : v)),
  inscricao_estadual:   optionalText,
  inscricao_municipal:  optionalText,
  email:                z.union([z.string().trim().email("Email invalido"), z.literal("").transform(() => null)]).nullable().optional(),
  telefone:             optionalText,
  endereco_logradouro:  optionalText,
  endereco_numero:      optionalText,
  endereco_complemento: optionalText,
  endereco_bairro:      optionalText,
  endereco_cidade:      optionalText,
  endereco_uf:          z.union([z.string().trim().length(2, "UF tem 2 letras").toUpperCase(), z.literal("").transform(() => null)]).nullable().optional(),
  endereco_cep:         optionalText.transform((v) => (v ? onlyDigits(v) : v)),
  responsavel_nome:     optionalText,
  responsavel_cargo:    optionalText,
  observacoes:          optionalText,
  status:               z.enum(["active", "inactive"]).optional().default("active"),
});

function buildCompanyPayload(formData: FormData) {
  const raw: Record<string, unknown> = {};
  for (const [k, v] of formData.entries()) {
    if (typeof v === "string") raw[k] = v;
  }
  return CompanySchema.parse(raw);
}

export async function upsertCompany(id: string | null, formData: FormData) {
  const me = await requireAdmin();
  let parsed;
  try {
    parsed = buildCompanyPayload(formData);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Dados invalidos";
    throw new Error(msg);
  }

  const admin = createAdminClient();
  if (id) {
    const { error } = await admin.from("companies").update(parsed).eq("id", id);
    if (error) throw new Error(error.message);
    await logAudit({ user_id: me.id, action: "user.update", entity_type: "company", entity_id: id, metadata: parsed });
  } else {
    const { data, error } = await admin.from("companies").insert(parsed).select("id").single();
    if (error) {
      if (error.code === "23505") throw new Error("Ja existe uma empresa com este CNPJ.");
      throw new Error(error.message);
    }
    await logAudit({ user_id: me.id, action: "user.create", entity_type: "company", entity_id: data?.id ?? null, metadata: parsed });
  }
  revalidatePath("/admin/empresas");
  revalidatePath("/admin/usuarios/novo");
  revalidatePath("/admin/usuarios");
  redirect("/admin/empresas");
}

export async function deleteCompany(id: string) {
  const me = await requireAdmin();
  const admin = createAdminClient();
  // Verifica se ha usuarios ou projetos vinculados
  const { count: usersCount } = await admin.from("profiles").select("id", { count: "exact", head: true }).eq("company_id", id);
  const { count: projectsCount } = await admin.from("projects").select("id", { count: "exact", head: true }).eq("company_id", id);
  if ((usersCount ?? 0) > 0 || (projectsCount ?? 0) > 0) {
    throw new Error("Nao e possivel excluir: ha usuarios ou projetos vinculados a esta empresa. Remova-os primeiro.");
  }
  await admin.from("companies").delete().eq("id", id);
  await logAudit({ user_id: me.id, action: "user.delete", entity_type: "company", entity_id: id });
  revalidatePath("/admin/empresas");
}
