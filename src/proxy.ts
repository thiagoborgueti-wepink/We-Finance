import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseEnv } from "@/lib/supabase/env";

/**
 * Renova a sessão do Supabase a cada requisição, regravando os cookies.
 * No Next.js 16 o antigo `middleware.ts` se chama `proxy.ts`.
 * Também protege as rotas: sem login, redireciona para /login (T-026).
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const env = supabaseEnv();
  if (!env) return response;

  const supabase = createServerClient(env.url, env.key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Não colocar código entre a criação do cliente e esta chamada:
  // ela valida o token e dispara a renovação dos cookies.
  const { data } = await supabase.auth.getClaims();
  const logado = Boolean(data?.claims?.sub);
  const naTelaDeLogin = request.nextUrl.pathname === "/login";

  // Sem sessão, toda rota leva ao login; já logado, o login volta para o início.
  // Os cookies renovados acima precisam seguir junto no redirecionamento.
  if (logado === naTelaDeLogin) {
    const destino = request.nextUrl.clone();
    destino.pathname = logado ? "/" : "/login";
    destino.search = "";
    const redirecionamento = NextResponse.redirect(destino);
    response.cookies.getAll().forEach((cookie) => redirecionamento.cookies.set(cookie));
    return redirecionamento;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
