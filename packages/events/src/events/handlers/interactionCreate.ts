import { InteractionResponseTypes, InteractionTypes } from 'discordeno/types';
import i18next from 'i18next';

import { autocompleteInteraction } from '../../structures/command/autocompleteInteraction';
import guildRepository from '../../database/repositories/guildRepository';
import usagesRepository from '../../database/repositories/usagesRepository';
import { postCommandExecution } from '../../utils/apiRequests/commands';
import { UsedCommandData } from '../../types/commands';
import { getEnviroments } from '../../utils/getEnviroments';
import { DatabaseUserSchema } from '../../types/database';
import { MessageFlags } from '../../utils/discord/messageUtils';
import blacklistRepository from '../../database/repositories/blacklistRepository';
import InteractionContext from '../../structures/command/InteractionContext';
import { bot, interactionEmitter } from '../../index';
import userRepository from '../../database/repositories/userRepository';
import commandRepository from '../../database/repositories/commandRepository';
import { createEmbed } from '../../utils/discord/embedUtils';
import { logger } from '../../utils/logger';

const { ERROR_WEBHOOK_ID, ERROR_WEBHOOK_TOKEN } = getEnviroments([
  'ERROR_WEBHOOK_ID',
  'ERROR_WEBHOOK_TOKEN',
]);

const testTimeouts = new Map<bigint, NodeJS.Timeout>();

const setInteractionCreateEvent = (): void => {
  bot.events.interactionCreate = async (_, interaction) => {
    if (
      interaction.type === InteractionTypes.MessageComponent ||
      interaction.type === InteractionTypes.ModalSubmit
    ) {
      interactionEmitter.emit('interaction', interaction);
      return;
    }

    if (interaction.type === InteractionTypes.Ping) return;

    if (interaction.type === InteractionTypes.ApplicationCommandAutocomplete)
      return autocompleteInteraction(interaction);

    const errorReply = async (content: string): Promise<void> => {
      await bot.helpers.sendInteractionResponse(interaction.id, interaction.token, {
        type: InteractionResponseTypes.ChannelMessageWithSource,
        data: {
          content: `<:negacao:759603958317711371> | ${content}`,
          flags: MessageFlags.EPHEMERAL,
        },
      });
    };

    const isUserBanned = await blacklistRepository.isUserBanned(interaction.user.id);

    const T = i18next.getFixedT(interaction.user.locale ?? 'pt-BR');

    if (bot.shuttingDown)
      return errorReply(
        'A Menhera está em processo de desligamento! Comandos estão desativados!\n\nMenhera is in the process of shutting down! Commands are disabled!',
      );

    if (isUserBanned) {
      const bannedInfo = await userRepository.getBannedUserInfo(interaction.user.id);

      return errorReply(
        T('permissions:BANNED_INFO', {
          banReason: bannedInfo?.banReason,
        }),
      );
    }

    const commandName = interaction.data?.name as string;
    const command = bot.commands.get(commandName);

    // TODO: Remove this after all tests
    // if (!command) return errorReply(T('permissions:UNKNOWN_SLASH'));

    if (!command) return errorReply(T('permissions:RPG_MAINTENANCE'));

    if (command.devsOnly && interaction.user.id !== bot.ownerId)
      return errorReply(T('permissions:ONLY_DEVS'));

    const commandMaintenanceInfo = await commandRepository.getMaintenanceInfo(commandName);

    if (commandMaintenanceInfo?.maintenance && interaction.user.id !== bot.ownerId)
      return errorReply(
        T('events:maintenance', {
          reason: commandMaintenanceInfo.maintenanceReason,
        }),
      );

    if (command.category === 'economy') {
      if (await usagesRepository.isUserInEconomyUsage(interaction.user.id))
        return errorReply(T('permissions:IN_COMMAND_EXECUTION'));

      await usagesRepository.setUserInEconomyUsages(interaction.user.id);
    }

    const authorData =
      command.authorDataFields.length > 0
        ? await userRepository.ensureFindUser(interaction.user.id)
        : null;

    const guildLocale = i18next.getFixedT(
      await guildRepository.getGuildLanguage(interaction.guildId as bigint),
    );

    const ctx = new InteractionContext(interaction, authorData as DatabaseUserSchema, guildLocale);

    bot.commandsInExecution += 1;

    testTimeouts.set(
      interaction.id,
      setTimeout(() => {
        logger.debug(`Provavel leak de execução no comando ${command.name}.`);
        testTimeouts.delete(interaction.id);
      }, 120_000),
    );

    await new Promise((res) => {
      command.execute(ctx, res).catch((err) => {
        errorReply(
          T('events:error_embed.title', {
            cmd: command.name,
          }),
        );

        // eslint-disable-next-line no-param-reassign
        if (typeof err === 'string') err = new Error(err);

        if (err instanceof Error && err.stack) {
          const errorMessage =
            err.stack.length > 3800 ? `${err.stack.slice(0, 3800)}...` : err.stack;
          const embed = createEmbed({
            color: 0xfd0000,
            title: `${process.env.NODE_ENV === 'development' ? '[BETA]' : ''} ${T(
              'events:error_embed.title',
              {
                cmd: command.name,
              },
            )}`,
            description: `\`\`\`js\n${errorMessage}\`\`\``,
            fields: [
              {
                name: '<:atencao:759603958418767922> | Quem Usou',
                value: `UserId: \`${interaction.user.id}\` \nServerId: \`${interaction.guildId}\``,
              },
            ],
            timestamp: Date.now(),
          });

          bot.helpers.sendWebhookMessage(BigInt(ERROR_WEBHOOK_ID), ERROR_WEBHOOK_TOKEN, {
            embeds: [embed],
          });
        }

        res(null);
      });
    });

    bot.commandsInExecution -= 1;

    clearTimeout(testTimeouts.get(interaction.id));
    testTimeouts.delete(interaction.id);

    if (command.category === 'economy')
      await usagesRepository.removeUserFromEconomyUsages(interaction.user.id);

    // TODO: Remove this after all tests
    console.log(
      `[${new Date().toISOString().substring(11, 19)}] ${command.name} - ${interaction.user.id} `,
    );

    if (!interaction.guildId || process.env.NODE_ENV !== 'PRODUCTION') return;

    const data: UsedCommandData = {
      authorId: `${interaction.user.id}`,
      guildId: `${interaction.guildId}`,
      commandName: command.name,
      data: Date.now(),
      args: interaction.data?.options ?? [],
    };

    postCommandExecution(data);
  };
};

export { setInteractionCreateEvent };
