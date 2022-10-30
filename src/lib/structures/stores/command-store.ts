/*
 * Tron 3
 * Copyright (c) 2022 Krzysztof Saczuk <zakku@zakku.eu>.
 * MIT Licensed
 */

import { basename, extname, relative, sep } from "node:path";
import process from "node:process";
import {
    ApplicationCommand,
    ApplicationCommandManager,
    ChatInputApplicationCommandData,
    Collection
} from "discord.js";
// eslint-disable-next-line n/file-extension-in-import
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import type { FileMetadata, NamedStoreOptions } from "~/lib/structures/store.js";
import { Store } from "~/lib/structures/store.js";
import { Command } from "~/lib/structures/bases/command.js";
import type { SlashCommandOptionData } from "~/lib/types/slash-command-options.js";

export class CommandStore extends Store<Command> {
    private readonly _commands = new Collection<string, ChatInputApplicationCommandData>();

    constructor(options: NamedStoreOptions) {
        super(Command as any, { ...options, name: "commands" });
    }

    public async registerAll(): Promise<void> {
        // Early escape when application is not properly loaded.
        if (!this.client.application) return;

        this.logger.info("Initializing commands...");
        const now = Date.now();

        const appCommands = this.client.application.commands;

        if (process.env.NODE_ENV === "production") {
            const globalCommands = await appCommands.fetch({ withLocalizations: true });

            const unregisterTasks = globalCommands
                .filter((cmd) => !this._commands.has(cmd.name))
                .map(async (cmd) => this.unregister(cmd, appCommands, globalCommands));
            const registerTasks = this._commands.map(async (cmd) =>
                this.register(cmd, appCommands, globalCommands)
            );

            await Promise.allSettled([...unregisterTasks, ...registerTasks]);
        }

        if (process.env.NODE_ENV === "development") {
            const guildId = process.env.DEV_GUILD_ID;
            if (!guildId) throw new Error("Unable to register guild commands, guild id is missing.");

            const guildCommands = await appCommands.fetch({ guildId, withLocalizations: true });

            const unregisterTasks = guildCommands
                .filter((cmd) => !this._commands.has(cmd.name))
                .map(async (cmd) => this.unregister(cmd, appCommands, guildCommands, guildId));
            const registerTasks = this._commands.map(async (cmd) =>
                this.register(cmd, appCommands, guildCommands, guildId)
            );

            await Promise.allSettled([...unregisterTasks, ...registerTasks]);
        }

        this.logger.info(`Took ${(Date.now() - now).toLocaleString()}ms to initialize commands`);
    }

    public override async loadAll(): Promise<void> {
        await super.loadAll();

        for (const meta of this.metas) {
            const command = this.resolve(meta);
            this._commands.set(command.name, command);
        }
    }

    protected override async insert(metadata: FileMetadata<Command>): Promise<void> {
        return super.insert(metadata);
    }

    private resolve(meta: FileMetadata<Command>): ChatInputApplicationCommandData {
        const {
            path,
            root,
            class: { description, options, defaultMemberPermissions, allowDM }
        } = meta;
        const directories = relative(root, path).split(sep).slice(0, -1);
        const fileName = basename(path, extname(path));

        switch (directories.length) {
            // COMMAND
            case 0: {
                return {
                    name: fileName,
                    description,
                    defaultMemberPermissions: defaultMemberPermissions ?? null,
                    ...(options.length > 0 ? { options: options as SlashCommandOptionData[] } : undefined),
                    ...(typeof allowDM !== "undefined" && !allowDM ? { dmPermission: false } : undefined)
                };
            }

            // SUB-COMMAND
            case 1: {
                const [commandName] = directories as [string];

                const command = this._commands.get(commandName) ?? {
                    name: commandName,
                    description: commandName.toUpperCase(),
                    options: []
                };

                if (command.options?.find((opt) => opt.name === fileName))
                    throw new Error(`Command '${relative(root, path)}' is already defined in another file`);

                command.options?.push({
                    name: fileName,
                    type: ApplicationCommandOptionType.Subcommand,
                    description,
                    ...(options.length > 0 ? { options: options as SlashCommandOptionData[] } : undefined)
                });

                return command;
            }

            // SUB-COMMAND GROUP
            case 2: {
                const [commandName, groupName] = directories as [string, string];

                const command = this._commands.get(commandName) ?? {
                    name: commandName,
                    description: commandName.toUpperCase(),
                    options: []
                };

                const group = command.options?.find((opt) => opt.name === groupName);

                if (group) {
                    if (
                        group.type !== ApplicationCommandOptionType.SubcommandGroup ||
                        group.options?.find((opt) => opt.name === fileName)
                    )
                        throw new Error(
                            `Command '${relative(root, path)}' is already defined in another file`
                        );

                    group.options?.push({
                        name: fileName,
                        type: ApplicationCommandOptionType.Subcommand,
                        description,
                        ...(options.length > 0 ? { options: options as SlashCommandOptionData[] } : undefined)
                    });
                } else {
                    command.options?.push({
                        name: groupName,
                        type: ApplicationCommandOptionType.SubcommandGroup,
                        description: groupName.toUpperCase(),
                        options: [
                            {
                                name: fileName,
                                type: ApplicationCommandOptionType.Subcommand,
                                description,
                                ...(options.length > 0
                                    ? { options: options as SlashCommandOptionData[] }
                                    : undefined)
                            }
                        ]
                    });
                }

                return command;
            }

            default: {
                throw new Error(`Invalid command folder structure, max depth reached.`);
            }
        }
    }

    private async register(
        command: ChatInputApplicationCommandData,
        commandsManager: ApplicationCommandManager,
        appCommands: Collection<string, ApplicationCommand>,
        guildId?: string
    ) {
        const appCommand = appCommands.find((entry) => entry.name === command.name);
        this.logger.trace("Registering '%s' command...", command.name);

        if (!appCommand) {
            this.logger.trace("Command doesn't exist, creating one with data=%o", command);

            try {
                await (guildId ? commandsManager.create(command, guildId) : commandsManager.create(command));
            } catch (error: unknown) {
                this.logger.error("Failed to create '%s' command.", command.name, error);
            }

            return;
        }

        if (!appCommand.equals(command)) {
            this.logger.trace("Command doesn't match, updating with data=%o", command);

            try {
                await (guildId
                    ? commandsManager.edit(appCommand, command, guildId)
                    : commandsManager.edit(appCommand, command));
            } catch (error: unknown) {
                this.logger.error("Failed to update '%s' command.", command.name, error);
            }

            return;
        }

        this.logger.trace("Command already registered, skipping.");
    }

    private async unregister(
        command: ApplicationCommand,
        commandsManager: ApplicationCommandManager,
        appCommands: Collection<string, ApplicationCommand>,
        guildId?: string
    ) {
        const appCommand = appCommands.find((entry) => entry.name === command.name);
        this.logger.trace("Unregistering '%s' command...", command.name);

        if (!appCommand) {
            this.logger.trace("Command already unregistered, skipping.");
            return;
        }

        try {
            await (guildId ? commandsManager.delete(command, guildId) : commandsManager.delete(command));
        } catch (error: unknown) {
            this.logger.error("Failed to unregister '%s' command.", command.name, error);
            return;
        }

        this.logger.trace("Command unregistered successfully.");
    }
}
