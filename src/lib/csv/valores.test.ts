import { describe, expect, it } from "vitest";
import { lerCiclo, lerData, lerMoeda, lerSituacao, lerValor } from "./valores";

function valor(texto: string) {
  const r = lerValor(texto);
  return r.ok ? r.valor : r.erro;
}

describe("lerValor", () => {
  it("entende reais e dólares por extenso", () => {
    expect(valor("R$ 1.800,00")).toEqual({ valor: 1800, moeda: "BRL" });
    expect(valor("US$ 36,00")).toEqual({ valor: 36, moeda: "USD" });
    expect(valor("USD 99.90")).toEqual({ valor: 99.9, moeda: "USD" });
    expect(valor("R$ 1.614,00")).toEqual({ valor: 1614, moeda: "BRL" });
  });

  it("entende números sem moeda", () => {
    expect(valor("1614")).toEqual({ valor: 1614, moeda: null });
    expect(valor("44,5")).toEqual({ valor: 44.5, moeda: null });
    expect(valor("1.800")).toEqual({ valor: 1800, moeda: null });
    expect(valor("36.00")).toEqual({ valor: 36, moeda: null });
    expect(valor("1,234.56")).toEqual({ valor: 1234.56, moeda: null });
    expect(valor("12.345.678,90")).toEqual({ valor: 12345678.9, moeda: null });
  });

  it("recusa texto livre em vez de ler pela metade", () => {
    expect(lerValor("US$ 753,71 (set/26); jun–ago entre US$ 600 e 700").ok).toBe(false);
    expect(lerValor("variável").ok).toBe(false);
    expect(lerValor("-10").ok).toBe(false);
    expect(lerValor("1.80").ok).toBe(true);
    expect(lerValor("1.8000").ok).toBe(false);
    expect(lerValor("").ok).toBe(false);
  });
});

describe("lerData", () => {
  it("aceita DD/MM/AAAA e AAAA-MM-DD", () => {
    expect(lerData("05/01/2027")).toEqual({ ok: true, valor: "2027-01-05" });
    expect(lerData("5/1/2027")).toEqual({ ok: true, valor: "2027-01-05" });
    expect(lerData("2027-01-05")).toEqual({ ok: true, valor: "2027-01-05" });
  });

  it("vazio é nulo; data impossível é erro", () => {
    expect(lerData(" ")).toEqual({ ok: true, valor: null });
    expect(lerData("31/02/2027").ok).toBe(false);
    expect(lerData("jan/27").ok).toBe(false);
  });
});

describe("lerCiclo", () => {
  it("entende rótulos, anos e meses", () => {
    expect(lerCiclo("")).toEqual({ ok: true, valor: 1 });
    expect(lerCiclo("Anual")).toEqual({ ok: true, valor: 12 });
    expect(lerCiclo("A cada 3 anos")).toEqual({ ok: true, valor: 36 });
    expect(lerCiclo("a cada 18 meses")).toEqual({ ok: true, valor: 18 });
    expect(lerCiclo("2 anos")).toEqual({ ok: true, valor: 24 });
    expect(lerCiclo("6")).toEqual({ ok: true, valor: 6 });
  });

  it("recusa fora de 1 a 60 meses ou texto estranho", () => {
    expect(lerCiclo("6 anos").ok).toBe(false);
    expect(lerCiclo("quando der").ok).toBe(false);
  });
});

describe("lerMoeda e lerSituacao", () => {
  it("moeda", () => {
    expect(lerMoeda("usd")).toEqual({ ok: true, valor: "USD" });
    expect(lerMoeda("R$")).toEqual({ ok: true, valor: "BRL" });
    expect(lerMoeda("")).toEqual({ ok: true, valor: null });
    expect(lerMoeda("EUR").ok).toBe(false);
  });

  it("situação", () => {
    expect(lerSituacao("")).toEqual({ ok: true, valor: "ativa" });
    expect(lerSituacao("A cancelar")).toEqual({ ok: true, valor: "a_cancelar" });
    expect(lerSituacao("PAUSADO")).toEqual({ ok: true, valor: "pausada" });
    expect(lerSituacao("cancelada").ok).toBe(false);
  });
});
