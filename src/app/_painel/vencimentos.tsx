import { formatarData } from "@/lib/datas";
import type { Vencimento } from "@/lib/ferramentas/resumo";
import { Selo } from "../_ui/ui";
import { formatarMoeda } from "../_ui/formatos";

/** Lista "Próximos 60 dias" (T-006), com as vencidas no topo. */
export function Vencimentos({ itens }: { itens: Vencimento[] }) {
  return (
    <section aria-labelledby="titulo-vencimentos" className="flex flex-col gap-3 rounded-lg border border-foreground/10 p-4">
      <h2 id="titulo-vencimentos" className="font-semibold">
        Vencimentos: próximos 60 dias
      </h2>
      {itens.length === 0 ? (
        <p className="text-sm text-foreground/60">Nenhuma cobrança nos próximos 60 dias.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-foreground/10">
          {itens.map(({ ferramenta: f, alerta }) => (
            <li
              key={f.id}
              className={`flex items-center justify-between gap-3 py-2 ${
                alerta.nivel === "critico" ? "-mx-2 rounded-md bg-red-50 px-2 dark:bg-red-950/40" : ""
              }`}
            >
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">{f.nome}</span>
                <span className="text-xs text-foreground/60">
                  {formatarData(f.proximaCobranca!)} · {formatarMoeda(f.valor, f.moeda)}
                </span>
              </div>
              <Selo nivel={alerta.nivel}>{alerta.texto}</Selo>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
