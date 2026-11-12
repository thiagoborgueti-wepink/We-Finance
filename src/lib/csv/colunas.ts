import { normalizar } from "@/lib/ferramentas/tipos";

export type CampoCsv =
  | "nome"
  | "centro"
  | "categoria"
  | "responsavel"
  | "contaLogin"
  | "valor"
  | "moeda"
  | "ciclo"
  | "proximaCobranca"
  | "formaPagamento"
  | "situacao"
  | "observacoes";

/** Cabeçalhos na ordem da exportação e do modelo. */
export const CABECALHOS: { campo: CampoCsv; titulo: string }[] = [
  { campo: "nome", titulo: "Ferramenta" },
  { campo: "centro", titulo: "Centro de custo" },
  { campo: "categoria", titulo: "Categoria" },
  { campo: "responsavel", titulo: "Responsável" },
  { campo: "contaLogin", titulo: "Conta" },
  { campo: "valor", titulo: "Valor" },
  { campo: "moeda", titulo: "Moeda" },
  { campo: "ciclo", titulo: "Ciclo" },
  { campo: "proximaCobranca", titulo: "Próxima cobrança" },
  { campo: "formaPagamento", titulo: "Forma de pagamento" },
  { campo: "situacao", titulo: "Situação" },
  { campo: "observacoes", titulo: "Observações" },
];

/** Coluna só de leitura na exportação; a importação ignora. */
export const COLUNA_CUSTO_MENSAL = "Custo mensal (BRL)";

const SINONIMOS: Record<string, CampoCsv> = {
  ferramenta: "nome",
  nome: "nome",
  servico: "nome",
  "centro de custo": "centro",
  centro: "centro",
  categoria: "categoria",
  responsavel: "responsavel",
  conta: "contaLogin",
  "conta de login": "contaLogin",
  login: "contaLogin",
  valor: "valor",
  moeda: "moeda",
  ciclo: "ciclo",
  periodicidade: "ciclo",
  "proxima cobranca": "proximaCobranca",
  vencimento: "proximaCobranca",
  "proximo vencimento": "proximaCobranca",
  "forma de pagamento": "formaPagamento",
  pagamento: "formaPagamento",
  situacao: "situacao",
  status: "situacao",
  observacoes: "observacoes",
  observacao: "observacoes",
  obs: "observacoes",
};

/** Campo correspondente a um cabeçalho, ignorando acento, caixa e espaços. */
export function campoDoCabecalho(cabecalho: string): CampoCsv | null {
  return SINONIMOS[normalizar(cabecalho)] ?? null;
}

export const OBRIGATORIOS: CampoCsv[] = ["nome", "valor"];
