/**
 * Leitura de células de planilha em português: valores "R$ 1.800,00" ou
 * "US$ 36,00", datas DD/MM/AAAA ou AAAA-MM-DD, ciclos e situações por extenso.
 * Texto livre ("US$ 753,71 (set/26); jun–ago...") é recusado, nunca lido pela metade.
 */

import { CICLOS_COMUNS, type Moeda } from "@/lib/custos/custo";
import { dataISOValida } from "@/lib/datas";
import { normalizar, type Situacao } from "@/lib/ferramentas/tipos";

export type Leitura<T> = { ok: true; valor: T } | { ok: false; erro: string };

const ok = <T>(valor: T): Leitura<T> => ({ ok: true, valor });
const falha = <T>(erro: string): Leitura<T> => ({ ok: false, erro });

export interface ValorLido {
  valor: number;
  /** Moeda indicada no próprio texto (R$, US$), se houver. */
  moeda: Moeda | null;
}

export function lerValor(texto: string): Leitura<ValorLido> {
  const original = texto.trim();
  if (!original) return falha("Valor vazio.");

  let t = original.replace(/ /g, " ");
  let moeda: Moeda | null = null;

  const usd = /^(US\$|U\$|USD)\s*|\s*USD$/i;
  const brl = /^(R\$|BRL)\s*|\s*BRL$/i;
  if (usd.test(t)) {
    moeda = "USD";
    t = t.replace(usd, "");
  } else if (brl.test(t)) {
    moeda = "BRL";
    t = t.replace(brl, "");
  }
  t = t.replace(/\s/g, "");

  if (!/^\d[\d.,]*$/.test(t)) return falha(`Valor não reconhecido: "${original}".`);

  const ultimoPonto = t.lastIndexOf(".");
  const ultimaVirgula = t.lastIndexOf(",");
  let numero: string;

  if (ultimoPonto >= 0 && ultimaVirgula >= 0) {
    // Os dois aparecem: o último é o separador decimal.
    const decimal = ultimoPonto > ultimaVirgula ? "." : ",";
    const milhar = decimal === "." ? "," : ".";
    const [inteiro, frac, ...resto] = t.split(decimal);
    if (resto.length || frac === undefined) return falha(`Valor não reconhecido: "${original}".`);
    const grupos = inteiro.split(milhar);
    if (!/^\d{1,3}$/.test(grupos[0]) || grupos.slice(1).some((g) => !/^\d{3}$/.test(g))) {
      return falha(`Valor não reconhecido: "${original}".`);
    }
    if (!/^\d{1,2}$/.test(frac)) return falha(`Valor não reconhecido: "${original}".`);
    numero = `${grupos.join("")}.${frac}`;
  } else if (ultimaVirgula >= 0) {
    // Só vírgula: decimal no padrão brasileiro.
    if (!/^\d+,\d{1,2}$/.test(t)) return falha(`Valor não reconhecido: "${original}".`);
    numero = t.replace(",", ".");
  } else if (ultimoPonto >= 0) {
    // Só ponto: "1.800" é milhar; "36.5" e "36.00" são decimais.
    if (/^\d{1,3}(\.\d{3})+$/.test(t)) numero = t.replace(/\./g, "");
    else if (/^\d+\.\d{1,2}$/.test(t)) numero = t;
    else return falha(`Valor não reconhecido: "${original}".`);
  } else {
    numero = t;
  }

  const valor = Number(numero);
  if (!Number.isFinite(valor)) return falha(`Valor não reconhecido: "${original}".`);
  if (valor > 9_999_999_999.99) return falha("Valor alto demais.");
  return ok({ valor, moeda });
}

export function lerMoeda(texto: string): Leitura<Moeda | null> {
  const t = normalizar(texto);
  if (!t) return ok(null);
  if (["brl", "r$", "real", "reais"].includes(t)) return ok("BRL");
  if (["usd", "us$", "u$", "dolar", "dolares"].includes(t)) return ok("USD");
  return falha(`Moeda não reconhecida: "${texto.trim()}". Use BRL ou USD.`);
}

/** Data DD/MM/AAAA ou AAAA-MM-DD para AAAA-MM-DD. Vazio vira nulo. */
export function lerData(texto: string): Leitura<string | null> {
  const t = texto.trim();
  if (!t) return ok(null);

  let iso: string | null = null;
  const br = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(t);
  if (br) iso = `${br[3]}-${br[2].padStart(2, "0")}-${br[1].padStart(2, "0")}`;
  else if (/^\d{4}-\d{2}-\d{2}$/.test(t)) iso = t;

  if (!iso || !dataISOValida(iso)) {
    return falha(`Data não reconhecida: "${t}". Use DD/MM/AAAA.`);
  }
  return ok(iso);
}

/** Ciclo por extenso ("Anual", "A cada 3 anos", "18 meses") ou número de meses. Vazio = mensal. */
export function lerCiclo(texto: string): Leitura<number> {
  const t = normalizar(texto);
  if (!t) return ok(1);

  let meses: number | null = null;
  const comum = CICLOS_COMUNS.find((c) => normalizar(c.rotulo) === t);
  const sinonimos: Record<string, number> = { mes: 1, mensalidade: 1, bimestral: 2, bienal: 24, trienal: 36 };

  if (comum) meses = comum.meses;
  else if (t in sinonimos) meses = sinonimos[t];
  else {
    const m = /^(?:a cada )?(\d{1,2}) (mes|meses|ano|anos)$/.exec(t);
    if (m) meses = Number(m[1]) * (m[2].startsWith("ano") ? 12 : 1);
    else if (/^\d{1,2}$/.test(t)) meses = Number(t);
  }

  if (meses === null) return falha(`Ciclo não reconhecido: "${texto.trim()}".`);
  if (meses < 1 || meses > 60) return falha("O ciclo deve ficar entre 1 e 60 meses.");
  return ok(meses);
}

export function lerSituacao(texto: string): Leitura<Situacao> {
  const t = normalizar(texto).replace(/_/g, " ");
  if (!t || t === "ativa" || t === "ativo") return ok("ativa");
  if (t === "a cancelar" || t === "cancelar") return ok("a_cancelar");
  if (t === "pausada" || t === "pausado") return ok("pausada");
  return falha(`Situação não reconhecida: "${texto.trim()}". Use Ativa, A cancelar ou Pausada.`);
}

/** Valor sem símbolo no padrão brasileiro (1.800,00), que a importação lê de volta. */
export function formatarValorPlanilha(valor: number): string {
  return valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
