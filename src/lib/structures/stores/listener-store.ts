/*
 * Tron 3
 * Copyright (c) 2022 Krzysztof Saczuk <zakku@zakku.eu>.
 * MIT Licensed
 */

import type { EventEmitter } from "node:events";
import { NamedStoreOptions, Store } from "~/lib/structures/store.js";
import { Listener } from "~/lib/structures/bases/listener.js";

export class ListenerStore extends Store<Listener> {
    constructor(options: NamedStoreOptions) {
        super(Listener as any, { ...options, name: "listeners" });
    }

    override async loadAll(): Promise<void> {
        await super.loadAll();

        for (const { class: clazz } of this.metas) {
            const usedEmitter =
                typeof clazz.emitter === "undefined"
                    ? this.client
                    : typeof clazz.emitter === "string"
                    ? (Reflect.get(this.client, clazz.emitter) as EventEmitter)
                    : clazz.emitter;

            usedEmitter[clazz.once ? "once" : "on"](clazz.event, clazz.execute.bind(clazz));
        }
    }
}
