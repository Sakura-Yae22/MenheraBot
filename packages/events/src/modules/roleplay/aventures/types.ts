export enum AdventureTypes {
  BATTLE = 1,
}

interface InBattleEnemy {
  life: number;
  level: number;
  id: number;
}

export type EffectType = 'slow';

export interface AbilityEffect {
  effectType: EffectType;
  duration: number;
  value: number;
  valueModifier: 'plain' | 'percentage';
  target: 'self' | 'enemy';
}

export interface UserAdventure {
  interactionId: string;
  interactionToken: string;
  type: AdventureTypes;
  enemies: InBattleEnemy[];
}
