const Command = require('../../structures/command');
const http = require('../../utils/HTTPrequests');

module.exports = class CoinflipCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'coinflip',
      aliases: ['cf'],
      cooldown: 5,
      category: 'economia',
    });
  }

  async run({ message, args }, t) {
    const user1 = message.author;
    const user2 = message.mentions.users.first();
    const input = args[1];
    if (!input) return message.menheraReply('error', t('commands:coinflip.invalid-value'));
    const inputedValue = input.replace(/\D+/g, '');

    if (!user2) return message.menheraReply('error', t('commands:coinflip.no-mention'));
    if (user2.bot) return message.menheraReply('error', t('commands:coinflip.bot'));
    if (user2.id === user1.id) return message.menheraReply('error', t('commands:coinflip.self-mention'));

    if (Number.isNaN(parseInt(inputedValue))) return message.menheraReply('error', t('commands:coinflip.invalid-value'));
    if (parseInt(inputedValue) < 1) return message.menheraReply('error', t('commands:coinflip.invalid-value'));

    const valor = parseInt(inputedValue);

    const db1 = await this.client.database.Users.findOne({ id: user1.id });
    const db2 = await this.client.database.Users.findOne({ id: user2.id });

    if (!db1 || !db2) return message.menheraReply('error', t('commands:coinflip.no-dbuser'));

    if (valor > db1.estrelinhas) return message.menheraReply('error', t('commands:coinflip.poor'));
    if (valor > db2.estrelinhas) return message.channel.send(`<:negacao:759603958317711371> **|** ${user2} ${t('commands:coinflip.poor')}`);

    message.channel.send(`${user2}, ${user1} ${t('commands:coinflip.confirm-start', { value: valor })} ${user1} ${t('commands:coinflip.confirm-middle')} ${user2} ${t('commands:coinflip.win')}!\n${user2} ${t('commands:coinflip.confirm-end')}`).then((msg) => {
      msg.react('✅');
      const filter = (reaction, usuario) => reaction.emoji.name === '✅' && usuario.id === user2.id;

      const coletor = msg.createReactionCollector(filter, { max: 1, time: 7000 });

      coletor.on('collect', async () => {
        const shirleyTeresinha = ['Cara', 'Coroa'];
        const choice = shirleyTeresinha[Math.floor(Math.random() * shirleyTeresinha.length)];

        let winner;
        let loser;

        switch (choice) {
          case 'Cara':
            message.channel.send(`${t('commands:coinflip.cara')}\n${user1} ${t('commands:coinflip.cara-texto-start', { value: valor })} ${user2}! ${t('commands:coinflip.cara-text-middle')} ${user2} ${t('commands:coinflip.cara-text-end')}`);
            winner = user1.id;
            loser = user2.id;
            break;
          case 'Coroa':
            message.channel.send(`${t('commands:coinflip.coroa')}\n${user2} ${t('commands:coinflip.coroa-texto', { value: valor })} ${user1}`);
            winner = user2.id;
            loser = user1.id;
            break;
        }
        await this.client.database.Users.updateOne({ id: winner }, { $inc: { estrelinhas: valor } });
        await this.client.database.Users.updateOne({ id: loser }, { $inc: { estrelinhas: -valor } });

        await http.postCoinflipGame(winner, loser, valor, Date.now());
      });
    });
  }
};
