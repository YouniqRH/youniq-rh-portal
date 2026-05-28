import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { ConfirmForm } from "@/components/app/confirm-form";
import { formatDate } from "@/lib/utils";
import { deleteCompany } from "../actions";

export default async function EmpresasPage() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data: companies } = await admin
    .from("companies")
    .select("*, profiles(count), projects(count)")
    .order("nome");

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="link-purple text-xs">&larr; Painel admin</Link>
          <h1 className="text-2xl font-bold mt-1">Empresas</h1>
          <p className="text-ink-muted">Gerencie as empresas clientes da Youniq RH.</p>
        </div>
        <Link href="/admin/empresas/novo" className="btn-primary"><Plus className="w-4 h-4" />Nova empresa</Link>
      </header>

      <section className="panel">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-ink-muted bg-surface-2">
                <th className="p-3">Nome</th>
                <th className="p-3">Status</th>
                <th className="p-3">Usuarios</th>
                <th className="p-3">Projetos</th>
                <th className="p-3">Criada em</th>
                <th className="p-3 text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {(companies ?? []).map((c: { id: string; nome: string; status: string; created_at: string; profiles: { count: number }[]; projects: { count: number }[] }) => {
                const usersCount = c.profiles?.[0]?.count ?? 0;
                const projectsCount = c.projects?.[0]?.count ?? 0;
                return (
                  <tr key={c.id} className="border-b border-[#ece5d4]">
                    <td className="p-3 font-semibold">{c.nome}</td>
                    <td className="p-3">
                      {c.status === "active" ? (
                        <span className="tag tag-purple">Ativa</span>
                      ) : (
                        <span className="tag">Inativa</span>
                      )}
                    </td>
                    <td className="p-3">{usersCount}</td>
                    <td className="p-3">{projectsCount}</td>
                    <td className="p-3">{formatDate(c.created_at)}</td>
                    <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                      <Link href={`/admin/empresas/${c.id}`} className="btn-ghost btn-sm">
                        <Edit className="w-3.5 h-3.5" />Editar
                      </Link>
                      <ConfirmForm
                        action={deleteCompany.bind(null, c.id)}
                        message="Excluir esta empresa? So funciona se nao houver usuarios/projetos vinculados."
                        className="inline"
                      >
                        <Button variant="danger" size="sm"><Trash2 className="w-3.5 h-3.5" />Excluir</Button>
                      </ConfirmForm>
                    </td>
                  </tr>
                );
              })}
              {(companies ?? []).length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-ink-muted italic">Nenhuma empresa cadastrada ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
