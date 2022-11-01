/*
 * Tron 3
 * Copyright (c) 2022 Krzysztof Saczuk <zakku@zakku.eu>.
 * MIT Licensed
 */

import type { AutocompleteInteraction } from "discord.js";
import { Listener } from "~/lib/structures/bases/listener.js";
import { TronEvents } from "~/lib/types/events.js";
import { Injectable } from "~/lib/decorators/injectable.js";
import { SlashCommandStore } from "~/lib/structures/stores/slash-command-store.js";

@Injectable
export class CorePossibleAutocompleteInteraction extends Listener<TronEvents.PossibleAutocompleteInteraction> {
    readonly once = false;
    readonly event = TronEvents.PossibleAutocompleteInteraction;

    constructor(public store: SlashCommandStore) {
        super();
    }

    async execute(interaction: AutocompleteInteraction): Promise<void> {
        const command = this.store.get(interaction);
        const { autocomplete: autocompleteMethod } = command;
        const { options: optionsResolver } = interaction;

        await autocompleteMethod?.call(command, interaction, optionsResolver.getFocused(true));
    }
}
