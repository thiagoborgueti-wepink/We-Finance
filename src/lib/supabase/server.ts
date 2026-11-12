import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { requireSupabaseEnv } from "./env";

/**
 * Cliente do Supabase para Server Components, Server Actions e Route Handlers.
 * Usa a sessão do usuário guardada em cookies; as permissões vêm do RLS.
 *
 * Com Cache Components ativo, quem chamar esta função lê cookies e precisa
 * estar dentro de um <Suspense>.
 */
export interface OpcoesCliente {
  /** Marca as gravações no histórico (T-012); o gatilho lê este cabeçalho. */
  origem?: "importacao";
}

export async function createClient(opcoes: OpcoesCliente = {}) {
  // cookies() primeiro: marca a renderização como dinâmica antes de exigir as
  // variáveis, para o build não tentar pré-renderizar e falhar sem .env.
  const cookieStore = await cookies();
  const { url, key } = requireSupabaseEnv();

  return createServerClient(url, key, {
    global: opcoes.origem ? { headers: { "x-wefinance-origem": opcoes.origem } } : undefined,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Chamado a partir de um Server Component, onde cookies são só leitura.
          // A renovação da sessão acontece no proxy.ts.
        }
      },
    },
  });
}
