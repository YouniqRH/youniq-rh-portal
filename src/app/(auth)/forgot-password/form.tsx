"use client";

import { useActionState } from "react";
import { forgotPasswordAction, type AuthState } from "../actions";
import { Field } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ForgotForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(forgotPasswordAction, {});
  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <div className="rounded-lg bg-danger/10 text-danger border border-danger/20 px-3 py-2 text-sm">{state.error}</div>
      )}
      {state.info && (
        <div className="rounded-lg bg-info/10 text-info border border-info/20 px-3 py-2 text-sm">{state.info}</div>
      )}
      <Field label="Email cadastrado" name="email" type="email" required placeholder="voce@empresa.com.br" />
      <Button type="submit" disabled={pending} className="w-full justify-center">
        {pending ? "Enviando..." : "Enviar instrucoes"}
      </Button>
    </form>
  );
}
