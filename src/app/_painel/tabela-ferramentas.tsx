"use client";

import { useState, useTransition } from "react";
import { formatarBRL, rotuloCiclo } from "@/lib/custos/custo";
import { formatarData } from "@/lib/datas";
import { alertaDaFerramenta } from "@/lib/ferramentas/alertas";
import { custoMensalDaFerramenta } from "@/lib/ferramentas/resumo";
import type { Ferramenta } from "@/lib/ferramentas/tipos";
import { excluirFerramenta } from "../acoes";
import { formatarMoeda } from "../_ui/formatos";
import { Botao, Selo } from "../_ui/ui";

export interface AcoesLinha {
  aoEditar: (f: Ferramenta) => void;
  aoVerHistorico: (f: Ferramenta) => void;
}

interface Props extends AcoesLinha {
  ferramentas: Ferramenta[];
  nomeDoCentro: (id: string | null) => string;
  cotacao: number;
  hoje: string;
}

/** Ordem da T-003: próxima cobrança primeiro; sem data no fim. */
export function ordenarPorCobranca(lista: Ferramenta[]): Ferramenta[] {
  return [...lista].sort((a, b) => {
    if (a.proximaCobranca && b.proximaCobranca && a.proximaCobranca !== b.proximaCobranca) {
      return a.proximaCobranca < b.proximaCobranca ? -1 : 1;
    }
    if (a.proximaCobranca && !b.proximaCobranca) return -1;
    if (!a.proximaCobranca && b.proximaCobranca) return 1;
    return a.nome.localeCompare(b.nome, "pt-BR");
  });
}

export function TabelaFerramentas(props: Props) {
  const { ferramentas } = props;
  if (ferramentas.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-foreground/20 px-4 py-10 text-center text-sm text-foreground/60">
        Nenhuma ferramenta neste filtro.
      </p>
    );
  }
  const ordenadas = ordenarPorCobranca(ferramentas);

  return (
    <>
      {/* Telas médias e grandes: tabela. */}
      <div className="hidden overflow-x-auto rounded-lg border border-foreground/10 md:block">
        <table className="w-full text-sm">
          <thead className="bg-foreground/[0.03] text-left text-xs text-foreground/60">
            <tr>
              <th className="px-3 py-2 font-medium">Ferramenta</th>
              <th className="px-3 py-2 font-medium">Centro</th>
              <th className="px-3 py-2 font-medium">Responsável</th>
              <th className="px-3 py-2 text-right font-medium">Valor</th>
              <th className="px-3 py-2 text-right font-medium">Custo mensal</th>
              <th className="px-3 py-2 font-medium">Próxima cobrança</th>
              <th className="px-3 py-2 font-medium">Situação</th>
              <th className="px-3 py-2">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foreground/10">
            {ordenadas.map((f) => (
              <LinhaTabela key={f.id} f={f} {...props} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Celular: cartões, sem rolagem horizontal. */}
      <ul className="flex flex-col gap-2 md:hidden">
        {ordenadas.map((f) => (
          <CartaoFerramenta key={f.id} f={f} {...props} />
        ))}
      </ul>
    </>
  );
}

type PropsLinha = Omit<Props, "ferramentas"> & { f: Ferramenta };

function useExclusao(f: Ferramenta) {
  const [confirmando, setConfirmando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [excluindo, iniciar] = useTransition();
  const excluir = () =>
    iniciar(async () => {
      const r = await excluirFerramenta(f.id);
      if (r.erro) setErro(r.erro);
    });
  return { confirmando, setConfirmando, erro, excluindo, excluir };
}

function Acoes({ f, aoEditar, aoVerHistorico }: PropsLinha) {
  const ex = useExclusao(f);
  if (ex.confirmando) {
    return (
      <div className="flex flex-wrap items-center justify-end gap-1.5" role="group" aria-label={`Confirmar exclusão de ${f.nome}`}>
        <span className="text-xs">Excluir {f.nome}?</span>
        <Botao variante="perigo" className="px-2 py-1" disabled={ex.excluindo} onClick={ex.excluir}>
          {ex.excluindo ? "Excluindo…" : "Excluir"}
        </Botao>
        <Botao variante="discreto" className="px-2 py-1" onClick={() => ex.setConfirmando(false)}>
          Cancelar
        </Botao>
        {ex.erro && <span className="w-full text-right text-xs text-red-600">{ex.erro}</span>}
      </div>
    );
  }
  return (
    <div className="flex justify-end gap-1">
      <Botao variante="discreto" className="px-2 py-1" onClick={() => aoEditar(f)}>
        Editar
      </Botao>
      <Botao variante="discreto" className="px-2 py-1" onClick={() => aoVerHistorico(f)}>
        Histórico
      </Botao>
      <Botao variante="discreto" className="px-2 py-1 text-red-700 dark:text-red-400" onClick={() => ex.setConfirmando(true)}>
        Excluir
      </Botao>
    </div>
  );
}

function LinhaTabela(props: PropsLinha) {
  const { f, nomeDoCentro, cotacao, hoje } = props;
  const alerta = alertaDaFerramenta(f, hoje);
  return (
    <tr className={alerta.nivel === "critico" ? "bg-red-50/70 dark:bg-red-950/30" : ""}>
      <td className="px-3 py-2">
        <span className="font-medium">{f.nome}</span>
        <span className="block text-xs text-foreground/60">{rotuloCiclo(f.cicloMeses)}</span>
      </td>
      <td className="px-3 py-2">{nomeDoCentro(f.centroCustoId)}</td>
      <td className="px-3 py-2">{f.responsavel ?? <span className="text-foreground/50">—</span>}</td>
      <td className="px-3 py-2 text-right tabular-nums">{formatarMoeda(f.valor, f.moeda)}</td>
      <td className="px-3 py-2 text-right tabular-nums">{formatarBRL(custoMensalDaFerramenta(f, cotacao))}</td>
      <td className="px-3 py-2 tabular-nums">{f.proximaCobranca ? formatarData(f.proximaCobranca) : "—"}</td>
      <td className="px-3 py-2">
        <Selo nivel={alerta.nivel}>{alerta.texto}</Selo>
      </td>
      <td className="px-3 py-2">
        <Acoes {...props} />
      </td>
    </tr>
  );
}

function CartaoFerramenta(props: PropsLinha) {
  const { f, nomeDoCentro, cotacao, hoje } = props;
  const alerta = alertaDaFerramenta(f, hoje);
  return (
    <li
      className={`flex flex-col gap-2 rounded-lg border p-3 ${
        alerta.nivel === "critico" ? "border-red-300 bg-red-50/70 dark:border-red-900 dark:bg-red-950/30" : "border-foreground/10"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium">{f.nome}</p>
          <p className="text-xs text-foreground/60">
            {nomeDoCentro(f.centroCustoId)} · {f.responsavel ?? "sem responsável"}
          </p>
        </div>
        <Selo nivel={alerta.nivel}>{alerta.texto}</Selo>
      </div>
      <dl className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <dt className="text-foreground/60">Valor</dt>
          <dd className="tabular-nums">{formatarMoeda(f.valor, f.moeda)}</dd>
          <dd className="text-foreground/60">{rotuloCiclo(f.cicloMeses)}</dd>
        </div>
        <div>
          <dt className="text-foreground/60">Por mês</dt>
          <dd className="tabular-nums">{formatarBRL(custoMensalDaFerramenta(f, cotacao))}</dd>
        </div>
        <div>
          <dt className="text-foreground/60">Cobrança</dt>
          <dd className="tabular-nums">{f.proximaCobranca ? formatarData(f.proximaCobranca) : "—"}</dd>
        </div>
      </dl>
      <Acoes {...props} />
    </li>
  );
}

