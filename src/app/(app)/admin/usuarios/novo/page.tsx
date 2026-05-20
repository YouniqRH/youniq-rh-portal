import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { Field } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createUser } from "../../actions";

export default async function NovoUsuarioPage() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data: companies } = await admin.from("companies").select("id, nome").order("nome");

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/usuarios" className="link-purple text-xs">&larr; Usuarios</Link>
        <h1 className="text-2xl font-bold mt-1">Novo usuario</h1>
      </header>

      <form action={createUser} className="panel space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Email" name="email" type="email" required />
          <Field label="Nome completo" name="name" required />
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">Role</label>
            <select name="role" className="input" defaultValue="client">
              <option value="client">Cliente</option>
              <option value="recruiter">Recrutadora</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">Empresa</label>
            <select name="company_id" className="input" defaultValue="">
              <option value="">Sem empresa</option>
              {(companies ?? []).map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <Field label="Senha (opcional - gera aleatoria se vazio)" name="password" type="text" />
        </div>
        <div className="flex justify-end gap-2 pt-3 border-t border-[#ece5d4]">
          <Link href="/admin/usuarios" className="btn-ghost">Cancelar</Link>
          <Button type="submit">Criar usuario</Button>
        </div>
      </form>
    </div>
  );
}
