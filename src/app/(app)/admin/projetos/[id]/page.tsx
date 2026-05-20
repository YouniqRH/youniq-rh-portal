import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProjectForm } from "../form";
import { upsertProject } from "../../actions";

export default async function EditarProjetoPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const admin = createAdminClient();
  const [{ data: project }, { data: companies }] = await Promise.all([
    admin.from("projects").select("*").eq("id", id).single(),
    admin.from("companies").select("id, nome").order("nome"),
  ]);
  if (!project) notFound();

  const action = async (formData: FormData) => {
    "use server";
    await upsertProject(id, formData);
  };

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/projetos" className="link-purple text-xs">&larr; Projetos</Link>
        <h1 className="text-2xl font-bold mt-1">Editar projeto</h1>
      </header>
      <ProjectForm action={action} companies={companies ?? []} project={project} />
    </div>
  );
}
