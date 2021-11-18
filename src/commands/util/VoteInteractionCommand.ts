import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';

export default class VoteInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'votar',
      description: '「🆙」・Veja o link para votar em mim. Vote e receba prêmios UwU',
      category: 'util',
      cooldown: 5,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:votar.embed_title'))
      .setColor('#f763f8')
      .setURL('https://top.gg/bot/708014856711962654/vote')
      .setImage('https://i.imgur.com/27GxqX1.jpg')
      .setDescription(ctx.locale('commands:votar.embed_description'))
      .setFooter(
        ctx.locale('commands:votar.embed_footer', { author: ctx.author.tag }),
        ctx.author.displayAvatarURL(),
      )
      .setTimestamp();

    await ctx.makeMessage({ embeds: [embed] });
  }
}
