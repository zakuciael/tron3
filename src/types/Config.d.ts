export interface Config {
    token: string;
    guilds: GuildMap;
}

export interface GuildMap {
    [key: string]: GuildSettings;
}

export interface NotificationMap {
    [key: string]: NotificationSettings;
}

export interface NotificationSettings {
    roles: string[];
    users: string[];
    excluded_users: string[];
}

export interface GuildSettings {
    prefix: string;
    ignore_dnd: boolean;
    admin_roles: string[];
    notifications: NotificationMap;
}