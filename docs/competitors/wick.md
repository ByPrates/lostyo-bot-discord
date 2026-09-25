# Bot: Wick

- Site: https://wickbot.com — Docs: https://docs.wickbot.com
- Modelo: freemium por servidor (Premium ~$5/mês 1 servidor, VIP ~$20/mês 12 servidores).
- Foco: **segurança** — anti-nuke, anti-raid, automod comportamental (Heat), verificação, quarantine, lockdown, backups. Não tem níveis, economia, música, tickets, reaction roles.

## Árvore de recursos

- Anti-Nuke — **free base** (webhooks, prune, strict roles, vanity, Panic Mode — **premium**)
  - Limites min/hora p/ canais, cargos, mass ban/kick → quarentena o admin
  - Quarantine Hold: mexer em quarentenado sem permissão = quarentena
- Backups (Imaging) — **premium** (snapshot ~3h, save/load/sync; free só restore via memória)
- Heat System (automod adaptativo) — **free** (multiplier, max-heat custom — **premium**)
  - Heat decai com o tempo; ads/NSFW/malicioso = calor máximo (timeout/kick/ban direto)
  - Strikes com CAP + multiplier (1min → 11 → 22 → 44...); auto-lockdown em ping-raid
  - Whitelist por membro/cargo/canal/webhook × tipo
- Join Gate — **free** (sem avatar, conta nova, bot não-autorizado, nome com invite, suspeito, blacklist de username)
- Join Raid — **premium** (algoritmos string/age/nopfp/ID, warned roles, log web)
- Verificação — **free** (botão Verify, captcha/none/web, alvo todos ou suspeitos; captcha custom e regeneração — **premium**)
- Lockdown — **free** (canal/todos + auto-kick/ban em joins; cargos, server-wide, `-blind` — **premium**)
- Quarantine — **free** (cargo isolado, pilar central; strict = premium)
- Moderação — **free** (`w!ban/kick/quarantine/timeout/warn/purge/slowmode/notes/cases`, appeals, permits, rescue key 2FA)
- Purge com filtros ricos (user/role/webhook, embeds, suspicious, contains/starts-with...) — **free**

## Comandos

| Comando | Descrição | Free? |
|---|---|---|
| `w!setup`, `w!statics` | Auto-setup + statics | sim |
| `w!whitelist` | Whitelist granular | sim |
| `w!ban/kick/quarantine/timeout/warn` | Punições + isolamento | sim |
| `w!purge/sweep/clear` | Limpeza com filtros | sim |
| `w!lockdown/lock` (+ unlock) | Trava canais | sim (cargos/server-wide = premium) |
| `w!sanitize/dehoist`, `w!slowmode` | Nicks e slowmode | sim |
| `w!heat` | Configura automod | sim (multiplier/max = premium) |
| `w!an/antinuke`, `w!anpanic` | Anti-nuke e Panic Mode | misto/premium |
| `w!jg`, `w!joinraid` | Join gate e raid | sim/premium |
| `w!verification`, `w!verify` | Verificação | sim |
| `w!tshoot`, `w!misc`, `w!config` | Diagnóstico e config | sim |
| `w!backups` | Snapshots | não |

## Ações automáticas

- Quarentena de admin abusivo; Panic Mode com restore (premium); Heat com timeout/kick/ban; lockdown em ping-raid; Join Gate/Raid; verificação; Quarantine Hold; escada de warns; logs.

## O que copiar / melhorar no Lostyo

- Copiar: anti-nuke por limites com quarantine; Heat com decaimento + multiplier; Panic Mode com restore; Join Gate por filtro; purge com filtros; permits/statics + rescue key; lockdown `-blind`; `tshoot`.
- Melhorar: setup pesado → wizard + defaults seguros; heurística cega pega legítimos → allowlist; conflito com bots legítimos; automod só por volume → camada semântica/IA; captcha atrita mobile → verify invisível; modo dry-run p/ calibrar; preço por servidor.
