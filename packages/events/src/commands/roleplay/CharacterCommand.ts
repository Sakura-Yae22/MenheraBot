import { ApplicationCommandOptionTypes, ButtonStyles } from 'discordeno/types';

import { User } from 'discordeno/transformers';
import roleplayRepository from '../../database/repositories/roleplayRepository';
import { Races } from '../../modules/roleplay/races';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { createCommand } from '../../structures/command/createCommand';
import { SelectMenuInteraction } from '../../types/interaction';
import {
  createActionRow,
  createButton,
  createCustomId,
  createSelectMenu,
} from '../../utils/discord/componentUtils';
import { createEmbed } from '../../utils/discord/embedUtils';
import { getDisplayName } from '../../utils/discord/userUtils';

const executeCreateCharaterInteraction = async (
  ctx: ComponentInteractionContext,
): Promise<void> => {
  const [type, raceId] = ctx.sentData;

  if (type === 'RACE') {
    const selectedRace = (ctx.interaction as SelectMenuInteraction).data.values[0];

    const embed = createEmbed({
      title: 'Nascimento em Boleham',
      description: 'Você está nascendo em boleham! Escolha abaixo como qual raça você quer nascer',
      footer: { text: 'Clique em uma raça para ler suas informacoes' },

      fields: [
        {
          name: `Informações da Raça ${Races[selectedRace as '1'].develName}`,
          value: 'Essa raca faz umas loucuras iwrra',
        },
      ],
    });

    const selectMenu = createSelectMenu({
      customId: createCustomId(0, ctx.user.id, ctx.commandId, 'RACE'),
      options: Object.keys(Races).map((id) => ({
        label: `${Races[id as '1'].develName}`,
        value: id,
        default: id === selectedRace,
      })),
    });

    const button = createButton({
      label: 'Criar Personagem',
      style: ButtonStyles.Success,
      customId: createCustomId(0, ctx.user.id, ctx.commandId, 'CONFIRM', selectedRace),
    });

    ctx.makeMessage({
      components: [createActionRow([selectMenu]), createActionRow([button])],
      embeds: [embed],
    });
    return;
  }

  const raceInfo = Races[raceId as '1'];

  await roleplayRepository.registerCharacter(ctx.user.id, Number(raceId), raceInfo.baseLocation);

  ctx.makeMessage({
    content: `Voce nasceu no mundo de boleham! Você é um ${raceInfo.develName} e nasceu em ${raceInfo.baseLocation}\n\nSeja bem vindo olhe seu personagem usando esse comando dnv`,
    embeds: [],
    components: [],
  });
};

const CharacterCommand = createCommand({
  path: '',
  name: 'personagem',
  nameLocalizations: {
    'en-US': 'character',
  },
  description: 'Mostra o personagem do rpg de alguem uwu boleham',
  options: [
    {
      name: 'usuário',
      nameLocalizations: { 'en-US': 'user' },
      type: ApplicationCommandOptionTypes.User,
      description: 'Usuário que tu quer ver o personagem',
      required: false,
    },
  ],
  category: 'roleplay',
  authorDataFields: [],
  commandRelatedExecutions: [executeCreateCharaterInteraction],
  execute: async (ctx, finishCommand) => {
    finishCommand();
    const user = ctx.getOption<User>('usuário', 'users', false) ?? ctx.author;

    const character = await roleplayRepository.getCharacter(user.id);

    if (!character) {
      if (user.id !== ctx.author.id)
        return ctx.makeMessage({ content: 'Esse usuário não possui um personagem em Boleham' });

      const embed = createEmbed({
        title: 'Nascimento em Boleham',
        description:
          'Você está nascendo em boleham! Escolha abaixo como qual raça você quer nascer',
        footer: { text: 'Clique em uma raça para ler suas informacoes' },
      });

      const selectMenu = createSelectMenu({
        customId: createCustomId(0, ctx.author.id, ctx.commandId, 'RACE'),
        options: Object.keys(Races).map((id) => ({
          label: `${Races[id as '1'].develName}`,
          value: id,
        })),
      });

      ctx.makeMessage({
        components: [createActionRow([selectMenu])],
        embeds: [embed],
      });

      return;
    }

    const embed = createEmbed({
      title: `Personagem de ${getDisplayName(ctx.author)}`,
      description: `Localização atual: ${character.currentLocation}`,
    });

    ctx.makeMessage({ embeds: [embed] });
  },
});

export default CharacterCommand;
