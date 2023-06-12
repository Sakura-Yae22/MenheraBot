type Enemy = {
  id: number;
  life: number;
  strength: number;
};

const getEnemies = (location: [number, number]): Enemy[] => {
  if (location[0] > 500) return [{ id: 1, life: 40, strength: 15 }];

  return [{ id: 1, life: 50, strength: 10 }];
};

export { getEnemies };
