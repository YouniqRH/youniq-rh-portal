import Link from "next/link";
import { Field } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Company } from "@/types/database";

export function CompanyForm({
  action,
  company,
}: {
  action: (fd: FormData) => Promise<void>;
  company?: Company;
}) {
  return (
    <form action={action} className="space-y-5">
      {/* ============== Identificacao ============== */}
      <section className="panel space-y-4">
        <header>
          <h2 className="font-bold">Identificacao</h2>
          <p className="text-xs text-ink-muted">Dados oficiais do CNPJ.</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Razao social *" name="nome" required defaultValue={company?.nome} placeholder="Ex.: Youniq Recursos Humanos Ltda" />
          <Field label="Nome fantasia" name="nome_fantasia" defaultValue={company?.nome_fantasia ?? ""} placeholder="Ex.: Youniq RH" />
          <Field label="CNPJ" name="cnpj" defaultValue={company?.cnpj ?? ""} placeholder="00.000.000/0000-00" />
          <Field label="Inscricao Estadual" name="inscricao_estadual" defaultValue={company?.inscricao_estadual ?? ""} placeholder="isento, se aplicavel" />
          <Field label="Inscricao Municipal" name="inscricao_municipal" defaultValue={company?.inscricao_municipal ?? ""} />
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">Status</label>
            <select name="status" className="input" defaultValue={company?.status ?? "active"}>
              <option value="active">Ativa</option>
              <option value="inactive">Inativa</option>
            </select>
          </div>
        </div>
      </section>

      {/* ============== Contato ============== */}
      <section className="panel space-y-4">
        <header>
          <h2 className="font-bold">Contato</h2>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Email principal" name="email" type="email" defaultValue={company?.email ?? ""} placeholder="contato@empresa.com.br" />
          <Field label="Telefone" name="telefone" defaultValue={company?.telefone ?? ""} placeholder="(00) 00000-0000" />
        </div>
      </section>

      {/* ============== Endereco ============== */}
      <section className="panel space-y-4">
        <header>
          <h2 className="font-bold">Endereco</h2>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-4">
            <Field label="Logradouro" name="endereco_logradouro" defaultValue={company?.endereco_logradouro ?? ""} placeholder="Av. Paulista" />
          </div>
          <Field label="Numero" name="endereco_numero" defaultValue={company?.endereco_numero ?? ""} placeholder="1234" />
          <Field label="Complemento" name="endereco_complemento" defaultValue={company?.endereco_complemento ?? ""} placeholder="Sala 501" />
          <div className="md:col-span-3">
            <Field label="Bairro" name="endereco_bairro" defaultValue={company?.endereco_bairro ?? ""} />
          </div>
          <div className="md:col-span-2">
            <Field label="Cidade" name="endereco_cidade" defaultValue={company?.endereco_cidade ?? ""} placeholder="Sao Paulo" />
          </div>
          <Field label="UF" name="endereco_uf" defaultValue={company?.endereco_uf ?? ""} placeholder="SP" />
          <Field label="CEP" name="endereco_cep" defaultValue={company?.endereco_cep ?? ""} placeholder="00000-000" />
        </div>
      </section>

      {/* ============== Responsavel ============== */}
      <section className="panel space-y-4">
        <header>
          <h2 className="font-bold">Responsavel legal / Representante</h2>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nome" name="responsavel_nome" defaultValue={company?.responsavel_nome ?? ""} />
          <Field label="Cargo" name="responsavel_cargo" defaultValue={company?.responsavel_cargo ?? ""} placeholder="Diretor(a), Socio(a), etc." />
        </div>
      </section>

      {/* ============== Observacoes ============== */}
      <section className="panel space-y-4">
        <header>
          <h2 className="font-bold">Observacoes</h2>
          <p className="text-xs text-ink-muted">Notas internas (nao visiveis para o cliente).</p>
        </header>
        <textarea name="observacoes" rows={3} className="input" defaultValue={company?.observacoes ?? ""} placeholder="Comentarios, contratos especiais, etc." />
      </section>

      <div className="flex justify-end gap-2">
        <Link href="/admin/empresas" className="btn-ghost">Cancelar</Link>
        <Button type="submit">{company ? "Salvar alteracoes" : "Criar empresa"}</Button>
      </div>
    </form>
  );
}
