import {NotificationManger} from "./NotificationManger";
import {GuildSettings} from "../types/Config";
import {ConfigManager} from "./ConfigManager";
import {Guild, Role} from "discord.js";

export class GuildConfig {
    private readonly notificationManager: NotificationManger;
    private readonly manager: ConfigManager;
    private readonly settings: GuildSettings;

    constructor(manager: ConfigManager, settings: GuildSettings) {
        this.notificationManager = new NotificationManger(settings.notifications);
        this.manager = manager;

        if (settings.admin_roles == undefined || typeof settings.admin_roles !== "object")
            settings.admin_roles = [];

        if (settings.notifications == undefined || typeof settings.notifications !== "object")
            settings.notifications = {};

        this.settings = settings;
    }

    public static createDefault(manager: ConfigManager): GuildConfig {
        return new GuildConfig(manager, { prefix: "`", ignore_dnd: false, admin_roles: [], notifications: {} });
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

    public getAdminRoles(guild: Guild): Promise<Role[]> {
        return Promise.all(this.settings.admin_roles.map(id => {
            return guild.roles.fetch(id) as Promise<Role>;
        }));
    }

    public addAdminRole(role: Role): void {
        this.settings.admin_roles.push(role.id);
    }

    public removeAdminRole(role: Role): void {
        this.settings.admin_roles.splice(this.settings.admin_roles.indexOf(role.id), 1);
    }

    public getNotificationManager(): NotificationManger {
        return this.notificationManager;
    }

    public toSetting(): GuildSettings {
        this.settings.notifications = this.notificationManager.toMap();
        return this.settings;
    }
}