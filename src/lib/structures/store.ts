/*
 * Tron 3
 * Copyright (c) 2022 Krzysztof Saczuk <zakku@zakku.eu>.
 * MIT Licensed
 */

import { promises as fsp } from "node:fs";
import { extname, join } from "node:path";
import type { interfaces } from "inversify";
import is from "@sindresorhus/is";
import type { Client } from "discord.js";
import { Logger } from "~/lib/utils/logger.js";
import { classExtends } from "~/lib/utils/class.js";
import { toPascal, toSingular } from "~/lib/utils/string.js";
import { dynamicImport } from "~/lib/utils/import.js";

type ErrorWithCode = Error & { code: string };

export interface FileMetadata<T> {
    class: T;
    constructor: interfaces.Newable<T>;
    path: string;
    root: string;
}

export interface StoreOptions {
    readonly name: string;
    readonly container: interfaces.Container;
    readonly client: Client;
    readonly paths?: readonly string[];
}

export type NamedStoreOptions = Omit<StoreOptions, "name">;

export class Store<T> {
    protected readonly client: Client;
    protected readonly logger: Logger;
    protected readonly paths: Set<string>;
    protected readonly metas: Set<FileMetadata<T>>;

    private readonly _name: string;
    private readonly _container: interfaces.Container;

    constructor(private readonly ctor: interfaces.Newable<T>, options: StoreOptions) {
        this._name = options.name;
        this._container = options.container.createChild();
        this.client = options.client;
        this.paths = new Set(options.paths ?? []);
        this.metas = new Set();

        const displayName = toSingular(toPascal(this._name));
        this.logger = this._container.getNamed(Logger, `${displayName}Store`);

        // Register a dynamic logger for all classes loaded by this store.
        this._container
            .bind(Logger)
            .toDynamicValue((context) => {
                const logger = context.container.parent?.get(Logger);
                const { serviceIdentifier } = context.plan.rootRequest;

                if (!logger) throw new Error(`Could not find a parent logger`);
                if (!is.class_(serviceIdentifier))
                    throw new Error(`Requested logger via non-class service identifier`);

                return new Logger([displayName, serviceIdentifier.name]);
            })
            .inSingletonScope();
    }

    get name(): string {
        return this._name;
    }

    get container(): interfaces.Container {
        return this._container;
    }

    public registerPath(path: string): this {
        this.paths.add(path);
        this.logger.trace("Registered path '%s'", path);
        return this;
    }

    public async loadAll(): Promise<void> {
        for (const path of this.paths) {
            // eslint-disable-next-line no-await-in-loop
            for await (const metadata of this.loadPath(path)) {
                this.metas.add(metadata);
            }
        }

        this.logger.trace("Successfully loaded %d classes.", this.metas.size);
    }

    protected async insert(metadata: FileMetadata<T>): Promise<void> {
        this._container.bind(metadata.constructor).toConstantValue(metadata.class);
    }

    private async *loadPath(root: string): AsyncIterableIterator<FileMetadata<T>> {
        this.logger.trace("Loading all files from '%s'", root);

        for await (const child of this.walk(root)) {
            if (extname(child) !== ".js") {
                this.logger.trace(
                    "Skipped file '%s' due to unsupported extension '%s'",
                    child,
                    extname(child)
                );
                continue;
            }

            const constructor = await this.loadFile(child);
            if (constructor === undefined) continue;

            try {
                const _class = this._container.resolve(constructor);
                const metadata = { class: _class, constructor, path: child, root };

                await this.insert(metadata);
                this.logger.trace("Loaded new class '%s'", constructor.name);

                yield metadata;
            } catch (error: unknown) {
                this.logger.error("Error when binding file '%s'", child, error);
            }
        }
    }

    private async *walk(path: string): AsyncIterableIterator<string> {
        try {
            const dir = await fsp.opendir(path);
            for await (const item of dir) {
                if (item.isFile()) yield join(dir.path, item.name);
                else if (item.isDirectory()) yield* this.walk(join(dir.path, item.name));
            }
        } catch (error: unknown) {
            if ((error as ErrorWithCode).code !== "ENOENT")
                this.logger.error("Error when loading file '%s'", path, error);
        }
    }

    private async loadFile(path: string): Promise<interfaces.Newable<T> | undefined> {
        const imported = await dynamicImport<T>(path);

        if (is.class_(imported) && classExtends(imported, this.ctor)) return imported;

        for (const value of Object.values(imported)) {
            if (is.class_(value) && classExtends(value, this.ctor)) return value;
        }

        this.logger.trace("Skipped file '%s' as it does not export anything", path);
        return undefined;
    }
}
