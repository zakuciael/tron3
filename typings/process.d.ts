/*
 * Tron 3
 * Copyright (c) 2022 Krzysztof Saczuk <zakku@zakku.eu>.
 * MIT Licensed
 */

declare module "process" {
    global {
        namespace NodeJS {
            interface ProcessEnv extends Dict<string> {
                BOT_TOKEN: string;
                NODE_ENV?: "development" | "production";
                DEV_GUILD_ID?: string;
            }
        }
    }
}
