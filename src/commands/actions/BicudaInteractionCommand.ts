import MenheraClient from 'MenheraClient';
import { COLORS } from '@structures/MenheraConstants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js';
import HttpRequests from '@utils/HTTPrequests';

export default class BicudaInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'bicuda',
      description: '「🦵」・Da uma bicudassa em alguém',
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'Usuário para chutar',
          required: true,
        },
      ],
      category: 'actions',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const rand = await HttpRequests.getAssetImageUrl('bicuda');
    const user = ctx.options.getUser('user', true);

    if (user.bot) {
      await ctx.replyT('warn', 'commands:bicuda.bot');
      return;
    }

    if (user.id === ctx.interaction.user.id) {
      await ctx.replyT('error', 'commands:bicuda.self-mention', {}, true);
      return;
    }

    const avatar = ctx.interaction.user.displayAvatarURL({ format: 'png', dynamic: true });

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:bicuda.embed_title'))
      .setColor(COLORS.ACTIONS)
      .setDescription(
        ctx.locale('commands:bicuda.embed_description', {
          author: ctx.interaction.user.toString(),
          mention: user.toString(),
        }),
      )
      .setImage(rand)
      .setThumbnail(avatar);

    await ctx.reply({ embeds: [embed] });
  }
}
