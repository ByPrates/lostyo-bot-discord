-- Contrato da camada remota (Supabase) do lostyo-bot-discord.
-- Key-value simples: a chave local completa (ex: 'xp-1388811770273075220') vai na
-- coluna "key"; "guild_id" é o id do servidor extraído da chave (ou 'global').
-- O bot lê/escreve via src/db/index.js (write-through assíncrono; YAML local é o cache).
--
-- Como aplicar: cole no SQL Editor do Supabase e rode.

create table if not exists public.kv_store (
    guild_id text not null,
    key text not null,
    value jsonb not null default '{"v": null}'::jsonb,
    updated_at timestamptz not null default now(),
    primary key (guild_id, key)
);

create index if not exists kv_store_guild_idx on public.kv_store (guild_id);

-- Mantém updated_at fresco em cada upsert do bot.
create or replace function public.kv_store_touch()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end $$;

drop trigger if exists kv_store_touch_trg on public.kv_store;
create trigger kv_store_touch_trg
    before update on public.kv_store
    for each row execute function public.kv_store_touch();

-- RLS: o bot usa service_role/anon via API REST com a chave do .env.
-- Ajuste conforme sua política; o mínimo para o bot funcionar:
alter table public.kv_store enable row level security;

drop policy if exists "bot full access" on public.kv_store;
create policy "bot full access" on public.kv_store
    for all using (true) with check (true);
