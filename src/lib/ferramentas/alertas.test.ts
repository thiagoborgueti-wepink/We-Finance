import { describe, expect, it } from "vitest";
import { alertaDaFerramenta, precisaAtencao } from "./alertas";

const hoje = "2026-11-12";
const base = { situacao: "ativa" as const, responsavel: "Financeiro", proximaCobranca: "2027-01-10" };

describe("alertaDaFerramenta", () => {
  it("cobrança no passado é vencida e crítica", () => {
    const a = alertaDaFerramenta({ ...base, proximaCobranca: "2026-11-09" }, hoje);
    expect(a).toMatchObject({ codigo: "vencida", nivel: "critico", texto: "Vencida há 3 dias" });
  });

  it("singular para um dia de atraso", () => {
    expect(alertaDaFerramenta({ ...base, proximaCobranca: "2026-11-11" }, hoje).texto).toBe(
      "Vencida há 1 dia",
    );
  });

  it("vence hoje, amanhã e em até 7 dias", () => {
    expect(alertaDaFerramenta({ ...base, proximaCobranca: hoje }, hoje).texto).toBe("Vence hoje");
    expect(alertaDaFerramenta({ ...base, proximaCobranca: "2026-11-13" }, hoje).texto).toBe(
      "Vence amanhã",
    );
    expect(alertaDaFerramenta({ ...base, proximaCobranca: "2026-11-19" }, hoje)).toMatchObject({
      codigo: "vence_em_breve",
      texto: "Vence em 7 dias",
    });
  });

  it("8 dias já está em dia", () => {
    expect(alertaDaFerramenta({ ...base, proximaCobranca: "2026-11-20" }, hoje).codigo).toBe("em_dia");
  });

  it("pausada não alerta vencimento", () => {
    const a = alertaDaFerramenta({ ...base, situacao: "pausada", proximaCobranca: "2026-01-01" }, hoje);
    expect(a.codigo).toBe("pausada");
    expect(precisaAtencao(a)).toBe(false);
  });

  it("sem responsável pede atenção", () => {
    const a = alertaDaFerramenta({ ...base, responsavel: "  " }, hoje);
    expect(a.codigo).toBe("sem_responsavel");
    expect(precisaAtencao(a)).toBe(true);
  });

  it("vencida tem prioridade sobre a cancelar", () => {
    const a = alertaDaFerramenta({ ...base, situacao: "a_cancelar", proximaCobranca: "2026-11-01" }, hoje);
    expect(a.codigo).toBe("vencida");
    expect(alertaDaFerramenta({ ...base, situacao: "a_cancelar" }, hoje).codigo).toBe("a_cancelar");
  });

  it("sem data de cobrança", () => {
    expect(alertaDaFerramenta({ ...base, proximaCobranca: null }, hoje).codigo).toBe("sem_data");
  });
});
