require('dotenv').config();
const H = () => ({ Authorization: 'Bot ' + process.env.CLIENT_TOKEN, 'Content-Type': 'application/json' });
const W = 0xffffff;
const E = (title, desc) => ({ title, description: desc, color: W, timestamp: new Date().toISOString() });

const PATCHES = [
  { ch: '1392833189264752730', msg: '1554284659058286643', embeds: [E('📜 REGRAS — LEIA ANTES DE NEGOCIAR',
`Bem-vindo à **Lostyo**, marketplace de contas de jogos com intermédio seguro.

**1. Intermédio obrigatório**
Toda negociação passa por ticket com \`/escrow\`. Negociar por DM não tem cobertura: se cair em golpe, a staff não se responsabiliza.

**2. Taxa do intermédio (paga pelo comprador)**
Até R$250,00: **R$9,70** | Acima de R$250,00: **R$19,70**.
Ex: conta de R$100 → comprador paga R$109,70, vendedor recebe R$100.

**3. Só vende com CNPJ cadastrado**
Para anunciar, o vendedor precisa ter CNPJ registrado na loja (fale com a staff: \`/escrow cadastrar\`). Sem cadastro, o bot nem abre o escrow.

**4. Pagamento ao vendedor em até 24h**
O vendedor recebe assim que o comprador confirmar que está tudo certo, dentro de 24h após a entrega.

**5. Conta recuperável = B.O.**
Tentar vender conta que pode ser recuperada, roubada ou hackeada resulta em **boletim de ocorrência**, ban e exposição em ⛔┃denuncias-blacklist.

**6. Staff nunca chama por DM**
Intermediador só atua dentro do ticket. Desconfie de perfis se passando pela equipe: denuncie.

✅ Lendo aqui você confirma que concorda.`) ] },

  { ch: '1554279595237314601', msg: '1554284789089959988', embeds: [E('❓ COMO FUNCIONA O INTERMÉDIO',
`Você não entrega nada direto um ao outro. A gente segura os dois lados e só troca quando tudo confere.

**Passo a passo**
**1.** Vendedor (com CNPJ cadastrado) anuncia em 📸┃divulgar-contas seguindo o modelo fixado.
**2.** Comprador clica em **Abrir ticket** em 🎫┃abrir-ticket → nasce um canal privado só com vocês dois + equipe. É assim que sabemos quem é quem: o ticket registra tudo.
**3.** Intermediador roda \`/escrow criar\` marcando vendedor e comprador + preço. O bot calcula a taxa sozinho (R$9,70 até R$250 / R$19,70 acima).
**4.** Vendedor envia login + senha + e-mail ao intermediador, que **testa na hora** → \`/escrow conta-recebida\`.
**5.** Comprador paga o total e manda o comprovante → \`/escrow pagamento-recebido\`.
**6.** Intermediador faz a troca: conta para o comprador, e o vendedor recebe em até 24h após a confirmação → \`/escrow concluir\`.
**7.** Comprador troca e-mail/senha na hora, confirma "recebido e logado", ganha vouch em ⭐┃vouches.

**Prazos**
30 minutos para cada etapa. Sumiu no meio = escrow cancelado e devolução como estava. Garantia de 24h contra recuperação.`) ] },
];

(async () => {
  for (const p of PATCHES) {
    try {
      const r = await fetch(`https://discord.com/api/v10/channels/${p.ch}/messages/${p.msg}`, {
        method: 'PATCH', headers: H(), body: JSON.stringify({ embeds: p.embeds }), signal: AbortSignal.timeout(20000),
      });
      console.log(`${r.ok ? 'OK' : 'FAIL ' + r.status} -> ${p.ch}/${p.msg}`);
    } catch (e) { console.log(`ERR -> ${p.ch}: ${e.message}`); }
  }
  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
