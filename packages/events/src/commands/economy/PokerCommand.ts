import { ApplicationCommandOptionTypes } from 'discordeno/types';

import { createCommand } from '../../structures/command/createCommand';

const CoinflipCommand = createCommand({
  path: '',
  name: 'poker',
  description: '「🃏」・Inicia uma partida de poker',
  descriptionLocalizations: { 'en-US': '「🃏」・Start a poker match' },
  options: [
    {
      type: ApplicationCommandOptionTypes.Integer,
      name: 'pilha',
      nameLocalizations: { 'en-US': 'stack' },
      description: 'Quantidade de estrelinhas que jogadores devem ter em sua pilha de fichas',
      descriptionLocalizations: {
        'en-US': 'Number of stars players should have in their chip stack',
      },
      minValue: 5000,
      required: true,
    },
    {
      type: ApplicationCommandOptionTypes.User,
      name: 'jogador_1',
      nameLocalizations: { 'en-US': 'player_1' },
      description: 'Convide um usuário para se juntar à partida',
      descriptionLocalizations: { 'en-US': 'Invite someone to the game' },
      required: false,
    },
    {
      type: ApplicationCommandOptionTypes.User,
      name: 'jogador_2',
      nameLocalizations: { 'en-US': 'player_2' },
      description: 'Convide um usuário para se juntar à partida',
      descriptionLocalizations: { 'en-US': 'Invite someone to the game' },
      required: false,
    },
    {
      type: ApplicationCommandOptionTypes.User,
      name: 'jogador_3',
      nameLocalizations: { 'en-US': 'player_3' },
      description: 'Convide um usuário para se juntar à partida',
      descriptionLocalizations: { 'en-US': 'Invite someone to the game' },
      required: false,
    },
    {
      type: ApplicationCommandOptionTypes.User,
      name: 'jogador_4',
      nameLocalizations: { 'en-US': 'player_4' },
      description: 'Convide um usuário para se juntar à partida',
      descriptionLocalizations: { 'en-US': 'Invite someone to the game' },
      required: false,
    },
    {
      type: ApplicationCommandOptionTypes.User,
      name: 'jogador_5',
      nameLocalizations: { 'en-US': 'player_5' },
      description: 'Convide um usuário para se juntar à partida',
      descriptionLocalizations: { 'en-US': 'Invite someone to the game' },
      required: false,
    },
    {
      type: ApplicationCommandOptionTypes.User,
      name: 'jogador_6',
      nameLocalizations: { 'en-US': 'player_6' },
      description: 'Convide um usuário para se juntar à partida',
      descriptionLocalizations: { 'en-US': 'Invite someone to the game' },
      required: false,
    },
    {
      type: ApplicationCommandOptionTypes.User,
      name: 'jogador_7',
      nameLocalizations: { 'en-US': 'player_7' },
      description: 'Convide um usuário para se juntar à partida',
      descriptionLocalizations: { 'en-US': 'Invite someone to the game' },
      required: false,
    },
  ],
  category: 'economy',
  authorDataFields: ['estrelinhas'],
  execute: async (ctx, finishCommand) => {},
});

export default CoinflipCommand;
