import {Command, SubCommand, Usage} from "../commander/Command";
import {EmbedBuilder} from "../utils/EmbedBuilder";
import {GuildConfig} from "../config/GuildConfig";
import {Commander} from "../commander/Commander";
import {Message} from "discord.js";

export class HelpCommand extends Command {
    command: string = "help";
    usage: Usage = {
        syntax: "help [command]",
        description: "Prints help message for command/s"
    };

    async execute(msg: Message, args: string[], config: GuildConfig, commander: Commander): Promise<void> {
        const cmdName = args[0];
        let commands: (Command | SubCommand)[];

        if (cmdName) {
            commands = commander.getCommands().filter(cmd => cmd.command === cmdName.toLowerCase());
        } else {
            commands = commander.getCommands();
        }

        const embed = EmbedBuilder.getCommandEmbed(msg.member!);
        embed.setTitle("Help");
        embed.setDescription(`**Here are available commands:**`);
        commands.forEach(cmd => embed.addField(cmd.usage.syntax, cmd.usage.description));

        await msg.channel.send({ embed });
    }

    async validate(msg: Message, args: string[], config: GuildConfig): Promise<boolean> {
        return args.length === 0 || args.length === 1;
    }

    async hasAccess(msg: Message, args: string[], config: GuildConfig): Promise<boolean> {
        return true;
    }
}
