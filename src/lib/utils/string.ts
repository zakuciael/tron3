/*
 * Tron 3
 * Copyright (c) 2022 Krzysztof Saczuk <zakku@zakku.eu>.
 * MIT Licensed
 */

export const toPascal = (_string: string) =>
    (_string.charAt(0).toUpperCase() + _string.slice(1).toLowerCase()).replace(/[-_](\w)/g, (_, c) =>
        (c as string).toUpperCase()
    );

export const toSingular = (_string: string) => _string.replace(/s$/, "");
