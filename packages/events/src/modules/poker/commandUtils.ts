import { Embed } from 'discordeno/transformers';
import { BigString } from 'discordeno/types';
import { InteractionContext } from '../../types/interaction';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { mentionUser } from '../../utils/discord/userUtils';

const createInitialMatchEmbed = (
  ctx: InteractionContext,
  acceptedPlayers: BigString[],
  invitedPlayers: BigString[],
  embedColor: string,
  maxPlayers: number,
  authorAvatar: string,
  stack: number | string,
): Embed => {
  return createEmbed({
    color: hexStringToNumber(embedColor),
    thumbnail: {
      url: authorAvatar,
    },
    title: ctx.locale('commands:poker.accept-embed.title'),
    description: ctx.locale('commands:poker.accept-embed.description', {
      invites: invitedPlayers.map((a) => mentionUser(a)).join(', '),
      stack,
    }),
    fields: [
      {
        name: ctx.locale('commands:poker.accept-embed.field-title', {
          users: acceptedPlayers.length,
          maxUsers: maxPlayers,
        }),
        value: acceptedPlayers.map((a) => mentionUser(a)).join('\n'),
      },
    ],
  });
};

export { createInitialMatchEmbed };
