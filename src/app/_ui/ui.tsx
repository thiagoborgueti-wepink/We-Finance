"use client";

import {
  startTransition,
  useEffect,
  useId,
  useRef,
  type ComponentProps,
  type FormEvent,
  type ReactNode,
} from "react";
import type { NivelAlerta } from "@/lib/ferramentas/alertas";

/**
 * Envia o formulário para a ação do useActionState sem o reset automático do
 * React 19 em `<form action>`: em erro de validação, o que foi digitado fica.
 */
export function enviarSemLimpar(acao: (dados: FormData) => void) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const dados = new FormData(e.currentTarget);
    startTransition(() => acao(dados));
  };
}

type Variante = "primario" | "secundario" | "perigo" | "discreto";

const VARIANTES: Record<Variante, string> = {
  primario: "bg-foreground text-background hover:opacity-90",
  secundario: "border border-foreground/20 hover:border-foreground/50",
  perigo: "bg-red-600 text-white hover:bg-red-700",
  discreto: "text-foreground/70 hover:text-foreground hover:bg-foreground/5",
};

export function Botao({
  variante = "secundario",
  className = "",
  ...props
}: ComponentProps<"button"> & { variante?: Variante }) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTES[variante]} ${className}`}
    />
  );
}

const ESTILO_CAMPO =
  "w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/60 aria-[invalid=true]:border-red-500";

export function Campo({
  rotulo,
  erro,
  dica,
  children,
  className = "",
}: {
  rotulo: string;
  erro?: string;
  dica?: string;
  children: (props: { id: string; "aria-invalid": boolean; "aria-describedby"?: string; className: string }) => ReactNode;
  className?: string;
}) {
  const id = useId();
  const idMensagem = `${id}-msg`;
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium">
        {rotulo}
      </label>
      {children({
        id,
        "aria-invalid": Boolean(erro),
        "aria-describedby": erro || dica ? idMensagem : undefined,
        className: ESTILO_CAMPO,
      })}
      {erro ? (
        <p id={idMensagem} className="text-xs text-red-600 dark:text-red-400">
          {erro}
        </p>
      ) : dica ? (
        <p id={idMensagem} className="text-xs text-foreground/60">
          {dica}
        </p>
      ) : null}
    </div>
  );
}

export const estiloCampo = ESTILO_CAMPO;

const CORES_NIVEL: Record<NivelAlerta, string> = {
  critico: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  atencao: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  info: "bg-foreground/10 text-foreground/80",
  ok: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
};

const ICONES_NIVEL: Record<NivelAlerta, string> = {
  critico: "⚠",
  atencao: "●",
  info: "○",
  ok: "✓",
};

/** Selo de situação: sempre com texto e ícone, nunca só cor. */
export function Selo({ nivel, children }: { nivel: NivelAlerta; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${CORES_NIVEL[nivel]}`}
    >
      <span aria-hidden>{ICONES_NIVEL[nivel]}</span>
      {children}
    </span>
  );
}

/** Janela modal com <dialog> nativo: foco preso, Esc fecha. */
export function Modal({
  aberto,
  aoFechar,
  titulo,
  children,
  largura = "max-w-lg",
}: {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  children: ReactNode;
  largura?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    if (aberto && !dialogo.open) dialogo.showModal();
    if (!aberto && dialogo.open) dialogo.close();
  }, [aberto]);

  return (
    <dialog
      ref={ref}
      onClose={aoFechar}
      className={`m-auto w-[calc(100%-2rem)] ${largura} rounded-lg border border-foreground/10 bg-background p-0 text-foreground shadow-xl backdrop:bg-black/40`}
    >
      {aberto && (
        <div className="flex max-h-[85vh] flex-col">
          <header className="flex items-center justify-between gap-4 border-b border-foreground/10 px-5 py-3">
            <h2 className="text-base font-semibold">{titulo}</h2>
            <Botao variante="discreto" onClick={aoFechar} aria-label="Fechar">
              ✕
            </Botao>
          </header>
          <div className="overflow-y-auto px-5 py-4">{children}</div>
        </div>
      )}
    </dialog>
  );
}

export function Aviso({ tipo = "info", children }: { tipo?: "info" | "erro" | "sucesso"; children: ReactNode }) {
  const cores = {
    info: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100",
    erro: "border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-100",
    sucesso:
      "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100",
  }[tipo];
  return (
    <p role={tipo === "erro" ? "alert" : "status"} className={`rounded-md border px-3 py-2 text-sm ${cores}`}>
      {children}
    </p>
  );
}
