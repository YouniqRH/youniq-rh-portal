import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { CompanyForm } from "../form";
import { upsertCompany } from "../../actions";

export default async function EditarEmpresaPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const admin = createAdminClient();
  const { data: company } = await admin.from("companies").select("*").eq("id", id).single();
  if (!company) notFound();

  const action = async (formData: FormData) => {
    "use server";
    await upsertCompany(id, formData);
  };

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/empresas" className="link-purple text-xs">&larr; Empresas</Link>
        <h1 className="text-2xl font-bold mt-1">Editar empresa</h1>
      </header>
      <CompanyForm action={action} company={company} />
    </div>
  );
}
