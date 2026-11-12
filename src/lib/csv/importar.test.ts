import { describe, expect, it } from "vitest";
import type { Categoria, CentroCusto, Ferramenta } from "@/lib/ferramentas/tipos";
import { gerarCsv, gerarModeloCsv } from "./exportar";
import { LIMITE_LINHAS, analisarCsv, type ContextoImportacao } from "./importar";

const categorias: Categoria[] = [
  { id: 1, nome: "Infra e deploy", ordem: 1 },
  { id: 7, nome: "Outros", ordem: 99 },
];
const centros: CentroCusto[] = [{ id: "c-produto", nome: "Produto", orcamentoMensal: null }];
const contexto: ContextoImportacao = {
  categorias,
  centros,
  ferramentas: [{ id: "f-1", nome: "Exemplo Cloud", centroCustoId: "c-produto" }],
};

describe("analisarCsv", () => {
  it("lê ponto e vírgula com BOM e marca nova, existe e erro", () => {
    const csv =
      "﻿Ferramenta;Centro de custo;Valor;Ciclo;Próxima cobrança\n" +
      "Exemplo Cloud;produto;US$ 40,00;Mensal;20/11/2026\n" +
      "Outra;Marketing;R$ 1.800,00;Anual;\n" +
      'Ruim;Produto;"US$ 753,71 (set/26); jun–ago";Mensal;\n';
    const r = analisarCsv(csv, contexto);

    expect(r.erroGeral).toBeNull();
    expect(r.linhas.map((l) => l.status)).toEqual(["existe", "nova", "erro"]);
    expect(r.linhas[0].existenteId).toBe("f-1");
    expect(r.linhas[0].dados).toMatchObject({ valor: 40, moeda: "USD", centro: "Produto", categoriaId: 7 });
    expect(r.linhas[1].dados).toMatchObject({ valor: 1800, moeda: "BRL", cicloMeses: 12 });
    expect(r.linhas[2].numero).toBe(4);
    expect(r.centrosNovos).toEqual(["Marketing"]);
  });

  it("aceita vírgula e tab como separador", () => {
    expect(analisarCsv('Ferramenta,Valor\nA,"10,00"\n', contexto).linhas[0].dados?.valor).toBe(10);
    expect(analisarCsv("Ferramenta\tValor\nA\t10\n", contexto).linhas[0].dados?.valor).toBe(10);
  });

  it("exige as colunas Ferramenta e Valor", () => {
    expect(analisarCsv("Nome do app;Preço\nA;1\n", contexto).erroGeral).toMatch(/Ferramenta e Valor/);
  });

  it("limita a quantidade de linhas", () => {
    const csv = "Ferramenta;Valor\n" + Array.from({ length: LIMITE_LINHAS + 1 }, (_, i) => `F${i};1`).join("\n");
    expect(analisarCsv(csv, contexto).erroGeral).toMatch(/limite é 500/);
  });

  it("recusa número de cartão e linha repetida", () => {
    const csv =
      "Ferramenta;Valor;Forma de pagamento\n" +
      "A;1;Cartão 4111 1111 1111 1111\n" +
      "B;1;Boleto\n" +
      "b;2;Pix\n";
    const r = analisarCsv(csv, contexto);
    expect(r.linhas[0].erros.join()).toMatch(/cartão/);
    expect(r.linhas[2].erros.join()).toMatch(/linha 3/);
  });

  it("aponta conflito entre o símbolo do valor e a coluna Moeda", () => {
    const r = analisarCsv("Ferramenta;Valor;Moeda\nA;US$ 10;BRL\n", contexto);
    expect(r.linhas[0].status).toBe("erro");
  });

  it("o modelo para download é aceito, com a linha de exemplo", () => {
    const r = analisarCsv(gerarModeloCsv(), { ...contexto, ferramentas: [] });
    expect(r.erroGeral).toBeNull();
    expect(r.linhas[0]).toMatchObject({ status: "nova" });
  });
});

describe("exportação e reimportação", () => {
  const ferramentas: Ferramenta[] = [
    {
      id: "f-1",
      nome: "Certificado SSL",
      centroCustoId: "c-produto",
      categoriaId: 1,
      responsavel: "Financeiro",
      contaLogin: "contas@example.com",
      valor: 1614,
      moeda: "BRL",
      cicloMeses: 36,
      proximaCobranca: "2027-05-10",
      formaPagamento: "Boleto",
      situacao: "a_cancelar",
      observacoes: "Renovar; avaliar \"outro\" fornecedor",
    },
    {
      id: "f-2",
      nome: "=Ferramenta estranha",
      centroCustoId: null,
      categoriaId: 7,
      responsavel: null,
      contaLogin: null,
      valor: 1234.5,
      moeda: "USD",
      cicloMeses: 18,
      proximaCobranca: null,
      formaPagamento: null,
      situacao: "pausada",
      observacoes: null,
    },
  ];

  const csv = gerarCsv(ferramentas, centros, categorias, 5);

  it("gera UTF-8 com BOM, ponto e vírgula e custo mensal", () => {
    expect(csv.startsWith("﻿Ferramenta;Centro de custo;")).toBe(true);
    expect(csv).toContain("Custo mensal (BRL)");
    expect(csv).toContain("1.614,00;BRL;A cada 3 anos;10/05/2027");
    expect(csv).toContain("'=Ferramenta estranha");
  });

  it("reimporta sem ajuste e com os mesmos dados", () => {
    const r = analisarCsv(csv, { categorias, centros, ferramentas: [] });
    expect(r.erroGeral).toBeNull();
    expect(r.colunasIgnoradas).toEqual(["Custo mensal (BRL)"]);
    expect(r.linhas.map((l) => l.status)).toEqual(["nova", "nova"]);
    expect(r.linhas[0].dados).toEqual({
      nome: "Certificado SSL",
      centro: "Produto",
      categoriaId: 1,
      responsavel: "Financeiro",
      contaLogin: "contas@example.com",
      valor: 1614,
      moeda: "BRL",
      cicloMeses: 36,
      proximaCobranca: "2027-05-10",
      formaPagamento: "Boleto",
      situacao: "a_cancelar",
      observacoes: 'Renovar; avaliar "outro" fornecedor',
    });
    expect(r.linhas[1].dados).toMatchObject({
      nome: "=Ferramenta estranha",
      centro: null,
      valor: 1234.5,
      moeda: "USD",
      cicloMeses: 18,
      situacao: "pausada",
    });
  });
});
