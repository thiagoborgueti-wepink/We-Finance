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
    return { erro: "E-mail ou senha incorretos.", email };
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

export async function sair() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
