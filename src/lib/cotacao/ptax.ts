/**
 * Cotação PTAX de venda do dólar, do Banco Central (T-011). Serviço público,
 * sem chave de API: https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/
 */

import { somarDias } from "@/lib/datas";

const BASE =
  "https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/" +
  "CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)";

/** MM-DD-AAAA, formato pedido pela API do BCB. */
function formatoBCB(iso: string): string {
  const [a, m, d] = iso.split("-");
  return `${m}-${d}-${a}`;
}

/** URL das cotações dos últimos 10 dias (cobre fim de semana e feriado). */
export function urlPtax(hoje: string): string {
  const params = new URLSearchParams({
    "@dataInicial": `'${formatoBCB(somarDias(hoje, -10))}'`,
    "@dataFinalCotacao": `'${formatoBCB(hoje)}'`,
    $format: "json",
    $select: "cotacaoVenda,dataHoraCotacao",
  });
  return `${BASE}?${params.toString()}`;
}

export interface CotacaoPtax {
  valor: number;
  /** AAAA-MM-DD do boletim. */
  dataReferencia: string;
}

/** Cotação mais recente da resposta da API, ou nulo se vier vazia ou estranha. */
export function lerRespostaPtax(json: unknown): CotacaoPtax | null {
  const valores = (json as { value?: unknown })?.value;
  if (!Array.isArray(valores)) return null;

  let melhor: CotacaoPtax | null = null;
  for (const item of valores) {
    const valor = (item as { cotacaoVenda?: unknown }).cotacaoVenda;
    const dataHora = (item as { dataHoraCotacao?: unknown }).dataHoraCotacao;
    if (typeof valor !== "number" || !(valor > 0 && valor < 100)) continue;
    if (typeof dataHora !== "string" || !/^\d{4}-\d{2}-\d{2}/.test(dataHora)) continue;
    const dataReferencia = dataHora.slice(0, 10);
    if (!melhor || dataReferencia >= melhor.dataReferencia) melhor = { valor, dataReferencia };
  }
  return melhor;
}

/** Busca a PTAX; devolve nulo em qualquer falha (rede, tempo, formato). */
export async function buscarPtax(hoje: string, tempoLimiteMs = 4000): Promise<CotacaoPtax | null> {
  try {
    const resposta = await fetch(urlPtax(hoje), {
      signal: AbortSignal.timeout(tempoLimiteMs),
      headers: { accept: "application/json" },
      cache: "no-store",
    });
    if (!resposta.ok) return null;
    return lerRespostaPtax(await resposta.json());
  } catch {
    return null;
  }
}
