import Link from "next/link";
import { requireAuth } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDateTime, labelStage } from "@/lib/utils";
import { JobPicker } from "./job-picker";

export default async function ShortlistPage({
  searchParams,
}: {
  searchParams: Promise<{ projeto?: string; job?: string }>;
}) {
  const profile = await requireAuth();
  const sp = await searchParams;
  const supabase = await createClient();

  // RLS filtra: admin tudo, recrutadora seus jobs, cliente jobs visiveis da sua empresa.
  let jobsQuery = supabase.from("jobs").select("*, projects(*, companies(nome))").eq("status", "em_andamento");
  if (sp.projeto) jobsQuery = jobsQuery.eq("project_id", sp.projeto);
  const { data: jobs } = await jobsQuery;
  const jobList = jobs ?? [];

  const selectedJob = sp.job ? jobList.find((j) => j.id === sp.job) : (jobList[0] ?? null);

  let candidates: { id: string; name: string; stage: string; score: number; status: string; notes: string; updated_at: string }[] = [];
  if (selectedJob) {
    const { data: cands } = await supabase
      .from("candidates")
      .select("*")
      .eq("job_id", selectedJob.id)
      .order("score", { ascending: false });
    candidates = (cands ?? []).map((c) => ({
      ...c,
      notes: c.notes ?? "",
      updated_at: c.updated_at,
    }));
  }

  const funnelStages = ["triagem","entrevista_rh","entrevista_gestor","teste_tecnico","proposta","contratado"] as const;
  const counts = Object.fromEntries(funnelStages.map((s) => [s, candidates.filter((c) => c.stage === s).length]));
  const total = Math.max(1, candidates.length);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Shortlist ao Vivo
            <span className="inline-block w-2 h-2 rounded-full bg-success animate-pulse" />
          </h1>
          <p className="text-ink-muted">Acompanhe candidatos por vaga em tempo real.</p>
        </div>
        <JobPicker jobs={jobList.map((j) => ({ id: j.id, title: j.title }))} selectedId={selectedJob?.id} />
      </header>

      {!selectedJob ? (
        <Card className="p-10 text-center text-ink-muted">
          <p className="text-sm">
            {profile.role === "recruiter"
              ? "Nenhuma vaga atribuida a voce no momento."
              : "Nenhuma vaga em recrutamento ativo."}
          </p>
        </Card>
      ) : (
        <section className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-5">
          <div className="panel">
            <header className="flex items-center justify-between mb-3">
              <h2 className="font-bold">Candidatos - {selectedJob.title}</h2>
              <span className="text-xs text-ink-muted">{candidates.length} candidatos em processo</span>
            </header>
            <ul className="space-y-3">
              {candidates.map((c) => (
                <li key={c.id} className="grid grid-cols-[48px_1fr_80px] gap-4 items-center bg-surface-2 border border-[#ece5d4] rounded-xl px-4 py-3">
                  <div className="w-12 h-12 rounded-full bg-brand-purple text-brand-cream grid place-items-center font-bold">
                    {c.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong>{c.name}</strong>
                      <Tag variant="purple">{labelStage(c.stage)}</Tag>
                      {c.status === "reprovado" && <Tag variant="danger">Reprovado</Tag>}
                    </div>
                    {c.notes && <div className="text-sm mt-1.5">{c.notes}</div>}
                    <div className="text-xs text-ink-muted mt-1">Atualizado em {formatDateTime(c.updated_at)}</div>
                  </div>
                  <div className="score-ring" style={{ "--p": c.score } as React.CSSProperties}>
                    <span>{c.score}</span>
                  </div>
                </li>
              ))}
              {candidates.length === 0 && <li className="p-6 text-center text-ink-muted">Nenhum candidato nesta vaga ainda.</li>}
            </ul>
          </div>

          <aside className="panel">
            <h2 className="font-bold mb-3">Funil da vaga</h2>
            <ul className="space-y-3">
              {funnelStages.map((s) => (
                <li key={s}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{labelStage(s)}</span><strong>{counts[s]}</strong>
                  </div>
                  <Progress value={Math.round((counts[s] * 100) / total)} />
                </li>
              ))}
            </ul>
          </aside>
        </section>
      )}
    </div>
  );
}
