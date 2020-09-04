import {NotificationSettings, NotificationMap} from "../types/Config";
import {Guild, VoiceChannel} from "discord.js";
import {Notification} from "./Notification";

export class NotificationManger {
    private readonly notifications: Map<string, Notification>;

    constructor(notifications: NotificationMap) {
        this.notifications = new Map<string, Notification>();

        let keys = Object.keys(notifications);
        let values = Object.values(notifications);

        for (let i = 0; i < keys.length; i++)
            this.notifications.set(keys[i], new Notification(keys[i], values[i]));
    }

    public getChannel(channelID: string, guild: Guild): VoiceChannel {
        return guild.channels.resolve(channelID)! as VoiceChannel;
    }

    public has(channelID: string): boolean {
        return this.notifications.has(channelID);
    }

    public get(channelID: string): Notification {
        return this.notifications.get(channelID)!;
    }

    public add(channelID: string, settings: NotificationSettings): void {
        this.notifications.set(channelID, new Notification(channelID, settings));
    }

    public forEach(fnc: (value: Notification, key?: string, map?: Map<string, Notification>) => void): void {
        this.notifications.forEach(fnc);
    }

    public map<U>(fnc: (value: Notification, index: number, array: Notification[]) => U): U[] {
        return [...this.notifications.values()].map(fnc);
    }

    public filter(fnc: (value: Notification, index: number, array: Notification[]) => boolean): Notification[] {
        return [...this.notifications.values()].filter(fnc);
    }

    public toMap(): NotificationMap {
        let map: NotificationMap = {};
        this.notifications.forEach((val, key) => map[key] = val.toSetting());

        return map;
    }

    public reset(): void {
        this.notifications.clear();
    }
}