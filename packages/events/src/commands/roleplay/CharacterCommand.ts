import { ApplicationCommandOptionTypes, ButtonStyles, TextStyles } from 'discordeno/types';

import { User } from 'discordeno/transformers';
import roleplayRepository from '../../database/repositories/roleplayRepository';
import { REGISTER_DISTRIBUTE_POINTS } from '../../modules/roleplay/constants';
import { Races, getRaceById } from '../../modules/roleplay/races';
import { UserPoints, getAllUserStats } from '../../modules/roleplay/userStatus';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { createCommand } from '../../structures/command/createCommand';
import { ModalInteraction, SelectMenuInteraction } from '../../types/interaction';
import {
  createActionRow,
  createButton,
  createCustomId,
  createSelectMenu,
  createTextInput,
} from '../../utils/discord/componentUtils';
import { createEmbed } from '../../utils/discord/embedUtils';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { extractFields } from '../../utils/discord/modalUtils';
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

  const statusButton = createButton({
    label: 'Distribuir Pontos',
    style: ButtonStyles.Primary,
    customId: createCustomId(1, ctx.user.id, ctx.commandId, 'SHOW_MODAL', raceId),
  });

  ctx.makeMessage({
    content: `Você possui ${REGISTER_DISTRIBUTE_POINTS} pontos para distribuir entre seus status. Clique no botão para distribuir os pontos`,
    embeds: [],
    components: [createActionRow([statusButton])],
  });
};

const executeModalInteracion = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [type, raceId] = ctx.sentData;

  if (type === 'SHOW_MODAL') {
    const baseRace = getRaceById(Number(raceId));

    const stamina = createTextInput({
      customId: 'stamina',
      label: 'Stamina',
      style: TextStyles.Short,
      minLength: 1,
      maxLength: 2,
      required: true,
      placeholder: `${baseRace.stamina}`,
    });

    const dexterity = createTextInput({
      customId: 'dexterity',
      label: 'Dexterity',
      style: TextStyles.Short,
      minLength: 1,
      maxLength: 2,
      required: true,
      placeholder: `${baseRace.dexterity}`,
    });

    const intelligence = createTextInput({
      customId: 'intelligence',
      label: 'Intelligence',
      style: TextStyles.Short,
      minLength: 1,
      maxLength: 2,
      required: true,
      placeholder: `${baseRace.intelligence}`,
    });

    const strength = createTextInput({
      customId: 'strength',
      label: 'Strength',
      style: TextStyles.Short,
      minLength: 1,
      maxLength: 2,
      required: true,
      placeholder: `${baseRace.strength}`,
    });

    ctx.respondWithModal({
      title: 'Distribuição de Pontos',
      customId: createCustomId(1, ctx.user.id, ctx.commandId, 'POINTS', raceId),
      components: [
        createActionRow([stamina]),
        createActionRow([dexterity]),
        createActionRow([intelligence]),
        createActionRow([strength]),
      ],
    });
    return;
  }

  const selectedPoints = extractFields(ctx.interaction as ModalInteraction);

  const sum = selectedPoints.reduce((p, c) => p + Number(c.value), 0);

  if (sum !== REGISTER_DISTRIBUTE_POINTS)
    return ctx.respondInteraction({
      flags: MessageFlags.EPHEMERAL,
      content:
        'Você distribuiu os pontos de forma incorreta! Clique no botão novamente e distribua os pontos corretamente',
    });

  if (selectedPoints.some((a) => Number(a.value) < 0))
    return ctx.respondInteraction({
      flags: MessageFlags.EPHEMERAL,
      content: 'Você inseriu um número incorreto! Clique no btao novamente e distribua os pontos',
    });

  if (await roleplayRepository.getCharacter(ctx.user.id)) {
    return ctx.makeMessage({
      content: 'Você já tem um personagem em Boleham!',
      components: [],
      embeds: [],
    });
  }

  ctx.makeMessage({
    content: 'Você nasceu no mundo de boleham! Use o comando novamente para ver seus status',
    components: [],
    embeds: [],
  });

  const race = getRaceById(Number(raceId));

  const userStatus = selectedPoints.reduce((p, c) => {
    p[c.customId as 'stamina'] = Number(c.value);
    return p;
  }, {} as UserPoints);

  await roleplayRepository.registerCharacter(
    ctx.user.id,
    Number(raceId),
    race.baseLocation,
    userStatus,
  );
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
  commandRelatedExecutions: [executeCreateCharaterInteraction, executeModalInteracion],
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

    const userStats = getAllUserStats(character);

    const embed = createEmbed({
      title: `Personagem de ${getDisplayName(ctx.author)}`,
      description: `Localização atual: ${character.currentLocation}\nVida: ${userStats.life}/${
        userStats.maxLife
      }\nMana: ${userStats.mana}/${userStats.maxMana}\nCansaço: ${userStats.weary}/${
        userStats.maxWeary
      }\n\nPontos: ${JSON.stringify(character)}`,
    });

    ctx.makeMessage({ embeds: [embed] });
  },
});

export default CharacterCommand;
