/*
 * Tron 3
 * Copyright (c) 2022 Krzysztof Saczuk <zakku@zakku.eu>.
 * MIT Licensed
 */

import { pathToFileURL } from "node:url";
import { interfaces } from "inversify";

type ImportResult<T> = Promise<interfaces.Newable<T> & Record<PropertyKey, unknown>>;

export const dynamicImport = async <T>(path: string): Promise<ImportResult<T>> => {
    const url = pathToFileURL(path);
    url.searchParams.append("d", Date.now().toString());
    return (await import(url.href)) as ImportResult<T>;
};
