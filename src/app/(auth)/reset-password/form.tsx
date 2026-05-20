"use client";

import { useActionState } from "react";
import { resetPasswordAction, type AuthState } from "../actions";
import { Field } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ResetForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(resetPasswordAction, {});
  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <div className="rounded-lg bg-danger/10 text-danger border border-danger/20 px-3 py-2 text-sm">{state.error}</div>
      )}
      <Field label="Nova senha" name="senha" type="password" required placeholder="********" />
      <Field label="Confirmacao" name="confirmacao" type="password" required placeholder="********" />
      <Button type="submit" disabled={pending} className="w-full justify-center">
        {pending ? "Salvando..." : "Salvar nova senha"}
      </Button>
    </form>
  );
}
