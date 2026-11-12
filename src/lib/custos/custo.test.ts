import { describe, expect, it } from "vitest";
import { custoMensalBRL, formatarBRL, paraBRL, rotuloCiclo } from "./custo";

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
    expect(custoMensalBRL({ valor: 44, moeda: "USD", cicloMeses: 1 }, 5)).toBeCloseTo(220);
  });

  it("cobrança anual vira 1/12 por mês", () => {
    expect(custoMensalBRL({ valor: 99, moeda: "USD", cicloMeses: 12 }, 6)).toBeCloseTo(49.5);
  });

  it("certificado de 3 anos vira 1/36 por mês", () => {
    expect(custoMensalBRL({ valor: 1614, moeda: "BRL", cicloMeses: 36 }, 5.5)).toBeCloseTo(44.83, 2);
  });

  it("plano gratuito custa zero", () => {
    expect(custoMensalBRL({ valor: 0, moeda: "USD", cicloMeses: 1 }, 5.5)).toBe(0);
  });

  it("recusa ciclo fora de 1 a 60 meses", () => {
    expect(() => custoMensalBRL({ valor: 10, moeda: "BRL", cicloMeses: 0 }, 5)).toThrow(RangeError);
    expect(() => custoMensalBRL({ valor: 10, moeda: "BRL", cicloMeses: 61 }, 5)).toThrow(RangeError);
    expect(() => custoMensalBRL({ valor: 10, moeda: "BRL", cicloMeses: 1.5 }, 5)).toThrow(RangeError);
  });
});

describe("rotuloCiclo", () => {
  it("nomeia ciclos comuns", () => {
    expect(rotuloCiclo(1)).toBe("Mensal");
    expect(rotuloCiclo(12)).toBe("Anual");
    expect(rotuloCiclo(36)).toBe("A cada 3 anos");
  });

  it("descreve ciclos incomuns em meses", () => {
    expect(rotuloCiclo(18)).toBe("A cada 18 meses");
  });
});

describe("formatarBRL", () => {
  it("usa o padrão brasileiro", () => {
    // O Intl usa espaço não separável entre "R$" e o número.
    expect(formatarBRL(1234.5).replace(/\s/g, " ")).toBe("R$ 1.234,50");
  });
});
