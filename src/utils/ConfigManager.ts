import {NotificationManger} from "./NotificationManger";
import {AsyncUtils} from "./AsyncUtils";
import {Config} from "../types/Config";
import {PathLike} from "fs";

export class ConfigManager {
    private _config: Config | undefined;
    private notificationManager: NotificationManger | undefined;
    private readonly path: PathLike;

    constructor(path: PathLike) {
        this.path = path;
    }

    public load(): Promise<void> {
        return AsyncUtils.readFileAsync(this.path).then(data => {
            this._config = JSON.parse(data) as Config;
            this.notificationManager = new NotificationManger(this._config.notifications);
        }).then(() => {});
    }

    public save(): Promise<void> {
        // @ts-ignore
        this._config?.notifications = this.notificationManager?.toMap();

        return AsyncUtils.writeFileAsync(this.path, JSON.stringify(this._config, null, 2));
    }

    public async reset(): Promise<void> {
        // @ts-ignore
        this._config?.prefix = "`";
        // @ts-ignore
        this._config?.ignore_dnd = false;

        this.notificationManager?.reset();
        await this.save();
    }

    public getToken(): string {
        return this._config?.token!;
    }

    public getPrefix(): string {
        return this._config?.prefix!;
    }

    public setPrefix(prefix: string): void {
        // @ts-ignore
        this._config?.prefix = prefix;
    }

    public isIgnoringDNDs(): boolean {
        return this._config?.ignore_dnd!;
    }

    public setIgnoreDND(ignore_dnd: boolean): void {
        // @ts-ignore
        this._config?.ignore_dnd = ignore_dnd;
    }

    public getNotificationManager(): NotificationManger {
        return this.notificationManager!;
    }

    public raw(): Config {
        return this._config!;
    }
}