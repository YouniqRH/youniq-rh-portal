/**
 * Cliente Supabase com service_role - SOMENTE em codigo server-only.
 * Bypassa RLS. NAO IMPORTAR em arquivos com "use client" e nunca em
 * componentes que possam ser renderizados no browser.
 *
 * Use apenas em Server Actions / Route Handlers que ja validaram
 * autorizacao via guards (requireRole/requireAdmin). Defesa em profundidade:
 * RLS protege em SQL, guards protegem em codigo.
 */
import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY ausente - configurar em .env.local / Vercel");
  }
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
