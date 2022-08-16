/*
 * Tron 3
 * Copyright (c) 2022 Krzysztof Saczuk <zakku@zakku.eu>.
 * MIT Licensed
 */

import { fileURLToPath, URL } from "node:url";
import type { interfaces } from "inversify";
import { Container } from "inversify";
import type { ClientOptions } from "discord.js";
import { Client } from "discord.js";
import { LABEL } from "@zakku/winston-logs";
import { Injectable } from "~/lib/decorators/injectable.js";
import { Logger } from "~/lib/structures/logger.js";
import { StoreRegistry } from "~/lib/structures/store-registry.js";

interface TronClientOptions {
    log_level?: string | undefined;
}

declare module "discord.js" {
    interface Client {
        readonly logger: Logger;
        readonly container: interfaces.Container;
        readonly stores: StoreRegistry;
    }

    interface ClientOptions extends TronClientOptions {}
}

@Injectable
export class TronClient extends Client {
    public override readonly logger: Logger;
    public override readonly container: interfaces.Container;
    public override readonly stores: StoreRegistry;

    constructor(options: ClientOptions) {
        super(options);

        this.logger = new Logger(options.log_level ?? "info");
        this.container = new Container({ defaultScope: "Singleton" });

        // Bind TronClient to the container
        this.container.bind(Client).toConstantValue(this);

        // Bind logger to the container
        this.container.bind(Logger).toDynamicValue((context) => {
            const { target } = context.currentRequest;

            if (target.isNamed()) return this.logger.createLabeled(target.getNamedTag()!.value);
            if (target.isTagged() && target.hasTag(LABEL))
                return this.logger.createLabeled(
                    target.getCustomTags()!.find((tag) => tag.key === LABEL)!.value as string | string[]
                );

            return this.logger;
        });

        // Register stores
        this.stores = new StoreRegistry();
        this.stores.registerPath(fileURLToPath(new URL("../", import.meta.url)));
    }

    public override async login(token?: string): Promise<string> {
        // Load all stores, and then call login
        await this.stores.load();
        return super.login(token);
    }
}