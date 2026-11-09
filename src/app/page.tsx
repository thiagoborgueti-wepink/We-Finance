const proximosPassos = [
  { id: "T-002", titulo: "Modelar ferramentas e centros de custo no Supabase" },
  { id: "T-003", titulo: "Cadastro de ferramentas" },
  { id: "T-004", titulo: "Custos por centro de custo" },
  { id: "T-006", titulo: "Vencimentos e alertas" },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-4 py-16 sm:px-6">
      <header className="flex flex-col gap-3">
        <p className="text-sm font-medium uppercase tracking-wider text-foreground/60">
          Em construção
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">We-Finance</h1>
        <p className="max-w-prose text-foreground/80">
          Central de assinaturas da WePink: quanto pagamos por cada ferramenta,
          quando vence, quem responde pela conta e a qual centro de custo pertence.
        </p>
      </header>

      <section aria-labelledby="proximos" className="flex flex-col gap-3">
        <h2 id="proximos" className="text-lg font-semibold">
          Próximas entregas
        </h2>
        <ul className="flex flex-col divide-y divide-foreground/10 rounded-lg border border-foreground/10">
          {proximosPassos.map((passo) => (
            <li key={passo.id} className="flex gap-4 px-4 py-3">
              <span className="font-mono text-sm text-foreground/60 tabular-nums">
                {passo.id}
              </span>
              <span>{passo.titulo}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
