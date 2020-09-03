import {SubCommand, Usage} from "../../commander/Command";
import {ConfigManager} from "../../utils/ConfigManager";
import {EmbedBuilder} from "../../utils/EmbedBuilder";
import {Message} from "discord.js";

export class ChangePrefixSettingsSubCommand extends SubCommand {
    command: string = "settings";
    subcommand: string = "prefix";
    usage: Usage = {
        syntax: "settings prefix <new_prefix>",
        description: "Sets the bot prefix"
    };

    async execute(msg: Message, args: string[], config: ConfigManager): Promise<void> {
        const embed = EmbedBuilder.getSuccessCommandEmbed(msg.member!);
        embed.setTitle("Prefix changed!");
        embed.setDescription(`New prefix is **${args[0]}**`);

        config.setPrefix(args[0]);
        await config.save();

        msg.channel.send({ embed });
    }

    async validate(msg: Message, args: string[], config: ConfigManager): Promise<boolean> {
        return args.length === 1;
    }
}