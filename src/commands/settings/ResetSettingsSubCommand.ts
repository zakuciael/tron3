import {SubCommand, Usage} from "../../commander/Command";
import {ConfigManager} from "../../utils/ConfigManager";
import {EmbedBuilder} from "../../utils/EmbedBuilder";
import {Message} from "discord.js";

export class ResetSettingsSubCommand extends SubCommand {
    command: string = "settings";
    subcommand: string = "reset";
    usage: Usage = {
        syntax: "settings reset",
        description: "Resets settings to the default values"
    };

    async execute(msg: Message, args: string[], config: ConfigManager): Promise<void> {
        const embed = EmbedBuilder.getSuccessCommandEmbed(msg.member!);
        embed.setTitle("Settings reset!");
        embed.setDescription("All settings has been set to default values");

        await config.reset();
        msg.channel.send({ embed });
    }

    async validate(msg: Message, args: string[], config: ConfigManager): Promise<boolean> {
        return true;
    }
}