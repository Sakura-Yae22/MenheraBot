const { MessageEmbed, Collection } = require('discord.js');
const i18next = require('i18next');
const Util = require('../utils/Util');
const makeRequest = require('../utils/HTTPrequests');
const CommandContext = require('../structures/CommandContext');

const cooldowns = new Collection();
const warnedUserCooldowns = new Map();

module.exports = class MessageReceive {
  constructor(client) {
    this.client = client;
  }

  async notifyAfk(message, t, userIds) {
    const afkUsers = await this.client.repositories.userRepository.findAfkByIDs(userIds);

    afkUsers.forEach(async (data) => {
      const user = await this.client.users.fetch(data.id);
      if (user.id !== message.author.id) message.menheraReply('notify', `${t('commands:afk.reason', { tag: user.tag, reason: data.afkReason })}`);
    });
  }

  async run(message) {
    if (message.author.bot) return;
    if (message.channel.type === 'dm') return;
    if (!message.channel.permissionsFor(message.guild.me).has('SEND_MESSAGES')) return;

    const server = await Util.databaseGuildEnsure(this.client, message.guild);
    let prefix = server.prefix?.toLowerCase() ?? process.env.BOT_PREFIX;
    const language = server?.lang ?? 'pt-BR';
    const t = i18next.getFixedT(language);

    if (message.mentions.users.size > 0) this.notifyAfk(message, t, message.mentions.users.map((u) => u.id));

    let authorData = await this.client.repositories.userRepository.find(message.author.id);

    if (authorData?.afk) {
      authorData.afk = false;
      authorData.afkReason = null;
      await authorData.save();
      message.menheraReply('wink', t('commands:afk.back'))
        .then((msg) => msg.delete({
          timeout: 5000,
        })).catch();
    }

    if (process.env.NODE_ENV === 'development') prefix = process.env.BOT_PREFIX;

    if (message.content.startsWith(`<@!${this.client.user.id}>`) || message.content.startsWith(`<@${this.client.user.id}>`)) return message.menheraReply('wink', `${t('events:mention.start')} ${message.author}, ${t('events:mention.end', { prefix })}`);

    if (!message.content.toLowerCase().startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    const command = this.client.commands.get(cmd) || this.client.commands.get(this.client.aliases.get(cmd));
    if (!command) return;

    const dbCommand = await this.client.repositories.cmdRepository.findByName(command.config.name);

    if (server.blockedChannels?.includes(message.channel.id) && !message.member.hasPermission('MANAGE_CHANNELS')) return message.menheraReply('lock', `${t('events:blocked-channel')}`);

    if (authorData?.ban) return message.menheraReply('error', t('permissions:BANNED_INFO', { banReason: authorData?.banReason }));

    if (command.config.devsOnly && process.env.OWNER !== message.author.id) return message.channel.send(t('permissions:ONLY_DEVS'));

    if (server.disabledCommands?.includes(command.config.name)) return message.menheraReply('lock', t('permissions:DISABLED_COMMAND', { prefix: server.prefix, cmd: command.config.name }));

    if (dbCommand?.maintenance && process.env.OWNER !== message.author.id) return message.channel.send(`<:negacao:759603958317711371> | ${t('events:maintenance', { reason: dbCommand.maintenanceReason })}`);

    if (!cooldowns.has(command.config.name)) cooldowns.set(command.config.name, new Collection());

    if (process.env.OWNER !== message.author.id) {
      const now = Date.now();
      const timestamps = cooldowns.get(command.config.name);
      const cooldownAmount = (command.config.cooldown || 3) * 1000;

      if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
        const hasBeenWarned = warnedUserCooldowns.get(message.author.id);

        if (now < expirationTime) {
          if (hasBeenWarned) return;
          warnedUserCooldowns.set(message.author.id, true);
          const timeLeft = (expirationTime - now) / 1000;
          return message.menheraReply('warn', t('events:cooldown', { time: timeLeft.toFixed(1), cmd: command.config.name }));
        }
      }

      timestamps.set(message.author.id, now);
      warnedUserCooldowns.set(message.author.id, false);
      setTimeout(() => {
        timestamps.delete(message.author.id);
        warnedUserCooldowns.delete(message.author.id);
      }, cooldownAmount);
    }

    if (command.config.userPermissions?.length) {
      const missing = message.channel.permissionsFor(message.author).missing(command.config.userPermissions);
      if (missing.length) {
        const perm = missing.map((value) => t(`permissions:${value}`)).join(', ');
        return message.menheraReply('error', `${t('permissions:USER_MISSING_PERMISSION', { perm })}`);
      }
    }
    if (command.config.clientPermissions?.length) {
      const missing = message.channel.permissionsFor(this.client.user).missing(command.config.clientPermissions);
      if (missing.length) {
        const perm = missing.map((value) => t(`permissions:${value}`)).join(', ');
        return message.menheraReply('error', `${t('permissions:CLIENT_MISSING_PERMISSION', { perm })}`);
      }
    }

    if (!authorData) authorData = await this.client.repositories.userRepository.create(message.author.id);

    const ctx = new CommandContext(this.client, message, args, { user: authorData, server }, t);

    try {
      new Promise((res, _) => { // eslint-disable-line
        res(command.run(ctx));
        // console.log(`[CMD (${this.client.shard.ids[0]})] ${command.config.name.toUpperCase()} | USER: ${message.author.tag} - ${message.author.id} | GUILD: ${message.guild.name}`);
      }).catch(async (err) => {
        const errorWebHook = await this.client.fetchWebhook(process.env.BUG_HOOK_ID, process.env.BUG_HOOK_TOKEN);

        const errorMessage = err.stack.length > 1800 ? `${err.stack.slice(0, 1800)}...` : err.stack;
        const embed = new MessageEmbed();
        embed.setColor('#fd0000');
        embed.setTitle(t('events:error_embed.title', { cmd: command.config.name }));
        embed.setDescription(`\`\`\`js\n${errorMessage}\`\`\``);
        embed.addField('<:atencao:759603958418767922> | Usage', `UserId: \`${message.author.id}\` \nServerId: \`${message.guild.id}\``);
        embed.setTimestamp();
        embed.addField(t('events:error_embed.report_title'), t('events:error_embed.report_value'));

        message.channel.send(embed).catch(() => message.menheraReply('error', t('events:error_embed.error_msg')));
        if (this.client.user.id === '708014856711962654') errorWebHook.send(embed).catch();
      });
    } catch (err) {
      const errorWebHook = await this.client.fetchWebhook(process.env.BUG_HOOK_ID, process.env.BUG_HOOK_TOKEN);

      const errorMessage = err.stack.length > 1800 ? `${err.stack.slice(0, 1800)}...` : err.stack;
      const embed = new MessageEmbed();
      embed.setColor('#fd0000');
      embed.setTitle(t('events:error_embed.title', { cmd: command.config.name }));
      embed.setDescription(`\`\`\`js\n${errorMessage}\`\`\``);
      embed.addField('<:atencao:759603958418767922> | Usage', `UserId: \`${message.author.id}\` \nServerId: \`${message.guild.id}\``);
      embed.setTimestamp();
      embed.addField(t('events:error_embed.report_title'), t('events:error_embed.report_value'));

      message.channel.send(embed).catch(() => message.menheraReply('error', t('events:error_embed.error_msg')));
      if (this.client.user.id === '708014856711962654') errorWebHook.send(embed).catch();
      console.error(err.stack);
    }
    if (this.client.user.id === '708014856711962654') {
      const data = {
        authorName: message.author.tag,
        authorId: message.author.id,
        guildName: message.guild.name,
        guildId: message.guild.id,
        commandName: command.config.name,
        data: Date.now(),
        args: args.join(' '),
      };
      await makeRequest.postCommand(data).catch();
    }
  }
};
