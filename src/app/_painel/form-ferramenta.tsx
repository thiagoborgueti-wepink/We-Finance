"use client";

import { useActionState, useEffect } from "react";
import { CICLOS_COMUNS, rotuloCiclo } from "@/lib/custos/custo";
import { formatarValorPlanilha } from "@/lib/csv/valores";
import type { CampoFerramenta } from "@/lib/ferramentas/formulario";
import { SITUACOES, type Categoria, type CentroCusto, type Ferramenta } from "@/lib/ferramentas/tipos";
import { salvarFerramenta, type EstadoFormulario } from "../acoes";
import { Aviso, Botao, Campo, enviarSemLimpar } from "../_ui/ui";

const inicial: EstadoFormulario<CampoFerramenta> = {};

/** Criar ou editar uma ferramenta (T-003). */
export function FormFerramenta({
  ferramenta,
  centros,
  categorias,
  centroPadrao,
  aoConcluir,
}: {
  ferramenta: Ferramenta | null;
  centros: CentroCusto[];
  categorias: Categoria[];
  centroPadrao: string | null;
  aoConcluir: () => void;
}) {
  const [estado, acao, salvando] = useActionState(salvarFerramenta, inicial);
  const erros = estado.erros ?? {};
  const f = ferramenta;

  useEffect(() => {
    if (estado.enviadoEm) aoConcluir();
  }, [estado.enviadoEm, aoConcluir]);

  const outros = categorias.find((c) => c.nome === "Outros")?.id ?? categorias[0]?.id;
  const ciclos: { meses: number; rotulo: string }[] = [...CICLOS_COMUNS];
  if (f && !ciclos.some((c) => c.meses === f.cicloMeses)) {
    ciclos.push({ meses: f.cicloMeses, rotulo: rotuloCiclo(f.cicloMeses) });
  }

  return (
    <form onSubmit={enviarSemLimpar(acao)} className="flex flex-col gap-4" noValidate>
      {f && <input type="hidden" name="id" value={f.id} />}
      {estado.erroGeral && <Aviso tipo="erro">{estado.erroGeral}</Aviso>}

      <Campo rotulo="Ferramenta" erro={erros.nome}>
        {(p) => <input {...p} name="nome" defaultValue={f?.nome} required maxLength={120} autoFocus />}
      </Campo>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo rotulo="Centro de custo" erro={erros.centroCustoId}>
          {(p) => (
            <select {...p} name="centroCustoId" defaultValue={f ? (f.centroCustoId ?? "") : (centroPadrao ?? "")}>
              <option value="">Sem centro de custo</option>
              {centros.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          )}
        </Campo>
        <Campo rotulo="Categoria" erro={erros.categoriaId}>
          {(p) => (
            <select {...p} name="categoriaId" defaultValue={f?.categoriaId ?? outros}>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          )}
        </Campo>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Campo rotulo="Valor da cobrança" erro={erros.valor} dica="Valor de cada ciclo">
          {(p) => (
            <input
              {...p}
              name="valor"
              inputMode="decimal"
              placeholder="0,00"
              defaultValue={f ? formatarValorPlanilha(f.valor) : ""}
              required
            />
          )}
        </Campo>
        <Campo rotulo="Moeda" erro={erros.moeda}>
          {(p) => (
            <select {...p} name="moeda" defaultValue={f?.moeda ?? "BRL"}>
              <option value="BRL">BRL (R$)</option>
              <option value="USD">USD (US$)</option>
            </select>
          )}
        </Campo>
        <Campo rotulo="Ciclo" erro={erros.cicloMeses}>
          {(p) => (
            <select {...p} name="cicloMeses" defaultValue={f?.cicloMeses ?? 1}>
              {ciclos.map((c) => (
                <option key={c.meses} value={c.meses}>
                  {c.rotulo}
                </option>
              ))}
            </select>
          )}
        </Campo>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo rotulo="Próxima cobrança" erro={erros.proximaCobranca}>
          {(p) => <input {...p} type="date" name="proximaCobranca" defaultValue={f?.proximaCobranca ?? ""} />}
        </Campo>
        <Campo rotulo="Situação" erro={erros.situacao}>
          {(p) => (
            <select {...p} name="situacao" defaultValue={f?.situacao ?? "ativa"}>
              {SITUACOES.map((s) => (
                <option key={s.valor} value={s.valor}>
                  {s.rotulo}
                </option>
              ))}
            </select>
          )}
        </Campo>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo rotulo="Responsável" erro={erros.responsavel}>
          {(p) => <input {...p} name="responsavel" defaultValue={f?.responsavel ?? ""} maxLength={120} />}
        </Campo>
        <Campo rotulo="Conta de login" erro={erros.contaLogin}>
          {(p) => <input {...p} name="contaLogin" defaultValue={f?.contaLogin ?? ""} maxLength={200} />}
        </Campo>
      </div>

      <Campo
        rotulo="Forma de pagamento"
        erro={erros.formaPagamento}
        dica="Ex.: Cartão corporativo final 1234. Nunca o número completo."
      >
        {(p) => <input {...p} name="formaPagamento" defaultValue={f?.formaPagamento ?? ""} maxLength={120} />}
      </Campo>

      <Campo rotulo="Observações" erro={erros.observacoes}>
        {(p) => <textarea {...p} name="observacoes" rows={3} defaultValue={f?.observacoes ?? ""} maxLength={2000} />}
      </Campo>

      <div className="flex justify-end gap-2">
        <Botao variante="discreto" onClick={aoConcluir}>
          Cancelar
        </Botao>
        <Botao type="submit" variante="primario" disabled={salvando}>
          {salvando ? "Salvando…" : f ? "Salvar alterações" : "Cadastrar"}
        </Botao>
      </div>
    </form>
  );
}
