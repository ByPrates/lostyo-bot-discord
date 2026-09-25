# Bot: Carl-bot

- Site: https://carl.gg
- Modelo: freemium — mesmo bot em todos os servidores + Premium via Patreon (limites maiores, recursos exclusivos).
- Foco: reaction roles (padrão-ouro), automod, logs/modlogs, tags + TagScript, welcomes, suggestions, starboard, feeds.

## Árvore de recursos

- Config / permissões — **free**
  - Até 15 prefixos; ignore/disable por canal; restrict p/ bot-channel; modonly + modrole; plonk; muterole; `cleanconfig`
- Automod — **free** (drama watcher, autopurge, +4 honeypots — **premium**)
  - Spam (mensagem, anexo, menção, link, invite) com punições combináveis (delete, warn, mute, kick, ban, timeout...)
  - Blacklist/whitelist de links e invites; bad words (~50); caps limit; canais media-only; whitelist de automod; delete arquivos inseguros; warn threshold; honeypot (1 canal)
- Moderação manual — **free** (`lockdown setup` — **premium**)
  - `ban`, `softban`, `tempban`, `massban`, `kick`, `mute`, `hardmute`, `timeout`, `warn` (com DM)
  - Warns/notas com case ID; `lockdown` de canal/servidor; `purge` com filtros; `report` com jump-link
- Logs + modlogs — **free** (ban de outros bots no modlog, weblog 500 — **premium**)
  - Auditoria em até 5 canais (`log aio`); eventos: delete/edit/purge, cargos, avatar, ban/timeout, join/leave, canais, voz
  - Modlog com responsável, ranking de mods, export .txt
- Cargos — **free** (timed reaction roles, voice-role links — **premium**)
  - Reaction roles até 250 pares, modos: normal, unique, verify, drop, binding, reversed, lock, link, limit
  - Autoroles + sticky (30 dias), timed roles, self-ranks, gerência bulk
- Tags + TagScript — **free** (multi command-blocks, TagScript avançado — **premium**)
  - Comandos custom `!nome`, biblioteca pública importável (`carl.gg/t/...`), variáveis, condicionais, triggers auto-resposta
- Welcome/farewell/aniversários — **free** (canal farewell separado, hora/cargo aniversário — **premium**)
  - Mensagem + DM com variáveis e embeds; `banmsg`; `testgreet`
- Suggestions — **free** (numera, vota, muda cor, DM de veredito)
- Starboard — **free** (autostar, emoji custom — **premium**)
- Níveis / XP — **100% premium** (XP texto/voz, leaderboard, rewards, cards)
- Feeds/lembretes — **free** (disparo imediato — **premium**)
  - Feeds com ping temporário; autofeeds recorrentes; reminders/DM; alertas free-games
- Notificações — **free com caps** (Twitch 2, YouTube 5; premium 5/20)
- Embeds — **free** (builder JSON, reusável em tags/welcomes)
- Utilidades — **free** (`info`, `avatar`, `serverinfo`, `dump` com flags, highlights pager, polls, giveaways)
- Fun/games — **free** (animais, texto estilizado, 8ball, roll, steal emoji, games)
- Sticky messages — **premium**
- Personalização (avatar/banner do bot) — **premium**
- **NÃO tem tickets em nenhum plano**

## Comandos

| Comando | Descrição | Free? |
|---|---|---|
| `rr make/add/unique/verify/drop/binding/reversed/limit` | Reaction roles e modos | sim |
| `autorole`, `timedrole`, `rank` | Cargos automáticos/self-roles | sim |
| `ban/softban/tempban/massban/kick/mute/hardmute/timeout/warn` | Punições | sim |
| `warns/notes`, `purge/cleanup`, `lockdown`, `report` | Histórico, limpeza, lockdown, denúncia | sim |
| `slowmode`, `censor`, `capslimit`, `honeypot`, `automod ...` | Regras de automod | sim |
| `autopurge`, `lockdown setup`, `rr temp` | Limpeza agenda, temp roles | não |
| `log .../aio`, `modlog ...` | Auditoria e modlogs | sim |
| `tag +`, `tag share`, triggers | Comandos custom + TagScript | sim |
| `suggest/approve/deny`, `starboard` | Sugestões, starboard | sim |
| `set welcome/joindm/leave/banmsg`, `birthday` | Boas-vindas, aniversários | sim |
| `feeds/af/remindme`, `twitch/youtube` | Feeds, lembretes, alertas | sim |
| `embed/cembed`, `poll`, `giveaway`, `sticky` | Embeds, enquetes, sorteios (sticky = premium) | sim/não |
| `level/leaderboard/lvl reward` | XP e ranking | não |
| `info/avatar/serverinfo/dump/hl` | Utilidades | sim |

## Ações automáticas

- Automod pune por spam/palavrão/caps/honeypot; sticky roles devolvem cargos; reaction roles; logs; welcome DM; farewell; starboard; autofeeds; lives/uploads; level-up com rewards (premium); sticky + autopurge (premium); suggestions com votação.

## O que copiar / melhorar no Lostyo

- Copiar: reaction roles com modos + `rr make` interativo; TagScript + biblioteca pública de tags; feeds com ping temporário; `log aio`; modlog com ranking/export; purge com filtros; honeypot; drama watcher; starboard; dump com flags.
- Melhorar: níveis 100% premium → dar XP/leaderboard/rewards **free**; sem tickets → adicionar; docs só em inglês → i18n pt-BR; TagScript íngreme → builder visual + templates; muterole legado → timeout nativo.
