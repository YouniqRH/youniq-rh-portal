/**
 * Gera signed URL e redireciona. RLS do bucket faz a checagem final.
 * Tambem grava audit_log com user_id + path.
 */
import { NextResponse, type NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { getSignedDocumentUrl } from "@/lib/storage/documents";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get("path");
  if (!path) return new NextResponse("path obrigatorio", { status: 400 });

  const profile = await requireAuth();

  try {
    const url = await getSignedDocumentUrl(path);
    await logAudit({
      user_id: profile.id,
      action: "document.download",
      entity_type: "storage_object",
      entity_id: path,
    });
    return NextResponse.redirect(url);
  } catch (e) {
    return new NextResponse(`Acesso negado ou arquivo nao encontrado: ${(e as Error).message}`, { status: 403 });
  }
}
