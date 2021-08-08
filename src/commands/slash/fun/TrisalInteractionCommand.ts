import 'moment-duration-format';
import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import {
  MessageAttachment,
  MessageButton,
  MessageComponentInteraction,
  MessageEmbed,
  User,
} from 'discord.js';
import HttpRequests from '@utils/HTTPrequests';
import { emojis } from '@structures/MenheraConstants';

export default class TrisalInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'trisal',
      description:
        '「💘」・Inicie um trisal com mais dois amigos ou veja a metadinha de seu trisal',
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'Primeiro usuário do trisal',
          required: false,
        },
        {
          name: 'user_dois',
          type: 'USER',
          description: 'Segundo usuário do trisal',
          required: false,
        },
      ],
      category: 'fun',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const authorData = ctx.data.user;
    if (authorData.trisal?.length === 0 && !ctx.args[1]?.user) {
      await ctx.replyT('error', 'commands:trisal.no-args', {}, true);
      return;
    }

    if (authorData.trisal?.length > 0) {
      const marryTwo = await this.client.users.fetch(authorData.trisal[0]);
      const marryThree = await this.client.users.fetch(authorData.trisal[1]);

      if (!marryTwo || !marryThree) {
        await ctx.replyT('error', 'commands:trisal.marry-not-found', {}, true);
        return;
      }

      const userOneAvatar = ctx.interaction.user.displayAvatarURL({
        dynamic: false,
        size: 256,
        format: 'png',
      });
      const userTwoAvatar = marryTwo.displayAvatarURL({ dynamic: false, size: 256, format: 'png' });
      const userThreeAvatar = marryThree.displayAvatarURL({
        dynamic: false,
        size: 256,
        format: 'png',
      });

      const res = await HttpRequests.trisalRequest(userOneAvatar, userTwoAvatar, userThreeAvatar);
      if (res.err) {
        await ctx.replyT('error', 'commands:http-error', {}, true);
        return;
      }

      const attachment = new MessageAttachment(Buffer.from(res.data as Buffer), 'trisal.png');

      const embed = new MessageEmbed()
        .setDescription(
          `${ctx.locale('commands:trisal.embed.description')} ${
            ctx.interaction.user
          }, ${marryTwo}, ${marryThree}`,
        )
        .setColor('#ac76f9')
        .setImage('attachment://trisal.png');

      await ctx.reply({ embeds: [embed], files: [attachment] });
      return;
    }

    const mencionado1 = ctx.args[0]?.user as User;
    const mencionado2 = ctx.args[1]?.user as User;

    if (!mencionado1 || !mencionado2) {
      await ctx.replyT('error', 'commands:trisal.no-mention', {}, true);
      return;
    }
    if (mencionado1.id === ctx.interaction.user.id || mencionado2.id === ctx.interaction.user.id) {
      await ctx.replyT('error', 'commands:trisal.self-mention', {}, true);
      return;
    }
    if (mencionado1.id === mencionado2.id) {
      await ctx.replyT('error', 'commands:trisal:same-mention', {}, true);
      return;
    }

    const user1 = authorData;
    const user2 = await this.client.repositories.userRepository.find(mencionado1.id);
    const user3 = await this.client.repositories.userRepository.find(mencionado2.id);

    if (!user1 || !user2 || !user3) {
      await ctx.replyT('error', 'commands:trisal.no-db', {}, true);
      return;
    }

    if (user2.trisal?.length > 0 || user3.trisal?.length > 0) {
      await ctx.replyT('error', 'commands:trisal.comedor-de-casadas', {}, true);
      return;
    }

    const ConfirmButton = new MessageButton()
      .setCustomId(ctx.interaction.id)
      .setLabel(ctx.locale('common:accept'))
      .setStyle('SUCCESS');

    await ctx.reply({
      content: `${ctx.locale(
        'commands:trisal.accept-message',
      )} ${ctx.interaction.user.toString()}, ${mencionado1.toString()}, ${mencionado2.toString()}`,
      components: [{ type: 'ACTION_ROW', components: [ConfirmButton] }],
    });

    const acceptableIds = [ctx.interaction.user.id, mencionado1.id, mencionado2.id];

    const filter = (int: MessageComponentInteraction) =>
      acceptableIds.includes(int.user.id) && int.customId === ctx.interaction.id;

    const collector = ctx.interaction.channel?.createMessageComponentCollector({
      filter,
      time: 15000,
    });

    const acceptedIds: string[] = [];

    collector?.on('collect', async (int) => {
      if (!acceptedIds.includes(int.user.id)) acceptedIds.push(int.user.id);
      int.deferUpdate();

      if (acceptedIds.length === 3) {
        await ctx.editReply({
          content: `${emojis.success} | ${ctx.locale('commands:trisal.done')}`,
          components: [
            {
              type: 'ACTION_ROW',
              components: [ConfirmButton.setDisabled(true).setEmoji(emojis.ring)],
            },
          ],
        });
        await this.client.repositories.relationshipRepository.trisal(user1.id, user2.id, user3.id);
      }
    });

    collector?.once('end', () => {
      if (acceptedIds.length !== 3)
        ctx.editReply({
          content: `${emojis.error} | ${ctx.locale('commands:trisal.error')}`,
          components: [
            {
              type: 'ACTION_ROW',
              components: [
                ConfirmButton.setDisabled(true)
                  .setLabel(ctx.locale('common:timesup'))
                  .setStyle('SECONDARY'),
              ],
            },
          ],
        });
    });
  }
}
