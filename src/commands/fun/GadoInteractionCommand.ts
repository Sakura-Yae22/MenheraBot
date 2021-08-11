import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageAttachment } from 'discord.js';
import HttpRequests from '@utils/HTTPrequests';

export default class GadoInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'gado',
      description:
        '「🐂」・MUUUUu gado demais. Use esse comando naquele seu amigo que baba por egirl',
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'Usuário para usar como gado',
          required: true,
        },
      ],
      category: 'fun',
      cooldown: 5,
      clientPermissions: ['ATTACH_FILES'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const link = ctx.options.getUser('user', true).displayAvatarURL({
      format: 'png',
      size: 512,
    });

    const res = await HttpRequests.gadoRequest(link);
    if (res.err) {
      await ctx.replyT('error', 'commands:http-error', {}, true);
      return;
    }

    await ctx.reply({
      files: [new MessageAttachment(Buffer.from(res.data as Buffer), 'gado.png')],
    });
  }
}
