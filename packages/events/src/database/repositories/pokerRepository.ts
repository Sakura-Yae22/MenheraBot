import { BigString } from 'discordeno/types';
import { PokerMatch } from '../../modules/poker/types';
import { RedisClient } from '../databases';

const isUserAlreadyInMatch = async (userId: BigString): Promise<boolean> =>
  RedisClient.sismember('poker_match', `${userId}`).then((r) => r === 1);

const setPokerMatchState = async (matchId: BigString, matchData: PokerMatch): Promise<void> => {
  await RedisClient.setex(`poker:${matchId}`, 3600, JSON.stringify(matchData));
};

const getPokerMatchState = async (matchId: BigString): Promise<PokerMatch | null> => {
  const fromRedis = await RedisClient.get(`poker:${matchId}`);

  if (fromRedis) return JSON.parse(fromRedis);

  return null;
};

const deletePokerMatch = async (matchId: BigString): Promise<void> => {
  await RedisClient.del(`poker:${matchId}`);
};

const addUsersInMatch = async (userIds: BigString[]): Promise<void> => {
  await RedisClient.sadd(
    'poker_match',
    userIds.map((a) => `${a}`),
  );
};

const removeUsersInMatch = async (userIds: BigString[]): Promise<void> => {
  await RedisClient.srem(
    'poker_match',
    userIds.map((a) => `${a}`),
  );
};

export default {
  isUserAlreadyInMatch,
  setPokerMatchState,
  addUsersInMatch,
  getPokerMatchState,
  deletePokerMatch,
  removeUsersInMatch,
};
