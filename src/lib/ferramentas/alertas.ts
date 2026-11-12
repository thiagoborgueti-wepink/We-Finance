import { diasEntre } from "@/lib/datas";
import type { Ferramenta } from "./tipos";

export type NivelAlerta = "critico" | "atencao" | "info" | "ok";

export type CodigoAlerta =
  | "vencida"
  | "vence_em_breve"
  | "sem_responsavel"
  | "a_cancelar"
  | "pausada"
  | "sem_data"
  | "em_dia";

export interface Alerta {
  codigo: CodigoAlerta;
  nivel: NivelAlerta;
  /** Sempre presente: o alerta não depende só da cor (acessibilidade). */
  texto: string;
}

/** Janela de "vence em breve", em dias. */
export const DIAS_ATENCAO = 7;

/**
 * Situação de vencimento de uma ferramenta, da mais grave para a mais leve:
 * pausada não cobra; depois vencida, vence em até 7 dias, sem responsável,
 * a cancelar, sem data e em dia.
 */
export function alertaDaFerramenta(
  f: Pick<Ferramenta, "situacao" | "proximaCobranca" | "responsavel">,
  hoje: string,
): Alerta {
  if (f.situacao === "pausada") {
    return { codigo: "pausada", nivel: "info", texto: "Pausada" };
  }

  if (f.proximaCobranca) {
    const dias = diasEntre(hoje, f.proximaCobranca);
    if (dias < 0) {
      const n = -dias;
      return {
        codigo: "vencida",
        nivel: "critico",
        texto: n === 1 ? "Vencida há 1 dia" : `Vencida há ${n} dias`,
      };
    }
    if (dias <= DIAS_ATENCAO) {
      const texto =
        dias === 0 ? "Vence hoje" : dias === 1 ? "Vence amanhã" : `Vence em ${dias} dias`;
      return { codigo: "vence_em_breve", nivel: "atencao", texto };
    }
  }

  if (!f.responsavel?.trim()) {
    return { codigo: "sem_responsavel", nivel: "atencao", texto: "Sem responsável" };
  }
  if (f.situacao === "a_cancelar") {
    return { codigo: "a_cancelar", nivel: "info", texto: "A cancelar" };
  }
  if (!f.proximaCobranca) {
    return { codigo: "sem_data", nivel: "info", texto: "Sem data de cobrança" };
  }
  return { codigo: "em_dia", nivel: "ok", texto: "Em dia" };
}

export function precisaAtencao(alerta: Alerta): boolean {
  return alerta.nivel === "critico" || alerta.nivel === "atencao";
}
