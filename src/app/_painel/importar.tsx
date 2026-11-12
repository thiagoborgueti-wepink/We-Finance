"use client";

import { useMemo, useState, useTransition } from "react";
import { gerarModeloCsv } from "@/lib/csv/exportar";
import { LIMITE_BYTES, LIMITE_LINHAS, analisarCsv, type ContextoImportacao } from "@/lib/csv/importar";
import { importarCsv, type ResultadoImportacao } from "../acoes";
import { plural } from "../_ui/formatos";
import { Aviso, Botao, Selo } from "../_ui/ui";
import { baixarArquivo } from "./baixar";

/** Lê o arquivo como UTF-8; se não for, como Windows-1252 (CSV salvo pelo Excel). */
async function lerTexto(arquivo: File): Promise<string> {
  const bytes = await arquivo.arrayBuffer();
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder("windows-1252").decode(bytes);
  }
}

const STATUS = {
  nova: { nivel: "ok", texto: "Nova" },
  existe: { nivel: "info", texto: "Já existe" },
  erro: { nivel: "critico", texto: "Com erro" },
} as const;

/** Importação de CSV com prévia (T-007). Nada é gravado antes de confirmar. */
export function ImportarCsv({ contexto, aoConcluir }: { contexto: ContextoImportacao; aoConcluir: () => void }) {
  const [texto, setTexto] = useState<string | null>(null);
  const [nomeArquivo, setNomeArquivo] = useState("");
  const [erroArquivo, setErroArquivo] = useState<string | null>(null);
  const [atualizar, setAtualizar] = useState(false);
  const [resultado, setResultado] = useState<ResultadoImportacao | null>(null);
  const [gravando, iniciar] = useTransition();

  const analise = useMemo(() => (texto === null ? null : analisarCsv(texto, contexto)), [texto, contexto]);
  const contagem = useMemo(() => {
    const c = { nova: 0, existe: 0, erro: 0 };
    for (const l of analise?.linhas ?? []) c[l.status] += 1;
    return c;
  }, [analise]);
  const aGravar = contagem.nova + (atualizar ? contagem.existe : 0);

  async function escolher(arquivo: File | undefined) {
    setResultado(null);
    setTexto(null);
    setErroArquivo(null);
    if (!arquivo) return;
    if (arquivo.size > LIMITE_BYTES) {
      setErroArquivo("O arquivo passa de 2 MB. Divida em arquivos menores.");
      return;
    }
    setNomeArquivo(arquivo.name);
    setTexto(await lerTexto(arquivo));
  }

  function gravar() {
    if (texto === null) return;
    iniciar(async () => {
      setResultado(await importarCsv(texto, atualizar));
    });
  }

  if (resultado && !resultado.erro) {
    return (
      <div className="flex flex-col gap-4">
        <Aviso tipo="sucesso">
          Importação concluída: {plural(resultado.criadas ?? 0, "ferramenta criada", "ferramentas criadas")},{" "}
          {plural(resultado.atualizadas ?? 0, "atualizada", "atualizadas")}
          {resultado.ignoradas ? `, ${plural(resultado.ignoradas, "já existente ignorada", "já existentes ignoradas")}` : ""}
          {resultado.comErro ? `, ${plural(resultado.comErro, "linha com erro ficou", "linhas com erro ficaram")} de fora` : ""}
          {resultado.centrosCriados ? `. ${plural(resultado.centrosCriados, "centro criado", "centros criados")}` : ""}.
        </Aviso>
        <div className="flex justify-end">
          <Botao variante="primario" onClick={aoConcluir}>
            Fechar
          </Botao>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 text-sm text-foreground/80">
        <p>
          Colunas reconhecidas pelo nome: Ferramenta e Valor (obrigatórias), Centro de custo, Categoria, Responsável,
          Conta, Moeda, Ciclo, Próxima cobrança, Forma de pagamento, Situação e Observações.
        </p>
        <p className="text-xs text-foreground/60">
          Separador vírgula, ponto e vírgula ou tab. Até {LIMITE_LINHAS} linhas e 2 MB.{" "}
          <button
            type="button"
            className="underline"
            onClick={() => baixarArquivo(gerarModeloCsv(), "modelo-we-finance.csv")}
          >
            Baixar modelo
          </button>
        </p>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Arquivo CSV
        <input
          type="file"
          accept=".csv,.txt,text/csv"
          onChange={(e) => escolher(e.target.files?.[0])}
          className="text-sm file:mr-3 file:rounded-md file:border file:border-foreground/20 file:bg-transparent file:px-3 file:py-1.5 file:text-sm"
        />
      </label>

      {erroArquivo && <Aviso tipo="erro">{erroArquivo}</Aviso>}
      {analise?.erroGeral && <Aviso tipo="erro">{analise.erroGeral}</Aviso>}
      {resultado?.erro && <Aviso tipo="erro">{resultado.erro}</Aviso>}

      {analise && !analise.erroGeral && (
        <>
          <p className="text-sm">
            <strong>{nomeArquivo}</strong>: {plural(contagem.nova, "nova", "novas")},{" "}
            {plural(contagem.existe, "já existe", "já existem")}, {plural(contagem.erro, "com erro", "com erro")}.
            {analise.colunasIgnoradas.length > 0 && (
              <span className="text-foreground/60"> Colunas ignoradas: {analise.colunasIgnoradas.join(", ")}.</span>
            )}
          </p>

          <div className="max-h-80 overflow-auto rounded-md border border-foreground/10">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-background text-left text-xs text-foreground/60">
                <tr>
                  <th className="px-2 py-1.5 font-medium">Linha</th>
                  <th className="px-2 py-1.5 font-medium">Ferramenta</th>
                  <th className="px-2 py-1.5 font-medium">Status</th>
                  <th className="px-2 py-1.5 font-medium">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/10">
                {analise.linhas.map((l) => (
                  <tr key={l.numero} className="align-top">
                    <td className="px-2 py-1.5 tabular-nums text-foreground/60">{l.numero}</td>
                    <td className="px-2 py-1.5">{l.nome || "—"}</td>
                    <td className="px-2 py-1.5">
                      <Selo nivel={STATUS[l.status].nivel}>{STATUS[l.status].texto}</Selo>
                    </td>
                    <td className="px-2 py-1.5 text-xs">
                      {l.erros.map((e) => (
                        <p key={e} className="text-red-700 dark:text-red-300">
                          {e}
                        </p>
                      ))}
                      {l.avisos.map((a) => (
                        <p key={a} className="text-foreground/70">
                          {a}
                        </p>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {contagem.existe > 0 && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={atualizar} onChange={(e) => setAtualizar(e.target.checked)} />
              Atualizar as {plural(contagem.existe, "ferramenta que já existe", "ferramentas que já existem")} com os
              dados do arquivo
            </label>
          )}

          <div className="flex justify-end gap-2">
            <Botao variante="discreto" onClick={aoConcluir}>
              Cancelar
            </Botao>
            <Botao variante="primario" disabled={aGravar === 0 || gravando} onClick={gravar}>
              {gravando ? "Importando…" : `Importar ${plural(aGravar, "linha", "linhas")}`}
            </Botao>
          </div>
        </>
      )}
    </div>
  );
}
