interface IRaces {
  [id: number]: {
    develName: string;
    baseLocation: [number, number];
  };
}

const Races: IRaces = {
  1: {
    develName: 'Humano',
    baseLocation: [500, 500],
  },
  2: {
    develName: 'Draconiano',
    baseLocation: [10, 40],
  },
};

export { Races };
