"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface EstadoLogin {
  erro?: string;
  email?: string;
}

/**
 * Login por e-mail e senha. Contas são criadas por um administrador no painel
 * do Supabase; o cadastro aberto fica desligado. O SSO da Microsoft entra na T-025.
 */
export async function entrar(_anterior: EstadoLogin, form: FormData): Promise<EstadoLogin> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const senha = String(form.get("senha") ?? "");

  if (!email || !senha) {
    return { erro: "Informe e-mail e senha.", email };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) {
    // Sem e-mail nem senha no log: só o código do erro e o projeto Supabase usado.
    console.error("[login] falha", {
      codigo: error.code,
      status: error.status,
      projeto: supabaseHost(),
    });
    return { erro: mensagemDeErro(error.code), email };
  }

  // Mesmo com senha válida, só entra quem tem e-mail de domínio autorizado.
  // A regra é a mesma do RLS: public.usuario_autorizado().
  const { data: autorizado } = await supabase.rpc("usuario_autorizado");
  if (autorizado !== true) {
    await supabase.auth.signOut();
    return { erro: "Este e-mail não tem acesso ao We-Finance.", email };
  }

  redirect("/");
}

function mensagemDeErro(codigo: string | undefined): string {
  switch (codigo) {
    case "email_not_confirmed":
      return "E-mail ainda não confirmado. Peça ao administrador para confirmar a conta.";
    case "user_banned":
      return "Esta conta está bloqueada.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Muitas tentativas. Aguarde alguns minutos e tente de novo.";
    case "invalid_credentials":
      return "E-mail ou senha incorretos.";
    default:
      return "Não foi possível entrar agora. Tente de novo em instantes.";
  }
}

function supabaseHost(): string {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").host;
  } catch {
    return "não configurado";
  }
}

export async function sair() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
