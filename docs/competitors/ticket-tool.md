# Bot: Ticket Tool

- Site: https://tickettool.xyz — Docs: https://docs.tickettool.xyz
- Modelo: freemium — bot grátis + Premium por servidor. Free tem limite de 250 caracteres em descrições/embeds. 4,6M+ servidores.
- Foco: tickets privados por painéis altamente customizáveis via dashboard + comandos.

## Árvore de recursos

- Painéis — **free** (premium remove limite 250 chars / multi-embed)
  - Criar/renomear/clonar/enviar/atualizar/deletar; `$panel [ID]` envia no canal
  - Botão custom (emoji/texto/cor, cargos permitidos/bloqueados, só equipe)
  - Multi-painéis (até 25 botões em 1 mensagem), dropdown multi-painel
  - Tickets por comando (`$new` em canal monitorado)
  - Contador serial `{count}` (padding de zeros — **premium**)
- Categorias e canais — **free**
  - Categoria de abertos/fechados; overflow (contorna limite 50 canais/categoria)
  - Storage: recicla canais deletados (evita limite 500 canais/servidor)
- Ciclo de vida — **free** (renomear/cargos open-close e mensagens custom — **premium**)
  - Ticket message + Close/Claim; confirmação em 2 etapas (Two Step Close)
  - `$rename`, `$add`, `$remove`; `$open`, `$close`, `$delete`
  - Thread privada de staff por ticket — **premium**; tickets como thread — **premium**
- Formulários — **free**
  - Modal pré-abertura, até 5 perguntas; resumo em embed com `{create.form.x}`
- Equipe e permissões — **free** (claiming — **premium**)
  - Cargos de suporte + observadores; permissões granulares por estado
  - `$claim`/`$unclaim`, categorias e cargos de claimed — **premium**
- Transcrições
  - HTML (1000 msgs) via botão/comando — **free em tickets**
  - Auto-save ao fechar/deletar, DM ao dono, Google Drive — **premium**
  - `$transcript` fora de ticket — **premium**
- Logs e stats — **free** (histórico além de 7 dias — **premium**)
  - Canal de log (created/closed/reopened/renamed/deleted/transcript); stats por painel
- Limites e horários — **free** (agendamento semanal por painel — **premium**)
- Escalação — **free** (`$escalate` move ticket entre painéis com motivo)
- Automações — **premium** (inatividade, triggers, SLA, auto-close/delete)
- Comandos custom (tags Strict/Wildcard/Regex + args) — **free**

## Comandos

| Comando | Descrição | Free? |
|---|---|---|
| `$panel [ID]` | Envia painel no canal | sim |
| `$new [motivo]` | Cria ticket via comando | sim |
| `$close` / `$open` / `$delete` | Fecha / reabre / deleta | sim |
| `$rename` / `$add` / `$remove` | Renomeia, dá/remove acesso | sim |
| `$transcript` | HTML das últimas 1000 msgs | sim (em tickets) |
| `$claim` / `$unclaim` | Assumir/liberar ticket | não |
| `$escalate` | Transfere p/ outro painel | sim |
| `$automation` | Inicia/para automações | não |
| `$help`, `$ping`, `$debug`, `$id` | Ajuda, latência, diagnóstico, IDs | sim |

## Ações automáticas

- Criar: canal/thread, permissões, cargos, pin, log, DM (premium), disponibilidade (premium)
- Fechar: move categoria, renomeia (premium), transcript auto (premium), DM (premium), log
- Claim: permissões, categoria, cargos, stats — tudo premium
- Automação: vigia inatividade e triggers → fecha/deleta — premium

## O que copiar / melhorar no Lostyo

- Copiar: multipainel + dropdown, forms modais, overflow + storage recycling, escalação, backup/restore por key, custom commands com Regex, variáveis em nomes/mensagens, Two Step Close, stats por painel.
- Melhorar: liberar **claiming, automações, transcript auto-save + DM, multi-embed sem limite** no free; transcripts ilimitados + export JSON/CSV; SLA com alertas e round-robin; fila de atendimento; migração 1-clique vinda do Ticket Tool.
