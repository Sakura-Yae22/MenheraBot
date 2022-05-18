import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { ApplicationCommandData } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';
import { ICommandsData, IUserDataToProfile } from '@custom_types/Menhera';
import { debugError, toWritableUTF } from '@utils/Util';
import { PicassoRoutes, requestPicassoImage } from '@utils/PicassoRequests';

export default class DeploySlashCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'deploy',
      description: '[DEV] Faz o deploy dos comandos em Slash',
      category: 'dev',
      options: [
        {
          type: 'STRING',
          name: 'option',
          description: 'Tipo, se quer no server ou global',
          choices: [
            {
              name: 'Global',
              value: 'global',
            },
            {
              name: 'WEBSITE',
              value: 'site',
            },
            {
              name: 'Server',
              value: 'server',
            },
            {
              name: 'DEVELOPER',
              value: 'developer',
            },
          ],
          required: true,
        },
        {
          name: 'senha',
          description: 'senha pra fazer deploy global pra ter certeza que n apertei errado',
          type: 'STRING',
          required: false,
        },
      ],
      devsOnly: true,
      cooldown: 1,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    if (ctx.options.getString('option', true) === 'site') {
      await ctx.defer();

      const user = await ctx.client.repositories.userRepository.find(ctx.author.id);

      const member = ctx.author;

      if (!user) return;

      const marry =
        user.married && user.married !== 'false'
          ? await ctx.client.users.fetch(user.married).catch(debugError)
          : null;

      const avatar = member.displayAvatarURL({ format: 'png', size: 512 });
      const usageCommands = await HttpRequests.getProfileCommands(member.id);

      const userSendData: IUserDataToProfile & { id: string } = {
        id: ctx.author.id,
        cor: user.selectedColor,
        avatar,
        votos: user.votes,
        nota: user.info,
        tag: toWritableUTF(member.tag),
        flagsArray: member.flags?.toArray() ?? [],
        casado: user.married,
        voteCooldown: user.voteCooldown as number,
        badges: user.badges,
        username: toWritableUTF(member.username),
        data: user.marriedDate as string,
        mamadas: user.mamado,
        mamou: user.mamou,
        hiddingBadges: user.hiddingBadges,
        marry: null,
      };

      if (marry) {
        userSendData.marry = {
          username: toWritableUTF(marry.username),
          tag: `${toWritableUTF(marry.username)}#${marry.discriminator}`,
        };
      }

      const i18nData = {
        aboutme: ctx.locale('commands:perfil.about-me'),
        mamado: ctx.locale('commands:perfil.mamado'),
        mamou: ctx.locale('commands:perfil.mamou'),
        zero: ctx.locale('commands:perfil.zero'),
        um: ctx.locale('commands:perfil.um'),
        dois: ctx.locale('commands:perfil.dois'),
        tres: ctx.locale('commands:perfil.tres'),
      };

      const profileTheme = await ctx.client.repositories.themeRepository.getProfileTheme(member.id);
      // AQUI
      const startTime = Date.now();

      await requestPicassoImage(
        PicassoRoutes.BETA,
        { user: userSendData, usageCommands, i18n: i18nData, type: profileTheme },
        ctx,
      );

      console.log(`SEM CACHE ${Date.now() - startTime}ms`);
      const teste = Date.now();
      await requestPicassoImage(
        PicassoRoutes.BETA,
        { user: userSendData, usageCommands, i18n: i18nData, type: profileTheme },
        ctx,
      );
      console.log(`COM CACHE ${Date.now() - teste}ms`);

      return;

      // AQUI

      const toAPIData = new Map<string, ICommandsData>();

      const disabledCommands =
        await ctx.client.repositories.cmdRepository.getAllCommandsInMaintenance();

      await Promise.all(
        ctx.client.slashCommands.map(async (c) => {
          if (c.config.category === 'dev') return;
          const found = disabledCommands.find((a) => a._id?.toString() === c.config.name);

          toAPIData.set(c.config.name, {
            name: c.config.name,
            category: c.config.category,
            cooldown: c.config.cooldown ?? 0,
            description: c.config.description,
            options: c.config.options ?? [],
            descriptionLocalizations: c.config.descriptionLocalizations,
            nameLocalizations: c.config.nameLocalizations,
            disabled: {
              isDisabled: found?.maintenance ?? false,
              reason: found?.maintenanceReason ?? null,
            },
          });
        }),
      );

      await HttpRequests.postCommandStatus(Array.from(toAPIData.values()));
      ctx.makeMessage({ content: 'Commandos deployados' });
      return;
    }

    if (ctx.options.getString('option', true) === 'global') {
      if (!ctx.options.getString('senha') || ctx.options.getString('senha') !== 'MACACO PREGO') {
        ctx.makeMessage({
          content: 'SENHA ERRADA ANIMAL. CASO QUERIA DAR DEPLOY GLOBAL, A SENHA É "MACACO PREGO"',
          ephemeral: true,
        });
        return;
      }

      const toAPIData = new Map();

      const allCommands = ctx.client.slashCommands.reduce<ApplicationCommandData[]>((p, c) => {
        if (c.config.devsOnly) return p;
        toAPIData.set(c.config.name, {
          name: c.config.name,
          category: c.config.category,
          cooldown: c.config.cooldown ?? 0,
          description: c.config.description,
          options: c.config.options ?? [],
          nameLocalizations: c.config.nameLocalizations,
          descriptionLocalizations: c.config.descriptionLocalizations,
        });
        p.push({
          name: c.config.name,
          description: c.config.description,
          options: c.config.options,
          nameLocalizations: c.config.nameLocalizations,
          descriptionLocalizations: c.config.descriptionLocalizations,
        });
        return p;
      }, []);

      await ctx.makeMessage({ content: 'Iniciando deploy' });

      const disabledCommands =
        await ctx.client.repositories.cmdRepository.getAllCommandsInMaintenance();

      disabledCommands.map((a) => {
        const data = toAPIData.get(a._id);
        data.disabled = {
          isDisabled: a._id,
          reason: a.maintenanceReason,
        };
        toAPIData.set(a._id, data);
        return a;
      });

      await HttpRequests.postCommandStatus(Array.from(toAPIData.values()));

      await ctx.client.application?.commands.set(allCommands);
      ctx.makeMessage({
        content: 'Todos comandos foram settados! Temos até 1 hora para tudo atualizar',
      });
      return;
    }

    if (ctx.options.getString('option', true) === 'developer') {
      const allCommands = ctx.client.slashCommands.reduce<ApplicationCommandData[]>((p, c) => {
        if (!c.config.devsOnly) return p;
        p.push({
          name: c.config.name,
          description: c.config.description,
          options: c.config.options,
          nameLocalizations: c.config.nameLocalizations,
          descriptionLocalizations: c.config.descriptionLocalizations,
        });
        return p;
      }, []);

      await ctx.makeMessage({ content: 'Iniciando deploy' });
      await ctx.interaction.guild?.commands.set(allCommands);

      ctx.interaction.editReply({ content: 'Comandos deployados no servidor' });
      return;
    }

    const allCommands = ctx.client.slashCommands.reduce<ApplicationCommandData[]>((p, c) => {
      p.push({
        name: c.config.name,
        description: c.config.description,
        options: c.config.options,
        nameLocalizations: c.config.nameLocalizations,
        descriptionLocalizations: c.config.descriptionLocalizations,
      });
      return p;
    }, []);

    await ctx.makeMessage({ content: 'Iniciando deploy' });
    const res = await ctx.interaction.guild?.commands.set(allCommands);

    ctx.makeMessage({
      content: `No total, ${res?.size} comandos foram adicionados neste servidor!`,
    });
  }
}
