import { Interaction } from 'discordeno/transformers';
import { CanResolve } from './InteractionContext';

function getOptionFromInteraction<T>(
  interaction: Interaction,
  name: string,
  shouldResolve: CanResolve,
  required: true,
): T;

function getOptionFromInteraction<T>(
  interaction: Interaction,
  name: string,
  shouldResolve: CanResolve,
  required?: false,
): T | undefined;

function getOptionFromInteraction<T>(
  interaction: Interaction,
  name: string,
  shouldResolve: CanResolve,
  required?: boolean,
): T | undefined;

function getOptionFromInteraction<T>(
  interaction: Interaction,
  name: string,
  shouldResolve: CanResolve,
  required?: boolean,
): T | undefined {
  const options = interaction.data?.options ?? [];
  const found = options.find((option) => option.name === name) as { value: T } | undefined;

  if (!found && required)
    throw new Error(`Option ${name} is required in ${interaction.data?.name}`);

  if (!found) return undefined;

  if (shouldResolve)
    return interaction.data?.resolved?.[shouldResolve]?.get(
      BigInt(found?.value as unknown as string),
    ) as unknown as T;

  return found?.value as T;
}

export { getOptionFromInteraction };
