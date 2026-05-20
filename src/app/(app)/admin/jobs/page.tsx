import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { assignRecruiter, updateJobVisibility } from "../actions";

export default async function AdminJobsPage() {
  await requireAdmin();
  const admin = createAdminClient();
  const [{ data: jobs }, { data: recruiters }] = await Promise.all([
    admin.from("jobs").select("*, projects(nome, companies(nome)), profiles:recruiter_id(name, email)").order("created_at", { ascending: false }),
    admin.from("profiles").select("id, name, email").eq("role", "recruiter").eq("active", true).order("name"),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin" className="link-purple text-xs">&larr; Painel admin</Link>
        <h1 className="text-2xl font-bold mt-1">Atribuicao de Vagas</h1>
        <p className="text-ink-muted">Atribua recrutadoras as vagas. So a recrutadora atribuida vera a vaga e os candidatos.</p>
      </header>

      <section className="panel">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-ink-muted bg-surface-2">
                <th className="p-3">Vaga</th><th className="p-3">Cliente</th><th className="p-3">Projeto</th>
                <th className="p-3">Status</th><th className="p-3">Recrutadora atribuida</th>
                <th className="p-3">Visivel para cliente</th>
              </tr>
            </thead>
            <tbody>
              {(jobs ?? []).map((j) => {
                const project = j.projects as { nome: string; companies: { nome: string } } | null;
                const currentRecruiter = j.profiles as { name: string; email: string } | null;
                return (
                  <tr key={j.id} className="border-b border-[#ece5d4]">
                    <td className="p-3 font-semibold">{j.title}</td>
                    <td className="p-3 text-ink-muted">{project?.companies?.nome}</td>
                    <td className="p-3">{project?.nome}</td>
                    <td className="p-3"><Badge>{j.status}</Badge></td>
                    <td className="p-3">
                      <form action={async (fd) => { "use server"; await assignRecruiter(j.id, (fd.get("rid") as string) || null); }} className="flex items-center gap-2">
                        <select name="rid" className="input min-w-[200px]" defaultValue={j.recruiter_id ?? ""}>
                          <option value="">— sem recrutadora —</option>
                          {(recruiters ?? []).map((r) => (
                            <option key={r.id} value={r.id}>{r.name} ({r.email})</option>
                          ))}
                        </select>
                        <Button type="submit" size="sm">Atribuir</Button>
                      </form>
                      {currentRecruiter && <div className="text-xs text-ink-muted mt-1">Atual: {currentRecruiter.name}</div>}
                    </td>
                    <td className="p-3">
                      <form action={async () => { "use server"; await updateJobVisibility(j.id, !j.visible_to_client); }}>
                        <Button type="submit" variant="ghost" size="sm">{j.visible_to_client ? "Visivel" : "Oculto"}</Button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
