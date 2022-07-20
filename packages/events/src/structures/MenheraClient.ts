import { Bot, createRestManager } from 'discordeno';
import { Client } from 'net-ipc';
import { runMethod } from '../internals/rest/runMethod';
import { loadLocales } from './LocalteStructure';
import { initializeSentry } from './initializeSentry';
import { getEnviroments } from '../utils/getEnviroments';
import { MenheraClient } from '../types/menhera';

const setupMenheraClient = (client: MenheraClient) => {
  client.commands = new Map();
};

const initializeServices = () => {
  loadLocales();
  initializeSentry();
};

const setupInternals = (bot: Bot, restIPC: Client) => {
  const { DISCORD_TOKEN, REST_AUTHORIZATION } = getEnviroments([
    'DISCORD_TOKEN',
    'REST_AUTHORIZATION',
  ]);

  bot.rest = createRestManager({
    token: DISCORD_TOKEN,
    secretKey: REST_AUTHORIZATION,
    runMethod: async (rest, method, route, body, options) =>
      runMethod(restIPC, rest, method, route, body, options),
  });
};

export { setupMenheraClient, initializeServices, setupInternals };
