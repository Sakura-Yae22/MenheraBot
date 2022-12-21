import { Embed } from 'discordeno/transformers';
import pokerRepository from '../../database/repositories/pokerRepository';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { InteractionContext } from '../../types/interaction';
import { createEmbed } from '../../utils/discord/embedUtils';
import { VanGoghReturnData, vanGoghRequest, VanGoghEndpoints } from '../../utils/vanGoghRequest';
import { shuffleCards } from '../blackjack';
import { PlayerData, PokerMatch, VangoghPokerUserData } from './types';

const requestPokerImage = async (
  users: VangoghPokerUserData[],
  openedCards: number[],
  pot: number,
): Promise<VanGoghReturnData> => {
  return vanGoghRequest(VanGoghEndpoints.Poker, {
    cards: openedCards,
    pot,
    users,
  });
};

const createMatchEmbed = async (
  ctx: InteractionContext,
  matchData: PokerMatch<true>,
): Promise<[Embed, VanGoghReturnData]> => {
  const parseUserToVangogh = (user: PlayerData): VangoghPokerUserData => ({
    avatar: user.discordUser.avatar,
    name: user.discordUser.username,
    chips: user.stack,
    fold: user.folded,
    dealer:
      matchData.tableData.dealerIndex === matchData.inGamePlayers.indexOf(user.discordUser.id),
    theme: user.cardBackgroundTheme,
  });

  const image = await requestPokerImage(
    Object.values(matchData.playersData).map(parseUserToVangogh),
    matchData.tableData.cardsOpen,
    matchData.tableData.pot,
  );

  const mainEmbed = createEmbed({
    title: ctx.locale('commands:poker.ingame.main-embed-title'),
    image: image.err ? undefined : { url: 'attachment://poker.png' },
  });

  return [mainEmbed, image];
};

const startPokerMatch = async (ctx: ComponentInteractionContext): Promise<void> => {
  await ctx.ack();
  const matchData = await pokerRepository.getPokerMatchState<true>(ctx.commandAuthor.id);

  if (!matchData) return;

  const [embed, image] = await createMatchEmbed(ctx, matchData);

  if (!image.err)
    ctx.makeMessage({ embeds: [embed], file: { name: 'poker.png', blob: image.data } });
};

const setupPokerTable = async (ctx: InteractionContext): Promise<void> => {
  const matchData = await pokerRepository.getPokerMatchState<true>(ctx.commandAuthor.id);
  if (!matchData) return;

  const shuffledCards = shuffleCards();

  const getNextIndex = (afterDealer: number): number => {
    const index = matchData.tableData.dealerIndex + afterDealer;
    const toReturn =
      index % matchData.inGamePlayers.filter((a) => !matchData.quittedPlayers.includes(a)).length;

    if (toReturn === matchData.tableData.dealerIndex) return getNextIndex(afterDealer + 1);

    return toReturn;
  };

  const dealerId = matchData.inGamePlayers[getNextIndex(1)];
  const smallBlindId = matchData.inGamePlayers[getNextIndex(2)];
  const bigBlindId =
    matchData.inGamePlayers.length > 2 ? matchData.inGamePlayers[getNextIndex(3)] : null;
};

export { startPokerMatch };
