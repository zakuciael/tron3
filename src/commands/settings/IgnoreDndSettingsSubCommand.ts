import {SubCommand, Usage} from "../../commander/Command";
import {ConfigManager} from "../../utils/ConfigManager";
import {EmbedBuilder} from "../../utils/EmbedBuilder";
import {Message} from "discord.js";

export class IgnoreDndSettingsSubCommand extends SubCommand {
    command: string = "settings";
    subcommand: string = "dnd";
    usage: Usage = {
        syntax: "settings dnd <on/off>",
        description: "Toggles on and off setting to ignore dnd status when notifying"
    };

    async execute(msg: Message, args: string[], config: ConfigManager): Promise<void> {
        const embed = EmbedBuilder.getSuccessCommandEmbed(msg.member!);
        const enabled = args[0].toLowerCase() === "on";
        embed.setTitle("Ignore DND setting changed!");
        embed.setDescription(`New setting is **${enabled ? "enabled" : "disabled"}**`);

        config.setIgnoreDND(enabled);
        await config.save();

        msg.channel.send({ embed });
    }

    async validate(msg: Message, args: string[], config: ConfigManager): Promise<boolean> {
        return args.length === 1 && ["on", "off"].includes(args[0].toLowerCase());
    }
}