/*
 * Tron 3
 * Copyright (c) 2022 Krzysztof Saczuk <zakku@zakku.eu>.
 * MIT Licensed
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import type { AutocompleteInteraction, CommandInteraction, ContextMenuCommandInteraction } from "discord.js";

export enum TronEvents {
    PossibleChatInputCommand = "possibleChatInputCommand",
    PossibleContextMenuCommand = "possibleContextMenuCommand",
    PossibleAutocompleteInteraction = "possibleAutocompleteInteraction"
}

declare module "discord.js" {
    interface ClientEvents {
        [TronEvents.PossibleChatInputCommand]: [interaction: CommandInteraction];
        [TronEvents.PossibleContextMenuCommand]: [interaction: ContextMenuCommandInteraction];
        [TronEvents.PossibleAutocompleteInteraction]: [interaction: AutocompleteInteraction];
    }
}
