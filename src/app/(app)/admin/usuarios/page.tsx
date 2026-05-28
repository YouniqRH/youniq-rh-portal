import Link from "next/link";
import { Plus, Edit, Power, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmForm } from "@/components/app/confirm-form";
import { ResetPasswordButton } from "@/components/app/reset-password-button";
import { formatDate } from "@/lib/utils";
import { toggleUserActive, deleteUser } from "../actions";

export default async function UsuariosPage() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data: users } = await admin
    .from("profiles")
    .select("*, companies(nome)")
    .order("created_at", { ascending: false });

  const list = users ?? [];

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="link-purple text-xs">&larr; Painel admin</Link>
          <h1 className="text-2xl font-bold mt-1">Usuarios</h1>
        </div>
        <Link href="/admin/usuarios/novo" className="btn-primary"><Plus className="w-4 h-4" />Novo usuario</Link>
      </header>

      <section className="panel">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-ink-muted bg-surface-2">
                <th className="p-3">Email</th><th className="p-3">Nome</th><th className="p-3">Empresa</th>
                <th className="p-3">Role</th><th className="p-3">Status</th><th className="p-3">Criado</th>
                <th className="p-3 text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {list.map((u) => {
                const company = u.companies as { nome: string } | null;
                return (
                  <tr key={u.id} className="border-b border-[#ece5d4]">
                    <td className="p-3 font-semibold">{u.email}</td>
                    <td className="p-3">{u.name}</td>
                    <td className="p-3 text-ink-muted">{company?.nome ?? "—"}</td>
                    <td className="p-3">
                      <Badge>{u.role}</Badge>
                    </td>
                    <td className="p-3">{u.active ? <span className="tag tag-purple">Ativo</span> : <span className="tag tag-danger">Inativo</span>}</td>
                    <td className="p-3">{formatDate(u.created_at)}</td>
                    <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                      <Link href={`/admin/usuarios/${u.id}`} className="btn-ghost btn-sm"><Edit className="w-3.5 h-3.5" />Editar</Link>
                      <ResetPasswordButton userId={u.id} userEmail={u.email} mode="temp" />
                      <form action={toggleUserActive.bind(null, u.id, !u.active)} className="inline">
                        <Button variant="ghost" size="sm"><Power className="w-3.5 h-3.5" />{u.active ? "Desativar" : "Ativar"}</Button>
                      </form>
                      <ConfirmForm action={deleteUser.bind(null, u.id)} message="Excluir este usuario? Esta acao e irreversivel." className="inline">
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
