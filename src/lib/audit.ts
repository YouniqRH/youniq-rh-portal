/**
 * Logger de auditoria. Sempre chamado server-side, usa service_role
 * (so insert via service_role - usuarios autenticados sao bloqueados por RLS).
 */
import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type AuditAction =
  | "auth.login" | "auth.logout" | "auth.login_failed" | "auth.password_reset_request" | "auth.password_reset"
  | "user.create" | "user.update" | "user.deactivate" | "user.activate" | "user.delete"
  | "project.create" | "project.update" | "project.delete"
  | "job.create" | "job.update" | "job.delete" | "job.assign_recruiter"
  | "candidate.create" | "candidate.update" | "candidate.delete"
  | "service.create" | "service.update" | "service.delete"
  | "document.upload" | "document.download" | "document.delete";

export async function logAudit(opts: {
  user_id: string | null;
  action: AuditAction;
  entity_type: string;
  entity_id?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    const admin = createAdminClient();
    await admin.from("audit_logs").insert({
      user_id: opts.user_id,
      action: opts.action,
      entity_type: opts.entity_type,
      entity_id: opts.entity_id ?? null,
      metadata: opts.metadata ?? {},
    });
  } catch (e) {
    // Auditoria nunca pode quebrar a operacao principal. Loga so no servidor.
    console.error("[audit] falhou:", e);
  }
}
