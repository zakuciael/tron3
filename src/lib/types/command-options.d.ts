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

interface CommandOptionDataTypes {
    [ApplicationCommandOptionType.String]: string;
    [ApplicationCommandOptionType.Number]: number;
    [ApplicationCommandOptionType.Integer]: number;
    [ApplicationCommandOptionType.Boolean]: boolean;
    [ApplicationCommandOptionType.User]: User;
    [ApplicationCommandOptionType.Channel]: Channel;
    [ApplicationCommandOptionType.Role]: Role;
}

type CommandOptionType = keyof CommandOptionDataTypes;

type GetDataType<T> = T extends CommandOptionType ? CommandOptionDataTypes[T] : never;

type GetProperty<T> = T extends {
    name: infer Name;
    type: infer Type;
    required?: infer Required;
}
    ? Required extends true
        ? { [K in Name & string]: GetDataType<Type> }
        : { [K in Name & string]?: GetDataType<Type> }
    : never;

type GetObject<T> = T extends readonly [infer Head, ...infer Tail]
    ? GetProperty<Head> & GetObject<Tail>
    : T extends readonly [infer Head]
    ? GetProperty<Head>
    : // eslint-disable-next-line @typescript-eslint/ban-types
    T extends []
    ? // eslint-disable-next-line @typescript-eslint/ban-types
      {}
    : never;

export type CommandOptionData = Exclude<
    ApplicationCommandOptionData,
    ApplicationCommandSubCommandData | ApplicationCommandSubGroupData
>;

export type GetOptions<T> = T extends { options: unknown } ? GetObject<T["options"]> : never;
