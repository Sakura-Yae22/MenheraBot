/* eslint-disable no-use-before-define */
import { CreateSlashApplicationCommand } from 'discordeno';

import InteractionContext from '../structures/command/InteractionContext';
import { DatabaseUserSchema } from './database';

type CommandCategory = 'economy' | 'roleplay' | 'fun' | 'actions' | 'info' | 'dev';

export interface ChatInputCommandConfig extends CreateSlashApplicationCommand {
  devsOnly?: true;
  category: CommandCategory;
  authorDataFields: Array<keyof DatabaseUserSchema>;
}

export interface ChatInputInteractionCommand extends Readonly<ChatInputCommandConfig> {
  path: string;

  readonly execute: (ctx: InteractionContext) => Promise<void>;
}

export interface UsedCommandData {
  authorId: string;
  guildId: string;
  commandName: string;
  data: number;
  args: unknown[];
}

export interface MaintenanceCommandData {
  isDisabled: boolean;
  reason: string | null;
}

export interface ApiCommandInformation {
  name: string;
  nameLocalizations?: LocalizationMap;
  description: string;
  descriptionLocalizations?: LocalizationMap;
  category: string;
  options: ApplicationCommandOptionData[];
  disabled: MaintenanceCommandData;
}
