import {SubCommand, Usage} from "../../commander/Command";
import {EmbedBuilder} from "../../utils/EmbedBuilder";
import {GuildConfig} from "../../config/GuildConfig";
import {Commander} from "../../commander/Commander";
import { Message } from "discord.js";

export class RawSettingsSubCommand extends SubCommand {
    command: string = "settings";
    subcommand: string = "raw";
    usage: Usage = {
        syntax: "settings raw",
        description: "Displays raw settings"
    };

    async execute(msg: Message, args: string[], config: GuildConfig): Promise<void> {
        const embed = EmbedBuilder.getCommandEmbed(msg.member!);
        embed.setTitle("Raw Settings");

        let copy = JSON.parse(JSON.stringify(config.toSetting()));
        delete copy.token;

        embed.setDescription("```json\n" + JSON.stringify(copy, null, 2) + "\n```");
        await msg.channel.send({ embed });
    }

    async validate(msg: Message, args: string[], config: GuildConfig): Promise<boolean> {
        return true;
    }

    async hasAccess(msg: Message, args: string[], config: GuildConfig): Promise<boolean> {
        return Commander.isAdmin(msg, config);
    }
}