/* eslint-disable guard-for-in */
const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const PagesCollector = require('../../utils/Pages');
const itemsFile = require('../../structures/RpgHandler').items;
const Util = require('../../utils/Util');

module.exports = class VillageCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'village',
      aliases: ['vila'],
      cooldown: 5,
      category: 'rpg',
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run({ message }, t) {
    const user = await this.client.database.Rpg.findById(message.author.id);

    if (!user) {
      return message.menheraReply('error', t('commands:village.non-aventure'));
    }

    const embed = new MessageEmbed()
      .setColor('#bbfd7c')
      .setTitle(t('commands:village.index.title'))
      .setDescription(t('commands:village.index.description'))
      .addField(t('commands:village.index.field_name'), t('commands:village.index.field_value'))
      .setFooter(t('commands:village.index.footer'));

    const sent = await message.channel.send(message.author, embed);

    const options = ['bruxa', 'ferreiro', 'hotel', 'guilda'];
    const collector = new PagesCollector(message.channel, { sent, message, t }, { max: 2, time: 30000, errors: ['time'] })
      .setInvalidOption(() => collector.menheraReply('error', t('commands:village.invalid-option')))
      .setFindOption(PagesCollector.arrFindHandle(options))
      .setHandle(async (_, option) => {
        switch (option) {
          case 'bruxa':
            await VillageCommand.bruxa(message, user, t, collector);
            break;
          case 'ferreiro':
            await VillageCommand.ferreiro(message, user, t, collector);
            break;
          case 'hotel':
            await VillageCommand.hotel(message, user, t, collector);
            break;
          case 'guilda':
            await VillageCommand.guilda(message, user, t, collector);
            break;
        }
      })
      .start();

    // TEMPORARIO
    collector.once('end', (v, r) => console.log('debug', r));
  }

  static async bruxa(message, user, t, collector) {
    const itens = itemsFile.bruxa.filter((item) => user.level >= item.minLevel && user.level <= item.maxLevel);

    collector.setFindOption(
      (str) => itens.find((i, n) => i.name === str.toLowerCase() || Number(str) === (n + 1)),
    );

    const embed = new MessageEmbed()
      .setTitle(`🏠 | ${t('commands:village.bruxa.title')}`)
      .setColor('#c5b5a0')
      .setFooter(t('commands:village.bruxa.footer'))
      .setDescription(t('commands:village.bruxa.description', { money: user.money }));

    itens.forEach((item, i) => {
      embed.addField(
        `---------------[ ${i + 1} ]---------------\n${item.name}`,
        `📜 | **${t('commands:village.desc')}:** ${item.description}\n💎 |** ${t('commands:village.cost')}:** ${item.value}`,
      );
    });

    collector.send(message.author, embed);

    collector.setHandle((msg, item) => {
      const quantity = parseInt(msg.content.trim().split(/ +/g)[1]) || 1;

      if (Number.isNaN(quantity) || quantity < 1) {
        return collector.menheraReply('error', t('commands:village.invalid-quantity'), { embed: {} });
      }

      const value = item.value * quantity;

      if (!value) {
        return collector.menheraReply('error', t('commands:village.invalid-value'));
      }

      if (user.money < value) {
        return collector.menheraReply('error', t('commands:village.poor'));
      }

      if ((user?.backpack.value + quantity) > user?.backpack.capacity) {
        return collector.menheraReply('error', 'commands:village.backpack-full');
      }

      collector.menheraReply('success', t('commands:village.bruxa.bought', { quantidade: quantity, name: item.name, valor: value }));

      user.inventory.push(...(new Array(quantity).fill(item.name)));
      VillageCommand.updateBackpack(user, (v) => v + 1);

      user.money -= value;
      return user.save();
    });

    return PagesCollector.done();
  }

  static ferreiro(message, user, t, collector) {
    if (user.level < 9) {
      return message.menheraReply('error', t('commands:village.ferreiro.low-level'));
    }

    const categories = ['sword', 'backpack', 'armor'];
    const categoriesNames = categories.map(
      (name, i) => `${i + 1} ${t(`commands:village.ferreiro.categories.${name}`)}`,
    );
    const embed = new MessageEmbed()
      .setColor('#b99c81')
      .setTitle(`⚒️ | ${t('commands:village.ferreiro.title')}`)
      .setDescription(t('commands:village.ferreiro.description'))
      .addField(t('commands:village.ferreiro.field_name'), categoriesNames)
      .setFooter(t('commands:village.ferreiro.footer'));

    collector.send(message.author, embed);
    collector.setFindOption(PagesCollector.arrFindHandle(categories));
    collector.setHandle((_, category) => VillageCommand.ferreiroEquipamentos(category, message, user, t, collector));
  }

  static ferreiroEquipamentos(category, message, user, t, collector) {
    const emojis = {
      sword: '🗡️',
      armor: '🛡️',
      backpack: '🧺',
    };

    const mainProp = {
      sword: 'damage',
      armor: 'protection',
      backpack: 'capacity',
    }[category];

    const embed = new MessageEmbed()
      .setColor('#b99c81')
      .setTitle(`⚒️ | ${t('commands:village.ferreiro.title')}`)
      .setDescription(
        `<:atencao:759603958418767922> | ${t(`commands:village.ferreiro.${category}.description`)}`,
      )
      .setFooter(t('commands:village.ferreiro.footer'));

    const equips = itemsFile.ferreiro.filter((item) => item.category === category);

    const parseMissingItems = (equip) => Object.entries(equip.required_items)
      .reduce((p, [name, qty]) => `${p} **${qty} ${name}**\n`, '');

    embed.addFields(equips.map((equip, i) => ({
      name: `${i + 1} ${equip.id}`,
      value: [
        `${emojis[category]} | ${t(`commands:village.ferreiro.${mainProp}`)} **${equip[mainProp]}**`,
        `💎 | ${t('commands:village.ferreiro.cost')}: **${equip.price}**`,
        `<:Chest:760957557538947133> | ${t('commands:village.ferreiro.itens-needed')}: ${parseMissingItems(equip)}`,
      ].join('\n'),
    })));

    const userItems = Util.countItems(user.loots);

    collector.send(message.author, embed);
    collector.setFindOption(PagesCollector.arrFindHandle(equips));
    collector.setHandle((_, equip) => {
      if (user.money < equip.price) {
        return message.menheraReply('error', t('commands:village.poor'));
      }

      const requiredItems = Object.entries(equip.required_items);
      const missingItems = requiredItems
        .reduce((p, [name, qty]) => {
          const item = userItems.find((i) => i.name === name);
          if (!item) {
            return [...p, { name, qty }];
          }

          if (item.amount < qty) {
            return [...p, { name, qty: qty - item.amount }];
          }

          return p;
        }, []);

      if (missingItems.length > 0) {
        const items = missingItems.map((item) => `${item.qty} ${item.name}`).join(', ');

        return message.menheraReply('error', `${t(`commands:village.ferreiro.${category}.poor`, { items })}`);
      }

      requiredItems.forEach(([name, qty]) => VillageCommand.removeItemInLoots(user, name, qty));

      switch (category) {
        case 'sword':
          user.weapon = {
            name: equip.name,
            damage: equip.damage,
          };
          break;

        case 'armor':
          user.protection = {
            name: equip.name,
            armor: equip.protection,
          };
          break;

        case 'backpack':
          user.backpack = {
            name: equip.name,
            capacity: equip.name.capacity,
            value: user.backpack.value,
          };
          break;
      }

      user.money -= equip.price;

      user.save();
      message.menheraReply('success', t(`commands:village.ferreiro.${category}.change`, { equip: equip.name }));
      return PagesCollector.done();
    });
  }

  static hotel(message, user, t, collector) {
    // TODO: mostra o tempo humanizado
    const hotelOptions = [
      {
        name: 'name_one', time: 7200000, life: 40, mana: 40,
      },
      {
        name: 'name_two', time: 12600000, life: 'MAX', mana: 0,
      },
      {
        name: 'name_three', time: 12600000, life: 0, mana: 'MAX',
      },
      {
        name: 'name_four', time: 25200000, life: 'MAX', mana: 'MAX',
      },
    ];

    const embed = new MessageEmbed()
      .setTitle(`🏨 | ${t('commands:village.hotel.title')}`)
      .setDescription(t('commands:village:hotel.description'))
      .setFooter(t('commands:village.hotel.footer'))
      .setColor('#e7a8ec');

    embed.addFields(hotelOptions.map(({
      name, time, life, mana,
    }) => ({
      name: `1 - ${t(`commands:village.hotel.fields.${name}`)}`,
      value: `⌛ | ${t('commands:village.hotel.fields.value', { time, life, mana })}`,
    })));

    collector.send(message.author, embed);
    collector.setFindOption((content) => hotelOptions.find((_, i) => (i + 1) === Number(content)));
    collector.setHandle((_, option) => {
      if (user.hotelTime > Date.now()) {
        return collector.menheraReply('error', t('commands:village.hotel.already'));
      }
      if (user.life < 1 && user.death > Date.now()) {
        return collector.menheraReply('error', t('commands:village.hotel.dead'));
      }

      user.hotelTime = option.time + Date.now();

      if (option.life === 'MAX') {
        user.life = user.maxLife;
      } else {
        user.life += option.life;
        if (user.life > user.maxLife) user.life = user.maxLife;
      }

      if (option.mana === 'MAX') {
        user.mana = user.maxMana;
      } else {
        user.mana += option.mana;
        if (user.mana > user.maxMana) user.mana = user.maxMana;
      }

      user.save();

      return collector.menheraReply('success', t('commands:village.hotel.done'));
    });
  }

  static guilda(message, user, t, collector) {
    const embed = new MessageEmbed()
      .setTitle(`🏠 | ${t('commands:village.guilda.title')}`)
      .setColor('#98b849')
      .setFooter(t('commands:village.guilda.footer'));

    const allItems = Util.countItems(user.loots);

    if (allItems.length === 0) {
      collector.send(message.author,
        embed
          .setDescription(t('commands:village.guilda.no-loots'))
          .setFooter('No Looots!')
          .setColor('#f01010'));
      return PagesCollector.done();
    }

    let txt = t('commands:village.guilda.money', { money: user.money }) + t('commands:village.guilda.sell-all');

    let displayedItems = allItems;
    // eslint-disable-next-line no-restricted-syntax
    for (const i in allItems) {
      // eslint-disable-next-line no-loop-func
      const filter = user.loots.filter((f) => f.name === allItems[i].name);
      const item = `---------------**[ ${i + 1} ]**---------------\n<:Chest:760957557538947133> | **${i.name}** ( ${i.amount} )\n💎 | **${t('commands:village.guilda.value')}:** ${filter[0].value}\n`;
      if ((txt.length + item.length) <= 1800) {
        txt += item;
      } else {
        displayedItems = displayedItems.slice(0, i);
        break;
      }
    }

    embed.setDescription(txt);

    collector.send(message.author, embed);
    collector.setFindOption((content) => {
      if (Number(content) === 0) {
        return 'ALL';
      }
      const [query, qty = 1] = content.trim().split(/ +/g);
      const item = displayedItems.find((_, i) => Number(query) === (i + 1));
      if (item) {
        return [item, qty];
      }
    });
    collector.setHandle((_, result) => {
      if (result === 'ALL') {
        const total = allItems.reduce((p, item) => p + item.value, 0);
        VillageCommand.updateBackpack(user, (currentValue) => currentValue - allItems.length);
        user.loots = [];
        user.money += total;
        user.save();

        collector.menheraReply('success', t('commands:village.guilda.sold-all', { amount: allItems.length, value: total }));
      } else {
        const [item, qty] = result;

        if (qty < 1) {
          return message.menheraReply('error', t('commands:village.invalid-quantity'));
        }

        if (qty > item.amount) {
          return message.menheraReply('error', `${t('commands:village.guilda.poor')} ${qty} ${item.name}`);
        }

        const total = parseInt(qty) * parseInt(item.value);
        if (Number.isNaN(total)) {
          return message.menheraReply('error', t('commands:village.guilda.unespected-error'));
        }

        VillageCommand.removeItemInLoots(user, item.name, item.amount);
        user.money += total;

        user.save();
        return message.menheraReply('success', t('commands:village.guilda.sold', { quantity: qty, name: item.name, value: total }));
      }

      return PagesCollector.done();
    });
  }

  static updateBackpack(user, newValueFn) {
    user.backpack = {
      name: user.backpack.name,
      capacity: user.backpack.capacity,
      value: newValueFn(user.backpack.value),
    };

    if (user.backpack?.value < 0) {
      user.backpack = { name: user.backpack.name, capacity: user.backpack.capacity, value: 0 };
    }
  }

  static removeItemInLoots(user, itemName, amount = 1) {
    for (let i = 0; i < amount; i++) {
      // eslint-disable-next-line no-loop-func
      user.loots.splice(user.loots.findIndex((loot) => loot.name === itemName), 1);
    }

    VillageCommand.updateBackpack(user, (currentValue) => currentValue - amount);
  }
};
