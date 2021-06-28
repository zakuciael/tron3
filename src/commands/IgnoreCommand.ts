import {Command, Usage} from "../commander/Command";
import {EmbedBuilder} from "../utils/EmbedBuilder";
import {GuildConfig} from "../config/GuildConfig";
import {Message} from "discord.js";

export class IgnoreCommand extends Command {
    command: string = "ignore";
    usage: Usage = {
        syntax: "ignore <all/channel_id> <on/off>",
        description: "Excludes you from notifications"
    };

    async execute(msg: Message, args: string[], config: GuildConfig): Promise<void> {
        const applyToAllChannels = args[0] === "all";
        const enabled = args[1].toLowerCase() === "on";
        const notifications = config.getNotificationManager()
            .filter(notification => applyToAllChannels || notification.getChannelID() === args[0]);
        const channels = notifications
            .map(notification => notification.getChannel(msg.guild!));

        if (notifications.length === 0) {
            const embed = EmbedBuilder.getErrorCommandEmbed(msg.member!);
            embed.setTitle(`Failed to ignore notification${applyToAllChannels ? "s" : ""}`);
            embed.setDescription(applyToAllChannels ?
                "Could not find any notifications on this server" :
                "Could not find notification for specified channel"
            );

            await msg.channel.send({ embed });
            return;
        }

        const embed = EmbedBuilder.getSuccessCommandEmbed(msg.member!);
        embed.setTitle(`Notification${applyToAllChannels ? "s" : ""} ignored!`);

        for (const channel of channels) {
            const notification = notifications.find(notification => notification.getChannelID() === channel.id);
            if (!notification) continue;

            const found = (await notification.getExcludedMembers(msg.guild!)).find(member => member.id === msg.member?.id);

            embed.addField(
                `:microphone2: **${channel.name}**`,
                `**Status:** ${(enabled && found) || (!enabled && !found) ? ":x:" : ":white_check_mark:"}`,
                true
            );

            if(enabled && !found) notification?.addExcludedMember(msg.member!);
            else if (!enabled && found) notification?.removeExcludedMember(msg.member!)
        }

        await config.getConfigManager().save();
        await msg.channel.send({ embed });
    }

    async validate(msg: Message, args: string[], config: GuildConfig): Promise<boolean> {
        return args.length === 2 && ["on", "off"].includes(args[1].toLowerCase());
    }

    async hasAccess(msg: Message, args: string[], config: GuildConfig): Promise<boolean> {
        return true;
    }
}