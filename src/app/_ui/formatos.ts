import type { Moeda } from "@/lib/custos/custo";

/** Valor na moeda original: R$ 1.800,00 ou US$ 36,00. */
export function formatarMoeda(valor: number, moeda: Moeda): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: moeda });
}

export function formatarCotacao(valor: number): string {
  return valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

/** Data e hora de um timestamp, no fuso de São Paulo. */
export function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function plural(n: number, singular: string, pluralForma: string): string {
  return `${n} ${n === 1 ? singular : pluralForma}`;
}
