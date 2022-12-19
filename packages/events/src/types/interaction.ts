import { Interaction } from 'discordeno/transformers';
import { InputTextComponent, MessageComponentTypes } from 'discordeno/types';
import ChatInputInteractionContext from '../structures/command/ChatInputInteractionContext';
import ComponentInteractionContext from '../structures/command/ComponentInteractionContext';

export type ComponentInteraction = Interaction & { data: { customId: string } };
export type SelectMenuInteraction = ComponentInteraction & { data: { values: string[] } };

export type ModalInteraction = ComponentInteraction & {
  data: {
    components: { type: MessageComponentTypes.ActionRow; components: InputTextComponent[] }[];
  };
};

export type InteractionContext = ChatInputInteractionContext | ComponentInteractionContext;
