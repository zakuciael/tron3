import {Config, GuildMap} from "../types/Config";
import {AsyncUtils} from "../utils/AsyncUtils";
import {GuildConfig} from "./GuildConfig";
import {PathLike} from "fs";

export class ConfigManager {
    private _config: Config | undefined;
    private guilds: Map<string, GuildConfig>
    private readonly path: PathLike;

    constructor(path: PathLike) {
        this.guilds = new Map<string, GuildConfig>();
        this.path = path;
    }

    public load(): Promise<void> {
        return AsyncUtils.readFileAsync(this.path).then(data => {
            this._config = JSON.parse(data) as Config;

            let keys = Object.keys(this._config.guilds);
            let values = Object.values(this._config.guilds);

            for (let i = 0; i < keys.length; i++)
                this.guilds.set(keys[i], new GuildConfig(this, values[i]));
        }).then(() => {});
    }

    public save(): Promise<void> {
        let map: GuildMap = {};
        this.guilds.forEach((val, key) => map[key] = val.toSetting());

        // @ts-ignore
        this._config?.guilds = map;
        return AsyncUtils.writeFileAsync(this.path, JSON.stringify(this._config, null, 2));
    }

    public getToken(): string {
        return this._config?.token!;
    }

    public getGuildConfig(guildID: string): GuildConfig {
        return this.guilds.get(guildID)!;
    }

    public addGuildConfig(guildID: string, config: GuildConfig): void {
        this.guilds.set(guildID, config);
    }

    public removeGuildConfig(guildID: string): void {
        this.guilds.delete(guildID);
    }
}