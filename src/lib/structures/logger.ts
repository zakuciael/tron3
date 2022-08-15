/*
 * Tron 3
 * Copyright (c) 2022 Krzysztof Saczuk <zakku@zakku.eu>.
 * MIT Licensed
 */

import { createLogger, Logger as WinstonLogger, transports } from "winston";
import { elegantFormat, LABEL } from "@zakku/winston-logs";
import { Injectable } from "~/lib/decorators/injectable.js";

@Injectable
export class Logger {
    logger: WinstonLogger;

    constructor();
    constructor(level: string);
    constructor(level: string, label: string | string[]);
    constructor(level?: string, label?: string | string[]) {
        this.logger = createLogger({
            level: level?.toLowerCase() ?? "info",
            levels: { fatal: 0, error: 1, warn: 2, info: 3, debug: 4, trace: 5 },
            // TODO: Implement LOG_TYPE env usage, by adding json output
            format: elegantFormat({
                colors: {
                    trace: "magenta"
                },
                labelColors: {
                    1: "magenta"
                }
            }),
            // TODO: Implement output to log management services
            transports: [new transports.Console()],
            ...(label === undefined ? {} : { defaultMeta: { [LABEL]: label } })
        });
    }

    public log(level: string, message: unknown): this;
    public log(level: string, message: string, ...meta: unknown[]): this;
    public log(level: string, message: unknown, ...meta: unknown[]): this {
        if (arguments.length === 2) {
            this.logger.log(level.toLowerCase(), message);
            return this;
        }

        this.logger.log(level.toLowerCase(), message as string, ...meta);
        return this;
    }

    public fatal(message: unknown): this;
    public fatal(message: string, ...meta: unknown[]): this;
    public fatal(message: unknown, ...meta: unknown[]): this {
        if (typeof message !== "string") {
            this.logger.log("fatal", message);
            return this;
        }

        this.logger.log("fatal", message, ...meta);
        return this;
    }

    public error(message: unknown): this;
    public error(message: string, ...meta: unknown[]): this;
    public error(message: unknown, ...meta: unknown[]): this {
        if (typeof message !== "string") {
            this.logger.log("error", message);
            return this;
        }

        this.logger.log("error", message, ...meta);
        return this;
    }

    public warn(message: unknown): this;
    public warn(message: string, ...meta: unknown[]): this;
    public warn(message: unknown, ...meta: unknown[]): this {
        if (typeof message !== "string") {
            this.logger.log("warn", message);
            return this;
        }

        this.logger.log("warn", message, ...meta);
        return this;
    }

    public info(message: unknown): this;
    public info(message: string, ...meta: unknown[]): this;
    public info(message: unknown, ...meta: unknown[]): this {
        if (typeof message !== "string") {
            this.logger.log("info", message);
            return this;
        }

        this.logger.log("info", message, ...meta);
        return this;
    }

    public debug(message: unknown): this;
    public debug(message: string, ...meta: unknown[]): this;
    public debug(message: unknown, ...meta: unknown[]): this {
        if (typeof message !== "string") {
            this.logger.log("debug", message);
            return this;
        }

        this.logger.log("debug", message, ...meta);
        return this;
    }

    public trace(message: unknown): this;
    public trace(message: string, ...meta: unknown[]): this;
    public trace(message: unknown, ...meta: unknown[]): this {
        if (typeof message !== "string") {
            this.logger.log("trace", message);
            return this;
        }

        this.logger.log("trace", message, ...meta);
        return this;
    }

    public createLabeled(label: string | string[]): Logger {
        return new Logger(this.logger.level, label);
    }
}
