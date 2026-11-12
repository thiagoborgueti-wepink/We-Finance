import { describe, expect, it } from "vitest";
import {
  calcularResumo,
  consumoOrcamento,
  custoMensalDaFerramenta,
  custoPorCentro,
  proximosVencimentos,
} from "./resumo";
import { SEM_CENTRO, type CentroCusto, type Ferramenta } from "./tipos";

const hoje = "2026-11-12";
const cotacao = 5;

function ferramenta(parcial: Partial<Ferramenta> & { nome: string }): Ferramenta {
  return {
    id: parcial.nome,
    centroCustoId: null,
    categoriaId: 1,
    responsavel: "Financeiro",
    contaLogin: null,
    valor: 100,
    moeda: "BRL",
    cicloMeses: 1,
    proximaCobranca: null,
    formaPagamento: null,
    situacao: "ativa",
    observacoes: null,
    ...parcial,
  };
}

const centros: CentroCusto[] = [
  { id: "c-produto", nome: "Produto", orcamentoMensal: 500 },
  { id: "c-mkt", nome: "Marketing", orcamentoMensal: null },
  { id: "c-vazio", nome: "Jurídico", orcamentoMensal: 100 },
];

const lista: Ferramenta[] = [
  ferramenta({ nome: "Nuvem", centroCustoId: "c-produto", valor: 40, moeda: "USD", proximaCobranca: "2026-11-20" }),
  ferramenta({ nome: "Certificado", centroCustoId: "c-produto", valor: 360, cicloMeses: 36, proximaCobranca: "2026-11-01" }),
  ferramenta({ nome: "Design", centroCustoId: "c-mkt", valor: 120, cicloMeses: 12, proximaCobranca: "2027-03-01" }),
  ferramenta({ nome: "Pausada", centroCustoId: "c-mkt", valor: 999, situacao: "pausada", proximaCobranca: "2026-11-15" }),
  ferramenta({ nome: "Avulsa", valor: 50, situacao: "a_cancelar", responsavel: null, proximaCobranca: "2026-12-05" }),
];

describe("custoMensalDaFerramenta", () => {
  it("pausada custa zero; a cancelar ainda custa", () => {
    expect(custoMensalDaFerramenta(lista[3], cotacao)).toBe(0);
    expect(custoMensalDaFerramenta(lista[4], cotacao)).toBe(50);
  });
});

describe("calcularResumo", () => {
  const r = calcularResumo(lista, cotacao, hoje);

  it("soma o custo mensal sem as pausadas", () => {
    // 40 USD * 5 = 200; 360/36 = 10; 120/12 = 10; avulsa 50
    expect(r.custoMensal).toBeCloseTo(270);
    expect(r.custoAnual).toBeCloseTo(3240);
  });

  it("a pagar em 30 dias usa o valor cheio da cobrança e ignora vencidas e pausadas", () => {
    // Nuvem (20/11) 200 + Avulsa (05/12) 50
    expect(r.aPagar30Dias).toEqual({ valor: 250, quantidade: 2 });
  });

  it("conta quem precisa de atenção", () => {
    // Certificado vencido + Avulsa sem responsável
    expect(r.precisamAtencao).toBe(2);
  });
});

describe("custoPorCentro", () => {
  const linhas = custoPorCentro(lista, centros, cotacao);

  it("soma dos centros bate com o total", () => {
    const soma = linhas.reduce((s, l) => s + l.custoMensal, 0);
    expect(soma).toBeCloseTo(calcularResumo(lista, cotacao, hoje).custoMensal);
  });

  it("inclui sem centro e centros vazios, do maior para o menor", () => {
    expect(linhas.map((l) => l.nome)).toEqual(["Produto", SEM_CENTRO, "Marketing", "Jurídico"]);
    expect(linhas.find((l) => l.nome === "Jurídico")?.quantidade).toBe(0);
  });

  it("calcula o consumo só de quem tem orçamento", () => {
    const produto = linhas.find((l) => l.centroId === "c-produto");
    expect(produto?.consumo?.percentual).toBeCloseTo(42);
    expect(linhas.find((l) => l.centroId === "c-mkt")?.consumo).toBeNull();
  });
});

describe("consumoOrcamento", () => {
  it("níveis em 80% e acima de 100%", () => {
    expect(consumoOrcamento(79, 100)?.nivel).toBe("ok");
    expect(consumoOrcamento(80, 100)?.nivel).toBe("alerta");
    expect(consumoOrcamento(100, 100)?.nivel).toBe("alerta");
    expect(consumoOrcamento(101, 100)?.nivel).toBe("estourado");
  });

  it("sem orçamento não gera alerta", () => {
    expect(consumoOrcamento(1000, null)).toBeNull();
    expect(consumoOrcamento(1000, 0)).toBeNull();
  });
});

describe("proximosVencimentos", () => {
  it("mostra vencidas primeiro, ignora pausadas e o que passa de 60 dias", () => {
    const v = proximosVencimentos(lista, hoje);
    expect(v.map((x) => x.ferramenta.nome)).toEqual(["Certificado", "Nuvem", "Avulsa"]);
    expect(v[0].dias).toBe(-11);
  });
});
