# Bot: Dyno

- Site: https://dyno.gg — Docs: https://docs.dyno.gg
- Modelo: freemium por servidor (Standard ~$5.99/mês, Premium ~$7.99/mês, Custom ~$12.99/mês com bot próprio). 5M+ servidores, desde 2016.
- Foco: moderação + utilidades via dashboard modular. Prefixo `?` + slash.

## Árvore de recursos

- Moderação — **free** (resposta de punição custom — **premium**)
  - kick/ban/mute/timeout, warns, notes, modlogs com casos numerados, cargos de mod e protegidos
  - DM ao punido com motivo + appeal; autopunish por warns (free: máx 3); lockdown com timer
- Automod (19 filtros) — **free** (resposta custom por regra, log por regra — **premium**)
  - Caps, bad words, quebras de linha, texto duplicado, emoji spam, spam rápido, image spam, invites, phishing, links, mass mentions, spoilers, masked links, stickers, zalgo
  - Ações: warn verbal, delete, auto mute/ban; expira em 5min; ignora staff
- Autoban — **free** (1 regra: idade da conta, sem avatar)
- Action Log — **free** (delete/edit, bulk, invites, joins com cargos, roles, voz, canais; por webhook)
- Auto Delete / Auto Message — **free** (1 cada); Auto Purge e Slowmode — **premium**
- Autoresponder — **free até 10** (gatilhos, embeds, variáveis `{user}`, `{server}`...)
- Custom Commands — **free até 25** (variáveis, encadeia comandos, permissão por cargo/canal)
- Autoroles + ranks — **free** (3 autoroles, delay até 7 dias; premium 14 dias)
- Reaction Roles — **free** (3 menus, 1 cargo por vez; modos Normal/Add/Remove Only)
- Welcome/Announcements — **free** (mensagem/embed/DM; imagem custom — **premium**)
- Giveaways — **free** (3 ativos, 1 mês; página pública, DM, cargo, referral)
- Starboard — **free** (custom avançada — **premium**)
- Níveis — **premium** (Standard+)
- Forms — **free até 3**; Tags — **free**; Reminders — **free**; Highlights (DM por palavra) — **free**; AFK — **free**
- Fun — **free** (cat/dog/pug, flip, dadjoke...); Embedder — **free** (3); Polls — **free** (10 opções)
- Alertas sociais (Twitch/YouTube/TikTok/Reddit/Kick) — **premium**; Voice Text Linking — **premium**

## Comandos

| Comando | Descrição | Free? |
|---|---|---|
| `/ban`, `/kick`, `/mute`, `/deafen` | Punições | sim |
| `/case`, `/modlogs`, `/moderations`, `/modstats` | Casos e stats | sim |
| `/note`, `/notes`, `/warn` | Notas e warns | sim |
| `/purge ...` (15 filtros) | Limpeza em massa | sim |
| `/lock`, `/lockdown` | Tranca canais | sim |
| `/customs`, `/command`, `/module` | Liga/desliga comandos e módulos | sim |
| `/addrank`, `/rank`, `/afk` | Ranks e AFK | sim |
| `/poll`, `/giveaway` | Enquetes e sorteios | sim |
| `/highlights`, `/members`, `/avatar`, `/serverinfo` | Utilidades | sim |
| `/cat`, `/dog`, `/dadjoke`, `/pokemon` | Fun e buscas | sim |

## Ações automáticas

- Automod com escada de punição; autoban de contas novas; autoroles temporizados; auto delete/message; welcome + DM de punição; alertas sociais (premium); giveaways com término automático; XP (premium); logs e modlogs.

## O que copiar / melhorar no Lostyo

- Copiar: dashboard 100% modular; automod com 19 filtros free; modlogs com casos + notes + appeal; limites free explícitos; `?diagnose`; giveaway com página pública.
- Melhorar: preço por servidor escala mal; social alerts e levels no paywall; outages no free; automod só por strings — camada semântica; self-host elimina lock-in.
