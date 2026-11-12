/**
 * Análise de um CSV de ferramentas (T-007). Função pura: roda no navegador
 * para a prévia e de novo no servidor antes de gravar, com o mesmo resultado.
 */

import Papa from "papaparse";
import type { Moeda } from "@/lib/custos/custo";
import {
  PADRAO_NUMERO_CARTAO,
  normalizar,
  type Situacao,
} from "@/lib/ferramentas/tipos";
import { CABECALHOS, OBRIGATORIOS, campoDoCabecalho, type CampoCsv } from "./colunas";
import { lerCiclo, lerData, lerMoeda, lerSituacao, lerValor } from "./valores";

export const LIMITE_LINHAS = 500;
export const LIMITE_BYTES = 2 * 1024 * 1024;

export interface DadosLinha {
  nome: string;
  /** Nome do centro como veio no arquivo; nulo = sem centro. */
  centro: string | null;
  /** Id da categoria já resolvido (desconhecida vira "Outros"). */
  categoriaId: number;
  responsavel: string | null;
  contaLogin: string | null;
  valor: number;
  moeda: Moeda;
  cicloMeses: number;
  proximaCobranca: string | null;
  formaPagamento: string | null;
  situacao: Situacao;
  observacoes: string | null;
}

export type StatusLinha = "nova" | "existe" | "erro";

export interface LinhaAnalisada {
  /** Número da linha no arquivo, contando o cabeçalho como 1. */
  numero: number;
  status: StatusLinha;
  nome: string;
  dados: DadosLinha | null;
  /** Id da ferramenta já cadastrada com mesmo nome e centro. */
  existenteId: string | null;
  erros: string[];
  avisos: string[];
}

export interface ContextoImportacao {
  ferramentas: { id: string; nome: string; centroCustoId: string | null }[];
  centros: { id: string; nome: string }[];
  categorias: { id: number; nome: string }[];
}

export interface AnaliseCsv {
  /** Problema que impede ler o arquivo inteiro. */
  erroGeral: string | null;
  linhas: LinhaAnalisada[];
  colunasIgnoradas: string[];
  /** Centros citados que ainda não existem e serão criados. */
  centrosNovos: string[];
}

const LIMITES: Partial<Record<CampoCsv, number>> = {
  nome: 120,
  centro: 60,
  responsavel: 120,
  contaLogin: 200,
  formaPagamento: 120,
  observacoes: 2000,
};

/** Chave de duplicidade: nome + centro, sem acento nem caixa. */
export function chaveFerramenta(nome: string, centro: string | null): string {
  return `${normalizar(nome)}|${centro ? normalizar(centro) : ""}`;
}

/** A exportação protege células que o Excel leria como fórmula; aqui desfazemos. */
function desprotegerFormula(texto: string): string {
  return /^'[=+\-@]/.test(texto) ? texto.slice(1) : texto;
}

export function analisarCsv(texto: string, contexto: ContextoImportacao): AnaliseCsv {
  const vazio = (erroGeral: string): AnaliseCsv => ({
    erroGeral,
    linhas: [],
    colunasIgnoradas: [],
    centrosNovos: [],
  });

  if (new TextEncoder().encode(texto).length > LIMITE_BYTES) {
    return vazio("O arquivo passa de 2 MB. Divida em arquivos menores.");
  }

  const conteudo = texto.replace(/^﻿/, "");
  const lido = Papa.parse<string[]>(conteudo, {
    delimiter: "",
    delimitersToGuess: [";", ",", "\t"],
    skipEmptyLines: "greedy",
  });
  const [cabecalho, ...registros] = lido.data;
  if (!cabecalho) return vazio("O arquivo está vazio.");

  const mapa = new Map<number, CampoCsv>();
  const colunasIgnoradas: string[] = [];
  cabecalho.forEach((titulo, indice) => {
    const campo = campoDoCabecalho(titulo);
    if (campo && ![...mapa.values()].includes(campo)) mapa.set(indice, campo);
    else if (titulo.trim()) colunasIgnoradas.push(titulo.trim());
  });

  const faltando = OBRIGATORIOS.filter((c) => ![...mapa.values()].includes(c));
  if (faltando.length) {
    const nomes = faltando.map((c) => CABECALHOS.find((h) => h.campo === c)?.titulo).join(" e ");
    return vazio(`Faltam colunas obrigatórias: ${nomes}.`);
  }
  if (registros.length === 0) return vazio("O arquivo não tem linhas de dados.");
  if (registros.length > LIMITE_LINHAS) {
    return vazio(`O arquivo tem ${registros.length} linhas; o limite é ${LIMITE_LINHAS}.`);
  }

  const centrosPorNome = new Map(contexto.centros.map((c) => [normalizar(c.nome), c]));
  const nomeDoCentro = new Map(contexto.centros.map((c) => [c.id, c.nome]));
  const existentes = new Map(
    contexto.ferramentas.map((f) => [
      chaveFerramenta(f.nome, f.centroCustoId ? (nomeDoCentro.get(f.centroCustoId) ?? null) : null),
      f.id,
    ]),
  );
  const categoriasPorNome = new Map(contexto.categorias.map((c) => [normalizar(c.nome), c.id]));
  const outros = categoriasPorNome.get("outros") ?? contexto.categorias[0]?.id ?? 0;

  const vistas = new Map<string, number>();
  const centrosNovos = new Map<string, string>();

  const linhas = registros.map((registro, i): LinhaAnalisada => {
    const numero = i + 2;
    const erros: string[] = [];
    const avisos: string[] = [];

    const celula = (campo: CampoCsv): string => {
      for (const [indice, c] of mapa) {
        if (c === campo) return desprotegerFormula((registro[indice] ?? "").trim());
      }
      return "";
    };
    const opcional = (campo: CampoCsv): string | null => celula(campo) || null;

    for (const [campo, limite] of Object.entries(LIMITES) as [CampoCsv, number][]) {
      if (celula(campo).length > limite) {
        const titulo = CABECALHOS.find((h) => h.campo === campo)?.titulo;
        erros.push(`${titulo} passa de ${limite} caracteres.`);
      }
    }

    const nome = celula("nome");
    if (!nome) erros.push("Ferramenta sem nome.");

    const valor = lerValor(celula("valor"));
    const moedaColuna = lerMoeda(celula("moeda"));
    const ciclo = lerCiclo(celula("ciclo"));
    const data = lerData(celula("proximaCobranca"));
    const situacao = lerSituacao(celula("situacao"));
    for (const l of [valor, moedaColuna, ciclo, data, situacao]) if (!l.ok) erros.push(l.erro);

    let moeda: Moeda = "BRL";
    if (valor.ok && moedaColuna.ok) {
      const doTexto = valor.valor.moeda;
      const daColuna = moedaColuna.valor;
      if (doTexto && daColuna && doTexto !== daColuna) {
        erros.push(`Moeda do valor (${doTexto}) diferente da coluna Moeda (${daColuna}).`);
      }
      moeda = daColuna ?? doTexto ?? "BRL";
    }

    for (const campo of ["formaPagamento", "observacoes"] as const) {
      if (PADRAO_NUMERO_CARTAO.test(celula(campo))) {
        erros.push("Parece haver um número de cartão. Não registre números de cartão.");
      }
    }

    const centro = opcional("centro");
    if (centro && !centrosPorNome.has(normalizar(centro))) {
      centrosNovos.set(normalizar(centro), centro);
      avisos.push(`Centro de custo novo: "${centro}" será criado.`);
    }
    const centroNome = centro ? (centrosPorNome.get(normalizar(centro))?.nome ?? centro) : null;

    const categoriaTexto = celula("categoria");
    let categoriaId = outros;
    if (categoriaTexto) {
      const id = categoriasPorNome.get(normalizar(categoriaTexto));
      if (id === undefined) avisos.push(`Categoria "${categoriaTexto}" não existe; será usada "Outros".`);
      else categoriaId = id;
    }

    let existenteId: string | null = null;
    if (nome) {
      const chave = chaveFerramenta(nome, centroNome);
      const anterior = vistas.get(chave);
      if (anterior !== undefined) erros.push(`Repetida no arquivo (mesma da linha ${anterior}).`);
      else vistas.set(chave, numero);
      existenteId = existentes.get(chave) ?? null;
    }

    if (erros.length || !valor.ok || !ciclo.ok || !data.ok || !situacao.ok) {
      return { numero, status: "erro", nome, dados: null, existenteId, erros, avisos };
    }

    return {
      numero,
      status: existenteId ? "existe" : "nova",
      nome,
      existenteId,
      erros,
      avisos,
      dados: {
        nome,
        centro: centroNome,
        categoriaId,
        responsavel: opcional("responsavel"),
        contaLogin: opcional("contaLogin"),
        valor: valor.valor.valor,
        moeda,
        cicloMeses: ciclo.valor,
        proximaCobranca: data.valor,
        formaPagamento: opcional("formaPagamento"),
        situacao: situacao.valor,
        observacoes: opcional("observacoes"),
      },
    };
  });

  return {
    erroGeral: null,
    linhas,
    colunasIgnoradas,
    centrosNovos: [...centrosNovos.values()],
  };
}
