require('dotenv').config();
const { emojis } = require('../src/config');
const H = () => ({ Authorization: 'Bot ' + process.env.CLIENT_TOKEN, 'Content-Type': 'application/json' });
const V2 = 32768, W = 0xffffff;
const TICKET = `<:ticket:${emojis.ticket}>`, ANUNCIO = `<:anuncio:${emojis.anuncio}>`;
const REGRAS = `<:regras:${emojis.regras}>`, AJUDA = `<:ajuda:${emojis.ajuda}>`;
const VOUCH = `<:vouch:${emojis.vouch}>`, DENUNCIA = `<:denuncia:${emojis.denuncia}>`;
const NEWS = `<:news:${emojis.news}>`, CHAT = `<:chat:${emojis.chat}>`;
const CHECK = `<:check:${emojis.check}>`;
const T = (c) => ({ type: 10, content: c });
const E = (title, desc) => ({ title, description: desc, color: W, timestamp: new Date().toISOString() });
const VITRINE = '<#1554279603424596039>', TICKETCH = '<#1554279618222100550>';
const VOUCHES = '<#1554279621942448189>';

const PATCHES = [
  { ch: '1392833189264752730', msg: '1554284659058286643', body: { embeds: [E(`${REGRAS} REGRAS — LEIA ANTES DE NEGOCIAR`,
`Bem-vindo à **Lostyo**, marketplace de contas de jogos com intermédio seguro.

**1. Intermédio obrigatório**
Toda negociação passa por ticket em ${TICKETCH} com \`/escrow\`. Negociar por DM não tem cobertura: se cair em golpe, a staff não se responsabiliza.

**2. Taxa do intermédio (paga pelo comprador)**
Até R$250,00: **R$9,70** | Acima de R$250,00: **R$19,70**.
Ex: conta de R$100 → comprador paga R$109,70, vendedor recebe R$100.

**3. Só vende com CPF cadastrado**
Para anunciar, o vendedor precisa ter CPF registrado (fale com a staff: \`/escrow cadastrar\`) e publica pelo botão de anúncio. Sem cadastro, o bot nem abre o escrow.

**4. Pagamento ao vendedor em até 24h**
O vendedor recebe assim que o comprador confirmar que está tudo certo, dentro de 24h após a entrega.

**5. Conta recuperável = B.O.**
Tentar vender conta que pode ser recuperada, roubada ou hackeada resulta em **boletim de ocorrência**, ban e exposição em ${DENUNCIA}.

**6. Staff nunca chama por DM**
Intermediador só atua dentro do ticket. Desconfie de perfis se passando pela equipe: denuncie.`) ] } },

  { ch: '1554279595237314601', msg: '1554284789089959988', body: { embeds: [E(`${AJUDA} COMO FUNCIONA O INTERMÉDIO`,
`Você não entrega nada direto um ao outro. A gente segura os dois lados e só troca quando tudo confere.

**Passo a passo**
**1.** Vendedor (CPF cadastrado) clica em ${ANUNCIO} **Criar anúncio** em ${VITRINE} → anúncio numerado (#7, #8...).
**2.** Comprador clica em ${TICKET} **Abrir ticket** em ${TICKETCH}, informa o **ID do anúncio** → canal privado na categoria TICKETS.
**3.** Intermediador roda \`/escrow criar\` marcando vendedor e comprador + preço + ID do anúncio. Taxa automática: R$9,70 até R$250 / R$19,70 acima.
**4.** Vendedor envia login + senha + e-mail ao intermediador, que **testa na hora** → \`/escrow conta-recebida\`.
**5.** Comprador paga o total e manda o comprovante → \`/escrow pagamento-recebido\`.
**6.** Intermediador faz a troca: conta para o comprador, e o vendedor recebe em até 24h após a confirmação → \`/escrow concluir\`.
**7.** Comprador troca e-mail/senha na hora, confirma "recebido e logado", ganha vouch em ${VOUCHES} ${VOUCH}.

**Prazos**
30 minutos por etapa. Sumiu no meio = escrow cancelado e devolução como estava. Garantia de 24h contra recuperação.`) ] } },

  { ch: '1554279621942448189', msg: '1554285058997747733', body: { embeds: [E(`${VOUCH} VOUCHES — PROVA DE CONFIANÇA`,
`Só a staff posta aqui após cada venda concluída.

Modelo:
\`\`\`
${CHECK} Venda concluída
Vendedor: @
Comprador: @
Item: (jogo + conta)
Valor: R$
Intermediador: @
\`\`\`
Antes de comprar, confira o histórico de quem vende aqui.`) ] } },

  { ch: '1554279591294672896', msg: '1554285075334434838', body: { embeds: [E(`${NEWS} A Lostyo está aberta!`,
`Marketplace de contas de jogos com **intermédio seguro**.

Leia as regras e o como-funciona acima.
Ofertas em ${VITRINE} ${ANUNCIO}
Negocie em ${TICKETCH} ${TICKET}

Boas vendas!`) ] } },

  { ch: '1554279630045712448', msg: '1554285095584661505', body: {
    content: `${CHAT} **Chat geral aberto!** Dúvidas em <#1554279599708307456>. Para comprar: escolha em ${VITRINE} e abra ticket em ${TICKETCH}. Para vender: botão ${ANUNCIO} **Criar anúncio** (precisa CPF).` } },

  { ch: '1554279618222100550', msg: '1554290295623917669', body: { flags: V2, components: [{
    type: 17, accent_color: W, components: [
      T(`# ${TICKET} Intermédio com taxa\nCompre e venda contas com segurança: a loja segura os dois lados.`),
      { type: 9, components: [T('Tenha em mãos o **ID do anúncio** (ex: 7). Sem ID não tem atendimento.')],
        accessory: { type: 2, style: 1, label: 'Abrir ticket', custom_id: 'ticket-open',
          emoji: { name: 'ticket', id: emojis.ticket } } },
    ] }] } },

  { ch: '1554279603424596039', msg: '1554290313710014505', body: { flags: V2, components: [{
    type: 17, accent_color: W, components: [
      T(`# ${ANUNCIO} Como anunciar\nA vitrine é automática: membros não postam aqui.`),
      { type: 9, components: [T('Clique no botão e preencha jogo, título, preço, descrição e foto. O bot publica numerado (#7, #8...).')],
        accessory: { type: 2, style: 1, label: 'Criar anúncio', custom_id: 'anuncio-open',
          emoji: { name: 'anuncio', id: emojis.anuncio } } },
    ] }] } },
];

(async () => {
  for (const p of PATCHES) {
    try {
      const r = await fetch(`https://discord.com/api/v10/channels/${p.ch}/messages/${p.msg}`, {
        method: 'PATCH', headers: H(), body: JSON.stringify(p.body), signal: AbortSignal.timeout(20000),
      });
      console.log(`${r.ok ? 'OK' : 'FAIL ' + r.status} -> ${p.ch}/${p.msg}`);
    } catch (e) { console.log(`ERR -> ${p.ch}: ${e.message}`); }
    await new Promise(r2 => setTimeout(r2, 1000));
  }
  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
