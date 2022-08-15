/*
 * Tron 3
 * Copyright (c) 2022 Krzysztof Saczuk <zakku@zakku.eu>.
 * MIT Licensed
 */

import type { interfaces } from "inversify";
import { inject } from "inversify";

export const Inject = <T = unknown>(serviceIdentifier: interfaces.ServiceIdentifier<T>) =>
    inject(serviceIdentifier);
