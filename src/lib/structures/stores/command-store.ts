/*
 * Tron 3
 * Copyright (c) 2022 Krzysztof Saczuk <zakku@zakku.eu>.
 * MIT Licensed
 */

import { basename, extname, relative, sep } from "node:path";
import process from "node:process";
import type { ApplicationCommand, ChatInputApplicationCommandData, Collection } from "discord.js";
import { ApplicationCommandManager } from "discord.js";
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

    public async register(): Promise<void> {
        /**
         * TODO: Find differences, process them, update the command
         * or do nothing if there are no changes to the command
         * Assignee: @Wittano
         */

        if (!this.client.application) throw new Error("Ho Lee Fuk");

        this.logger.info("Initializing commands...");
        const now = Date.now();

        const appCommands = this.client.application.commands;
        const globalCommands = await appCommands.fetch({ withLocalizations: true });

        if (process.env.NODE_ENV === "production") {
            await Promise.allSettled(
                [...this._commands.values()].map(async (cmd) =>
                    this.registerCommand(cmd, appCommands, globalCommands)
                )
            );
        }

        if (process.env.NODE_ENV === "development") {
            if (!process.env.DEV_GUILD_ID)
                throw new Error("Unable to register guild commands, guild id is missing.");

            const guildId = process.env.DEV_GUILD_ID;
            let guildCommands: Collection<string, ApplicationCommand>;

            try {
                guildCommands = await appCommands.fetch({ guildId, withLocalizations: true });
            } catch {
                throw new Error(`Failed to fetch guild commands for guild '${guildId}'`);
            }

            await Promise.allSettled(
                [...this._commands.values()].map(async (cmd) =>
                    this.registerCommand(cmd, appCommands, guildCommands, guildId)
                )
            );
        }

        this.logger.info(`Took ${(Date.now() - now).toLocaleString()}ms to initialize commands`);
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

    private async registerCommand(
        command: ChatInputApplicationCommandData,
        commandsManager: ApplicationCommandManager,
        appCommands: Collection<string, ApplicationCommand>,
        guildId?: string
    ) {
        const appCommand = appCommands.find((entry) => entry.name === command.name);

        // TODO: Add better logs when whe know differences between commands
        if (appCommand)
            return (async () => {
                this.logger.debug("Updating command '%s' with data '%o'", command.name, command);
                await (guildId
                    ? commandsManager.edit(appCommand, command, guildId)
                    : commandsManager.edit(appCommand, command));
            })();

        return (async () => {
            this.logger.debug("Creating new command '%s' with data %o", command.name, command);
            await (guildId ? commandsManager.create(command, guildId) : commandsManager.create(command));
        })();
    }
}
