/*
 * Tron 3
 * Copyright (c) 2022 Krzysztof Saczuk <zakku@zakku.eu>.
 * MIT Licensed
 */

import type { AutocompleteInteraction, Awaitable, PermissionResolvable } from "discord.js";
import { Injectable } from "~/lib/decorators/injectable.js";
import type { CommandOptionData, GetOptions } from "~/lib/interfaces/command-options.js";

@Injectable
export abstract class Command {
    public defaultMemberPermissions?: PermissionResolvable;
    public allowDM?: boolean;

    public abstract description: string;
    public abstract options: readonly CommandOptionData[];

    public autocomplete?<T extends this>(
        interaction: AutocompleteInteraction,
        focused: string,
        options: GetOptions<T>
    ): Awaitable<unknown>;

    public abstract execute<T extends this>(options: GetOptions<T>): Awaitable<unknown>;
}
