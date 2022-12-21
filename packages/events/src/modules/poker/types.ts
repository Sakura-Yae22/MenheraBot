import { AvailableCardBackgroundThemes } from '../themes/types';

export type PlayerData = {
  stack: number;
  cards: [number, number];
  currentBet: number;
  folded: boolean;
  cardBackgroundTheme: AvailableCardBackgroundThemes;
  discordUser: {
    avatar: string;
    username: string;
    id: string;
  };
};

export type TableData = {
  cardsPile: number[];
  cardsOpen: number[];
  dealerId: string;
  pot: number;
};

interface PokerLobby {
  masterId: string;
  gameStared: false;
  embedColor: string;
  inGamePlayers: string[];
}

interface InGamePokerMatch {
  masterId: string;
  gameStared: true;
  embedColor: string;
  inGamePlayers: string[];
  playersData: Record<string, PlayerData>;
  tableData: TableData;
}

export type PokerMatch<MatchStarted = false> = MatchStarted extends true
  ? InGamePokerMatch
  : PokerLobby;

export interface VangoghPokerUserData {
  avatar: string;
  name: string;
  fold: boolean;
  chips: number;
  dealer: boolean;
  theme: AvailableCardBackgroundThemes;
}
