/*
 * Tron 3
 * Copyright (c) 2022 Krzysztof Saczuk <zakku@zakku.eu>.
 * MIT Licensed
 */

import type { EventEmitter } from "node:events";
import type { Client, ClientEvents } from "discord.js";
import { Injectable } from "~/lib/decorators/injectable.js";

@Injectable
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export abstract class Listener<E extends keyof ClientEvents = ""> {
    public emitter?: keyof Client | EventEmitter;

    abstract readonly once: boolean;

    abstract readonly event: E;

    public abstract execute(...args: ClientEvents[E]): Promise<void>;
}
