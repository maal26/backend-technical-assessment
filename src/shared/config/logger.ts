import pino from "pino";
import { envs } from "./envs.ts";

const pinoLogger = pino(
    envs.NODE_ENV === "dev"
        ? {
              transport: {
                  target: "pino-pretty",
                  options: {
                      colorize: true,
                  },
              },
          }
        : {}
);

export const logger = () => {
    const info = (message: string, context?: unknown) => pinoLogger.info(context ?? {}, message);

    const warn = (message: string, context?: unknown) => pinoLogger.warn(context ?? {}, message);

    const error = (message: string, context?: unknown) => pinoLogger.error(context ?? {}, message);

    return {
        info,
        warn,
        error,
    };
};
