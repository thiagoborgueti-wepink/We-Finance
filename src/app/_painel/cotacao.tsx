"use client";

import { useState, useTransition } from "react";
import { formatarData } from "@/lib/datas";
import type { CotacaoAtual } from "@/lib/ferramentas/dados";
import { definirCotacao } from "../acoes";
import { formatarCotacao } from "../_ui/formatos";
import { Botao, estiloCampo } from "../_ui/ui";

const FONTES: Record<CotacaoAtual["fonte"], string> = {
  ptax: "PTAX do Banco Central",
  manual: "informada manualmente",
  provisoria: "valor provisório",
};

/** Cotação do dólar em uso, com fonte e data (T-011), e troca manual. */
export function Cotacao({ cotacao }: { cotacao: CotacaoAtual }) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, iniciar] = useTransition();

  function salvar(e: React.FormEvent) {
    e.preventDefault();
    iniciar(async () => {
      const r = await definirCotacao(valor);
      if (r.erro) setErro(r.erro);
      else {
        setEditando(false);
        setErro(null);
      }
    });
  }

  return (
    <div className="flex flex-col gap-1 text-sm">
      {editando ? (
        <form onSubmit={salvar} className="flex flex-wrap items-center gap-2">
          <label htmlFor="cotacao-manual" className="text-foreground/70">
            US$ 1 = R$
          </label>
          <input
            id="cotacao-manual"
            inputMode="decimal"
            autoFocus
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder={formatarCotacao(cotacao.valor)}
            className={`${estiloCampo} w-24 py-1`}
          />
          <Botao type="submit" variante="primario" disabled={salvando}>
            Salvar
          </Botao>
          <Botao variante="discreto" onClick={() => setEditando(false)}>
            Cancelar
          </Botao>
        </form>
      ) : (
        <p className="flex flex-wrap items-center gap-x-2 text-foreground/80">
          <span>
            <strong className="font-semibold tabular-nums">US$ 1 = R$ {formatarCotacao(cotacao.valor)}</strong>{" "}
            <span className="text-foreground/60">
              · {FONTES[cotacao.fonte]}, {formatarData(cotacao.dataReferencia)}
            </span>
          </span>
          <Botao variante="discreto" className="px-2 py-0.5" onClick={() => setEditando(true)}>
            Alterar
          </Botao>
        </p>
      )}
      {erro && <p className="text-xs text-red-600 dark:text-red-400">{erro}</p>}
      {cotacao.aviso && <p className="text-xs text-amber-800 dark:text-amber-300">⚠ {cotacao.aviso}</p>}
    </div>
  );
}
