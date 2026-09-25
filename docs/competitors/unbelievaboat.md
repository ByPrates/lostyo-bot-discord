# Bot: UnbelievaBoat

- Site: https://unbelievaboat.com — Comandos: https://unbelievaboat.com/commands — API: https://unbelievaboat.com/api/docs
- Modelo: freemium por servidor (~$6.99/mês, ~$35/ano; legacy one-time antigo). 2M+ servidores.
- Foco: **economia per-server** (cash+banco, loja) + cassino + moderação básica. Slash + prefixo híbrido.

## Árvore de recursos

- Economia — **free** (loja >25 itens, horário exato de role-income, custom income — **premium**)
  - cash + bank + total; `set-currency`, `set-start-balance`, `maximum-balance`
  - `money`, `deposit/withdraw`, `give-money`, `leaderboard` (-cash/-bank/-total)
  - Admin: `add/remove-money` (membro/cargo), `reset-money/economy`, `money-audit-log`
- Renda — **free**
  - `work` (sem risco), `crime`/`slut` (risco de multa configurável), `rob` (fórmula fixa), `collect-income`/`role-income` (por cargo), `chat-money` passivo por mensagem
  - Tuning: `set-payout/fail-rate/fine-amount/cooldown`; replies custom (`add-reply`)
- Loja — **free até 25 itens** (ilimitado, 5 ações/requisitos — **premium**)
  - `store/item-info/inventory/buy-item/use-item/give-item`; ações (mensagem, cargos) + requisitos (saldo, cargo, item)
- Cassino — **free** (`blackjack`, `roulette`, `higher-lower`, `cock-fight`, `russian-roulette` e `slot-machine` prefix-only, `animal-race`)
  - Limites: `set-bet-limit`, `set-game-cooldown`
- Animais — **free** (compra, provisões, corrida PvP)
- Moderação — **free** (`ban/kick/soft-ban/temp-ban/mute/voice-kick/warn/purge`, mod-log, mod-role, muted-role)
- Automod — **free** (invites/links com whitelist, mass mentions, ignore, silent)
- Logs — **free 25 msgs** (100 — **premium**); money-audit-log — **free**
- Onboarding — **free** (auto-role, welcome/goodbye, gatekeeper `member-agree`, self-roles, suggestions, counting)
- Lembretes, fun (`dog/cat/dad-joke`), NSFW com gate de voto — **free**
- Permissões (`perms`, `enable/disable`, `channel-override`) — **free**
- API REST completa (saldo, leaderboard, loja, inventário) — **free com token**
- Perfil de bot custom, vanity URL, dashboard sem ads — **premium**
- **NÃO tem**: crafting, pets, bolsa, leilão, XP/levels

## Comandos

| Comando | Descrição | Free? |
|---|---|---|
| `money/deposit/withdraw/give-money/leaderboard` | Saldo e ranking | sim |
| `add-money/remove-money`, `set-currency/payout/fail-rate` | Admin e tuning | sim |
| `work/crime/slut/rob/collect-income` | Renda | sim |
| `blackjack/roulette/higher-lower/cock-fight/slot-machine` | Cassino | sim |
| `store/buy-item/use-item/inventory` | Loja | sim (25 itens) |
| `ban/kick/temp-ban/mute/warn/purge` | Moderação | sim |
| `auto-mod-invites/mentions`, logs | Automod e logs | sim |
| `auto-role/self-role/member-agree/user-join` | Onboarding | sim |
| `remind-me`, `dog/cat`, infos | Lembretes, fun, info | sim |

## Ações automáticas

- Chat-money passivo; role-income automático; automod; auto-role + welcome; logs contínuos; item actions temporizadas; API externa.

## O que copiar / melhorar no Lostyo

- Copiar: cash/bank + all; tuning por comando; custom replies; loja com actions+requirements; leaderboard web + audit-log; gatekeeper; API REST.
- Melhorar: loja ilimitada free; odds configuráveis por jogo; tudo em slash; crafting/pets/bolsa/XP free; export/import JSON de balances; i18n (só tem inglês); preço por servidor.
