import { LoginForm } from "./form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reset?: string; error?: string }>;
}) {
  const sp = await searchParams;
  return (
    <>
      <h2 className="text-2xl font-bold">Entrar</h2>
      <p className="text-ink-muted text-sm mb-5">Use seu email corporativo para acessar.</p>

      {sp.reset === "ok" && (
        <div className="rounded-lg bg-success/10 text-success border border-success/20 px-3 py-2 text-sm mb-3">
          Senha redefinida com sucesso. Faca login.
        </div>
      )}
      {sp.error === "forbidden" && (
        <div className="rounded-lg bg-danger/10 text-danger border border-danger/20 px-3 py-2 text-sm mb-3">
          Voce nao tem permissao para acessar aquela area.
        </div>
      )}

      <LoginForm next={sp.next} />
    </>
  );
}
