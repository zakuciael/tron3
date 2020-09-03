import {GuildMember, MessageEmbed} from "discord.js";
import { Usage } from "../commander/Command";

export class EmbedBuilder {
    public static getCommandEmbed(member: GuildMember): MessageEmbed {
        const embed = new MessageEmbed();
        const avatarURL = member.user.avatarURL() ? member.user.avatarURL() : member.user.defaultAvatarURL;

        embed.setTimestamp(Date.now());
        embed.setFooter(`Executed by ${member.displayName}`, avatarURL!);
        embed.setColor("#7289da");

        return embed;
    }

    public static getSuccessCommandEmbed(member: GuildMember): MessageEmbed {
        return EmbedBuilder.getCommandEmbed(member).setColor("#2ecc71");
    }

    public static getErrorCommandEmbed(member: GuildMember): MessageEmbed {
        return EmbedBuilder.getCommandEmbed(member).setColor("#e74c3c");
    }

    public static getInvalidCommandEmbed(usages: Usage[]): MessageEmbed {
        const embed = new MessageEmbed();

        embed.setTitle("Invalid command");
        embed.setDescription("**Here are available options:**");
        embed.setColor("#e74c3c");
        embed.setFooter("Use \"!help command\" for more info on a command.");
        usages.forEach(usage => embed.addField(usage.syntax, usage.description))

        return embed;
    }
}