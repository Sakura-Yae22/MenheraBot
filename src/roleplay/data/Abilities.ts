import { AbilitiesFile } from '../Types';

const Abilities: { [id: number]: AbilitiesFile } = {
  1: {
    DevDesc: 'Lamina Envenenada (assassino)',
    cost: 50,
    damage: 17,
    heal: 0,
    parentId: 0,
    boostPerLevel: {
      cost: 5,
      damage: 30,
      heal: 0,
    },
  },
  2: {
    DevDesc: 'Golpes Destemidos (assassino)',
    cost: 60,
    damage: 18,
    heal: 0,
    parentId: 1,
    boostPerLevel: {
      cost: 5,
      damage: 40,
      heal: 0,
    },
  },
  3: {
    DevDesc: 'Atras de Você! (Assassino)',
    cost: 80,
    damage: 17,
    heal: 0,
    parentId: 1,
    boostPerLevel: {
      cost: 10,
      damage: 50,
      heal: 0,
    },
  },
  4: {
    DevDesc: 'Golpe Desleal (assassino)',
    cost: 80,
    damage: 17,
    heal: 130,
    parentId: 3,
    boostPerLevel: {
      cost: 5,
      damage: 20,
      heal: 200,
    },
  },
  5: {
    DevDesc: 'Frenesi (assassino)',
    cost: 80,
    damage: 15,
    heal: 0,
    parentId: 2,
    boostPerLevel: {
      cost: 10,
      damage: 60,
      heal: 0,
    },
  },
  6: {
    DevDesc: 'Benção Elemental (mago branco)',
    cost: 50,
    damage: 10,
    heal: 30,
    parentId: 0,
    boostPerLevel: {
      cost: 5,
      damage: 10,
      heal: 150,
    },
  },
  7: {
    DevDesc: 'Raio de Luz Solar (mago branco)',
    cost: 80,
    damage: 35,
    heal: 0,
    parentId: 6,
    boostPerLevel: {
      cost: 10,
      damage: 70,
      heal: 0,
    },
  },
  8: {
    DevDesc: 'Rosario (mago branco)',
    cost: 80,
    damage: 35,
    heal: 0,
    parentId: 7,
    boostPerLevel: {
      cost: 10,
      damage: 75,
      heal: 60,
    },
  },
  9: {
    DevDesc: 'Ascenção Espiritual (mago branco)',
    cost: 80,
    damage: 35,
    heal: 5,
    parentId: 6,
    boostPerLevel: {
      cost: 10,
      damage: 50,
      heal: 0,
    },
  },
  10: {
    DevDesc: 'Manipulação Éterea (mago branco)',
    cost: 100,
    damage: 80,
    heal: 0,
    parentId: 9,
    boostPerLevel: {
      cost: 20,
      damage: 90,
      heal: 0,
    },
  },
  11: {
    DevDesc: 'Castigo Eterno (Contratados)',
    cost: 25,
    damage: 16,
    heal: 0,
    parentId: 0,
    boostPerLevel: {
      cost: 10,
      damage: 34,
      heal: 0,
    },
  },
  12: {
    DevDesc: 'Dama de Ferro (contratados)',
    cost: 90,
    damage: 40,
    heal: 0,
    parentId: 11,
    boostPerLevel: {
      cost: 20,
      damage: 110,
      heal: 0,
    },
  },
  13: {
    DevDesc: 'Invocar Bahamut (contratados)',
    cost: 130,
    damage: 120,
    heal: 0,
    parentId: 12,
    boostPerLevel: {
      cost: 30,
      damage: 130,
      heal: 0,
    },
  },
  14: {
    DevDesc: 'Caça Voraz (contratados)',
    cost: 50,
    damage: 34,
    heal: 0,
    parentId: 11,
    boostPerLevel: {
      cost: 10,
      damage: 40,
      heal: 0,
    },
  },
  15: {
    DevDesc: 'Perseguição Incontrolável (contratados)',
    cost: 110,
    damage: 130,
    heal: 0,
    parentId: 14,
    boostPerLevel: {
      cost: 25,
      damage: 160,
      heal: 0,
    },
  },
  16: {
    DevDesc: 'Avanço com Escudo (tanks)',
    cost: 20,
    damage: 10,
    heal: 60,
    parentId: 0,
    boostPerLevel: {
      cost: 50,
      damage: 60,
      heal: 160,
    },
  },
  17: {
    DevDesc: 'Estande de Defesa (tanks)',
    cost: 60,
    damage: 60,
    heal: 0,
    parentId: 16,
    boostPerLevel: {
      cost: 20,
      damage: 67,
      heal: 0,
    },
  },
  18: {
    DevDesc: 'Parede de Aço (tank)',
    cost: 80,
    damage: 120,
    heal: 50,
    parentId: 17,
    boostPerLevel: {
      cost: 30,
      damage: 130,
      heal: 50,
    },
  },
  19: {
    DevDesc: 'Proteção Corporal (tank)',
    cost: 60,
    damage: 25,
    heal: 0,
    parentId: 16,
    boostPerLevel: {
      cost: 10,
      damage: 60,
      heal: 0,
    },
  },
  20: {
    DevDesc: 'Nada Passará! (ank)',
    cost: 80,
    damage: 100,
    heal: 150,
    parentId: 19,
    boostPerLevel: {
      cost: 30,
      damage: 100,
      heal: 150,
    },
  },
};

export default Abilities;
