"use client";

import { useCallback, useMemo, useState } from "react";
import { gerarCsv } from "@/lib/csv/exportar";
import type { DadosPainel } from "@/lib/ferramentas/dados";
import { calcularResumo, custoPorCentro, proximosVencimentos } from "@/lib/ferramentas/resumo";
import { SEM_CENTRO, type Ferramenta } from "@/lib/ferramentas/tipos";
import { Botao, Modal, estiloCampo } from "../_ui/ui";
import { baixarArquivo } from "./baixar";
import { GerenciarCentros } from "./centros";
import { Cotacao } from "./cotacao";
import { CustoPorCentro, chaveCentro, type FiltroCentro } from "./custo-por-centro";
import { FormFerramenta } from "./form-ferramenta";
import { Historico } from "./historico";
import { ImportarCsv } from "./importar";
import { CartoesResumo } from "./resumo";
import { TabelaFerramentas } from "./tabela-ferramentas";
import { Vencimentos } from "./vencimentos";

type Janela =
  | { tipo: "nenhuma" }
  | { tipo: "ferramenta"; ferramenta: Ferramenta | null; chave: number }
  | { tipo: "historico"; ferramenta: Ferramenta }
  | { tipo: "centros" }
  | { tipo: "importar"; chave: number };

/** Painel principal: filtros, resumo, centros, vencimentos e cadastro. */
export function Painel({ dados }: { dados: DadosPainel }) {
  const { ferramentas, centros, categorias, cotacao, hoje } = dados;
  const [filtroCentro, setFiltroCentro] = useState<FiltroCentro>("todos");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [janela, setJanela] = useState<Janela>({ tipo: "nenhuma" });
  const fechar = useCallback(() => setJanela({ tipo: "nenhuma" }), []);

  // Centro excluído some do filtro em vez de esconder tudo.
  const filtroValido =
    filtroCentro === "todos" || filtroCentro === "sem" || centros.some((c) => c.id === filtroCentro)
      ? filtroCentro
      : "todos";

  const doCentro = useMemo(
    () =>
      filtroValido === "todos"
        ? ferramentas
        : ferramentas.filter((f) => chaveCentro(f.centroCustoId) === filtroValido),
    [ferramentas, filtroValido],
  );
  const naTabela = useMemo(
    () => (filtroCategoria === "todas" ? doCentro : doCentro.filter((f) => String(f.categoriaId) === filtroCategoria)),
    [doCentro, filtroCategoria],
  );

  const resumo = useMemo(() => calcularResumo(doCentro, cotacao.valor, hoje), [doCentro, cotacao.valor, hoje]);
  const porCentro = useMemo(() => custoPorCentro(ferramentas, centros, cotacao.valor), [ferramentas, centros, cotacao.valor]);
  const vencimentos = useMemo(() => proximosVencimentos(doCentro, hoje), [doCentro, hoje]);

  const nomeDoCentro = useCallback(
    (id: string | null) => (id ? (centros.find((c) => c.id === id)?.nome ?? SEM_CENTRO) : SEM_CENTRO),
    [centros],
  );
  const contextoImportacao = useMemo(
    () => ({
      ferramentas: ferramentas.map((f) => ({ id: f.id, nome: f.nome, centroCustoId: f.centroCustoId })),
      centros,
      categorias,
    }),
    [ferramentas, centros, categorias],
  );

  function exportar(lista: Ferramenta[], sufixo: string) {
    const csv = gerarCsv(lista, centros, categorias, cotacao.valor);
    baixarArquivo(csv, `we-finance-ferramentas${sufixo}-${hoje}.csv`);
  }
  const rotuloFiltro = filtroValido === "todos" ? null : nomeDoCentro(filtroValido === "sem" ? null : filtroValido);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <label htmlFor="filtro-centro" className="text-xs font-medium text-foreground/60">
            Centro de custo
          </label>
          <select
            id="filtro-centro"
            value={filtroValido}
            onChange={(e) => setFiltroCentro(e.target.value)}
            className={`${estiloCampo} sm:w-64`}
          >
            <option value="todos">Todos os centros</option>
            {centros.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
            <option value="sem">{SEM_CENTRO}</option>
          </select>
        </div>
        <Cotacao cotacao={cotacao} />
      </div>

      <CartoesResumo resumo={resumo} />

      <div className="grid gap-4 lg:grid-cols-2">
        <CustoPorCentro
          linhas={porCentro}
          filtro={filtroValido}
          aoFiltrar={setFiltroCentro}
          aoGerenciar={() => setJanela({ tipo: "centros" })}
        />
        <Vencimentos itens={vencimentos} />
      </div>

      <section aria-labelledby="titulo-ferramentas" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 id="titulo-ferramentas" className="font-semibold">
              Ferramentas {rotuloFiltro && <span className="font-normal text-foreground/60">· {rotuloFiltro}</span>}
            </h2>
            <label className="sr-only" htmlFor="filtro-categoria">
              Categoria
            </label>
            <select
              id="filtro-categoria"
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className={`${estiloCampo} w-56 py-1.5`}
            >
              <option value="todas">Todas as categorias</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            <Botao onClick={() => exportar(doCentro, rotuloFiltro ? "-filtrado" : "")}>
              Exportar CSV{rotuloFiltro ? " (filtro)" : ""}
            </Botao>
            {rotuloFiltro && <Botao onClick={() => exportar(ferramentas, "")}>Exportar tudo</Botao>}
            <Botao onClick={() => setJanela({ tipo: "importar", chave: Date.now() })}>Importar CSV</Botao>
            <Botao
              variante="primario"
              onClick={() => setJanela({ tipo: "ferramenta", ferramenta: null, chave: Date.now() })}
            >
              Nova ferramenta
            </Botao>
          </div>
        </div>

        <TabelaFerramentas
          ferramentas={naTabela}
          nomeDoCentro={nomeDoCentro}
          cotacao={cotacao.valor}
          hoje={hoje}
          aoEditar={(f) => setJanela({ tipo: "ferramenta", ferramenta: f, chave: Date.now() })}
          aoVerHistorico={(f) => setJanela({ tipo: "historico", ferramenta: f })}
        />
      </section>

      <Modal
        aberto={janela.tipo === "ferramenta"}
        aoFechar={fechar}
        titulo={janela.tipo === "ferramenta" && janela.ferramenta ? `Editar ${janela.ferramenta.nome}` : "Nova ferramenta"}
        largura="max-w-2xl"
      >
        {janela.tipo === "ferramenta" && (
          <FormFerramenta
            key={janela.chave}
            ferramenta={janela.ferramenta}
            centros={centros}
            categorias={categorias}
            centroPadrao={filtroValido !== "todos" && filtroValido !== "sem" ? filtroValido : null}
            aoConcluir={fechar}
          />
        )}
      </Modal>

      <Modal
        aberto={janela.tipo === "historico"}
        aoFechar={fechar}
        titulo={janela.tipo === "historico" ? `Histórico: ${janela.ferramenta.nome}` : "Histórico"}
      >
        {janela.tipo === "historico" && <Historico ferramentaId={janela.ferramenta.id} />}
      </Modal>

      <Modal aberto={janela.tipo === "centros"} aoFechar={fechar} titulo="Centros de custo">
        {janela.tipo === "centros" && <GerenciarCentros centros={centros} />}
      </Modal>

      <Modal aberto={janela.tipo === "importar"} aoFechar={fechar} titulo="Importar CSV" largura="max-w-3xl">
        {janela.tipo === "importar" && (
          <ImportarCsv key={janela.chave} contexto={contextoImportacao} aoConcluir={fechar} />
        )}
      </Modal>
    </div>
  );
}
