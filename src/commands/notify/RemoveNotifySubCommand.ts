import {SubCommand, Usage} from "../../commander/Command";
import {EmbedBuilder} from "../../utils/EmbedBuilder";
import {GuildConfig} from "../../config/GuildConfig";
import {Message} from "discord.js";

export class RemoveNotifySubCommand extends SubCommand {
    command: string = "notify";
    subcommand: string = "rm";
    usage: Usage = {
        syntax: "notify rm <all/channel_id> <@role|@user...>",
        description: "Removes notifications for specified channel/s to all given roles/users"
    };

    async execute(msg: Message, args: string[], config: GuildConfig): Promise<void> {
        const applyToAllChannels = args[0] === "all";
        const notifications = config.getNotificationManager()
            .filter(notification => applyToAllChannels || notification.getChannelID() === args[0]);
        const channels = notifications
            .map(notification => notification.getChannel(msg.guild!));
        const members = msg.mentions.members!;
        const roles = msg.mentions.roles;

        if (notifications.length === 0) {
            const embed = EmbedBuilder.getErrorCommandEmbed(msg.member!);
            embed.setTitle(`Failed to remove notification${applyToAllChannels ? "s" : ""}`);
            embed.setDescription(applyToAllChannels ?
                "Could not find any notifications on this server" :
                "Could not find notification for specified channel"
            );

            await msg.channel.send({ embed });
            return;
        }

        const embed = EmbedBuilder.getSuccessCommandEmbed(msg.member!);
        embed.setTitle(`Notification${applyToAllChannels ? "s" : ""} removed!`);
        embed.setDescription(`**Members:** ${members?.size > 0  ? members?.array().join(", ") : "None"}
                    **Roles:** ${roles.size > 0 ? roles.array().join(", ") : "None"}`);

        for (const channel of channels) {
            const notification = notifications.find(notification => notification.getChannelID() === channel.id);
            if (!notification) continue;

            const membersToRemove = (await notification.getMembers(msg.guild!)).filter(member => members.has(member.id));
            const rolesToRemove = (await notification?.getRoles(msg.guild!)).filter(role => roles.has(role.id));

            embed.addField(
                `:microphone2: **${channel.name}**`,
                `**Status:** ${membersToRemove?.length === 0 && rolesToRemove?.length === 0 ? ":x:" : ":white_check_mark:"}`,
                true
            );

            membersToRemove?.forEach(member => notification?.removeMember(member));
            rolesToRemove?.forEach(role => notification?.removeRole(role));
        }

        await config.getConfigManager().save();
        await msg.channel.send({ embed });
    }

    async validate(msg: Message, args: string[], config: GuildConfig): Promise<boolean> {
        return msg.mentions.roles.size > 0 || msg.mentions.users.size > 0;
    }
}
