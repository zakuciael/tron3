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

import { createLogger, Logger, transports } from "winston";
import ecsFormat from "@elastic/ecs-winston-format";
import { logsFormat } from "@zakku/winston-logs";
import "winston-daily-rotate-file";
import path from "path";

export class LogManager {
    private static logger: Logger;

    public static getLogger(): Logger {
        if (this.logger == undefined)
            this.logger = createLogger({
                level: process.env.LOGGING_LEVEL,
                format:
                    process.env.LOGGING_LOG_TYPE === "log"
                        ? logsFormat
                        : ecsFormat({ convertErr: true }),
                transports: [
                    ...(process.env.LOGGING_PATH == undefined ? [new transports.Console()] : []),
                    ...(process.env.LOGGING_PATH != undefined
                        ? [
                              new transports.DailyRotateFile({
                                  filename: "%DATE%.log",
                                  auditFile: path.resolve(process.env.LOGGING_PATH, "audit.json"),
                                  frequency: "24h",
                                  datePattern: "DD-MM-YYYY",
                                  dirname: path.resolve(process.env.LOGGING_PATH),
                                  maxFiles: "30d",
                              }),
                          ]
                        : []),
                ],
            });

        return this.logger;
    }
}
