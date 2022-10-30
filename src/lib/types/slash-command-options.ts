/*
 * Tron 3
 * Copyright (c) 2022 Krzysztof Saczuk <zakku@zakku.eu>.
 * MIT Licensed
 */

// eslint-disable-next-line n/file-extension-in-import
import type { ApplicationCommandOptionType } from "discord-api-types/v10";
import type {
    ApplicationCommandOptionData,
    ApplicationCommandSubCommandData,
    ApplicationCommandSubGroupData,
    Channel,
    Role,
    User
} from "discord.js";

export type SlashCommandOptionData = Exclude<
    ApplicationCommandOptionData,
    ApplicationCommandSubCommandData | ApplicationCommandSubGroupData
>;

interface SlashCommandOptionTypeMap {
    [ApplicationCommandOptionType.String]: string;
    [ApplicationCommandOptionType.Number]: number;
    [ApplicationCommandOptionType.Integer]: number;
    [ApplicationCommandOptionType.Boolean]: boolean;
    [ApplicationCommandOptionType.User]: User;
    [ApplicationCommandOptionType.Channel]: Channel;
    [ApplicationCommandOptionType.Role]: Role;
}

type ConvertSlashCommandOptionTypeToDataType<T> = T extends keyof SlashCommandOptionTypeMap
    ? SlashCommandOptionTypeMap[T]
    : never;

type ConvertSlashCommandOptionDataToPropertyType<T> = T extends {
    name: infer Name;
    type: infer Type;
    required?: infer Required;
}
    ? Required extends true
        ? { [K in Name & string]: ConvertSlashCommandOptionTypeToDataType<Type> }
        : { [K in Name & string]?: ConvertSlashCommandOptionTypeToDataType<Type> }
    : never;

type ConvertSlashCommandOptionDataArrayToPropertyUnionType<T> = T extends readonly [infer Head, ...infer Tail]
    ? ConvertSlashCommandOptionDataToPropertyType<Head> &
          ConvertSlashCommandOptionDataArrayToPropertyUnionType<Tail>
    : T extends readonly [infer Head]
    ? ConvertSlashCommandOptionDataToPropertyType<Head>
    : // eslint-disable-next-line @typescript-eslint/ban-types
    T extends []
    ? // eslint-disable-next-line @typescript-eslint/ban-types
      {}
    : never;

export type InferSlashCommandOptionsType<T extends { options: readonly SlashCommandOptionData[] }> =
    ConvertSlashCommandOptionDataArrayToPropertyUnionType<
        Extract<T, { options: readonly SlashCommandOptionData[] }>["options"]
    >;
