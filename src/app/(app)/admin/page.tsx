import Link from "next/link";
import { Users, Briefcase, Network, ScrollText, Building2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/card";

export default async function AdminIndex() {
  await requireAdmin();
  const admin = createAdminClient();
  const [{ count: totalClientes }, { count: totalProjetos }, { count: totalJobs }, { count: totalAudits }] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "client"),
    admin.from("projects").select("id", { count: "exact", head: true }),
    admin.from("jobs").select("id", { count: "exact", head: true }),
    admin.from("audit_logs").select("id", { count: "exact", head: true }),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Painel Admin</h1>
        <p className="text-ink-muted">Gestao completa de usuarios, projetos, vagas e auditoria.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Kpi icon={Users}     label="Clientes"  value={String(totalClientes ?? 0)} />
        <Kpi icon={Briefcase} label="Projetos"  value={String(totalProjetos ?? 0)} />
        <Kpi icon={Network}   label="Vagas"     value={String(totalJobs ?? 0)} />
        <Kpi icon={ScrollText} label="Audit logs" value={String(totalAudits ?? 0)} />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Tile href="/admin/empresas" icon={Building2} title="Empresas"  desc="Cadastrar e gerenciar as empresas clientes da Youniq." />
        <Tile href="/admin/usuarios" icon={Users}     title="Usuarios"  desc="Criar, editar, atribuir empresa, role e permissoes." />
        <Tile href="/admin/projetos" icon={Briefcase} title="Projetos"  desc="CRUD de projetos. Visibilidade para cliente e progresso." />
        <Tile href="/admin/jobs"     icon={Network}   title="Vagas"     desc="Atribuir recrutadora, ativar/pausar, controlar visibilidade." />
        <Tile href="/admin/audit-logs" icon={ScrollText} title="Audit logs" desc="Registro de todas as acoes sensiveis no portal." />
      </section>
    </div>
  );
}

function Kpi({ icon: I, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <Card className="p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-brand-purple/10 text-brand-purple grid place-items-center"><I className="w-5 h-5" /></div>
      <div>
        <div className="text-[11px] uppercase tracking-wider text-ink-muted">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
    </Card>
  );
}

function Tile({ href, icon: I, title, desc }: { href: string; icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
  return (
    <Link href={href} className="panel hover:shadow-card hover:-translate-y-0.5 transition cursor-pointer block">
      <div className="flex items-center gap-3 mb-1"><I className="w-5 h-5 text-brand-purple" /><h2 className="font-bold">{title}</h2></div>
      <p className="text-ink-muted text-sm">{desc}</p>
    </Link>
  );
}
