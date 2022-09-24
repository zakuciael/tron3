/*
 * Tron 3
 * Copyright (c) 2022 Krzysztof Saczuk <zakku@zakku.eu>.
 * MIT Licensed
 */

import { fileURLToPath, URL } from "node:url";
import type { interfaces } from "inversify";
import { Container } from "inversify";
import type { ClientOptions } from "discord.js";
import { ChatInputCommandInteraction, Client } from "discord.js";
import { LABEL } from "@zakku/winston-logs";
// eslint-disable-next-line n/file-extension-in-import
import { InteractionType } from "discord-api-types/v10";
import { Injectable } from "~/lib/decorators/injectable.js";
import { Logger } from "~/lib/utils/logger.js";
import { StoreRegistry } from "~/lib/structures/store-registry.js";
import { CommandStore } from "~/lib/structures/stores/command-store.js";

declare module "discord.js" {
    interface Client {
        readonly logger: Logger;
        readonly container: interfaces.Container;
        readonly stores: StoreRegistry;
    }
}

@Injectable
export class TronClient extends Client {
    public override readonly logger: Logger;
    public override readonly container: interfaces.Container;
    public override readonly stores: StoreRegistry;

    constructor(options: ClientOptions) {
        super(options);

        this.logger = new Logger();
        this.logger.info("Initializing client...");
        this.logger.debug("Initializing dependency injection container...");
        this.container = new Container({ defaultScope: "Singleton" });

        // Bind TronClient to the container
        this.container.bind(Client).toConstantValue(this);

        // Bind logger to the container
        this.container.bind(Logger).toDynamicValue((context) => {
            const { target } = context.currentRequest;

            if (target.isNamed()) return new Logger(target.getNamedTag()!.value);
            if (target.isTagged() && target.hasTag(LABEL))
                return new Logger(
                    target.getCustomTags()!.find((tag) => tag.key === LABEL)!.value as string | string[]
                );

            return this.logger;
        });

        // Register stores
        this.logger.debug("Initializing store registry...");
        this.stores = new StoreRegistry();
        this.stores.register(new CommandStore({ container: this.container, client: this }));
        this.stores.registerPath(fileURLToPath(new URL("../", import.meta.url)));

        this.logger.debug("Initializing event listeners...");
        // TODO: Remove when adding proper listeners system
        this.once("ready", async () => {
            // Fetch all guilds before loading commands
            await this.guilds.fetch();

            await this.stores.get("commands").registerAll();
        });

        this.on("interactionCreate", async (interaction) => {
            console.log(interaction);

            if (interaction.type === InteractionType.ApplicationCommand)
                await (interaction as ChatInputCommandInteraction).reply("TEMP");
        });
    }

    public override async login(token?: string): Promise<string> {
        this.logger.debug("Loading all stores...");
        await this.stores.load();

        this.logger.info("Authenticating...");
        const now = Date.now();
        return super.login(token).then((token) => {
            this.logger.info(`Took ${(Date.now() - now).toLocaleString()}ms to authenticate.`);
            return token;
        });
    }
}
