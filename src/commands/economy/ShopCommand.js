const Command = require('../../structures/command');

module.exports = class ShopCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'shop',
      aliases: ['loja'],
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
      category: 'economia',
    });
  }

  async run({ message, authorData: selfData }, t) {
    const authorData = selfData ?? new this.client.database.Users({ id: message.author.id });

    const saldoAtual = authorData.estrelinhas;

    const validArgs = ['1', '2'];

    const dataLoja = {
      title: t('commands:shop.embed_title'),
      color: '#559bf7',
      thumbnail: {
        url: 'https://i.imgur.com/t94XkgG.png',
      },
      description: t('commands:shop.embed_description_saldo', { value: saldoAtual }),
      footer: {
        text: t('commands:shop.embed_footer'),
      },
      fields: [{
        name: t('commands:shop.dataLoja_fields.name'),
        value: t('commands:shop.dataLoja_fields.value'),
        inline: false,
      }],
    };
    const embedMessage = await message.channel.send(message.author, { embed: dataLoja });

    const filter = (m) => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector(filter, { max: 1, time: 30000, errors: ['time'] });

    collector.on('collect', (m) => {
      if (!validArgs.some((answer) => answer.toLowerCase() === m.content.toLowerCase())) return message.menheraReply('error', t('commands:shop.invalid-option'));

      if (m.content === '1') {
        // eslint-disable-next-line no-use-before-define
        this.lojaComprar(message, embedMessage, authorData, saldoAtual, t, this.client.constants);
        // eslint-disable-next-line no-use-before-define
      } else this.lojaVender(message, embedMessage, authorData, saldoAtual, t, this.client.constants);
    });
  }

  lojaComprar(message, embedMessage, user, saldoAtual, t, constants) {
    const dataComprar = {
      title: t('commands:shop.embed_title'),
      color: '#6cbe50',
      thumbnail: {
        url: 'https://i.imgur.com/t94XkgG.png',
      },
      description: t('commands:shop.embed_description_saldo', { value: saldoAtual }),
      footer: {
        text: t('commands:shop.embed_footer'),
      },
      fields: [{
        name: t('commands:shop.dataComprar_fields.name'),
        value: t('commands:shop.dataComprar_fields.value'),
        inline: false,
      }],
    };
    embedMessage.edit(message.author, { embed: dataComprar }).catch();

    const validBuyArgs = ['1', '2'];

    const filter = (m) => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector(filter, { max: 1, time: 30000, errors: ['time'] });

    collector.on('collect', (m) => {
      if (!validBuyArgs.some((answer) => answer.toLowerCase() === m.content.toLowerCase())) return message.menheraReply('error', t('commands:shop.invalid-option'));

      if (m.content === '1') {
        // abre loja de cores

        const coresDisponíveis = [{
          cor: '#6308c0',
          preço: constants.shopEconomy.colors.purple,
          nome: `**${t('commands:shop.colors.purple')}**`,
        }, {
          cor: '#df0509',
          preço: constants.shopEconomy.colors.red,
          nome: `**${t('commands:shop.colors.red')}**`,
        }, {
          cor: '#55e0f7',
          preço: constants.shopEconomy.colors.cian,
          nome: `**${t('commands:shop.colors.cian')}**`,
        },
        {
          cor: '#03fd1c',
          preço: constants.shopEconomy.colors.green,
          nome: `**${t('commands:shop.colors.green')}**`,
        }, {
          cor: '#fd03c9',
          preço: constants.shopEconomy.colors.pink,
          nome: `**${t('commands:shop.colors.pink')}**`,
        }, {
          cor: '#e2ff08',
          preço: constants.shopEconomy.colors.yellow,
          nome: `**${t('commands:shop.colors.yellow')}**`,
        }, {
          cor: 'SUA ESCOLHA',
          preço: constants.shopEconomy.colors.your_choice,
          nome: `**${t('commands:shop.colors.your_choice')}**`,
        },
        ];

        const dataCores = {
          title: t('commands:shop.dataCores_fields.title'),
          color: '#6cbe50',
          thumbnail: {
            url: 'https://i.imgur.com/t94XkgG.png',
          },
          description: t('commands:shop.embed_description_saldo', { value: saldoAtual }),
          footer: {
            text: t('commands:shop.embed_footer'),
          },
          fields: [{
            name: t('commands:shop.dataCores_fields.field_name'),
            value: coresDisponíveis.map((c) => `${c.nome} | ${t('commands:shop.dataCores_fields.color_code')} \`${c.cor}\` | ${t('commands:shop.dataCores_fields.price')} **${c.preço}**⭐`).join('\n'),
            inline: false,
          }],
        };
        embedMessage.edit({ embed: dataCores });

        const validCorArgs = ['1', '2', '3', '4', '5', '6', '7'];

        const filtroCor = (msg) => msg.author.id === message.author.id;
        const CorColetor = message.channel.createMessageCollector(filtroCor, { max: 1, time: 30000, errors: ['time'] });

        CorColetor.on('collect', (msg) => {
          if (!validCorArgs.some((answer) => answer.toLowerCase() === msg.content.toLowerCase())) return message.menheraReply('error', t('commands:shop.invalid-option'));
          switch (msg.content) {
            case '1':
              if (user.cores.some((res) => res.cor === coresDisponíveis[0].cor)) return message.menheraReply('yellow_circle', t('commands:shop.buy_colors.has-color')).then(() => embedMessage.delete({ timeout: 500 }).catch());
              if (user.estrelinhas < coresDisponíveis[0].preço) return message.menheraReply('error', t('commands:shop.buy_colors.poor')).then(() => embedMessage.delete({ timeout: 500 }).catch());
              this.client.database.Users.updateOne({ id: message.author.id }, { $push: { cores: coresDisponíveis[0] }, $inc: { estrelinhas: -coresDisponíveis[0].preço } });
              message.menheraReply('success', t('commands:shop.buy_colors.buy-success', { name: coresDisponíveis[0].nome, price: coresDisponíveis[0].preço, stars: user.estrelinhas })).then(() => embedMessage.delete({ timeout: 500 }).catch());
              break;
            case '2':
              if (user.cores.some((res) => res.cor === coresDisponíveis[1].cor)) return message.menheraReply('yellow_circle', t('commands:shop.buy_colors.has-color')).then(() => embedMessage.delete().catch());
              if (user.estrelinhas < coresDisponíveis[1].preço) return message.menheraReply('error', t('commands:shop.buy_colors.poor')).then(() => embedMessage.delete({ timeout: 500 }).catch());
              this.client.database.Users.updateOne({ id: message.author.id }, { $push: { cores: coresDisponíveis[1] }, $inc: { estrelinhas: -coresDisponíveis[1].preço } });
              message.menheraReply('success', t('commands:shop.buy_colors.buy-success', { name: coresDisponíveis[1].nome, price: coresDisponíveis[1].preço, stars: user.estrelinhas })).then(() => embedMessage.delete({ timeout: 500 }).catch());
              break;
            case '3':
              if (user.cores.some((res) => res.cor === coresDisponíveis[2].cor)) return message.menheraReply('yellow_circle', t('commands:shop.buy_colors.has-color')).then(() => embedMessage.delete({ timeout: 500 }).catch());
              if (user.estrelinhas < coresDisponíveis[2].preço) return message.menheraReply('error', t('commands:shop.buy_colors.poor')).then(() => embedMessage.delete({ timeout: 500 }).catch());
              this.client.database.Users.updateOne({ id: message.author.id }, { $push: { cores: coresDisponíveis[2] }, $inc: { estrelinhas: -coresDisponíveis[2].preço } });
              message.menheraReply('success', t('commands:shop.buy_colors.buy-success', { name: coresDisponíveis[2].nome, price: coresDisponíveis[2].preço, stars: user.estrelinhas })).then(() => embedMessage.delete({ timeout: 500 }).catch());
              break;
            case '4':
              if (user.cores.some((res) => res.cor === coresDisponíveis[3].cor)) return message.menheraReply('yellow_circle', t('commands:shop.buy_colors.has-color')).then(() => embedMessage.delete({ timeout: 500 }).catch());
              if (user.estrelinhas < coresDisponíveis[3].preço) return message.menheraReply('error', t('commands:shop.buy_colors.poor')).then(() => embedMessage.delete({ timeout: 500 }).catch());
              this.client.database.Users.updateOne({ id: message.author.id }, { $push: { cores: coresDisponíveis[3] }, $inc: { estrelinhas: -coresDisponíveis[3].preço } });
              message.menheraReply('success', t('commands:shop.buy_colors.buy-success', { name: coresDisponíveis[3].nome, price: coresDisponíveis[3].preço, stars: user.estrelinhas })).then(() => embedMessage.delete({ timeout: 500 }).catch());
              break;
            case '5':
              if (user.cores.some((res) => res.cor === coresDisponíveis[4].cor)) return message.menheraReply('yellow_circle', t('commands:shop.buy_colors.has-color')).then(() => embedMessage.delete({ timeout: 500 }).catch());
              if (user.estrelinhas < coresDisponíveis[4].preço) return message.menheraReply('error', t('commands:shop.buy_colors.poor')).then(() => embedMessage.delete({ timeout: 500 }).catch());
              this.client.database.Users.updateOne({ id: message.author.id }, { $push: { cores: coresDisponíveis[4] }, $inc: { estrelinhas: -coresDisponíveis[4].preço } });
              message.menheraReply('success', t('commands:shop.buy_colors.buy-success', { name: coresDisponíveis[4].nome, price: coresDisponíveis[4].preço, stars: user.estrelinhas })).then(() => embedMessage.delete({ timeout: 500 }).catch());
              break;
            case '6':
              if (user.cores.some((res) => res.cor === coresDisponíveis[5].cor)) return message.menheraReply('yellow_circle', t('commands:shop.buy_colors.has-color')).then(() => embedMessage.delete({ timeout: 500 }).catch());
              if (user.estrelinhas < coresDisponíveis[5].preço) return message.menheraReply('error', t('commands:shop.buy_colors.poor')).then(() => embedMessage.delete({ timeout: 500 }).catch());
              this.client.database.Users.updateOne({ id: message.author.id }, { $push: { cores: coresDisponíveis[5] }, $inc: { estrelinhas: -coresDisponíveis[5].preço } });
              message.menheraReply('success', t('commands:shop.buy_colors.buy-success', { name: coresDisponíveis[5].nome, price: coresDisponíveis[5].preço, stars: user.estrelinhas })).then(() => embedMessage.delete({ timeout: 500 }).catch());
              break;

            case '7': {
              if (user.cores.some((res) => res.nome.startsWith('7'))) return message.menheraReply('yellow_circle', t('commands:shop.buy_colors.has-color')).then(() => embedMessage.delete({ timeout: 500 }).catch());
              if (user.estrelinhas < coresDisponíveis[6].preço) return message.menheraReply('error', t('commands:shop.buy_colors.poor')).then(() => embedMessage.delete({ timeout: 500 }).catch());

              const hexFiltro = (hexMsg) => hexMsg.author.id === message.author.id;
              const hexColletor = message.channel.createMessageCollector(hexFiltro, { max: 1, time: 30000, errors: ['time'] });

              message.channel.send(t('commands:shop.buy_colors.yc-message'));

              hexColletor.on('collect', (hexMsg) => {
                const isHexColor = (hex) => typeof hex === 'string' && hex.length === 6 && !Number.isNaN(Number(`0x${hex}`));
                if (isHexColor(hexMsg.content)) {
                  const toPush = {
                    nome: '7 - Sua Escolha',
                    cor: `#${hexMsg.content}`,
                    preço: constants.shopEconomy.colors.your_choice,
                  };
                  this.client.database.Users.updateOne({ id: message.author.id }, { $push: { cores: toPush }, $inc: { estrelinhas: -coresDisponíveis[6].preço } });
                  message.menheraReply('sucess', t('commands:shop.buy_colors.yc-confirm', { color: hexMsg.content, price: coresDisponíveis[6].preço, stars: user.estrelinhas })).then(() => embedMessage.delete().catch);
                } else {
                  return message.menheraReply('error', t('commands:shop.buy_colors.invalid-color')).then(() => embedMessage.delete().catch());
                }
              });
            }
          }
        });
      } else {
        // abre loja de rolls

        const valorRoll = constants.shopEconomy.hunts.roll;
        const rollsAtual = user.rolls;

        const dataRolls = {
          title: t('commands:shop.dataRolls_fields.title'),
          color: '#b66642',
          thumbnail: {
            url: 'https://i.imgur.com/t94XkgG.png',
          },
          description: t('commands:shop.dataRolls_fields.description', { saldo: saldoAtual, rolls: rollsAtual }),
          footer: {
            text: t('commands:shop.dataRolls_fields.footer'),
          },
          fields: [{
            name: t('commands:shop.dataRolls_fields.fields.name'),
            value: t('commands:shop.dataRolls_fields.fields.value', { price: valorRoll }),
            inline: false,
          }],
        };

        embedMessage.edit(message.author, { embed: dataRolls });

        const filterColetor = (msg) => msg.author.id === message.author.id;
        const quantidadeCollector = message.channel.createMessageCollector(filterColetor, { max: 1, time: 30000, errors: ['time'] });

        quantidadeCollector.on('collect', (msg) => {
          const input = msg.content;
          if (!input) return message.menheraReply('error', t('commands:shop.dataRolls_fields.buy_rolls.invalid-number'));
          const valor = parseInt(input.replace(/\D+/g, ''));
          if (Number.isNaN(valor) || valor < 1) {
            embedMessage.delete({ timeout: 500 }).catch();
            message.menheraReply('error', t('commands:shop.dataRolls_fields.buy_rolls.invalid-number'));
          } else {
            if ((valor * valorRoll) > user.estrelinhas) return message.menheraReply('error', t('commands:shop.dataRolls_fields.buy_rolls.poor'));

            const valval = valor * valorRoll; // valor para a traduçãp

            this.client.database.Users.updateOne({ id: message.author.id }, { $inc: { estrelinhas: -valval, rolls: valor } });
            message.menheraReply('success', t('commands:shop.dataRolls_fields.buy_rolls.success', {
              quantity: valor, value: valval, rolls: user.rolls, stars: user.estrelinhas,
            }));
          }
        });
      }
    });
  }

  lojaVender(message, embedMessage, user, saldoAtual, t, constants) {
    const demons = user.caçados || 0;
    const anjos = user.anjos || 0;
    const sd = user.semideuses || 0;
    const deuses = user.deuses || 0;

    const valorDemonio = constants.shopEconomy.hunts.demon;
    const valorAnjo = constants.shopEconomy.hunts.angel;
    const valorSD = constants.shopEconomy.hunts.demigod;
    const valorDeus = constants.shopEconomy.hunts.god;

    const dataVender = {
      title: t('commands:shop.embed_title'),
      color: '#e77fa1',
      thumbnail: {
        url: 'https://i.imgur.com/t94XkgG.png',
      },
      description: t('commands:shop.dataVender.main.description', {
        saldo: saldoAtual, demons, anjos, sd, deuses,
      }),
      footer: {
        text: t('commands:shop.dataVender.main.footer'),
      },
      fields: [{
        name: t('commands:shop.dataVender.main.fields.name'),
        value: t('commands:shop.dataVender.main.fields.value', {
          demon: valorDemonio, angel: valorAnjo, demi: valorSD, god: valorDeus,
        }),
        inline: false,
      }],
    };

    embedMessage.edit(message.author, { embed: dataVender }).catch();

    const filter = (m) => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector(filter, { max: 1, time: 30000, errors: ['time'] });

    collector.on('collect', (m) => {
      const cArgs = m.content.split(/ +/g);
      const input = cArgs[1];
      if (!input) return message.menheraReply('error', t('commands:shop.dataVender.invalid-args'));
      const valor = parseInt(input.replace(/\D+/g, ''));

      if (cArgs[0] === '1') {
        if (Number.isNaN(valor) || valor < 1) {
          embedMessage.delete().catch();
          return message.menheraReply('error', t('commands:shop.dataVender.invalid-args'));
        }
        if (valor > user.caçados) return message.menheraReply('error', t('commands:shop.dataVender.poor', { var: 'demônios' }));
        this.client.database.Users.updateOne({ id: message.author.id }, { $inc: { estrelinhas: (valor * valorDemonio), caçados: -valor } });
        message.menheraReply('success', t('commands:shop.dataVender.success-demon', {
          value: valor, cost: valor * valorDemonio, quantity: user.caçados, star: user.estrelinhas,
        }));
      } else if (cArgs[0] === '2') {
        if (Number.isNaN(valor) || valor < 1) {
          embedMessage.delete().catch();
          message.menheraReply('error', t('commands:shop.dataVender.invalid-args'));
        } else {
          if (valor > user.anjos) return message.menheraReply('error', t('commands:shop.dataVender.poor', { var: 'anjos' }));
          this.client.database.Users.updateOne({ id: message.author.id }, { $inc: { estrelinhas: (valor * valorAnjo), anjos: -valor } });
          message.menheraReply('success', t('commands:shop.dataVender.success-angel', {
            value: valor, cost: valor * valorAnjo, quantity: user.anjos, star: user.estrelinhas,
          }));
        }
      } else if (cArgs[0] === '3') {
        if (Number.isNaN(valor) || valor < 1) {
          embedMessage.delete().catch();
          message.menheraReply('error', t('commands:shop.dataVender.invalid-args'));
        } else {
          if (valor > user.semideuses) return message.menheraReply('error', t('commands:shop.dataVender.poor', { var: 'semideuses' }));
          this.client.database.Users.updateOne({ id: message.author.id }, { $inc: { estrelinhas: (valor * valorSD), semideuses: -valor } });
          message.menheraReply('success', t('commands:shop.dataVender.success-sd', {
            value: valor, cost: valor * valorSD, quantity: user.semideuses, star: user.estrelinhas,
          }));
        }
      } else if (cArgs[0] === '4') {
        if (Number.isNaN(valor) || valor < 1) {
          embedMessage.delete().catch();
          message.menheraReply('error', t('commands:shop.dataVender.invalid-args'));
        } else {
          if (valor > user.deuses) return message.menheraReply('error', t('commands:shop.dataVender.poor', { var: 'deuses' }));
          user.deuses -= valor;
          user.estrelinhas += (valor * valorDeus);
          user.save();
          this.client.database.Users.updateOne({ id: message.author.id }, { $inc: { estrelinhas: (valor * valorDeus), deuses: -valor } });
          message.menheraReply('success', t('commands:shop.dataVender.success-god', {
            value: valor, cost: valor * valorDeus, quantity: user.deuses, star: user.estrelinhas,
          }));
        }
      } else {
        embedMessage.delete().catch();
        message.menheraReply('error', t('commands:shop.dataVender.invalid-args'));
      }
    });
  }
};
