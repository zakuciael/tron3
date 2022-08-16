/*
 * Tron 3
 * Copyright (c) 2022 Krzysztof Saczuk <zakku@zakku.eu>.
 * MIT Licensed
 */

import type { PermissionResolvable } from "discord.js";
import { Injectable } from "~/lib/decorators/injectable.js";
import type { CommandOptionData, GetOptions } from "~/lib/interfaces/command-options.js";

@Injectable
export abstract class Command {
    public defaultMemberPermissions?: PermissionResolvable;
    public allowDM?: boolean;

    abstract description: string;
    abstract options: readonly CommandOptionData[];

    abstract execute<T extends this>(options: GetOptions<T>): Promise<void>;
}
