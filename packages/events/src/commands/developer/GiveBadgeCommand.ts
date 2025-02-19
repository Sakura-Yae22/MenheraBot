import { User } from 'discordeno/transformers';
import { ApplicationCommandOptionTypes } from 'discordeno/types';
import badgeRepository from '../../database/repositories/badgeRepository';
import userRepository from '../../database/repositories/userRepository';

import { createCommand } from '../../structures/command/createCommand';

const GiveBadgeCommand = createCommand({
  path: '',
  name: 'givebadge',
  description: '[DEV] Dá uma Badge pra alguém',
  options: [
    {
      name: 'user',
      description: 'User pra da badge',
      type: ApplicationCommandOptionTypes.User,
      required: true,
    },
    {
      name: 'badgeid',
      description: 'id da badge',
      type: ApplicationCommandOptionTypes.Integer,
      autocomplete: true,
      required: true,
    },
  ],
  devsOnly: true,
  category: 'dev',
  authorDataFields: [],
  execute: async (ctx, finishCommand) => {
    const { id: userId } = ctx.getOption<User>('user', 'users', true);
    const badgeId = ctx.getOption<number>('badgeid', false, true);

    const userData = await userRepository.ensureFindUser(userId);

    if (userData.badges.some((a) => a.id === badgeId))
      return finishCommand(ctx.makeMessage({ content: 'Este usuário já possui esta badge!' }));

    await badgeRepository.giveBadgeToUser(userId, badgeId as 1);

    ctx.makeMessage({ content: 'Badge adicionada a conta do user UwU' });
    finishCommand();
  },
});

export default GiveBadgeCommand;
