import { describe, expect, it } from "vitest";
import { lerCotacaoManual, validarCentro, validarFerramenta } from "./formulario";

const valido = {
  nome: "  Exemplo Cloud ",
  centroCustoId: "3f1c9a7e-2b4d-4e6f-8a1b-0c2d3e4f5a6b",
  categoriaId: "1",
  responsavel: "Maria",
  contaLogin: "",
  valor: "1.800,00",
  moeda: "USD",
  cicloMeses: "12",
  proximaCobranca: "2027-01-15",
  formaPagamento: "Cartão corporativo final 1234",
  situacao: "ativa",
  observacoes: "",
};

describe("validarFerramenta", () => {
  it("normaliza um formulário válido", () => {
    const r = validarFerramenta(valido);
    expect(r).toEqual({
      ok: true,
      dados: {
        nome: "Exemplo Cloud",
        centroCustoId: valido.centroCustoId,
        categoriaId: 1,
        responsavel: "Maria",
        contaLogin: null,
        valor: 1800,
        moeda: "USD",
        cicloMeses: 12,
        proximaCobranca: "2027-01-15",
        formaPagamento: "Cartão corporativo final 1234",
        situacao: "ativa",
        observacoes: null,
      },
    });
  });

  it("sem centro e sem data viram nulo", () => {
    const r = validarFerramenta({ ...valido, centroCustoId: "", proximaCobranca: "" });
    expect(r.ok && r.dados.centroCustoId).toBeNull();
    expect(r.ok && r.dados.proximaCobranca).toBeNull();
  });

  it("aponta o erro em cada campo", () => {
    const r = validarFerramenta({
      ...valido,
      nome: "",
      valor: "caro",
      cicloMeses: "0",
      situacao: "cancelada",
      formaPagamento: "4111 1111 1111 1111",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(Object.keys(r.erros).sort()).toEqual(
        ["cicloMeses", "formaPagamento", "nome", "situacao", "valor"].sort(),
      );
    }
  });
});

describe("validarCentro", () => {
  it("orçamento opcional em reais", () => {
    expect(validarCentro({ nome: "APP", orcamentoMensal: "" })).toEqual({
      ok: true,
      dados: { nome: "APP", orcamentoMensal: null },
    });
    expect(validarCentro({ nome: "APP", orcamentoMensal: "5.000,00" })).toEqual({
      ok: true,
      dados: { nome: "APP", orcamentoMensal: 5000 },
    });
    expect(validarCentro({ nome: "APP", orcamentoMensal: "US$ 10" }).ok).toBe(false);
  });
});

describe("lerCotacaoManual", () => {
  it("aceita vírgula ou ponto", () => {
    expect(lerCotacaoManual("5,43")).toBe(5.43);
    expect(lerCotacaoManual("5.4321")).toBe(5.4321);
    expect(lerCotacaoManual("0")).toBeNull();
    expect(lerCotacaoManual("abc")).toBeNull();
  });
});
