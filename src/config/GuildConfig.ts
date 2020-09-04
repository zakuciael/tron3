import {NotificationManger} from "./NotificationManger";
import {GuildSettings} from "../types/Config";
import {ConfigManager} from "./ConfigManager";

export class GuildConfig {
    private readonly notificationManager: NotificationManger;
    private readonly manager: ConfigManager;
    private readonly settings: GuildSettings;

    constructor(manager: ConfigManager, settings: GuildSettings) {
        this.notificationManager = new NotificationManger(settings.notifications);
        this.manager = manager;
        this.settings = settings;
    }

    public static createDefault(manager: ConfigManager): GuildConfig {
        return new GuildConfig(manager, { prefix: "`", ignore_dnd: false, notifications: {} });
    }

    public async reset(): Promise<void> {
        this.setPrefix("`");
        this.setIgnoreDND(false);
        this.notificationManager.reset();
        await this.manager.save();
    }

    public getConfigManager(): ConfigManager {
        return this.manager;
    }

    public getPrefix(): string {
        return this.settings.prefix;
    }

    public setPrefix(prefix: string): void {
        this.settings.prefix = prefix;
    }

    public isIgnoringDNDs(): boolean {
        return this.settings.ignore_dnd;
    }

    public setIgnoreDND(ignore_dnd: boolean): void {
        this.settings.ignore_dnd = ignore_dnd;
    }

    public getNotificationManager(): NotificationManger {
        return this.notificationManager;
    }

    public toSetting(): GuildSettings {
        this.settings.notifications = this.notificationManager.toMap();
        return this.settings;
    }
}