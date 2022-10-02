/*
 * Tron 3
 * Copyright (c) 2022 Krzysztof Saczuk <zakku@zakku.eu>.
 * MIT Licensed
 */

import { Client, Events } from "discord.js";
import { Listener } from "~/lib/structures/bases/listener.js";
import { Injectable } from "~/lib/decorators/injectable.js";

@Injectable
export class CoreReady extends Listener<Events.ClientReady> {
    public readonly once = true;
    public readonly event = Events.ClientReady;

    async run(client: Client): Promise<void> {
        // Fetch all guilds before loading commands
        await client.guilds.fetch();

        // Register all commands via API
        await client.stores.get("commands").registerAll();
    }
}
