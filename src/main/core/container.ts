import { container, Lifecycle } from 'tsyringe';
import moment from 'moment';
import * as log4js from 'log4js';
import path from 'path';
import * as Sentry from '@sentry/node';
import Logger from './Logger';
import Tokens from '../bin/Tokens';
import { firefox, Browser, BrowserType } from 'playwright-firefox';
import BrowserRepository from '../features/browser/domain/repositories/BrowserRepository';
import BrowserRepositoryImpl from '../features/browser/data/repositories/BrowserRepositoryImpl';
import bindDependencies from './utils/bindDependencies';
import { ILaunchBrowser, LaunchBrowser } from '../features/browser/domain/usecases/LaunchBrowser';
import { INewPage, NewPage } from '../features/browser/domain/usecases/NewPage';
import BotRepository from 'main/features/bot/domain/repositories/BotRepository';
import BotRepositoryImpl from 'main/features/bot/data/repositories/BotRepositoryImpl';
import { CreatePages, ICreatePages } from 'main/features/bot/domain/usecases/CreatePages';
import { INewBot, NewBot } from 'main/features/bot/domain/usecases/NewBot';
import Store from 'electron-store';

export function initSentry() {
  if (typeof process.env.SENTRY_DSN_URL !== "undefined")
    Sentry.init({
      dsn: process.env.SENTRY_DSN_URL,
      tracesSampleRate: 1.0,
    });
}

export function initBrowser() {
  //! firefox
  container.registerInstance<BrowserType<Browser>>(Tokens.firefox, firefox);

  //! repositories
  container.register<BrowserRepository>(Tokens.browserRepository, {
    useClass: BrowserRepositoryImpl,
  }, { lifecycle: Lifecycle.Singleton });

  //! usecases
  container.register<ILaunchBrowser>(Tokens.launchBrowser, {
    useValue: bindDependencies(Tokens.browserRepository, LaunchBrowser),
  });
  container.register<INewPage>(Tokens.newPage, {
    useValue: bindDependencies(Tokens.browserRepository, NewPage),
  });
}

export function initBot() {
  //! firefox
  container.registerInstance<BrowserType<Browser>>(Tokens.firefox, firefox);

  //! repositories
  container.register<BotRepository>(Tokens.botRepository, {
    useClass: BotRepositoryImpl,
  }, { lifecycle: Lifecycle.Singleton });

  //! usecases
  container.register<ICreatePages>(Tokens.createPages, {
    useValue: bindDependencies(Tokens.botRepository, CreatePages),
  });
  container.register<INewBot>(Tokens.newBot, {
    useValue: bindDependencies(Tokens.botRepository, NewBot),
  });
}

export function initExternal() {
  //! sentry
  initSentry();

  //! electron-store
  const store = new Store();

  container.registerInstance<Store>(Tokens.electronStore, store);

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
    { lifecycle: Lifecycle.Singleton },
  );
}

async function init() {
  initExternal();
  initLogger();
  initBrowser();
  initBot();
}

export default init;
