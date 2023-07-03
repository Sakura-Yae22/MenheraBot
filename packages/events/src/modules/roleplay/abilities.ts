import { AbilityEffect } from './aventures/types';

type ValueByAbilityLevel = [number, number, number, number, number]; // 0%, 25%, 50% 75% 100%

interface EvolveAddEffect extends AbilityEffect {
  type: 'add_effect';
}

type AbilityEvolve = EvolveAddEffect;

interface IAbilities {
  [id: number]: {
    develName: string;
    cost: ValueByAbilityLevel; // mana cost - By level
    baseDamage: ValueByAbilityLevel; // Dano base - By level
    scaledDamage: ValueByAbilityLevel; // Porcentagem de status
    scaledBy: 'intelligence' | 'strength'; // Habilidade mágica ou fisica,
    effects: AbilityEffect[];
    evolve: AbilityEvolve;
  };
}

const Abilities: IAbilities = {
  1: {
    develName: 'Bola de Água',
    cost: [20, 20, 20, 20, 20],
    baseDamage: [20, 30, 50, 60, 80],
    scaledBy: 'intelligence',
    scaledDamage: [20, 20, 20, 20, 40],
    effects: [],
    evolve: {
      type: 'add_effect', // Ao evoluir, a habilidade comeca a dar slow
      duration: 2,
      effectType: 'slow',
      target: 'enemy',
      valueModifier: 'percentage',
      value: 20,
    },
  },
};

const getAbilityById = (abilityId: number): IAbilities[number] => {
  return Abilities[abilityId];
};

export { getAbilityById };
