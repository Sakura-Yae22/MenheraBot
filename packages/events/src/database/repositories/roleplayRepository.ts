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
    dexterity: 0,
    intelligence: 0,
    stamina: 0,
    strength: 0,
    life: 100,
    mana: 100,
    weary: 100,
  });
};

export default { getCharacter, registerCharacter };
