"use client";

import { useState, useTransition } from "react";
import { KeyRound, Copy, Check, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resetUserPassword, sendPasswordResetEmail } from "@/app/(app)/admin/actions";

type Mode = "temp" | "email";

export function ResetPasswordButton({
  userId,
  userEmail,
  mode = "temp",
}: {
  userId: string;
  userEmail: string;
  mode?: Mode;
}) {
  const [pending, startTransition] = useTransition();
  const [tempPass, setTempPass] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTemp = () => {
    if (!confirm(`Gerar nova senha temporaria para ${userEmail}?\n\nA senha atual sera substituida imediatamente.`)) return;
    startTransition(async () => {
      try {
        const { tempPassword } = await resetUserPassword(userId);
        setTempPass(tempPassword);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Falha");
      }
    });
  };

  const handleEmail = () => {
    if (!confirm(`Enviar email de reset de senha para ${userEmail}?`)) return;
    startTransition(async () => {
      try {
        await sendPasswordResetEmail(userId);
        setEmailSent(true);
        setError(null);
        setTimeout(() => setEmailSent(false), 4000);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Falha");
      }
    });
  };

  const copy = async () => {
    if (!tempPass) return;
    await navigator.clipboard.writeText(tempPass);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {mode === "temp" ? (
        <Button variant="ghost" size="sm" disabled={pending} onClick={handleTemp}>
          <KeyRound className="w-3.5 h-3.5" />
          {pending ? "Gerando..." : "Resetar senha"}
        </Button>
      ) : (
        <Button variant="ghost" size="sm" disabled={pending} onClick={handleEmail}>
          <Mail className="w-3.5 h-3.5" />
          {pending ? "Enviando..." : emailSent ? "Email enviado!" : "Enviar reset"}
        </Button>
      )}

      {error && (
        <div className="fixed inset-x-0 top-4 z-50 mx-auto max-w-md bg-danger/10 border border-danger/30 text-danger rounded-lg px-4 py-3 text-sm shadow-lg">
          {error}
          <button onClick={() => setError(null)} className="float-right font-bold">x</button>
        </div>
      )}

      {tempPass && (
        <div
          className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4"
          onClick={() => setTempPass(null)}
        >
          <div
            className="bg-white rounded-xl shadow-lg p-7 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-brand-purple/10 text-brand-purple grid place-items-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg">Senha temporaria gerada</h3>
            </div>

            <p className="text-sm text-ink-muted mb-4">
              Anote ou copie esta senha <strong>agora</strong> — ela nao sera mostrada novamente.
              Passe ao usuario <strong>{userEmail}</strong> por canal seguro (WhatsApp corporativo, presencialmente).
              Oriente a trocar a senha no proximo login em <em>Esqueci minha senha</em>.
            </p>

            <div className="flex items-stretch gap-2 mb-5">
              <code className="flex-1 bg-surface-2 border border-[#ece5d4] px-4 py-3 rounded-lg font-mono text-base tracking-wider select-all">
                {tempPass}
              </code>
              <button
                onClick={copy}
                className="btn-ghost px-3"
                title="Copiar"
              >
                {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <Button onClick={() => setTempPass(null)} className="w-full justify-center">
              Ja anotei, fechar
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
