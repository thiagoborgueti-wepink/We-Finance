import { Suspense } from "react";
import { getUsuarioAtual } from "@/lib/auth/usuario";
import { carregarPainel } from "@/lib/ferramentas/dados";
import { Painel } from "./_painel/painel";
import { sair } from "./login/actions";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">We-Finance</h1>
          <p className="text-sm text-foreground/60">Central de assinaturas da WePink</p>
        </div>
        <Suspense fallback={<div className="h-9" />}>
          <BarraUsuario />
        </Suspense>
      </header>

      <Suspense fallback={<CarregandoPainel />}>
        <ConteudoPainel />
      </Suspense>
    </main>
  );
}

async function ConteudoPainel() {
  const dados = await carregarPainel();
  return <Painel dados={dados} />;
}

function CarregandoPainel() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Carregando">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-foreground/5" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-lg bg-foreground/5" />
    </div>
  );
}

async function BarraUsuario() {
  const usuario = await getUsuarioAtual();
  return (
    <div className="flex min-w-0 items-center gap-3 text-sm text-foreground/70">
      <span className="hidden truncate sm:inline">{usuario.email}</span>
      <form action={sair}>
        <button
          type="submit"
          className="rounded-md border border-foreground/20 px-3 py-1.5 hover:border-foreground/50"
        >
          Sair
        </button>
      </form>
    </div>
  );
}
