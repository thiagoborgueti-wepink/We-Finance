"use client";

import { formatarBRL } from "@/lib/custos/custo";
import type { CustoDoCentro } from "@/lib/ferramentas/resumo";
import { Botao } from "../_ui/ui";
import { plural } from "../_ui/formatos";

export type FiltroCentro = "todos" | "sem" | string;

export function chaveCentro(centroId: string | null): FiltroCentro {
  return centroId ?? "sem";
}

/** Quadro "Custo mensal por centro" (T-004) com consumo do orçamento (T-010). */
export function CustoPorCentro({
  linhas,
  filtro,
  aoFiltrar,
  aoGerenciar,
}: {
  linhas: CustoDoCentro[];
  filtro: FiltroCentro;
  aoFiltrar: (filtro: FiltroCentro) => void;
  aoGerenciar: () => void;
}) {
  const maior = Math.max(...linhas.map((l) => l.custoMensal), 0);

  return (
    <section aria-labelledby="titulo-centros" className="flex flex-col gap-3 rounded-lg border border-foreground/10 p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 id="titulo-centros" className="font-semibold">
          Custo mensal por centro
        </h2>
        <Botao variante="discreto" onClick={aoGerenciar}>
          Gerenciar centros
        </Botao>
      </div>

      {linhas.length === 0 ? (
        <p className="text-sm text-foreground/60">Nenhum centro de custo cadastrado.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {linhas.map((l) => {
            const chave = chaveCentro(l.centroId);
            const ativo = filtro === chave;
            const largura = maior > 0 ? (l.custoMensal / maior) * 100 : 0;
            return (
              <li key={chave}>
                <button
                  type="button"
                  onClick={() => aoFiltrar(ativo ? "todos" : chave)}
                  aria-pressed={ativo}
                  className={`flex w-full flex-col gap-1.5 rounded-md px-2 py-2 text-left transition hover:bg-foreground/5 ${
                    ativo ? "bg-foreground/5 ring-1 ring-foreground/30" : ""
                  }`}
                >
                  <span className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="truncate font-medium">{l.nome}</span>
                    <span className="shrink-0 tabular-nums">{formatarBRL(l.custoMensal)}</span>
                  </span>
                  <span className="h-2 w-full overflow-hidden rounded-full bg-foreground/10" aria-hidden>
                    <span className="block h-full rounded-full bg-foreground/70" style={{ width: `${largura}%` }} />
                  </span>
                  <span className="flex flex-wrap items-center justify-between gap-x-3 text-xs text-foreground/60">
                    <span>{plural(l.quantidade, "ferramenta", "ferramentas")}</span>
                    {l.consumo && l.orcamentoMensal !== null && (
                      <ConsumoOrcamento
                        percentual={l.consumo.percentual}
                        nivel={l.consumo.nivel}
                        orcamento={l.orcamentoMensal}
                      />
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function ConsumoOrcamento({
  percentual,
  nivel,
  orcamento,
}: {
  percentual: number;
  nivel: "ok" | "alerta" | "estourado";
  orcamento: number;
}) {
  const texto = `${Math.round(percentual)}% de ${formatarBRL(orcamento)}`;
  if (nivel === "estourado") {
    return <span className="font-medium text-red-700 dark:text-red-300">⚠ Orçamento estourado: {texto}</span>;
  }
  if (nivel === "alerta") {
    return <span className="font-medium text-amber-800 dark:text-amber-300">● Perto do limite: {texto}</span>;
  }
  return <span>Orçamento: {texto}</span>;
}
