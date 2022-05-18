import axios from 'axios';

import {
  BichoBetType,
  BichoTop,
  BlackjackTop,
  CoinflipTop,
  HuntTop,
  HuntTypes,
  ICommandsData,
  ICommandUsedData,
  IDisabled,
  IRESTBichoStats,
  IRESTGameStats,
  IRESTHuntStats,
  IStatusData,
  RouletteTop,
} from '@custom_types/Menhera';
import type { ActivityType } from 'discord.js-light';
import { UserBattleConfig } from '@roleplay/Types';
import { debugError, MayNotExists } from './Util';

const topggRequest = axios.create({
  baseURL: `https://top.gg/api`,
  headers: {
    'Content-Type': 'application/json',
    Authorization: process.env.DBL_TOKEN as string,
  },
});

const apiRequest = axios.create({
  baseURL: `${process.env.API_URL}/data`,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': process.env.MENHERA_AGENT as string,
    Authorization: process.env.API_TOKEN as string,
  },
});

const StatusRequest = axios.create({
  baseURL: `${process.env.API_URL}/info`,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': process.env.MENHERA_AGENT as string,
    Authorization: process.env.API_TOKEN as string,
  },
});

export default class HttpRequests {
  static async getAssetImageUrl(type: string): Promise<string> {
    try {
      const data = await apiRequest.get(`/assets/${type}`);
      return data.data.url;
    } catch {
      return 'https://i.imgur.com/HftTDov.png';
    }
  }

  static async getUserBattleConfig(
    userId: string,
  ): Promise<{ error: false; data: { config: UserBattleConfig } } | { error: true }> {
    const result = await apiRequest.get(`/roleplay/battleconf/?userId=${userId}`).catch(debugError);

    if (!result || result.status !== 200) return { error: true };

    return { error: false, data: result.data };
  }

  static async updateUserBattleConfig(userId: string, config: UserBattleConfig): Promise<void> {
    await apiRequest.patch(`/roleplay/battleconf/?userId=${userId}`, { config }).catch(debugError);
  }

  static async postCommandStatus(commands: ICommandsData[]): Promise<void> {
    await StatusRequest.post('/commands', { data: { commands } }).catch(debugError);
  }

  static async postShardStatus(shards: IStatusData[]): Promise<void> {
    await StatusRequest.put('/shards', { data: { shards } }).catch(debugError);
  }

  static async updateCommandStatusMaintenance(
    commandName: string,
    maintenance: IDisabled,
  ): Promise<void> {
    await StatusRequest.patch(`/commands/${commandName}`, {
      data: { disabled: maintenance },
    }).catch(debugError);
  }

  static async getProfileCommands(
    id: string,
  ): Promise<false | { cmds: { count: number }; array: Array<{ name: string; count: number }> }> {
    try {
      const data = await apiRequest.get('/usages/user', { data: { userId: id } });
      if (data.status === 200) return data.data;
    } catch {
      return false;
    }
    return false;
  }

  static async getTopCommands(): Promise<false | { name: string; usages: number }[]> {
    try {
      const data = await apiRequest.get('/usages/top/command');
      if (data.status === 200) return data.data;
    } catch {
      return false;
    }

    return false;
  }

  static async postBotStatus(
    botId: string,
    serverCount: number,
    shardCount: number,
  ): Promise<void> {
    await topggRequest
      .post(`/bots/${botId}/stats`, { server_count: serverCount, shard_count: shardCount })
      .catch(debugError);
  }

  static async getTopUsers(): Promise<false | { id: string; uses: number }[]> {
    try {
      const data = await apiRequest.get('/usages/top/user');
      if (data.status === 200) return data.data;
    } catch {
      return false;
    }
    return false;
  }

  static async getCoinflipUserStats(id: string): Promise<IRESTGameStats | { error: true }> {
    try {
      const data = await apiRequest.get('/statistics/coinflip', { data: { userId: id } });
      if (data.status === 400) return { error: true };
      if (!data.data.error) return data.data;
    } catch {
      return { error: true };
    }

    return { error: true };
  }

  static async getBichoUserStats(id: string): Promise<IRESTBichoStats | { error: true }> {
    try {
      const data = await apiRequest.get('/statistics/bicho', { data: { userId: id } });
      if (data.status === 400) return { error: true };
      if (!data.data.error) return data.data;
    } catch {
      return { error: true };
    }

    return { error: true };
  }

  static async getRouletteUserStats(id: string): Promise<IRESTGameStats | { error: true }> {
    try {
      const data = await apiRequest.get('/statistics/roulette', { data: { userId: id } });
      if (data.status === 400) return { error: true };
      if (!data.data.error) return data.data;
    } catch {
      return { error: true };
    }

    return { error: true };
  }

  static async postRouletteGame(
    userId: string,
    betValue: number,
    betType: string,
    profit: number,
    didWin: boolean,
    selectedValues: string,
  ): Promise<void> {
    await apiRequest
      .post('/statistics/roulette', { userId, betValue, profit, didWin, betType, selectedValues })
      .catch(debugError);
  }

  static async postCommand(info: ICommandUsedData): Promise<void> {
    await apiRequest
      .post('/usages/commands', {
        authorId: info.authorId,
        guildId: info.guildId,
        commandName: info.commandName,
        data: info.data,
        args: info.args,
        shardId: info.shardId,
      })
      .catch(debugError);
  }

  static async getActivity(
    clusterId: number,
  ): Promise<{ name: string; type: Exclude<ActivityType, 'CUSTOM'> }> {
    /*  try {
      const data = await apiRequest.get('/activity', { data: { shard: shard || 0 } });
      return data.data;
    } catch { */
    return { name: `❤️ | Menhera foi criada pela Lux | Cluster ${clusterId}`, type: 'PLAYING' };
    // }
  }

  static async getBlackJackStats(id: string): Promise<IRESTGameStats | { error: true }> {
    try {
      const data = await apiRequest.get('/statistics/blackjack', { data: { userId: id } });
      if (data.status === 400) return { error: true };
      if (!data.data.error) return data.data;
    } catch {
      return { error: true };
    }

    return { error: true };
  }

  static async postBlackJack(userId: string, didWin: boolean, betValue: number): Promise<void> {
    await apiRequest.post('/statistics/blackjack', { userId, didWin, betValue }).catch(debugError);
  }

  static async postCoinflipGame(
    winnerId: string,
    loserId: string,
    betValue: number,
    date: number,
  ): Promise<void> {
    await apiRequest
      .post('/statistics/coinflip', { winnerId, loserId, betValue, date })
      .catch(debugError);
  }

  static async postBichoGame(
    userId: string,
    value: number,
    betType: BichoBetType,
    betSelection: string,
  ): Promise<MayNotExists<{ gameId: number }>> {
    return apiRequest
      .post('/statistics/bicho', { userId, value, betType, betSelection })
      .catch(debugError)
      .then((a) => a?.data);
  }

  static async userWinBicho(gameId: number): Promise<void> {
    if (!gameId) return;
    await apiRequest.patch('/statistics/bicho', { gameId });
  }

  static async postHuntCommand(
    userId: string,
    huntType: string,
    { value, success, tries }: { value: number; success: number; tries: number },
  ): Promise<void> {
    await apiRequest
      .post('/statistics/hunt', { userId, huntType, value, success, tries })
      .catch(debugError);
  }

  static async postBichoUserStats(
    userId: string,
    betValue: number,
    profit: number,
    didWin: boolean,
  ): Promise<void> {
    await apiRequest
      .put('/statistics/bicho', { userId, betValue, profit, didWin })
      .catch(debugError);
  }

  static async getTopBlackjack(
    skip: number,
    bannedUsers: string[],
    type: 'wins' | 'money',
  ): Promise<BlackjackTop[] | null> {
    try {
      const data = await apiRequest.get('/statistics/blackjack/top', {
        data: { skip, bannedUsers, type },
      });
      if (data.status === 400) return null;
      if (!data.data.error) return data.data;
    } catch {
      return null;
    }

    return null;
  }

  static async getTopCoinflip(
    skip: number,
    bannedUsers: string[],
    type: 'wins' | 'money',
  ): Promise<CoinflipTop[] | null> {
    try {
      const data = await apiRequest.get('/statistics/coinflip/top', {
        data: { skip, bannedUsers, type },
      });
      if (data.status === 400) return null;
      if (!data.data.error) return data.data;
    } catch {
      return null;
    }

    return null;
  }

  static async getTopRoulette(
    skip: number,
    bannedUsers: string[],
    type: 'wins' | 'money',
  ): Promise<RouletteTop[] | null> {
    try {
      const data = await apiRequest.get('/statistics/roulette/top', {
        data: { skip, bannedUsers, type },
      });
      if (data.status === 400) return null;
      if (!data.data.error) return data.data;
    } catch {
      return null;
    }

    return null;
  }

  static async getTopBicho(
    skip: number,
    bannedUsers: string[],
    type: 'wins' | 'money',
  ): Promise<BichoTop[] | null> {
    try {
      const data = await apiRequest.get('/statistics/bicho/top', {
        data: { skip, bannedUsers, type },
      });
      if (data.status === 400) return null;
      if (!data.data.error) return data.data;
    } catch {
      return null;
    }

    return null;
  }

  static async getTopHunts<HuntType extends HuntTypes>(
    skip: number,
    bannedUsers: string[],
    huntType: HuntTypes,
    type: 'success' | 'tries' | 'hunted',
  ): Promise<HuntTop<HuntType>[] | null> {
    try {
      const data = await apiRequest.get('/statistics/hunt/top', {
        data: { skip, bannedUsers, type, huntType },
      });
      if (data.status === 400) return null;
      if (!data.data.error) return data.data;
    } catch {
      return null;
    }

    return null;
  }

  static async getHuntUserStats(id: string): Promise<IRESTHuntStats | { error: true }> {
    try {
      const data = await apiRequest.get('/statistics/hunt', { data: { userId: id } });
      if (data.status === 400) return { error: true };
      if (!data.data.error) return data.data;
    } catch {
      return { error: true };
    }

    return { error: true };
  }

  static async getUserDeleteUsages(userId: string): Promise<{ count?: number; err: boolean }> {
    try {
      const data = await apiRequest.get('/usages/user/delete', { data: { userId } });
      if (data) return { count: data.data.count, err: false };
      return { err: true };
    } catch {
      return { err: true };
    }
  }

  static async inactiveUsers(users: string[]): Promise<{ user_id: string; date: number } | null> {
    try {
      const data = await apiRequest.get('/usages/inactive', { data: users });
      return data.data;
    } catch {
      return null;
    }
  }
}
