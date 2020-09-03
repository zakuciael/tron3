export interface Config {
    token: string;
    prefix: string;
    ignore_dnd: boolean;
    notifications: NotificationMap;
}

export interface NotificationMap {
    [key: string]: NotificationSettings;
}

export interface NotificationSettings {
    roles: string[];
    users: string[];
    excluded_users: string[];
}