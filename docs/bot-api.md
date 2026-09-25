# Contrato da API Bot <-> Dashboard

Base: `http://<host-do-bot>:<BOT_API_PORT>` (default `3001`).
Servidor embutido em `src/api/server.js` (só `node:http`, sem express); sobe junto ao bot.

## Env

| Var | Obrigatória | Default | Uso |
|---|---|---|---|
| `BOT_API_PORT` | não | `3001` | porta do HTTP embutido |
| `DASHBOARD_API_SECRET` | sim (p/ rotas de guild) | — | valor do header `x-api-key` |
| `SITE_URL` | não | — | única origin com CORS (ex: `https://seu-site.com`) |
| `SUPABASE_URL` / `SUPABASE_KEY` | não | — | backend remoto do `src/db` (fallback YAML local) |

## Auth

- `GET /api/health` — **pública** (sem auth), para uptime checks.
- Todo o resto exige header `x-api-key: <DASHBOARD_API_SECRET>`:
  - sem header ou valor errado -> `401 { "error": "unauthorized" }`
  - sem `DASHBOARD_API_SECRET` configurado no bot -> `503 { "error": "api_not_configured" }`

## CORS

Só a origin exatamente igual a `SITE_URL` recebe `Access-Control-Allow-Origin`.
Preflight `OPTIONS` liberado para `GET, PUT, OPTIONS` com headers `Content-Type, x-api-key`.
Sem `SITE_URL`, nenhum header CORS é enviado (same-origin/curl continuam ok).

## Endpoints

### GET /api/health (público)

```bash
curl http://localhost:3001/api/health
# {"ok":true,"guilds":3,"uptime":1234}
```

### GET /api/guilds/:id/settings

```bash
curl -H "x-api-key: $DASHBOARD_API_SECRET" http://localhost:3001/api/guilds/1388811770273075220/settings
# {"guildId":"...","language":"pt-BR","prefix":null}
```

- `language` = `locale-<guild>` (ou o idioma resolvido atual).
- `prefix` = `prefix-<guild>` (ou `null`).

### PUT /api/guilds/:id/settings

Body JSON: `{ "language": "pt-BR" | "en-US", "prefix": "!" | null }` (campos opcionais).

```bash
curl -X PUT -H "Content-Type: application/json" -H "x-api-key: $DASHBOARD_API_SECRET" \
  -d '{"language":"pt-BR","prefix":"!"}' \
  http://localhost:3001/api/guilds/1388811770273075220/settings
```

Erros: `400 invalid_json | invalid_language | invalid_prefix`, `404 guild_not_found`.

### GET /api/guilds/:id/cases[?limit=20]

Últimos casos de moderação (`cases-<guild>`, máx 100).

```bash
curl -H "x-api-key: $DASHBOARD_API_SECRET" "http://localhost:3001/api/guilds/ID/cases?limit=20"
# {"guildId":"...","cases":[{"id":1,"ts":...,"action":"warn","userId":"...","modId":"...","reason":"..."}]}
```

### GET /api/guilds/:id/levels

```bash
curl -H "x-api-key: $DASHBOARD_API_SECRET" http://localhost:3001/api/guilds/ID/levels
# {"guildId":"...","entries":[{"userId":"...","xp":120,"level":1}],"rewards":{"5":"roleId"},"levelMessage":null}
```

- `entries`: top 100 por XP (`xp-<guild>`).
- `rewards`: `levelrewards-<guild>`; `levelMessage`: `levelmsg-<guild>`.

### GET /api/guilds/:id/economy

```bash
curl -H "x-api-key: $DASHBOARD_API_SECRET" http://localhost:3001/api/guilds/ID/economy
# {"guildId":"...","currency":"coins","balances":[{"userId":"...","wallet":10,"bank":0}],"shop":[...]}
```

## Erros comuns

| Status | Significado |
|---|---|
| 400 | `invalid_guild_id` / `invalid_json` / `invalid_language` / `invalid_prefix` |
| 401 | `unauthorized` (header ausente/errado) |
| 404 | `guild_not_found` (bot não está no servidor) ou `not_found` |
| 500 | `internal` |
| 503 | `api_not_configured` (falta `DASHBOARD_API_SECRET` no bot) |
