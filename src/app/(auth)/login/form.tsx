"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type AuthState } from "../actions";
import { Field } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(loginAction, {});
  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <div className="rounded-lg bg-danger/10 text-danger border border-danger/20 px-3 py-2 text-sm">
          {state.error}
        </div>
      )}
      <Field label="Email" name="email" type="email" required autoComplete="email" placeholder="voce@empresa.com.br" />
      <Field label="Senha" name="senha" type="password" required autoComplete="current-password" placeholder="********" />
      {next && <input type="hidden" name="next" value={next} />}

      <div className="flex justify-end">
        <Link href="/forgot-password" className="link-purple text-xs">Esqueci minha senha</Link>
      </div>

      <Button type="submit" disabled={pending} className="w-full justify-center">
        {pending ? "Entrando..." : "Entrar no portal"}
      </Button>
    </form>
  );
}
