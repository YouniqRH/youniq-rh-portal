import Link from "next/link";
import { Field } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function CompanyForm({
  action,
  company,
}: {
  action: (fd: FormData) => Promise<void>;
  company?: { id: string; nome: string; status: string };
}) {
  return (
    <form action={action} className="panel space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Nome da empresa" name="nome" required defaultValue={company?.nome} placeholder="Ex.: Youniq RH" />
        <div>
          <label className="block text-xs font-semibold text-ink-muted mb-1">Status</label>
          <select name="status" className="input" defaultValue={company?.status ?? "active"}>
            <option value="active">Ativa</option>
            <option value="inactive">Inativa</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-3 border-t border-[#ece5d4]">
        <Link href="/admin/empresas" className="btn-ghost">Cancelar</Link>
        <Button type="submit">{company ? "Salvar alteracoes" : "Criar empresa"}</Button>
      </div>
    </form>
  );
}
