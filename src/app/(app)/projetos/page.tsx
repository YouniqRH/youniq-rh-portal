import Link from "next/link";
import { requireAuth } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDate, labelStatus } from "@/lib/utils";

export default async function ProjetosPage() {
  const profile = await requireAuth();
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("*, companies(nome), jobs(count)")
    .eq("tem_recrutamento", true)
    .order("prazo_data", { ascending: true, nullsFirst: false });

  const list = projects ?? [];
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Projetos de Recrutamento</h1>
        <p className="text-ink-muted">Vagas com shortlist vivo e prazos.</p>
      </header>

      <section className="panel">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-ink-muted bg-surface-2">
                <th className="p-3">Projeto</th>
                {profile.role !== "client" && <th className="p-3">Cliente</th>}
                <th className="p-3">Status</th>
                <th className="p-3">Progresso</th>
                <th className="p-3">Prazo</th>
                <th className="p-3 text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} className="border-b border-[#ece5d4] hover:bg-[#fbf7ec]">
                  <td className="p-3">
                    <div className="font-semibold">{p.nome}</div>
                    <div className="text-xs text-ink-muted">{p.tipo_servico}</div>
                  </td>
                  {profile.role !== "client" && (
                    <td className="p-3 text-ink-muted">{(p.companies as { nome: string } | null)?.nome}</td>
                  )}
                  <td className="p-3"><Badge status={p.status}>{labelStatus(p.status)}</Badge></td>
                  <td className="p-3 min-w-[160px]">
                    <Progress value={p.progresso ?? 0} />
                    <div className="text-xs text-ink-muted mt-1">{p.progresso ?? 0}%</div>
                  </td>
                  <td className="p-3">{formatDate(p.prazo_data)}</td>
                  <td className="p-3 text-right space-x-2">
                    <Link href={`/projetos/${p.id}`} className="btn-ghost btn-sm">Ver</Link>
                    <Link href={`/shortlist?projeto=${p.id}`} className="btn-primary btn-sm">Shortlist</Link>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-ink-muted italic">Nenhum projeto de recrutamento ativo.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
