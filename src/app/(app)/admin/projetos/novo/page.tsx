import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProjectForm } from "../form";
import { upsertProject } from "../../actions";

export default async function NovoProjetoPage() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data: companies } = await admin.from("companies").select("id, nome").order("nome");

  const action = async (formData: FormData) => {
    "use server";
    await upsertProject(null, formData);
  };

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/projetos" className="link-purple text-xs">&larr; Projetos</Link>
        <h1 className="text-2xl font-bold mt-1">Novo projeto</h1>
      </header>
      <ProjectForm action={action} companies={companies ?? []} />
    </div>
  );
}
