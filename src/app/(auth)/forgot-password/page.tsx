import Link from "next/link";
import { ForgotForm } from "./form";

export default function ForgotPasswordPage() {
  return (
    <>
      <h2 className="text-2xl font-bold">Esqueci minha senha</h2>
      <p className="text-ink-muted text-sm mb-5">
        Voce recebera um link valido por 1 hora para redefinir a senha.
      </p>
      <ForgotForm />
      <p className="text-center text-sm mt-5">
        <Link href="/login" className="link-purple">&larr; Voltar para login</Link>
      </p>
    </>
  );
}
