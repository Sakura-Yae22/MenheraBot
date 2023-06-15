import { BigString } from 'discordeno/types';
import { UserAdventure } from '../../modules/roleplay/aventures/types';
import { UserPoints } from '../../modules/roleplay/userStatus';
import { DatabaseCharacterSchema } from '../../types/database';
import { characterModel } from '../collections';
import { MainRedisClient } from '../databases';

const getCharacter = async (userId: BigString): Promise<DatabaseCharacterSchema | null> => {
  return characterModel.findOne({ id: `${userId}` });
};

const registerCharacter = async (
  userId: BigString,
  raceId: number,
  currentLocation: [number, number],
  userStatus: UserPoints,
): Promise<void> => {
  await characterModel.create({
    id: `${userId}`,
    race: raceId,
    currentLocation,
    dexterity: userStatus.dexterity,
    intelligence: userStatus.intelligence,
    stamina: userStatus.stamina,
    strength: userStatus.strength,
    life: 10000,
    mana: 10000,
    weary: 10000,
  });
};

const getUserAdventure = async (userId: BigString): Promise<null | UserAdventure> => {
  const fromRedis = await MainRedisClient.get(`adventure:${userId}`);

  if (fromRedis) return JSON.parse(fromRedis);

  return null;
};

const updateUserAdventure = async (userId: BigString, adventure: UserAdventure): Promise<void> => {
  await MainRedisClient.set(`adventure:${userId}`, JSON.stringify(adventure));
};

export default { getCharacter, registerCharacter, getUserAdventure, updateUserAdventure };
