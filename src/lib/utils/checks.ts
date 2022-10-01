/*
 * Tron 3
 * Copyright (c) 2022 Krzysztof Saczuk <zakku@zakku.eu>.
 * MIT Licensed
 */

import type { interfaces } from "inversify";

export const isClass = (value: unknown): value is interfaces.Newable<unknown> => {
    return typeof value === "function" && value.toString().startsWith("class ");
};

export const isPrototypeInstanceOf = <T extends interfaces.Newable<unknown>>(
    instance: unknown,
    base: T
): instance is T => {
    return Object.getPrototypeOf(instance) === base;
};
