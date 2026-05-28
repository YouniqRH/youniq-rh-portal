import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { CompanyForm } from "../form";
import { upsertCompany } from "../../actions";

export default async function NovaEmpresaPage() {
  await requireAdmin();

  const action = async (formData: FormData) => {
    "use server";
    await upsertCompany(null, formData);
  };

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/empresas" className="link-purple text-xs">&larr; Empresas</Link>
        <h1 className="text-2xl font-bold mt-1">Nova empresa</h1>
      </header>
      <CompanyForm action={action} />
    </div>
  );
}
