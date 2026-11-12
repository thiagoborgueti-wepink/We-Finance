# T-026 Login mínimo com e-mail e senha

| Campo | Valor |
|---|---|
| Status | Feito |
| Fase | 1 |
| Prioridade | Alta |
| Responsável | Claude |
| Depende de | T-002 |

## Contexto

O RLS da T-002 só libera dados para usuários logados com e-mail de domínio autorizado. Sem login, a T-003 não consegue mostrar nada. O login corporativo completo (T-020) e o SSO da Microsoft (T-025) ficam para depois; esta tarefa adianta o mínimo para destravar a Fase 1.

## O que fazer

- Tela `/login` com e-mail e senha (Supabase Auth).
- `proxy.ts` redireciona quem não está logado para `/login`.
- Botão "Sair" na tela inicial.
- Recusar login de e-mail fora de `dominios_permitidos`, com a mesma regra do RLS.
- Cadastro aberto desligado: contas criadas por um administrador no painel do Supabase.

## Critérios de aceite

- [x] Sem sessão, qualquer rota leva para `/login`.
- [x] Login com e-mail autorizado leva para a tela inicial e mostra o e-mail.
- [x] E-mail de domínio não autorizado é recusado, mesmo com senha correta.
- [ ] "Allow new users to sign up" desligado no projeto Supabase.
- [x] Conta do PO criada e testada no preview do Vercel.

## Notas

- Contas são criadas em Supabase → Authentication → Users → Add user → Create new user, com "Auto Confirm User" marcado. A senha não passa pelo chat nem pelo repositório.
- Hoje todo usuário autorizado tem acesso total. Perfis (administrador, leitura) entram na T-020, ligados ao usuário e ao e-mail, não ao provedor de login.
