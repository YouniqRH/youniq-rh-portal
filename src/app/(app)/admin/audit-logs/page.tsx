import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDateTime } from "@/lib/utils";

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const pageSize = 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const admin = createAdminClient();
  const { data: logs, count } = await admin
    .from("audit_logs")
    .select("*, profiles:user_id(name, email, role)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / pageSize));

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin" className="link-purple text-xs">&larr; Painel admin</Link>
        <h1 className="text-2xl font-bold mt-1">Audit logs</h1>
        <p className="text-ink-muted">Registro de todas as acoes sensiveis no portal.</p>
      </header>

      <section className="panel">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-ink-muted bg-surface-2">
                <th className="p-3">Quando</th><th className="p-3">Usuario</th><th className="p-3">Acao</th>
                <th className="p-3">Entidade</th><th className="p-3">ID</th><th className="p-3">Metadata</th>
              </tr>
            </thead>
            <tbody>
              {(logs ?? []).map((l) => {
                const user = l.profiles as { name: string; email: string; role: string } | null;
                return (
                  <tr key={l.id} className="border-b border-[#ece5d4] align-top">
                    <td className="p-3 whitespace-nowrap">{formatDateTime(l.created_at)}</td>
                    <td className="p-3">
                      {user ? <><strong>{user.name}</strong><div className="text-xs text-ink-muted">{user.email}</div></> : <span className="text-ink-muted">(sistema)</span>}
                    </td>
                    <td className="p-3"><code className="text-xs bg-surface-2 px-1.5 py-0.5 rounded">{l.action}</code></td>
                    <td className="p-3">{l.entity_type}</td>
                    <td className="p-3 text-xs text-ink-muted">{l.entity_id ?? "—"}</td>
                    <td className="p-3 text-xs"><pre className="whitespace-pre-wrap bg-surface-2 p-2 rounded max-w-md">{JSON.stringify(l.metadata, null, 2)}</pre></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-3 text-sm">
          <div className="text-ink-muted">{count ?? 0} registros</div>
          <div className="space-x-2">
            {page > 1 && <Link href={`?page=${page - 1}`} className="btn-ghost btn-sm">&larr; Anterior</Link>}
            <span className="text-ink-muted">{page} / {totalPages}</span>
            {page < totalPages && <Link href={`?page=${page + 1}`} className="btn-ghost btn-sm">Proximo &rarr;</Link>}
          </div>
        </div>
      </section>
    </div>
  );
}
