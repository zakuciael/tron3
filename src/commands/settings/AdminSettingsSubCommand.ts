import {SubCommand, Usage} from "../../commander/Command";
import {EmbedBuilder} from "../../utils/EmbedBuilder";
import {GuildConfig} from "../../config/GuildConfig";
import {Commander} from "../../commander/Commander";
import {Message} from "discord.js";

export class AdminSettingsSubCommand extends SubCommand {
    command: string = "settings";
    subcommand: string = "admin";
    usage: Usage = {
        syntax: "settings admin <add/rm> <@role...>",
        description: "Adds/Removes admin role from which bot can listen to commands"
    };

    async execute(msg: Message, args: string[], config: GuildConfig): Promise<void> {
        const type = args[0] as "add" | "rm";
        let roles = [...msg.mentions.roles.array()];

        if (type === "rm") {
            const adminRoles = (await config.getAdminRoles(msg.guild!))
                .map(role => role.id);

            roles = roles.filter(role => adminRoles.includes(role.id));
        }

        if (type === "rm" && roles.length === 0) {
            const embed = EmbedBuilder.getErrorCommandEmbed(msg.member!);
            embed.setTitle(`Failed to remove roles`);
            embed.setDescription("Could not find any of the specified roles in the server's config");

            await msg.channel.send({ embed });
            return;
        }

        const embed = EmbedBuilder.getSuccessCommandEmbed(msg.member!);
        embed.setTitle(`${type === "add" ? "Added" : "Removed"} ${roles.length} admin role${roles.length > 1 ? "s" : ""}!`);
        embed.setDescription(`Roles ${type === "add" ? "added" : "removed"}: ${roles.join(", ")}`);

        if (type === "add") roles.forEach(role => config.addAdminRole(role));
        else roles.forEach(role => config.removeAdminRole(role));

        await config.getConfigManager().save();
        await msg.channel.send({ embed });
    }

    async validate(msg: Message, args: string[], config: GuildConfig): Promise<boolean> {
        return args.length === 1 && ["add", "rm"].includes(args[0].toLowerCase()) && msg.mentions.roles.size > 0;
    }

    async hasAccess(msg: Message, args: string[], config: GuildConfig): Promise<boolean> {
        return Commander.isAdmin(msg, config);
    }
}