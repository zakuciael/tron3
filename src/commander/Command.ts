import {ConfigManager} from "../utils/ConfigManager";
import {Commander} from "./Commander";
import {Message} from "discord.js";

export interface Usage {
    syntax: string;
    description: string;
}

export abstract class Command {
    public abstract command: string;
    public abstract usage: Usage;
    public abstract async validate(msg: Message, args: string[], config: ConfigManager): Promise<boolean>;
    public abstract async execute(msg: Message, args: string[], config: ConfigManager, commander: Commander): Promise<void>;
}

export abstract class SubCommand extends Command {
    public abstract subcommand: string;
}