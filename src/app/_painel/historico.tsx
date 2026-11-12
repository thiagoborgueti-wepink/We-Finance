"use client";

import { useEffect, useState } from "react";
import { rotuloCiclo } from "@/lib/custos/custo";
import { formatarValorPlanilha } from "@/lib/csv/valores";
import { formatarData } from "@/lib/datas";
import type { RegistroHistorico } from "@/lib/ferramentas/dados";
import { rotuloSituacao, type Situacao } from "@/lib/ferramentas/tipos";
import { carregarHistorico } from "../acoes";
import { formatarDataHora } from "../_ui/formatos";
import { Aviso } from "../_ui/ui";

const CAMPOS: Record<string, string> = {
  nome: "Nome",
  centro_custo_id: "Centro de custo",
  categoria_id: "Categoria",
  responsavel: "Responsável",
  conta_login: "Conta de login",
  valor: "Valor",
  moeda: "Moeda",
  ciclo_meses: "Ciclo",
  proxima_cobranca: "Próxima cobrança",
  forma_pagamento: "Forma de pagamento",
  situacao: "Situação",
  observacoes: "Observações",
};

/** Valor gravado pelo banco em texto legível (valor 1800.00 → 1.800,00; a_cancelar → A cancelar). */
function legivel(campo: string | null, valor: string | null): string {
  if (valor === null || valor === "") return "vazio";
  if (campo === "valor") return formatarValorPlanilha(Number(valor));
  if (campo === "situacao") return rotuloSituacao(valor as Situacao);
  if (campo === "ciclo_meses") return rotuloCiclo(Number(valor));
  if (campo === "proxima_cobranca" && /^\d{4}-\d{2}-\d{2}$/.test(valor)) return formatarData(valor);
  return valor;
}

function descrever(r: RegistroHistorico): string {
  if (r.acao === "criacao") return "Cadastrou a ferramenta";
  if (r.acao === "exclusao") return "Excluiu a ferramenta";
  const campo = CAMPOS[r.campo ?? ""] ?? r.campo;
  return `${campo}: ${legivel(r.campo, r.valorAnterior)} → ${legivel(r.campo, r.valorNovo)}`;
}

/** Histórico de alterações da ferramenta (T-012). Somente leitura. */
export function Historico({ ferramentaId }: { ferramentaId: string }) {
  const [estado, setEstado] = useState<{ erro?: string; registros?: RegistroHistorico[] } | null>(null);

  useEffect(() => {
    let ativo = true;
    carregarHistorico(ferramentaId).then((r) => {
      if (ativo) setEstado(r);
    });
    return () => {
      ativo = false;
    };
  }, [ferramentaId]);

  if (!estado) return <p className="text-sm text-foreground/60">Carregando…</p>;
  if (estado.erro) return <Aviso tipo="erro">{estado.erro}</Aviso>;
  if (!estado.registros?.length) {
    return <p className="text-sm text-foreground/60">Sem alterações registradas.</p>;
  }

  return (
    <ol className="flex flex-col divide-y divide-foreground/10">
      {estado.registros.map((r) => (
        <li key={r.id} className="flex flex-col gap-0.5 py-2">
          <p className="text-sm">{descrever(r)}</p>
          <p className="text-xs text-foreground/60">
            {formatarDataHora(r.registradoEm)} · {r.usuarioEmail ?? "usuário desconhecido"}
            {r.origem === "importacao" && " · via importação de CSV"}
          </p>
        </li>
      ))}
    </ol>
  );
}
