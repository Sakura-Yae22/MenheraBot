import { BigString } from 'discordeno/types';
import { DatabaseCharacterSchema } from '../../types/database';
import { characterModel } from '../collections';

const getCharacter = async (userId: BigString): Promise<DatabaseCharacterSchema | null> => {
  return characterModel.findOne({ id: `${userId}` });
};

const registerCharacter = async (
  userId: BigString,
  raceId: number,
  currentLocation: [number, number],
): Promise<void> => {
  await characterModel.create({
    id: `${userId}`,
    race: raceId,
    currentLocation,
  });
};

export default { getCharacter, registerCharacter };
