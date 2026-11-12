/**
 * Validação dos formulários de ferramenta e de centro de custo. Pura, usada
 * pelas Server Actions; as mensagens aparecem ao lado de cada campo.
 */

import { lerValor } from "@/lib/csv/valores";
import { dataISOValida } from "@/lib/datas";
import { PADRAO_NUMERO_CARTAO, type Ferramenta, type Situacao } from "./tipos";

export type CampoFerramenta = Exclude<keyof Ferramenta, "id">;

export type Validacao<T, C extends string> =
  | { ok: true; dados: T }
  | { ok: false; erros: Partial<Record<C, string>> };

type Entrada = Record<string, FormDataEntryValue | null | undefined>;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SITUACOES: Situacao[] = ["ativa", "a_cancelar", "pausada"];

function texto(entrada: Entrada, campo: string): string {
  const v = entrada[campo];
  return typeof v === "string" ? v.trim() : "";
}

export function validarFerramenta(
  entrada: Entrada,
): Validacao<Omit<Ferramenta, "id">, CampoFerramenta> {
  const erros: Partial<Record<CampoFerramenta, string>> = {};
  const opcional = (campo: CampoFerramenta, limite: number): string | null => {
    const v = texto(entrada, campo);
    if (v.length > limite) erros[campo] = `Use no máximo ${limite} caracteres.`;
    return v || null;
  };

  const nome = texto(entrada, "nome");
  if (!nome) erros.nome = "Informe o nome da ferramenta.";
  else if (nome.length > 120) erros.nome = "Use no máximo 120 caracteres.";

  const centro = texto(entrada, "centroCustoId");
  if (centro && !UUID.test(centro)) erros.centroCustoId = "Centro de custo inválido.";

  const categoriaId = Number(texto(entrada, "categoriaId"));
  if (!Number.isInteger(categoriaId) || categoriaId < 1) erros.categoriaId = "Escolha uma categoria.";

  const valorLido = lerValor(texto(entrada, "valor"));
  if (!valorLido.ok) erros.valor = "Informe um valor como 1.800,00.";

  const moeda = texto(entrada, "moeda");
  if (moeda !== "BRL" && moeda !== "USD") erros.moeda = "Escolha BRL ou USD.";

  const cicloMeses = Number(texto(entrada, "cicloMeses"));
  if (!Number.isInteger(cicloMeses) || cicloMeses < 1 || cicloMeses > 60) {
    erros.cicloMeses = "O ciclo deve ficar entre 1 e 60 meses.";
  }

  const data = texto(entrada, "proximaCobranca");
  if (data && !dataISOValida(data)) erros.proximaCobranca = "Data inválida.";

  const situacao = texto(entrada, "situacao") as Situacao;
  if (!SITUACOES.includes(situacao)) erros.situacao = "Escolha a situação.";

  const responsavel = opcional("responsavel", 120);
  const contaLogin = opcional("contaLogin", 200);
  const formaPagamento = opcional("formaPagamento", 120);
  const observacoes = opcional("observacoes", 2000);
  for (const [campo, v] of [
    ["formaPagamento", formaPagamento],
    ["observacoes", observacoes],
  ] as const) {
    if (v && PADRAO_NUMERO_CARTAO.test(v)) {
      erros[campo] = "Não registre número de cartão. Use algo como “Cartão corporativo final 1234”.";
    }
  }

  if (Object.keys(erros).length || !valorLido.ok) return { ok: false, erros };

  return {
    ok: true,
    dados: {
      nome,
      centroCustoId: centro || null,
      categoriaId,
      responsavel,
      contaLogin,
      valor: valorLido.valor.valor,
      moeda: moeda as "BRL" | "USD",
      cicloMeses,
      proximaCobranca: data || null,
      formaPagamento,
      situacao,
      observacoes,
    },
  };
}

export type CampoCentro = "nome" | "orcamentoMensal";

export function validarCentro(
  entrada: Entrada,
): Validacao<{ nome: string; orcamentoMensal: number | null }, CampoCentro> {
  const erros: Partial<Record<CampoCentro, string>> = {};

  const nome = texto(entrada, "nome");
  if (!nome) erros.nome = "Informe o nome do centro.";
  else if (nome.length > 60) erros.nome = "Use no máximo 60 caracteres.";

  const orcamentoTexto = texto(entrada, "orcamentoMensal");
  let orcamentoMensal: number | null = null;
  if (orcamentoTexto) {
    const lido = lerValor(orcamentoTexto);
    if (!lido.ok || lido.valor.moeda === "USD") erros.orcamentoMensal = "Informe o orçamento em reais, como 5.000,00.";
    else orcamentoMensal = lido.valor.valor;
  }

  if (Object.keys(erros).length) return { ok: false, erros };
  return { ok: true, dados: { nome, orcamentoMensal } };
}

/** Cotação digitada à mão: "5,43" ou "5.43". */
export function lerCotacaoManual(textoCotacao: string): number | null {
  const t = textoCotacao.trim().replace(",", ".");
  if (!/^\d{1,2}(\.\d{1,4})?$/.test(t)) return null;
  const v = Number(t);
  return v > 0 && v < 100 ? v : null;
}
