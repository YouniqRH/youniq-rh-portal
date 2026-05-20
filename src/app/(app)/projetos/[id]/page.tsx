import Link from "next/link";
import { notFound } from "next/navigation";
import { requireProjectAccess } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDate, formatDateTime, labelStatus } from "@/lib/utils";

export default async function ProjetoDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireProjectAccess(id);
  const supabase = await createClient();
  const { data: p } = await supabase
    .from("projects")
    .select("*, companies(nome), jobs(*, candidates(*))")
    .eq("id", id)
    .single();
  if (!p) notFound();
  const company = p.companies as { nome: string } | null;
  const jobs = (p.jobs as Array<{ id: string; title: string; candidates: { id: string; name: string; score: number; stage: string; status: string }[] }>) ?? [];

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <Link href="/dashboard" className="link-purple text-xs">&larr; Voltar para o dashboard</Link>
          <h1 className="text-2xl font-bold mt-1">{p.nome}</h1>
          <p className="text-ink-muted">{p.tipo_servico} - {company?.nome}</p>
        </div>
        <Badge status={p.status} className="text-xs">{labelStatus(p.status)}</Badge>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="panel">
          <h2 className="text-base font-bold mb-3">Detalhes</h2>
          <dl className="grid grid-cols-[120px_1fr] gap-y-2 gap-x-3 text-sm">
            <dt className="text-xs uppercase tracking-wider text-ink-muted self-center">Progresso</dt>
            <dd><Progress value={p.progresso ?? 0} /><span className="text-xs text-ink-muted">{p.progresso ?? 0}%</span></dd>
            <dt className="text-xs uppercase tracking-wider text-ink-muted self-center">Prazo</dt>
            <dd>{formatDate(p.prazo_data)}</dd>
            <dt className="text-xs uppercase tracking-wider text-ink-muted self-center">Atualizado</dt>
            <dd>{formatDateTime(p.last_update)}</dd>
            <dt className="text-xs uppercase tracking-wider text-ink-muted self-center">Recrutamento</dt>
            <dd>{p.tem_recrutamento ? <span className="tag tag-purple">Ativo</span> : <span className="tag">Nao</span>}</dd>
          </dl>
          {p.descricao && <><h3 className="font-semibold mt-4">Descricao</h3><p className="text-sm">{p.descricao}</p></>}
        </div>

        <div className="panel">
          <h2 className="text-base font-bold mb-3">Anexos</h2>
          {(p.anexos as { name: string; path: string }[])?.length ? (
            <ul className="space-y-2">
              {(p.anexos as { name: string; path: string }[]).map((a) => (
                <li key={a.path} className="flex items-center gap-2 px-3 py-2 bg-surface-2 border border-[#ece5d4] rounded-lg text-sm">
                  <span className="flex-1">{a.name}</span>
                  <Link href={`/api/storage/download?path=${encodeURIComponent(a.path)}`} className="btn-ghost btn-sm">Baixar</Link>
                </li>
              ))}
            </ul>
          ) : <p className="text-ink-muted text-sm">Nenhum anexo disponivel.</p>}
        </div>
      </section>

      {p.tem_recrutamento && (
        <section className="panel">
          <h2 className="text-base font-bold mb-3">Vagas e candidatos</h2>
          {jobs.length === 0 && <p className="text-ink-muted text-sm">Nenhuma vaga associada.</p>}
          {jobs.map((j) => (
            <div key={j.id} className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{j.title}</h3>
                <Link href={`/shortlist?projeto=${p.id}&job=${j.id}`} className="btn-primary btn-sm">Abrir shortlist</Link>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-ink-muted bg-surface-2">
                    <th className="p-2">Candidato</th><th className="p-2">Etapa</th><th className="p-2">Status</th><th className="p-2">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {j.candidates
                    ?.sort((a, b) => b.score - a.score)
                    .map((c) => (
                      <tr key={c.id} className="border-b border-[#ece5d4]">
                        <td className="p-2 font-semibold">{c.name}</td>
                        <td className="p-2"><span className="tag tag-purple">{c.stage}</span></td>
                        <td className="p-2">{c.status}</td>
                        <td className="p-2"><strong>{c.score}</strong></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
