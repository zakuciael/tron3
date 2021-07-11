import {VoiceState} from "discord.js";

export enum EventType {
    JOIN_CHANNEL,
    LEAVE_CHANNEL,
    SWITCH_CHANNEL,
    START_STREAM,
    END_STREAM,
    START_VIDEO,
    END_VIDEO,
    SELF_DEAFEN,
    SELF_UNDEAFEN,
    SERVER_DEAFEN,
    SERVER_UNDEAFEN,
    SELF_MUTE,
    SELF_UNMUTE,
    SERVER_MUTE,
    SERVER_UNMUTE,
}

export namespace EventType {
    export const fromStates = (oldState: VoiceState, newState: VoiceState): EventType | undefined => {
        if (oldState.channelID == undefined && newState.channelID != undefined)
            return EventType.JOIN_CHANNEL;
        else if (oldState.channelID != undefined && newState.channelID == undefined)
            return EventType.LEAVE_CHANNEL;
        else if (oldState.channelID != undefined && newState.channelID != undefined && oldState.channelID !== newState.channelID)
            return EventType.SWITCH_CHANNEL;
        else if (!oldState.streaming && newState.streaming)
            return EventType.START_STREAM;
        else if (oldState.streaming && !newState.streaming)
            return EventType.END_STREAM;
        else if (!oldState.selfVideo && newState.selfVideo)
            return EventType.START_VIDEO;
        else if (oldState.selfVideo && !newState.selfVideo)
            return EventType.END_VIDEO;
        else if (!oldState.selfDeaf && newState.selfDeaf)
            return EventType.SELF_DEAFEN;
        else if (oldState.selfDeaf && !newState.selfDeaf)
            return EventType.SELF_UNDEAFEN;
        else if (!oldState.serverDeaf && newState.serverDeaf)
            return EventType.SERVER_DEAFEN;
        else if (oldState.serverDeaf && !newState.serverDeaf)
            return EventType.SERVER_UNDEAFEN;
        else if (!oldState.selfMute && newState.selfMute)
            return EventType.SELF_MUTE;
        else if (oldState.selfMute && !newState.selfMute)
            return EventType.SELF_UNMUTE;
        else if (!oldState.serverMute && newState.serverMute)
            return EventType.SERVER_MUTE;
        else if (oldState.serverMute && !newState.serverMute)
            return EventType.SERVER_UNMUTE;

        return undefined;
    }
}