/* eslint-disable @typescript-eslint/ban-types */
import { ThemeFile } from './types';

const Themes: { [id: number]: ThemeFile } & Object = {
  1: {
    isBuyable: true,
    price: 100_000,
    rarity: 'common',
    type: 'table',
    theme: 'blue',
  },
  2: {
    isBuyable: true,
    price: 200_000,
    rarity: 'rare',
    theme: 'upsidedown',
    type: 'profile',
  },
  3: {
    isBuyable: false,
    price: 0,
    rarity: 'common',
    theme: 'default',
    type: 'profile',
  },
  4: {
    isBuyable: false,
    price: 0,
    rarity: 'common',
    theme: 'default',
    type: 'cards',
  },
  5: {
    isBuyable: false,
    price: 0,
    rarity: 'common',
    theme: 'green',
    type: 'table',
  },
  6: {
    isBuyable: false,
    price: 0,
    rarity: 'common',
    theme: 'red',
    type: 'card_background',
  },
  7: {
    isBuyable: true,
    price: 950_000,
    rarity: 'legendary',
    theme: 'death',
    type: 'cards',
  },
  8: {
    isBuyable: true,
    price: 80_000,
    rarity: 'common',
    theme: 'blue',
    type: 'card_background',
  },
  9: {
    isBuyable: true,
    price: 140_000,
    rarity: 'rare',
    theme: 'cute_menhera',
    type: 'card_background',
  },
  10: {
    isBuyable: true,
    price: 320_000,
    rarity: 'epic',
    theme: 'premium',
    type: 'card_background',
  },
  11: {
    isBuyable: true,
    price: 100_000,
    rarity: 'common',
    theme: 'red',
    type: 'table',
  },
  12: {
    isBuyable: true,
    price: 120_000,
    rarity: 'common',
    theme: 'pink',
    type: 'table',
  },
  13: {
    isBuyable: true,
    price: 150_000,
    rarity: 'rare',
    theme: 'rounded',
    type: 'table',
  },
  14: {
    isBuyable: true,
    price: 300_000,
    rarity: 'rare',
    type: 'profile',
    theme: 'christmas_2021',
  },
  15: {
    isBuyable: true,
    price: 240_000,
    rarity: 'rare',
    type: 'profile',
    theme: 'warrior',
  },
  16: {
    isBuyable: true,
    price: 240_000,
    rarity: 'rare',
    type: 'profile',
    theme: 'fortification',
  },
  17: {
    isBuyable: true,
    price: 190_000,
    rarity: 'rare',
    type: 'profile',
    theme: 'kawaii',
  },
  18: {
    isBuyable: true,
    price: 90_000,
    rarity: 'rare',
    theme: 'kawaii',
    type: 'card_background',
  },
  19: {
    isBuyable: true,
    price: 170_000,
    rarity: 'rare',
    type: 'table',
    theme: 'gauderios',
  },
  20: {
    isBuyable: true,
    price: 250_000,
    rarity: 'epic',
    type: 'card_background',
    theme: 'lamenta_caelorum',
  },
  21: {
    isBuyable: true,
    price: 650_000,
    rarity: 'epic',
    theme: 'without_soul',
    type: 'profile',
  },
  22: {
    isBuyable: true,
    price: 350_000,
    rarity: 'rare',
    theme: 'id03',
    type: 'profile',
  },
  23: {
    isBuyable: true,
    price: 200_000,
    rarity: 'epic',
    theme: 'atemporal',
    type: 'table',
  },
};

export default Themes;
