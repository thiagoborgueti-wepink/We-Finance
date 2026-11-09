# Roadmap

## Fase 1: Inventário e visibilidade de custos

Base do produto. O protótipo já validou o fluxo com o financeiro; esta fase transforma o protótipo em aplicação.

- Cadastro de ferramentas: nome, centro de custo, categoria, responsável, conta de login, valor, moeda, ciclo (mensal ou anual), próxima cobrança, forma de pagamento, situação e observações.
- Centro de custo: filtro geral e custo mensal por centro.
- Resumo: custo mensal, custo anual projetado, a pagar em 30 dias, itens que precisam de atenção.
- Vencimentos: lista dos próximos 60 dias e alertas visuais (vencida, vence em até 7 dias, sem responsável).
- Importação de CSV com prévia e exportação de CSV.
- Melhorias inspiradas nas referências: orçamento por centro de custo, cotação automática do dólar, histórico de alterações.

Tarefas: T-001 a T-012.

## Fase 2: Avisos e leitura de faturas

- Avisos por Slack e e-mail alguns dias antes de cada cobrança.
- Calendário assinável (iCal) para o Google Agenda do financeiro.
- Leitura de faturas e recibos na caixa appwepink@wepink.com.br, extraindo valor, moeda e data.
- Fila de revisão: nenhuma fatura lida do e-mail entra sem aprovação humana.

Tarefas: T-013 a T-015.

## Fase 3: Conciliação

- Importação do extrato do cartão corporativo (CSV ou OFX).
- Regras de conciliação ("se a descrição contém VERCEL, é Vercel no centro APP").
- Anexo de nota fiscal por lançamento.
- Assentos por ferramenta: quantas licenças pagamos e quem usa cada uma.

Tarefas: T-016 a T-019.

## Fase 4: Open source

- Login corporativo e perfis (dev, financeiro, leitura).
- Empacotamento: Docker, README de instalação, licença.

Tarefas: T-020 e T-021.

## Operacional

Pendências nos dados atuais que não dependem de desenvolvimento.

Tarefas: T-022 a T-024.
