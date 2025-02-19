import { ApplicationCommandOptionTypes } from 'discordeno/types';
import { User } from 'discordeno/transformers';

import blacklistRepository from '../../database/repositories/blacklistRepository';
import userRepository from '../../database/repositories/userRepository';
import { createCommand } from '../../structures/command/createCommand';

const BlacklistCommand = createCommand({
  path: '',
  name: 'blacklist',
  description: '[DEV] Manipula os bans da Menhera',
  options: [
    {
      type: ApplicationCommandOptionTypes.String,
      name: 'tipo',
      description: 'Tipo do comando',
      required: true,
      choices: [
        {
          name: 'Adicionar',
          value: 'add',
        },
        {
          name: 'Remover',
          value: 'remove',
        },
        {
          name: 'Ver',
          value: 'view',
        },
      ],
    },
    {
      type: ApplicationCommandOptionTypes.User,
      name: 'user',
      description: 'Usuario pra banir',
      required: true,
    },
    {
      type: ApplicationCommandOptionTypes.String,
      name: 'motivo',
      description: 'Motivo do ban',
      required: false,
    },
  ],
  devsOnly: true,
  category: 'dev',
  authorDataFields: [],
  execute: async (ctx, finishCommand) => {
    const user = ctx.getOption<User>('user', 'users', true);

    switch (ctx.getOption('tipo', false, true)) {
      case 'add': {
        if (!user)
          return finishCommand(
            ctx.makeMessage({
              content: 'user not found',
            }),
          );

        const reason = ctx.getOption<string>('motivo', false);

        if (!reason)
          return finishCommand(
            ctx.makeMessage({
              content:
                'Se for banir um usuário, da um motivo bacana pq se n depois fode pra dar desban',
            }),
          );

        await blacklistRepository.banUser(user.id, reason);

        await ctx.makeMessage({ content: 'Usuário banido de usar a Menhera!' });
        return finishCommand();
      }
      case 'remove': {
        await blacklistRepository.unbanUser(user.id);

        await ctx.makeMessage({ content: 'Usuário desbanido' });
        return finishCommand();
      }
      case 'view': {
        if (!user) return finishCommand(ctx.makeMessage({ content: 'User not found' }));

        const usr = await userRepository.getBannedUserInfo(user.id);

        if (!usr) return finishCommand(ctx.makeMessage({ content: 'Nenhum user na DB' }));

        // @ts-expect-error It dont exists yet
        const msg = `== USER BANNED INFO ==\n\n• User :: ${user.username} [${user.displayName}] - (${user.id})\n• Banned :: ${usr.ban}\n• Reason :: ${usr.banReason}`;
        await ctx.makeMessage({ content: `\`\`\`asciidocmsg\n${msg}\`\`\`` });
        finishCommand();
      }
    }
  },
});

export default BlacklistCommand;
