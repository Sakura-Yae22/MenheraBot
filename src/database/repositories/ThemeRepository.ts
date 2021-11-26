import { Preferences } from '@structures/DatabaseCollections';
import {
  AvailableProfilesThemes,
  IUserPreferencesSchema,
  IProfileTheme,
  AvailableCardThemes,
  ICardsTheme,
  AvailableTableThemes,
  ITableTheme,
} from '@utils/Types';
import { getThemeById } from '@utils/Util';
import { Redis } from 'ioredis';

export default class ThemeRepository {
  constructor(private preferencesModal: typeof Preferences, private redisClient: Redis | null) {}

  async findOrCreate(
    userId: string,
    projection: Array<keyof IUserPreferencesSchema> = [],
  ): Promise<IUserPreferencesSchema> {
    const result = await this.preferencesModal.findOne({ id: userId }, projection);

    if (!result) return this.preferencesModal.create({ id: userId });

    return result;
  }

  async getTableTheme(userId: string): Promise<AvailableTableThemes> {
    if (this.redisClient) {
      const theme = await this.redisClient.get(`table_theme:${userId}`);
      if (theme) return theme as AvailableTableThemes;
    }

    const theme = await this.findOrCreate(userId, ['selectedTableTheme']);

    if (this.redisClient)
      this.redisClient.setex(`table_theme:${userId}`, 3600, theme.selectedTableTheme);

    return getThemeById<ITableTheme>(theme.selectedTableTheme).data.theme;
  }

  async getCardTheme(userId: string): Promise<AvailableCardThemes> {
    if (this.redisClient) {
      const theme = await this.redisClient.get(`card_theme:${userId}`);
      if (theme) return theme as AvailableCardThemes;
    }

    const theme = await this.findOrCreate(userId, ['selectedCardTheme']);

    if (this.redisClient)
      this.redisClient.setex(`card_theme:${userId}`, 3600, theme.selectedCardTheme);

    return getThemeById<ICardsTheme>(theme.selectedCardTheme).data.theme;
  }

  async getProfileTheme(userId: string): Promise<AvailableProfilesThemes> {
    if (this.redisClient) {
      const theme = await this.redisClient.get(`profile_theme:${userId}`);
      if (theme) return theme as AvailableProfilesThemes;
    }

    const theme = await this.findOrCreate(userId, ['selectedProfileTheme']);

    if (this.redisClient)
      this.redisClient.setex(`profile_theme:${userId}`, 3600, theme.selectedProfileTheme);

    return getThemeById<IProfileTheme>(theme.selectedProfileTheme).data.theme;
  }
}
