import { BigString } from 'discordeno/types';
import { UserPoints } from '../../modules/roleplay/userStatus';
import { DatabaseCharacterSchema } from '../../types/database';
import { characterModel } from '../collections';

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

export default { getCharacter, registerCharacter };
