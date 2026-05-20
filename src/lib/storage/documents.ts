/**
 * Helpers de Storage para o bucket 'documents'.
 *
 * IMPORTANTE: o bucket e privado. Nunca exponha caminhos publicos.
 * O frontend sempre solicita uma signed URL ao servidor.
 */
import "server-only";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/guards";

const BUCKET = process.env.NEXT_PUBLIC_DOCS_BUCKET || "documents";
const URL_TTL_SECONDS = 60 * 10; // 10 minutos

/** Gera signed URL valida para download. RLS do bucket faz o filtro final. */
export async function getSignedDocumentUrl(path: string) {
  await requireAuth(); // garante sessao
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, URL_TTL_SECONDS);
  if (error) throw error;
  return data.signedUrl;
}

/** Lista arquivos de uma empresa (RLS limita o prefix automaticamente). */
export async function listCompanyDocuments(companyId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from(BUCKET).list(companyId, {
    limit: 100,
    sortBy: { column: "name", order: "asc" },
  });
  if (error) throw error;
  return data;
}
