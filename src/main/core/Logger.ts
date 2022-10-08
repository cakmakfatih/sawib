import * as log4js from "log4js";
import { inject, injectable } from "tsyringe";
import Tokens from "./bin/Tokens";

@injectable()
class Logger {
  private readonly log4js: log4js.Logger;

  constructor(@inject(Tokens.log4js) log4jsLogger: log4js.Logger) {
    this.log4js = log4jsLogger;
  }

  info(message: string) {
    this.log4js.info(`[${process.pid}] - ${message}`);
  }

  debug(message: string) {
    this.log4js.debug(`[${process.pid}] - ${message}`);
  }

  warn(message: string) {
    this.log4js.warn(`[${process.pid}] - ${message}`);
  }

  error(e: Error) {
    this.log4js.error(`[${process.pid}] - ${e.message}`, e.stack);
  }

  seperate() {
    this.log4js.debug(
      `[${process.pid}] --------------------------------------------`
    );
  }
}

export default Logger;
