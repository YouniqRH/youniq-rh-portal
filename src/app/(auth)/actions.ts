"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

const LoginSchema = z.object({
  email: z.string().email("Email invalido"),
  senha: z.string().min(1, "Senha obrigatoria"),
  next:  z.string().optional(),
});

export type AuthState = { error?: string; info?: string };

export async function loginAction(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    senha: formData.get("senha"),
    next:  formData.get("next") ?? undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados invalidos" };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email.toLowerCase().trim(),
    password: parsed.data.senha,
  });

  if (error || !data.user) {
    await logAudit({
      user_id: null,
      action: "auth.login_failed",
      entity_type: "auth",
      metadata: { email: parsed.data.email, reason: error?.message ?? "unknown" },
    });
    return { error: "Email ou senha invalidos." };
  }

  // Resolve profile para decidir destino e checar 'active'
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, active")
    .eq("id", data.user.id)
    .single();

  if (!profile || !profile.active) {
    await supabase.auth.signOut();
    return { error: "Usuario inativo. Contate o administrador." };
  }

  await logAudit({
    user_id: data.user.id,
    action: "auth.login",
    entity_type: "auth",
    metadata: { role: profile.role },
  });

  const next = parsed.data.next && parsed.data.next.startsWith("/") ? parsed.data.next : null;
  const dest = next || (profile.role === "admin" ? "/admin" : "/dashboard");
  redirect(dest);
}

export async function logoutAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.auth.signOut();
  if (user) await logAudit({ user_id: user.id, action: "auth.logout", entity_type: "auth" });
  redirect("/login");
}

const ForgotSchema = z.object({ email: z.string().email() });

export async function forgotPasswordAction(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = ForgotSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: "Email invalido." };

  const supabase = await createClient();
  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password`;
  // Supabase sempre retorna sucesso para nao revelar existencia. Auditamos.
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, { redirectTo });
  await logAudit({
    user_id: null,
    action: "auth.password_reset_request",
    entity_type: "auth",
    metadata: { email: parsed.data.email, ok: !error },
  });

  return { info: "Se o email estiver cadastrado, voce recebera as instrucoes em instantes." };
}

const ResetSchema = z.object({
  senha: z.string().min(8, "Use ao menos 8 caracteres."),
  confirmacao: z.string(),
}).refine((d) => d.senha === d.confirmacao, { message: "As senhas nao conferem.", path: ["confirmacao"] });

export async function resetPasswordAction(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = ResetSchema.safeParse({
    senha: formData.get("senha"),
    confirmacao: formData.get("confirmacao"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados invalidos" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sessao expirada. Solicite um novo link." };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.senha });
  if (error) return { error: "Nao foi possivel atualizar a senha." };

  await logAudit({ user_id: user.id, action: "auth.password_reset", entity_type: "auth" });
  redirect("/login?reset=ok");
}
