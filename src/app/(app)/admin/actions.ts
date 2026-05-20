"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit";

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
