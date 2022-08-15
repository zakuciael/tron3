/*
 * Tron 3
 * Copyright (c) 2022 Krzysztof Saczuk <zakku@zakku.eu>.
 * MIT Licensed
 */

import { decorate, injectable } from "inversify";

export const Injectable = <T extends abstract new (...args: never) => unknown>(target: T) => {
    decorate(injectable(), target);
};
