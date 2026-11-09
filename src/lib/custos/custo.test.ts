import { describe, expect, it } from "vitest";
import { custoMensalBRL, formatarBRL, paraBRL } from "./custo";

describe("paraBRL", () => {
  it("mantém valores em reais", () => {
    expect(paraBRL(110, "BRL", 5.5)).toBe(110);
  });

  it("converte dólar pela cotação", () => {
    expect(paraBRL(36, "USD", 5.5)).toBeCloseTo(198);
  });

  it("recusa valor negativo", () => {
    expect(() => paraBRL(-1, "BRL", 5.5)).toThrow(RangeError);
  });

  it("recusa cotação zerada para dólar", () => {
    expect(() => paraBRL(10, "USD", 0)).toThrow(RangeError);
  });
});

describe("custoMensalBRL", () => {
  it("cobrança mensal em dólar", () => {
    expect(custoMensalBRL({ valor: 44, moeda: "USD", ciclo: "mensal" }, 5)).toBeCloseTo(220);
  });

  it("cobrança anual vira 1/12 por mês", () => {
    expect(custoMensalBRL({ valor: 99, moeda: "USD", ciclo: "anual" }, 6)).toBeCloseTo(49.5);
  });

  it("plano gratuito custa zero", () => {
    expect(custoMensalBRL({ valor: 0, moeda: "USD", ciclo: "mensal" }, 5.5)).toBe(0);
  });
});

describe("formatarBRL", () => {
  it("usa o padrão brasileiro", () => {
    // O Intl usa espaço não separável entre "R$" e o número.
    expect(formatarBRL(1234.5).replace(/\s/g, " ")).toBe("R$ 1.234,50");
  });
});
