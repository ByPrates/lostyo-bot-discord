require('dotenv').config();
const H = () => ({ Authorization: 'Bot ' + process.env.CLIENT_TOKEN, 'Content-Type': 'application/json' });
const W = 0xffffff;
const E = (title, desc) => ({ title, description: desc, color: W, timestamp: new Date().toISOString() });
const VITRINE = '<#1554279603424596039>', TICKET = '<#1554279618222100550>';
const VOUCHES = '<#1554279621942448189>', DENUNCIA = '<#1554279625679442011>';
const REGRAS = '<#1392833189264752730>', COMO = '<#1554279595237314601>';
const ANUNCIOS = '<#1554279591294672896>', SUPORTE = '<#1554279599708307456>';

const PATCHES = [
  { ch: '1392833189264752730', msg: '1554284659058286643', body: { embeds: [E('📜 REGRAS — LEIA ANTES DE NEGOCIAR',
`Bem-vindo à **Lostyo**, marketplace de contas de jogos com intermédio seguro.

**1. Intermédio obrigatório**
Toda negociação passa por ticket em ${TICKET} com \`/escrow\`. Negociar por DM não tem cobertura: se cair em golpe, a staff não se responsabiliza.

**2. Taxa do intermédio (paga pelo comprador)**
Até R$250,00: **R$9,70** | Acima de R$250,00: **R$19,70**.
Ex: conta de R$100 → comprador paga R$109,70, vendedor recebe R$100.

**3. Só vende com CNPJ cadastrado**
Para anunciar, o vendedor precisa ter CNPJ registrado (fale com a staff: \`/escrow cadastrar\`) e publica pelo \`/anuncio criar\`. Sem cadastro, o bot nem abre o escrow.

**4. Pagamento ao vendedor em até 24h**
O vendedor recebe assim que o comprador confirmar que está tudo certo, dentro de 24h após a entrega.

**5. Conta recuperável = B.O.**
Tentar vender conta que pode ser recuperada, roubada ou hackeada resulta em **boletim de ocorrência**, ban e exposição em ${DENUNCIA}.

**6. Staff nunca chama por DM**
Intermediador só atua dentro do ticket. Desconfie de perfis se passando pela equipe: denuncie.`) ] } },

  { ch: '1554279595237314601', msg: '1554284789089959988', body: { embeds: [E('❓ COMO FUNCIONA O INTERMÉDIO',
`Você não entrega nada direto um ao outro. A gente segura os dois lados e só troca quando tudo confere.

**Passo a passo**
**1.** Vendedor (CNPJ cadastrado) publica com \`/anuncio criar\` → anúncio numerado (#7, #8...) aparece em ${VITRINE}.
**2.** Comprador clica em **Abrir ticket** em ${TICKET}, informa o **ID do anúncio** → nasce um canal privado na categoria TICKETS só com vocês dois + equipe.
**3.** Intermediador roda \`/escrow criar\` marcando vendedor e comprador + preço + ID do anúncio. Taxa automática: R$9,70 até R$250 / R$19,70 acima.
**4.** Vendedor envia login + senha + e-mail ao intermediador, que **testa na hora** → \`/escrow conta-recebida\`.
**5.** Comprador paga o total e manda o comprovante → \`/escrow pagamento-recebido\`.
**6.** Intermediador faz a troca: conta para o comprador, e o vendedor recebe em até 24h após a confirmação → \`/escrow concluir\`.
**7.** Comprador troca e-mail/senha na hora, confirma "recebido e logado", ganha vouch em ${VOUCHES}.

**Prazos**
30 minutos por etapa. Sumiu no meio = escrow cancelado e devolução como estava. Garantia de 24h contra recuperação.`) ] } },

  { ch: '1554279603424596039', msg: '1554285028895236168', body: { embeds: [E('📸 COMO ANUNCIAR',
`A vitrine é automática: membros não postam aqui. Vendedor com CNPJ usa:

\`/anuncio criar\`

Preencha jogo, título, preço, descrição e link da imagem. O bot publica numerado (#7, #8...). Comprador usa esse ID para abrir ticket em ${TICKET}.

\`/anuncio meus\` — seus anúncios | Staff remove com \`/anuncio remover\`.`) ] } },

  { ch: '1554279591294672896', msg: '1554285075334434838', body: { embeds: [E('📢 A Lostyo está aberta!',
`Marketplace de contas de jogos com **intermédio seguro**.

👉 Leia ${REGRAS} e ${COMO}
🛒 Ofertas em ${VITRINE}
🎫 Negocie em ${TICKET}

Boas vendas!`) ] } },

  { ch: '1554279618222100550', msg: '1554285008129236996', body: {
    content: '**🎫 INTERMÉDIO COM TAXA**\nClique abaixo, informe o **ID do anúncio** (ex: 7) e abra seu ticket privado com a equipe. Sem ID não tem atendimento.' } },

  { ch: '1554279630045712448', msg: '1554285095584661505', body: {
    content: `💬 **Chat geral aberto!** Dúvidas em ${SUPORTE}. Para comprar: escolha em ${VITRINE} e abra ticket em ${TICKET}. Para vender: \`/anuncio criar\` (precisa CNPJ).` } },
];

(async () => {
  for (const p of PATCHES) {
    try {
      const r = await fetch(`https://discord.com/api/v10/channels/${p.ch}/messages/${p.msg}`, {
        method: 'PATCH', headers: H(), body: JSON.stringify(p.body), signal: AbortSignal.timeout(20000),
      });
      console.log(`${r.ok ? 'OK' : 'FAIL ' + r.status} -> ${p.ch}/${p.msg}`);
    } catch (e) { console.log(`ERR -> ${p.ch}: ${e.message}`); }
  }
  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
