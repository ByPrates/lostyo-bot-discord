# Bot: MEE6

- Site: https://mee6.xyz
- Modelo: freemium por servidor (~$11.99/mês, ~$49.99/ano por servidor). Empresa Sidescroll Ventures, 20M+ servidores.
- Foco: all-in-one — níveis/XP, moderação, alertas sociais, tickets, dashboard web.

## Árvore de recursos

- Níveis / XP — **premium**
  - XP por mensagem (15–25 padrão, ajustável), cooldown anti-flood
  - Mensagem de level-up (canal atual/custom/DM) com variáveis `{player}`, `{level}`
  - Role rewards por nível (stack ou replace)
  - `/rank` com card customizável, leaderboard web + vanity URL
  - `give-xp` / `remove-xp` manual
- Moderação / AutoMod — **premium**
  - Filtros: palavrões (lista custom), texto repetido, invites, links externos, caps, emojis/spoilers/mentions excessivos
  - Imunidade por cargo/canal (admin imune por padrão)
  - Punição progressiva: X warns em Y dias → mute/tempban/ban
  - Log de auditoria (mute, ban, edit, delete, voz)
  - `/ban`, `/tempban`, `/kick`, `/mute`, `/tempmute`, `/unmute`, `/unban`, `/warn`, `/infractions`
- Gestão — **premium**
  - Automations (trigger → condição → ação, até 50)
  - Custom commands (até 500), prefixo custom
  - Reaction roles (emoji/botão/dropdown, até 40)
  - Ticketing (painel, canal/thread privado, transcripts)
  - Welcome/Goodbye (mensagem, DM, card, auto-role)
  - Invite tracker + leaderboard
  - Bot personalizer (nome/avatar/white-label)
- Utilidades
  - `/youtube`, `/twitch`, `/imgur`, `/anime`, `/manga`, `/pokemon`, `/urban` — **free**
  - Polls, embeds (500), stats counters, canais de voz temporários, reminders — **premium**
- Alertas sociais — **premium**
  - Twitch, YouTube, X, Instagram, TikTok, Reddit, RSS, Kick, Podcasts, Bluesky
- Engajamento — **premium**
  - Economy (loja até 300 itens), giveaways, birthdays, achievements, starboard, monetize
- IA — **assinatura separada** (`/imagine`, `/write`, personas)
- Música — **removida** (descontinuada)

## Comandos

| Comando | Descrição | Free? |
|---|---|---|
| `/rank` | Nível, XP e posição | não |
| `/levels` | Link do leaderboard | não |
| `/give-xp`, `/remove-xp` | XP manual | não |
| `/ban`, `/tempban`, `/kick`, `/mute`, `/tempmute`, `/unmute`, `/unban` | Moderação | não |
| `/warn`, `/infractions` | Advertências e histórico | não |
| `/youtube`, `/twitch`, `/imgur`, `/anime`, `/manga`, `/pokemon`, `/urban` | Buscas | **sim** |
| `/invites`, `/birthday`, `/crypto`, `/imagine`, `/write` | Convites, aniversários, crypto, IA | não |

## Ações automáticas

- AutoMod com escalonamento por warns; level-up com role reward; reaction roles; welcome/goodbye; tickets com transcript; alertas sociais; reminders; invite tracker; aniversários; starboard; logs.

## O que copiar / melhorar no Lostyo

- Copiar: toggles por plugin, variáveis `{player}/{level}`, escopo por cargo/canal, leaderboard público, role rewards, alertas sociais, transcripts.
- Melhorar: liberar tudo isso no **free** (o free do MEE6 é quase vazio); pricing por servidor confunde; quedas frequentes de dashboard — focar em uptime.
