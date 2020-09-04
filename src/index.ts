import {ConfigManager} from "./config/ConfigManager";
import {Commander} from "./commander/Commander";
import {Logger} from "colored-logs";
import {Client} from "discord.js";
import {GuildConfig} from "./config/GuildConfig";

const configPath: string = process.env.CONFIG_PATH || "./config.json";
const commandsPath: string = process.env.COMMANDS_PATH || "./src/commands";
const isDebug = process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() === "development";

(async () => {
    const logger = new Logger({
        level: isDebug ? "debug" : "info",
        timezone: "Europe/Warsaw",
        timed_logs: false
    });

    logger.info(`Starting bot...`);
    logger.debug(`Configuration path: ${configPath}`);
    logger.debug(`Commands path: ${commandsPath}`);

    const configManager = new ConfigManager(configPath);
    const commander = new Commander(commandsPath, logger);
    const bot = new Client();

    logger.info("Loading commands...");
    const cmdCount = await commander.load();

    logger.info(`Loaded ${cmdCount} ${cmdCount == 1 ? "command" : "commands"}!`);
    logger.debug("Setting up message handler...");
    bot.on("message", async msg => commander.handle(msg, configManager));

    logger.debug("Setting up voice state update handler...");
    bot.on("voiceStateUpdate", (oldState, newState) => {
        if (!newState.channelID) return;

        const config = configManager.getGuildConfig(newState.guild.id);
        const notification = config.getNotificationManager().get(newState.channelID);
        if (!notification) return;

        const members = [
            ...notification.getMembers(newState.guild!),
            ...notification.getMembersFromRoles(newState.guild!)
        ].filter(member =>
            notification.getExcludedMembers(newState.guild!)
                .find(m => member.id === m.id) === undefined
        ).filter(member =>
            config.isIgnoringDNDs() ||
            member.user.presence.status !== "dnd"
        );

        members.forEach(async member => {
            if (member.id == newState.member?.id) return;
            (await member.user.createDM()).send(`**${newState.member?.displayName}** has joined **${newState.channel?.name}**`);
        })
    });

    logger.debug("Setting up guild create handler...");
    bot.on("guildCreate", guild => {
        configManager.addGuildConfig(guild.id, GuildConfig.createDefault(configManager));
    });

    logger.debug("Setting up guild delete handler...");
    bot.on("guildDelete", guild => {
        configManager.removeGuildConfig(guild.id);
    });

    logger.info("Loading configuration...");
    await configManager.load();
    logger.info("Configuration loaded!");
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
    logger.debug(`Added ${count} missing guild configurations!`);
})();