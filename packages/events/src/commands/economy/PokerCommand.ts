import { User } from 'discordeno/transformers';
import {
  AllowedMentionsTypes,
  ApplicationCommandOptionTypes,
  ButtonStyles,
} from 'discordeno/types';

import { MessageFlags } from '../../utils/discord/messageUtils';
import { createCommand } from '../../structures/command/createCommand';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
import { createInitialMatchEmbed } from '../../modules/poker/commandUtils';
import { MAX_PLAYERS_PER_TABLE } from '../../modules/poker';
import { getUserAvatar, mentionUser } from '../../utils/discord/userUtils';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { negate, removeNonNumericCharacters } from '../../utils/miscUtils';
import pokerRepository from '../../database/repositories/pokerRepository';
import userRepository from '../../database/repositories/userRepository';
import { startPokerMatch } from '../../modules/poker/matchManager';

const startMatchListener = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [selectedButton, matchPrivacy, matchStack] = ctx.sentData;

  const cancelGame = async () => {
    ctx.makeMessage({
      components: [],
      content: ctx.prettyResponse('sorry', 'commands:poker.match-cancelled', {
        user: mentionUser(ctx.user.id),
      }),
      embeds: [],
    });

    await pokerRepository.deletePokerMatch(ctx.commandAuthor.id);
  };

  if (selectedButton === 'CANCEL') {
    cancelGame();
    return;
  }

  if (selectedButton === 'LEAVE') {
    const inGamePlayers = (ctx.interaction.message?.embeds?.[0].fields?.[0].value ?? '')
      .split('\n')
      .map((a) => removeNonNumericCharacters(a));

    if (!inGamePlayers.includes(`${ctx.user.id}`))
      return ctx.respondInteraction({
        flags: MessageFlags.EPHEMERAL,
        content: ctx.prettyResponse('error', 'commands:poker.not-in-match'),
      });

    if (ctx.user.id === ctx.commandAuthor.id) return cancelGame();

    const oldGameData = await pokerRepository.getPokerMatchState(ctx.commandAuthor.id);

    if (!oldGameData) {
      return ctx.makeMessage({
        components: [],
        embeds: [],
        content: ctx.prettyResponse('error', 'commands:poker.lost-game-data'),
      });
    }

    const userIdIndex = oldGameData.inGamePlayers.indexOf(`${ctx.user.id}`);
    oldGameData.inGamePlayers.splice(userIdIndex, 1);

    await pokerRepository.setPokerMatchState(ctx.commandAuthor.id, {
      gameStared: false,
      masterId: oldGameData.masterId,
      inGamePlayers: oldGameData.inGamePlayers,
      embedColor: oldGameData.embedColor,
    });

    const invitedUsers = (ctx.interaction.message?.content ?? '')
      .split(' ')
      .map((a) => removeNonNumericCharacters(a));

    ctx.makeMessage({
      embeds: [
        createInitialMatchEmbed(
          ctx,
          oldGameData.inGamePlayers,
          invitedUsers,
          oldGameData.embedColor,
          matchPrivacy === 'open' ? MAX_PLAYERS_PER_TABLE : invitedUsers.length,
          getUserAvatar(ctx.commandAuthor, { enableGif: true }),
          matchStack,
        ),
      ],
    });
    return;
  }

  if (selectedButton === 'ENTER') {
    const allowedIds = (ctx.interaction.message?.content ?? '')
      .split(' ')
      .map((a) => removeNonNumericCharacters(a));

    if (matchPrivacy === 'private' && !allowedIds.includes(`${ctx.user.id}`))
      return ctx.respondInteraction({
        flags: MessageFlags.EPHEMERAL,
        content: ctx.prettyResponse('error', 'permissions:NOT_INTERACTION_OWNER', {
          owner: allowedIds.map((a) => mentionUser(a)).join(', '),
        }),
      });

    const oldGameData = await pokerRepository.getPokerMatchState(ctx.commandAuthor.id);

    if (!oldGameData) {
      return ctx.makeMessage({
        components: [],
        embeds: [],
        content: ctx.prettyResponse('error', 'commands:poker.lost-game-data'),
      });
    }

    if (oldGameData.inGamePlayers.includes(`${ctx.user.id}`))
      return ctx.respondInteraction({
        flags: MessageFlags.EPHEMERAL,
        content: ctx.prettyResponse('error', 'commands:poker.already-in-match'),
      });

    if (await pokerRepository.isUserAlreadyInMatch(ctx.user.id))
      return ctx.respondInteraction({
        flags: MessageFlags.EPHEMERAL,
        content: ctx.prettyResponse('error', 'commands:poker.already-in-match'),
      });

    const inGamePlayers = oldGameData.inGamePlayers.concat(`${ctx.user.id}`);

    await pokerRepository.setPokerMatchState(ctx.commandAuthor.id, {
      gameStared: false,
      masterId: oldGameData.masterId,
      inGamePlayers,
      embedColor: oldGameData.embedColor,
    });

    ctx.makeMessage({
      embeds: [
        createInitialMatchEmbed(
          ctx,
          inGamePlayers,
          allowedIds,
          oldGameData.embedColor,
          matchPrivacy === 'open' ? MAX_PLAYERS_PER_TABLE : allowedIds.length,
          getUserAvatar(ctx.commandAuthor, { enableGif: true }),
          matchStack,
        ),
      ],
    });
    return;
  }

  const usersIn = (ctx.interaction.message?.embeds?.[0].fields?.[0].value ?? '')
    .split('\n')
    .map((a) => removeNonNumericCharacters(a));

  if (usersIn.length < 2)
    return ctx.respondInteraction({
      flags: MessageFlags.EPHEMERAL,
      content: ctx.prettyResponse('error', 'commands:poker.not-enough-players'),
    });

  const gameData = await pokerRepository.getPokerMatchState(ctx.commandAuthor.id);

  if (!gameData)
    return ctx.makeMessage({
      components: [],
      embeds: [],
      content: ctx.prettyResponse('error', 'commands:poker.lost-game-data'),
    });

  const canAllUsersPlay = await Promise.all(
    gameData.inGamePlayers.map((a) => pokerRepository.isUserAlreadyInMatch(a)),
  );

  const unableToStart = async (reason: string) => {
    ctx.makeMessage({
      embeds: [],
      components: [],
      content: ctx.prettyResponse('error', 'commands:poker.unable-to-start', {
        reason: ctx.locale(`commands:poker.unable-to-start-reasons.${reason as 'user-in-match'}`),
      }),
    });

    await pokerRepository.deletePokerMatch(ctx.commandAuthor.id);
  };

  if (canAllUsersPlay.includes(true)) return unableToStart('user-in-match');

  const allUserData = await Promise.all(
    gameData.inGamePlayers.map((a) => userRepository.ensureFindUser(a)),
  );

  if (allUserData.some((a) => a.estrelinhas < Number(matchStack)))
    return unableToStart('user-poor');

  await pokerRepository.addUsersInMatch(gameData.inGamePlayers);
  await userRepository.multiUpdateUsers(gameData.inGamePlayers, {
    $inc: { estrelinhas: negate(Number(matchStack)) },
  });

  startPokerMatch(ctx);
  // Start the poker context system uwu omaga tri legal bacana bah show
};

const PokerCommand = createCommand({
  path: '',
  name: 'poker',
  description: '「🃏」・Inicia uma partida de poker',
  descriptionLocalizations: { 'en-US': '「🃏」・Start a poker match' },
  options: [
    {
      type: ApplicationCommandOptionTypes.Integer,
      name: 'pilha',
      nameLocalizations: { 'en-US': 'stack' },
      description: 'Quantidade de estrelinhas que jogadores devem ter em sua pilha de fichas',
      descriptionLocalizations: {
        'en-US': 'Number of stars players should have in their chip stack',
      },
      minValue: 1000,
      required: true,
    },
    {
      type: ApplicationCommandOptionTypes.String,
      name: 'partida',
      nameLocalizations: { 'en-US': 'match' },
      description: 'Quem você quer que entre na partida?',
      descriptionLocalizations: {
        'en-US': 'Who do you want to join the match?',
      },
      choices: [
        {
          name: 'Apenas quem eu mencionar',
          value: 'private',
          nameLocalizations: { 'en-US': 'Only who I mention' },
        },
        {
          name: 'Todos que clicarem no botão',
          value: 'open',
          nameLocalizations: { 'en-US': 'Everyone who clicks the button' },
        },
      ],
      required: true,
    },
    {
      type: ApplicationCommandOptionTypes.User,
      name: 'jogador_1',
      nameLocalizations: { 'en-US': 'player_1' },
      description: 'Convide um usuário para se juntar à partida',
      descriptionLocalizations: { 'en-US': 'Invite someone to the game' },
      required: false,
    },
    {
      type: ApplicationCommandOptionTypes.User,
      name: 'jogador_2',
      nameLocalizations: { 'en-US': 'player_2' },
      description: 'Convide um usuário para se juntar à partida',
      descriptionLocalizations: { 'en-US': 'Invite someone to the game' },
      required: false,
    },
    {
      type: ApplicationCommandOptionTypes.User,
      name: 'jogador_3',
      nameLocalizations: { 'en-US': 'player_3' },
      description: 'Convide um usuário para se juntar à partida',
      descriptionLocalizations: { 'en-US': 'Invite someone to the game' },
      required: false,
    },
    {
      type: ApplicationCommandOptionTypes.User,
      name: 'jogador_4',
      nameLocalizations: { 'en-US': 'player_4' },
      description: 'Convide um usuário para se juntar à partida',
      descriptionLocalizations: { 'en-US': 'Invite someone to the game' },
      required: false,
    },
    {
      type: ApplicationCommandOptionTypes.User,
      name: 'jogador_5',
      nameLocalizations: { 'en-US': 'player_5' },
      description: 'Convide um usuário para se juntar à partida',
      descriptionLocalizations: { 'en-US': 'Invite someone to the game' },
      required: false,
    },
    {
      type: ApplicationCommandOptionTypes.User,
      name: 'jogador_6',
      nameLocalizations: { 'en-US': 'player_6' },
      description: 'Convide um usuário para se juntar à partida',
      descriptionLocalizations: { 'en-US': 'Invite someone to the game' },
      required: false,
    },
    {
      type: ApplicationCommandOptionTypes.User,
      name: 'jogador_7',
      nameLocalizations: { 'en-US': 'player_7' },
      description: 'Convide um usuário para se juntar à partida',
      descriptionLocalizations: { 'en-US': 'Invite someone to the game' },
      required: false,
    },
  ],
  category: 'economy',
  commandRelatedExecutions: [startMatchListener],
  authorDataFields: ['estrelinhas'],
  execute: async (ctx, finishCommand) => {
    const invitedUsers = (
      ctx.interaction.data?.options?.reduce<User[]>((p, c) => {
        if (!c.name.startsWith('jogador')) return p;

        const user = ctx.getOption<User>(c.name, 'users', true);
        if (p.some((b) => b.id === user.id)) return p;
        if (user.toggles.bot) return p;
        if (user.id === ctx.author.id) return p;

        p.push(user);
        return p;
      }, []) ?? []
    ).concat(ctx.author);

    const matchPrivacy = ctx.getOption<string>('partida', false, true);
    const matchStack = ctx.getOption<number>('pilha', false, true);

    if (invitedUsers.length < 2 && matchPrivacy === 'private')
      return finishCommand(
        ctx.makeMessage({
          flags: MessageFlags.EPHEMERAL,
          content: ctx.prettyResponse('error', 'commands:poker.not-enough-players'),
        }),
      );

    if (await pokerRepository.isUserAlreadyInMatch(ctx.author.id))
      return finishCommand(
        ctx.makeMessage({
          flags: MessageFlags.EPHEMERAL,
          content: ctx.prettyResponse('error', 'commands:poker.already-in-match'),
        }),
      );

    const startButton = createButton({
      label: ctx.locale('commands:poker.start-match'),
      style: ButtonStyles.Primary,
      customId: createCustomId(0, ctx.author.id, ctx.commandId, 'START', matchPrivacy, matchStack),
    });

    const enterButton = createButton({
      label: ctx.locale('commands:poker.enter-match'),
      style: ButtonStyles.Success,
      customId: createCustomId(0, 'N', ctx.commandId, 'ENTER', matchPrivacy, matchStack),
    });

    const leaveButton = createButton({
      label: ctx.locale('commands:poker.leave-match'),
      style: ButtonStyles.Secondary,
      customId: createCustomId(0, 'N', ctx.commandId, 'LEAVE', matchPrivacy, matchStack),
    });

    const cancelButton = createButton({
      label: ctx.locale('commands:poker.cancel-match'),
      style: ButtonStyles.Danger,
      customId: createCustomId(0, ctx.author.id, ctx.commandId, 'CANCEL', matchPrivacy),
    });

    const embed = createInitialMatchEmbed(
      ctx,
      [ctx.author.id],
      invitedUsers.map((a) => a.id),
      ctx.authorData.selectedColor,
      matchPrivacy === 'open' ? MAX_PLAYERS_PER_TABLE : invitedUsers.length,
      getUserAvatar(ctx.author, { enableGif: true }),
      matchStack,
    );

    ctx.makeMessage({
      embeds: [embed],
      content: invitedUsers.map((a) => mentionUser(a.id)).join(' '),
      allowedMentions: { parse: [AllowedMentionsTypes.UserMentions] },
      components: [createActionRow([startButton, enterButton, leaveButton, cancelButton])],
    });

    await pokerRepository.setPokerMatchState(ctx.author.id, {
      gameStared: false,
      inGamePlayers: [`${ctx.author.id}`],
      masterId: `${ctx.author.id}`,
      embedColor: ctx.authorData.selectedColor,
    });

    finishCommand();
  },
});

export default PokerCommand;
