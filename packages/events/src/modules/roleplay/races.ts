interface IRaces {
  [id: number]: {
    develName: string;
    baseLocation: [number, number];
    strength: number;
    intelligence: number;
    dexterity: number;
    stamina: number;
  };
}

const Races: IRaces = {
  1: {
    develName: 'Humano',
    baseLocation: [360, 400],
    strength: 14,
    intelligence: 16,
    dexterity: 13,
    stamina: 17,
  },
  2: {
    develName: 'Elfo',
    baseLocation: [970, 800],
    strength: 11,
    intelligence: 23,
    dexterity: 16,
    stamina: 10,
  },
  3: {
    develName: 'Elfo Negro',
    baseLocation: [800, 970],
    strength: 13,
    intelligence: 21,
    dexterity: 14,
    stamina: 12,
  },
  4: {
    develName: 'Anão',
    baseLocation: [200, 600],
    strength: 18,
    intelligence: 10,
    dexterity: 13,
    stamina: 19,
  },
  5: {
    develName: 'Draconiano',
    baseLocation: [50, 50],
    strength: 10,
    intelligence: 15,
    dexterity: 15,
    stamina: 20,
  },
  6: {
    develName: 'Minotauro',
    baseLocation: [700, 300],
    strength: 22,
    intelligence: 6,
    dexterity: 10,
    stamina: 22,
  },
};

const getRaceById = (raceId: number): IRaces[number] => {
  return Races[raceId];
};

export { Races, getRaceById };
