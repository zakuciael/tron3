/*
 * Tron 3
 * Copyright (c) 2021 Krzysztof Saczuk <zakku@zakku.eu>.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import Schema, { string, Type } from "computed-types";
import { createLogger, transports } from "winston";
import { logsFormat } from "@zakku/winston-logs";
import { config } from "dotenv";
import { resolve } from "path";

const EnvironmentSchema = Schema(
    {
        LOGGING_LEVEL: Schema.either(
            "error" as const,
            "warn" as const,
            "info" as const,
            "debug" as const
        ).optional("info"),
        LOGGING_LOG_TYPE: Schema.either("log" as const, "json" as const).optional("log"),
        LOGGING_PATH: string.optional(),
        DISCORD_TOKEN: string
            .min(59)
            .max(59)
            .regexp(/^[MN][A-Za-z\d]{23}\.[\w-]{6}\.[\w-]{27}$/g),
        DISCORD_CLIENT_SECRET: string
            .min(32)
            .max(32)
            .regexp(/^(\w|-){32}$/g),
        DISCORD_CLIENT_ID: string
            .min(18)
            .max(18)
            .regexp(/^[0-9]{18}$/g),
        DATABASE_URL: /^postgresql:\/\/[^@/?#\s]+@[^/?#\s]+\/[^?#\s]*(?:[?][^#\s]+\S*)?$/g,
    },
    { strict: true }
);

type Environment = Type<typeof EnvironmentSchema>;

const isEmpty = (value: string | undefined | null): boolean => {
    return value == undefined || value.trim() === "";
};

export const loadEnv = (path?: string): void => {
    path = path ?? resolve(process.cwd(), ".env");

    const logger = createLogger({
        level: "error",
        format: logsFormat,
        transports: [new transports.Console()],
    });

    const validator = EnvironmentSchema.destruct();
    const { error: parseError, parsed } = config({ path });

    if (parseError != undefined) {
        logger.error(parseError);
        process.exit(1);
        return;
    }

    if (parsed == undefined) {
        logger.error("Failed to load .env file");
        process.exit(1);
        return;
    }

    const [validationError] = validator(parsed as Environment);

    if (validationError != undefined) {
        logger.error(
            `Validation failed: ${
                validationError.errors != undefined
                    ? validationError.errors[0].error.message
                    : validationError.message
            }`
        );
        process.exit(1);
        return;
    }

    // Load defaults if validation succeeded but optional values are not present or empty
    process.env.LOGGING_LEVEL = !isEmpty(process.env.LOGGING_LEVEL)
        ? process.env.LOGGING_LEVEL
        : "info";
    process.env.LOGGING_LOG_TYPE = !isEmpty(process.env.LOGGING_LOG_TYPE)
        ? process.env.LOGGING_LOG_TYPE
        : "log";
    process.env.LOGGING_PATH = !isEmpty(process.env.LOGGING_PATH)
        ? process.env.LOGGING_PATH
        : undefined;
};
