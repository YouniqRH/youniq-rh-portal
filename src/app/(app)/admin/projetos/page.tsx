import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmForm } from "@/components/app/confirm-form";
import { Progress } from "@/components/ui/progress";
import { formatDate, labelStatus } from "@/lib/utils";
import { deleteProject } from "../actions";

export default async function AdminProjetosPage() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data: projects } = await admin
    .from("projects")
    .select("*, companies(nome)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="link-purple text-xs">&larr; Painel admin</Link>
          <h1 className="text-2xl font-bold mt-1">Projetos</h1>
        </div>
        <Link href="/admin/projetos/novo" className="btn-primary"><Plus className="w-4 h-4" />Novo projeto</Link>
      </header>

      <section className="panel">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-ink-muted bg-surface-2">
                <th className="p-3">Cliente</th><th className="p-3">Projeto</th><th className="p-3">Tipo</th>
                <th className="p-3">Status</th><th className="p-3">Progresso</th><th className="p-3">Prazo</th>
                <th className="p-3">Visivel cli.</th><th className="p-3">Recrut.</th>
                <th className="p-3 text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {(projects ?? []).map((p) => {
                const company = p.companies as { nome: string } | null;
                return (
                  <tr key={p.id} className="border-b border-[#ece5d4]">
                    <td className="p-3 text-ink-muted">{company?.nome}</td>
                    <td className="p-3 font-semibold">{p.nome}</td>
                    <td className="p-3">{p.tipo_servico}</td>
                    <td className="p-3"><Badge status={p.status}>{labelStatus(p.status)}</Badge></td>
                    <td className="p-3 min-w-[140px]"><Progress value={p.progresso ?? 0} /><div className="text-xs text-ink-muted mt-1">{p.progresso ?? 0}%</div></td>
                    <td className="p-3">{formatDate(p.prazo_data)}</td>
                    <td className="p-3">{p.visible_to_client ? "Sim" : "Nao"}</td>
                    <td className="p-3">{p.tem_recrutamento ? <span className="tag tag-purple">Sim</span> : <span className="tag">Nao</span>}</td>
                    <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                      <Link href={`/admin/projetos/${p.id}`} className="btn-ghost btn-sm"><Edit className="w-3.5 h-3.5" />Editar</Link>
                      <ConfirmForm action={deleteProject.bind(null, p.id)} message="Excluir este projeto?" className="inline">
                        <Button variant="danger" size="sm"><Trash2 className="w-3.5 h-3.5" />Excluir</Button>
                      </ConfirmForm>
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
