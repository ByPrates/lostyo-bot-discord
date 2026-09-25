# Plano de implementação — comandos Lostyo

Princípios: só slash · inglês default + pt-BR · embed branco simples · tudo free.
Status: ✅ pronto · 🔜 fase atual · ⬜ backlog

---

## P1 — Moderação + boas-vindas (base)

| Slash | Descrição | Ação |
|---|---|---|
| `/ban user reason?` | Bans a member. | Bane + embed de confirmação ✅ |
| `/kick user reason?` | Kicks a member. | Expulsa ✅ |
| `/timeout user minutes?` | Times out a member. | Timeout ✅ |
| `/unban user_id` | Unbans a user. | Desbane por ID 🔜 |
| `/warn user reason` | Warns a member. | Registra advertência (DB) 🔜 |
| `/warnings user` | Shows member warnings. | Lista + total 🔜 |
| `/clearwarn user case?` | Clears warnings. | Remove uma/todas 🔜 |
| `/purge amount user?` | Deletes messages. | Bulk delete 1–100 com filtro 🔜 |
| `/lock` / `/unlock` | Locks/unlocks channel. | Nega/libera SendMessages 🔜 |
| `/slowmode seconds` | Sets channel slowmode. | Rate limit 🔜 |
| `/setwelcome channel? message?` | Configures welcome. | Mensagem de entrada + DM ⬜ |
| `/setgoodbye channel?` | Configures goodbye. | Mensagem de saída ⬜ |
| `/autorole role` | Sets auto role. | Cargo ao entrar ⬜ |

## P2 — Diferenciais (níveis + tickets + logs)

| Slash | Descrição | Ação |
|---|---|---|
| `/rank user?` | Shows level and XP. | Card de rank ⬜ |
| `/leaderboard` | Server XP ranking. | Top 10 ⬜ |
| `/give-xp user amount` | Gives XP (staff). | Ajuste manual ⬜ |
| `*auto*` | XP por mensagem + level-up + role reward | Engine (sem comando) ⬜ |
| `/ticket-setup` | Creates ticket panel. | Painel com botão ⬜ |
| `/ticket-add user` | Adds member to ticket. | Permissão no canal ⬜ |
| `/ticket-remove user` | Removes member. | Remove permissão ⬜ |
| `*auto*` | Close/claim/transcript via botões | Componentes ⬜ |
| `/setlog type channel` | Configures audit log. | join/leave/edit/delete/mod ⬜ |

## P3 — Engajamento (cargos, sorteios, enquetes)

| Slash | Descrição | Ação |
|---|---|---|
| `/rr message emoji role` | Adds reaction role. | Self-role por reação/botão ⬜ |
| `/giveaway duration winners prize` | Starts a giveaway. | Sorteio com timer ⬜ |
| `/reroll giveaway_id` | Re-rolls winners. | Novo sorteio ⬜ |
| `/poll question options` | Creates a poll. | Enquete até 10 opções ⬜ |

## P4 — Utilidade + diversão

| Slash | Descrição | Ação |
|---|---|---|
| `/serverinfo` | Server information. | Info em embed ⬜ |
| `/avatar user?` | Shows avatar. | Imagem grande ⬜ |
| `/reminder minutes text` | Sets a reminder. | DM/lembrete ⬜ |
| `/8ball question` | Magic 8-ball. | Resposta aleatória ⬜ |
| `/coinflip` | Flips a coin. | Cara/coroa ⬜ |
| `/cat` · `/dog` | Random image. | API grátis (cataas/dog.ceo) ⬜ |

---

Ordem sugerida: terminar P1 → P2 (tickets primeiro, maior brecha) → P3 → P4.
DB: migrar XP/warns/tickets pra Supabase antes da P2 (`src/db/`).
