import roleplayRepository from '../../database/repositories/roleplayRepository';
import { createBattleMessage } from '../../modules/roleplay/aventures/buildMessages';
import { getEnemies } from '../../modules/roleplay/aventures/enemies';
import { AdventureTypes, UserAdventure } from '../../modules/roleplay/aventures/types';
import { createCommand } from '../../structures/command/createCommand';
import { registerCharacterMessage } from '../../utils/miscUtils';

const CharacterCommand = createCommand({
  path: '',
  name: 'aventura',
  nameLocalizations: {
    'en-US': 'adventure',
  },
  description: 'Vá para uma aventura',
  category: 'roleplay',
  authorDataFields: [],
  commandRelatedExecutions: [],
  execute: async (ctx, finishCommand) => {
    finishCommand();
    const character = await roleplayRepository.getCharacter(ctx.author.id);
    if (!character) return registerCharacterMessage(ctx);

    const currentBatle = await roleplayRepository.getUserAdventure(ctx.author.id);

    if (currentBatle) return console.log('TODO: CHANGE TO NEW INTERACTION');

    const enemies = getEnemies(character.currentLocation);

    if (enemies.length === 0)
      return ctx.makeMessage({
        content: 'Não há inimigos por perto!',
      });

    const userAventure: UserAdventure = {
      enemies: [{ id: 1, level: 1, life: 100 }],
      interactionId: `${ctx.interaction.id}`,
      interactionToken: `${ctx.interaction.token}`,
      type: AdventureTypes.BATTLE,
    };

    await roleplayRepository.updateUserAdventure(ctx.author.id, userAventure);

    createBattleMessage(ctx);
  },
});

export default CharacterCommand;
