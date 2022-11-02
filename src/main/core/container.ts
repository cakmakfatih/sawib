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
import BotRepository from '../features/bot/domain/repositories/BotRepository';
import BotRepositoryImpl from '../features/bot/data/repositories/BotRepositoryImpl';
import { CreatePages, ICreatePages } from '../features/bot/domain/usecases/CreatePages';
import { INewBot, NewBot } from '../features/bot/domain/usecases/NewBot';
import Store from 'electron-store';
import ScraperLocalDataSource from '../features/scraper/data/datasources/ScraperLocalDataSource';
import ScraperLocalDataSourceImpl from '../features/scraper/data/datasources/ScraperLocalDataSource';
import ScraperRepository from '../features/scraper/domain/repositories/ScraperRepository';
import ScraperRepositoryImpl from '../features/scraper/data/repositories/ScraperRepositoryImpl';
import { GetScraperConfig, IGetScraperConfig } from '../features/scraper/domain/usecases/GetScraperConfig';
import { ILoginToPartsCheck, LoginToPartsCheck } from '../features/scraper/domain/usecases/LoginToPartsCheck';
import { ISavePartNumbersAsCsv, SavePartNumbersAsCsv } from '../features/scraper/domain/usecases/SavePartNumbersAsCsv';
import { IScrapePartNumbers, ScrapePartNumbers } from '../features/scraper/domain/usecases/ScrapePartNumbers';
import { ISetScraperConfig, SetScraperConfig } from '../features/scraper/domain/usecases/SetScraperConfig';
import { ILaunchBotController, LaunchBotController } from '../features/bot/domain/usecases/LaunchBotController';
import { SENTRY_DSN_URL } from '../bin/config';
import { GetPartNumbers, IGetPartNumbers } from '../features/scraper/domain/usecases/GetPartNumbers';
import { GetPartNumbersAndPartTexts, IGetPartNumbersAndPartTexts } from '../features/scraper/domain/usecases/GetPartNumbersAndPartTexts';
import { GetPartTexts, IGetPartTexts } from '../features/scraper/domain/usecases/GetPartTexts';
import { GetVehicleInfo, IGetVehicleInfo } from '../features/scraper/domain/usecases/GetVehicleInfo';
import { ISaveVehicleInfoWithPartsDataAsCsv, SaveVehicleInfoWithPartsDataAsCsv } from '../features/scraper/domain/usecases/SaveVehicleInfoWithPartsDataAsCsv';
import { IScrapeVehicleInfoWithPartsData, ScrapeVehicleInfoWithPartsData } from '../features/scraper/domain/usecases/ScrapeVehicleInfoWithPartsData';

export function initSentry() {
  Sentry.init({
    dsn: SENTRY_DSN_URL,
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
  container.register<ILaunchBotController>(Tokens.launchBotController, {
    useValue: bindDependencies(Tokens.botRepository, LaunchBotController),
  });
}

export function initScraper() {
  //! datasources
  container.register<ScraperLocalDataSource>(Tokens.scraperLocalDataSource, {
    useClass: ScraperLocalDataSourceImpl,
  }, { lifecycle: Lifecycle.Singleton });

  //! repositories
  container.register<ScraperRepository>(Tokens.scraperRepository, {
    useClass: ScraperRepositoryImpl,
  }, { lifecycle: Lifecycle.Singleton });

  //! usecases
  container.register<IGetPartNumbers>(Tokens.getPartNumbers, {
    useValue: bindDependencies(Tokens.scraperRepository, GetPartNumbers),
  });
  container.register<IGetPartNumbersAndPartTexts>(Tokens.getPartNumbersAndPartTexts, {
    useValue: bindDependencies(Tokens.scraperRepository, GetPartNumbersAndPartTexts),
  });
  container.register<IGetPartTexts>(Tokens.getPartTexts, {
    useValue: bindDependencies(Tokens.scraperRepository, GetPartTexts),
  });
  container.register<IGetScraperConfig>(Tokens.getScraperConfig, {
    useValue: bindDependencies(Tokens.scraperRepository, GetScraperConfig),
  });
  container.register<IGetVehicleInfo>(Tokens.getVehicleInfo, {
    useValue: bindDependencies(Tokens.scraperRepository, GetVehicleInfo),
  });
  container.register<ILoginToPartsCheck>(Tokens.loginToPartsCheck, {
    useValue: bindDependencies(Tokens.scraperRepository, LoginToPartsCheck),
  });
  container.register<ISavePartNumbersAsCsv>(Tokens.savePartNumbersAsCsv, {
    useValue: bindDependencies(Tokens.scraperRepository, SavePartNumbersAsCsv),
  });
  container.register<ISaveVehicleInfoWithPartsDataAsCsv>(Tokens.saveVehicleInfoWithPartsDataAsCsv, {
    useValue: bindDependencies(Tokens.scraperRepository, SaveVehicleInfoWithPartsDataAsCsv),
  });
  container.register<IScrapePartNumbers>(Tokens.scrapePartNumbers, {
    useValue: bindDependencies(Tokens.scraperRepository, ScrapePartNumbers),
  });
  container.register<IScrapeVehicleInfoWithPartsData>(Tokens.scrapeVehicleInfoWithPartsData, {
    useValue: bindDependencies(Tokens.scraperRepository, ScrapeVehicleInfoWithPartsData),
  });
  container.register<ISetScraperConfig>(Tokens.setScraperConfig, {
    useValue: bindDependencies(Tokens.scraperRepository, SetScraperConfig),
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

  log4js.configure({
    appenders: {
      default: { type: "console", filename: logPath },
      out: { type: "file", filename: logPath },
    },
    categories: {
      default: { appenders: ["default", "out"], level: "debug" },
    },
  });

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
  initScraper();
}

export default init;
