const fs = require('fs');
const path = require('path');
const DIR = path.join(process.env.TEMP || process.env.TMP || '.', 'pack-emojis');
fs.mkdirSync(DIR, { recursive: true });
const FILES = {
  'ticket.png': 'https://cdn3.emoji.gg/emojis/416391-mail.png',
  'anuncio.png': 'https://cdn3.emoji.gg/emojis/435031-shoppingcart.png',
  'regras.png': 'https://cdn3.emoji.gg/emojis/401776-book.png',
  'ajuda.png': 'https://cdn3.emoji.gg/emojis/977720-question.png',
  'vouch.png': 'https://cdn3.emoji.gg/emojis/510611-star.png',
  'denuncia.png': 'https://cdn3.emoji.gg/emojis/685108-warn.png',
  'news.png': 'https://cdn3.emoji.gg/emojis/1882-megaphone.png',
  'chat.png': 'https://cdn3.emoji.gg/emojis/13860-house.png',
  'check.png': 'https://cdn3.emoji.gg/emojis/3621-verified-white.png',
};
(async () => {
  for (const [f, url] of Object.entries(FILES)) {
    const r = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!r.ok) { console.log(`FAIL ${f}: ${r.status}`); continue; }
    const buf = Buffer.from(await r.arrayBuffer());
    fs.writeFileSync(path.join(DIR, f), buf);
    console.log(`OK ${f} ${buf.length}b`);
  }
  process.exit(0);
})().catch(e => { console.error('ERR ' + e.message); process.exit(1); });
