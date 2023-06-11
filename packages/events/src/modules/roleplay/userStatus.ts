import { DatabaseCharacterSchema } from '../../types/database';
import { INTELLIGENCE_BY_POINTS, STAMINA_BY_POINTS } from './constants';
import { getRaceById } from './races';

type AvailableStats = 'life' | 'mana' | 'weary';

type UserStatus<T extends AvailableStats> = {
  [K in T | `max${Capitalize<T>}`]: number;
};

export type UserPoints = {
  dexterity: number;
  intelligence: number;
  stamina: number;
  strength: number;
};

const getUserLife = (player: DatabaseCharacterSchema): UserStatus<'life'> => {
  const maxLife = (getRaceById(player.race).stamina + player.stamina) * STAMINA_BY_POINTS;
  const life = Math.ceil(player.life / 10000) * maxLife;

  return { life, maxLife };
};

const getUserMana = (player: DatabaseCharacterSchema): UserStatus<'mana'> => {
  const maxMana =
    (getRaceById(player.race).intelligence + player.intelligence) * INTELLIGENCE_BY_POINTS;
  const mana = Math.ceil(player.mana / 10000) * maxMana;

  return { mana, maxMana };
};

const getUserWeary = (player: DatabaseCharacterSchema): UserStatus<'weary'> => {
  const maxWeary = (getRaceById(player.race).stamina + player.stamina) * STAMINA_BY_POINTS;
  const weary = Math.ceil(player.weary / 10000) * maxWeary;

  return { weary, maxWeary };
};

const getAllUserStats = (player: DatabaseCharacterSchema): UserStatus<AvailableStats> => {
  const userLife = getUserLife(player);
  const userMana = getUserMana(player);
  const userWeary = getUserWeary(player);

  return { ...userLife, ...userMana, ...userWeary };
};

export { getAllUserStats };
