import type { Metadata } from "next";
import { FormLogin } from "./form-login";

export const metadata: Metadata = { title: "Entrar · We-Finance" };

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8 px-4 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">We-Finance</h1>
        <p className="text-sm text-foreground/70">Entre com o seu e-mail da empresa.</p>
      </header>
      <FormLogin />
    </main>
  );
}
