import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface UsuarioAtual {
  id: string;
  email: string;
}

/**
 * Usuário logado, lido da sessão do Supabase. Sem sessão, manda para /login.
 * Lê cookies: quem chamar precisa estar dentro de um <Suspense>.
 */
export async function getUsuarioAtual(): Promise<UsuarioAtual> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) redirect("/login");

  return { id: claims.sub, email: typeof claims.email === "string" ? claims.email : "" };
}
