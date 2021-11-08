/* eslint-disable no-unused-expressions */
import { MessageEmbed } from 'discord.js-light';
import moment from 'moment';
import 'moment-duration-format';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';

export default class CooldownsInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'cooldowns',
      description: '「⌛」・Mostra todos os seus tempos de recarga',
      category: 'info',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
      authorDataFields: ['huntCooldown', 'voteCooldown'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const huntCooldownInMilis = ctx.data.user.huntCooldown - Date.now();
    const voteCooldownInMilis = ctx.data.user.voteCooldown - Date.now();

    let txt = '';

    txt +=
      huntCooldownInMilis < 0
        ? `\`${ctx.locale('commands:cooldowns.hunt')}\` | ${ctx.locale(
            'commands:cooldowns.no-cooldown',
          )}\n`
        : `\`${ctx.locale('commands:cooldowns.hunt')}\` | **${moment
            .utc(huntCooldownInMilis)
            .format('mm:ss')}** ${ctx.locale('commands:cooldowns.minutes')}\n`;

    txt +=
      voteCooldownInMilis < 0
        ? `\`${ctx.locale('commands:cooldowns.vote')}\` | ${ctx.locale(
            'commands:cooldowns.no-cooldown',
          )}`
        : `\`${ctx.locale('commands:cooldowns.vote')}\` | ${
            voteCooldownInMilis > 3600000
              ? `**${moment.utc(voteCooldownInMilis).format('HH:mm:ss')}** ${ctx.locale(
                  'commands:cooldowns.hours',
                )}`
              : `**${moment.utc(voteCooldownInMilis).format('mm:ss')}** ${ctx.locale(
                  'commands:cooldowns.minutes',
                )}`
          }`;

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:cooldowns.title'))
      .setColor('#6597df')
      .setDescription(txt);

    await ctx.makeMessage({ embeds: [embed] });
  }
}
