import {Command, Usage} from "../commander/Command";
import {EmbedBuilder} from "../utils/EmbedBuilder";
import {GuildConfig} from "../config/GuildConfig";
import {Commander} from "../commander/Commander";
import {Message} from "discord.js";

export default class SettingsCommand extends Command {
    command: string = "settings";
    usage: Usage = {
        syntax: "settings",
        description: "Displays settings in human readable format"
    };

    async execute(msg: Message, args: string[], config: GuildConfig): Promise<void> {
        const adminRoles = await config.getAdminRoles(msg.guild!);
        const embed = EmbedBuilder.getCommandEmbed(msg.member!);
        embed.setTitle("Bot Settings");

        embed.addField(
            `:gear: **Global Settings**`,
            `**Prefix:** ${config.getPrefix()}
            **Ignores DND:** ${config.isIgnoringDNDs() ? "Yes" : "No"}
            **Admin Roles:** ${adminRoles.length === 0 ? "None" : adminRoles.join(", ")}`,
            false
        )

        for (let channelID in config.getNotificationManager().toMap()) {
            // noinspection JSUnfilteredForInLoop
            const notification = config.getNotificationManager().get(channelID);
            if (!notification) continue;

            const excludedMembers = await notification.getExcludedMembers(msg.guild!);
            const members = await notification.getMembers(msg.guild!);
            const roles = await notification.getRoles(msg.guild!);

            // noinspection JSUnfilteredForInLoop
            embed.addField(
                `:microphone2: **${config.getNotificationManager().getChannel(channelID, msg.guild!).name}**`,
                `**Members:** ${members.length > 0  ? members.join(", ") : "None"}
                    **Roles:** ${roles.length > 0 ? roles.join(", ") : "None"}
                    **Excluded Members:** ${excludedMembers.length > 0  ? excludedMembers.join(", ") : "None"}`,
                true
            )
        }

        await msg.channel.send({ embed });
    }

    async validate(msg: Message, args: string[], config: GuildConfig): Promise<boolean> {
        return true;
    }

    async hasAccess(msg: Message, args: string[], config: GuildConfig): Promise<boolean> {
        return Commander.isAdmin(msg, config);
    }
}