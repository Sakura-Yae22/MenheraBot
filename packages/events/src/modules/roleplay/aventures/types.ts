enum AdventureTypes {
  BATTLE = 1,
}

export interface UserAdventure {
  interactionId: string;
  interactionToken: string;
  type: AdventureTypes;
}
