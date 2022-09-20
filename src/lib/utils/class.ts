/*
 * Tron 3
 * Copyright (c) 2022 Krzysztof Saczuk <zakku@zakku.eu>.
 * MIT Licensed
 */

import type { interfaces } from "inversify";

export const classExtends = <T extends interfaces.Newable<unknown>>(
    value: interfaces.Newable<unknown>,
    base: T
): value is T => {
    return value.prototype instanceof base;
};
