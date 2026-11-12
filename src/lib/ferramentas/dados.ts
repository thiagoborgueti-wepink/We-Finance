import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { buscarPtax } from "@/lib/cotacao/ptax";
import { hojeISO } from "@/lib/datas";
import { createClient } from "@/lib/supabase/server";
import type { Categoria, CentroCusto, Ferramenta } from "./tipos";

/** Linha de public.ferramentas como vem do PostgREST. */
interface LinhaFerramenta {
  id: string;
  nome: string;
  centro_custo_id: string | null;
  categoria_id: number;
  responsavel: string | null;
  conta_login: string | null;
  valor: number | string;
  moeda: Ferramenta["moeda"];
  ciclo_meses: number;
  proxima_cobranca: string | null;
  forma_pagamento: string | null;
  situacao: Ferramenta["situacao"];
  observacoes: string | null;
}

export function linhaParaFerramenta(l: LinhaFerramenta): Ferramenta {
  return {
    id: l.id,
    nome: l.nome,
    centroCustoId: l.centro_custo_id,
    categoriaId: l.categoria_id,
    responsavel: l.responsavel,
    contaLogin: l.conta_login,
    valor: Number(l.valor),
    moeda: l.moeda,
    cicloMeses: l.ciclo_meses,
    proximaCobranca: l.proxima_cobranca,
    formaPagamento: l.forma_pagamento,
    situacao: l.situacao,
    observacoes: l.observacoes,
  };
}

/** Ferramenta para as colunas de public.ferramentas (sem id). */
export function ferramentaParaLinha(f: Omit<Ferramenta, "id">) {
  return {
    nome: f.nome,
    centro_custo_id: f.centroCustoId,
    categoria_id: f.categoriaId,
    responsavel: f.responsavel,
    conta_login: f.contaLogin,
    valor: f.valor,
    moeda: f.moeda,
    ciclo_meses: f.cicloMeses,
    proxima_cobranca: f.proximaCobranca,
    forma_pagamento: f.formaPagamento,
    situacao: f.situacao,
    observacoes: f.observacoes,
  };
}

export interface CotacaoAtual {
  valor: number;
  /** AAAA-MM-DD do boletim ou do registro manual. */
  dataReferencia: string;
  fonte: "ptax" | "manual" | "provisoria";
  /** Explica quando a cotação não é a de hoje. */
  aviso: string | null;
}

/** Cotação sem nenhum registro e com o BCB fora do ar: valor de referência, com aviso. */
export const COTACAO_PROVISORIA = 5.5;

interface LinhaCotacao {
  valor: number | string;
  data_referencia: string;
  fonte: "ptax" | "manual";
  registrada_em: string;
}

/**
 * Cotação em uso (T-011): a registrada por último. Uma vez por dia (horário de
 * São Paulo) busca a PTAX no Banco Central e registra; se a busca falhar, segue
 * com a última salva e avisa a data.
 */
export async function obterCotacao(supabase: SupabaseClient, hoje: string): Promise<CotacaoAtual> {
  const { data } = await supabase
    .from("cotacoes")
    .select("valor, data_referencia, fonte, registrada_em")
    .order("registrada_em", { ascending: false })
    .limit(1)
    .maybeSingle<LinhaCotacao>();

  const ultima = data
    ? {
        valor: Number(data.valor),
        dataReferencia: data.data_referencia,
        fonte: data.fonte,
        registradaHoje: hojeISO(new Date(data.registrada_em)) === hoje,
      }
    : null;

  if (ultima?.registradaHoje) {
    return { valor: ultima.valor, dataReferencia: ultima.dataReferencia, fonte: ultima.fonte, aviso: null };
  }

  const ptax = await buscarPtax(hoje);
  if (ptax) {
    await supabase
      .from("cotacoes")
      .insert({ valor: ptax.valor, data_referencia: ptax.dataReferencia, fonte: "ptax" });
    return { valor: ptax.valor, dataReferencia: ptax.dataReferencia, fonte: "ptax", aviso: null };
  }

  if (ultima) {
    return {
      valor: ultima.valor,
      dataReferencia: ultima.dataReferencia,
      fonte: ultima.fonte,
      aviso: "Não foi possível buscar a PTAX hoje; usando a última cotação salva.",
    };
  }

  return {
    valor: COTACAO_PROVISORIA,
    dataReferencia: hoje,
    fonte: "provisoria",
    aviso: "Sem cotação salva e o Banco Central não respondeu. Valor provisório: informe a cotação.",
  };
}

export interface DadosPainel {
  hoje: string;
  ferramentas: Ferramenta[];
  centros: CentroCusto[];
  categorias: Categoria[];
  cotacao: CotacaoAtual;
}

export async function carregarPainel(): Promise<DadosPainel> {
  const supabase = await createClient();
  const hoje = hojeISO();

  const [ferramentas, centros, categorias, cotacao] = await Promise.all([
    supabase.from("ferramentas").select("*").order("nome"),
    supabase.from("centros_custo").select("id, nome, orcamento_mensal").order("nome"),
    supabase.from("categorias").select("id, nome, ordem").order("ordem"),
    obterCotacao(supabase, hoje),
  ]);

  const erro = ferramentas.error ?? centros.error ?? categorias.error;
  if (erro) throw new Error(`Falha ao carregar os dados: ${erro.message}`);

  return {
    hoje,
    ferramentas: (ferramentas.data as LinhaFerramenta[]).map(linhaParaFerramenta),
    centros: (centros.data ?? []).map((c) => ({
      id: c.id as string,
      nome: c.nome as string,
      orcamentoMensal: c.orcamento_mensal === null ? null : Number(c.orcamento_mensal),
    })),
    categorias: categorias.data as Categoria[],
    cotacao,
  };
}

export interface RegistroHistorico {
  id: number;
  acao: "criacao" | "edicao" | "exclusao";
  campo: string | null;
  valorAnterior: string | null;
  valorNovo: string | null;
  origem: "interface" | "importacao";
  usuarioEmail: string | null;
  registradoEm: string;
}
