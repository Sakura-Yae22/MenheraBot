import roleplayRepository from '../../../database/repositories/roleplayRepository';
import ChatInputInteractionContext from '../../../structures/command/ChatInputInteractionContext';
import { createEmbed } from '../../../utils/discord/embedUtils';

const createBattleMessage = async (ctx: ChatInputInteractionContext): Promise<void> => {
  const battle = await roleplayRepository.getUserAdventure(ctx.author.id);

  const embed = createEmbed({
    title: 'batalha',
    description: `Batalha contra Inimigo`,
  });
};
