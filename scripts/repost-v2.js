require('dotenv').config();
const H = () => ({ Authorization: 'Bot ' + process.env.CLIENT_TOKEN, 'Content-Type': 'application/json' });
const V2 = 32768;
const T = (content) => ({ type: 10, content });

(async () => {
  // 1) Apaga painel antigo (legacy) e posta novo em V2
  await fetch('https://discord.com/api/v10/channels/1554279618222100550/messages/1554285008129236996',
    { method: 'DELETE', headers: H(), signal: AbortSignal.timeout(20000) });
  console.log('painel antigo apagado');
  const panel = await (await fetch('https://discord.com/api/v10/channels/1554279618222100550/messages', {
    method: 'POST', headers: H(), signal: AbortSignal.timeout(20000),
    body: JSON.stringify({
      flags: V2,
      components: [{
        type: 17, accent_color: 0xffffff,
        components: [
          T('# 🎫 Intermédio com taxa\nCompre e venda contas com segurança: a loja segura os dois lados.'),
          {
            type: 9,
            components: [T('Tenha em mãos o **ID do anúncio** (ex: 7). Sem ID não tem atendimento.')],
            accessory: { type: 2, style: 1, label: 'Abrir ticket', custom_id: 'ticket-open', emoji: { name: '🎫' } },
          },
        ],
      }],
    }),
  })).json();
  console.log(`painel V2: ${panel.id || JSON.stringify(panel).slice(0, 200)}`);

  // 2) Instruções da vitrine em V2
  await fetch('https://discord.com/api/v10/channels/1554279603424596039/messages/1554285028895236168',
    { method: 'DELETE', headers: H(), signal: AbortSignal.timeout(20000) });
  const inst = await (await fetch('https://discord.com/api/v10/channels/1554279603424596039/messages', {
    method: 'POST', headers: H(), signal: AbortSignal.timeout(20000),
    body: JSON.stringify({
      flags: V2,
      components: [{
        type: 17, accent_color: 0xffffff,
        components: [
          T('# 📸 Como anunciar\nA vitrine é automática: membros não postam aqui.'),
          T('Vendedor com CPF usa `/anuncio criar` e preenche jogo, título, preço, descrição e imagem. O bot publica numerado (#7, #8...).\n\n`/anuncio meus` — seus anúncios · Staff remove com `/anuncio remover`'),
        ],
      }],
    }),
  })).json();
  console.log(`vitrine V2: ${inst.id || JSON.stringify(inst).slice(0, 200)}`);
  process.exit(0);
})().catch(e => { console.error('ERR ' + e.message); process.exit(1); });
