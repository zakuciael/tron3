import {Guild, GuildChannel, GuildMember, Role} from "discord.js";
import {NotificationSettings} from "../types/Config";

export class Notification {
    private readonly notification: NotificationSettings;
    private readonly channelID: string;

    constructor(channelID: string, notification: NotificationSettings) {
        this.notification = notification;
        this.channelID = channelID;
    }

    public getChannelID(): string {
        return this.channelID;
    }

    public getChannel(guild: Guild): GuildChannel {
        return guild.channels.resolve(this.channelID)!;
    }

    public addRole(role: Role) : void {
        this.notification.roles.push(role.id);
    }

    public removeRole(role: Role): void {
        this.notification.roles.splice(this.notification.roles.indexOf(role.id), 1);
    }

    public getRoles(guild: Guild): Promise<Role[]> {
        return Promise.all(this.notification.roles.map(id => {
            return guild.roles.fetch(id) as Promise<Role>;
        }));
    }

    public addMember(member: GuildMember): void {
        this.notification.users.push(member.id);
    }

    public removeMember(member: GuildMember): void {
        this.notification.users.splice(this.notification.users.indexOf(member.id), 1);
    }

    public getMembers(guild: Guild): Promise<GuildMember[]> {
        return guild.members.fetch({ user: this.notification.users, withPresences: true }).then(col => col.array());
    }

    public addExcludedMember(member: GuildMember): void {
        this.notification.excluded_users.push(member.id);
    }

    public removeExcludedMember(member: GuildMember): void {
        this.notification.excluded_users.splice(this.notification.excluded_users.indexOf(member.id), 1);
    }

    public getExcludedMembers(guild: Guild): Promise<GuildMember[]> {
        return guild.members.fetch({ user: this.notification.excluded_users, withPresences: true }).then(col => col.array());
    }

    public getMembersFromRoles(guild: Guild): Promise<GuildMember[]> {
        return this.getRoles(guild).then(roles => roles.map(role => role?.members.array()).reduce((acc, curr) => {
            acc?.push(...curr!);
            return acc;
        }, [])!);
    }

    public toSetting(): NotificationSettings {
        return this.notification;
    }
}