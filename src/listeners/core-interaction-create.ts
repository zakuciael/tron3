/*
 * Tron 3
 * Copyright (c) 2022 Krzysztof Saczuk <zakku@zakku.eu>.
 * MIT Licensed
 */

import { Events, Interaction } from "discord.js";

import { Listener } from "~/lib/structures/bases/listener.js";

export class CoreInteractionCreate extends Listener<Events.InteractionCreate> {
    public readonly once = false;
    public readonly event = Events.InteractionCreate;

    async execute(interaction: Interaction): Promise<void> {
        console.log(interaction);

        if (interaction.isChatInputCommand()) await interaction.reply("TEMP");
    }
}
