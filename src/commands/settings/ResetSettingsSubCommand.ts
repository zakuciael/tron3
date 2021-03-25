import {SubCommand, Usage} from "../../commander/Command";
import {EmbedBuilder} from "../../utils/EmbedBuilder";
import {GuildConfig} from "../../config/GuildConfig";
import {Commander} from "../../commander/Commander";
import {Message} from "discord.js";

export class ResetSettingsSubCommand extends SubCommand {
    command: string = "settings";
    subcommand: string = "reset";
    usage: Usage = {
        syntax: "settings reset",
        description: "Resets settings to the default values"
    };

    async execute(msg: Message, args: string[], config: GuildConfig): Promise<void> {
        const embed = EmbedBuilder.getSuccessCommandEmbed(msg.member!);
        embed.setTitle("Settings reset!");
        embed.setDescription("All settings has been set to default values");

        await config.reset();
        await msg.channel.send({ embed });
    }

    async validate(msg: Message, args: string[], config: GuildConfig): Promise<boolean> {
        return true;
    }

    async hasAccess(msg: Message, args: string[], config: GuildConfig): Promise<boolean> {
        return Commander.isAdmin(msg, config);
    }
}