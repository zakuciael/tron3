import {SubCommand, Usage} from "../../commander/Command";
import {EmbedBuilder} from "../../utils/EmbedBuilder";
import {GuildConfig} from "../../config/GuildConfig";
import {Message} from "discord.js";

export class ChangePrefixSettingsSubCommand extends SubCommand {
    command: string = "settings";
    subcommand: string = "prefix";
    usage: Usage = {
        syntax: "settings prefix <new_prefix>",
        description: "Sets the bot prefix"
    };

    async execute(msg: Message, args: string[], config: GuildConfig): Promise<void> {
        const embed = EmbedBuilder.getSuccessCommandEmbed(msg.member!);
        embed.setTitle("Prefix changed!");
        embed.setDescription(`New prefix is **${args[0]}**`);

        config.setPrefix(args[0]);
        await config.getConfigManager().save();

        msg.channel.send({ embed });
    }

    async validate(msg: Message, args: string[], config: GuildConfig): Promise<boolean> {
        return args.length === 1;
    }
}