import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { Field } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateUser } from "../../actions";

export default async function EditarUsuarioPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const admin = createAdminClient();
  const [{ data: u }, { data: companies }] = await Promise.all([
    admin.from("profiles").select("*").eq("id", id).single(),
    admin.from("companies").select("id, nome").order("nome"),
  ]);
  if (!u) notFound();

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/usuarios" className="link-purple text-xs">&larr; Usuarios</Link>
        <h1 className="text-2xl font-bold mt-1">Editar usuario</h1>
      </header>

      <form action={updateUser.bind(null, id)} className="panel space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Email" name="email" type="email" required defaultValue={u.email} />
          <Field label="Nome" name="name" required defaultValue={u.name} />
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">Role</label>
            <select name="role" className="input" defaultValue={u.role}>
              <option value="client">Cliente</option>
              <option value="recruiter">Recrutadora</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">Empresa</label>
            <select name="company_id" className="input" defaultValue={u.company_id ?? ""}>
              <option value="">Sem empresa</option>
              {(companies ?? []).map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <Field label="Nova senha (em branco mantem)" name="password" type="text" />
        </div>
        <div className="flex justify-end gap-2 pt-3 border-t border-[#ece5d4]">
          <Link href="/admin/usuarios" className="btn-ghost">Cancelar</Link>
          <Button type="submit">Salvar alteracoes</Button>
        </div>
      </form>
    </div>
  );
}
