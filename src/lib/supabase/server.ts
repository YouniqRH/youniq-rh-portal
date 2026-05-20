/**
 * Cliente Supabase para Server Components, Route Handlers e Server Actions.
 * Usa ANON key - RLS continua valendo. A sessao vem dos cookies.
 *
 * NUNCA misture este client com service_role: para acoes administrativas
 * que precisam bypassar RLS use `createAdminClient()` em './admin.ts'.
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(toSet) {
          try {
            for (const { name, value, options } of toSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Em Server Components o set lanca: ok ignorar pois middleware
            // tambem atualiza cookies a cada request.
          }
        },
      },
    },
  );
}
