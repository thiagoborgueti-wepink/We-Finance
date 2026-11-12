/**
 * Exportação das ferramentas em CSV (T-008): UTF-8 com BOM e ponto e vírgula,
 * para abrir direto no Excel em português. Reimporta pela T-007 sem ajuste.
 */

import Papa from "papaparse";
import { rotuloCiclo } from "@/lib/custos/custo";
import { formatarData } from "@/lib/datas";
import { custoMensalDaFerramenta } from "@/lib/ferramentas/resumo";
import {
  rotuloSituacao,
  type Categoria,
  type CentroCusto,
  type Ferramenta,
} from "@/lib/ferramentas/tipos";
import { CABECALHOS, COLUNA_CUSTO_MENSAL } from "./colunas";
import { formatarValorPlanilha } from "./valores";

const BOM = "﻿";

/** Evita que o Excel execute células começando com =, +, - ou @. */
function protegerFormula(texto: string): string {
  return /^[=+\-@]/.test(texto) ? `'${texto}` : texto;
}

function gerar(linhas: string[][]): string {
  return BOM + Papa.unparse(linhas, { delimiter: ";", newline: "\r\n" });
}

export function gerarCsv(
  ferramentas: Ferramenta[],
  centros: CentroCusto[],
  categorias: Categoria[],
  cotacaoUSD: number,
): string {
  const centroPorId = new Map(centros.map((c) => [c.id, c.nome]));
  const categoriaPorId = new Map(categorias.map((c) => [c.id, c.nome]));

  const linhas = ferramentas.map((f) => {
    const texto = (v: string | null) => protegerFormula(v ?? "");
    return [
      texto(f.nome),
      texto(f.centroCustoId ? (centroPorId.get(f.centroCustoId) ?? "") : ""),
      texto(categoriaPorId.get(f.categoriaId) ?? ""),
      texto(f.responsavel),
      texto(f.contaLogin),
      formatarValorPlanilha(f.valor),
      f.moeda,
      rotuloCiclo(f.cicloMeses),
      f.proximaCobranca ? formatarData(f.proximaCobranca) : "",
      texto(f.formaPagamento),
      rotuloSituacao(f.situacao),
      texto(f.observacoes),
      formatarValorPlanilha(custoMensalDaFerramenta(f, cotacaoUSD)),
    ];
  });

  return gerar([[...CABECALHOS.map((c) => c.titulo), COLUNA_CUSTO_MENSAL], ...linhas]);
}

/** Modelo para download, com uma linha de exemplo fictícia. */
export function gerarModeloCsv(): string {
  return gerar([
    CABECALHOS.map((c) => c.titulo),
    [
      "Exemplo Cloud",
      "Produto",
      "Infra e deploy",
      "Maria Souza",
      "contas@example.com",
      "120,00",
      "USD",
      "Mensal",
      "15/01/2027",
      "Cartão corporativo",
      "Ativa",
      "Linha de exemplo: apague antes de importar.",
    ],
  ]);
}
