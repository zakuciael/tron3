/*
 * Tron 3
 * Copyright (c) 2022 Krzysztof Saczuk <zakku@zakku.eu>.
 * MIT Licensed
 */

import { Client, Events, Interaction } from "discord.js";

import { Listener } from "~/lib/structures/bases/listener.js";
import { TronEvents } from "~/lib/types/events.js";
import { Logger } from "~/lib/utils/logger.js";
import { Injectable } from "~/lib/decorators/injectable.js";

@Injectable
export class CoreInteractionCreate extends Listener<Events.InteractionCreate> {
    public readonly once = false;
    public readonly event = Events.InteractionCreate;

    constructor(public client: Client, public logger: Logger) {
        super();
    }

    async execute(interaction: Interaction): Promise<void> {
        // TODO: Handle message components and modals via interaction handlers
        // TODO: Handle context menus via context menu handlers

        if (interaction.isChatInputCommand())
            this.client.emit(TronEvents.PossibleChatInputCommand, interaction);
        else if (interaction.isContextMenuCommand())
            this.client.emit(TronEvents.PossibleContextMenuCommand, interaction);
        else if (interaction.isAutocomplete())
            this.client.emit(TronEvents.PossibleAutocompleteInteraction, interaction);
        else this.logger.warn("Unhandled interaction type %s", interaction.constructor.name);
    }
}
