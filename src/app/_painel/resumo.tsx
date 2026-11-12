import { formatarBRL } from "@/lib/custos/custo";
import type { Resumo } from "@/lib/ferramentas/resumo";
import { plural } from "../_ui/formatos";

/** Quatro indicadores do topo (T-005). */
export function CartoesResumo({ resumo }: { resumo: Resumo }) {
  const cartoes = [
    { titulo: "Custo mensal", valor: formatarBRL(resumo.custoMensal), detalhe: "Ferramentas não pausadas" },
    { titulo: "Custo anual projetado", valor: formatarBRL(resumo.custoAnual), detalhe: "Custo mensal × 12" },
    {
      titulo: "A pagar em 30 dias",
      valor: formatarBRL(resumo.aPagar30Dias.valor),
      detalhe: plural(resumo.aPagar30Dias.quantidade, "cobrança", "cobranças"),
    },
    {
      titulo: "Precisam de atenção",
      valor: String(resumo.precisamAtencao),
      detalhe: "Vencidas, vencendo em 7 dias ou sem responsável",
      destaque: resumo.precisamAtencao > 0,
    },
  ];

  return (
    <section aria-label="Resumo" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cartoes.map((c) => (
        <div
          key={c.titulo}
          className={`flex flex-col gap-1 rounded-lg border p-4 ${
            c.destaque
              ? "border-amber-400 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/50"
              : "border-foreground/10"
          }`}
        >
          <p className="text-xs font-medium text-foreground/60">{c.titulo}</p>
          <p className="text-xl font-semibold tabular-nums sm:text-2xl">{c.valor}</p>
          <p className="text-xs text-foreground/60">{c.detalhe}</p>
        </div>
      ))}
    </section>
  );
}
