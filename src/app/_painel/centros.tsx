"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { formatarBRL } from "@/lib/custos/custo";
import { formatarValorPlanilha } from "@/lib/csv/valores";
import type { CampoCentro } from "@/lib/ferramentas/formulario";
import type { CentroCusto } from "@/lib/ferramentas/tipos";
import { excluirCentro, salvarCentro, type EstadoFormulario } from "../acoes";
import { Aviso, Botao, Campo, enviarSemLimpar } from "../_ui/ui";

const inicial: EstadoFormulario<CampoCentro> = {};

/** Cadastro de centros de custo com orçamento mensal opcional (T-004, T-010). */
export function GerenciarCentros({ centros }: { centros: CentroCusto[] }) {
  const [editando, setEditando] = useState<string | null>(null);
  const [novos, setNovos] = useState(0);

  return (
    <div className="flex flex-col gap-5">
      <ul className="flex flex-col divide-y divide-foreground/10">
        {centros.length === 0 && <li className="py-2 text-sm text-foreground/60">Nenhum centro ainda.</li>}
        {centros.map((c) =>
          editando === c.id ? (
            <li key={c.id} className="py-3">
              <FormCentro centro={c} aoConcluir={() => setEditando(null)} />
            </li>
          ) : (
            <LinhaCentro key={c.id} centro={c} aoEditar={() => setEditando(c.id)} />
          ),
        )}
      </ul>

      <div className="flex flex-col gap-2 border-t border-foreground/10 pt-4">
        <h3 className="text-sm font-semibold">Novo centro de custo</h3>
        <FormCentro key={novos} centro={null} aoConcluir={() => setNovos((n) => n + 1)} />
      </div>
    </div>
  );
}

function LinhaCentro({ centro, aoEditar }: { centro: CentroCusto; aoEditar: () => void }) {
  const [confirmando, setConfirmando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [excluindo, iniciar] = useTransition();

  return (
    <li className="flex flex-col gap-1 py-2">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{centro.nome}</p>
          <p className="text-xs text-foreground/60">
            {centro.orcamentoMensal === null ? "Sem orçamento" : `Orçamento: ${formatarBRL(centro.orcamentoMensal)}/mês`}
          </p>
        </div>
        {confirmando ? (
          <div className="flex items-center gap-1">
            <Botao
              variante="perigo"
              className="px-2 py-1"
              disabled={excluindo}
              onClick={() =>
                iniciar(async () => {
                  const r = await excluirCentro(centro.id);
                  if (r.erro) setErro(r.erro);
                })
              }
            >
              Excluir
            </Botao>
            <Botao variante="discreto" className="px-2 py-1" onClick={() => setConfirmando(false)}>
              Cancelar
            </Botao>
          </div>
        ) : (
          <div className="flex gap-1">
            <Botao variante="discreto" className="px-2 py-1" onClick={aoEditar}>
              Editar
            </Botao>
            <Botao
              variante="discreto"
              className="px-2 py-1 text-red-700 dark:text-red-400"
              onClick={() => setConfirmando(true)}
            >
              Excluir
            </Botao>
          </div>
        )}
      </div>
      {erro && <p className="text-xs text-red-600 dark:text-red-400">{erro}</p>}
    </li>
  );
}

function FormCentro({ centro, aoConcluir }: { centro: CentroCusto | null; aoConcluir: () => void }) {
  const [estado, acao, salvando] = useActionState(salvarCentro, inicial);
  const erros = estado.erros ?? {};

  useEffect(() => {
    if (estado.enviadoEm) aoConcluir();
  }, [estado.enviadoEm, aoConcluir]);

  return (
    <form onSubmit={enviarSemLimpar(acao)} className="flex flex-col gap-3" noValidate>
      {centro && <input type="hidden" name="id" value={centro.id} />}
      {estado.erroGeral && <Aviso tipo="erro">{estado.erroGeral}</Aviso>}
      <div className="grid gap-3 sm:grid-cols-2">
        <Campo rotulo="Nome" erro={erros.nome}>
          {(p) => <input {...p} name="nome" defaultValue={centro?.nome} maxLength={60} placeholder="Ex.: APP" />}
        </Campo>
        <Campo rotulo="Orçamento mensal (R$)" erro={erros.orcamentoMensal} dica="Opcional">
          {(p) => (
            <input
              {...p}
              name="orcamentoMensal"
              inputMode="decimal"
              placeholder="0,00"
              defaultValue={centro?.orcamentoMensal == null ? "" : formatarValorPlanilha(centro.orcamentoMensal)}
            />
          )}
        </Campo>
      </div>
      <div className="flex justify-end gap-2">
        {centro && (
          <Botao variante="discreto" onClick={aoConcluir}>
            Cancelar
          </Botao>
        )}
        <Botao type="submit" variante="primario" disabled={salvando}>
          {salvando ? "Salvando…" : centro ? "Salvar" : "Adicionar centro"}
        </Botao>
      </div>
    </form>
  );
}
