# T-025 Habilitar login com Microsoft (SSO)

| Campo | Valor |
|---|---|
| Status | Backlog |
| Fase | 4 (segundo momento, após a T-020) |
| Prioridade | Média |
| Responsável | Claude (implementação) · TI da WePink (configuração no Entra) |
| Depende de | T-020 |

## Contexto

Decidido em 09/11/2026: o We-Finance terá SSO com a conta corporativa Microsoft (Microsoft Entra ID), num segundo momento. O login inicial da T-020 continua valendo; o SSO entra como provedor adicional.

## O que fazer

Caminho padrão: provedor **Azure (OAuth)** do Supabase Auth, que funciona no plano gratuito.

1. TI da WePink registra um app no Microsoft Entra admin center (App registrations), aceitando só contas do diretório da WePink (single tenant).
2. URL de retorno: `https://<project-ref>.supabase.co/auth/v1/callback`.
3. TI gera Client ID, Client Secret e informa o Tenant ID. Os valores vão direto para o Supabase, nunca para o repositório.
4. Supabase > Authentication > Providers > Azure: preencher os dados e a URL do tenant `https://login.microsoftonline.com/<tenant-id>`.
5. Claude adiciona o botão "Entrar com Microsoft" (`signInWithOAuth({ provider: "azure", options: { scopes: "email" } })`).
6. Cadastrar o Client Secret como item no próprio We-Finance, com a data de expiração (máximo de 24 meses), para gerar aviso de renovação.

Alternativa: **SAML 2.0**, se a TI exigir. Requer plano Pro do Supabase.

## Critérios de aceite

- [ ] Conta Microsoft da WePink entra; conta Microsoft de fora do tenant é recusada.
- [ ] Usuário que já existia (mesmo e-mail) mantém o perfil e o histórico ao entrar pela Microsoft.
- [ ] Os perfis (Financeiro, Gestor de centro, Leitura) continuam controlados pelo RLS, sem depender do provedor de login.
- [ ] Expiração do Client Secret cadastrada no We-Finance.

## Notas

Para esta tarefa não exigir retrabalho, a T-020 já deve ser construída com o perfil do usuário ligado ao `auth.users` e ao e-mail, nunca ao provedor de login.
