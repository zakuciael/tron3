/*
 * Tron 3
 * Copyright (c) 2022 Krzysztof Saczuk <zakku@zakku.eu>.
 * MIT Licensed
 */

import type { AutocompleteInteraction, Awaitable, PermissionResolvable } from "discord.js";
import { Injectable } from "~/lib/decorators/injectable.js";
import type {
    InferSlashCommandOptionsType,
    SlashCommandOptionData
} from "~/lib/types/slash-command-options.js";

@Injectable
export abstract class SlashCommand {
    public defaultMemberPermissions?: PermissionResolvable;
    public allowDM?: boolean;

    public abstract description: string;
    public abstract options: readonly SlashCommandOptionData[];

    public autocomplete?<T extends this>(
        interaction: AutocompleteInteraction,
        focused: string,
        options: InferSlashCommandOptionsType<T>
    ): Awaitable<unknown>;

    public abstract execute<T extends this>(options: InferSlashCommandOptionsType<T>): Awaitable<unknown>;
}
