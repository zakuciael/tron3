/*
 * Tron 3
 * Copyright (c) 2022 Krzysztof Saczuk <zakku@zakku.eu>.
 * MIT Licensed
 */

import { basename, extname, relative, sep } from "node:path";
import type { ChatInputApplicationCommandData } from "discord.js";
// eslint-disable-next-line n/file-extension-in-import
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import type { FileMetadata, NamedStoreOptions } from "~/lib/structures/store.js";
import { Store } from "~/lib/structures/store.js";
import { Command } from "~/lib/structures/bases/command.js";

export class CommandStore extends Store<Command> {
    private readonly _commands = new Map<string, ChatInputApplicationCommandData>();

    constructor(options: NamedStoreOptions) {
        super(Command as any, { ...options, name: "commands" });
    }

    public override async loadAll(): Promise<void> {
        await super.loadAll();

        for (const meta of this.metas) {
            const {
                path,
                root,
                class: { description, options, defaultMemberPermissions, allowDM }
            } = meta;

            const directories = relative(root, path).split(sep).slice(0, -1);
            const fileName = basename(path, extname(path));

            switch (directories.length) {
                case 0: {
                    // COMMAND
                    this._commands.set(fileName, {
                        name: fileName,
                        description,
                        options: [...options],
                        defaultMemberPermissions: defaultMemberPermissions ?? null,
                        dmPermission: allowDM ?? true
                    });
                    break;
                }

                case 1: {
                    // SUB_COMMAND
                    const [commandName] = directories;
                    if (!commandName) throw new Error("Sum Ting Wong");

                    const command: ChatInputApplicationCommandData = this._commands.get(commandName) ?? {
                        name: commandName,
                        description: commandName.toUpperCase(),
                        options: []
                    };

                    if (command.options?.find((opt) => opt.name === fileName))
                        throw new Error("Sub-command already exists");

                    command.options?.push({
                        name: fileName,
                        type: ApplicationCommandOptionType.Subcommand,
                        description,
                        options: [...options]
                    });

                    this._commands.set(commandName, command);
                    break;
                }

                case 2: {
                    // SUB_COMMAND_GROUP
                    const [commandName, subcommandGroupName] = directories;
                    if (!commandName || !subcommandGroupName) throw new Error("Wi To Lo");

                    const command: ChatInputApplicationCommandData = this._commands.get(commandName) ?? {
                        name: commandName,
                        description: commandName.toUpperCase(),
                        options: []
                    };

                    const subcommandGroup = command.options?.find((opt) => opt.name === subcommandGroupName);

                    if (subcommandGroup) {
                        if (subcommandGroup.type !== ApplicationCommandOptionType.SubcommandGroup)
                            throw new Error("The name for this subcommand group is already taken.");

                        if (subcommandGroup.options?.find((opt) => opt.name === fileName))
                            throw new Error("Sub-command already exists");

                        subcommandGroup.options?.push({
                            name: fileName,
                            type: ApplicationCommandOptionType.Subcommand,
                            description,
                            options: [...options]
                        });
                    } else {
                        command.options?.push({
                            name: subcommandGroupName,
                            type: ApplicationCommandOptionType.SubcommandGroup,
                            description: subcommandGroupName.toUpperCase(),
                            options: [
                                {
                                    name: fileName,
                                    type: ApplicationCommandOptionType.Subcommand,
                                    description,
                                    options: [...options]
                                }
                            ]
                        });
                    }

                    this._commands.set(commandName, command);
                    break;
                }

                default: {
                    throw new Error("Too much depth");
                }
            }
        }
    }

    protected override async insert(metadata: FileMetadata<Command>): Promise<void> {
        return super.insert(metadata);
    }
}
