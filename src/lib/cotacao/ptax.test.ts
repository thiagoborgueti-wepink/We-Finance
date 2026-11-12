import { describe, expect, it } from "vitest";
import { lerRespostaPtax, urlPtax } from "./ptax";

describe("urlPtax", () => {
  it("pede os últimos 10 dias no formato do BCB", () => {
    const url = decodeURIComponent(urlPtax("2026-11-12"));
    expect(url).toContain("@dataInicial='11-02-2026'");
    expect(url).toContain("@dataFinalCotacao='11-12-2026'");
  });
});

describe("lerRespostaPtax", () => {
  it("pega a cotação mais recente", () => {
    const r = lerRespostaPtax({
      value: [
        { cotacaoVenda: 5.41, dataHoraCotacao: "2026-11-10 13:05:00.000" },
        { cotacaoVenda: 5.43, dataHoraCotacao: "2026-11-11 13:04:00.000" },
      ],
    });
    expect(r).toEqual({ valor: 5.43, dataReferencia: "2026-11-11" });
  });

  it("devolve nulo para resposta vazia ou estranha", () => {
    expect(lerRespostaPtax({ value: [] })).toBeNull();
    expect(lerRespostaPtax({ erro: "x" })).toBeNull();
    expect(lerRespostaPtax({ value: [{ cotacaoVenda: "5", dataHoraCotacao: "x" }] })).toBeNull();
  });
});
