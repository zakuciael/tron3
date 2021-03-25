import {ConfigManager} from "../config/ConfigManager";
import {Message, MessageMentions} from "discord.js";
import {EmbedBuilder} from "../utils/EmbedBuilder";
import {Command, SubCommand} from "./Command";
import {FSWatcher, watch} from "chokidar";
import {Logger} from "colored-logs";
import {glob} from "glob";
import path from "path";

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
            glob(`${this.directory}/**/*`, { nodir: true }, async (err, matches) => {
                if (err) return reject(err);

                for (let file of matches)
                    await this.loadCommand(path.resolve(file))
                        .then(name => this.logger.debug(`Registered new command: ${name}`))
                        .catch(e => this.logger.error(e, "registering new command"));

                this.watcher = watch(this.directory, { persistent: true, awaitWriteFinish: true });

                this.watcher.on("change", async file =>
                    await this.loadCommand(path.resolve(file))
                        .then(name => this.logger.debug(`Reloaded command: ${name}`))
                        .catch(e => this.logger.error(e, "reloading command"))
                );

                this.watcher.on("unlink", async file => {
                    const name = this.unloadCommand(path.resolve(file));
                    if (name === "DummyCommand")
                        this.logger.error(new Error("Could not find command"), "removing command");
                    else
                        this.logger.debug(`Removed command: ${name}`);
                });

                return resolve(matches.length);
            })
        });
    }

    public async handle(msg: Message, manager: ConfigManager): Promise<void> {
        if (msg.channel.type !== "text") return;
        if (msg.author.bot) return;

        const config = manager.getGuildConfig(msg.guild?.id!);
        if (!msg.content.startsWith(config.getPrefix())) return;

        this.logger.info(`Received command ${msg.cleanContent} from user ${Commander.getUsername(msg)}`);

        if (!msg.member?.hasPermission("ADMINISTRATOR")) {
            this.logger.warn(`${Commander.getUsername(msg)} tried to talk to bot, but doesn't have permissions to do so.`)
            return;
        }

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
            this.logger.warn(`${Commander.getUsername(msg)} tried to use command: "${msg.cleanContent}", but it doesn't exists`);
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
            this.logger.warn(`${Commander.getUsername(msg)} tried to use command: "${msg.cleanContent}", but it doesn't exists`);
            return;
        }

        if (cmd instanceof SubCommand) args.splice(0, 1);

        const valid = await cmd.validate(msg, args, config)
            .catch(e => this.logger.error(e, "validating command execution"));

        if (valid)
            cmd.execute(msg, args, config, this)
                .catch(e => this.logger.error(e, "executing command"));
        else {
            this.logger.warn(`${Commander.getUsername(msg)} sent invalid command: ${msg.cleanContent}`);
            msg.channel.send({embed: EmbedBuilder.getInvalidCommandEmbed([cmd.usage])}).then(() => {});
        }
    }

    public getCommands(): (Command | SubCommand)[] {
        return this.commands.map(settings => settings.cmd);
    }

    private static getUsername(msg: Message): string {
        return `${msg.author.username}#${msg.author.discriminator}`;
    }

    private async loadCommand(file_path: string): Promise<string> {
        delete require.cache[require.resolve(file_path)];

        const cmd = new (await import(file_path).then(cmd => cmd[Object.keys(cmd)[0]]))() as Command | SubCommand;
        const index = this.commands.findIndex(cmd => cmd.file_path === file_path);

        if (index > -1) this.commands.splice(index, 1);
        this.commands.push({ cmd, file_path });

        return cmd.constructor.name;
    }

    private unloadCommand(file_path: string): string {
        const index = this.commands.findIndex(c => c.file_path === file_path);
        if (index === -1) return "DummyCommand";

        const cmd = this.commands.splice(index, 1)[0].cmd;
        return cmd.constructor.name;
    }
}