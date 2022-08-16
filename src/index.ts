/*
 * Tron 3
 * Copyright (c) 2022 Krzysztof Saczuk <zakku@zakku.eu>.
 * MIT Licensed
 */

import "reflect-metadata";
import "dotenv/config.js";
import process from "node:process";
import { IntentsBitField, Partials } from "discord.js";
import { TronClient } from "~/lib/tron-client.js";

const bot = new TronClient({
    log_level: process.env.LOG_LEVEL,
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildVoiceStates,
        IntentsBitField.Flags.GuildIntegrations,
        IntentsBitField.Flags.DirectMessages
    ],
    partials: [Partials.User, Partials.Channel, Partials.GuildMember]
});

await bot.login(process.env.BOT_TOKEN);
