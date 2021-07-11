import {ConfigManager} from "./config/ConfigManager";
import {Commander} from "./commander/Commander";
import {Client} from "discord.js";
import {GuildConfig} from "./config/GuildConfig";
import {createLogger, transports} from "winston";
import ecsFormat from "@elastic/ecs-winston-format";
import {logsFormat} from "@zakku/winston-logs";
import {EventType} from "./types/EventType";
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
        logger.info("Received new voice state update event!", {oldState, newState});

        const member = await (newState.member?.partial
            ? newState.member.fetch().catch(e => {
                logger.error("Failed to fetch member", {error: e});
                return undefined;
            }) : Promise.resolve(newState.member));

        if (member == undefined) {
            logger.error("Failed to obtain member data from the new state");
            return;
        }

        if (member.user.bot) {
            logger.info("Ignoring event due to member being a bot user.");
            return;
        }

        const eventType = EventType.fromStates(oldState, newState);
        const memberUsername = `${member.user.username}#${member.user.discriminator}`;

        if (eventType == undefined) {
            logger.error("Ignoring event due to invalid event type detected.");
            return;
        }

        logger.info(`Detected "${EventType[eventType]}" event type for user ${memberUsername}`);

        if (eventType !== EventType.JOIN_CHANNEL &&
            eventType !== EventType.SWITCH_CHANNEL &&
            eventType !== EventType.START_STREAM) {
            logger.info("Ignoring event because its not supported by the notification system");
            return;
        }

        const config = configManager.getGuildConfig(newState.guild.id);
        const notification = config.getNotificationManager().get(newState.channelID!);

        if (!notification) {
            logger.info(`No notification settings found for "${newState.channel?.name}" channel`, {channel: newState.channel});
            return;
        }

        const members = [...new Set([
            ...(await notification.getMembers(newState.guild!)),
            ...(await notification.getMembersFromRoles(newState.guild!))
        ].filter(target =>
            !target.user.bot
        ).filter(async (target) =>
            (await notification.getExcludedMembers(newState.guild!))
                .findIndex(m => target.id === m.id) === -1
        ).filter(target =>
            !newState.channel?.members.has(target.id)
        ).filter(target =>
            config.isIgnoringDNDs() ||
            target.presence.status !== "dnd"
        ))];

        for (let target of members) {
            if (member.id === target.id) continue;

            const targetUsername = `${target.user.username}#${target.user.discriminator}`;
            const channel = await target.user.createDM().catch(e => {
                logger.error(`Failed to setup DM with "${targetUsername}"`, {error: e});
                return undefined;
            });

            if (channel == undefined) return;
            logger.info(`Sending notification to ${targetUsername}`, {target});

            const message = eventType === EventType.JOIN_CHANNEL || eventType === EventType.SWITCH_CHANNEL ?
                `**${member.user.username}** joined **${newState.channel?.name}** in **${newState.guild.name}**` :
                eventType === EventType.START_STREAM ?
                    `**${member.user.username}** started streaming in **${newState.guild.name}**` :
                    undefined;

            if (message == undefined) return;

            await channel.send(message).catch(e => {
                logger.error(`An error occurred while sending message to ${targetUsername}`, {
                    target: target,
                    error: e
                });
            })
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