import Link from "next/link";
import { Briefcase, TrendingUp, CalendarDays, ShieldCheck, Users, Layers } from "lucide-react";
import { requireAuth } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDate, formatDateTime, labelStatus } from "@/lib/utils";

export default async function Dashboard() {
  const profile = await requireAuth();
  const supabase = await createClient();

  // RLS ja filtra: admin ve tudo, recrutadora ve atribuidos, cliente ve sua empresa+visible
  const { data: projects } = await supabase
    .from("projects")
    .select("*, companies(nome)")
    .order("prazo_data", { ascending: true, nullsFirst: false });

  const list = projects ?? [];
  const ativos = list.filter((p) => p.status !== "concluido" && p.status !== "cancelado").length;
  const progressoMedio = list.length ? Math.round(list.reduce((a, b) => a + (b.progresso ?? 0), 0) / list.length) : 0;
  const proximo = list.find((p) => p.prazo_data) ?? null;

  const statusCount: Record<string, number> = {};
  for (const p of list) statusCount[p.status] = (statusCount[p.status] ?? 0) + 1;

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Ola, {profile.name.split(" ")[0]} 👋</h1>
          <p className="text-ink-muted">
            {profile.role === "admin" && "Visao consolidada de todos os clientes."}
            {profile.role === "recruiter" && "Suas vagas e projetos atribuidos."}
            {profile.role === "client" && "Visao geral dos seus projetos com a Youniq RH."}
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Kpi icon={Briefcase} tint="purple" label="Projetos ativos" value={String(ativos)} foot={`${list.length} no total`} />
        <Kpi icon={TrendingUp} tint="cream" label="Progresso medio" value={`${progressoMedio}%`} foot={<Progress value={progressoMedio} />} />
        <Kpi icon={CalendarDays} tint="dark"
             label="Proximo prazo"
             value={proximo?.prazo_data ? formatDate(proximo.prazo_data) : "--"}
             foot={proximo?.nome ?? "Sem prazos"} />
        {profile.role === "admin" ? (
          <Kpi icon={ShieldCheck} tint="cream" label="Modo" value="Admin" foot="Veja /admin para CRUD" />
        ) : profile.role === "recruiter" ? (
          <Kpi icon={Users} tint="cream" label="Suas vagas" value={String(list.filter(p => p.tem_recrutamento).length)} foot="Veja /shortlist" />
        ) : (
          <Kpi icon={Layers} tint="cream" label="Status" value={`${Object.keys(statusCount).length}`} foot="categorias distintas" />
        )}
      </section>

      <section className="panel">
        <header className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold">Projetos</h2>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-ink-muted bg-surface-2">
                <th className="p-3">Projeto</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Status</th>
                <th className="p-3">Progresso</th>
                <th className="p-3">Prazo</th>
                <th className="p-3">Atualizado</th>
                <th className="p-3 text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} className="border-b border-[#ece5d4] hover:bg-[#fbf7ec]">
                  <td className="p-3">
                    <div className="font-semibold">{p.nome}</div>
                    {profile.role !== "client" && (
                      <div className="text-xs text-ink-muted">{(p.companies as { nome: string } | null)?.nome}</div>
                    )}
                  </td>
                  <td className="p-3">{p.tipo_servico}</td>
                  <td className="p-3"><Badge status={p.status}>{labelStatus(p.status)}</Badge></td>
                  <td className="p-3 min-w-[160px]">
                    <Progress value={p.progresso ?? 0} />
                    <div className="text-xs text-ink-muted mt-1">{p.progresso ?? 0}%</div>
                  </td>
                  <td className="p-3">{formatDate(p.prazo_data)}</td>
                  <td className="p-3">{formatDateTime(p.last_update)}</td>
                  <td className="p-3 text-right">
                    <Link href={`/projetos/${p.id}`} className="btn-ghost btn-sm">Ver</Link>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-ink-muted italic">Nenhum projeto a exibir.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Kpi({ icon: Icon, tint, label, value, foot }: {
  icon: React.ComponentType<{ className?: string }>;
  tint: "purple" | "cream" | "dark";
  label: string;
  value: string;
  foot: React.ReactNode;
}) {
  const tintMap = {
    purple: "bg-brand-purple/10 text-brand-purple",
    cream:  "bg-brand-cream text-brand-purple",
    dark:   "bg-brand-sidebar text-brand-cream",
  } as const;
  return (
    <Card className="p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl grid place-items-center ${tintMap[tint]}`}><Icon className="w-5 h-5" /></div>
      <div className="flex-1">
        <div className="text-[11px] uppercase tracking-wider text-ink-muted">{label}</div>
        <div className="text-2xl font-bold mt-1">{value}</div>
        <div className="text-xs text-ink-muted mt-1">{foot}</div>
      </div>
    </Card>
  );
}
