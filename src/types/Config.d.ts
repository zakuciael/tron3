export interface Config {
    token: string;
    guilds: GuildMap;
}

export interface NotificationMap {
    [key: string]: NotificationSettings;
}

export interface NotificationSettings {
    roles: string[];
    users: string[];
    excluded_users: string[];
}

export interface GuildMap {
    [key: string]: GuildSettings;
}

export interface GuildSettings {
    prefix: string;
    ignore_dnd: boolean;
    notifications: NotificationMap;
}