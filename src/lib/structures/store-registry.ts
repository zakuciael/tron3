/*
 * Tron 3
 * Copyright (c) 2022 Krzysztof Saczuk <zakku@zakku.eu>.
 * MIT Licensed
 */

import { join } from "node:path";
import { Collection } from "discord.js";
import { Store } from "~/lib/structures/store.js";

type Key = keyof StoreRegistryEntries;
type Value = StoreRegistryEntries[Key];

interface StoreRegistryEntries {
    commands: Store<unknown>;
}

export class StoreRegistry extends Collection<Key, Value> {
    public async load() {
        const promises: Array<Promise<void>> = [];
        for (const store of this.values()) {
            promises.push(store.loadAll());
        }

        await Promise.all(promises);
    }

    public registerPath(rootDirectory: string) {
        for (const store of this.values()) {
            store.registerPath(join(rootDirectory, store.name));
        }
    }

    public register<T>(store: Store<T>): this {
        this.set(store.name as Key, store as unknown as Value);
        return this;
    }

    public deregister<T>(store: Store<T>): this {
        this.delete(store.name as Key);
        return this;
    }
}