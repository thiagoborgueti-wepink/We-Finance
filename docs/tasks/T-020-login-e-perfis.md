# T-020 Implementar login corporativo e perfis

| Campo | Valor |
|---|---|
| Status | Backlog |
| Fase | 4 |
| Prioridade | Média |
| Responsável | |
| Depende de | T-001 |

## O que fazer

- Login com a conta Google da empresa (OIDC), restrito ao domínio wepink.com.br.
- Perfis: Financeiro (edita tudo), Gestor de centro (edita as ferramentas do seu centro de custo), Leitura.

## Critérios de aceite

- [ ] Conta fora do domínio não entra.
- [ ] Cada perfil só vê e edita o que lhe cabe.
- [ ] O histórico (T-012) registra o usuário logado.
- [ ] Perfis ligados ao usuário (`auth.users`) e ao e-mail, não ao provedor de login, para aceitar o SSO da Microsoft depois (T-025) sem migração.

## Notas

O SSO com Microsoft (Entra ID) está previsto como segundo momento, na [T-025](T-025-sso-microsoft.md).
