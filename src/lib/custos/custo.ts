/**
 * Regras de custo das ferramentas. Funções puras, sem dependência de framework
 * ou banco, testadas em custo.test.ts.
 *
 * Espelha as colunas valor, moeda e ciclo_meses de public.ferramentas.
 */

export type Moeda = "BRL" | "USD";

export interface Cobranca {
  valor: number;
  moeda: Moeda;
  /** Periodicidade em meses: 1 mensal, 12 anual, 36 para 3 anos. */
  cicloMeses: number;
}

export const CICLOS_COMUNS = [
  { meses: 1, rotulo: "Mensal" },
  { meses: 3, rotulo: "Trimestral" },
  { meses: 6, rotulo: "Semestral" },
  { meses: 12, rotulo: "Anual" },
  { meses: 24, rotulo: "A cada 2 anos" },
  { meses: 36, rotulo: "A cada 3 anos" },
] as const;

/** Rótulo do ciclo para exibir na interface. */
export function rotuloCiclo(cicloMeses: number): string {
  const comum = CICLOS_COMUNS.find((c) => c.meses === cicloMeses);
  return comum ? comum.rotulo : `A cada ${cicloMeses} meses`;
}

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

/** Custo mensal equivalente em reais (valor do ciclo dividido pelos meses). */
export function custoMensalBRL(cobranca: Cobranca, cotacaoUSD: number): number {
  const { cicloMeses } = cobranca;
  if (!Number.isInteger(cicloMeses) || cicloMeses < 1 || cicloMeses > 60) {
    throw new RangeError(`Ciclo inválido: ${cicloMeses} meses`);
  }
  return paraBRL(cobranca.valor, cobranca.moeda, cotacaoUSD) / cicloMeses;
}

/** Formata um valor em reais no padrão brasileiro (R$ 1.234,56). */
export function formatarBRL(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
