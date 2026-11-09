/**
 * Regras de custo das ferramentas. Funções puras, sem dependência de framework
 * ou banco, testadas em custo.test.ts.
 */

export type Moeda = "BRL" | "USD";
export type Ciclo = "mensal" | "anual";

export interface Cobranca {
  valor: number;
  moeda: Moeda;
  ciclo: Ciclo;
}

const MESES_POR_CICLO: Record<Ciclo, number> = {
  mensal: 1,
  anual: 12,
};

/** Converte um valor para reais usando a cotação do dólar informada. */
export function paraBRL(valor: number, moeda: Moeda, cotacaoUSD: number): number {
  if (!Number.isFinite(valor) || valor < 0) {
    throw new RangeError(`Valor inválido: ${valor}`);
  }
  if (moeda === "BRL") return valor;
  if (!Number.isFinite(cotacaoUSD) || cotacaoUSD <= 0) {
    throw new RangeError(`Cotação do dólar inválida: ${cotacaoUSD}`);
  }
  return valor * cotacaoUSD;
}

/** Custo mensal equivalente em reais (um ciclo anual é dividido por 12). */
export function custoMensalBRL(cobranca: Cobranca, cotacaoUSD: number): number {
  const emReais = paraBRL(cobranca.valor, cobranca.moeda, cotacaoUSD);
  return emReais / MESES_POR_CICLO[cobranca.ciclo];
}

/** Formata um valor em reais no padrão brasileiro (R$ 1.234,56). */
export function formatarBRL(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
