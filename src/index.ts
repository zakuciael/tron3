import {ConfigManager} from "./config/ConfigManager";
import {Commander} from "./commander/Commander";
import {Client} from "discord.js";
import {GuildConfig} from "./config/GuildConfig";
import {EventType} from "./types/EventType";
import {createLogger, transports} from "winston";
import ecsFormat from "@elastic/ecs-winston-format";
import {logsFormat} from "@zakku/winston-logs";
import {isDebug} from "./utils/Debug";

const configPath: string = process.env.CONFIG_PATH || "./config.json";
const commandsPath: string = process.env.COMMANDS_PATH || "./src/commands";

(async () => {
    const logger = createLogger({
        level: isDebug ? "debug" : "info",
        format: isDebug ? logsFormat : ecsFormat({convertErr: true}),
        transports: [
            new transports.Console()
        ]
    })

    logger.info(`Loading configuration from: ${configPath}`, {configPath});
    const configManager = new ConfigManager(configPath);
    await configManager.load();
    logger.info("Configuration loaded!");

    logger.info(`Loading commands from: ${commandsPath}`, {commandsPath});
    const commander = new Commander(commandsPath, logger);
    const cmdCount = await commander.load();
    logger.info(`Loaded ${cmdCount} ${cmdCount == 1 ? "command" : "commands"}!`);

    logger.info(`Initializing bot...`);
    const bot = new Client({
        partials: ["GUILD_MEMBER"],
        ws: {intents: ["GUILDS", "GUILD_VOICE_STATES", "GUILD_PRESENCES", "GUILD_MESSAGES"]}
    });

    logger.info("Setting up message handler...");
    bot.on("message", async msg => commander.handle(msg, configManager));

    logger.info("Setting up voice state update handler...");
    bot.on("voiceStateUpdate", async (oldState, newState) => {
        const member = await (newState.member?.partial ? newState.member.fetch() : Promise.resolve(newState.member!));

        if (member.user.bot) return;
        for (let change of ["deaf", "mute", "selfDeaf", "selfMute", "selfVideo", "serverDeaf", "serverMute"]) {
            // @ts-ignore
            if (oldState[change] != undefined && oldState[change] !== newState[change]) {
                return;
            }
        }

        let eventType: EventType;
        if (!oldState.streaming && newState.streaming) {
            eventType = EventType.START_STREAM;
        } else if ((oldState.channelID !== undefined && oldState.channelID !== null) && oldState.streaming && !newState.streaming) {
            eventType = EventType.END_STREAM;
        } else if ((oldState.channelID === undefined || oldState.channelID === null) && (newState.channelID !== undefined && newState.channelID !== null)) {
            eventType = EventType.JOIN_CHANNEL;
        } else if ((newState.channelID === undefined || newState.channelID === null) && (oldState.channelID !== undefined && oldState.channelID !== null)) {
            eventType = EventType.LEAVE_CHANNEL;
        } else {
            eventType = EventType.SWITCH_CHANNEL;
        }

        let eventName = String(Object.keys(EventType)[(Object.keys(EventType).length / 2) + eventType]);
        logger.info(`Detected event change for user "${member.displayName}" new value is ${eventName}`, {
            event: {type: eventName},
            member: member,
            oldState,
            newState
        });

        if (eventType === EventType.LEAVE_CHANNEL || eventType === EventType.END_STREAM) return;

        const config = configManager.getGuildConfig(newState.guild.id);
        const notification = config.getNotificationManager().get(newState.channelID!);
        if (!notification) {
            logger.info(`No notification settings found for channel "${newState.channel?.name}" (${newState.channelID})`, {channel: newState.channel});
            return;
        }

        const members = [...new Set([
            ...(await notification.getMembers(newState.guild!)),
            ...(await notification.getMembersFromRoles(newState.guild!))
        ].filter(notificationMember =>
            !notificationMember.user.bot
        ).filter(async (notificationMember) =>
            (await notification.getExcludedMembers(newState.guild!))
                .findIndex(m => notificationMember.id === m.id) === -1
        ).filter(notificationMember =>
            !newState.channel?.members.has(notificationMember.id)
        ).filter(notificationMember =>
            config.isIgnoringDNDs() ||
            notificationMember.presence.status !== "dnd"
        ))];

        for (let i = 0; i < members.length; i++) {
            let notificationMember = members[i];
            if (member.id === notificationMember.id) continue;
            const channel = await notificationMember.user.createDM();

            logger.info(`Sending notification to ${notificationMember.displayName}`, {member: notificationMember});

            const message = eventType === EventType.JOIN_CHANNEL || eventType === EventType.SWITCH_CHANNEL ?
                `**${member.displayName}** joined **${newState.channel?.name}** in **${newState.guild.name}**` :
                eventType === EventType.START_STREAM ?
                    `**${member.displayName}** started streaming in **${newState.guild.name}**` :
                    undefined;

            if (message != undefined)
                await channel.send(message).catch(err => logger.error(`An error occurred while sending message to user ${notificationMember.displayName}`, {
                    member: notificationMember,
                    error: err
                }));
        }
    });

    logger.info("Setting up guild create handler...");
    bot.on("guildCreate", guild => {
        logger.info(`Joined new guild: ${guild.name}`);
        configManager.addGuildConfig(guild.id, GuildConfig.createDefault(configManager));
    });

    logger.info("Setting up guild delete handler...");
    bot.on("guildDelete", guild => {
        logger.info(`Left guild: ${guild.name}`);
        configManager.removeGuildConfig(guild.id);
    });

    await bot.login(configManager.getToken());
    logger.info(`Bot is running and connected as ${bot.user?.username}`);

    logger.debug("Creating missing guild configurations...");
    let count = 0;
    bot.guilds.cache.forEach(guild => {
        if (!configManager.getGuildConfig(guild.id)) {
            configManager.addGuildConfig(guild.id, GuildConfig.createDefault(configManager));
            count++;
        }
    });
    await configManager.save();

    if (count > 0) logger.debug(`Added ${count} missing guild configurations!`);
    else logger.debug(`No missing guild configurations found!`);
})();