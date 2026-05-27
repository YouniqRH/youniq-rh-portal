/**
 * Cliente Supabase para Server Components, Route Handlers e Server Actions.
 * Usa ANON key - RLS continua valendo. A sessao vem dos cookies.
 *
 * NUNCA misture este client com service_role: para acoes administrativas
 * que precisam bypassar RLS use `createAdminClient()` em './admin.ts'.
 *
 * Nota: intencionalmente UNTYPED (sem generic Database). Joins do Supabase
 * 2.50+ retornam 'never' quando Relationships nao esta exaustivamente
 * declarado, e mantemos casts explicitos nos sites de uso.
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
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
