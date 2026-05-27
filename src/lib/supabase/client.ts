/**
 * Cliente Supabase para uso em Client Components (browser).
 * Usa ANON key - todas as queries passam por RLS.
 * Intencionalmente UNTYPED - veja nota em ./server.ts.
 */
"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
