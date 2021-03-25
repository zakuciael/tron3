import {SubCommand, Usage} from "../../commander/Command";
import {EmbedBuilder} from "../../utils/EmbedBuilder";
import {GuildConfig} from "../../config/GuildConfig";
import {Commander} from "../../commander/Commander";
import {Message} from "discord.js";

export class AddNotifySubCommand extends SubCommand {
    command: string = "notify";
    subcommand: string = "add";
    usage: Usage = {
        syntax: "notify add <all/channel_id> <@role|@user...>",
        description: "Adds notifications for specified channel/s to all given roles/users"
    };

    async execute(msg: Message, args: string[], config: GuildConfig): Promise<void> {
        const applyToAllChannels = args[0] === "all";
        const channels = (applyToAllChannels ?
            [...msg.guild?.channels.cache.filter(channel => channel.type === "voice").array()!] :
            [msg.guild?.channels.resolve(args[0])!])
            .filter(channel => channel !== null && channel !== undefined);
        const members = msg.mentions.members!;
        const roles = msg.mentions.roles;

        if (channels.length <= 0) {
            const embed = EmbedBuilder.getErrorCommandEmbed(msg.member!);
            embed.setTitle(`Failed to add notification${applyToAllChannels ? "s" : ""}`);
            embed.setDescription(applyToAllChannels ?
                "Could not find any voice channels on this server" :
                "Could not find specified channel"
            );

            await msg.channel.send({ embed });
            return;
        }

        const embed = EmbedBuilder.getSuccessCommandEmbed(msg.member!);
        embed.setTitle(`Notification${applyToAllChannels ? "s" : ""} added!`);
        embed.setDescription(`**Members:** ${members?.size > 0  ? members?.array().join(", ") : "None"}
                    **Roles:** ${roles.size > 0 ? roles.array().join(", ") : "None"}`);

        channels.forEach(channel => {
            const notification = config.getNotificationManager().get(channel.id)
            embed.addField(`:microphone2: **${channel.name}**`, "**Status:** :white_check_mark:", true);

            if (!notification) {
                config.getNotificationManager().add(channel.id, {
                    users: [...members?.map(member => member.id)],
                    roles: [...roles?.map(role => role.id)],
                    excluded_users: [],
                })
            } else {
                members.forEach(member => notification.addMember(member));
                roles.forEach(role => notification.addRole(role));
            }
        });

        await config.getConfigManager().save();
        await msg.channel.send({ embed });
    }

    async validate(msg: Message, args: string[], config: GuildConfig): Promise<boolean> {
        return msg.mentions.roles.size > 0 || msg.mentions.users.size > 0;
    }

    async hasAccess(msg: Message, args: string[], config: GuildConfig): Promise<boolean> {
        return Commander.isAdmin(msg, config);
    }
}