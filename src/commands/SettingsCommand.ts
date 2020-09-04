import {Command, Usage} from "../commander/Command";
import {EmbedBuilder} from "../utils/EmbedBuilder";
import {GuildConfig} from "../config/GuildConfig";
import {Message} from "discord.js";

export default class SettingsCommand extends Command {
    command: string = "settings";
    usage: Usage = {
        syntax: "settings",
        description: "Displays settings in human readable format"
    };

    async execute(msg: Message, args: string[], config: GuildConfig): Promise<void> {
        const embed = EmbedBuilder.getCommandEmbed(msg.member!);
        embed.setTitle("Bot Settings");

        embed.addField(
            `:gear: **Global Settings**`,
            `**Prefix:** ${config.getPrefix()}
            **Ignores DND:** ${config.isIgnoringDNDs() ? "Yes" : "No"}`,
            false
        )

        config.getNotificationManager().forEach((notification, channelID) => {
            const excludedMembers = notification.getExcludedMembers(msg.guild!);
            const members = notification.getMembers(msg.guild!);
            const roles = notification.getRoles(msg.guild!);

            embed.addField(
                `:microphone2: **${config.getNotificationManager().getChannel(channelID!, msg.guild!).name}**`,
                `**Members:** ${members.length > 0  ? members.join(", ") : "None"}
                    **Roles:** ${roles.length > 0 ? roles.join(", ") : "None"}
                    **Excluded Members:** ${excludedMembers.length > 0  ? excludedMembers.join(", ") : "None"}`,
                true
            )
        });

        msg.channel.send({ embed });
    }

    async validate(msg: Message, args: string[], config: GuildConfig): Promise<boolean> {
        return true;
    }
}