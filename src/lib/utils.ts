/*
 * Tron 3
 * Copyright (c) 2022 Krzysztof Saczuk <zakku@zakku.eu>.
 * MIT Licensed
 */

import { pathToFileURL } from "node:url";
import type { interfaces } from "inversify";

type ImportResult<T> = Promise<interfaces.Newable<T> & Record<PropertyKey, unknown>>;

export const toPascal = (_string: string) =>
    (_string.charAt(0).toUpperCase() + _string.slice(1).toLowerCase()).replace(/[-_](\w)/g, (_, c) =>
        (c as string).toUpperCase()
    );

export const toSingular = (_string: string) => _string.replace(/s$/, "");

export const classExtends = <T extends interfaces.Newable<unknown>>(
    value: interfaces.Newable<unknown>,
    base: T
): value is T => {
    return value.prototype instanceof base;
};

export const dynamicImport = async <T>(path: string): Promise<ImportResult<T>> => {
    const url = pathToFileURL(path);
    url.searchParams.append("d", Date.now().toString());
    return (await import(url.href)) as ImportResult<T>;
};
