export enum AdventureTypes {
  BATTLE = 1,
}

interface InBattleEnemy {
  life: number;
  level: number;
  id: number;
}

export interface UserAdventure {
  interactionId: string;
  interactionToken: string;
  type: AdventureTypes;
  enemies: InBattleEnemy[];
}
