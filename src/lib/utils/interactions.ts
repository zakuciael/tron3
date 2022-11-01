/*
 * Tron 3
 * Copyright (c) 2022 Krzysztof Saczuk <zakku@zakku.eu>.
 * MIT Licensed
 */

import type {
    ApplicationCommandOptionData,
    ApplicationCommandSubCommandData,
    ApplicationCommandSubGroupData
} from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import type {
    ConvertSlashCommandOptionTypeToDataType,
    SlashCommandOptionResolver
} from "~/lib/types/slash-command-options.js";

export const isSubcommandData = (value: unknown): value is ApplicationCommandSubCommandData => {
    return (
        typeof value === "object" &&
        typeof (value as ApplicationCommandOptionData).type !== "undefined" &&
        (value as ApplicationCommandOptionData).type === ApplicationCommandOptionType.Subcommand
    );
};

export const isSubcommandGroupData = (value: unknown): value is ApplicationCommandSubGroupData => {
    return (
        typeof value === "object" &&
        typeof (value as ApplicationCommandOptionData).type !== "undefined" &&
        (value as ApplicationCommandOptionData).type === ApplicationCommandOptionType.SubcommandGroup
    );
};

export const getTypedOption = <T extends ApplicationCommandOptionType>(
    resolver: SlashCommandOptionResolver,
    name: string,
    type: T,
    required = false
    // eslint-disable-next-line @typescript-eslint/ban-types
): ConvertSlashCommandOptionTypeToDataType<T> | null => {
    let value;

    switch (type) {
        case ApplicationCommandOptionType.String:
            value = resolver.getString(name, required);
            break;
        case ApplicationCommandOptionType.Integer:
            value = resolver.getInteger(name, required);
            break;
        case ApplicationCommandOptionType.Number:
            value = resolver.getNumber(name, required);
            break;
        case ApplicationCommandOptionType.Boolean:
            value = resolver.getBoolean(name, required);
            break;
        case ApplicationCommandOptionType.User:
            value = resolver.getUser(name, required);
            break;
        case ApplicationCommandOptionType.Channel:
            value = resolver.getChannel(name, required);
            break;
        case ApplicationCommandOptionType.Role:
            value = resolver.getRole(name, required);
            break;
        default:
            value = null;
            break;
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    return value as ConvertSlashCommandOptionTypeToDataType<T> | null;
};
