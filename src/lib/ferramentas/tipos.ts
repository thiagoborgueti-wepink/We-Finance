import type { Moeda } from "@/lib/custos/custo";

/** Espelha o enum public.situacao_ferramenta. */
export type Situacao = "ativa" | "a_cancelar" | "pausada";

export const SITUACOES: { valor: Situacao; rotulo: string }[] = [
  { valor: "ativa", rotulo: "Ativa" },
  { valor: "a_cancelar", rotulo: "A cancelar" },
  { valor: "pausada", rotulo: "Pausada" },
];

export function rotuloSituacao(situacao: Situacao): string {
  return SITUACOES.find((s) => s.valor === situacao)?.rotulo ?? situacao;
}

/** Linha de public.ferramentas, com nomes em camelCase. */
export interface Ferramenta {
  id: string;
  nome: string;
  centroCustoId: string | null;
  categoriaId: number;
  responsavel: string | null;
  contaLogin: string | null;
  valor: number;
  moeda: Moeda;
  cicloMeses: number;
  /** AAAA-MM-DD */
  proximaCobranca: string | null;
  formaPagamento: string | null;
  situacao: Situacao;
  observacoes: string | null;
}

export interface CentroCusto {
  id: string;
  nome: string;
  /** Orçamento mensal em reais; nulo = sem orçamento. */
  orcamentoMensal: number | null;
}

export interface Categoria {
  id: number;
  nome: string;
  ordem: number;
}

export const SEM_CENTRO = "Sem centro de custo";

/** Recusa sequências que parecem número de cartão (mesma regra do banco). */
export const PADRAO_NUMERO_CARTAO = /[0-9][0-9 .-]{11,}[0-9]/;

/** Minúsculas, sem acento e com espaços simples: base de comparação de nomes. */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}
