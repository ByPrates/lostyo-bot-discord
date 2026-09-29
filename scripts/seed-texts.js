require('dotenv').config();
const H = () => ({ Authorization: 'Bot ' + process.env.CLIENT_TOKEN, 'Content-Type': 'application/json' });
const W = 0xffffff;
const E = (title, desc) => ({ title, description: desc, color: W, timestamp: new Date().toISOString() });

const POSTS = [
  { ch: '1392833189264752730', body: { embeds: [E('📜 REGRAS — LEIA ANTES DE NEGOCIAR',
`Bem-vindo à **Lostyo**, marketplace de contas de jogos com intermédio seguro.

**1. Intermédio obrigatório**
Toda negociação passa por ticket com \`/escrow\`. Negociar por DM não tem cobertura: se cair em golpe, a staff não se responsabiliza.

**2. Taxa do intermédio: 10%**
Paga pelo **comprador** sobre o preço. Ex: conta de R$100 → comprador paga R$110, vendedor recebe R$100.

**3. Contas permitidas**
Só conta própria com acesso total ao e-mail original. Proibido: conta roubada, hackeada, com recuperação ativa escondida ou compartilhada.

**4. Garantia de 24h**
Contra recuperação da conta após a entrega. Passou disso ou confirmou "recebido e logado", sem reembolso.

**5. Golpe = blacklist + ban**
Tentar vender conta recuperável, chargeback, comprovante falso ou se passar por staff resulta em ban e exposição em ⛔┃denuncias-blacklist.

**6. Staff nunca pede nada por DM**
Intermediador só atua dentro do ticket. Desconfie de perfis se passando pela equipe: denuncie.

✅ Reagindo aqui você confirma que leu e concorda.`) ] } },

  { ch: '1554279595237314601', body: { embeds: [E('❓ COMO FUNCIONA O INTERMÉDIO',
`Você não entrega nada direto um ao outro. A gente segura os dois lados e só troca quando tudo confere.

**Passo a passo**
**1.** Vendedor anuncia em 📸┃divulgar-contas seguindo o modelo fixado.
**2.** Comprador abre ticket em 🎫┃abrir-ticket.
**3.** Intermediador cria o escrow: \`/escrow criar vendedor:@ comprador:@ preco:100\`.
**4.** Vendedor envia login + senha + e-mail ao intermediador, que **testa na hora** → \`/escrow conta-recebida\`.
**5.** Comprador paga e manda o comprovante → \`/escrow pagamento-recebido\`.
**6.** Intermediador faz a troca: conta para o comprador, valor menos a taxa para o vendedor → \`/escrow concluir\`.
**7.** Comprador troca e-mail/senha na hora, confirma "recebido e logado", recebe vouch em ⭐┃vouches.

**Valores**
Preço + 10% de taxa (comprador). Pix em conta separada, só vale após compensar.

**Prazos**
30 minutos para cada etapa. Sumiu no meio = escrow cancelado e devolução como estava.`) ] } },

  { ch: '1554279618222100550', body: {
      content: '**🎫 INTERMÉDIO COM TAXA**\nClique abaixo para abrir um ticket privado com a equipe. Negociação de conta só acontece aqui dentro, com `/escrow`.',
      components: [{ type: 1, components: [{ type: 2, custom_id: 'ticket-open', label: 'Abrir ticket', style: 1, emoji: { name: '🎫' } }] }],
  } },

  { ch: '1554279603424596039', body: { embeds: [E('📸 MODELO DE ANÚNCIO (obrigatório)',
`Copie, preencha e poste. Anúncio fora do modelo é apagado.

\`\`\`
🎮 Jogo:
👤 Rank / Nível:
✨ Skins / Itens raros:
💰 Preço (R$):
📸 Prints: (anexe)
⚠️ E-mail total incluso: SIM / NÃO
📞 Negociar em: 🎫┃abrir-ticket
\`\`\`
Slowmode de 1h: 1 anúncio por hora por pessoa. Destaques vão para 🔥┃ofertas-destaque (só Vendedor Verificado).`) ] } },

  { ch: '1554279621942448189', body: { embeds: [E('⭐ VOUCHES — PROVA DE CONFIANÇA',
`Só a staff posta aqui após cada venda concluída.

Modelo:
\`\`\`
✅ Venda concluída
Vendedor: @
Comprador: @
Item: (jogo + conta)
Valor: R$
Intermediador: @
\`\`\`
Antes de comprar, confira o histórico de quem vende aqui.`) ] } },

  { ch: '1554279591294672896', body: { embeds: [E('📢 A Lostyo está aberta!',
`Marketplace de contas de jogos com **intermédio seguro e taxa de 10%**.

👉 Leia 📜┃regras e ❓┃como-funciona-taxas
🛒 Ofertas em 📸┃divulgar-contas
🎫 Negocie em 🎫┃abrir-ticket

Boas vendas!`) ] } },

  { ch: '1554279630045712448', body: { content: '💬 **Chat geral aberto!** Dúvidas rápidas aqui ou em 🆘┃suporte. Para negociar, abra ticket em 🎫┃abrir-ticket.' } },
];

(async () => {
  const me = await (await fetch('https://discord.com/api/v10/users/@me', { headers: H(), signal: AbortSignal.timeout(20000) })).json();
  for (const p of POSTS) {
    try {
      const recent = await (await fetch(`https://discord.com/api/v10/channels/${p.ch}/messages?limit=5`, { headers: H(), signal: AbortSignal.timeout(20000) })).json();
      const wantTitle = p.body.embeds?.[0]?.title;
      const wantContent = p.body.content;
      const dup = (recent || []).some(m => m.author?.id === me.id && (
        (wantTitle && m.embeds?.[0]?.title === wantTitle) ||
        (wantContent && m.content === wantContent && (m.components?.length || 0) === (p.body.components?.length || 0))
      ));
      if (dup) { console.log(`SKIP (ja existe) -> ${p.ch}`); continue; }
      const r = await fetch(`https://discord.com/api/v10/channels/${p.ch}/messages`, {
        method: 'POST', headers: H(), body: JSON.stringify(p.body), signal: AbortSignal.timeout(20000),
      });
      const j = await r.json().catch(() => ({}));
      console.log(`${r.ok ? 'OK' : 'FAIL ' + r.status} -> ${p.ch}${j.id ? ' msg=' + j.id : ''}`);
    } catch (e) { console.log(`ERR -> ${p.ch}: ${e.message}`); }
    await new Promise(r2 => setTimeout(r2, 1500));
  }
  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
