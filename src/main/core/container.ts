import { container, Lifecycle } from "tsyringe";
import moment from "moment";
import * as log4js from "log4js";
import path from "path";
import * as Sentry from "@sentry/node";
import Logger from "./Logger";
import Tokens from "./bin/Tokens";

export function initSentry() {
  if (typeof process.env.SENTRY_DSN_URL !== "undefined")
    Sentry.init({
      dsn: process.env.SENTRY_DSN_URL,
      tracesSampleRate: 1.0,
    });
}

function initExternal() {
  //! sentry
  initSentry();

  //! log4js
  const logger = log4js.getLogger();

  const logDir = path.resolve("logs");
  const logPath = path.resolve(
    logDir,
    `${moment().utc().format("YYYY-MM-DD HH-MM-SS").toString()}.log`
  );

  if (process.env.NODE_ENV === "prod") {
    log4js.configure({
      appenders: {
        default: { type: "console" },
      },
      categories: { default: { appenders: ["default"], level: "info" } },
    });
  } else {
    log4js.configure({
      appenders: {
        default: { type: "console", filename: logPath },
        out: { type: "file", filename: logPath },
      },
      categories: {
        default: { appenders: ["default", "out"], level: "debug" },
      },
    });
  }

  container.registerInstance<log4js.Logger>(Tokens.log4js, logger);
}

function initLogger() {
  container.register(
    Tokens.logger,
    { useClass: Logger },
    { lifecycle: Lifecycle.Singleton }
  );
}

async function init() {
  initExternal();
  initLogger();
}

export default init;
