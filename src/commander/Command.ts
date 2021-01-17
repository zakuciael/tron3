import {Commander} from "./Commander";
import {Message} from "discord.js";
import {GuildConfig} from "../config/GuildConfig";

export interface Usage {
    syntax: string;
    description: string;
}

export abstract class Command {
    public abstract command: string;
    public abstract usage: Usage;
    public abstract validate(msg: Message, args: string[], config: GuildConfig): Promise<boolean>;
    public abstract execute(msg: Message, args: string[], config: GuildConfig, commander: Commander): Promise<void>;
}

export abstract class SubCommand extends Command {
    public abstract subcommand: string;
}