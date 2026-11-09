# T-001 Definir stack e estrutura do repositório

| Campo | Valor |
|---|---|
| Status | A fazer |
| Fase | 1 |
| Prioridade | Alta |
| Responsável | |
| Depende de | |

## Contexto

O protótipo roda como página publicada no Claude, com banco próprio da plataforma. Para virar produto e, depois, projeto open source, precisamos de uma stack que o time de dev mantenha e que rode em Docker.

## O que fazer

- Escolher linguagem, framework, banco de dados e forma de hospedagem.
- Registrar a decisão em `docs/decisoes/ADR-001-stack.md` (contexto, opções, escolha, consequências).
- Criar a estrutura inicial de pastas e o README de desenvolvimento.

## Critérios de aceite

- [ ] ADR aprovado pelo time de dev.
- [ ] Repositório com estrutura inicial e instruções para rodar localmente.
- [ ] A stack roda em Docker (requisito da Fase 4).

## Notas

O time já usa Vercel e PlanetScale no app; vale considerar por familiaridade, mas sem obrigação.
