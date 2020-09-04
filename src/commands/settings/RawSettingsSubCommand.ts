import {SubCommand, Usage} from "../../commander/Command";
import {ConfigManager} from "../../config/ConfigManager";
import {EmbedBuilder} from "../../utils/EmbedBuilder";
import { Message } from "discord.js";

export class RawSettingsSubCommand extends SubCommand {
    command: string = "settings";
    subcommand: string = "raw";
    usage: Usage = {
        syntax: "settings raw",
        description: "Displays raw settings"
    };

    async execute(msg: Message, args: string[], config: ConfigManager): Promise<void> {
        const embed = EmbedBuilder.getCommandEmbed(msg.member!);
        embed.setTitle("Raw Settings");

        let copy = JSON.parse(JSON.stringify(config.raw()));
        delete copy.token;

        embed.setDescription("```json\n" + JSON.stringify(copy, null, 2) + "\n```");
        msg.channel.send({ embed });
        return;
    }

    async validate(msg: Message, args: string[], config: ConfigManager): Promise<boolean> {
        return true;
    }
}