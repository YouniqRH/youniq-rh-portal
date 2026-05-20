import { ResetForm } from "./form";

export default function ResetPasswordPage() {
  return (
    <>
      <h2 className="text-2xl font-bold">Definir nova senha</h2>
      <p className="text-ink-muted text-sm mb-5">Crie uma senha segura com pelo menos 8 caracteres.</p>
      <ResetForm />
    </>
  );
}
