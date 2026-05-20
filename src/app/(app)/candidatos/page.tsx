import { requireAuth } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { Tag } from "@/components/ui/badge";
import { formatDateTime, labelStage } from "@/lib/utils";

export default async function CandidatosPage() {
  await requireAuth();
  const supabase = await createClient();
  const { data: candidates } = await supabase
    .from("candidates")
    .select("*, jobs(title, project_id, projects(nome, companies(nome)))")
    .order("updated_at", { ascending: false });

  const list = candidates ?? [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Candidatos</h1>
        <p className="text-ink-muted">Banco de candidatos das vagas ativas.</p>
      </header>
      <section className="panel">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-ink-muted bg-surface-2">
                <th className="p-3">Candidato</th><th className="p-3">Vaga</th><th className="p-3">Projeto</th>
                <th className="p-3">Etapa</th><th className="p-3">Status</th><th className="p-3">Score</th><th className="p-3">Atualizado</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => {
                const job = c.jobs as { title: string; projects: { nome: string; companies: { nome: string } } } | null;
                return (
                  <tr key={c.id} className="border-b border-[#ece5d4]">
                    <td className="p-3 font-semibold">{c.name}</td>
                    <td className="p-3">{job?.title}</td>
                    <td className="p-3 text-ink-muted">{job?.projects?.nome}</td>
                    <td className="p-3"><Tag variant="purple">{labelStage(c.stage)}</Tag></td>
                    <td className="p-3">{c.status}</td>
                    <td className="p-3"><strong>{c.score}</strong></td>
                    <td className="p-3">{formatDateTime(c.updated_at)}</td>
                  </tr>
                );
              })}
              {list.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-ink-muted italic">Nenhum candidato visivel para o seu perfil.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
