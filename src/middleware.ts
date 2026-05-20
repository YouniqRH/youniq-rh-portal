/**
 * Middleware global do Next.
 * - Refresca sessao Supabase em todo request (necessario para SSR).
 * - Bloqueia rotas autenticadas se nao houver sessao -> /login.
 * - Bloqueia /admin para nao-admin -> /dashboard (com flash de erro via querystring).
 * Defesa em profundidade: tambem ha guards nas pages e RLS no DB.
 */
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = ["/login", "/forgot-password", "/reset-password", "/api/health"];

function isPublic(pathname: string) {
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) return true;
  if (pathname.startsWith("/api/auth/callback")) return true;
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function middleware(request: NextRequest) {
  const { response, supabase, user } = await updateSession(request);
  const { pathname, search } = request.nextUrl;

  if (isPublic(pathname)) {
    // Se ja logado e tentando ir para /login, manda pra app.
    if (user && (pathname === "/login")) {
      const to = request.nextUrl.clone();
      to.pathname = "/dashboard";
      to.search = "";
      return NextResponse.redirect(to);
    }
    return response;
  }

  if (!user) {
    const to = request.nextUrl.clone();
    to.pathname = "/login";
    to.searchParams.set("next", pathname + search);
    return NextResponse.redirect(to);
  }

  // Hardening para /admin: cheque rapido de role direto via RLS.
  if (pathname.startsWith("/admin")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, active")
      .eq("id", user.id)
      .single();
    if (!profile || !profile.active || profile.role !== "admin") {
      const to = request.nextUrl.clone();
      to.pathname = "/dashboard";
      to.searchParams.set("error", "forbidden");
      return NextResponse.redirect(to);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Captura tudo exceto arquivos estaticos e imagens.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp)$).*)",
  ],
};
