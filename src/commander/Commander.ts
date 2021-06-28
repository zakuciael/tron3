import {ConfigManager} from "../config/ConfigManager";
import {Guild, GuildMember, Message, MessageMentions, Role, User} from "discord.js";
import {GuildConfig} from "../config/GuildConfig";
import {EmbedBuilder} from "../utils/EmbedBuilder";
import {Command, SubCommand} from "./Command";
import {FSWatcher, watch} from "chokidar";
import {Logger} from "winston";
import {glob} from "glob";
import path from "path";
import {isDebug} from "../utils/Debug";

interface CommandSettings {
    cmd: Command | SubCommand;
    file_path: string;
}

export class Commander {
    private readonly directory: string;
    private watcher: FSWatcher | undefined;
    private commands: CommandSettings[];
    private logger: Logger;

    constructor(dir: string, logger: Logger) {
        this.directory = dir;
        this.commands = [];
        this.logger = logger;
    }

    public async load(): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            glob(`${this.directory}/**/*`, {nodir: true}, async (err, matches) => {
                if (err) return reject(err);

                for (let file of matches)
                    await this.loadCommand(path.resolve(file))
                        .then(name => this.logger.debug(`Registered new command: ${name}`))
                        .catch(e => this.logger.error(e, "registering new command"));

                if (isDebug) {
                    this.watcher = watch(this.directory, {persistent: true, awaitWriteFinish: true});

                    this.watcher.on("change", async file =>
                        await this.loadCommand(path.resolve(file))
                            .then(name => this.logger.debug(`Successfully reloaded command: ${name}`, {
                                commandName: name,
                                commandPath: path.resolve(file)
                            }))
                            .catch(e => this.logger.error("An error occurred while reloading a command", {
                                error: e,
                                commandPath: path.resolve(file)
                            }))
                    );

                    this.watcher.on("unlink", async file => {
                        const name = this.unloadCommand(path.resolve(file));
                        if (name === "DummyCommand")
                            this.logger.error("An error occurred while unloading a command", {
                                commandName: name,
                                commandPath: path.resolve(file)
                            });
                        else
                            this.logger.debug(`Successfully unloaded command: ${name}`, {
                                commandName: name,
                                commandPath: path.resolve(file)
                            });
                    });
                }

                return resolve(matches.length);
            })
        });
    }

    public async handle(msg: Message, manager: ConfigManager): Promise<void> {
        if (msg.channel.type !== "text") return;
        if (msg.author.bot) return;

        const config = manager.getGuildConfig(msg.guild?.id!);
        if (!msg.content.startsWith(config.getPrefix())) return;

        const args = msg.content
            .substr(config.getPrefix().length)
            .replace(MessageMentions.CHANNELS_PATTERN, "")
            .replace(MessageMentions.USERS_PATTERN, "")
            .replace(MessageMentions.ROLES_PATTERN, "")
            .replace(MessageMentions.EVERYONE_PATTERN, "")
            .trim().split(/\s+/);

        const cmdName = args.splice(0, 1)[0].toLowerCase();
        const cmds = this.commands
            .filter(settings => settings.cmd.command === cmdName)
            .map(settings => settings.cmd);

        if (cmds.length === 0) {
            this.logger.warn(`${Commander.resolveUsername(msg)} tried to use command: "${msg.cleanContent}", but it doesn't exists`, {
                message: msg.cleanContent,
                member: msg.member
            });
            return;
        }

        let cmd: Command | SubCommand | undefined;

        if (args.length > 0) {
            const subName = args[0].toLowerCase();
            cmd = cmds.find(cmd => cmd.command === cmdName && (cmd as SubCommand).subcommand === subName);
        }

        if (!cmd)
            cmd = cmds.find(cmd => cmd.command === cmdName && (cmd as SubCommand).subcommand === undefined);

        if (!cmd) {
            this.logger.warn(`${Commander.resolveUsername(msg)} tried to use command: "${msg.cleanContent}", but it doesn't exists`, {
                message: msg.cleanContent,
                member: msg.member
            });
            return;
        }

        if (cmd instanceof SubCommand)
            args.splice(0, 1);

        if (!(await cmd.validate(msg, args, config))) {
            this.logger.warn(`${Commander.resolveUsername(msg)} sent invalid command: ${msg.cleanContent}`, {
                message: msg.cleanContent,
                member: msg.member
            });
            msg.channel.send({embed: EmbedBuilder.getInvalidCommandEmbed([cmd.usage])}).then(() => {
            });
            return;
        }

        if (!(await cmd.hasAccess(msg, args, config))) {
            this.logger.warn(`${Commander.resolveUsername(msg)} tried to talk to bot, but doesn't have permissions to do so.`, {
                message: msg.cleanContent,
                member: msg.member
            })
            return;
        }

        cmd.execute(msg, args, config, this)
            .catch(e => this.logger.error("An error occurred while executing command", {
                message: msg.cleanContent,
                member: msg.member,
                error: e
            }));
    }

    public getCommands(): (Command | SubCommand)[] {
        return this.commands.map(settings => settings.cmd);
    }

    public static resolveUsername(data: Message | GuildMember | User): string {
        const author: User = data instanceof Message ? data.author :
            data instanceof GuildMember ? data.user : data;

        return `${author.username}#${author.discriminator}`;
    }

    public static resolveRoles(data: Message | GuildMember): Role[] {
        const member: GuildMember = data instanceof Message ? data.member! : data;
        return member.roles.cache.array();
    }

    public static resolveGuild(data: Message | GuildMember): Guild {
        return data.guild!;
    }

    public static async isAdmin(data: Message | GuildMember, config: GuildConfig): Promise<boolean> {
        const member: GuildMember = data instanceof Message ? data.member! : data;
        const guild: Guild = this.resolveGuild(data);

        const adminRoles: string[] = (await config.getAdminRoles(guild)).map(role => role.id);
        const roles: string[] = this.resolveRoles(data).map(role => role.id);

        return member.hasPermission("ADMINISTRATOR") || roles.some(id => adminRoles.includes(id));
    }

    private async loadCommand(file_path: string): Promise<string> {
        delete require.cache[require.resolve(file_path)];

        const cmd = new (await import(file_path).then(cmd => cmd[Object.keys(cmd)[0]]))() as Command | SubCommand;
        const index = this.commands.findIndex(cmd => cmd.file_path === file_path);

        if (index > -1) this.commands.splice(index, 1);
        this.commands.push({cmd, file_path});

        return cmd.constructor.name;
    }

    private unloadCommand(file_path: string): string {
        const index = this.commands.findIndex(c => c.file_path === file_path);
        if (index === -1) return "DummyCommand";

        const cmd = this.commands.splice(index, 1)[0].cmd;
        return cmd.constructor.name;
    }
}