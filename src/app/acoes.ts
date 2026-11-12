"use server";

/**
 * Server Actions do painel. Toda gravação passa pelo RLS do Supabase com a
 * sessão do usuário; aqui validamos a entrada e traduzimos os erros do banco.
 */

import { refresh } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { analisarCsv } from "@/lib/csv/importar";
import { hojeISO } from "@/lib/datas";
import { ferramentaParaLinha, type RegistroHistorico } from "@/lib/ferramentas/dados";
import {
  lerCotacaoManual,
  validarCentro,
  validarFerramenta,
  type CampoCentro,
  type CampoFerramenta,
} from "@/lib/ferramentas/formulario";
import { normalizar } from "@/lib/ferramentas/tipos";
import { createClient } from "@/lib/supabase/server";

export interface EstadoFormulario<C extends string> {
  ok?: boolean;
  erros?: Partial<Record<C, string>>;
  erroGeral?: string;
  /** Muda a cada envio bem-sucedido, para o formulário saber que pode fechar. */
  enviadoEm?: number;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function clienteLogado(opcoes?: { origem?: "importacao" }): Promise<SupabaseClient> {
  const supabase = await createClient(opcoes);
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) throw new Error("Sessão expirada. Entre de novo.");
  return supabase;
}

/** Mensagem em português para erros comuns do Postgres. */
function mensagemDoBanco(erro: { code?: string; message: string }, contexto: string): string {
  if (erro.code === "23505") return `${contexto} já existe com esse nome.`;
  if (erro.code === "23503") return `${contexto} está em uso e não pode ser excluído.`;
  if (erro.code === "23514") return "Algum campo foi recusado pelo banco. Revise os valores.";
  if (erro.code === "42501") return "Sem permissão para esta ação.";
  console.error("[acoes] erro do banco", erro.code, erro.message);
  return "Não foi possível salvar agora. Tente de novo.";
}

// ---------------------------------------------------------------------------
// Ferramentas (T-003)
// ---------------------------------------------------------------------------

export async function salvarFerramenta(
  _anterior: EstadoFormulario<CampoFerramenta>,
  form: FormData,
): Promise<EstadoFormulario<CampoFerramenta>> {
  const validacao = validarFerramenta(Object.fromEntries(form));
  if (!validacao.ok) return { erros: validacao.erros };

  const id = String(form.get("id") ?? "");
  if (id && !UUID.test(id)) return { erroGeral: "Ferramenta inválida." };

  const supabase = await clienteLogado();
  const linha = ferramentaParaLinha(validacao.dados);
  const { error } = id
    ? await supabase.from("ferramentas").update(linha).eq("id", id)
    : await supabase.from("ferramentas").insert(linha);

  if (error) {
    if (error.code === "23505") {
      return { erros: { nome: "Já existe uma ferramenta com esse nome nesse centro de custo." } };
    }
    return { erroGeral: mensagemDoBanco(error, "A ferramenta") };
  }

  refresh();
  return { ok: true, enviadoEm: Date.now() };
}

export async function excluirFerramenta(id: string): Promise<{ erro?: string }> {
  if (!UUID.test(id)) return { erro: "Ferramenta inválida." };
  const supabase = await clienteLogado();
  const { error } = await supabase.from("ferramentas").delete().eq("id", id);
  if (error) return { erro: mensagemDoBanco(error, "A ferramenta") };
  refresh();
  return {};
}

// ---------------------------------------------------------------------------
// Centros de custo (T-004, T-010)
// ---------------------------------------------------------------------------

export async function salvarCentro(
  _anterior: EstadoFormulario<CampoCentro>,
  form: FormData,
): Promise<EstadoFormulario<CampoCentro>> {
  const validacao = validarCentro(Object.fromEntries(form));
  if (!validacao.ok) return { erros: validacao.erros };

  const id = String(form.get("id") ?? "");
  if (id && !UUID.test(id)) return { erroGeral: "Centro inválido." };

  const supabase = await clienteLogado();
  const linha = { nome: validacao.dados.nome, orcamento_mensal: validacao.dados.orcamentoMensal };
  const { error } = id
    ? await supabase.from("centros_custo").update(linha).eq("id", id)
    : await supabase.from("centros_custo").insert(linha);

  if (error) {
    if (error.code === "23505") return { erros: { nome: "Já existe um centro com esse nome." } };
    return { erroGeral: mensagemDoBanco(error, "O centro de custo") };
  }

  refresh();
  return { ok: true, enviadoEm: Date.now() };
}

export async function excluirCentro(id: string): Promise<{ erro?: string }> {
  if (!UUID.test(id)) return { erro: "Centro inválido." };
  const supabase = await clienteLogado();
  const { error } = await supabase.from("centros_custo").delete().eq("id", id);
  if (error?.code === "23503") {
    return { erro: "Este centro tem ferramentas. Mova ou exclua as ferramentas antes." };
  }
  if (error) return { erro: mensagemDoBanco(error, "O centro de custo") };
  refresh();
  return {};
}

// ---------------------------------------------------------------------------
// Cotação manual (T-011)
// ---------------------------------------------------------------------------

export async function definirCotacao(valorTexto: string): Promise<{ erro?: string }> {
  const valor = lerCotacaoManual(valorTexto);
  if (valor === null) return { erro: "Informe a cotação como 5,43." };

  const supabase = await clienteLogado();
  const { error } = await supabase
    .from("cotacoes")
    .insert({ valor, data_referencia: hojeISO(), fonte: "manual" });
  if (error) return { erro: mensagemDoBanco(error, "A cotação") };
  refresh();
  return {};
}

// ---------------------------------------------------------------------------
// Importação de CSV (T-007)
// ---------------------------------------------------------------------------

export interface ResultadoImportacao {
  erro?: string;
  criadas?: number;
  atualizadas?: number;
  ignoradas?: number;
  comErro?: number;
  centrosCriados?: number;
}

/**
 * Grava um CSV já conferido na prévia. O arquivo é analisado de novo aqui, com
 * os dados atuais do banco, para não confiar no que veio do navegador.
 */
export async function importarCsv(texto: string, atualizarExistentes: boolean): Promise<ResultadoImportacao> {
  const supabase = await clienteLogado({ origem: "importacao" });

  const [ferramentas, centros, categorias] = await Promise.all([
    supabase.from("ferramentas").select("id, nome, centro_custo_id"),
    supabase.from("centros_custo").select("id, nome"),
    supabase.from("categorias").select("id, nome"),
  ]);
  const erroLeitura = ferramentas.error ?? centros.error ?? categorias.error;
  if (erroLeitura) return { erro: mensagemDoBanco(erroLeitura, "A importação") };

  const analise = analisarCsv(texto, {
    ferramentas: (ferramentas.data ?? []).map((f) => ({
      id: f.id as string,
      nome: f.nome as string,
      centroCustoId: f.centro_custo_id as string | null,
    })),
    centros: centros.data as { id: string; nome: string }[],
    categorias: categorias.data as { id: number; nome: string }[],
  });
  if (analise.erroGeral) return { erro: analise.erroGeral };

  const centroPorNome = new Map(
    (centros.data as { id: string; nome: string }[]).map((c) => [normalizar(c.nome), c.id]),
  );

  let centrosCriados = 0;
  if (analise.centrosNovos.length) {
    const { data, error } = await supabase
      .from("centros_custo")
      .insert(analise.centrosNovos.map((nome) => ({ nome })))
      .select("id, nome");
    if (error) return { erro: mensagemDoBanco(error, "Um centro de custo") };
    for (const c of data) centroPorNome.set(normalizar(c.nome as string), c.id as string);
    centrosCriados = data.length;
  }

  const paraLinha = (dados: NonNullable<(typeof analise.linhas)[number]["dados"]>) => {
    const { centro, ...resto } = dados;
    return ferramentaParaLinha({
      ...resto,
      centroCustoId: centro ? (centroPorNome.get(normalizar(centro)) ?? null) : null,
    });
  };

  const novas = analise.linhas.filter((l) => l.status === "nova" && l.dados);
  const existentes = analise.linhas.filter((l) => l.status === "existe" && l.dados && l.existenteId);
  const comErro = analise.linhas.filter((l) => l.status === "erro").length;

  if (novas.length) {
    const { error } = await supabase.from("ferramentas").insert(novas.map((l) => paraLinha(l.dados!)));
    if (error) return { erro: mensagemDoBanco(error, "Uma ferramenta"), centrosCriados };
  }

  let atualizadas = 0;
  if (atualizarExistentes) {
    for (const l of existentes) {
      const { error } = await supabase.from("ferramentas").update(paraLinha(l.dados!)).eq("id", l.existenteId!);
      if (error) {
        return {
          erro: `Linha ${l.numero}: ${mensagemDoBanco(error, "A ferramenta")}`,
          criadas: novas.length,
          atualizadas,
          centrosCriados,
        };
      }
      atualizadas += 1;
    }
  }

  refresh();
  return {
    criadas: novas.length,
    atualizadas,
    ignoradas: atualizarExistentes ? 0 : existentes.length,
    comErro,
    centrosCriados,
  };
}

// ---------------------------------------------------------------------------
// Histórico (T-012)
// ---------------------------------------------------------------------------

export async function carregarHistorico(
  ferramentaId: string,
): Promise<{ erro?: string; registros?: RegistroHistorico[] }> {
  if (!UUID.test(ferramentaId)) return { erro: "Ferramenta inválida." };
  const supabase = await clienteLogado();
  const { data, error } = await supabase
    .from("historico_ferramentas")
    .select("id, acao, campo, valor_anterior, valor_novo, origem, usuario_email, registrado_em")
    .eq("ferramenta_id", ferramentaId)
    .order("registrado_em", { ascending: false })
    .order("id", { ascending: false })
    .limit(200);
  if (error) return { erro: mensagemDoBanco(error, "O histórico") };

  return {
    registros: data.map((r) => ({
      id: r.id as number,
      acao: r.acao as RegistroHistorico["acao"],
      campo: r.campo as string | null,
      valorAnterior: r.valor_anterior as string | null,
      valorNovo: r.valor_novo as string | null,
      origem: r.origem as RegistroHistorico["origem"],
      usuarioEmail: r.usuario_email as string | null,
      registradoEm: r.registrado_em as string,
    })),
  };
}
