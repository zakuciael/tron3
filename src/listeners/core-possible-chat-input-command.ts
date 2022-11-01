/*
 * Tron 3
 * Copyright (c) 2022 Krzysztof Saczuk <zakku@zakku.eu>.
 * MIT Licensed
 */

import type { ChatInputCommandInteraction } from "discord.js";
import { Listener } from "~/lib/structures/bases/listener.js";
import { TronEvents } from "~/lib/types/events.js";
import { Injectable } from "~/lib/decorators/injectable.js";
import { SlashCommandStore } from "~/lib/structures/stores/slash-command-store.js";
import { getTypedOption } from "~/lib/utils/interactions.js";
import type { InferSlashCommandOptionsType } from "~/lib/types/slash-command-options.js";
import type { SlashCommand } from "~/lib/structures/bases/slash-command.js";

@Injectable
export class CorePossibleChatInputCommand extends Listener<TronEvents.PossibleChatInputCommand> {
    readonly once = false;
    readonly event = TronEvents.PossibleChatInputCommand;

    constructor(private readonly store: SlashCommandStore) {
        super();
    }

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const command = this.store.get(interaction);
        const { options: commandOptions, execute: executeMethod } = command;
        const { options: optionsResolver } = interaction;

        const resolvedOptions = Object.fromEntries(
            commandOptions.map((option) => [
                option.name,
                getTypedOption(optionsResolver, option.name, option.type)
            ])
        );

        await executeMethod.call(
            command,
            interaction,
            resolvedOptions as InferSlashCommandOptionsType<SlashCommand>
        );
    }
}
