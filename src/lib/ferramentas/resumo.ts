import { custoMensalBRL, paraBRL } from "@/lib/custos/custo";
import { diasEntre } from "@/lib/datas";
import { alertaDaFerramenta, precisaAtencao, type Alerta } from "./alertas";
import { SEM_CENTRO, type CentroCusto, type Ferramenta } from "./tipos";

/**
 * Custo mensal em reais de uma ferramenta. Pausadas não custam; "a cancelar"
 * ainda é cobrada e entra no custo.
 */
export function custoMensalDaFerramenta(f: Ferramenta, cotacaoUSD: number): number {
  if (f.situacao === "pausada") return 0;
  return custoMensalBRL(f, cotacaoUSD);
}

export interface Resumo {
  custoMensal: number;
  custoAnual: number;
  aPagar30Dias: { valor: number; quantidade: number };
  precisamAtencao: number;
}

/** Os quatro indicadores do topo (T-005). */
export function calcularResumo(
  ferramentas: Ferramenta[],
  cotacaoUSD: number,
  hoje: string,
): Resumo {
  let custoMensal = 0;
  let aPagarValor = 0;
  let aPagarQuantidade = 0;
  let precisamAtencao = 0;

  for (const f of ferramentas) {
    custoMensal += custoMensalDaFerramenta(f, cotacaoUSD);

    if (f.situacao !== "pausada" && f.proximaCobranca) {
      const dias = diasEntre(hoje, f.proximaCobranca);
      if (dias >= 0 && dias <= 30) {
        aPagarValor += paraBRL(f.valor, f.moeda, cotacaoUSD);
        aPagarQuantidade += 1;
      }
    }

    if (precisaAtencao(alertaDaFerramenta(f, hoje))) precisamAtencao += 1;
  }

  return {
    custoMensal,
    custoAnual: custoMensal * 12,
    aPagar30Dias: { valor: aPagarValor, quantidade: aPagarQuantidade },
    precisamAtencao,
  };
}

export type NivelOrcamento = "ok" | "alerta" | "estourado";

export interface ConsumoOrcamento {
  /** 0 a 100+ */
  percentual: number;
  nivel: NivelOrcamento;
}

/** Consumo do orçamento mensal (T-010): alerta a partir de 80%, estourado acima de 100%. */
export function consumoOrcamento(
  custoMensal: number,
  orcamentoMensal: number | null,
): ConsumoOrcamento | null {
  if (orcamentoMensal === null || orcamentoMensal <= 0) return null;
  const percentual = (custoMensal / orcamentoMensal) * 100;
  const nivel: NivelOrcamento = percentual > 100 ? "estourado" : percentual >= 80 ? "alerta" : "ok";
  return { percentual, nivel };
}

export interface CustoDoCentro {
  /** Nulo = ferramentas sem centro de custo. */
  centroId: string | null;
  nome: string;
  custoMensal: number;
  quantidade: number;
  orcamentoMensal: number | null;
  consumo: ConsumoOrcamento | null;
}

/**
 * Custo mensal por centro (T-004), do maior para o menor. Inclui centros sem
 * ferramentas e, se houver, a linha "Sem centro de custo".
 * A soma de custoMensal é igual ao custo mensal do resumo.
 */
export function custoPorCentro(
  ferramentas: Ferramenta[],
  centros: CentroCusto[],
  cotacaoUSD: number,
): CustoDoCentro[] {
  const porId = new Map<string | null, { custo: number; quantidade: number }>();
  for (const c of centros) porId.set(c.id, { custo: 0, quantidade: 0 });

  for (const f of ferramentas) {
    const chave = f.centroCustoId !== null && porId.has(f.centroCustoId) ? f.centroCustoId : null;
    const atual = porId.get(chave) ?? { custo: 0, quantidade: 0 };
    atual.custo += custoMensalDaFerramenta(f, cotacaoUSD);
    atual.quantidade += 1;
    porId.set(chave, atual);
  }

  const linhas: CustoDoCentro[] = [];
  for (const [centroId, { custo, quantidade }] of porId) {
    const centro = centros.find((c) => c.id === centroId);
    const orcamentoMensal = centro?.orcamentoMensal ?? null;
    linhas.push({
      centroId,
      nome: centro?.nome ?? SEM_CENTRO,
      custoMensal: custo,
      quantidade,
      orcamentoMensal,
      consumo: consumoOrcamento(custo, orcamentoMensal),
    });
  }

  return linhas.sort((a, b) => b.custoMensal - a.custoMensal || a.nome.localeCompare(b.nome, "pt-BR"));
}

export interface Vencimento {
  ferramenta: Ferramenta;
  alerta: Alerta;
  dias: number;
}

/**
 * Cobranças vencidas e as dos próximos `janela` dias (T-006), por data.
 * Pausadas ficam de fora.
 */
export function proximosVencimentos(
  ferramentas: Ferramenta[],
  hoje: string,
  janela = 60,
): Vencimento[] {
  return ferramentas
    .filter((f) => f.situacao !== "pausada" && f.proximaCobranca)
    .map((f) => ({
      ferramenta: f,
      alerta: alertaDaFerramenta(f, hoje),
      dias: diasEntre(hoje, f.proximaCobranca as string),
    }))
    .filter((v) => v.dias <= janela)
    .sort((a, b) => a.dias - b.dias || a.ferramenta.nome.localeCompare(b.ferramenta.nome, "pt-BR"));
}
