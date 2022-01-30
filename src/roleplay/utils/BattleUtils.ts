import { Mob, RoleplayUserSchema } from '@roleplay/Types';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { COLORS } from '@structures/Constants';
import Util, { actionRow, RandomFromArray, resolveSeparatedStrings } from '@utils/Util';
import { MessageEmbed, MessageSelectMenu, SelectMenuInteraction } from 'discord.js-light';
import {
  calculateEffectiveDamage,
  getUserArmor,
  getUserDamage,
  getUserIntelligence,
} from './Calculations';
import { getAbilityById } from './ClassUtils';

export const a = 'a';

const TIME_TO_SELECT = 8000;

export const battleLoop = async (
  user: RoleplayUserSchema,
  enemy: Mob,
  ctx: InteractionCommandContext,
  text: string,
): Promise<void> => {
  const [needStop, newUser, newEnemy, newText] = await userAttack(user, enemy, ctx, text);

  if (!needStop) {
    const [enemyStop, enemyUser, enemyEnemy, enemyText] = enemyAttack(
      newUser,
      newEnemy,
      ctx,
      newText,
    );
    if (!enemyStop) battleLoop(enemyUser, enemyEnemy, ctx, enemyText);
  }
};

export const enemyAttack = (
  user: RoleplayUserSchema,
  enemy: Mob,
  ctx: InteractionCommandContext,
  text: string,
): [boolean, RoleplayUserSchema, Mob, string] => {
  const attack = RandomFromArray(enemy.ataques);

  user.life -= attack.damage;

  if (user.life < 0) return [true, user, enemy, text];
  return [false, user, enemy, ctx.locale('roleplay:battle.attack')];
};

export const userAttack = async (
  user: RoleplayUserSchema,
  enemy: Mob,
  ctx: InteractionCommandContext,
  text: string,
): Promise<[boolean, RoleplayUserSchema, Mob, string]> => {
  const embed = new MessageEmbed()
    .setTitle(
      ctx.prettyResponse('sword', 'roleplay:battle.title', {
        /* TODO: Create enemy name */ name: 'BICHO LOKO',
      }),
    )
    .setColor(COLORS.Battle)
    .setFooter({ text: ctx.locale('roleplay:battle.footer', { time: TIME_TO_SELECT }) })
    .setDescription(
      ctx.locale('roleplay:battle.description', {
        action: text,
      }),
    )
    .addFields([
      {
        name: ctx.locale('roleplay:battle.your-stats'),
        value: ctx.locale('roleplay:battle.your-stats-info', {
          life: user.life,
          mana: user.mana,
          damage: getUserDamage(user),
          armor: getUserArmor(user),
          intelligence: getUserIntelligence(user),
        }),
        inline: true,
      },
      {
        name: ctx.locale('roleplay:battle.enemy-stats'),
        value: ctx.locale('roleplay:battle.enemy-stats-info', {
          life: enemy.life,
          damage: enemy.damage,
          armor: enemy.armor,
        }),
        inline: true,
      },
    ]);

  const options = new MessageSelectMenu()
    .setCustomId(`${ctx.interaction.id} | SELECT`)
    .setPlaceholder(ctx.locale('roleplay:battle.select'))
    .addOptions({
      label: ctx.locale('roleplay:battle.options.hand-attack'),
      value: 'HANDATTACK',
      description: ctx.locale('roleplay:battle.options.hand-attack-description').substring(0, 100),
    });

  let optionsText = `**${ctx.locale('roleplay:battle.options.hand-attack')}**\n${ctx.locale(
    'roleplay:battle.options.info',
    { damage: user.damage, cost: 0 },
  )}\n`;

  user.abilities.forEach((ability) => {
    // TODO: Make damage and cost scale with level
    const resolvedAbility = getAbilityById(ability.id);
    optionsText += `**${ctx.locale(`roleplay:abilities.${ability.id as 1}.name`)}**\n${ctx.locale(
      'roleplay:battle.options.info',
      {
        damage: resolvedAbility.data.damage,
        cost: resolvedAbility.data.cost,
        'no-mana':
          user.mana < resolvedAbility.data.cost ? ctx.locale('roleplay:battle.no-mana') : '',
      },
    )}`;
    if (user.mana >= resolvedAbility.data.cost) {
      options.addOptions({
        label: ctx.locale(`roleplay:abilities.${ability.id as 1}.name`),
        value: `ABILITY | ${ability.id}`,
      });
    }
  });

  embed.addField(ctx.locale('roleplay:battle.options.title'), optionsText);

  ctx.makeMessage({ embeds: [embed], components: [actionRow([options])] });

  const selectedOptions =
    await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
      ctx.channel,
      ctx.author.id,
      ctx.interaction.id,
      TIME_TO_SELECT,
    );

  if (!selectedOptions) return [false, user, enemy, ctx.locale('roleplay:battle.attack')];

  switch (resolveSeparatedStrings(selectedOptions.values[0])[0]) {
    case 'HANDATTACK': {
      enemy.life -= calculateEffectiveDamage(user, enemy);
      if (enemy.life <= 0) return [true, user, enemy, ctx.locale('roleplay:battle.attack')];
      return [false, user, enemy, ctx.locale('roleplay:battle.attack')];
    }
    case 'ABILITY': {
      enemy.life -= getAbilityById(
        Number(resolveSeparatedStrings(selectedOptions.values[0])[1]),
      ).data.damage;
      if (enemy.life <= 0) return [true, user, enemy, ctx.locale('roleplay:battle.attack')];
      return [false, user, enemy, ctx.locale('roleplay:battle.attack')];
    }
  }
  return [false, user, enemy, ctx.locale('roleplay:battle.attack')];
};
